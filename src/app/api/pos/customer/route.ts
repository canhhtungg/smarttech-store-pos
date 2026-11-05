import { NextRequest, NextResponse } from "next/server";
import { KhachHangRepository } from "@/server/repositories/KhachHangRepository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone") || "";
    const repo = new KhachHangRepository();
    const customer = await repo.findByPhone(phone);
    return NextResponse.json({ customer });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi tra cứu hội viên." },
      { status: 400 }
    );
  }
}
