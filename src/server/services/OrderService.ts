import type { InStatement } from "@libsql/client";
import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import { ThietBiIMEIRepository } from "@/server/repositories/ThietBiIMEIRepository";
import { SanPhamRepository } from "@/server/repositories/SanPhamRepository";
import { KhachHangRepository, computeTier } from "@/server/repositories/KhachHangRepository";
import type { CheckoutInput, DeviceIMEI } from "@/types/domain";

export interface OrderReceiptLine {
  ten_san_pham: string;
  ma_san_pham: string;
  ma_imei: string | null;
  so_luong: number;
  don_gia_ban: number;
  tien_giam_combo: number;
  thanh_tien: number;
}

export interface OrderReceiptDTO {
  ma_hoa_don: string;
  ngay_lap: string;
  ma_chi_nhanh: string;
  ten_chi_nhanh: string;
  dia_chi_chi_nhanh: string;
  ma_nhan_vien: string;
  customer_phone: string | null;
  customer_name: string | null;
  points_earned: number;
  tong_tien_hang: number;
  tien_giam_combo: number;
  tien_giam_diem: number;
  tien_thu_cu: number;
  mo_ta_thu_cu: string | null;
  tong_thanh_toan: number;
  phuong_thuc_tt: string;
  lines: OrderReceiptLine[];
  warranties: Array<{
    ma_bao_hanh: string;
    ma_imei: string;
    ten_san_pham: string;
    ngay_kich_hoat: string;
    ngay_het_han: string;
  }>;
}

export class OrderService {
  private imeiRepo = new ThietBiIMEIRepository();
  private spRepo = new SanPhamRepository();
  private khRepo = new KhachHangRepository();

  async scanAndLockIMEI(
    rawImei: string,
    branchId: string,
    staffId: string
  ): Promise<DeviceIMEI> {
    const imei = rawImei.trim();
    if (!/^\d{15}$/.test(imei)) {
      throw new Error("Mã IMEI không hợp lệ: bắt buộc đúng 15 chữ số.");
    }

    const device = await this.imeiRepo.findByIMEI(imei);
    if (!device) {
      throw new Error(`Không tìm thấy mã IMEI ${imei} trong hệ thống kho.`);
    }

    if (device.ma_chi_nhanh !== branchId) {
      throw new Error(
        `Thiết bị IMEI ${imei} hiện đang thuộc kho '${device.ten_chi_nhanh ?? device.ma_chi_nhanh}', không thuộc chi nhánh hiện tại. Vui lòng tạo phiếu điều chuyển nếu cần bán!`
      );
    }

    if (device.trang_thai === "KhoaTamThoi" && device.locked_by && device.locked_by !== staffId) {
      throw new Error(
        `Mã IMEI ${imei} đang bị khóa tạm thời (đang được giữ bởi nhân viên ${device.locked_by}).`
      );
    }

    if (device.trang_thai !== "SanSangBan" && device.trang_thai !== "KhoaTamThoi") {
      throw new Error(
        `Mã IMEI ${imei} không thể bán (Trạng thái hiện tại: ${device.trang_thai}).`
      );
    }

    await this.imeiRepo.lockForPOS(imei, staffId, 600);
    const updated = await this.imeiRepo.findByIMEI(imei);
    if (!updated) {
      throw new Error("Lỗi truy xuất thiết bị sau khi khóa tạm thời.");
    }
    return updated;
  }

  async unlockIMEI(imei: string, staffId?: string): Promise<void> {
    await this.imeiRepo.unlockIMEI(imei.trim(), staffId);
  }

