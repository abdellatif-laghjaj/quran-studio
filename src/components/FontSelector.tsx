"use client";

import { t, Lang } from "@/lib/i18n";

interface FontOption {
  id: string;
  name: string;
  nameAr: string;
  file: string;
  fontFamily: string;
  category: "naskh" | "ruqaa" | "modern";
}

const FONTS: FontOption[] = [
  {
    id: "amiri",
    name: "Amiri",
    nameAr: "أميري",
    file: "Amiri.ttf",
    fontFamily: "Amiri",
    category: "naskh",
  },
  {
    id: "amiri-bold",
    name: "Amiri Bold",
    nameAr: "أميري عريض",
    file: "Amiri-Bold.ttf",
    fontFamily: "AmiriBold",
    category: "naskh",
  },
  {
    id: "noto-naskh",
    name: "Noto Naskh",
    nameAr: "نوتو نسخ",
    file: "NotoNaskhArabic.ttf",
    fontFamily: "NotoNaskhArabic",
    category: "naskh",
  },
  {
    id: "aref-ruqaa",
    name: "Aref Ruqaa",
    nameAr: "عارف رقعة",
    file: "ArefRuqaa.ttf",
    fontFamily: "ArefRuqaa",
    category: "ruqaa",
  },
  {
    id: "aref-ruqaa-bold",
    name: "Aref Ruqaa Bold",
    nameAr: "رقعة عريض",
    file: "ArefRuqaa-Bold.ttf",
    fontFamily: "ArefRuqaaBold",
    category: "ruqaa",
  },
  {
    id: "cairo",
    name: "Cairo",
    nameAr: "القاهرة",
    file: "Cairo.ttf",
    fontFamily: "CairoFont",
    category: "modern",
  },
  {
    id: "tajawal",
    name: "Tajawal",
    nameAr: "تجول",
    file: "Tajawal.ttf",
    fontFamily: "Tajawal",
    category: "modern",
  },
  {
    id: "tajawal-bold",
    name: "Tajawal Bold",
    nameAr: "تجول عريض",
    file: "Tajawal-Bold.ttf",
    fontFamily: "TajawalBold",
    category: "modern",
  },
  {
    id: "almarai",
    name: "Almarai",
    nameAr: "المرعي",
    file: "Almarai.ttf",
    fontFamily: "Almarai",
    category: "modern",
  },
  {
    id: "lemonada",
    name: "Lemonada",
    nameAr: "ليمونادا",
    file: "Lemonada.ttf",
    fontFamily: "Lemonada",
    category: "modern",
  },
];

export { FONTS };

const fontFaceCSS = FONTS.map(
  (f) =>
    `@font-face { font-family: '${f.fontFamily}'; src: url('/fonts/${f.file}'); font-display: swap; }`,
).join("\n");

const categoryLabels: Record<string, Record<Lang, string>> = {
  naskh: { ar: "✦ خطوط النسخ", en: "✦ Naskh Fonts" },
  ruqaa: { ar: "✦ خطوط الرقعة", en: "✦ Ruqaa Fonts" },
  modern: { ar: "✦ خطوط حديثة", en: "✦ Modern Fonts" },
};

interface Props {
  selected: string;
  onChange: (fontFile: string) => void;
  lang: Lang;
}

export default function FontSelector({ selected, onChange, lang }: Props) {
  const categories = ["naskh", "ruqaa", "modern"] as const;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: fontFaceCSS }} />

      <label
        style={{
          display: "block",
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "14px",
        }}
      >
        {t(lang, "fontStyle")}
      </label>

      <div
        style={{
          maxHeight: "380px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {categories.map((cat) => {
          const catFonts = FONTS.filter((f) => f.category === cat);
          return (
            <div key={cat} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--gold-500, #d4af37)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  padding: "0 4px",
                  opacity: 0.8,
                }}
              >
                {categoryLabels[cat][lang]}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    catFonts.length === 1 ? "1fr" : "1fr 1fr",
                  gap: "8px",
                }}
              >
                {catFonts.map((font) => {
                  const isSelected = selected === font.file;
                  return (
                    <button
                      key={font.id}
                      onClick={() => onChange(font.file)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "14px 8px 10px",
                        borderRadius: "12px",
                        border: isSelected
                          ? "2px solid var(--gold-500, #d4af37)"
                          : "1.5px solid rgba(255,255,255,0.06)",
                        background: isSelected
                          ? "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))"
                          : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "var(--gold-500, #d4af37)",
                            boxShadow: "0 0 6px rgba(212,175,55,0.5)",
                          }}
                        />
                      )}

                      <span
                        style={{
                          fontSize: "22px",
                          fontFamily: `'${font.fontFamily}', serif`,
                          color: isSelected
                            ? "white"
                            : "var(--text-secondary, #a0a8c0)",
                          direction: "rtl",
                          lineHeight: 1.5,
                          marginBottom: "6px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        بِسْمِ ٱللَّهِ
                      </span>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected
                            ? "var(--gold-500, #d4af37)"
                            : "var(--text-muted, #6b7280)",
                          letterSpacing: "0.3px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {lang === "ar" ? font.nameAr : font.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
