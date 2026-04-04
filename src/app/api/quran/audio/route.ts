import { NextRequest, NextResponse } from "next/server";
import { getAudioFiles, getAudioUrl } from "@/lib/quran-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reciterId = parseInt(searchParams.get("reciterId") || "7");
    const chapter = parseInt(searchParams.get("chapter") || "1");
    const from = parseInt(searchParams.get("from") || "1");
    const to = parseInt(searchParams.get("to") || "7");

    const allAudio = await getAudioFiles(reciterId, chapter);

    const filtered = allAudio
      .filter((a) => {
        const verseNum = parseInt(a.verse_key.split(":")[1]);
        return verseNum >= from && verseNum <= to;
      })
      .map((a) => ({
        verse_key: a.verse_key,
        url: getAudioUrl(a.url),
      }));

    return NextResponse.json({ audio_files: filtered });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audio files" },
      { status: 500 },
    );
  }
}
