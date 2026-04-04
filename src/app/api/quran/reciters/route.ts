import { NextResponse } from "next/server";
import { getReciters } from "@/lib/quran-api";

export async function GET() {
  try {
    const reciters = await getReciters();
    return NextResponse.json({ reciters });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reciters" },
      { status: 500 },
    );
  }
}
