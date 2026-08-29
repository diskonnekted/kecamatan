import { NextResponse } from "next/server";
import { scrapeAllStatistik } from "@/lib/statistik";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await scrapeAllStatistik();
    return NextResponse.json({
      ...result,
      success: true,
    });
  } catch (err) {
    console.error("Sync statistik error:", err);
    return NextResponse.json(
      { error: "Gagal melakukan sinkronisasi" },
      { status: 500 }
    );
  }
}
