"use client";

import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Monitor, Smartphone, Square, RectangleVertical } from "lucide-react";

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
    desc: "Reels / Shorts",
    descAr: "ريلز / شورتس",
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
    <div className="field-group">
      <Label>{t(lang, "aspectRatio")}</Label>
      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={(value) => {
          if (value) {
            const ratio = RATIOS.find((r) => r.id === value);
            if (ratio) onChange(ratio.id, ratio.width, ratio.height);
          }
        }}
        className="ratio-toggle-group"
      >
        {RATIOS.map((r) => {
          const Icon = r.icon;
          return (
            <ToggleGroupItem
              key={r.id}
              value={r.id}
              className="ratio-toggle-item"
              aria-label={r.label}
            >
              <Icon className="size-5" />
              <span className="font-semibold">{r.label}</span>
              <span className="text-muted-foreground text-[10px]">
                {lang === "ar" ? r.descAr : r.desc}
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
