import { NextRequest, NextResponse } from "next/server";
import { CauHinhRepository, VIETNAMESE_BANKS } from "@/server/repositories/CauHinhRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repo = new CauHinhRepository();
    const settings = await repo.getSettings();
    return NextResponse.json({ settings, banks: VIETNAMESE_BANKS });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi tải cấu hình." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const repo = new CauHinhRepository();
    const settings = await repo.updateSettings({
      bank_bin: String(body.bank_bin ?? "970422"),
      bank_short_name: String(body.bank_short_name ?? "MB Bank"),
      bank_account_no: String(body.bank_account_no ?? ""),
      bank_account_name: String(body.bank_account_name ?? "SMARTTECH STORE"),
    });
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi lưu cấu hình ngân hàng." },
      { status: 400 }
    );
  }
}
