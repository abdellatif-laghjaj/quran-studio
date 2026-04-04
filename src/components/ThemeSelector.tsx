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
        {themes.map(({ key, icon: Icon }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-[10px] font-medium transition-all",
                active
                  ? "border-primary bg-primary/10 text-foreground [&_svg]:text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:border-primary",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate w-full text-center">
                {t(lang, key)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
