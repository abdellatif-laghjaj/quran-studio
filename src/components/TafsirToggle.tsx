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
    <div className="switch-row">
      <div className="flex items-center gap-3">
        <BookOpen className="size-4 text-muted-foreground" />
        <div className="switch-info">
          <Label htmlFor="tafsir-toggle" className="switch-label">
            {t(lang, "includeTafsir")}
          </Label>
          <span className="switch-description">
            {lang === "ar"
              ? "إضافة تفسير مختصر أسفل كل آية"
              : "Show brief tafsir below each ayah"}
          </span>
        </div>
      </div>
      <Switch id="tafsir-toggle" checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}
