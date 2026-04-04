"use client";

import { Lang, t } from "@/lib/i18n";

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
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
    >
      <div>
        <label className="form-label">{t(lang, "startAyah")}</label>
        <input
          type="number"
          className="input-field"
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
          id="start-ayah"
        />
      </div>
      <div>
        <label className="form-label">{t(lang, "endAyah")}</label>
        <input
          type="number"
          className="input-field"
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
          id="end-ayah"
        />
      </div>
    </div>
  );
}
