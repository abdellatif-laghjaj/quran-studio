import { NextRequest, NextResponse } from "next/server";
import { searchVideos, Theme } from "@/lib/pixabay";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const theme = (searchParams.get("theme") || "nature") as Theme;
    const page = parseInt(searchParams.get("page") || "1");

    const videos = await searchVideos(theme, page);

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 },
    );
  }
}
