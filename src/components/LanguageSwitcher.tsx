"use client";

import { Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export default function LanguageSwitcher({ lang, onChange }: Props) {
  return (
    <button
      className="btn-secondary"
      onClick={() => onChange(lang === "ar" ? "en" : "ar")}
      id="language-switcher"
      style={{
        padding: "8px 16px",
        fontSize: "14px",
        borderRadius: "8px",
      }}
    >
      {lang === "ar" ? "🇬🇧 English" : "🇸🇦 العربية"}
    </button>
  );
}
