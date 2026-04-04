"use client";

import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Monitor, Smartphone, Square, RectangleVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ratio {
  id: string;
  label: string;
  icon: React.ElementType;
  desc: string;
  descAr: string;
  width: number;
  height: number;
}

const RATIOS: Ratio[] = [
  {
    id: "16:9",
    label: "16:9",
    icon: Monitor,
    desc: "YouTube",
    descAr: "يوتيوب",
    width: 1280,
    height: 720,
  },
  {
    id: "9:16",
    label: "9:16",
    icon: Smartphone,
    desc: "Reels",
    descAr: "ريلز",
    width: 720,
    height: 1280,
  },
  {
    id: "1:1",
    label: "1:1",
    icon: Square,
    desc: "Instagram",
    descAr: "انستغرام",
    width: 720,
    height: 720,
  },
  {
    id: "4:5",
    label: "4:5",
    icon: RectangleVertical,
    desc: "Facebook",
    descAr: "فيسبوك",
    width: 576,
    height: 720,
  },
];

interface Props {
  selected: string;
  onChange: (id: string, w: number, h: number) => void;
  lang: Lang;
}

export default function AspectRatioSelector({
  selected,
  onChange,
  lang,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">{t(lang, "aspectRatio")}</Label>
      <div className="grid grid-cols-4 gap-1.5">
        {RATIOS.map((r) => {
          const Icon = r.icon;
          const active = selected === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onChange(r.id, r.width, r.height)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-[10px] font-medium transition-all",
                active
                  ? "border-primary bg-primary/10 text-foreground [&_svg]:text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:border-primary",
              )}
            >
              <Icon className="size-4" />
              <span className="font-semibold text-[11px]">{r.label}</span>
              <span className="text-muted-foreground text-[9px] truncate w-full text-center">
                {lang === "ar" ? r.descAr : r.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
