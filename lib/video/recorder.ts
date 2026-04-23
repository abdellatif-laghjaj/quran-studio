/**
 * MediaRecorder pipeline — captures canvas + audio streams into a WebM Blob.
 */

export interface RecorderOptions {
  canvas: HTMLCanvasElement
  audioStream: MediaStream | null
  framerate?: number
  onProgress?: (progress: number) => void
}

export class VideoRecorder {
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private combinedStream: MediaStream | null = null

  async start(options: RecorderOptions): Promise<void> {
    const { canvas, audioStream, framerate = 30 } = options

    const videoStream = canvas.captureStream(framerate)
    const tracks: MediaStreamTrack[] = [videoStream.getVideoTracks()[0]]

    if (audioStream) {
      tracks.push(...audioStream.getAudioTracks())
    }

    this.combinedStream = new MediaStream(tracks)

    // Prefer VP9+Opus in WebM
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ]

    let selectedMime = ""
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime
        break
      }
    }

    if (!selectedMime) {
      throw new Error("No supported MediaRecorder MIME type found")
    }

    this.recorder = new MediaRecorder(this.combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 5_000_000,
    })

    this.chunks = []

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    this.recorder.start(100) // Collect chunks every 100ms
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) {
        reject(new Error("Recorder not started"))
        return
      }

      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "video/webm" })
        resolve(blob)
      }

      this.recorder.onerror = (e) => {
        reject(e)
      }

      this.recorder.stop()

      // Stop all tracks
      if (this.combinedStream) {
        this.combinedStream.getTracks().forEach((t) => t.stop())
      }
    })
  }

  isRecording(): boolean {
    return this.recorder?.state === "recording"
  }
}

/**
 * Download a Blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
