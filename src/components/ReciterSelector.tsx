"use client";

import { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { Play, Square, Shuffle, Loader2 } from "lucide-react";

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
  chapter?: number;
}

export default function ReciterSelector({
  reciters,
  selected,
  onChange,
  lang,
  chapter = 1,
}: Props) {
  const selectedReciter = reciters.find((r) => r.id === selected);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/quran/audio?reciterId=${selected}&chapter=${chapter}&from=1&to=1`,
      );
      const data = await response.json();
      if (data.audio_files?.length > 0) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = data.audio_files[0].url;
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to play preview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomize = () => {
    if (!reciters.length) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    let next: Reciter;
    if (reciters.length === 1) {
      next = reciters[0];
    } else {
      do {
        next = reciters[Math.floor(Math.random() * reciters.length)];
      } while (next.id === selected);
    }
    onChange(next.id);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="reciter-selector" className="text-xs font-medium">
        {t(lang, "selectReciter")}
      </Label>
      <div className="flex items-center gap-2">
        <Select
          value={selected.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
        >
          <SelectTrigger id="reciter-selector" className="h-9 flex-1 text-sm">
            <SelectValue>
              {selectedReciter && (
                <span>
                  {selectedReciter.reciter_name}
                  {selectedReciter.style ? ` (${selectedReciter.style})` : ""}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectGroup>
              {reciters.map((r) => (
                <SelectItem
                  key={r.id}
                  value={r.id.toString()}
                  className="text-sm"
                >
                  {r.reciter_name}
                  {r.style ? ` (${r.style})` : ""}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePlayPreview}
          disabled={isLoading}
          title={lang === "ar" ? "معاينة الصوت" : "Preview voice"}
          className="size-9 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isPlaying ? (
            <Square className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRandomize}
          title={lang === "ar" ? "اختيار عشوائي" : "Randomize"}
          className="size-9 shrink-0"
        >
          <Shuffle className="size-4" />
        </Button>
      </div>
    </div>
  );
}
