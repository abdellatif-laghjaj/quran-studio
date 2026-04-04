"use client";

import { t, Lang } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  naskh: { ar: "خطوط النسخ", en: "Naskh Fonts" },
  ruqaa: { ar: "خطوط الرقعة", en: "Ruqaa Fonts" },
  modern: { ar: "خطوط حديثة", en: "Modern Fonts" },
};

interface Props {
  selected: string;
  onChange: (fontFile: string) => void;
  lang: Lang;
}

export default function FontSelector({ selected, onChange, lang }: Props) {
  const categories = ["naskh", "ruqaa", "modern"] as const;

  return (
    <div className="field-group">
      <style dangerouslySetInnerHTML={{ __html: fontFaceCSS }} />
      <Label>{t(lang, "fontStyle")}</Label>

      <ScrollArea className="h-[300px] rounded-md border border-border p-3">
        {categories.map((cat) => {
          const catFonts = FONTS.filter((f) => f.category === cat);
          return (
            <div key={cat} className="mb-4 last:mb-0">
              <div className="text-[10px] font-semibold text-gold-500 uppercase tracking-wider mb-2 px-1">
                {categoryLabels[cat][lang]}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {catFonts.map((font) => {
                  const isSelected = selected === font.file;
                  return (
                    <button
                      key={font.id}
                      onClick={() => onChange(font.file)}
                      className={cn("font-card", isSelected && "selected")}
                    >
                      <span
                        className="font-card-preview"
                        style={{ fontFamily: `'${font.fontFamily}', serif` }}
                      >
                        بِسْمِ ٱللَّهِ
                      </span>
                      <span className="font-card-name">
                        {lang === "ar" ? font.nameAr : font.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
