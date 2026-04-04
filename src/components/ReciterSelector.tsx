"use client";

import { Lang, t } from "@/lib/i18n";

interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
}

interface Props {
  reciters: Reciter[];
  selected: number;
  onChange: (id: number) => void;
  lang: Lang;
}

export default function ReciterSelector({
  reciters,
  selected,
  onChange,
  lang,
}: Props) {
  return (
    <div>
      <label className="form-label">{t(lang, "selectReciter")}</label>
      <select
        className="input-field"
        value={selected}
        onChange={(e) => onChange(parseInt(e.target.value))}
        id="reciter-selector"
      >
        {reciters.map((r) => (
          <option key={r.id} value={r.id}>
            {r.reciter_name}
            {r.style ? ` (${r.style})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
