import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabaseToSeed } from "@/server/db/client";
import { InventoryService } from "@/server/services/InventoryService";
import { AgingStockService } from "@/server/services/AgingStockService";

describe("Task 4: Bulk IMEI Import, Cross-Branch Transfer & Aging Stock BI Service", () => {
  beforeEach(async () => {
    process.env.SMARTTECH_DB_URL = "file::memory:?cache=shared";
    await resetDatabaseToSeed();
  });

  it("imports valid 15-digit IMEIs in batch while flagging malformed and duplicate IMEIs", async () => {
    const invService = new InventoryService();
    const res = await invService.importIMEIBatch({
      productId: "IP16PM-256",
      branchId: "CN-CG",
      importPrice: 30200000,
      rawImeis: [
        "359999000000001",
        "359999000000002",
        "359999000000001", // duplicate inside same batch
        "356892110294811", // already in DB
        "INVALID-IMEI-12", // non-digits
      ],
    });

    expect(res.importedCount).toBe(2);
    expect(res.rejected.length).toBe(3);
  });

  it("enforces full 3-step Cross-Branch Transfer state machine and rejects mismatched IMEI on receive", async () => {
    const invService = new InventoryService();

    const matrix = await invService.getCrossBranchMatrix("ASUS");
    const zenbook = matrix.find((m) => m.ma_san_pham === "ASUS-ZEN14");
    expect(zenbook).toBeDefined();
    expect(zenbook?.stockByBranch["CN-CG"]).toBe(0);
    expect(zenbook?.stockByBranch["CN-DD"]).toBe(2);

    const ticket = await invService.createTransferRequest({
      fromBranchId: "CN-DD",
      toBranchId: "CN-CG",
      productId: "ASUS-ZEN14",
      requesterName: "Nguyễn Văn An",
      note: "Chuyển máy cho khách đặt tại Cầu Giấy",
    });
    expect(ticket.trang_thai).toBe("Pending");

    const exported = await invService.approveAndExportTransfer({
      ticketId: ticket.ma_phieu_chuyen,
      exportImei: "352091827364501",
      approverName: "Lê Hoàng Cường",
    });
    expect(exported.trang_thai).toBe("InTransit");
    expect(exported.ma_imei).toBe("352091827364501");

    // Review Focus #5: Mismatched scanned IMEI at destination must fail!
    await expect(
      invService.confirmReceiveTransfer({
        ticketId: ticket.ma_phieu_chuyen,
        scannedImei: "352091827364502",
      })
    ).rejects.toThrow(/không khớp/);

    // Matching IMEI succeeds and moves ownership to CN-CG
    const completed = await invService.confirmReceiveTransfer({
      ticketId: ticket.ma_phieu_chuyen,
      scannedImei: "352091827364501",
    });
    expect(completed.trang_thai).toBe("Completed");

    const updatedMatrix = await invService.getCrossBranchMatrix("ASUS");
    const updatedZenbook = updatedMatrix.find((m) => m.ma_san_pham === "ASUS-ZEN14");
    expect(updatedZenbook?.stockByBranch["CN-CG"]).toBe(1);
    expect(updatedZenbook?.stockByBranch["CN-DD"]).toBe(1);
  });

  it("detects RED (>=60d) & YELLOW (45-59d) Aging Stock alerts, applies clearance discount, and aggregates BI metrics", async () => {
    const agingService = new AgingStockService();

    const alerts = await agingService.getAgingStockAlerts();
    const redAlerts = alerts.filter((a) => a.muc_canh_bao === "RED");
    const yellowAlerts = alerts.filter((a) => a.muc_canh_bao === "YELLOW");

    expect(redAlerts.length).toBeGreaterThanOrEqual(3);
    expect(yellowAlerts.length).toBeGreaterThanOrEqual(2);

    const updatedProduct = await agingService.applyClearanceDiscount("IP14-128", 10);
    expect(updatedProduct.gia_khuyen_mai).toBe(14391000);

    const metrics = await agingService.getChainDashboardMetrics();
    expect(metrics.totalInvoices).toBe(3);
    expect(metrics.totalRevenue).toBeGreaterThan(80000000);
    expect(metrics.comboAttachRate).toBeCloseTo(66.7, 0);
    expect(metrics.revenueByBranch.length).toBe(3);
  });
});