  async checkoutOrder(input: CheckoutInput): Promise<OrderReceiptDTO> {
    await ensureDatabaseInitialized();
    const db = getDbClient();

    if (input.devices.length === 0 && input.accessories.length === 0) {
      throw new Error("Giỏ hàng trống, vui lòng quét thiết bị IMEI hoặc chọn phụ kiện.");
    }

    const branchRes = await db.execute({
      sql: "SELECT * FROM tbl_ChiNhanh WHERE ma_chi_nhanh = ?",
      args: [input.ma_chi_nhanh],
    });
    const branchRow = branchRes.rows[0];
    if (!branchRow) {
      throw new Error(`Chi nhánh '${input.ma_chi_nhanh}' không tồn tại.`);
    }

    // 1. Validate all IMEI devices
    const seenImeis = new Set<string>();
    const validatedDevices: DeviceIMEI[] = [];
    for (const item of input.devices) {
      const cleanImei = item.ma_imei.trim();
      if (seenImeis.has(cleanImei)) {
        throw new Error(`Mã IMEI ${cleanImei} bị lặp lại trong giỏ hàng.`);
      }
      seenImeis.add(cleanImei);

      const dev = await this.imeiRepo.findByIMEI(cleanImei);
      if (!dev) {
        throw new Error(`Mã IMEI ${cleanImei} không tồn tại.`);
      }
      if (dev.ma_chi_nhanh !== input.ma_chi_nhanh) {
        throw new Error(`Mã IMEI ${cleanImei} không thuộc kho chi nhánh hiện tại.`);
      }
      if (
        dev.trang_thai !== "SanSangBan" &&
        !(dev.trang_thai === "KhoaTamThoi" && (!dev.locked_by || dev.locked_by === input.ma_nhan_vien))
      ) {
        throw new Error(`Mã IMEI ${cleanImei} không khả dụng (Trạng thái: ${dev.trang_thai}).`);
      }
      validatedDevices.push(dev);
    }

    // 2. Lookup compatible accessory discounts based on main devices in cart
    const mainProductIds = validatedDevices.map((d) => d.ma_san_pham);
    const compatibleList = await this.spRepo.findCompatibleAccessories(
      mainProductIds,
      input.ma_chi_nhanh
    );
    const comboMap = new Map(compatibleList.map((c) => [c.ma_sp_phu_kien, c]));

    const lines: OrderReceiptLine[] = [];
    let tongTienHang = 0;
    let tienGiamCombo = 0;

    for (const dev of validatedDevices) {
      const unitPrice = dev.gia_khuyen_mai ?? dev.gia_niem_yet ?? 0;
      tongTienHang += unitPrice;
      lines.push({
        ten_san_pham: dev.ten_san_pham ?? dev.ma_san_pham,
        ma_san_pham: dev.ma_san_pham,
        ma_imei: dev.ma_imei,
        so_luong: 1,
        don_gia_ban: unitPrice,
        tien_giam_combo: 0,
        thanh_tien: unitPrice,
      });
    }

    // 3. Validate accessory stock & compute combo discounts
    const branchAccessories = await this.spRepo.findAccessoriesWithBranchStock(input.ma_chi_nhanh);
    const accMap = new Map(branchAccessories.map((a) => [a.ma_san_pham, a]));

    for (const accItem of input.accessories) {
      if (accItem.so_luong <= 0) continue;
      const acc = accMap.get(accItem.ma_san_pham);
      if (!acc) {
        throw new Error(`Phụ kiện '${accItem.ma_san_pham}' không tồn tại.`);
      }
      if (acc.so_luong_ton < accItem.so_luong) {
        throw new Error(
          `Phụ kiện '${acc.ten_san_pham}' chỉ còn ${acc.so_luong_ton} chiếc tại kho chi nhánh.`
        );
      }

      const unitPrice = acc.gia_khuyen_mai ?? acc.gia_niem_yet;
      const comboRule = comboMap.get(acc.ma_san_pham);
      const discountPerUnit = comboRule
        ? Math.round((unitPrice * comboRule.phan_tram_giam_combo) / 100)
        : 0;
      const totalComboDiscount = discountPerUnit * accItem.so_luong;
      const lineTotal = unitPrice * accItem.so_luong - totalComboDiscount;

      tongTienHang += unitPrice * accItem.so_luong;
      tienGiamCombo += totalComboDiscount;

      lines.push({
        ten_san_pham: acc.ten_san_pham,
        ma_san_pham: acc.ma_san_pham,
        ma_imei: null,
        so_luong: accItem.so_luong,
        don_gia_ban: unitPrice,
        tien_giam_combo: totalComboDiscount,
        thanh_tien: lineTotal,
      });
    }

    // 4. Customer & Loyalty Points validation
    const cleanPhone = input.customer_phone?.replace(/\s+/g, "").trim() || "";
    const customer = cleanPhone
      ? await this.khRepo.findOrCreate(cleanPhone, input.customer_name)
      : null;

    const pointsToRedeem = Math.max(0, Math.floor(input.points_to_redeem ?? 0));
    if (pointsToRedeem > 0) {
      if (!customer) {
        throw new Error("Cần nhập số điện thoại khách hàng thành viên để sử dụng điểm tích lũy.");
      }
      if (pointsToRedeem > customer.diem_tich_luy) {
        throw new Error(
          `Số điểm sử dụng (${pointsToRedeem}) vượt quá số điểm tích lũy hiện có (${customer.diem_tich_luy} điểm).`
        );
      }
    }

    const tienGiamDiem = pointsToRedeem * 1000;
    const tienThuCu = Math.max(0, Math.round(input.trade_in_value ?? 0));
    const tongThanhToan = Math.max(0, tongTienHang - tienGiamCombo - tienGiamDiem - tienThuCu);
    const pointsEarned = customer ? Math.floor(tongThanhToan / 100000) : 0;

    // 5. Build atomic SQL batch transaction
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);
    const orderId = `HD-${Date.now().toString().slice(-7)}`;

