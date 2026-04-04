"use client";

import { Lang, t } from "@/lib/i18n";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
  lang: Lang;
}

export default function AutoMode({ enabled, onChange, lang }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "16px 20px",
        background: enabled ? "rgba(212, 175, 55, 0.08)" : "transparent",
        borderRadius: "12px",
        border: `1px solid ${enabled ? "rgba(212, 175, 55, 0.3)" : "var(--border)"}`,
        transition: "all 0.3s ease",
      }}
    >
      <div>
        <span
          style={{
            fontWeight: 600,
            color: enabled ? "var(--gold)" : "var(--text-primary)",
            fontSize: "15px",
          }}
        >
          ✨ {t(lang, "autoMode")}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "13px",
            color: "var(--text-muted)",
            marginTop: "4px",
          }}
        >
          {t(lang, "autoModeDesc")}
        </span>
      </div>
      <div
        className={`toggle-switch ${enabled ? "active" : ""}`}
        onClick={() => onChange(!enabled)}
        role="switch"
        aria-checked={enabled}
        id="auto-mode-toggle"
      />
    </div>
  );
}
