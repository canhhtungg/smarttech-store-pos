import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";
import { DROP_STATEMENTS, SCHEMA_STATEMENTS } from "./schema";
import { seedInitialData } from "./seed";

let cachedClient: Client | null = null;
let cachedUrl: string | null = null;
let initPromise: Promise<void> | null = null;

export function resolveDbConfig(): { url: string; authToken?: string } {
  if (process.env.SMARTTECH_DB_URL) {
    const customUrl = process.env.SMARTTECH_DB_URL;
    if (customUrl.includes(":memory:")) {
      return { url: ":memory:" };
    }
    return { url: customUrl };
  }

  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  // Vercel Serverless environment has read-only project bundle, writable /tmp
  if (process.env.VERCEL) {
    return { url: "file:/tmp/smarttech.db" };
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "smarttech.db").replace(/\\/g, "/");
  return { url: `file:${dbPath}` };
}

export function getDbClient(): Client {
  const { url, authToken } = resolveDbConfig();
  if (!cachedClient || cachedUrl !== url) {
    cachedClient = createClient(authToken ? { url, authToken } : { url });
    cachedUrl = url;
    initPromise = null;
  }
  return cachedClient;
}

export async function ensureDatabaseInitialized(): Promise<void> {
  const db = getDbClient();
  if (!initPromise) {
    initPromise = (async () => {
      await db.execute("PRAGMA foreign_keys = ON");
      for (const stmt of SCHEMA_STATEMENTS) {
        await db.execute(stmt);
      }
      const existing = await db.execute("SELECT COUNT(*) AS cnt FROM tbl_ChiNhanh");
      const count = Number(existing.rows[0]?.cnt ?? 0);
      if (count === 0) {
        await seedInitialData(db);
      }
    })();
  }
  await initPromise;
}

export async function resetDatabaseToSeed(): Promise<void> {
  const { url, authToken } = resolveDbConfig();
  cachedClient = createClient(authToken ? { url, authToken } : { url });
  cachedUrl = url;
  initPromise = null;

  const db = cachedClient;
  await db.execute("PRAGMA foreign_keys = OFF");
  for (const dropStmt of DROP_STATEMENTS) {
    await db.execute(dropStmt);
  }
  await db.execute("PRAGMA foreign_keys = ON");
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execute(stmt);
  }
  await seedInitialData(db);
  initPromise = Promise.resolve();
}
