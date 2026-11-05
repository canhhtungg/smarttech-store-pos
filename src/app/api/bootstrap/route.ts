import { NextRequest, NextResponse } from "next/server";
import { ChiNhanhRepository } from "@/server/repositories/ChiNhanhRepository";
import { SanPhamRepository } from "@/server/repositories/SanPhamRepository";
import { ThietBiIMEIRepository } from "@/server/repositories/ThietBiIMEIRepository";
import { CauHinhRepository } from "@/server/repositories/CauHinhRepository";
import { TradeInService } from "@/server/services/TradeInService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const branchId = req.nextUrl.searchParams.get("branchId") || "CN-CG";
    const branchRepo = new ChiNhanhRepository();
    const spRepo = new SanPhamRepository();
    const imeiRepo = new ThietBiIMEIRepository();
    const settingsRepo = new CauHinhRepository();
    const tradeInSvc = new TradeInService();

    const [branches, staff, products, availableDevices, branchAccessories, settings] =
      await Promise.all([
        branchRepo.findAllBranches(),
        branchRepo.findAllStaff(),
        spRepo.findAll(),
        imeiRepo.findByFilter({ branchId, status: "SanSangBan" }),
        spRepo.findAccessoriesWithBranchStock(branchId),
        settingsRepo.getSettings(),
      ]);

    return NextResponse.json({
      branches,
      staff,
      products,
      availableDevices,
      branchAccessories,
      tradeInModels: tradeInSvc.getSupportedModels(),
      settings,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi tải dữ liệu khởi tạo." },
      { status: 500 }
    );
  }
}
