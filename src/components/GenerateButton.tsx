"use client";

import { Lang, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Loader2 } from "lucide-react";

interface Props {
  loading: boolean;
  progress: number;
  statusText: string;
  onClick: () => void;
  disabled: boolean;
  lang: Lang;
}

export default function GenerateButton({
  loading,
  progress,
  statusText,
  onClick,
  disabled,
  lang,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:via-gold-400 hover:to-gold-500 text-gold-900 font-bold shadow-lg shadow-gold-500/20"
      >
        {loading ? (
          <>
            <Loader2 data-icon="inline-start" className="animate-spin" />
            {t(lang, "generating")}
          </>
        ) : (
          <>
            <Play data-icon="inline-start" />
            {t(lang, "generate")}
          </>
        )}
      </Button>

      {loading && (
        <div className="generate-progress">
          <div className="generate-progress-info">
            <span>{statusText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
