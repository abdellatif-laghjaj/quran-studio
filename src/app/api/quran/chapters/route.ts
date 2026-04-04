import { NextResponse } from "next/server";
import { getChapters } from "@/lib/quran-api";

export async function GET() {
  try {
    const chapters = await getChapters();
    return NextResponse.json({ chapters });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 },
    );
  }
}
