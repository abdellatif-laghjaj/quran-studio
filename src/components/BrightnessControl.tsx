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
        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {value}%
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={0}
        max={100}
        step={1}
        className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:border-background"
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
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:bg-accent",
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
