"use client";

import { Lang, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle2 } from "lucide-react";

interface Props {
  videoUrl: string | null;
  lang: Lang;
}

export default function VideoPreview({ videoUrl, lang }: Props) {
  if (!videoUrl) return null;

  return (
    <Card className="w-full animate-fade-in-up border-[var(--gold-500)]/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-arabic">
          <CheckCircle2 className="size-5 text-[var(--gold-500)]" />
          {t(lang, "videoReady")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="w-full rounded-lg overflow-hidden bg-black border border-border">
          <video controls preload="metadata" className="w-full block">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
        <Button asChild className="w-full gap-2">
          <a href={videoUrl} download>
            <Download className="size-4 me-2" />
            {t(lang, "download")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
