"use client"

import { useCallback, useEffect, useRef } from "react"
import { useEditorStore } from "@/lib/store/editorStore"
import { useQuranData } from "@/hooks/useQuranData"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { renderFrame, loadFont } from "@/lib/canvas/renderer"
import { resetParticleCache } from "@/lib/canvas/renderer"
import { RESOLUTIONS } from "@/types/editor"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlayIcon,
  PauseIcon,
  PreviousIcon,
  NextIcon,
} from "@hugeicons/core-free-icons"

interface PreviewCanvasProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>
}

export function PreviewCanvas({
  videoRef: externalVideoRef,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  // Use external ref if provided (for export), otherwise internal
  const videoRef = externalVideoRef ?? internalVideoRef
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  // Guard to prevent double-triggering verse advance (both audio ended + elapsed timer)
  const justAdvancedRef = useRef(false)

  const config = useEditorStore()
  const {
    font,
    aspectRatio,
    backgroundType,
    pixabayVideoUrl,
    reciterId,
    durationPerVerse,
    particles,
    particleDensity,
    currentVerseIndex,
    setCurrentVerseIndex,
    isPlaying,
    setIsPlaying,
  } = config

  const { selectedVerses, versesLoading, getAudioUrl } = useQuranData()
  const { play, stop, getDuration } = useAudioPlayer()

  const currentVerse = selectedVerses[currentVerseIndex] ?? null

  // Load font when it changes
  useEffect(() => {
    loadFont(font)
  }, [font])

  // Load background video when URL changes
  useEffect(() => {
    if (backgroundType === "video" && pixabayVideoUrl && videoRef.current) {
      const video = videoRef.current
      video.src = pixabayVideoUrl
      video.crossOrigin = "anonymous"
      video.loop = true
      video.muted = true
      video.play().catch(() => {})
    }
  }, [backgroundType, pixabayVideoUrl])

  // Reset particle cache when effects change
  useEffect(() => {
    resetParticleCache()
  }, [particles, particleDensity, aspectRatio])

  // Get verse duration
  const getVerseDuration = useCallback(
    (verseIdx: number): number => {
      if (typeof durationPerVerse === "number") {
        return durationPerVerse
      }
      // "auto" mode: use the current audio duration if loaded
      const verse = selectedVerses[verseIdx]
      if (!verse) return 5
      const dur = getDuration()
      return dur > 0 ? dur : 5
    },
    [durationPerVerse, selectedVerses, getDuration]
  )

  // Advance to next verse — triggered by audio ended event or elapsed timer
  const advanceVerse = useCallback(() => {
    if (justAdvancedRef.current) return // guard against double-trigger

    if (currentVerseIndex < selectedVerses.length - 1) {
      justAdvancedRef.current = true
      setTimeout(() => {
        justAdvancedRef.current = false
      }, 200)

      const nextIdx = currentVerseIndex + 1
      setCurrentVerseIndex(nextIdx)
      startTimeRef.current = performance.now()

      // Play audio for the new verse
      const nextVerse = selectedVerses[nextIdx]
      if (nextVerse) {
        const url = getAudioUrl(nextVerse.verse_number)
        if (url) play(url, advanceVerse)
      }
    } else {
      // Reached the end -- stop playback
      stop()
      setIsPlaying(false)
    }
  }, [
    currentVerseIndex,
    selectedVerses.length,
    setCurrentVerseIndex,
    play,
    stop,
    setIsPlaying,
    selectedVerses,
    getAudioUrl,
  ])

  // Render loop
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentVerse) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const elapsed = (performance.now() - startTimeRef.current) / 1000
    const verseDuration = getVerseDuration(currentVerseIndex)
    const progress = isPlaying ? Math.min(elapsed / verseDuration, 1) : 0.3

    // Elapsed timer check as fallback -- skip if we just advanced via audio ended event
    if (
      isPlaying &&
      elapsed >= verseDuration &&
      currentVerseIndex < selectedVerses.length - 1 &&
      !justAdvancedRef.current
    ) {
      advanceVerse()
      return
    }

    renderFrame(ctx, config, currentVerse, videoRef.current, progress, elapsed)

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(renderPreview)
    }
  }, [
    config,
    currentVerse,
    isPlaying,
    currentVerseIndex,
    getVerseDuration,
    advanceVerse,
    selectedVerses.length,
  ])

  // Start/stop animation and audio
  useEffect(() => {
    if (isPlaying && currentVerse) {
      startTimeRef.current = performance.now()
      animFrameRef.current = requestAnimationFrame(renderPreview)

      // Play audio for current verse
      const url = getAudioUrl(currentVerse.verse_number)
      // Pass advanceVerse as onEnded callback so audio ending triggers verse advance
      if (url) play(url, advanceVerse)
    } else {
      cancelAnimationFrame(animFrameRef.current)
      if (!isPlaying) {
        stop()
        // Render a static frame
        const canvas = canvasRef.current
        if (canvas && currentVerse) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            renderFrame(ctx, config, currentVerse, videoRef.current, 0.3, 0)
          }
        }
      }
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [
    isPlaying,
    currentVerse,
    renderPreview,
    play,
    stop,
    config,
    reciterId,
    currentVerseIndex,
    advanceVerse,
  ])

  // Re-render when config or verse changes (static preview)
  useEffect(() => {
    if (!isPlaying && canvasRef.current && currentVerse) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        renderFrame(ctx, config, currentVerse, videoRef.current, 0.3, 0)
      }
    }
  }, [config, currentVerse, isPlaying])

  const handlePlayPause = () => {
    if (isPlaying) {
      stop()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  const handlePrev = () => {
    stop()
    setIsPlaying(false)
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1)
    }
  }

  const handleNext = () => {
    stop()
    setIsPlaying(false)
    if (currentVerseIndex < selectedVerses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1)
    }
  }

  const { w, h } = RESOLUTIONS[aspectRatio]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      {/* Canvas container */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-black/40 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={Math.round(640 * (h / w))}
          className="max-h-[60vh] w-auto"
        />
        {/* Hidden video element for background */}
        <video
          ref={videoRef}
          className="hidden"
          muted
          loop
          playsInline
          crossOrigin="anonymous"
        />
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handlePrev}
          disabled={currentVerseIndex === 0}
        >
          <HugeiconsIcon icon={PreviousIcon} strokeWidth={2} />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handlePlayPause}
          disabled={!currentVerse}
          className="gap-1.5"
        >
          <HugeiconsIcon
            icon={isPlaying ? PauseIcon : PlayIcon}
            strokeWidth={2}
            className="size-4"
          />
          {isPlaying ? "Pause" : "Play Preview"}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleNext}
          disabled={currentVerseIndex >= selectedVerses.length - 1}
        >
          <HugeiconsIcon icon={NextIcon} strokeWidth={2} />
        </Button>
      </div>

      {/* Verse info */}
      <div className="text-center text-xs text-muted-foreground">
        {currentVerse ? (
          <>
            Verse {currentVerse.verse_number} ({currentVerse.verse_key}) ·{" "}
            {currentVerseIndex + 1} / {selectedVerses.length}
          </>
        ) : versesLoading ? (
          "Loading verses..."
        ) : (
          "No verses selected"
        )}
      </div>
    </div>
  )
}
