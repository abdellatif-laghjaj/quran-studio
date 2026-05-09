export interface VideoConfig {
  surahId: number;
  verseStart: number;
  verseEnd: number;
  audioSource: "reciter" | "custom";
  reciterId: number | string;
  customAudioUrl: string | null;
  customAudioName: string | null;
  customAudioDurationMs: number | null;
  customVerseTimings: Record<string, { startMs: number; endMs: number }>;
  fontFamily: string;
  fontSize: number;
  wordSpacing: number;
  // ayahMarkerFont removed
  textColor: string;
  backgroundColor: string;

  // Background Image Support
  backgroundType: "color" | "image" | "video";
  backgroundImage: string | null;
  backgroundVideo: string | null;
  backgroundVideoPoster: string | null;
  backgroundImageOpacity: number;
  backgroundImageX: number;
  backgroundImageY: number;

  aspectRatio: "9:16" | "16:9" | "1:1";
  showTranslation: boolean;
  translationColor: string;
  translationHighlightColor: string; // New: Highlight color for translation
  translationHighlightMode: "none" | "karaoke" | "word"; // New: Highlight mode
  translationFontFamily: string;
  translationFontSize: number;
  enableHighlight: boolean;
  highlightColor: string;
  showSurahHeader: boolean;
  surahHeaderColor: string;
  surahHeaderSize: number;
  surahHeaderY: number;
  showBismillah: boolean;
  bismillahColor: string;
  bismillahSize: number;
  bismillahY: number;
  quranTextY: number;
  translationY: number;
  fontPalette: string;
  visualizationMode: "page" | "stream" | "page_v2";
  verseNumberColor: string;
}
