"use client";

import { Lang, t } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TreePine, Waves, Cloud, Sun, Trees } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "nature" | "ocean" | "sky" | "desert" | "forest";

interface Props {
  selected: Theme;
  onChange: (theme: Theme) => void;
  lang: Lang;
}

const themes: { key: Theme; icon: React.ElementType }[] = [
  { key: "nature", icon: TreePine },
  { key: "ocean", icon: Waves },
  { key: "sky", icon: Cloud },
  { key: "desert", icon: Sun },
  { key: "forest", icon: Trees },
];

export default function ThemeSelector({ selected, onChange, lang }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">
        {t(lang, "backgroundTheme")}
      </Label>
      <div className="grid grid-cols-5 gap-1.5">
        {themes.map(({ key }) => {
          const active = selected === key;
          const imgPath = `/pimages/${key}.jpg`;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={cn(
                "relative overflow-hidden rounded-lg border p-0 text-[12px] font-medium transition-all focus:outline-none",
                active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border bg-card hover:shadow-lg",
              )}
            >
              <div className="w-full h-20 sm:h-24 md:h-28 lg:h-24">
                <img
                  src={imgPath}
                  alt={t(lang, key)}
                  className="w-full h-full object-cover block"
                  loading="lazy"
                  onError={(e) => {
                    // fallback to bundled images if pimages are not present
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = `/images/${key}.png`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                <div className="absolute left-0 right-0 bottom-0 p-2 text-white text-xs font-semibold text-center drop-shadow">
                  {t(lang, key)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
