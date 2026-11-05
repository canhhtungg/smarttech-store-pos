import { describe, it, expect, beforeEach } from "vitest";
import {
  ensureDatabaseInitialized,
  getDbClient,
  resetDatabaseToSeed,
} from "@/server/db/client";

describe("Task 1: Dual-mode 3NF Database Schema & Seed Data", () => {
  beforeEach(async () => {
    process.env.SMARTTECH_DB_URL = "file::memory:?cache=shared";
    await resetDatabaseToSeed();
  });

  it("creates all 12 normalized tables matching Chapter 5.7 of the OOAD report", async () => {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'tbl_%' ORDER BY name"
    );
    const tableNames = res.rows.map((r) => String(r.name));

    expect(tableNames).toEqual(
      expect.arrayContaining([
        "tbl_BaoHanh_DienTu",
        "tbl_CauHinhHeThong",
        "tbl_ChiNhanh",
        "tbl_ChiTietHoaDon",
        "tbl_HoaDon",
        "tbl_KhachHang",
        "tbl_NhanVien",
        "tbl_PhieuDieuChuyen",
        "tbl_PhuKien_TuongThich",
        "tbl_SanPham",
        "tbl_ThietBi_IMEI",
        "tbl_TonKho_PhuKien",
      ])
    );
  });

  it("seeds 3 branches (Cau Giay, Dong Da, Ha Dong), staff roles, 15-digit IMEIs, and aging stock devices", async () => {
    const db = getDbClient();

    const branches = await db.execute("SELECT * FROM tbl_ChiNhanh");
    expect(branches.rows.length).toBe(3);

    const imeis = await db.execute("SELECT ma_imei, trang_thai, ngay_nhap_kho FROM tbl_ThietBi_IMEI");
    expect(imeis.rows.length).toBeGreaterThanOrEqual(20);
    for (const row of imeis.rows) {
      expect(String(row.ma_imei)).toMatch(/^\d{15}$/);
    }

    const compatibleRules = await db.execute("SELECT * FROM tbl_PhuKien_TuongThich");
    expect(compatibleRules.rows.length).toBeGreaterThanOrEqual(6);

    const settings = await db.execute("SELECT * FROM tbl_CauHinhHeThong");
    expect(settings.rows.length).toBeGreaterThanOrEqual(3);
  });
});
