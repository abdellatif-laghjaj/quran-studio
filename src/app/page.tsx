"use client";

import { useState, useEffect, useCallback } from "react";
import { Lang, t } from "@/lib/i18n";
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
    } catch (e: any) {
      setError(e.message || t(lang, "error"));
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
        <div className="loading-ring" />
      </div>
    );
  }

  return (
    <>
      {/* Ambient backgrounds */}
      <div className="bg-ambient" />
      <div className="bg-pattern" />

      <main className="app-shell">
        {/* ══════ HERO ══════ */}
        <header className="hero anim-in">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "28px",
            }}
          >
            <LanguageSwitcher lang={lang} onChange={handleLangChange} />
          </div>

          <div className="hero-ornament">
            <div className="hero-ornament-line" />
            <div className="hero-ornament-dot" />
            <div
              className="hero-ornament-line"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          <h1 className="hero-title font-arabic">{t(lang, "appTitle")}</h1>
          <p className="hero-subtitle">{t(lang, "appSubtitle")}</p>
          <div className="hero-underline" />
        </header>

        {/* ══════ AUTO MODE ══════ */}
        <div className="panel anim-in d1">
          <AutoMode enabled={autoMode} onChange={setAutoMode} lang={lang} />
        </div>

        {/* ══════ PANEL 1: QURAN SELECTION ══════ */}
        <div className="panel anim-in d2">
          <div className="panel-header">
            <div className="panel-icon">📖</div>
            <div>
              <div className="panel-title">
                {lang === "ar"
                  ? "اختيار السورة والآيات"
                  : "Surah & Ayah Selection"}
              </div>
              <div className="panel-desc">
                {lang === "ar"
                  ? "حدد السورة ونطاق الآيات المطلوبة"
                  : "Pick a surah and set the verse range"}
              </div>
            </div>
          </div>

          <SurahSelector
            chapters={chapters}
            selected={selectedSurah}
            onChange={setSelectedSurah}
            lang={lang}
          />

          <div className="panel-divider" />

          <AyahRangePicker
            maxVerses={maxVerses}
            startAyah={startAyah}
            endAyah={endAyah}
            onStartChange={setStartAyah}
            onEndChange={setEndAyah}
            lang={lang}
          />

          {!autoMode && (
            <>
              <div className="panel-divider" />
              <ReciterSelector
                reciters={reciters}
                selected={selectedReciter}
                onChange={setSelectedReciter}
                lang={lang}
              />
            </>
          )}
        </div>

        {/* ══════ PANEL 2: VISUAL DESIGN ══════ */}
        <div className="panel anim-in d3">
          <div className="panel-header">
            <div className="panel-icon">🎨</div>
            <div>
              <div className="panel-title">
                {lang === "ar" ? "التصميم المرئي" : "Visual Design"}
              </div>
              <div className="panel-desc">
                {lang === "ar"
                  ? "الخلفية والسطوع والأبعاد والخط"
                  : "Theme, brightness, aspect ratio & font"}
              </div>
            </div>
          </div>

          {!autoMode && (
            <>
              <ThemeSelector selected={theme} onChange={setTheme} lang={lang} />
              <div className="panel-divider" />
            </>
          )}

          <BrightnessControl
            value={dimOpacity}
            onChange={setDimOpacity}
            lang={lang}
          />

          <div className="panel-divider" />

          <div className="grid-2">
            <AspectRatioSelector
              selected={aspectRatio}
              onChange={(id, w, h) => {
                setAspectRatio(id);
                setVideoWidth(w);
                setVideoHeight(h);
              }}
              lang={lang}
            />
            <FontSelector
              selected={fontFile}
              onChange={setFontFile}
              lang={lang}
            />
          </div>
        </div>

        {/* ══════ PANEL 3: EXTRAS ══════ */}
        <div className="panel anim-in d4">
          <div className="panel-header">
            <div className="panel-icon">⚙️</div>
            <div>
              <div className="panel-title">
                {lang === "ar" ? "خيارات إضافية" : "Extra Options"}
              </div>
            </div>
          </div>
          <TafsirToggle
            enabled={includeTafsir}
            onChange={setIncludeTafsir}
            lang={lang}
          />
        </div>

        {/* ══════ ERROR ══════ */}
        {error && (
          <div
            className="panel fade-in"
            style={{
              borderColor: "rgba(239,83,80,0.25)",
              background: "rgba(239,83,80,0.04)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#ef5350",
                fontWeight: 600,
                fontSize: "15px",
                marginBottom: "14px",
              }}
            >
              {error}
            </p>
            <button
              onClick={() => setError("")}
              style={{
                padding: "8px 24px",
                background: "transparent",
                border: "1px solid rgba(239,83,80,0.3)",
                color: "#ef5350",
                borderRadius: "var(--r-sm)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {t(lang, "tryAgain")}
            </button>
          </div>
        )}

        {/* ══════ GENERATE ══════ */}
        <div className="anim-in d5">
          <GenerateButton
            loading={loading}
            progress={progress}
            statusText={statusText}
            onClick={handleGenerate}
            disabled={!chapters.length}
            lang={lang}
          />
        </div>

        {/* ══════ VIDEO PREVIEW ══════ */}
        <VideoPreview videoUrl={videoUrl} lang={lang} />

        {/* ══════ FOOTER ══════ */}
        <footer className="app-footer">
          <p>
            {lang === "ar"
              ? "مُولِّد فيديو القرآن — بيانات من Quran.com | فيديوهات من Pixabay"
              : "Quran Video Generator — Data from Quran.com | Videos from Pixabay"}
          </p>
        </footer>
      </main>
    </>
  );
}
