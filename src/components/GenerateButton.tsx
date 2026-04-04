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
        className="w-full h-11 text-base font-bold bg-gradient-to-r from-[var(--gold-600)] via-[var(--gold-500)] to-[var(--gold-600)] hover:from-[var(--gold-500)] hover:via-[var(--gold-400)] hover:to-[var(--gold-500)] text-[var(--gold-900)] border-none shadow-lg shadow-[var(--gold-500)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin me-2" />
            {t(lang, "generating")}
          </>
        ) : (
          <>
            <Play className="size-4 me-2" />
            {t(lang, "generate")}
          </>
        )}
      </Button>

      {loading && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{statusText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-1.5 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[var(--gold-600)] [&_[data-slot=progress-indicator]]:to-[var(--gold-400)]"
          />
        </div>
      )}
    </div>
  );
}
