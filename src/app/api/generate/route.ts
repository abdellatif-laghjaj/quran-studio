import { NextRequest, NextResponse } from "next/server";
import { generateVideo, cleanupTempDir, VerseOverlay } from "@/lib/ffmpeg";
import {
  getVerses,
  getAudioFiles,
  getAudioUrl,
  getTafsir,
} from "@/lib/quran-api";
import { getRandomVideoUrl, Theme } from "@/lib/pixabay";
import fs from "fs";

export const maxDuration = 300; // 5 min timeout

export async function POST(req: NextRequest) {
  let outputPath = "";
  let tmpDir = "";

  try {
    const body = await req.json();
    const {
      chapter,
      from,
      to,
      reciterId,
      theme,
      includeTafsir,
      dimOpacity = 0.5,
      videoWidth = 1280,
      videoHeight = 720,
      fontFile = "Amiri.ttf",
    } = body as {
      chapter: number;
      from: number;
      to: number;
      reciterId: number;
      theme: Theme;
      includeTafsir: boolean;
      dimOpacity?: number;
      videoWidth?: number;
      videoHeight?: number;
      fontFile?: string;
    };

    // Validate
    if (!chapter || !from || !to || !reciterId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (to - from > 10) {
      return NextResponse.json(
        { error: "Maximum 10 verses per video (server limit)" },
        { status: 400 },
      );
    }

    // Use requested resolution
    const safeWidth = videoWidth;
    const safeHeight = videoHeight;

    // 1) Fetch verses
    console.log("[GEN] Step 1: fetching verses...");
    const verses = await getVerses(chapter, from, to);
    if (!verses.length) {
      return NextResponse.json({ error: "No verses found" }, { status: 404 });
    }
    console.log(`[GEN] Step 1 done: ${verses.length} verses`);

    // 2) Fetch audio
    console.log("[GEN] Step 2: fetching audio...");
    const audioFiles = await getAudioFiles(reciterId, chapter);
    const audioMap = new Map(
      audioFiles.map((a) => [a.verse_key, getAudioUrl(a.url)]),
    );
    console.log(`[GEN] Step 2 done: ${audioFiles.length} audio files`);

    // 3) Fetch tafsir if enabled
    const tafsirMap = new Map<string, string>();
    if (includeTafsir) {
      console.log("[GEN] Step 3: fetching tafsir...");
      for (const v of verses) {
        const text = await getTafsir(chapter, v.verse_number);
        if (text) {
          const cleanText = text.replace(/<[^>]*>/g, "").substring(0, 200);
          tafsirMap.set(v.verse_key, cleanText);
        }
      }
      console.log(`[GEN] Step 3 done: ${tafsirMap.size} tafsirs`);
    }

    // 4) Get background video
    console.log("[GEN] Step 4: fetching background video...");
    const bgUrl = await getRandomVideoUrl(theme || "nature");
    console.log(`[GEN] Step 4 done: ${bgUrl?.substring(0, 60)}...`);

    // 5) Build verse overlays
    const overlays: VerseOverlay[] = verses.map((v) => ({
      text: v.text_uthmani,
      tafsirText: tafsirMap.get(v.verse_key) || undefined,
      audioUrl: audioMap.get(v.verse_key) || "",
      verseKey: v.verse_key,
    }));

    // 6) Generate video
    console.log(
      `[GEN] Step 6: generating video (${safeWidth}x${safeHeight}, font=${fontFile})...`,
    );
    outputPath = await generateVideo(
      overlays,
      bgUrl,
      dimOpacity,
      safeWidth,
      safeHeight,
      fontFile,
    );
    console.log(`[GEN] Step 6 done: ${outputPath}`);
    tmpDir = require("path").dirname(outputPath);

    // 7) Stream the file as response (avoid loading entire file into memory)
    const stat = fs.statSync(outputPath);
    const stream = fs.createReadStream(outputPath);

    // Convert Node ReadStream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          controller.enqueue(new Uint8Array(Buffer.from(chunk)));
        });
        stream.on("end", () => {
          controller.close();
          // Cleanup after streaming
          setTimeout(() => cleanupTempDir(outputPath), 3000);
        });
        stream.on("error", (err) => {
          controller.error(err);
          cleanupTempDir(outputPath);
        });
      },
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="quran_${chapter}_${from}-${to}.mp4"`,
        "Content-Length": String(stat.size),
      },
    });
  } catch (error: any) {
    console.error("Video generation error:", error?.message, error?.stack);
    if (outputPath) cleanupTempDir(outputPath);
    else if (tmpDir)
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    return NextResponse.json(
      {
        error: error?.message || "Video generation failed",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
