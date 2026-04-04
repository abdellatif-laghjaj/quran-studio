"use client";

import { t, Lang } from "@/lib/i18n";

interface Ratio {
  id: string;
  label: string;
  icon: string;
  desc: string;
  descAr: string;
  width: number;
  height: number;
}

const RATIOS: Ratio[] = [
  {
    id: "16:9",
    label: "16:9",
    icon: "🖥️",
    desc: "YouTube",
    descAr: "يوتيوب",
    width: 1280,
    height: 720,
  },
  {
    id: "9:16",
    label: "9:16",
    icon: "📱",
    desc: "Reels / Shorts",
    descAr: "ريلز / شورتس",
    width: 720,
    height: 1280,
  },
  {
    id: "1:1",
    label: "1:1",
    icon: "⬛",
    desc: "Instagram",
    descAr: "انستغرام",
    width: 720,
    height: 720,
  },
  {
    id: "4:5",
    label: "4:5",
    icon: "📋",
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
    <div>
      <label
        style={{
          display: "block",
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "14px",
        }}
      >
        {t(lang, "aspectRatio")}
      </label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        {RATIOS.map((r) => (
          <button
            key={r.id}
            onClick={() => onChange(r.id, r.width, r.height)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "14px 8px",
              borderRadius: "12px",
              border:
                selected === r.id
                  ? "2px solid var(--gold)"
                  : "2px solid var(--surface-2)",
              background:
                selected === r.id
                  ? "rgba(212, 175, 55, 0.12)"
                  : "var(--surface-1)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "22px" }}>{r.icon}</span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color:
                  selected === r.id ? "var(--gold)" : "var(--text-primary)",
              }}
            >
              {r.label}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              {lang === "ar" ? r.descAr : r.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
