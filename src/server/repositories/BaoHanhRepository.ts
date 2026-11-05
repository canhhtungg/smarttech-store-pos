import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { EWarrantyRecord, WarrantyHistoryEntry } from "@/types/domain";

export class BaoHanhRepository {
  async findByIMEIOrPhone(keyword: string): Promise<EWarrantyRecord[]> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const clean = keyword.replace(/\s+/g, "").trim();

    const res = clean
      ? await db.execute({
          sql: `SELECT bh.*, sp.ten_san_pham, sp.thuong_hieu, cn.ten_chi_nhanh, kh.ho_ten AS ten_khach_hang
                FROM tbl_BaoHanh_DienTu bh
                JOIN tbl_ThietBi_IMEI tb ON tb.ma_imei = bh.ma_imei
                JOIN tbl_SanPham sp ON sp.ma_san_pham = tb.ma_san_pham
                JOIN tbl_HoaDon hd ON hd.ma_hoa_don = bh.ma_hoa_don
                JOIN tbl_ChiNhanh cn ON cn.ma_chi_nhanh = hd.ma_chi_nhanh
                LEFT JOIN tbl_KhachHang kh ON kh.ma_khach_hang = hd.ma_khach_hang
                WHERE bh.ma_imei = ? OR bh.so_dien_thoai_khach = ? OR bh.ma_bao_hanh = ?
                ORDER BY bh.ngay_kich_hoat DESC`,
          args: [clean, clean, clean],
        })
      : await db.execute({
          sql: `SELECT bh.*, sp.ten_san_pham, sp.thuong_hieu, cn.ten_chi_nhanh, kh.ho_ten AS ten_khach_hang
                FROM tbl_BaoHanh_DienTu bh
                JOIN tbl_ThietBi_IMEI tb ON tb.ma_imei = bh.ma_imei
                JOIN tbl_SanPham sp ON sp.ma_san_pham = tb.ma_san_pham
                JOIN tbl_HoaDon hd ON hd.ma_hoa_don = bh.ma_hoa_don
                JOIN tbl_ChiNhanh cn ON cn.ma_chi_nhanh = hd.ma_chi_nhanh
                LEFT JOIN tbl_KhachHang kh ON kh.ma_khach_hang = hd.ma_khach_hang
                ORDER BY bh.ngay_kich_hoat DESC
                LIMIT 25`,
        });

    const todayMs = Date.now();
    return res.rows.map((r) => {
      const expDate = String(r.ngay_het_han);
      const daysLeft = Math.ceil(
        (new Date(expDate + "T23:59:59Z").getTime() - todayMs) / (1000 * 3600 * 24)
      );
      let history: WarrantyHistoryEntry[] = [];
      try {
        history = JSON.parse(String(r.lich_su_tiep_nhan || "[]"));
      } catch {
        history = [];
      }

      const rawStatus = String(r.trang_thai_bao_hanh);
      const effectiveStatus: EWarrantyRecord["trang_thai_bao_hanh"] =
        rawStatus === "DangTiepNhan"
          ? "DangTiepNhan"
          : daysLeft < 0
            ? "HetHan"
            : "ConHan";

      return {
        ma_bao_hanh: String(r.ma_bao_hanh),
        ma_imei: String(r.ma_imei),
        ten_san_pham: String(r.ten_san_pham),
        thuong_hieu: String(r.thuong_hieu),
        ma_hoa_don: String(r.ma_hoa_don),
        ten_chi_nhanh: String(r.ten_chi_nhanh),
        so_dien_thoai_khach: String(r.so_dien_thoai_khach),
        ten_khach_hang: r.ten_khach_hang ? String(r.ten_khach_hang) : null,
        ngay_kich_hoat: String(r.ngay_kich_hoat),
        ngay_het_han: expDate,
        so_ngay_con_lai: daysLeft,
        trang_thai_bao_hanh: effectiveStatus,
        lich_su_tiep_nhan: history,
      };
    });
  }

  async appendServiceHistory(
    maImei: string,
    entry: WarrantyHistoryEntry,
    status: "DangTiepNhan" | "ConHan"
  ): Promise<void> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const existing = await this.findByIMEIOrPhone(maImei);
    if (existing.length === 0) {
      throw new Error(`Không tìm thấy hồ sơ bảo hành điện tử cho mã IMEI ${maImei}.`);
    }
    const record = existing[0];
    const updatedHistory = [entry, ...record.lich_su_tiep_nhan];

    await db.batch(
      [
        {
          sql: "UPDATE tbl_BaoHanh_DienTu SET trang_thai_bao_hanh = ?, lich_su_tiep_nhan = ? WHERE ma_imei = ?",
          args: [status, JSON.stringify(updatedHistory), maImei],
        },
        {
          sql: "UPDATE tbl_ThietBi_IMEI SET trang_thai = ? WHERE ma_imei = ?",
          args: [status === "DangTiepNhan" ? "BaoHanh" : "DaBan", maImei],
        },
      ],
      "write"
    );
  }
}
