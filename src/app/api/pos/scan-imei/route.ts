import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/server/services/OrderService";
import { RecommendationService } from "@/server/services/RecommendationService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imei = String(body.imei ?? "");
    const branchId = String(body.branchId ?? "CN-CG");
    const staffId = String(body.staffId ?? "NV-001");
    const existingCartProductIds: string[] = Array.isArray(body.cartProductIds)
      ? body.cartProductIds.map(String)
      : [];

    const orderService = new OrderService();
    const recService = new RecommendationService();

    const device = await orderService.scanAndLockIMEI(imei, branchId, staffId);
    const recommendations = await recService.getRecommendationsForCart(
      [...existingCartProductIds, device.ma_san_pham],
      branchId
    );

    return NextResponse.json({ device, recommendations });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Không thể quét mã IMEI." },
      { status: 400 }
    );
  }
}
