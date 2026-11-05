import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/server/services/OrderService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imei = String(body.imei ?? "");
    const staffId = body.staffId ? String(body.staffId) : undefined;
    const orderService = new OrderService();
    await orderService.unlockIMEI(imei, staffId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi mở khóa IMEI." },
      { status: 400 }
    );
  }
}
