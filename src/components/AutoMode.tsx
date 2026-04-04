"use client";

import { Lang, t } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
  lang: Lang;
}

export default function AutoMode({ enabled, onChange, lang }: Props) {
  return (
    <div className={`switch-row ${enabled ? "highlighted" : ""}`}>
      <div className="flex items-center gap-3">
        <Sparkles className="size-4 text-gold-500" />
        <div className="switch-info">
          <Label htmlFor="auto-mode" className="switch-label">
            {t(lang, "autoMode")}
          </Label>
          <span className="switch-description">{t(lang, "autoModeDesc")}</span>
        </div>
      </div>
      <Switch id="auto-mode" checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}
