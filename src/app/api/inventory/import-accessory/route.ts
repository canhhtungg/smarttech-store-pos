import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/server/services/InventoryService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const svc = new InventoryService();
    const result = await svc.importAccessoryStock({
      productId: String(body.productId ?? ""),
      branchId: String(body.branchId ?? "CN-CG"),
      quantity: Number(body.quantity ?? 0),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi nhập kho phụ kiện." },
      { status: 400 }
    );
  }
}
