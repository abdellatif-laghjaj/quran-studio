"use client";

import { Lang, t } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
}

interface Props {
  chapters: Chapter[];
  selected: number;
  onChange: (id: number) => void;
  lang: Lang;
}

export default function SurahSelector({
  chapters,
  selected,
  onChange,
  lang,
}: Props) {
  const selectedChapter = chapters.find((c) => c.id === selected);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="surah-selector" className="text-xs font-medium">
        {t(lang, "selectSurah")}
      </Label>
      <Select
        value={selected.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger
          id="surah-selector"
          className="h-9 w-full font-arabic text-sm"
        >
          <SelectValue>
            {selectedChapter && (
              <span>
                {selectedChapter.id}.{" "}
                {lang === "ar"
                  ? selectedChapter.name_arabic
                  : selectedChapter.name_simple}{" "}
                — {selectedChapter.verses_count} {t(lang, "verses")}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectGroup>
            {chapters.map((ch) => (
              <SelectItem
                key={ch.id}
                value={ch.id.toString()}
                className="font-arabic text-sm"
              >
                {ch.id}. {lang === "ar" ? ch.name_arabic : ch.name_simple} —{" "}
                {ch.verses_count} {t(lang, "verses")}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
