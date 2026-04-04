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

interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
}

interface Props {
  reciters: Reciter[];
  selected: number;
  onChange: (id: number) => void;
  lang: Lang;
}

export default function ReciterSelector({
  reciters,
  selected,
  onChange,
  lang,
}: Props) {
  const selectedReciter = reciters.find((r) => r.id === selected);

  return (
    <div className="field-group">
      <Label htmlFor="reciter-selector">{t(lang, "selectReciter")}</Label>
      <Select
        value={selected.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger id="reciter-selector">
          <SelectValue>
            {selectedReciter && (
              <span>
                {selectedReciter.reciter_name}
                {selectedReciter.style ? ` (${selectedReciter.style})` : ""}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectGroup>
            {reciters.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>
                {r.reciter_name}
                {r.style ? ` (${r.style})` : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
