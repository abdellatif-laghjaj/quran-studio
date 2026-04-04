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
    <div className="flex flex-col gap-2">
      <style dangerouslySetInnerHTML={{ __html: fontFaceCSS }} />
      <Label className="text-xs font-medium">{t(lang, "fontStyle")}</Label>

      <ScrollArea className="h-72 rounded-lg border border-border">
        <div className="p-3 space-y-4">
          {categories.map((cat) => {
            const catFonts = FONTS.filter((f) => f.category === cat);
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2 px-0.5">
                  {categoryLabels[cat][lang]}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {catFonts.map((font) => {
                    const isSelected = selected === font.file;
                    return (
                      <button
                        key={font.id}
                        onClick={() => onChange(font.file)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border text-center transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:bg-accent hover:border-primary",
                        )}
                      >
                        <span
                          className="text-lg leading-snug text-foreground"
                          style={{ fontFamily: `'${font.fontFamily}', serif` }}
                          dir="rtl"
                        >
                          بِسْمِ ٱللَّهِ
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium leading-none",
                            isSelected
                              ? "text-primary font-semibold"
                              : "text-muted-foreground",
                          )}
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
      </ScrollArea>
    </div>
  );
}
