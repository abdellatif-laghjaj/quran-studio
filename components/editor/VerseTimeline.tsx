"use client"

import { useEditorStore } from "@/lib/store/editorStore"
import { useQuranData } from "@/hooks/useQuranData"
import { formatVerseBadge } from "@/lib/canvas/textLayout"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function VerseTimeline() {
  const { currentVerseIndex, setCurrentVerseIndex, setIsPlaying } =
    useEditorStore()
  const { selectedVerses } = useQuranData()

  if (selectedVerses.length === 0) return null

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 px-4 pb-3">
        {selectedVerses.map((verse, i) => {
          const isActive = i === currentVerseIndex

          return (
            <button
              key={verse.verse_key}
              onClick={() => {
                setCurrentVerseIndex(i)
                setIsPlaying(false)
              }}
              className={`flex min-w-[80px] flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-border bg-input/20 text-muted-foreground hover:bg-input/40"
              }`}
            >
              <span className="font-arabic text-base leading-none">
                {formatVerseBadge(verse.verse_number)}
              </span>
              <span className="font-mono text-[10px]">{verse.verse_key}</span>
            </button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
