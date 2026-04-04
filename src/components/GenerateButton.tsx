"use client";

import { Lang, t } from "@/lib/i18n";

interface Props {
  loading: boolean;
  progress: number;
  statusText: string;
  onClick: () => void;
  disabled: boolean;
  lang: Lang;
}

export default function GenerateButton({
  loading,
  progress,
  statusText,
  onClick,
  disabled,
  lang,
}: Props) {
  return (
    <div style={{ marginTop: "24px" }}>
      <button
        className="btn-primary"
        onClick={onClick}
        disabled={disabled || loading}
        id="generate-button"
        style={{
          width: "100%",
          justifyContent: "center",
          fontSize: "18px",
          padding: "16px",
        }}
      >
        {loading ? (
          <>
            <div className="spinner" />
            {t(lang, "generating")}
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {t(lang, "generate")}
          </>
        )}
      </button>

      {loading && (
        <div style={{ marginTop: "16px" }} className="fade-in">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <span>{statusText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
