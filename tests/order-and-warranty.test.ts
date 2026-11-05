import { describe, it, expect, beforeEach } from "vitest";
import { getDbClient, resetDatabaseToSeed } from "@/server/db/client";
import { OrderService } from "@/server/services/OrderService";
import { WarrantyService } from "@/server/services/WarrantyService";

describe("Task 3: IMEI Soft-Locking, Atomic POS Checkout & Automated E-Warranty", () => {
  beforeEach(async () => {
    process.env.SMARTTECH_DB_URL = "file::memory:?cache=shared";
    await resetDatabaseToSeed();
  });

  it("rejects malformed IMEIs and devices located at a different branch", async () => {
    const orderService = new OrderService();

    await expect(
      orderService.scanAndLockIMEI("12345abc", "CN-CG", "NV-001")
    ).rejects.toThrow(/15 chữ số/);

    // 352091827364501 belongs to CN-DD (Đống Đa), not CN-CG (Cầu Giấy)
    await expect(
      orderService.scanAndLockIMEI("352091827364501", "CN-CG", "NV-001")
    ).rejects.toThrow(/Đống Đa/);
  });

  it("soft-locks an IMEI for 10 minutes, blocks other cashiers, and auto-releases expired locks", async () => {
    const orderService = new OrderService();

    const locked = await orderService.scanAndLockIMEI("356892110294811", "CN-CG", "NV-001");
    expect(locked.ma_imei).toBe("356892110294811");
    expect(locked.trang_thai).toBe("KhoaTamThoi");

    // Another cashier tries to scan the same IMEI while lock is active -> blocked
    await expect(
      orderService.scanAndLockIMEI("356892110294811", "CN-CG", "NV-002")
    ).rejects.toThrow(/khóa tạm thời|đang được giữ/i);

    // Expire lock manually in DB to simulate 11 minutes elapsed
    const db = getDbClient();
    const pastIso = new Date(Date.now() - 60_000).toISOString();
    await db.execute({
      sql: "UPDATE tbl_ThietBi_IMEI SET locked_until = ? WHERE ma_imei = ?",
      args: [pastIso, "356892110294811"],
    });

    // Now NV-002 can claim it cleanly!
    const relocked = await orderService.scanAndLockIMEI("356892110294811", "CN-CG", "NV-002");
    expect(relocked.locked_by).toBe("NV-002");
  });

  it("executes atomic POS checkout with Combo discount, Loyalty points, Trade-In, stock deduction, and E-Warranty activation", async () => {
    const orderService = new OrderService();
    const warrantyService = new WarrantyService();

    await orderService.scanAndLockIMEI("356892110294811", "CN-CG", "NV-001");

    // Reject redeeming more points than customer KH-001 has (240 points)
    await expect(
      orderService.checkoutOrder({
        ma_chi_nhanh: "CN-CG",
        ma_nhan_vien: "NV-001",
        customer_phone: "0988123456",
        points_to_redeem: 999,
        payment_method: "VietQR",
        devices: [{ ma_imei: "356892110294811" }],
        accessories: [{ ma_san_pham: "PK-AP-20W", so_luong: 1 }],
      })
    ).rejects.toThrow(/điểm tích lũy/i);

    // Valid checkout: iPhone 16 PM (33,990,000) + Apple 20W charger (550,000 - 20% combo = 440,000)
    // - 100 points (100,000) - Trade-in (8,200,000) = 26,130,000 VND
    const receipt = await orderService.checkoutOrder({
      ma_chi_nhanh: "CN-CG",
      ma_nhan_vien: "NV-001",
      customer_phone: "0988123456",
      points_to_redeem: 100,
      trade_in_value: 8200000,
      trade_in_description: "Thu cũ iPhone 13 128GB Loại A",
      payment_method: "VietQR",
      qr_reference: "VIETQR-TEST-01",
      devices: [{ ma_imei: "356892110294811" }],
      accessories: [{ ma_san_pham: "PK-AP-20W", so_luong: 1 }],
    });

    expect(receipt.tong_tien_hang).toBe(34540000);
    expect(receipt.tien_giam_combo).toBe(110000);
    expect(receipt.tien_giam_diem).toBe(100000);
    expect(receipt.tien_thu_cu).toBe(8200000);
    expect(receipt.tong_thanh_toan).toBe(26130000);
    expect(receipt.warranties.length).toBe(1);
    expect(receipt.warranties[0].ma_imei).toBe("356892110294811");

    // Verify E-Warranty lookup & Service Intake
    const foundByImei = await warrantyService.lookupWarranty("356892110294811");
    expect(foundByImei.length).toBe(1);
    expect(foundByImei[0].trang_thai_bao_hanh).toBe("ConHan");

    const updatedWarranty = await warrantyService.createServiceIntake(
      "356892110294811",
      "Kiểm tra loa thoại hơi nhỏ",
      "Trần Thị Bình"
    );
    expect(updatedWarranty.trang_thai_bao_hanh).toBe("DangTiepNhan");
    expect(updatedWarranty.lich_su_tiep_nhan.length).toBe(1);
  });
});
