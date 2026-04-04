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
      className="gap-2"
    >
      <Languages data-icon="inline-start" />
      {lang === "ar" ? "English" : "العربية"}
    </Button>
  );
}
