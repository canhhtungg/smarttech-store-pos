# Findings — SmartTech Store

## Environment & Tooling
- OS: Windows, Node.js `v26.13.0`, npm `11.20.0`, Git `2.55.0`, GitHub CLI `2.103.3`.
- Existing report deliverable `BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx` is at workspace root (currently open in Word via lockfile `~$oCao...docx`, excluded in `.gitignore`).
- Python `.docx` generator scripts organized under `scripts/report-generator/`.
- MCP Servers available: `github` and `vercel-plugin_vercel`.

## Architectural Decisions
- Dual-mode SQLite via `@libsql/client`:
  - Test environment (`VITEST` / `DB_URL=":memory:"`): isolated in-memory or temp SQLite file per test suite.
  - Local dev: `./data/smarttech.db` persistent file.
  - Vercel Serverless without `TURSO_DATABASE_URL`: `/tmp/smarttech.db` auto-initialized and seeded on cold start (<50ms) so every CRUD/checkout/transfer works with zero `SQLITE_READONLY` failures.
  - Vercel Serverless with `TURSO_DATABASE_URL`: remote LibSQL permanent cloud persistence.
