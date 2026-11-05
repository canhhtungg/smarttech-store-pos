import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/server/services/InventoryService";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = String(body.action ?? "");
    const svc = new InventoryService();

    if (action === "approve") {
      const ticket = await svc.approveAndExportTransfer({
        ticketId: id,
        exportImei: String(body.exportImei ?? ""),
        approverName: String(body.approverName ?? ""),
      });
      return NextResponse.json({ ticket });
    }

    if (action === "receive") {
      const ticket = await svc.confirmReceiveTransfer({
        ticketId: id,
        scannedImei: String(body.scannedImei ?? ""),
      });
      return NextResponse.json({ ticket });
    }

    if (action === "reject") {
      const ticket = await svc.rejectTransfer(id, body.reason ? String(body.reason) : undefined);
      return NextResponse.json({ ticket });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi xử lý phiếu điều chuyển." },
      { status: 400 }
    );
  }
}
