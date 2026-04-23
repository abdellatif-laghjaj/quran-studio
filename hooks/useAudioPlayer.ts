"use client"

import { useCallback, useRef } from "react"
import {
  getAudioContext,
  fetchAudioBuffer,
  decodeAudioData,
} from "@/lib/api/audio"

export function useAudioPlayer() {
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isPlayingRef = useRef(false)

  const play = useCallback(async (url: string): Promise<void> => {
    // Stop any currently playing audio
    stop()

    const audioCtx = getAudioContext()
    if (audioCtx.state === "suspended") {
      await audioCtx.resume()
    }

    try {
      const arrayBuf = await fetchAudioBuffer(url)
      const decoded = await decodeAudioData(arrayBuf)

      const source = audioCtx.createBufferSource()
      source.buffer = decoded
      source.connect(audioCtx.destination)
      source.start()

      currentSourceRef.current = source
      isPlayingRef.current = true

      source.onended = () => {
        isPlayingRef.current = false
        currentSourceRef.current = null
      }
    } catch (err) {
      console.error("Audio playback failed:", err)
    }
  }, [])

  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop()
      } catch {
        // Ignore if already stopped
      }
      currentSourceRef.current = null
      isPlayingRef.current = false
    }
  }, [])

  const isPlaying = useCallback(() => isPlayingRef.current, [])

  return { play, stop, isPlaying }
}
