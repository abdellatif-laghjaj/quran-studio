"use client"

import { useState } from "react"
import { QuranPanel } from "@/components/panels/QuranPanel"
import { VideoPanel } from "@/components/panels/VideoPanel"
import { BackgroundPanel } from "@/components/panels/BackgroundPanel"
import { StylePanel } from "@/components/panels/StylePanel"
import { EffectsPanel } from "@/components/panels/EffectsPanel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Quran02Icon,
  VideoReplayIcon,
  Image02Icon,
  TextFontIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

const TAB_ITEMS = [
  { value: "quran", label: "Quran", icon: Quran02Icon },
  { value: "video", label: "Video", icon: VideoReplayIcon },
  { value: "background", label: "Background", icon: Image02Icon },
  { value: "style", label: "Style", icon: TextFontIcon },
  { value: "effects", label: "Effects", icon: SparklesIcon },
] as const

export function ConfigPanel() {
  const [activeTab, setActiveTab] = useState("quran")

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full flex-col"
    >
      {/* Vertical icon tabs */}
      <TabsList
        variant="line"
        className="flex h-auto w-full shrink-0 flex-row items-center justify-start gap-0 border-b border-border px-2 py-0"
      >
        {TAB_ITEMS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex flex-col items-center gap-0.5 rounded-none border-b-2 border-transparent px-3 py-2.5 text-[10px] data-active:border-primary data-active:text-foreground"
          >
            <HugeiconsIcon icon={tab.icon} strokeWidth={2} className="size-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        <TabsContent value="quran" className="m-0 h-full">
          <QuranPanel />
        </TabsContent>
        <TabsContent value="video" className="m-0 h-full">
          <VideoPanel />
        </TabsContent>
        <TabsContent value="background" className="m-0 h-full">
          <BackgroundPanel />
        </TabsContent>
        <TabsContent value="style" className="m-0 h-full">
          <StylePanel />
        </TabsContent>
        <TabsContent value="effects" className="m-0 h-full">
          <EffectsPanel />
        </TabsContent>
      </div>
    </Tabs>
  )
}
