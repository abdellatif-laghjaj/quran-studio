"use client";

import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Moon, SunMedium, SunDim } from "lucide-react";

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
    <div className="field-group">
      <div className="flex items-center justify-between mb-2">
        <Label>{t(lang, "brightness")}</Label>
        <span className="text-xs font-mono text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full">
          {value}%
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={0}
        max={100}
        step={1}
        className="my-3"
      />

      <div className="brightness-presets">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = Math.abs(value - preset.value) < 10;
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className={`brightness-preset ${isActive ? "active" : ""}`}
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
