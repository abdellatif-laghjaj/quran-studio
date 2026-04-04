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
    <Card className="animate-slide-in border-gold-500/30 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-arabic">
          <CheckCircle2 className="size-5 text-gold-500" />
          {t(lang, "videoReady")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="preview-video-container">
          <video controls preload="metadata">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>

        <Button asChild className="w-full gap-2">
          <a href={videoUrl} download>
            <Download data-icon="inline-start" />
            {t(lang, "download")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
