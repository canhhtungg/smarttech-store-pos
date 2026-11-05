import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import { ThietBiIMEIRepository } from "@/server/repositories/ThietBiIMEIRepository";
import { SanPhamRepository } from "@/server/repositories/SanPhamRepository";
import { HoaDonRepository, type RecentInvoiceSummary } from "@/server/repositories/HoaDonRepository";
import type { AgingStockAlert, Product } from "@/types/domain";

export interface DashboardMetricsDTO {
  totalRevenue: number;
  totalInvoices: number;
  comboAttachRate: number;
  redAgingCount: number;
  yellowAgingCount: number;
  revenueByBranch: Array<{
    ma_chi_nhanh: string;
    ten_chi_nhanh: string;
    doanh_thu: number;
    so_don: number;
  }>;
  topProducts: Array<{
    ma_san_pham: string;
    ten_san_pham: string;
    so_luong_ban: number;
    doanh_thu: number;
  }>;
  agingAlerts: AgingStockAlert[];
  recentInvoices: RecentInvoiceSummary[];
}

export class AgingStockService {
  private imeiRepo = new ThietBiIMEIRepository();
  private spRepo = new SanPhamRepository();
  private hdRepo = new HoaDonRepository();

  async getAgingStockAlerts(branchId?: string): Promise<AgingStockAlert[]> {
    const activeDevices = await this.imeiRepo.findByFilter({
      branchId,
      status: "SanSangBan",
    });

    const todayMs = Date.now();
    const alerts: AgingStockAlert[] = [];

    for (const dev of activeDevices) {
      const importMs = new Date(dev.ngay_nhap_kho + "T00:00:00Z").getTime();
      const daysInStock = Math.floor((todayMs - importMs) / (1000 * 3600 * 24));

      if (daysInStock >= 45) {
        const isRed = daysInStock >= 60;
        const alreadyDiscounted =
          dev.gia_khuyen_mai !== null &&
          dev.gia_khuyen_mai !== undefined &&
          dev.gia_khuyen_mai < (dev.gia_niem_yet ?? Infinity);

        alerts.push({
          ma_imei: dev.ma_imei,
          ma_san_pham: dev.ma_san_pham,
          ten_san_pham: dev.ten_san_pham ?? dev.ma_san_pham,
          thuong_hieu: dev.thuong_hieu ?? "",
          ma_chi_nhanh: dev.ma_chi_nhanh,
          ten_chi_nhanh: dev.ten_chi_nhanh ?? dev.ma_chi_nhanh,
          ngay_nhap_kho: dev.ngay_nhap_kho,
          so_ngay_ton: daysInStock,
          gia_niem_yet: dev.gia_niem_yet ?? 0,
          gia_khuyen_mai: dev.gia_khuyen_mai ?? null,
          muc_canh_bao: isRed ? "RED" : "YELLOW",
          de_xuat_hanh_dong: alreadyDiscounted
            ? "Đã áp dụng giá xả kho — Ưu tiên điều chuyển sang chi nhánh sức mua cao"
            : isRed
              ? "Đề xuất giảm giá xả kho 10% hoặc điều chuyển về Cầu Giấy"
              : "Đề xuất ưu tiên tư vấn tại quầy & tặng kèm gói phụ kiện Combo",
        });
      }
    }

    return alerts.sort((a, b) => b.so_ngay_ton - a.so_ngay_ton);
  }

  async applyClearanceDiscount(productId: string, discountPercent = 10): Promise<Product> {
    await ensureDatabaseInitialized();
    const product = await this.spRepo.findById(productId);
    if (!product) {
      throw new Error(`Không tìm thấy dòng sản phẩm '${productId}'.`);
    }
    const clampedPct = Math.min(50, Math.max(1, discountPercent));
    const newPromoPrice = Math.round(product.gia_niem_yet * (1 - clampedPct / 100));

    const db = getDbClient();
    await db.execute({
      sql: "UPDATE tbl_SanPham SET gia_khuyen_mai = ? WHERE ma_san_pham = ?",
      args: [newPromoPrice, productId],
    });

    const updated = await this.spRepo.findById(productId);
    if (!updated) throw new Error("Lỗi cập nhật giá xả kho.");
    return updated;
  }

