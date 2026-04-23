"use client"

import { useEditorStore } from "@/lib/store/editorStore"
import { useExport } from "@/hooks/useExport"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  DownloadCircleIcon,
  AlertIcon,
} from "@hugeicons/core-free-icons"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export function ExportModal({
  open,
  onOpenChange,
  videoRef,
}: ExportModalProps) {
  const { exportState, startExport, reset } = useExport()

  const handleExportWebM = async () => {
    const videoEl = videoRef.current
    await startExport(videoEl)
  }

  const handleClose = () => {
    if (exportState.status === "done" || exportState.status === "error") {
      reset()
    }
    onOpenChange(false)
  }

  const isExporting =
    exportState.status === "preparing" ||
    exportState.status === "recording" ||
    exportState.status === "transcoding"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Download04Icon}
              strokeWidth={2}
              className="size-5"
            />
            Export Video
          </DialogTitle>
          <DialogDescription>
            Generate and download your Quran video
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        {isExporting && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                {exportState.status === "preparing" && "Preparing assets..."}
                {exportState.status === "recording" && "Recording video..."}
                {exportState.status === "transcoding" &&
                  "Transcoding to MP4..."}
              </span>
              <span className="text-muted-foreground">
                {exportState.currentVerse} / {exportState.totalVerses} verses
              </span>
            </div>
            <Progress value={exportState.progress} />
          </div>
        )}

        {/* Done */}
        {exportState.status === "done" && (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">
              ✅ Video exported successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              The WebM file has been downloaded. Use the MP4 option below for
              broader compatibility (requires ~32MB WASM download on first use).
            </p>
          </div>
        )}

        {/* Error */}
        {exportState.status === "error" && (
          <div className="flex flex-col gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <HugeiconsIcon
                icon={AlertIcon}
                strokeWidth={2}
                className="size-4"
              />
              Export failed
            </p>
            <p className="text-xs text-muted-foreground">{exportState.error}</p>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleExportWebM}
            disabled={isExporting}
            className="gap-2"
          >
            <HugeiconsIcon
              icon={Download04Icon}
              strokeWidth={2}
              className="size-4"
            />
            Export WebM — Fast
          </Button>
          <Button
            variant="outline"
            disabled={isExporting || exportState.status !== "done"}
            className="gap-2"
          >
            <HugeiconsIcon
              icon={DownloadCircleIcon}
              strokeWidth={2}
              className="size-4"
            />
            Export MP4 — ~32MB first load
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
