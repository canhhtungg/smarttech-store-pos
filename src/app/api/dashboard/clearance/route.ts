import { NextRequest, NextResponse } from "next/server";
import { AgingStockService } from "@/server/services/AgingStockService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.productId ?? "");
    const discountPercent = Number(body.discountPercent ?? 10);
    const svc = new AgingStockService();
    const product = await svc.applyClearanceDiscount(productId, discountPercent);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi áp dụng giảm giá xả kho." },
      { status: 400 }
    );
  }
}