    const batchStatements: InStatement[] = [
      {
        sql: `INSERT INTO tbl_HoaDon (
                ma_hoa_don, ma_chi_nhanh, ma_nhan_vien, ma_khach_hang, ngay_lap,
                tong_tien_hang, tien_giam_combo, tien_giam_diem, tien_thu_cu, mo_ta_thu_cu,
                tong_thanh_toan, phuong_thuc_tt, ma_giao_dich_qr, trang_thai_don
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DaThanhToan')`,
        args: [
          orderId,
          input.ma_chi_nhanh,
          input.ma_nhan_vien,
          customer ? customer.ma_khach_hang : null,
          nowIso,
          tongTienHang,
          tienGiamCombo,
          tienGiamDiem,
          tienThuCu,
          input.trade_in_description ?? null,
          tongThanhToan,
          input.payment_method,
          input.qr_reference ?? null,
        ],
      },
    ];

    for (const line of lines) {
      batchStatements.push({
        sql: `INSERT INTO tbl_ChiTietHoaDon (
                ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          line.ma_san_pham,
          line.ma_imei,
          line.so_luong,
          line.don_gia_ban,
          line.tien_giam_combo,
          line.thanh_tien,
        ],
      });
    }

    const warranties: OrderReceiptDTO["warranties"] = [];
    for (const dev of validatedDevices) {
      batchStatements.push({
        sql: "UPDATE tbl_ThietBi_IMEI SET trang_thai = 'DaBan', locked_by = NULL, locked_until = NULL WHERE ma_imei = ?",
        args: [dev.ma_imei],
      });

      const months = dev.thoi_gian_bao_hanh_thang ?? 12;
      const expDate = new Date();
      expDate.setUTCMonth(expDate.getUTCMonth() + months);
      const expStr = expDate.toISOString().slice(0, 10);
      const warrantyId = `BH-${dev.ma_imei}`;
      const warrantyPhone = cleanPhone || "0000000000";

      batchStatements.push({
        sql: `INSERT INTO tbl_BaoHanh_DienTu (
                ma_bao_hanh, ma_imei, ma_hoa_don, so_dien_thoai_khach,
                ngay_kich_hoat, ngay_het_han, trang_thai_bao_hanh, lich_su_tiep_nhan
              ) VALUES (?, ?, ?, ?, ?, ?, 'ConHan', '[]')`,
        args: [warrantyId, dev.ma_imei, orderId, warrantyPhone, todayStr, expStr],
      });

      warranties.push({
        ma_bao_hanh: warrantyId,
        ma_imei: dev.ma_imei,
        ten_san_pham: dev.ten_san_pham ?? dev.ma_san_pham,
        ngay_kich_hoat: todayStr,
        ngay_het_han: expStr,
      });
    }

    for (const accItem of input.accessories) {
      if (accItem.so_luong <= 0) continue;
      batchStatements.push({
        sql: `UPDATE tbl_TonKho_PhuKien
              SET so_luong_ton = so_luong_ton - ?
              WHERE ma_san_pham = ? AND ma_chi_nhanh = ?`,
        args: [accItem.so_luong, accItem.ma_san_pham, input.ma_chi_nhanh],
      });
    }

    if (customer) {
      const updatedPoints = customer.diem_tich_luy - pointsToRedeem + pointsEarned;
      const updatedTier = computeTier(updatedPoints);
      batchStatements.push({
        sql: "UPDATE tbl_KhachHang SET diem_tich_luy = ?, hang_thanh_vien = ? WHERE ma_khach_hang = ?",
        args: [updatedPoints, updatedTier, customer.ma_khach_hang],
      });
    }

    await db.batch(batchStatements, "write");

    return {
      ma_hoa_don: orderId,
      ngay_lap: nowIso,
      ma_chi_nhanh: input.ma_chi_nhanh,
      ten_chi_nhanh: String(branchRow.ten_chi_nhanh),
      dia_chi_chi_nhanh: String(branchRow.dia_chi),
      ma_nhan_vien: input.ma_nhan_vien,
      customer_phone: customer?.so_dien_thoai ?? null,
      customer_name: customer?.ho_ten ?? null,
      points_earned: pointsEarned,
      tong_tien_hang: tongTienHang,
      tien_giam_combo: tienGiamCombo,
      tien_giam_diem: tienGiamDiem,
      tien_thu_cu: tienThuCu,
      mo_ta_thu_cu: input.trade_in_description ?? null,
      tong_thanh_toan: tongThanhToan,
      phuong_thuc_tt: input.payment_method,
      lines,
      warranties,
    };
  }
}
