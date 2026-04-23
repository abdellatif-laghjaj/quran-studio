"use client"

import { useRef, useState } from "react"
import { ConfigPanel } from "@/components/editor/ConfigPanel"
import { PreviewCanvas } from "@/components/editor/PreviewCanvas"
import { VerseTimeline } from "@/components/editor/VerseTimeline"
import { ExportModal } from "@/components/editor/ExportModal"
import { StylePanel } from "@/components/panels/StylePanel"
import { EffectsPanel } from "@/components/panels/EffectsPanel"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  GithubIcon,
  HelpCircleIcon,
  TextFontIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

export default function EditorPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="flex h-svh flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Ayah</span>
            <span className="text-foreground">Vid</span>
          </h1>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              window.open("https://github.com", "_blank", "noopener")
            }
          >
            <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setExportOpen(true)}
          >
            <HugeiconsIcon
              icon={Download04Icon}
              strokeWidth={2}
              className="size-4"
            />
            Export
          </Button>
        </div>
      </header>

      {/* Main content: 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Config */}
        <div className="w-72 shrink-0 border-e border-border">
          <ConfigPanel />
        </div>

        {/* Center — Preview */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center p-4">
            <PreviewCanvas videoRef={videoRef} />
          </div>

          {/* Bottom — Verse Timeline */}
          <div className="border-t border-border">
            <VerseTimeline />
          </div>
        </div>

        {/* Right panel — Style & Effects */}
        <div className="hidden w-64 shrink-0 border-s border-border lg:block">
          <RightPanel />
        </div>
      </div>

      {/* Export modal */}
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        videoRef={videoRef}
      />
    </div>
  )
}

function RightPanel() {
  const [tab, setTab] = useState<"style" | "effects">("style")

  return (
    <div className="flex h-full flex-col">
      {/* Mini tab switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("style")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
            tab === "style"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon
            icon={TextFontIcon}
            strokeWidth={2}
            className="size-3.5"
          />
          Style
        </button>
        <button
          onClick={() => setTab("effects")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
            tab === "effects"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon
            icon={SparklesIcon}
            strokeWidth={2}
            className="size-3.5"
          />
          Effects
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {tab === "style" ? <StylePanel /> : <EffectsPanel />}
      </div>
    </div>
  )
}
