"use client";

import { Lang, t } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TreePine, Waves, Cloud, Sun, Trees } from "lucide-react";

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
    <div className="field-group">
      <Label>{t(lang, "backgroundTheme")}</Label>
      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={(value) => value && onChange(value as Theme)}
        className="theme-toggle-group"
      >
        {themes.map((th) => {
          const Icon = th.icon;
          return (
            <ToggleGroupItem
              key={th.key}
              value={th.key}
              className="theme-toggle-item"
              aria-label={t(lang, th.key)}
            >
              <Icon className="size-5" />
              <span>{t(lang, th.key)}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
