"use client";

import { useState, useEffect, useCallback } from "react";
import { Lang, t } from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Palette,
  Settings,
  Video,
  BookMarked,
  Mic,
} from "lucide-react";

import SurahSelector from "@/components/SurahSelector";
import ReciterSelector from "@/components/ReciterSelector";
import AyahRangePicker from "@/components/AyahRangePicker";
import ThemeSelector from "@/components/ThemeSelector";
import TafsirToggle from "@/components/TafsirToggle";
import AutoMode from "@/components/AutoMode";
import VideoPreview from "@/components/VideoPreview";
import GenerateButton from "@/components/GenerateButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BrightnessControl from "@/components/BrightnessControl";
import AspectRatioSelector from "@/components/AspectRatioSelector";
import FontSelector from "@/components/FontSelector";

interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
}

interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
}

type Theme = "nature" | "ocean" | "sky" | "desert" | "forest";

const AUTO_RECITERS = [7, 2, 3, 5];
const AUTO_THEMES: Theme[] = ["nature", "ocean", "sky", "desert", "forest"];

export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState(7);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);
  const [theme, setTheme] = useState<Theme>("nature");
  const [includeTafsir, setIncludeTafsir] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [dimOpacity, setDimOpacity] = useState(55);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [videoWidth, setVideoWidth] = useState(1280);
  const [videoHeight, setVideoHeight] = useState(720);
  const [fontFile, setFontFile] = useState("Amiri.ttf");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chapRes, recRes] = await Promise.all([
          fetch("/api/quran/chapters"),
          fetch("/api/quran/reciters"),
        ]);
        const chapData = await chapRes.json();
        const recData = await recRes.json();
        setChapters(chapData.chapters || []);
        setReciters(recData.reciters || []);
      } catch {
        setError("Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const ch = chapters.find((c) => c.id === selectedSurah);
    if (ch) {
      setStartAyah(1);
      setEndAyah(Math.min(ch.verses_count, 10));
    }
  }, [selectedSurah, chapters]);

  const handleLangChange = useCallback((newLang: Lang) => {
    setLang(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (autoMode) {
      setSelectedReciter(
        AUTO_RECITERS[Math.floor(Math.random() * AUTO_RECITERS.length)],
      );
      setTheme(AUTO_THEMES[Math.floor(Math.random() * AUTO_THEMES.length)]);
    }
  }, [autoMode, selectedSurah]);

  const maxVerses =
    chapters.find((c) => c.id === selectedSurah)?.verses_count || 7;

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);
    setError("");
    setVideoUrl(null);

    try {
      setStatusText(t(lang, "fetchingVerses"));
      setProgress(10);
      setStatusText(t(lang, "fetchingAudio"));
      setProgress(25);
      setStatusText(t(lang, "fetchingVideo"));
      setProgress(40);
      setStatusText(t(lang, "renderingVideo"));
      setProgress(50);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter: selectedSurah,
          from: startAyah,
          to: endAyah,
          reciterId: selectedReciter,
          theme,
          includeTafsir,
          dimOpacity: dimOpacity / 100,
          videoWidth,
          videoHeight,
          fontFile,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errMsg = `HTTP ${response.status}`;
        try {
          const j = JSON.parse(errText);
          errMsg = j.error || j.details || errMsg;
        } catch {
          if (errText.length < 200) errMsg += ": " + errText;
        }
        throw new Error(errMsg);
      }

      setProgress(90);
      setStatusText(
        lang === "ar" ? "جاري تجهيز الفيديو..." : "Preparing video...",
      );

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setProgress(100);
      setStatusText(t(lang, "videoReady"));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t(lang, "error");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ══════ LOADING SCREEN ══════ */
  if (dataLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-bismillah font-arabic">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </div>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="playground">
      {/* ══════ LEFT PANEL — Quran Selection ══════ */}
      <aside className="playground-panel playground-panel-left">
        {/* Header */}
        <header className="playground-header">
          <div className="playground-logo">
            <div className="playground-logo-icon">
              <BookMarked className="size-4" />
            </div>
            <h1 className="playground-title">{t(lang, "appTitle")}</h1>
          </div>
          <LanguageSwitcher lang={lang} onChange={handleLangChange} />
        </header>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="panel-content">
            {/* Auto Mode */}
            <div className="panel-section">
              <AutoMode enabled={autoMode} onChange={setAutoMode} lang={lang} />
            </div>

            <Separator className="my-3" />

            {/* Surah Selection */}
            <div className="panel-section">
              <div className="panel-section-header">
                <BookOpen className="panel-section-icon" />
                <span className="panel-section-title">
                  {lang === "ar" ? "السورة" : "Surah"}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <SurahSelector
                  chapters={chapters}
                  selected={selectedSurah}
                  onChange={setSelectedSurah}
                  lang={lang}
                />

                <AyahRangePicker
                  maxVerses={maxVerses}
                  startAyah={startAyah}
                  endAyah={endAyah}
                  onStartChange={setStartAyah}
                  onEndChange={setEndAyah}
                  lang={lang}
                />
              </div>
            </div>

            {!autoMode && (
              <>
                <Separator className="my-3" />

                {/* Reciter Selection */}
                <div className="panel-section">
                  <div className="panel-section-header">
                    <Mic className="panel-section-icon" />
                    <span className="panel-section-title">
                      {lang === "ar" ? "القارئ" : "Reciter"}
                    </span>
                  </div>

                  <ReciterSelector
                    reciters={reciters}
                    selected={selectedReciter}
                    onChange={setSelectedReciter}
                    lang={lang}
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer with Generate Button */}
        <div className="panel-footer">
          {error && (
            <div className="mb-3 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
              {error}
            </div>
          )}
          <GenerateButton
            loading={loading}
            progress={progress}
            statusText={statusText}
            onClick={handleGenerate}
            disabled={!chapters.length}
            lang={lang}
          />
        </div>
      </aside>

      {/* ══════ CENTER — Video Preview ══════ */}
      <main className="playground-main">
        <div className="preview-container">
          {videoUrl ? (
            <VideoPreview videoUrl={videoUrl} lang={lang} />
          ) : (
            <div className="preview-placeholder">
              <Video className="preview-placeholder-icon" />
              <div>
                <p className="text-lg font-medium text-foreground mb-1">
                  {lang === "ar" ? "معاينة الفيديو" : "Video Preview"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "اختر السورة والآيات ثم اضغط إنشاء"
                    : "Select a surah and verses, then click Generate"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Attribution */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
          {lang === "ar"
            ? "بيانات من Quran.com | فيديوهات من Pixabay"
            : "Data from Quran.com | Videos from Pixabay"}
        </div>
      </main>

      {/* ══════ RIGHT PANEL — Visual Design & Options ══════ */}
      <aside className="playground-panel playground-panel-right">
        {/* Header */}
        <header className="playground-header">
          <div className="playground-logo">
            <Palette className="size-4 text-gold-500" />
            <span className="text-sm font-medium text-foreground">
              {lang === "ar" ? "التصميم" : "Design"}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="panel-content">
            {/* Theme */}
            {!autoMode && (
              <div className="panel-section">
                <div className="panel-section-header">
                  <Palette className="panel-section-icon" />
                  <span className="panel-section-title">
                    {lang === "ar" ? "الخلفية" : "Background"}
                  </span>
                </div>

                <ThemeSelector
                  selected={theme}
                  onChange={setTheme}
                  lang={lang}
                />
              </div>
            )}

            {!autoMode && <Separator className="my-3" />}

            {/* Brightness */}
            <div className="panel-section">
              <BrightnessControl
                value={dimOpacity}
                onChange={setDimOpacity}
                lang={lang}
              />
            </div>

            <Separator className="my-3" />

            {/* Aspect Ratio */}
            <div className="panel-section">
              <div className="panel-section-header">
                <Video className="panel-section-icon" />
                <span className="panel-section-title">
                  {lang === "ar" ? "الأبعاد" : "Aspect Ratio"}
                </span>
              </div>

              <AspectRatioSelector
                selected={aspectRatio}
                onChange={(id, w, h) => {
                  setAspectRatio(id);
                  setVideoWidth(w);
                  setVideoHeight(h);
                }}
                lang={lang}
              />
            </div>

            <Separator className="my-3" />

            {/* Font */}
            <div className="panel-section">
              <FontSelector
                selected={fontFile}
                onChange={setFontFile}
                lang={lang}
              />
            </div>

            <Separator className="my-3" />

            {/* Extra Options */}
            <div className="panel-section">
              <div className="panel-section-header">
                <Settings className="panel-section-icon" />
                <span className="panel-section-title">
                  {lang === "ar" ? "خيارات" : "Options"}
                </span>
              </div>

              <TafsirToggle
                enabled={includeTafsir}
                onChange={setIncludeTafsir}
                lang={lang}
              />
            </div>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
