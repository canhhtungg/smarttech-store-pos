import { NextRequest, NextResponse } from "next/server";
import { AgingStockService } from "@/server/services/AgingStockService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const branchId = req.nextUrl.searchParams.get("branchId") || undefined;
    const svc = new AgingStockService();
    const metrics = await svc.getChainDashboardMetrics(branchId);
    return NextResponse.json(metrics);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi tải số liệu báo cáo." },
      { status: 500 }
    );
  }
}
