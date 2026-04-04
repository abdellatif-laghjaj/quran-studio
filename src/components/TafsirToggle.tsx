"use client";

import { Lang, t } from "@/lib/i18n";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
  lang: Lang;
}

export default function TafsirToggle({ enabled, onChange, lang }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <div>
        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
          {t(lang, "includeTafsir")}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "13px",
            color: "var(--text-muted)",
            marginTop: "2px",
          }}
        >
          {lang === "ar"
            ? "إضافة تفسير مختصر أسفل كل آية"
            : "Show brief tafsir below each ayah"}
        </span>
      </div>
      <div
        className={`toggle-switch ${enabled ? "active" : ""}`}
        onClick={() => onChange(!enabled)}
        role="switch"
        aria-checked={enabled}
        id="tafsir-toggle"
      />
    </div>
  );
}
