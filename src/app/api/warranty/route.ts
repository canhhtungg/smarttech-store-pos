import { NextRequest, NextResponse } from "next/server";
import { WarrantyService } from "@/server/services/WarrantyService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || "";
    const svc = new WarrantyService();
    const records = await svc.lookupWarranty(query);
    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi tra cứu bảo hành điện tử." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "intake");
    const svc = new WarrantyService();

    if (action === "complete") {
      const record = await svc.completeServiceReturn(
        String(body.maImei ?? ""),
        String(body.resolutionNote ?? ""),
        String(body.technicianName ?? "")
      );
      return NextResponse.json({ record });
    }

    const record = await svc.createServiceIntake(
      String(body.maImei ?? ""),
      String(body.issueDescription ?? ""),
      String(body.technicianName ?? "")
    );
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi cập nhật tiếp nhận bảo hành." },
      { status: 400 }
    );
  }
}
