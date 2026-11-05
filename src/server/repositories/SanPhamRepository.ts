import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import type { AccessoryRecommendation, Product, ProductCategory } from "@/types/domain";

export class SanPhamRepository {
  async findAll(category?: ProductCategory): Promise<Product[]> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = category
      ? await db.execute({
          sql: "SELECT * FROM tbl_SanPham WHERE loai_san_pham = ? ORDER BY thuong_hieu, ten_san_pham",
          args: [category],
        })
      : await db.execute("SELECT * FROM tbl_SanPham ORDER BY loai_san_pham, thuong_hieu, ten_san_pham");

    return res.rows.map((r) => ({
      ma_san_pham: String(r.ma_san_pham),
      ten_san_pham: String(r.ten_san_pham),
      thuong_hieu: String(r.thuong_hieu),
      loai_san_pham: String(r.loai_san_pham) as ProductCategory,
      cau_hinh_tom_tat: String(r.cau_hinh_tom_tat ?? ""),
      gia_niem_yet: Number(r.gia_niem_yet),
      gia_khuyen_mai: r.gia_khuyen_mai !== null ? Number(r.gia_khuyen_mai) : null,
      thoi_gian_bao_hanh_thang: Number(r.thoi_gian_bao_hanh_thang),
    }));
  }

  async findById(productId: string): Promise<Product | null> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute({
      sql: "SELECT * FROM tbl_SanPham WHERE ma_san_pham = ?",
      args: [productId],
    });
    const r = res.rows[0];
    if (!r) return null;
    return {
      ma_san_pham: String(r.ma_san_pham),
      ten_san_pham: String(r.ten_san_pham),
      thuong_hieu: String(r.thuong_hieu),
      loai_san_pham: String(r.loai_san_pham) as ProductCategory,
      cau_hinh_tom_tat: String(r.cau_hinh_tom_tat ?? ""),
      gia_niem_yet: Number(r.gia_niem_yet),
      gia_khuyen_mai: r.gia_khuyen_mai !== null ? Number(r.gia_khuyen_mai) : null,
      thoi_gian_bao_hanh_thang: Number(r.thoi_gian_bao_hanh_thang),
    };
  }

  async findAccessoriesWithBranchStock(branchId: string): Promise<Array<Product & { so_luong_ton: number; muc_ton_an_toan: number }>> {
    await ensureDatabaseInitialized();
    const db = getDbClient();
    const res = await db.execute({
      sql: `SELECT sp.*, COALESCE(tk.so_luong_ton, 0) AS so_luong_ton, COALESCE(tk.muc_ton_an_toan, 10) AS muc_ton_an_toan
            FROM tbl_SanPham sp
            LEFT JOIN tbl_TonKho_PhuKien tk ON sp.ma_san_pham = tk.ma_san_pham AND tk.ma_chi_nhanh = ?
            WHERE sp.loai_san_pham = 'PhuKien'
            ORDER BY sp.ten_san_pham`,
      args: [branchId],
    });

    return res.rows.map((r) => ({
      ma_san_pham: String(r.ma_san_pham),
      ten_san_pham: String(r.ten_san_pham),
      thuong_hieu: String(r.thuong_hieu),
      loai_san_pham: "PhuKien" as const,
      cau_hinh_tom_tat: String(r.cau_hinh_tom_tat ?? ""),
      gia_niem_yet: Number(r.gia_niem_yet),
      gia_khuyen_mai: r.gia_khuyen_mai !== null ? Number(r.gia_khuyen_mai) : null,
      thoi_gian_bao_hanh_thang: Number(r.thoi_gian_bao_hanh_thang),
      so_luong_ton: Number(r.so_luong_ton),
      muc_ton_an_toan: Number(r.muc_ton_an_toan),
    }));
  }

  async findCompatibleAccessories(mainProductIds: string[], branchId: string): Promise<AccessoryRecommendation[]> {
    if (mainProductIds.length === 0) return [];
    await ensureDatabaseInitialized();
    const db = getDbClient();

    const placeholders = mainProductIds.map(() => "?").join(", ");
    const res = await db.execute({
      sql: `SELECT
              tt.ma_sp_chinh,
              tt.ma_sp_phu_kien,
              sp.ten_san_pham AS ten_phu_kien,
              sp.thuong_hieu,
              sp.cau_hinh_tom_tat,
              sp.gia_niem_yet AS gia_goc,
              tt.phan_tram_giam_combo,
              tt.muc_do_uu_tien,
              COALESCE(tk.so_luong_ton, 0) AS so_luong_ton
            FROM tbl_PhuKien_TuongThich tt
            JOIN tbl_SanPham sp ON sp.ma_san_pham = tt.ma_sp_phu_kien
            LEFT JOIN tbl_TonKho_PhuKien tk
              ON tk.ma_san_pham = tt.ma_sp_phu_kien AND tk.ma_chi_nhanh = ?
            WHERE tt.ma_sp_chinh IN (${placeholders})
            ORDER BY tt.muc_do_uu_tien ASC, tt.phan_tram_giam_combo DESC`,
      args: [branchId, ...mainProductIds],
    });

    const dedup = new Map<string, AccessoryRecommendation>();
    for (const r of res.rows) {
      const sku = String(r.ma_sp_phu_kien);
      const giaGoc = Number(r.gia_goc);
      const pct = Number(r.phan_tram_giam_combo);
      const tietKiem = Math.round((giaGoc * pct) / 100);
      const giaCombo = giaGoc - tietKiem;

      const candidate: AccessoryRecommendation = {
        ma_sp_chinh: String(r.ma_sp_chinh),
        ma_sp_phu_kien: sku,
        ten_phu_kien: String(r.ten_phu_kien),
        thuong_hieu: String(r.thuong_hieu),
        cau_hinh_tom_tat: String(r.cau_hinh_tom_tat ?? ""),
        gia_goc: giaGoc,
        phan_tram_giam_combo: pct,
        gia_combo: giaCombo,
        tiet_kiem: tietKiem,
        muc_do_uu_tien: Number(r.muc_do_uu_tien),
        so_luong_ton: Number(r.so_luong_ton),
      };

      const prev = dedup.get(sku);
      if (!prev || candidate.phan_tram_giam_combo > prev.phan_tram_giam_combo) {
        dedup.set(sku, candidate);
      }
    }

    return Array.from(dedup.values()).sort((a, b) => a.muc_do_uu_tien - b.muc_do_uu_tien);
  }
}
