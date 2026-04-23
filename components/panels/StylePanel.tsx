"use client"

import { useEditorStore } from "@/lib/store/editorStore"
import { QURANIC_FONTS, type QuranicFont } from "@/types/editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TextFontIcon,
  ColorPickerIcon,
  TransparencyIcon,
} from "@hugeicons/core-free-icons"

export function StylePanel() {
  const {
    font,
    fontSize,
    textColor,
    textShadow,
    textShadowColor,
    textShadowBlur,
    textAlignment,
    overlayGradient,
    overlayIntensity,
    setConfig,
  } = useEditorStore()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Section header */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HugeiconsIcon
            icon={TextFontIcon}
            strokeWidth={2}
            className="size-4"
          />
          <span>Style</span>
        </div>

        {/* Font selector */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Font</Label>
          <Select
            value={font}
            onValueChange={(v) => setConfig("font", v as QuranicFont)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QURANIC_FONTS.map((f) => (
                <SelectItem key={f} value={f}>
                  <span style={{ fontFamily: `'${f}', serif` }}>{f}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font size */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Font Size</Label>
            <span className="text-xs font-medium">{fontSize}px</span>
          </div>
          <Slider
            min={24}
            max={96}
            step={2}
            value={[fontSize]}
            onValueChange={([v]) => setConfig("fontSize", v)}
          />
        </div>

        <Separator />

        {/* Text color */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={ColorPickerIcon}
              strokeWidth={2}
              className="size-3"
            />
            Text Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setConfig("textColor", e.target.value)}
              className="size-8 cursor-pointer rounded-lg border border-border"
            />
            <Input
              value={textColor}
              onChange={(e) => setConfig("textColor", e.target.value)}
              className="flex-1 font-mono text-xs"
            />
          </div>
        </div>

        {/* Text alignment */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Text Alignment
          </Label>
          <div className="flex gap-2">
            {(["center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => setConfig("textAlignment", align)}
                className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  textAlignment === align
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-input/20 text-muted-foreground hover:bg-input/40"
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Text shadow */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Text Shadow</Label>
          <Switch
            checked={textShadow}
            onCheckedChange={(v) => setConfig("textShadow", v)}
          />
        </div>
        {textShadow && (
          <div className="flex flex-col gap-2 pl-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <input
                type="color"
                value={textShadowColor}
                onChange={(e) => setConfig("textShadowColor", e.target.value)}
                className="size-6 cursor-pointer rounded border border-border"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Blur</Label>
                <span className="text-xs">{textShadowBlur}px</span>
              </div>
              <Slider
                min={0}
                max={20}
                step={1}
                value={[textShadowBlur]}
                onValueChange={([v]) => setConfig("textShadowBlur", v)}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Overlay gradient */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs">
            <HugeiconsIcon
              icon={TransparencyIcon}
              strokeWidth={2}
              className="size-3"
            />
            Overlay Gradient
          </Label>
          <Switch
            checked={overlayGradient}
            onCheckedChange={(v) => setConfig("overlayGradient", v)}
          />
        </div>
        {overlayGradient && (
          <div className="flex flex-col gap-1 pl-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Intensity</Label>
              <span className="text-xs">
                {Math.round(overlayIntensity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[overlayIntensity]}
              onValueChange={([v]) => setConfig("overlayIntensity", v)}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
