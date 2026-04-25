"use client"

import { useEditorStore } from "@/lib/store/editorStore"
import { useQuranData } from "@/hooks/useQuranData"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Quran02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  MicIcon,
} from "@hugeicons/core-free-icons"

export function QuranPanel() {
  const {
    chapterId,
    startAyah,
    endAyah,
    reciterId,
    showTranslation,
    showVerseNumber,
    setConfig,
  } = useEditorStore()

  const {
    chapters,
    chaptersLoading,
    reciters,
    recitersLoading,
    currentChapter,
  } = useQuranData()

  const maxAyah = currentChapter?.verses_count ?? 7
  const maxEnd = Math.min(startAyah + 9, maxAyah)

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Section header */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HugeiconsIcon
            icon={Quran02Icon}
            strokeWidth={2}
            className="size-4"
          />
          <span>Quran</span>
        </div>

        {/* Surah selector */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Surah</Label>
          {chaptersLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              Loading chapters...
            </div>
          ) : (
            <Select
              value={String(chapterId)}
              onValueChange={(v) => {
                const id = parseInt(v, 10)
                const ch = chapters.find((c) => c.id === id)
                setConfig("chapterId", id)
                setConfig("startAyah", 1)
                setConfig("endAyah", Math.min(7, ch?.verses_count ?? 7))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={String(ch.id)}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {ch.id}.
                      </span>
                      <span className="font-arabic">{ch.name_arabic}</span>
                      <span>{ch.translated_name?.name ?? ch.name_simple}</span>
                      <span className="text-xs text-muted-foreground">
                        ({ch.verses_count})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Ayah range */}
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label className="flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                strokeWidth={2}
                className="size-3"
              />
              Start Ayah
            </Label>
            <Input
              type="number"
              min={1}
              max={maxAyah}
              value={startAyah}
              onChange={(e) => {
                const val = Math.max(
                  1,
                  Math.min(parseInt(e.target.value, 10) || 1, maxAyah)
                )
                setConfig("startAyah", val)
                if (endAyah < val) setConfig("endAyah", val)
                if (endAyah > val + 9)
                  setConfig("endAyah", Math.min(val + 9, maxAyah))
              }}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label className="flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="size-3"
              />
              End Ayah
            </Label>
            <Input
              type="number"
              min={startAyah}
              max={maxEnd}
              value={endAyah}
              onChange={(e) => {
                const val = Math.max(
                  startAyah,
                  Math.min(parseInt(e.target.value, 10) || startAyah, maxEnd)
                )
                setConfig("endAyah", val)
              }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Max 10 ayahs · Selected: {endAyah - startAyah + 1}
        </p>

        <Separator />

        {/* Reciter */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={MicIcon} strokeWidth={2} className="size-3" />
            Reciter
          </Label>
          {recitersLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              Loading reciters...
            </div>
          ) : (
            <Select
              value={String(reciterId)}
              onValueChange={(v) => setConfig("reciterId", parseInt(v, 10))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reciters.slice(0, 20).map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    <span className="flex items-center gap-2">
                      <span>{r.translated_name?.name ?? r.reciter_name}</span>
                      {r.style && (
                        <span className="text-xs text-muted-foreground">
                          ({r.style})
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Separator />

        {/* Toggles */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Translation</Label>
          <Switch
            checked={showTranslation}
            onCheckedChange={(v) => setConfig("showTranslation", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Verse Number</Label>
          <Switch
            checked={showVerseNumber}
            onCheckedChange={(v) => setConfig("showVerseNumber", v)}
          />
        </div>
      </div>
    </ScrollArea>
  )
}
