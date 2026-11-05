import { NextRequest, NextResponse } from "next/server";
import { TradeInService } from "@/server/services/TradeInService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const svc = new TradeInService();
    const evaluation = svc.evaluateTradeIn({
      modelCode: String(body.modelCode ?? ""),
      screenIntact: Boolean(body.screenIntact),
      batteryAbove85: Boolean(body.batteryAbove85),
      bodyNoMajorDents: Boolean(body.bodyNoMajorDents),
      biometricsAndAccountClean: Boolean(body.biometricsAndAccountClean),
    });
    return NextResponse.json({ evaluation });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi định giá thu cũ." },
      { status: 400 }
    );
  }
}