  async getChainDashboardMetrics(branchId?: string): Promise<DashboardMetricsDTO> {
    await ensureDatabaseInitialized();
    const db = getDbClient();

    const branchRevRes = await db.execute(`
      SELECT cn.ma_chi_nhanh, cn.ten_chi_nhanh,
             COALESCE(SUM(hd.tong_thanh_toan), 0) AS doanh_thu,
             COUNT(hd.ma_hoa_don) AS so_don
      FROM tbl_ChiNhanh cn
      LEFT JOIN tbl_HoaDon hd ON hd.ma_chi_nhanh = cn.ma_chi_nhanh AND hd.trang_thai_don = 'DaThanhToan'
      GROUP BY cn.ma_chi_nhanh, cn.ten_chi_nhanh
      ORDER BY doanh_thu DESC
    `);

    const revenueByBranch = branchRevRes.rows.map((r) => ({
      ma_chi_nhanh: String(r.ma_chi_nhanh),
      ten_chi_nhanh: String(r.ten_chi_nhanh),
      doanh_thu: Number(r.doanh_thu),
      so_don: Number(r.so_don),
    }));

    const comboCountRes = await db.execute(`
      SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM tbl_ChiTietHoaDon ct
          JOIN tbl_SanPham sp ON sp.ma_san_pham = ct.ma_san_pham
          WHERE ct.ma_hoa_don = hd.ma_hoa_don AND sp.loai_san_pham = 'PhuKien'
        ) THEN 1 ELSE 0 END) AS orders_with_accessory
      FROM tbl_HoaDon hd
      WHERE hd.trang_thai_don = 'DaThanhToan'
    `);

    const totalOrders = Number(comboCountRes.rows[0]?.total_orders ?? 0);
    const ordersWithAcc = Number(comboCountRes.rows[0]?.orders_with_accessory ?? 0);
    const comboAttachRate =
      totalOrders > 0 ? Math.round((ordersWithAcc / totalOrders) * 1000) / 10 : 0;

    const topProdRes = await db.execute(`
      SELECT sp.ma_san_pham, sp.ten_san_pham,
             SUM(ct.so_luong) AS so_luong_ban,
             SUM(ct.thanh_tien) AS doanh_thu
      FROM tbl_ChiTietHoaDon ct
      JOIN tbl_SanPham sp ON sp.ma_san_pham = ct.ma_san_pham
      GROUP BY sp.ma_san_pham, sp.ten_san_pham
      ORDER BY doanh_thu DESC
      LIMIT 6
    `);

    const topProducts = topProdRes.rows.map((r) => ({
      ma_san_pham: String(r.ma_san_pham),
      ten_san_pham: String(r.ten_san_pham),
      so_luong_ban: Number(r.so_luong_ban),
      doanh_thu: Number(r.doanh_thu),
    }));

    const agingAlerts = await this.getAgingStockAlerts(branchId);
    const redAgingCount = agingAlerts.filter((a) => a.muc_canh_bao === "RED").length;
    const yellowAgingCount = agingAlerts.filter((a) => a.muc_canh_bao === "YELLOW").length;

    const totalRevenue = revenueByBranch.reduce((acc, b) => acc + b.doanh_thu, 0);
    const recentInvoices = await this.hdRepo.listRecentInvoices(branchId, 12);

    return {
      totalRevenue,
      totalInvoices: totalOrders,
      comboAttachRate,
      redAgingCount,
      yellowAgingCount,
      revenueByBranch,
      topProducts,
      agingAlerts,
      recentInvoices,
    };
  }
}
