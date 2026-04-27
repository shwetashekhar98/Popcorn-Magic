import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb/endpoints";

export async function GET() {
  try {
    const data = await getTrending("day");
    return NextResponse.json({ ok: true, count: data.results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
