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
import VideoPreviewCanvas from "@/components/VideoPreviewCanvas";
import GenerateButton from "@/components/GenerateButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BrightnessControl from "@/components/BrightnessControl";
import AspectRatioSelector from "@/components/AspectRatioSelector";
import VideoQualitySelector from "@/components/VideoQualitySelector";
import FontSelector from "@/components/FontSelector";
import ThemeToggle from "@/components/ThemeToggle";

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

const AUTO_RECITERS: number[] = [7, 2, 3, 5];
const AUTO_THEMES: Theme[] = ["nature", "ocean", "sky", "desert", "forest"];

/* ─── Reusable panel section header ─── */
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
      <Icon className="size-4 text-primary shrink-0" />
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

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
  const [videoQuality, setVideoQuality] = useState("720p");
  const [videoWidth, setVideoWidth] = useState(1280);
  const [videoHeight, setVideoHeight] = useState(720);
  const [fontFile, setFontFile] = useState("Amiri.ttf");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Lang | null;
    if (savedLang && (savedLang === "ar" || savedLang === "en")) {
      setLang(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    }
  }, []);

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
    localStorage.setItem("lang", newLang);
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
      setVideoUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatusText(t(lang, "videoReady"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t(lang, "error"));
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading screen ── */
  if (dataLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
        <p className="font-arabic text-2xl md:text-4xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-fade-in-up">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    /* ── 3-column grid ── */
    <div className="h-dvh lg:grid lg:grid-cols-[380px_1fr_400px] xl:grid-cols-[420px_1fr_440px] 2xl:grid-cols-[460px_1fr_480px] bg-background">
      {/* ══ LEFT PANEL ══ */}
      <aside className="flex flex-col h-dvh bg-sidebar border-b lg:border-b-0 lg:border-e border-sidebar-border">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-sidebar-border shrink-0 h-14">
          <div className="flex items-center gap-2.5">
            <div className="size-8 flex items-center justify-center rounded-lg bg-primary">
              <BookMarked className="size-4 text-primary-foreground" />
            </div>
            <h1 className="font-arabic text-lg font-bold bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80 bg-clip-text text-transparent">
              {t(lang, "appTitle")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher lang={lang} onChange={handleLangChange} />
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-5">
            {/* Auto Mode */}
            <AutoMode enabled={autoMode} onChange={setAutoMode} lang={lang} />

            <Separator />

            {/* Surah */}
            <div>
              <SectionHeader
                icon={BookOpen}
                label={lang === "ar" ? "السورة" : "Surah"}
              />
              <div className="space-y-3">
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
                <Separator />
                <div>
                  <SectionHeader
                    icon={Mic}
                    label={lang === "ar" ? "القارئ" : "Reciter"}
                  />
                  <ReciterSelector
                    reciters={reciters}
                    selected={selectedReciter}
                    onChange={setSelectedReciter}
                    lang={lang}
                    chapter={selectedSurah}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer / Generate - Sticky at bottom */}
        <div className="px-5 py-4 border-t border-sidebar-border shrink-0 bg-sidebar">
          {error && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
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

      {/* ══ CENTER ══ */}
      <main className="relative flex flex-col items-center justify-center p-8 bg-background h-dvh overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {videoUrl ? (
            <VideoPreview videoUrl={videoUrl} lang={lang} />
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-1">
                  {lang === "ar" ? "معاينة مباشرة" : "Live Preview"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "شاهد كيف سيبدو الفيديو مع الإعدادات الحالية"
                    : "See how your video will look with current settings"}
                </p>
              </div>
              <VideoPreviewCanvas
                aspectRatio={aspectRatio}
                fontFile={fontFile}
                theme={theme}
                dimOpacity={dimOpacity}
                lang={lang}
              />
            </div>
          )}
        </div>

        <p className="absolute bottom-4 text-xs text-muted-foreground text-center">
          {lang === "ar"
            ? "بيانات من Quran.com | فيديوهات من Pixabay"
            : "Data from Quran.com | Videos from Pixabay"}
        </p>
      </main>

      {/* ══ RIGHT PANEL ══ */}
      <aside className="flex flex-col h-dvh bg-sidebar border-t lg:border-t-0 lg:border-s border-sidebar-border">
        {/* Header */}
        <header className="flex items-center gap-2.5 px-5 py-3 border-b border-sidebar-border shrink-0 h-14">
          <Palette className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {lang === "ar" ? "التصميم" : "Design"}
          </span>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-5">
            {/* Theme */}
            {!autoMode && (
              <>
                <div>
                  <SectionHeader
                    icon={Palette}
                    label={lang === "ar" ? "الخلفية" : "Background"}
                  />
                  <ThemeSelector
                    selected={theme}
                    onChange={setTheme}
                    lang={lang}
                  />
                </div>
                <Separator />
              </>
            )}

            {/* Brightness */}
            <BrightnessControl
              value={dimOpacity}
              onChange={setDimOpacity}
              lang={lang}
            />

            <Separator />

            {/* Aspect Ratio */}
            <div>
              <SectionHeader
                icon={Video}
                label={lang === "ar" ? "الأبعاد" : "Aspect Ratio"}
              />
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

            <Separator />

            {/* Video Quality */}
            <VideoQualitySelector
              selected={videoQuality}
              aspectRatio={aspectRatio}
              onChange={(id, w, h) => {
                setVideoQuality(id);
                setVideoWidth(w);
                setVideoHeight(h);
              }}
              lang={lang}
            />

            <Separator />

            {/* Font */}
            <FontSelector
              selected={fontFile}
              onChange={setFontFile}
              lang={lang}
            />

            <Separator />

            {/* Options */}
            <div>
              <SectionHeader
                icon={Settings}
                label={lang === "ar" ? "خيارات" : "Options"}
              />
              <TafsirToggle
                enabled={includeTafsir}
                onChange={setIncludeTafsir}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
