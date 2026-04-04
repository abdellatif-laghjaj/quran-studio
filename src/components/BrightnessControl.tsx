"use client";

import { t, Lang } from "@/lib/i18n";

interface Props {
  value: number; // 0-100
  onChange: (val: number) => void;
  lang: Lang;
}

const PRESETS = [
  { value: 15, icon: "🌙", labelKey: "dark" as const },
  { value: 45, icon: "🌆", labelKey: "medium" as const },
  { value: 75, icon: "☀️", labelKey: "bright" as const },
];

export default function BrightnessControl({ value, onChange, lang }: Props) {
  // Map value to a warm gradient color
  const gradientColor =
    value < 30
      ? "rgba(212, 175, 55, 0.3)"
      : value < 60
        ? "rgba(212, 175, 55, 0.6)"
        : "rgba(255, 220, 100, 0.85)";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <label
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {t(lang, "brightness")}
        </label>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--gold-500, #d4af37)",
            background: "rgba(212, 175, 55, 0.12)",
            padding: "3px 10px",
            borderRadius: "20px",
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {value}%
        </span>
      </div>

      {/* ── Custom Slider ── */}
      <div
        style={{
          position: "relative",
          padding: "8px 0",
        }}
      >
        {/* Track background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "8px",
            transform: "translateY(-50%)",
            borderRadius: "4px",
            background: "var(--surface-input, #1a2035)",
            overflow: "hidden",
          }}
        >
          {/* Filled track */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${value}%`,
              borderRadius: "4px",
              background: `linear-gradient(90deg, #b8922f, ${gradientColor})`,
              transition: "width 0.15s ease, background 0.3s ease",
            }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="brightness-slider"
          style={{
            position: "relative",
            width: "100%",
            height: "24px",
            appearance: "none",
            WebkitAppearance: "none",
            background: "transparent",
            cursor: "pointer",
            outline: "none",
            zIndex: 2,
          }}
        />
      </div>

      {/* ── Presets Row ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {PRESETS.map((preset) => {
          const isActive = Math.abs(value - preset.value) < 10;
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px 4px",
                borderRadius: "10px",
                border: isActive
                  ? "1.5px solid var(--gold-500, #d4af37)"
                  : "1.5px solid rgba(255,255,255,0.06)",
                background: isActive
                  ? "rgba(212, 175, 55, 0.1)"
                  : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: isActive
                  ? "var(--gold-500, #d4af37)"
                  : "var(--text-muted)",
              }}
            >
              <span style={{ fontSize: "18px" }}>{preset.icon}</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.3px",
                }}
              >
                {t(lang, preset.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
