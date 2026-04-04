"use client";

import { Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export default function LanguageSwitcher({ lang, onChange }: Props) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onChange(lang === "ar" ? "en" : "ar")}
      className="h-8 gap-1.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-[var(--gold-500)] text-sm font-medium px-3"
    >
      <Languages className="size-3.5" />
      {lang === "ar" ? "English" : "العربية"}
    </Button>
  );
}
