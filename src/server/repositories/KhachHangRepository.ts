import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { Customer, MemberTier } from "@/types/domain";

export function computeTier(points: number): MemberTier {
  if (points >= 500) return "KimCuong";
  if (points >= 200) return "Vang";
  if (points >= 50) return "Bac";
  return "ThanhVien";
}

export class KhachHangRepository {
  async findByPhone(phone: string): Promise<Customer | null> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const cleanPhone = phone.replace(/\s+/g, "").trim();
    if (!cleanPhone) return null;

    const res = await db.execute({
      sql: "SELECT * FROM tbl_KhachHang WHERE so_dien_thoai = ?",
      args: [cleanPhone],
    });
    const r = res.rows[0];
    if (!r) return null;
    return {
      ma_khach_hang: String(r.ma_khach_hang),
      so_dien_thoai: String(r.so_dien_thoai),
      ho_ten: String(r.ho_ten),
      diem_tich_luy: Number(r.diem_tich_luy),
      hang_thanh_vien: String(r.hang_thanh_vien) as MemberTier,
    };
  }

  async findOrCreate(phone: string, name?: string): Promise<Customer> {
    const cleanPhone = phone.replace(/\s+/g, "").trim();
    const existing = await this.findByPhone(cleanPhone);
    if (existing) {
      if (name && name.trim() && existing.ho_ten === "Khách vãng lai") {
        const db = getDbClient();
        await db.execute({
          sql: "UPDATE tbl_KhachHang SET ho_ten = ? WHERE ma_khach_hang = ?",
          args: [name.trim(), existing.ma_khach_hang],
        });
        return { ...existing, ho_ten: name.trim() };
      }
      return existing;
    }

    const db = getDbClient();
    const newId = `KH-${Date.now().toString().slice(-6)}`;
    const displayName = name?.trim() || `Khách hàng ${cleanPhone.slice(-4)}`;
    await db.execute({
      sql: "INSERT INTO tbl_KhachHang (ma_khach_hang, so_dien_thoai, ho_ten, diem_tich_luy, hang_thanh_vien) VALUES (?, ?, ?, 0, 'ThanhVien')",
      args: [newId, cleanPhone, displayName],
    });

    return {
      ma_khach_hang: newId,
      so_dien_thoai: cleanPhone,
      ho_ten: displayName,
      diem_tich_luy: 0,
      hang_thanh_vien: "ThanhVien",
    };
  }
}
