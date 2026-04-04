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
    <div
      className={[
        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors",
        enabled ? "bg-primary/10 border-primary/40" : "bg-card border-border",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="size-4 text-primary shrink-0" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <Label
            htmlFor="auto-mode"
            className="text-sm font-semibold cursor-pointer"
          >
            {t(lang, "autoMode")}
          </Label>
          <span className="text-xs text-muted-foreground leading-snug">
            {t(lang, "autoModeDesc")}
          </span>
        </div>
      </div>
      <Switch
        id="auto-mode"
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary shrink-0"
      />
    </div>
  );
}
