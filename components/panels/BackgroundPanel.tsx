"use client"
import { useEditorStore } from "@/lib/store/editorStore"
import { usePixabaySearch } from "@/hooks/usePixabaySearch"
import { GRADIENT_PRESETS } from "@/types/editor"
import { getBestVideoUrl } from "@/lib/api/pixabay"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image02Icon,
  SearchIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons"

export function BackgroundPanel() {
  const {
    backgroundType,
    pixabayVideoUrl,
    gradientPreset,
    backgroundDimness,
    backgroundBlur,
    setConfig,
  } = useEditorStore()

  const {
    query,
    setQuery,
    results,
    loading,
    searchCategory,
    hasApiKey,
    categories,
  } = usePixabaySearch()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Section header */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HugeiconsIcon
            icon={Image02Icon}
            strokeWidth={2}
            className="size-4"
          />
          <span>Background</span>
        </div>

        {/* Background type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setConfig("backgroundType", "gradient")}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
              backgroundType === "gradient"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-input/20 text-muted-foreground hover:bg-input/40"
            }`}
          >
            <HugeiconsIcon
              icon={PaintBoardIcon}
              strokeWidth={2}
              className="mb-1 size-4"
            />
            <div>Gradient</div>
          </button>
          <button
            onClick={() => setConfig("backgroundType", "video")}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
              backgroundType === "video"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-input/20 text-muted-foreground hover:bg-input/40"
            }`}
          >
            <HugeiconsIcon
              icon={Image02Icon}
              strokeWidth={2}
              className="mb-1 size-4"
            />
            <div>Video</div>
          </button>
        </div>

        {backgroundType === "gradient" ? (
          /* Gradient picker */
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Gradient Preset
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((colors, i) => (
                <button
                  key={i}
                  onClick={() => setConfig("gradientPreset", i)}
                  className={`h-12 rounded-xl border-2 transition-all ${
                    gradientPreset === i
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${colors.join(", ")})`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Pixabay video search */
          <div className="flex flex-col gap-3">
            {hasApiKey ? (
              <>
                <div className="relative">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    strokeWidth={2}
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="ps-9"
                    placeholder="Search videos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => searchCategory(cat)}
                      className="rounded-full border border-border bg-input/20 px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-input/40"
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Results grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="size-5" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {results.slice(0, 8).map((hit) => {
                      const url = getBestVideoUrl(hit, 640)
                      const isSelected = pixabayVideoUrl === url
                      return (
                        <button
                          key={hit.id}
                          onClick={() => setConfig("pixabayVideoUrl", url)}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <video
                            src={url}
                            muted
                            loop
                            className="aspect-video w-full object-cover"
                            onMouseOver={(e) => e.currentTarget.play()}
                            onMouseOut={(e) => {
                              e.currentTarget.pause()
                              e.currentTarget.currentTime = 0
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                            {hit.tags.split(",").slice(0, 2).join(", ")}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                <p>Pixabay API key not configured.</p>
                <p className="mt-1">
                  Add{" "}
                  <code className="rounded bg-muted px-1 font-mono">
                    NEXT_PUBLIC_PIXABAY_API_KEY
                  </code>{" "}
                  to{" "}
                  <code className="rounded bg-muted px-1 font-mono">
                    .env.local
                  </code>
                </p>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Dimness */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Background Dimness
            </Label>
            <span className="text-xs font-medium">
              {Math.round(backgroundDimness * 100)}%
            </span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={[backgroundDimness]}
            onValueChange={([v]) => setConfig("backgroundDimness", v)}
          />
        </div>

        {/* Blur */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Background Blur
            </Label>
            <span className="text-xs font-medium">{backgroundBlur}px</span>
          </div>
          <Slider
            min={0}
            max={20}
            step={1}
            value={[backgroundBlur]}
            onValueChange={([v]) => setConfig("backgroundBlur", v)}
          />
        </div>
      </div>
    </ScrollArea>
  )
}
