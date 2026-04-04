"use client";

import { Lang, t } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
  lang: Lang;
}

export default function TafsirToggle({ enabled, onChange, lang }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <BookOpen className="size-4 text-muted-foreground shrink-0" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <Label
            htmlFor="tafsir-toggle"
            className="text-sm font-semibold cursor-pointer"
          >
            {t(lang, "includeTafsir")}
          </Label>
          <span className="text-xs text-muted-foreground leading-snug">
            {lang === "ar"
              ? "إضافة تفسير مختصر أسفل كل آية"
              : "Show brief tafsir below each ayah"}
          </span>
        </div>
      </div>
      <Switch
        id="tafsir-toggle"
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary shrink-0"
      />
    </div>
  );
}
