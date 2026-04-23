"use client"

import { useCallback, useRef } from "react"
import { useEditorStore } from "@/lib/store/editorStore"
import { useQuranData } from "./useQuranData"
import { exportVideo, exportMp4 } from "@/lib/video/export"
import type { EditorConfig } from "@/types/editor"

export function useExport() {
  const exportState = useEditorStore((s) => s.exportState)
  const setExportState = useEditorStore((s) => s.setExportState)
  const resetExportState = useEditorStore((s) => s.resetExportState)
  const { selectedVerses } = useQuranData()

  // Store the last WebM blob for MP4 conversion
  const lastWebmBlobRef = useRef<Blob | null>(null)

  const startExport = useCallback(
    async (videoEl: HTMLVideoElement | null) => {
      if (selectedVerses.length === 0) return

      try {
        // Use getState() to extract a snapshot of the current config
        // This avoids subscribing to the full store (which would re-render on every change)
        const s = useEditorStore.getState()
        const config: EditorConfig = {
          chapterId: s.chapterId,
          startAyah: s.startAyah,
          endAyah: s.endAyah,
          reciterId: s.reciterId,
          showTranslation: s.showTranslation,
          translationId: s.translationId,
          showVerseNumber: s.showVerseNumber,
          aspectRatio: s.aspectRatio,
          durationPerVerse: s.durationPerVerse,
          backgroundType: s.backgroundType,
          pixabayVideoUrl: s.pixabayVideoUrl,
          gradientPreset: s.gradientPreset,
          backgroundDimness: s.backgroundDimness,
          backgroundBlur: s.backgroundBlur,
          font: s.font,
          fontSize: s.fontSize,
          textColor: s.textColor,
          textShadow: s.textShadow,
          textShadowColor: s.textShadowColor,
          textShadowBlur: s.textShadowBlur,
          textAlignment: s.textAlignment,
          overlayGradient: s.overlayGradient,
          overlayIntensity: s.overlayIntensity,
          kenBurns: s.kenBurns,
          kenBurnsDirection: s.kenBurnsDirection,
          verseTransition: s.verseTransition,
          textAnimation: s.textAnimation,
          vignette: s.vignette,
          vignetteIntensity: s.vignetteIntensity,
          particles: s.particles,
          particleDensity: s.particleDensity,
        }

        const blob = await exportVideo({
          config,
          verses: selectedVerses,
          videoEl,
          onStateChange: setExportState,
        })
        lastWebmBlobRef.current = blob
      } catch (err) {
        setExportState({
          status: "error",
          error: err instanceof Error ? err.message : "Export failed",
        })
      }
    },
    [selectedVerses, setExportState]
  )

  const startMp4Export = useCallback(async () => {
    const webmBlob = lastWebmBlobRef.current
    if (!webmBlob) {
      setExportState({
        status: "error",
        error: "No WebM file available. Please export as WebM first.",
      })
      return
    }

    try {
      setExportState({ status: "transcoding" })
      await exportMp4(webmBlob)
      setExportState({ status: "done", progress: 100 })
    } catch (err) {
      setExportState({
        status: "error",
        error: err instanceof Error ? err.message : "MP4 export failed",
      })
    }
  }, [setExportState])

  const reset = useCallback(() => {
    resetExportState()
  }, [resetExportState])

  return {
    exportState,
    startExport,
    startMp4Export,
    reset,
  }
}
