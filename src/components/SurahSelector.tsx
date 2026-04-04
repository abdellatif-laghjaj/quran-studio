"use client";

import { Lang, t } from "@/lib/i18n";

interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
}

interface Props {
  chapters: Chapter[];
  selected: number;
  onChange: (id: number) => void;
  lang: Lang;
}

export default function SurahSelector({
  chapters,
  selected,
  onChange,
  lang,
}: Props) {
  return (
    <div>
      <label className="form-label">{t(lang, "selectSurah")}</label>
      <select
        className="input-field font-arabic"
        value={selected}
        onChange={(e) => onChange(parseInt(e.target.value))}
        id="surah-selector"
      >
        {chapters.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.id}. {lang === "ar" ? ch.name_arabic : ch.name_simple} —{" "}
            {ch.verses_count} {t(lang, "verses")}
          </option>
        ))}
      </select>
    </div>
  );
}
