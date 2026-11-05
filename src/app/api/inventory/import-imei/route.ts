import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/server/services/InventoryService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawTextOrArray = body.rawImeis;
    const rawImeis: string[] = Array.isArray(rawTextOrArray)
      ? rawTextOrArray.map(String)
      : String(rawTextOrArray ?? "").split(/[\r\n,;]+/);

    const svc = new InventoryService();
    const result = await svc.importIMEIBatch({
      productId: String(body.productId ?? ""),
      branchId: String(body.branchId ?? "CN-CG"),
      importPrice: Number(body.importPrice ?? 0),
      rawImeis,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi nhập lô IMEI." },
      { status: 400 }
    );
  }
}
