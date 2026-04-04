"use client";

import { Lang, t } from "@/lib/i18n";

interface Props {
  videoUrl: string | null;
  lang: Lang;
}

export default function VideoPreview({ videoUrl, lang }: Props) {
  if (!videoUrl) return null;

  return (
    <div className="fade-in" style={{ marginTop: "32px" }}>
      <h3
        className="font-arabic"
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--gold)",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        🎬 {t(lang, "videoReady")}
      </h3>

      <div className="video-player-container glow">
        <video controls preload="metadata" style={{ width: "100%" }}>
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a
          href={videoUrl}
          download
          className="btn-primary"
          style={{ textDecoration: "none", display: "inline-flex" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t(lang, "download")}
        </a>
      </div>
    </div>
  );
}
