"use client";

import { Lang, t } from "@/lib/i18n";

type Theme = "nature" | "ocean" | "sky" | "desert" | "forest";

interface Props {
  selected: Theme;
  onChange: (theme: Theme) => void;
  lang: Lang;
}

const themes: { key: Theme; emoji: string; gradient: string }[] = [
  {
    key: "nature",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #2D5016 0%, #4A7C2E 50%, #1B3A0A 100%)",
  },
  {
    key: "ocean",
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #0C2D48 0%, #145DA0 50%, #0C2D48 100%)",
  },
  {
    key: "sky",
    emoji: "☁️",
    gradient: "linear-gradient(135deg, #1B2838 0%, #6B4984 50%, #E8846B 100%)",
  },
  {
    key: "desert",
    emoji: "🏜️",
    gradient: "linear-gradient(135deg, #8B6914 0%, #C49B30 50%, #5C3D0A 100%)",
  },
  {
    key: "forest",
    emoji: "🌲",
    gradient: "linear-gradient(135deg, #1A3C2A 0%, #2D6B4A 50%, #0F2518 100%)",
  },
];

export default function ThemeSelector({ selected, onChange, lang }: Props) {
  return (
    <div>
      <label className="form-label">{t(lang, "backgroundTheme")}</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "12px",
        }}
      >
        {themes.map((th) => (
          <div
            key={th.key}
            className={`theme-card ${selected === th.key ? "selected" : ""}`}
            style={{ background: th.gradient }}
            onClick={() => onChange(th.key)}
            id={`theme-${th.key}`}
          >
            <div className="theme-label">
              <span
                style={{
                  fontSize: "22px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                {th.emoji}
              </span>
              {t(lang, th.key)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
