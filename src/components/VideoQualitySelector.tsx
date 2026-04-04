"use client";

import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quality {
  id: string;
  label: string;
  icon: React.ElementType;
  width: number;
  height: number;
  desc: string;
  descAr: string;
}

const QUALITIES: Quality[] = [
  {
    id: "720p",
    label: "720p",
    icon: Zap,
    width: 1280,
    height: 720,
    desc: "HD",
    descAr: "عالي",
  },
  {
    id: "1080p",
    label: "1080p",
    icon: Sparkles,
    width: 1920,
    height: 1080,
    desc: "Full HD",
    descAr: "فل اتش دي",
  },
  {
    id: "4k",
    label: "4K",
    icon: Crown,
    width: 3840,
    height: 2160,
    desc: "Ultra HD",
    descAr: "الترا",
  },
];

interface Props {
  selected: string;
  aspectRatio: string;
  onChange: (id: string, w: number, h: number) => void;
  lang: Lang;
}

export default function VideoQualitySelector({
  selected,
  aspectRatio,
  onChange,
  lang,
}: Props) {
  // Calculate dimensions based on aspect ratio and quality
  const calculateDimensions = (quality: Quality) => {
    const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);

    // Base width on quality
    let baseWidth = quality.width;
    let baseHeight = quality.height;

    // Adjust for aspect ratio
    if (aspectRatio === "9:16") {
      // Portrait
      baseWidth = Math.round((baseHeight * widthRatio) / heightRatio);
    } else if (aspectRatio === "1:1") {
      // Square
      baseWidth = baseHeight;
    } else if (aspectRatio === "4:5") {
      // Portrait-ish
      baseWidth = Math.round((baseHeight * widthRatio) / heightRatio);
    }
    // 16:9 uses default dimensions

    return { width: baseWidth, height: baseHeight };
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">
        {lang === "ar" ? "جودة الفيديو" : "Video Quality"}
      </Label>
      <div className="grid grid-cols-3 gap-1.5">
        {QUALITIES.map((q) => {
          const Icon = q.icon;
          const active = selected === q.id;
          const dims = calculateDimensions(q);

          return (
            <button
              key={q.id}
              onClick={() => onChange(q.id, dims.width, dims.height)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-[10px] font-medium transition-all",
                active
                  ? "border-primary bg-primary/10 text-foreground [&_svg]:text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:border-primary",
              )}
            >
              <Icon className="size-4" />
              <span className="font-semibold text-[11px]">{q.label}</span>
              <span className="text-muted-foreground text-[9px] truncate w-full text-center">
                {lang === "ar" ? q.descAr : q.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
