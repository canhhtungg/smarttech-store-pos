import { NextRequest, NextResponse } from "next/server";
import { VietQRService } from "@/server/services/VietQRService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body.amount ?? 0);
    const orderId = String(body.orderId ?? `HD${Date.now().toString().slice(-6)}`);
    const qrService = new VietQRService();
    const data = await qrService.generateQRDataUrl({ amount, orderId });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi sinh mã VietQR động." },
      { status: 400 }
    );
  }
}
