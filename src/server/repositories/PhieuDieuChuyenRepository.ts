import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { TransferStatus, TransferTicket } from "@/types/domain";

export class PhieuDieuChuyenRepository {
  async findAll(branchId?: string): Promise<TransferTicket[]> {
    await ensureDatabaseInitialized();
    const db = getDbClient();

    const res = branchId
      ? await db.execute({
          sql: `SELECT dc.*,
                       cnx.ten_chi_nhanh AS ten_chi_nhanh_xuat,
                       cnn.ten_chi_nhanh AS ten_chi_nhanh_nhap,
                       sp.ten_san_pham
                FROM tbl_PhieuDieuChuyen dc
                JOIN tbl_ChiNhanh cnx ON cnx.ma_chi_nhanh = dc.ma_chi_nhanh_xuat
                JOIN tbl_ChiNhanh cnn ON cnn.ma_chi_nhanh = dc.ma_chi_nhanh_nhap
                JOIN tbl_SanPham sp ON sp.ma_san_pham = dc.ma_san_pham
                WHERE dc.ma_chi_nhanh_xuat = ? OR dc.ma_chi_nhanh_nhap = ?
                ORDER BY dc.ngay_tao DESC`,
          args: [branchId, branchId],
        })
      : await db.execute({
          sql: `SELECT dc.*,
                       cnx.ten_chi_nhanh AS ten_chi_nhanh_xuat,
                       cnn.ten_chi_nhanh AS ten_chi_nhanh_nhap,
                       sp.ten_san_pham
                FROM tbl_PhieuDieuChuyen dc
                JOIN tbl_ChiNhanh cnx ON cnx.ma_chi_nhanh = dc.ma_chi_nhanh_xuat
                JOIN tbl_ChiNhanh cnn ON cnn.ma_chi_nhanh = dc.ma_chi_nhanh_nhap
                JOIN tbl_SanPham sp ON sp.ma_san_pham = dc.ma_san_pham
                ORDER BY dc.ngay_tao DESC`,
        });

    return res.rows.map((r) => this.mapRow(r));
  }

  async findById(ticketId: string): Promise<TransferTicket | null> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute({
      sql: `SELECT dc.*,
                   cnx.ten_chi_nhanh AS ten_chi_nhanh_xuat,
                   cnn.ten_chi_nhanh AS ten_chi_nhanh_nhap,
                   sp.ten_san_pham
            FROM tbl_PhieuDieuChuyen dc
            JOIN tbl_ChiNhanh cnx ON cnx.ma_chi_nhanh = dc.ma_chi_nhanh_xuat
            JOIN tbl_ChiNhanh cnn ON cnn.ma_chi_nhanh = dc.ma_chi_nhanh_nhap
            JOIN tbl_SanPham sp ON sp.ma_san_pham = dc.ma_san_pham
            WHERE dc.ma_phieu_chuyen = ?`,
      args: [ticketId],
    });
    const r = res.rows[0];
    if (!r) return null;
    return this.mapRow(r);
  }

  private mapRow(r: Record<string, unknown>): TransferTicket {
    return {
      ma_phieu_chuyen: String(r.ma_phieu_chuyen),
      ma_chi_nhanh_xuat: String(r.ma_chi_nhanh_xuat),
      ten_chi_nhanh_xuat: r.ten_chi_nhanh_xuat ? String(r.ten_chi_nhanh_xuat) : undefined,
      ma_chi_nhanh_nhap: String(r.ma_chi_nhanh_nhap),
      ten_chi_nhanh_nhap: r.ten_chi_nhanh_nhap ? String(r.ten_chi_nhanh_nhap) : undefined,
      ma_san_pham: String(r.ma_san_pham),
      ten_san_pham: r.ten_san_pham ? String(r.ten_san_pham) : undefined,
      ma_imei: r.ma_imei !== null && r.ma_imei !== undefined ? String(r.ma_imei) : null,
      nguoi_yeu_cau: String(r.nguoi_yeu_cau),
      nguoi_duyet: r.nguoi_duyet !== null && r.nguoi_duyet !== undefined ? String(r.nguoi_duyet) : null,
      ngay_tao: String(r.ngay_tao),
      ngay_cap_nhat: String(r.ngay_cap_nhat),
      trang_thai: String(r.trang_thai) as TransferStatus,
      ghi_chu: r.ghi_chu !== null && r.ghi_chu !== undefined ? String(r.ghi_chu) : null,
    };
  }
}
