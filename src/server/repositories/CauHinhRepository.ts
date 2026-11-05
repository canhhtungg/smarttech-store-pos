import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { SystemSettings } from "@/types/domain";

export const VIETNAMESE_BANKS: Array<{ bin: string; shortName: string; fullName: string }> = [
  { bin: "970422", shortName: "MB Bank", fullName: "Ngân hàng TMCP Quân Đội (MB)" },
  { bin: "970436", shortName: "Vietcombank", fullName: "Ngân hàng TMCP Ngoại thương Việt Nam" },
  { bin: "970407", shortName: "Techcombank", fullName: "Ngân hàng TMCP Kỹ thương Việt Nam" },
  { bin: "970415", shortName: "VietinBank", fullName: "Ngân hàng TMCP Công thương Việt Nam" },
  { bin: "970418", shortName: "BIDV", fullName: "Ngân hàng TMCP Đầu tư và Phát triển VN" },
  { bin: "970416", shortName: "ACB", fullName: "Ngân hàng TMCP Á Châu" },
  { bin: "970432", shortName: "VPBank", fullName: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
  { bin: "970423", shortName: "TPBank", fullName: "Ngân hàng TMCP Tiên Phong" },
];

export class CauHinhRepository {
  async getSettings(): Promise<SystemSettings> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute("SELECT khoa, gia_tri FROM tbl_CauHinhHeThong");
    const map = new Map<string, string>();
    for (const r of res.rows) {
      map.set(String(r.khoa), String(r.gia_tri));
    }
    return {
      bank_bin: map.get("bank_bin") ?? "970422",
      bank_short_name: map.get("bank_short_name") ?? "MB Bank",
      bank_account_no: map.get("bank_account_no") ?? "09881239999",
      bank_account_name: map.get("bank_account_name") ?? "SMARTTECH STORE",
    };
  }

  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const bank = VIETNAMESE_BANKS.find((b) => b.bin === settings.bank_bin);
    const shortName = bank ? bank.shortName : settings.bank_short_name;

    await db.batch(
      [
        {
          sql: "INSERT OR REPLACE INTO tbl_CauHinhHeThong (khoa, gia_tri) VALUES ('bank_bin', ?)",
          args: [settings.bank_bin.trim()],
        },
        {
          sql: "INSERT OR REPLACE INTO tbl_CauHinhHeThong (khoa, gia_tri) VALUES ('bank_short_name', ?)",
          args: [shortName.trim()],
        },
        {
          sql: "INSERT OR REPLACE INTO tbl_CauHinhHeThong (khoa, gia_tri) VALUES ('bank_account_no', ?)",
          args: [settings.bank_account_no.trim()],
        },
        {
          sql: "INSERT OR REPLACE INTO tbl_CauHinhHeThong (khoa, gia_tri) VALUES ('bank_account_name', ?)",
          args: [settings.bank_account_name.trim().toUpperCase()],
        },
      ],
      "write"
    );

    return this.getSettings();
  }
}
