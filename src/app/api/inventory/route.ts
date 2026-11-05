import { NextRequest, NextResponse } from "next/server";
import { ThietBiIMEIRepository } from "@/server/repositories/ThietBiIMEIRepository";
import { SanPhamRepository } from "@/server/repositories/SanPhamRepository";
import type { IMEIStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const branchId = req.nextUrl.searchParams.get("branchId") || undefined;
    const status = (req.nextUrl.searchParams.get("status") || undefined) as IMEIStatus | undefined;
    const productId = req.nextUrl.searchParams.get("productId") || undefined;

    const imeiRepo = new ThietBiIMEIRepository();
    const spRepo = new SanPhamRepository();

    const [devices, products, accessories] = await Promise.all([
      imeiRepo.findByFilter({ branchId, status, productId }),
      spRepo.findAll(),
      spRepo.findAccessoriesWithBranchStock(branchId || "CN-CG"),
    ]);

    return NextResponse.json({ devices, products, accessories });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi truy vấn tồn kho." },
      { status: 500 }
    );
  }
}
