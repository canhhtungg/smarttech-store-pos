import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabaseToSeed } from "@/server/db/client";
import { VietQRService } from "@/server/services/VietQRService";
import { RecommendationService } from "@/server/services/RecommendationService";
import { TradeInService } from "@/server/services/TradeInService";

describe("Task 2: VietQR EMVCo, Smart Accessory Recommendation & Trade-In Services", () => {
  beforeEach(async () => {
    process.env.SMARTTECH_DB_URL = "file::memory:?cache=shared";
    await resetDatabaseToSeed();
  });

  it("computes standard EMVCo CRC16-CCITT (0x1021, init 0xFFFF) accurately", () => {
    const qrService = new VietQRService();
    // Standard EMVCo test vector: "123456789" -> 0x29B1
    expect(qrService.computeCRC16("123456789")).toBe("29B1");
  });

  it("builds valid Napas dynamic VietQR payload, strips Vietnamese diacritics, and renders offline PNG data URL", async () => {
    const qrService = new VietQRService();
    const res = await qrService.generateQRDataUrl({
      amount: 33520000,
      orderId: "Đơn #HD-10293 Cầu Giấy",
    });

    expect(res.payload.startsWith("00020101021238")).toBe(true);
    expect(res.payload).toContain("A000000727");
    expect(res.payload).toContain("970422");
    expect(res.payload).toContain("09881239999");
    expect(res.payload).toContain("QRIBFTTA");
    expect(res.payload).toContain("5303704");
    expect(res.payload).toContain("540833520000");
    expect(res.payload).toContain("5802VN");
    expect(res.addInfo).toBe("DON HD10293 CAU GIAY");
    expect(res.payload).toMatch(/6304[0-9A-F]{4}$/);

    // Verify trailing CRC matches recomputed CRC of payload body
    const bodyWithoutCrcValue = res.payload.slice(0, -4);
    expect(qrService.computeCRC16(bodyWithoutCrcValue)).toBe(res.payload.slice(-4));
    expect(res.qrDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("omits Tag 54 when amount is 0 and still produces valid 4-char CRC", () => {
    const qrService = new VietQRService();
    const payload = qrService.buildPayload({
      bin: "970436",
      accountNo: "0011001234567",
      amount: 0,
      orderId: "HD000",
    });
    expect(payload).not.toContain("54010");
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it("returns compatible accessories with combo discounts and branch stock for scanned devices", async () => {
    const recService = new RecommendationService();
    const list = await recService.getRecommendationsForCart(["IP16PM-256"], "CN-CG");

    expect(list.length).toBe(3);
    expect(list[0].ma_sp_phu_kien).toBe("PK-AP-20W");
    expect(list[0].phan_tram_giam_combo).toBe(20);
    expect(list[0].gia_goc).toBe(550000);
    expect(list[0].gia_combo).toBe(440000);
    expect(list[0].so_luong_ton).toBeGreaterThan(0);
  });

  it("evaluates Smart Trade-In accurately and rejects iCloud/account-locked devices", () => {
    const tradeIn = new TradeInService();

    const gradeA = tradeIn.evaluateTradeIn({
      modelCode: "IP14PM-128",
      screenIntact: true,
      batteryAbove85: true,
      bodyNoMajorDents: true,
      biometricsAndAccountClean: true,
    });
    expect(gradeA.eligible).toBe(true);
    expect(gradeA.conditionGrade).toBe("Loai A (Dep keng)");
    expect(gradeA.finalTradeInValue).toBe(14500000);

    const rejected = tradeIn.evaluateTradeIn({
      modelCode: "IP14PM-128",
      screenIntact: true,
      batteryAbove85: true,
      bodyNoMajorDents: true,
      biometricsAndAccountClean: false,
    });
    expect(rejected.eligible).toBe(false);
    expect(rejected.finalTradeInValue).toBe(0);
  });
});
