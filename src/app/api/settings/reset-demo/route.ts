import { NextResponse } from "next/server";
import { resetDatabaseToSeed } from "@/server/db/client";

export async function POST() {
  try {
    await resetDatabaseToSeed();
    return NextResponse.json({ ok: true, message: "Đã khôi phục dữ liệu mẫu ban đầu thành công." });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi khôi phục dữ liệu mẫu." },
      { status: 500 }
    );
  }
}
