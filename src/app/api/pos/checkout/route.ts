import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/server/services/OrderService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderService = new OrderService();
    const receipt = await orderService.checkoutOrder(body);
    return NextResponse.json({ receipt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi thanh toán đơn hàng." },
      { status: 400 }
    );
  }
}
