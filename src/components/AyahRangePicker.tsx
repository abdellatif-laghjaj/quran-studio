"use client";

import { Lang, t } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  maxVerses: number;
  startAyah: number;
  endAyah: number;
  onStartChange: (n: number) => void;
  onEndChange: (n: number) => void;
  lang: Lang;
}

export default function AyahRangePicker({
  maxVerses,
  startAyah,
  endAyah,
  onStartChange,
  onEndChange,
  lang,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="start-ayah" className="text-xs font-medium">
          {t(lang, "startAyah")}
        </Label>
        <Input
          type="number"
          id="start-ayah"
          min={1}
          max={maxVerses}
          value={startAyah}
          onChange={(e) => {
            const v = Math.max(
              1,
              Math.min(parseInt(e.target.value) || 1, maxVerses),
            );
            onStartChange(v);
          }}
          className="h-9 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="end-ayah" className="text-xs font-medium">
          {t(lang, "endAyah")}
        </Label>
        <Input
          type="number"
          id="end-ayah"
          min={startAyah}
          max={maxVerses}
          value={endAyah}
          onChange={(e) => {
            const v = Math.max(
              startAyah,
              Math.min(parseInt(e.target.value) || startAyah, maxVerses),
            );
            onEndChange(v);
          }}
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}
