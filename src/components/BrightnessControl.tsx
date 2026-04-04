"use client";

import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Moon, SunMedium, SunDim } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (val: number) => void;
  lang: Lang;
}

const PRESETS = [
  { value: 15, icon: Moon, labelKey: "dark" as const },
  { value: 45, icon: SunDim, labelKey: "medium" as const },
  { value: 75, icon: SunMedium, labelKey: "bright" as const },
];

export default function BrightnessControl({ value, onChange, lang }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{t(lang, "brightness")}</Label>
        <span className="text-xs font-mono text-[var(--gold-500)] bg-[var(--gold-500)]/10 px-2 py-0.5 rounded-full">
          {value}%
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={0}
        max={100}
        step={1}
        className="[&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[var(--gold-600)] [&_[data-slot=slider-range]]:to-[var(--gold-400)] [&_[data-slot=slider-thumb]]:bg-[var(--gold-500)] [&_[data-slot=slider-thumb]]:border-background"
      />

      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = Math.abs(value - preset.value) < 10;
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border text-xs font-medium transition-all",
                isActive
                  ? "border-[var(--gold-500)] bg-[var(--gold-500)]/10 text-[var(--gold-600)] dark:text-[var(--gold-500)]"
                  : "border-border bg-card text-muted-foreground hover:border-[var(--gold-600)] hover:bg-accent",
              )}
            >
              <Icon className="size-4" />
              <span>{t(lang, preset.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
