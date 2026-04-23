export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5"

export const RESOLUTIONS: Record<AspectRatio, { w: number; h: number }> = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
  "1:1": { w: 1080, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
}

export type QuranicFont =
  | "Amiri"
  | "Noto Naskh Arabic"
  | "Aref Ruqaa"
  | "Cairo"
  | "Tajawal"

export type VerseTransition = "none" | "fade" | "slideUp"
export type TextAnimation = "none" | "fadeIn" | "wordByWord"
export type KenBurnsDirection = "in" | "out" | "pan-left" | "pan-right"
export type BackgroundType = "video" | "gradient"

export const QURANIC_FONTS: QuranicFont[] = [
  "Amiri",
  "Noto Naskh Arabic",
  "Aref Ruqaa",
  "Cairo",
  "Tajawal",
]

export const FONT_FILE_MAP: Record<QuranicFont, string> = {
  Amiri: "/fonts/Amiri-Bold.ttf",
  "Noto Naskh Arabic": "/fonts/NotoNaskhArabic.ttf",
  "Aref Ruqaa": "/fonts/ArefRuqaa-Bold.ttf",
  Cairo: "/fonts/Cairo.ttf",
  Tajawal: "/fonts/Tajawal-Bold.ttf",
}

export const GRADIENT_PRESETS = [
  // Sunset
  ["#0f0c29", "#302b63", "#24243e"],
  // Ocean Night
  ["#0a1628", "#1a3a5c", "#0d4f6b"],
  // Desert Dusk
  ["#2c1810", "#6b3a2a", "#c6764e"],
  // Emerald Forest
  ["#0a2f1f", "#1a5c3a", "#2d8659"],
  // Royal Purple
  ["#1a0a2e", "#3d1f5c", "#6b3fa0"],
  // Night Sky
  ["#020024", "#090979", "#0d5e9e"],
  // Warm Marble
  ["#1a1a2e", "#3d3d5c", "#8e6c4a"],
  // Islamic Gold
  ["#1a1500", "#3d3200", "#8b7300"],
] as const

export interface EditorConfig {
  // Quran
  chapterId: number
  startAyah: number
  endAyah: number
  reciterId: number
  showTranslation: boolean
  translationId: number
  showVerseNumber: boolean

  // Video
  aspectRatio: AspectRatio
  durationPerVerse: number | "auto"

  // Background
  backgroundType: BackgroundType
  pixabayVideoUrl: string | null
  gradientPreset: number
  backgroundDimness: number
  backgroundBlur: number

  // Style
  font: QuranicFont
  fontSize: number
  textColor: string
  textShadow: boolean
  textShadowColor: string
  textShadowBlur: number
  textAlignment: "center" | "right"
  overlayGradient: boolean
  overlayIntensity: number

  // Effects
  kenBurns: boolean
  kenBurnsDirection: KenBurnsDirection
  verseTransition: VerseTransition
  textAnimation: TextAnimation
  vignette: boolean
  vignetteIntensity: number
  particles: boolean
  particleDensity: number
}

export const DEFAULT_CONFIG: EditorConfig = {
  chapterId: 1,
  startAyah: 1,
  endAyah: 7,
  reciterId: 7,
  showTranslation: true,
  translationId: 131,
  showVerseNumber: true,

  aspectRatio: "16:9",
  durationPerVerse: "auto",

  backgroundType: "gradient",
  pixabayVideoUrl: null,
  gradientPreset: 0,
  backgroundDimness: 0.4,
  backgroundBlur: 0,

  font: "Amiri",
  fontSize: 48,
  textColor: "#ffffff",
  textShadow: true,
  textShadowColor: "#000000",
  textShadowBlur: 8,
  textAlignment: "center",
  overlayGradient: true,
  overlayIntensity: 0.5,

  kenBurns: true,
  kenBurnsDirection: "in",
  verseTransition: "fade",
  textAnimation: "fadeIn",
  vignette: true,
  vignetteIntensity: 0.4,
  particles: false,
  particleDensity: 0.5,
}

export type ExportStatus =
  | "idle"
  | "preparing"
  | "recording"
  | "transcoding"
  | "done"
  | "error"

export interface ExportState {
  status: ExportStatus
  progress: number
  currentVerse: number
  totalVerses: number
  error: string | null
}
