import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { DeviceIMEI, IMEIStatus, ProductCategory } from "@/types/domain";

export class ThietBiIMEIRepository {
  async releaseExpiredLocks(): Promise<void> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const nowIso = new Date().toISOString();
    await db.execute({
      sql: `UPDATE tbl_ThietBi_IMEI
            SET trang_thai = 'SanSangBan', locked_by = NULL, locked_until = NULL
            WHERE trang_thai = 'KhoaTamThoi' AND locked_until IS NOT NULL AND locked_until < ?`,
      args: [nowIso],
    });
  }

  async findByIMEI(maImei: string): Promise<DeviceIMEI | null> {
    await this.releaseExpiredLocks();
    const db = getDbClient();
    const res = await db.execute({
      sql: `SELECT tb.*, sp.ten_san_pham, sp.thuong_hieu, sp.loai_san_pham, sp.cau_hinh_tom_tat,
                   sp.gia_niem_yet, sp.gia_khuyen_mai, sp.thoi_gian_bao_hanh_thang,
                   cn.ten_chi_nhanh
            FROM tbl_ThietBi_IMEI tb
            JOIN tbl_SanPham sp ON sp.ma_san_pham = tb.ma_san_pham
            JOIN tbl_ChiNhanh cn ON cn.ma_chi_nhanh = tb.ma_chi_nhanh
            WHERE tb.ma_imei = ?`,
      args: [maImei],
    });
    const r = res.rows[0];
    if (!r) return null;
    return this.mapRow(r);
  }

  async findByFilter(params?: {
    branchId?: string;
    status?: IMEIStatus;
    productId?: string;
  }): Promise<DeviceIMEI[]> {
    await this.releaseExpiredLocks();
    const db = getDbClient();
    const conditions: string[] = [];
    const args: Array<string | number> = [];

    if (params?.branchId) {
      conditions.push("tb.ma_chi_nhanh = ?");
      args.push(params.branchId);
    }
    if (params?.status) {
      conditions.push("tb.trang_thai = ?");
      args.push(params.status);
    }
    if (params?.productId) {
      conditions.push("tb.ma_san_pham = ?");
      args.push(params.productId);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const res = await db.execute({
      sql: `SELECT tb.*, sp.ten_san_pham, sp.thuong_hieu, sp.loai_san_pham, sp.cau_hinh_tom_tat,
                   sp.gia_niem_yet, sp.gia_khuyen_mai, sp.thoi_gian_bao_hanh_thang,
                   cn.ten_chi_nhanh
            FROM tbl_ThietBi_IMEI tb
            JOIN tbl_SanPham sp ON sp.ma_san_pham = tb.ma_san_pham
            JOIN tbl_ChiNhanh cn ON cn.ma_chi_nhanh = tb.ma_chi_nhanh
            ${whereSql}
            ORDER BY tb.ngay_nhap_kho ASC, tb.ma_imei ASC`,
      args,
    });

    return res.rows.map((r) => this.mapRow(r));
  }

  async lockForPOS(maImei: string, staffId: string, ttlSeconds = 600): Promise<void> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const untilIso = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await db.execute({
      sql: `UPDATE tbl_ThietBi_IMEI
            SET trang_thai = 'KhoaTamThoi', locked_by = ?, locked_until = ?
            WHERE ma_imei = ?`,
      args: [staffId, untilIso, maImei],
    });
  }

  async unlockIMEI(maImei: string, staffId?: string): Promise<void> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    if (staffId) {
      await db.execute({
        sql: `UPDATE tbl_ThietBi_IMEI
              SET trang_thai = 'SanSangBan', locked_by = NULL, locked_until = NULL
              WHERE ma_imei = ? AND trang_thai = 'KhoaTamThoi' AND (locked_by = ? OR locked_by IS NULL)`,
        args: [maImei, staffId],
      });
    } else {
      await db.execute({
        sql: `UPDATE tbl_ThietBi_IMEI
              SET trang_thai = 'SanSangBan', locked_by = NULL, locked_until = NULL
              WHERE ma_imei = ? AND trang_thai = 'KhoaTamThoi'`,
        args: [maImei],
      });
    }
  }

  async updateStatus(maImei: string, status: IMEIStatus): Promise<void> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    await db.execute({
      sql: "UPDATE tbl_ThietBi_IMEI SET trang_thai = ?, locked_by = NULL, locked_until = NULL WHERE ma_imei = ?",
      args: [status, maImei],
    });
  }

  private mapRow(r: Record<string, unknown>): DeviceIMEI {
    return {
      ma_imei: String(r.ma_imei),
      ma_san_pham: String(r.ma_san_pham),
      ten_san_pham: r.ten_san_pham ? String(r.ten_san_pham) : undefined,
      thuong_hieu: r.thuong_hieu ? String(r.thuong_hieu) : undefined,
      loai_san_pham: r.loai_san_pham ? (String(r.loai_san_pham) as ProductCategory) : undefined,
      cau_hinh_tom_tat: r.cau_hinh_tom_tat ? String(r.cau_hinh_tom_tat) : undefined,
      gia_niem_yet: r.gia_niem_yet !== undefined ? Number(r.gia_niem_yet) : undefined,
      gia_khuyen_mai:
        r.gia_khuyen_mai !== null && r.gia_khuyen_mai !== undefined
          ? Number(r.gia_khuyen_mai)
          : null,
      thoi_gian_bao_hanh_thang:
        r.thoi_gian_bao_hanh_thang !== undefined ? Number(r.thoi_gian_bao_hanh_thang) : undefined,
      ma_chi_nhanh: String(r.ma_chi_nhanh),
      ten_chi_nhanh: r.ten_chi_nhanh ? String(r.ten_chi_nhanh) : undefined,
      so_serial: r.so_serial !== null && r.so_serial !== undefined ? String(r.so_serial) : null,
      trang_thai: String(r.trang_thai) as IMEIStatus,
      ngay_nhap_kho: String(r.ngay_nhap_kho),
      gia_nhap: Number(r.gia_nhap),
      locked_by: r.locked_by !== null && r.locked_by !== undefined ? String(r.locked_by) : null,
      locked_until:
        r.locked_until !== null && r.locked_until !== undefined ? String(r.locked_until) : null,
    };
  }
}
