"use client"

import { useCallback } from "react"
import { useEditorStore } from "@/lib/store/editorStore"
import { useQuranData } from "./useQuranData"
import { exportVideo, exportMp4 } from "@/lib/video/export"

export function useExport() {
  const { config, exportState, setExportState, resetExportState } =
    useEditorStore()
  const { selectedVerses } = useQuranData()

  const startExport = useCallback(
    async (videoEl: HTMLVideoElement | null) => {
      if (selectedVerses.length === 0) return

      try {
        const blob = await exportVideo({
          config,
          verses: selectedVerses,
          videoEl,
          onStateChange: setExportState,
        })
      // Store the blob for MP4 export
      lastWebmBlobRef.current = blob
      } catch (err) {
        setExportState({
          status: "error",
          error: err instanceof Error ? err.message : "Export failed",
        })
      }
    },
    [config, selectedVerses, setExportState]
  )

  const startMp4Export = useCallback(
    async (webmBlob: Blob) => {
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
    },
    [setExportState]
  )

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
