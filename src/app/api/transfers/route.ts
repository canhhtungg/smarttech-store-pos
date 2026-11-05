import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/server/services/InventoryService";
import { ChiNhanhRepository } from "@/server/repositories/ChiNhanhRepository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const keyword = req.nextUrl.searchParams.get("keyword") || undefined;
    const branchId = req.nextUrl.searchParams.get("branchId") || undefined;

    const svc = new InventoryService();
    const branchRepo = new ChiNhanhRepository();

    const [branches, matrix, tickets] = await Promise.all([
      branchRepo.findAllBranches(),
      svc.getCrossBranchMatrix(keyword),
      svc.listTransfers(branchId),
    ]);

    return NextResponse.json({ branches, matrix, tickets });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi tra cứu kho chuỗi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const svc = new InventoryService();
    const ticket = await svc.createTransferRequest({
      fromBranchId: String(body.fromBranchId ?? ""),
      toBranchId: String(body.toBranchId ?? ""),
      productId: String(body.productId ?? ""),
      requesterName: String(body.requesterName ?? ""),
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ ticket });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Không thể tạo phiếu điều chuyển." },
      { status: 400 }
    );
  }
}
