"use client"

import { useCallback, useRef, useEffect } from "react"

/**
 * HTML5 <audio>-based player for cross-origin audio URLs (Quran CDN).
 * Replaces Web Audio API fetch approach which fails due to CORS.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const onEndedRef = useRef<(() => void) | null>(null)

  // Create the audio element once
  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, [])

  const play = useCallback(
    async (url: string, onEnded?: () => void): Promise<void> => {
      const audio = audioRef.current
      if (!audio) return

      onEndedRef.current = onEnded ?? null

      // Stop any currently playing audio
      audio.pause()
      audio.currentTime = 0

      audio.src = url
      audio.load()

      try {
        await audio.play()
      } catch (err) {
        console.error("Audio playback failed:", err)
      }
    },
    []
  )

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }, [])

  const getDuration = useCallback((): number => {
    const audio = audioRef.current
    return audio && isFinite(audio.duration) ? audio.duration : 0
  }, [])

  // Wire up the ended event
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (onEndedRef.current) {
        onEndedRef.current()
      }
    }

    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  return { play, stop, getDuration }
}
