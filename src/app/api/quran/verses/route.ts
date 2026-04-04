import { NextRequest, NextResponse } from "next/server";
import { getVerses, getTafsir } from "@/lib/quran-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chapter = parseInt(searchParams.get("chapter") || "1");
    const from = parseInt(searchParams.get("from") || "1");
    const to = parseInt(searchParams.get("to") || "7");
    const includeTafsir = searchParams.get("tafsir") === "true";

    const verses = await getVerses(chapter, from, to);

    let versesWithTafsir = verses.map((v) => ({
      ...v,
      tafsir_text: "",
    }));

    if (includeTafsir) {
      versesWithTafsir = await Promise.all(
        verses.map(async (v) => {
          const tafsirText = await getTafsir(chapter, v.verse_number);
          return { ...v, tafsir_text: tafsirText };
        }),
      );
    }

    return NextResponse.json({ verses: versesWithTafsir });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch verses" },
      { status: 500 },
    );
  }
}
