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
import { Play, Square, Shuffle } from "lucide-react";

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
    // If already playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch audio for the first ayah of the current chapter
      const response = await fetch(
        `/api/quran/audio?reciterId=${selected}&chapter=${chapter}&from=1&to=1`,
      );
      const data = await response.json();

      if (data.audio_files && data.audio_files.length > 0) {
        const audioUrl = data.audio_files[0].url;

        // Create or reuse audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = audioUrl;
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
    if (reciters.length === 0) return;

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // Select a random reciter (different from current if possible)
    let newReciter: Reciter;
    if (reciters.length === 1) {
      newReciter = reciters[0];
    } else {
      do {
        newReciter = reciters[Math.floor(Math.random() * reciters.length)];
      } while (newReciter.id === selected);
    }
    onChange(newReciter.id);
  };

  return (
    <div className="field-group">
      <Label htmlFor="reciter-selector">{t(lang, "selectReciter")}</Label>
      <div className="flex items-center gap-2">
        <Select
          value={selected.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
        >
          <SelectTrigger id="reciter-selector" className="flex-1">
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

        {/* Play Preview Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePlayPreview}
          disabled={isLoading}
          title={lang === "ar" ? "معاينة الصوت" : "Preview voice"}
          className="shrink-0"
        >
          {isLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : isPlaying ? (
            <Square className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Randomize Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRandomize}
          title={lang === "ar" ? "اختيار عشوائي" : "Randomize"}
          className="shrink-0"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
