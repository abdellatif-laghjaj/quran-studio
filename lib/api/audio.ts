let audioCtx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export async function fetchAudioBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch audio: ${res.status}`)
  }
  return res.arrayBuffer()
}

export async function decodeAudioData(
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
  const ctx = getAudioContext()
  return ctx.decodeAudioData(arrayBuffer)
}

export function getAudioDuration(audioBuffer: AudioBuffer): number {
  return audioBuffer.duration
}
