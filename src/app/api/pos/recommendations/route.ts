import { NextRequest, NextResponse } from "next/server";
import { RecommendationService } from "@/server/services/RecommendationService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mainProductIds: string[] = Array.isArray(body.mainProductIds)
      ? body.mainProductIds.map(String)
      : [];
    const branchId = String(body.branchId ?? "CN-CG");
    const recService = new RecommendationService();
    const recommendations = await recService.getRecommendationsForCart(mainProductIds, branchId);
    return NextResponse.json({ recommendations });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi gợi ý phụ kiện." },
      { status: 400 }
    );
  }
}
