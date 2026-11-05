import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { Branch, Staff, StaffRole } from "@/types/domain";

export class ChiNhanhRepository {
  async findAllBranches(): Promise<Branch[]> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute("SELECT * FROM tbl_ChiNhanh ORDER BY ma_chi_nhanh ASC");
    return res.rows.map((r) => ({
      ma_chi_nhanh: String(r.ma_chi_nhanh),
      ten_chi_nhanh: String(r.ten_chi_nhanh),
      dia_chi: String(r.dia_chi),
      so_dien_thoai: String(r.so_dien_thoai),
    }));
  }

  async findAllStaff(): Promise<Staff[]> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute(
      "SELECT ma_nhan_vien, ma_chi_nhanh, ho_ten, chuc_vu, tai_khoan, so_dien_thoai FROM tbl_NhanVien ORDER BY ma_nhan_vien ASC"
    );
    return res.rows.map((r) => ({
      ma_nhan_vien: String(r.ma_nhan_vien),
      ma_chi_nhanh: String(r.ma_chi_nhanh),
      ho_ten: String(r.ho_ten),
      chuc_vu: String(r.chuc_vu) as StaffRole,
      tai_khoan: String(r.tai_khoan),
      so_dien_thoai: String(r.so_dien_thoai),
    }));
  }
}
