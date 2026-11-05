import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";

export interface RecentInvoiceSummary {
  ma_hoa_don: string;
  ma_chi_nhanh: string;
  ten_chi_nhanh: string;
  ten_nhan_vien: string;
  ten_khach_hang: string | null;
  so_dien_thoai_khach: string | null;
  ngay_lap: string;
  tong_tien_hang: number;
  tien_giam_combo: number;
  tien_giam_diem: number;
  tien_thu_cu: number;
  tong_thanh_toan: number;
  phuong_thuc_tt: string;
  so_san_pham: number;
}

export class HoaDonRepository {
  async listRecentInvoices(branchId?: string, limit = 20): Promise<RecentInvoiceSummary[]> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = branchId
      ? await db.execute({
          sql: `SELECT hd.*, cn.ten_chi_nhanh, nv.ho_ten AS ten_nhan_vien,
                       kh.ho_ten AS ten_khach_hang, kh.so_dien_thoai AS so_dien_thoai_khach,
                       (SELECT COALESCE(SUM(so_luong), 0) FROM tbl_ChiTietHoaDon ct WHERE ct.ma_hoa_don = hd.ma_hoa_don) AS so_san_pham
                FROM tbl_HoaDon hd
                JOIN tbl_ChiNhanh cn ON cn.ma_chi_nhanh = hd.ma_chi_nhanh
                JOIN tbl_NhanVien nv ON nv.ma_nhan_vien = hd.ma_nhan_vien
                LEFT JOIN tbl_KhachHang kh ON kh.ma_khach_hang = hd.ma_khach_hang
                WHERE hd.ma_chi_nhanh = ?
                ORDER BY hd.ngay_lap DESC
                LIMIT ?`,
          args: [branchId, limit],
        })
      : await db.execute({
          sql: `SELECT hd.*, cn.ten_chi_nhanh, nv.ho_ten AS ten_nhan_vien,
                       kh.ho_ten AS ten_khach_hang, kh.so_dien_thoai AS so_dien_thoai_khach,
                       (SELECT COALESCE(SUM(so_luong), 0) FROM tbl_ChiTietHoaDon ct WHERE ct.ma_hoa_don = hd.ma_hoa_don) AS so_san_pham
                FROM tbl_HoaDon hd
                JOIN tbl_ChiNhanh cn ON cn.ma_chi_nhanh = hd.ma_chi_nhanh
                JOIN tbl_NhanVien nv ON nv.ma_nhan_vien = hd.ma_nhan_vien
                LEFT JOIN tbl_KhachHang kh ON kh.ma_khach_hang = hd.ma_khach_hang
                ORDER BY hd.ngay_lap DESC
                LIMIT ?`,
          args: [limit],
        });

    return res.rows.map((r) => ({
      ma_hoa_don: String(r.ma_hoa_don),
      ma_chi_nhanh: String(r.ma_chi_nhanh),
      ten_chi_nhanh: String(r.ten_chi_nhanh),
      ten_nhan_vien: String(r.ten_nhan_vien),
      ten_khach_hang: r.ten_khach_hang ? String(r.ten_khach_hang) : null,
      so_dien_thoai_khach: r.so_dien_thoai_khach ? String(r.so_dien_thoai_khach) : null,
      ngay_lap: String(r.ngay_lap),
      tong_tien_hang: Number(r.tong_tien_hang),
      tien_giam_combo: Number(r.tien_giam_combo),
      tien_giam_diem: Number(r.tien_giam_diem),
      tien_thu_cu: Number(r.tien_thu_cu),
      tong_thanh_toan: Number(r.tong_thanh_toan),
      phuong_thuc_tt: String(r.phuong_thuc_tt),
      so_san_pham: Number(r.so_san_pham),
    }));
  }
}
