import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function GET() {
  const info: Record<string, unknown> = {};

  // 1) Check FFmpeg
  try {
    const cmd =
      process.platform === "win32" ? "where ffmpeg" : "command -v ffmpeg";
    info.ffmpegPath = execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    info.ffmpegPath = "NOT FOUND";
  }

  // 2) FFmpeg version + build config
  try {
    info.ffmpegVersion = execSync("ffmpeg -version 2>&1 | head -1", {
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch (e: any) {
    info.ffmpegVersion = e.message;
  }

  // 3) Check libass / harfbuzz / fribidi
  try {
    const conf = execSync("ffmpeg -buildconf 2>&1", {
      encoding: "utf8",
      timeout: 5000,
    });
    info.hasLibass = conf.includes("libass");
    info.hasHarfbuzz = conf.includes("harfbuzz");
    info.hasFribidi = conf.includes("fribidi");
    info.hasFreetype = conf.includes("freetype");
    info.hasFontconfig = conf.includes("fontconfig");
  } catch (e: any) {
    info.buildconf = e.message;
  }

  // 4) Check subtitles filter
  try {
    const filters = execSync("ffmpeg -filters 2>&1 | grep -i subtitle", {
      encoding: "utf8",
      timeout: 5000,
    });
    info.subtitlesFilter = filters.trim() || "NOT FOUND";
  } catch {
    info.subtitlesFilter = "NOT FOUND";
  }

  // 5) Check font files
  try {
    const fontsDir = path.join(process.cwd(), "public", "fonts");
    info.cwd = process.cwd();
    info.fontsDirExists = fs.existsSync(fontsDir);
    if (info.fontsDirExists) {
      info.fontFiles = fs
        .readdirSync(fontsDir)
        .filter((f) => f.endsWith(".ttf"));
    }
  } catch (e: any) {
    info.fontsError = e.message;
  }

  // 6) System fonts
  try {
    info.systemFonts = execSync("fc-list | head -20", {
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch (e: any) {
    info.systemFonts = e.message;
  }

  // 7) Quick ASS test - write a minimal ASS file and try to render 1 frame
  try {
    const testAss = "/tmp/test.ass";
    const testOut = "/tmp/test.png";
    fs.writeFileSync(
      testAss,
      `[Script Info]
ScriptType: v4.00+
PlayResX: 320
PlayResY: 240

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Amiri,24,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,2,1,5,10,10,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:01.00,Default,,0,0,0,,Test
`,
      "utf8",
    );

    const fontsDir = path
      .join(process.cwd(), "public", "fonts")
      .replace(/\\/g, "/");
    const assEsc = testAss.replace(/\\/g, "/");
    const result = execSync(
      `ffmpeg -y -f lavfi -i "color=c=black:s=320x240:d=1" -vf "subtitles='${assEsc}':fontsdir='${fontsDir}'" -frames:v 1 ${testOut} 2>&1`,
      { encoding: "utf8", timeout: 15000 },
    );
    info.assTestResult = "SUCCESS";
    info.assTestOutput = result.substring(0, 500);
    // cleanup
    try {
      fs.unlinkSync(testAss);
      fs.unlinkSync(testOut);
    } catch {}
  } catch (e: any) {
    info.assTestResult = "FAILED";
    info.assTestError = e.message?.substring(0, 1000);
  }

  // 8) Drawtext test with Arabic text + text_shaping
  try {
    const testOut2 = "/tmp/test_dt.png";
    const fontPath = path.join(process.cwd(), "public", "fonts", "Amiri.ttf");
    info.fontPathExists = fs.existsSync(fontPath);

    const result2 = execSync(
      `ffmpeg -y -f lavfi -i "color=c=black:s=320x240:d=1" -vf "drawtext=text='بسم الله الرحمن الرحيم':fontfile='${fontPath}':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text_shaping=1" -frames:v 1 ${testOut2} 2>&1`,
      { encoding: "utf8", timeout: 15000 },
    );
    info.drawtextTest = "SUCCESS";
    info.drawtextOutput = result2.substring(result2.length - 300);
    try {
      fs.unlinkSync(testOut2);
    } catch {}
  } catch (e: any) {
    info.drawtextTest = "FAILED";
    info.drawtextError = e.message?.substring(0, 1000);
    info.drawtextStderr = e.stderr?.substring(0, 1000);
  }

  return NextResponse.json(info, { status: 200 });
}
