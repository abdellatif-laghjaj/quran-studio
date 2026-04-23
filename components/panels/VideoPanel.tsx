"use client"

import { useEditorStore } from "@/lib/store/editorStore"
import { RESOLUTIONS, type AspectRatio } from "@/types/editor"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HugeiconsIcon } from "@hugeicons/react"
import { VideoReplayIcon } from "@hugeicons/core-free-icons"

const ASPECT_RATIOS: { value: AspectRatio; label: string; useCase: string }[] =
  [
    { value: "16:9", label: "16:9", useCase: "YouTube" },
    { value: "9:16", label: "9:16", useCase: "Reels / Shorts" },
    { value: "1:1", label: "1:1", useCase: "Instagram Post" },
    { value: "4:5", label: "4:5", useCase: "IG Feed Portrait" },
  ]

export function VideoPanel() {
  const { aspectRatio, durationPerVerse, setConfig } = useEditorStore()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Section header */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HugeiconsIcon
            icon={VideoReplayIcon}
            strokeWidth={2}
            className="size-4"
          />
          <span>Dimensions</span>
        </div>

        {/* Aspect Ratio Grid */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
          <div className="grid grid-cols-2 gap-2">
            {ASPECT_RATIOS.map((ar) => {
              const res = RESOLUTIONS[ar.value]
              const isActive = aspectRatio === ar.value

              return (
                <button
                  key={ar.value}
                  onClick={() => setConfig("aspectRatio", ar.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-input/20 text-muted-foreground hover:bg-input/40"
                  }`}
                >
                  {/* Mini aspect ratio preview shape */}
                  <div
                    className={`rounded-sm border-2 ${
                      isActive ? "border-primary" : "border-muted-foreground/30"
                    }`}
                    style={{
                      width: `${Math.min(ar.value === "9:16" ? 20 : 36, 36)}px`,
                      height: `${Math.min(ar.value === "9:16" ? 36 : ar.value === "16:9" ? 20 : 30, 36)}px`,
                    }}
                  />
                  <span className="text-sm font-medium">{ar.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {res.w}×{res.h}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {ar.useCase}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Duration per verse */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Duration per Verse
            </Label>
            <span className="text-xs font-medium text-foreground">
              {durationPerVerse === "auto" ? "Auto" : `${durationPerVerse}s`}
            </span>
          </div>
          <Slider
            min={0}
            max={15}
            step={0.5}
            value={[durationPerVerse === "auto" ? 0 : durationPerVerse]}
            onValueChange={([v]) => {
              setConfig("durationPerVerse", v === 0 ? "auto" : v)
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Auto</span>
            <span>15s</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
