import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetDatabaseToSeed } from "@/server/db/client";
import { GET as getBootstrap } from "@/app/api/bootstrap/route";
import { POST as postScanImei } from "@/app/api/pos/scan-imei/route";
import { POST as postVietQr } from "@/app/api/pos/vietqr/route";
import { POST as postCheckout } from "@/app/api/pos/checkout/route";
import { GET as getDashboard } from "@/app/api/dashboard/route";

describe("Task 5: Next.js REST API Route Controllers", () => {
  beforeEach(async () => {
    process.env.SMARTTECH_DB_URL = "file::memory:?cache=shared";
    await resetDatabaseToSeed();
  });

  it("serves bootstrap catalog, POS scan + VietQR + checkout flow, and BI dashboard via HTTP handlers", async () => {
    const bootRes = await getBootstrap(new NextRequest("http://localhost:3000/api/bootstrap?branchId=CN-CG"));
    expect(bootRes.status).toBe(200);
    const bootJson = await bootRes.json();
    expect(bootJson.branches.length).toBe(3);
    expect(bootJson.availableDevices.length).toBeGreaterThan(0);

    const scanRes = await postScanImei(
      new NextRequest("http://localhost:3000/api/pos/scan-imei", {
        method: "POST",
        body: JSON.stringify({ imei: "356892110294812", branchId: "CN-CG", staffId: "NV-001" }),
      })
    );
    expect(scanRes.status).toBe(200);
    const scanJson = await scanRes.json();
    expect(scanJson.device.ma_imei).toBe("356892110294812");
    expect(scanJson.recommendations.length).toBeGreaterThan(0);

    const qrRes = await postVietQr(
      new NextRequest("http://localhost:3000/api/pos/vietqr", {
        method: "POST",
        body: JSON.stringify({ amount: 34430000, orderId: "HD-DEMO-99" }),
      })
    );
    expect(qrRes.status).toBe(200);
    const qrJson = await qrRes.json();
    expect(qrJson.qrDataUrl).toContain("data:image/png;base64,");

    const checkoutRes = await postCheckout(
      new NextRequest("http://localhost:3000/api/pos/checkout", {
        method: "POST",
        body: JSON.stringify({
          ma_chi_nhanh: "CN-CG",
          ma_nhan_vien: "NV-001",
          customer_phone: "0988123456",
          payment_method: "VietQR",
          devices: [{ ma_imei: "356892110294812" }],
          accessories: [{ ma_san_pham: "PK-AP-20W", so_luong: 1 }],
        }),
      })
    );
    expect(checkoutRes.status).toBe(200);
    const checkoutJson = await checkoutRes.json();
    expect(checkoutJson.receipt.tong_thanh_toan).toBe(34430000);

    const dashRes = await getDashboard(new NextRequest("http://localhost:3000/api/dashboard"));
    expect(dashRes.status).toBe(200);
    const dashJson = await dashRes.json();
    expect(dashJson.totalInvoices).toBe(4);
  });
});
