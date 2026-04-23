import type { EditorConfig, ExportState } from "@/types/editor"
import type { Verse } from "@/types/quran"
import { RESOLUTIONS } from "@/types/editor"
import { renderFrame, loadFont } from "@/lib/canvas/renderer"
import { resetParticleCache } from "@/lib/canvas/renderer"
import { VideoRecorder, downloadBlob } from "./recorder"
import {
  getAudioContext,
  fetchAudioBuffer,
  decodeAudioData,
} from "@/lib/api/audio"

export interface ExportOptions {
  config: EditorConfig
  verses: Verse[]
  videoEl: HTMLVideoElement | null
  onStateChange: (state: Partial<ExportState>) => void
}

/**
 * Full export pipeline — renders all verses to canvas and records as video.
 */
export async function exportVideo(options: ExportOptions): Promise<Blob> {
  const { config, verses, videoEl, onStateChange } = options
  const { w, h } = RESOLUTIONS[config.aspectRatio]

  resetParticleCache()

  onStateChange({
    status: "preparing",
    progress: 0,
    totalVerses: verses.length,
  })

  // 1. Load font
  await loadFont(config.font)

  // 2. Prefetch audio
  const audioCtx = getAudioContext()
  const dest = audioCtx.createMediaStreamDestination()
  const audioBuffers: AudioBuffer[] = []

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i]
    const verseNum = verse.verse_number
    const url = `https://cdn.islamic.network/quran/audio/128/${config.reciterId}/${verseNum}.mp3`

    try {
      const arrayBuf = await fetchAudioBuffer(url)
      const decoded = await decodeAudioData(arrayBuf)
      audioBuffers.push(decoded)
    } catch (err) {
      console.warn(`Failed to fetch audio for verse ${verseNum}:`, err)
      // Create a silent buffer as fallback
      const silentBuffer = audioCtx.createBuffer(
        1,
        audioCtx.sampleRate * 3,
        audioCtx.sampleRate
      )
      audioBuffers.push(silentBuffer)
    }
  }

  // 3. Setup canvas
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  // 4. Setup recorder
  const recorder = new VideoRecorder()
  await recorder.start({
    canvas,
    audioStream: dest.stream,
    framerate: 30,
  })

  onStateChange({ status: "recording", progress: 0 })

  // 5. Render each verse
  const startTime = performance.now()

  for (let i = 0; i < verses.length; i++) {
    onStateChange({
      currentVerse: i + 1,
      progress: (i / verses.length) * 100,
    })

    const verse = verses[i]
    const audioBuffer = audioBuffers[i]
    const duration =
      typeof config.durationPerVerse === "number"
        ? config.durationPerVerse
        : audioBuffer.duration + 1 // auto: audio + 1s padding

    // Play audio
    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(dest)
    source.start()

    // Render frames for this verse
    const verseStartTime = performance.now()
    const durationMs = duration * 1000

    await new Promise<void>((resolve) => {
      function frame() {
        const elapsed = performance.now() - verseStartTime
        const progress = Math.min(elapsed / durationMs, 1)

        renderFrame(
          ctx,
          config,
          verse,
          videoEl,
          progress,
          (performance.now() - startTime) / 1000
        )

        if (progress < 1) {
          requestAnimationFrame(frame)
        } else {
          resolve()
        }
      }

      frame()
    })

    // Small gap between verses
    await new Promise((r) => setTimeout(r, 200))
  }

  // 6. Stop recording and get blob
  const blob = await recorder.stop()

  onStateChange({ status: "done", progress: 100 })

  // 7. Download WebM
  const surahName = `surah-${config.chapterId}`
  downloadBlob(
    blob,
    `ayahvid-${surahName}-${config.aspectRatio.replace(":", "x")}.webm`
  )

  return blob
}

/**
 * Export as MP4 using FFmpeg WASM.
 * This is optional and requires loading the WASM binary (~32MB).
 * If @ffmpeg/ffmpeg is not installed, throws a user-friendly error.
 */
export async function exportMp4(webmBlob: Blob): Promise<void> {
  let FFmpegClass: typeof import("@ffmpeg/ffmpeg").FFmpeg | null = null
  let fetchFileFn: typeof import("@ffmpeg/util").fetchFile | null = null

  try {
    const ffmpegModule = await import("@ffmpeg/ffmpeg")
    const utilModule = await import("@ffmpeg/util")
    FFmpegClass = ffmpegModule.FFmpeg
    fetchFileFn = utilModule.fetchFile
  } catch {
    throw new Error(
      "MP4 export requires @ffmpeg/ffmpeg and @ffmpeg/util packages. " +
        "Install them with: bun add @ffmpeg/ffmpeg @ffmpeg/util"
    )
  }

  if (!FFmpegClass || !fetchFileFn) {
    throw new Error("Failed to load FFmpeg modules")
  }

  const ffmpeg = new FFmpegClass()
  await ffmpeg.load()

  const inputData = await fetchFileFn(webmBlob)
  await ffmpeg.writeFile("input.webm", inputData)

  await ffmpeg.exec([
    "-i",
    "input.webm",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "output.mp4",
  ])

  const data = await ffmpeg.readFile("output.mp4")
  const uint8 = data as Uint8Array
  const blob = new Blob([new Uint8Array(uint8)], { type: "video/mp4" })

  downloadBlob(blob, "ayahvid-export.mp4")
}
