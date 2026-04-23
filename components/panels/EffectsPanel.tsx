"use client"

import { useEditorStore } from "@/lib/store/editorStore"
import type {
  VerseTransition,
  TextAnimation,
  KenBurnsDirection,
} from "@/types/editor"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SparklesIcon,
  MoveIcon,
  TransitionRightIcon,
  CircleIcon,
} from "@hugeicons/core-free-icons"

const VERSE_TRANSITIONS: { value: VerseTransition; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slideUp", label: "Slide Up" },
]

const TEXT_ANIMATIONS: { value: TextAnimation; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "wordByWord", label: "Word by Word" },
]

const KEN_BURNS_DIRECTIONS: { value: KenBurnsDirection; label: string }[] = [
  { value: "in", label: "Zoom In" },
  { value: "out", label: "Zoom Out" },
  { value: "pan-left", label: "Pan Left" },
  { value: "pan-right", label: "Pan Right" },
]

export function EffectsPanel() {
  const {
    kenBurns,
    kenBurnsDirection,
    verseTransition,
    textAnimation,
    vignette,
    vignetteIntensity,
    particles,
    particleDensity,
    setConfig,
  } = useEditorStore()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Section header */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HugeiconsIcon
            icon={SparklesIcon}
            strokeWidth={2}
            className="size-4"
          />
          <span>Effects</span>
        </div>

        {/* Ken Burns */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs">
            <HugeiconsIcon icon={MoveIcon} strokeWidth={2} className="size-3" />
            Ken Burns
          </Label>
          <Switch
            checked={kenBurns}
            onCheckedChange={(v) => setConfig("kenBurns", v)}
          />
        </div>
        {kenBurns && (
          <div className="flex flex-col gap-1.5 pl-2">
            <Label className="text-xs text-muted-foreground">Direction</Label>
            <Select
              value={kenBurnsDirection}
              onValueChange={(v) =>
                setConfig("kenBurnsDirection", v as KenBurnsDirection)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEN_BURNS_DIRECTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Verse transition */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={TransitionRightIcon}
              strokeWidth={2}
              className="size-3"
            />
            Verse Transition
          </Label>
          <Select
            value={verseTransition}
            onValueChange={(v) =>
              setConfig("verseTransition", v as VerseTransition)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VERSE_TRANSITIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text animation */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Text Animation
          </Label>
          <Select
            value={textAnimation}
            onValueChange={(v) =>
              setConfig("textAnimation", v as TextAnimation)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEXT_ANIMATIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Vignette */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs">
            <HugeiconsIcon
              icon={CircleIcon}
              strokeWidth={2}
              className="size-3"
            />
            Vignette
          </Label>
          <Switch
            checked={vignette}
            onCheckedChange={(v) => setConfig("vignette", v)}
          />
        </div>
        {vignette && (
          <div className="flex flex-col gap-1 pl-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Intensity</Label>
              <span className="text-xs">
                {Math.round(vignetteIntensity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[vignetteIntensity]}
              onValueChange={([v]) => setConfig("vignetteIntensity", v)}
            />
          </div>
        )}

        <Separator />

        {/* Particles */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs">
            <HugeiconsIcon
              icon={SparklesIcon}
              strokeWidth={2}
              className="size-3"
            />
            Particles
          </Label>
          <Switch
            checked={particles}
            onCheckedChange={(v) => setConfig("particles", v)}
          />
        </div>
        {particles && (
          <div className="flex flex-col gap-1 pl-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Density</Label>
              <span className="text-xs">
                {Math.round(particleDensity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[particleDensity]}
              onValueChange={([v]) => setConfig("particleDensity", v)}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
