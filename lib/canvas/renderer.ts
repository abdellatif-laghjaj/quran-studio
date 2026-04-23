import type { EditorConfig } from "@/types/editor"
import type { Verse } from "@/types/quran"
import { RESOLUTIONS, GRADIENT_PRESETS, FONT_FILE_MAP } from "@/types/editor"
import {
  wrapArabicText,
  formatVerseBadge,
  calculateTextHeight,
} from "./textLayout"
import {
  applyKenBurns,
  drawVignette,
  drawOverlayGradient,
  drawDimOverlay,
  drawParticles,
  generateParticles,
  type Particle,
} from "./effects"
import {
  getTransitionOpacity,
  getTransitionYOffset,
  getTextAnimationProgress,
  getVisibleWordCount,
} from "./transitions"

// Cache particles per render session
let cachedParticles: Particle[] | null = null

/**
 * Load a font via the FontFace API. Must be called before rendering.
 */
export async function loadFont(fontName: string): Promise<void> {
  const fontPath = FONT_FILE_MAP[fontName as keyof typeof FONT_FILE_MAP]
  if (!fontPath) return

  // Check if already loaded
  const loadedFaces = [...document.fonts]
  if (loadedFaces.some((f) => f.family === `'${fontName}'`)) return

  try {
    const font = new FontFace(fontName, `url(${fontPath})`)
    await font.load()
    document.fonts.add(font)
  } catch (err) {
    console.warn(`Failed to load font ${fontName}:`, err)
  }
}

/**
 * Draw a CSS gradient onto the canvas.
 */
function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  presetIndex: number
): void {
  const colors = GRADIENT_PRESETS[presetIndex] ?? GRADIENT_PRESETS[0]
  const gradient = ctx.createLinearGradient(0, 0, width * 0.3, height)

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Core render function — draws one frame of the video onto the canvas.
 *
 * @param ctx - Canvas 2D context
 * @param config - Editor configuration
 * @param verse - Current verse data
 * @param videoEl - Background video element (or null for gradient)
 * @param progress - 0–1 progress through the current verse duration
 * @param time - Total elapsed time in seconds (for particle animation)
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  config: EditorConfig,
  verse: Verse,
  videoEl: HTMLVideoElement | null,
  progress: number,
  time: number
): void {
  const { w, h } = RESOLUTIONS[config.aspectRatio]
  const canvas = ctx.canvas

  // Scale for preview (canvas may be smaller than target res)
  const scaleX = canvas.width / w
  const scaleY = canvas.height / h
  const scale = Math.min(scaleX, scaleY)

  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Scale to fit preview
  const offsetX = (canvas.width - w * scale) / 2
  const offsetY = (canvas.height - h * scale) / 2
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)

  // 1. Draw background
  if (config.backgroundType === "video" && videoEl) {
    // Ken Burns effect
    if (config.kenBurns) {
      applyKenBurns(ctx, w, h, progress, config.kenBurnsDirection)
    }

    ctx.drawImage(videoEl, 0, 0, w, h)

    if (config.kenBurns) {
      ctx.restore() // from Ken Burns save
    }

    // Blur overlay (simulated with semi-transparent color since canvas blur is expensive)
    if (config.backgroundBlur > 0) {
      // We skip real-time blur in preview for performance
      // Blur will be applied during export with offscreen canvas
    }
  } else {
    drawGradientBackground(ctx, w, h, config.gradientPreset)
  }

  // 2. Dim overlay
  drawDimOverlay(ctx, w, h, config.backgroundDimness)

  // 3. Vignette
  if (config.vignette) {
    drawVignette(ctx, w, h, config.vignetteIntensity)
  }

  // 4. Overlay gradient for text contrast
  if (config.overlayGradient) {
    drawOverlayGradient(ctx, w, h, config.overlayIntensity)
  }

  // 5. Particles
  if (config.particles) {
    if (!cachedParticles) {
      cachedParticles = generateParticles(w, h, config.particleDensity)
    }
    drawParticles(ctx, w, h, cachedParticles, time)
  }

  // 6. Draw Arabic text
  const transitionOpacity = getTransitionOpacity(
    progress,
    config.verseTransition
  )
  const yOffset = getTransitionYOffset(progress, config.verseTransition, h)
  const textAnimProgress = getTextAnimationProgress(
    progress,
    config.textAnimation
  )

  ctx.globalAlpha = transitionOpacity

  const fontSize = config.fontSize * (h / 1080) // Scale relative to 1080p
  const lineHeight = 1.6
  const maxTextWidth = w * 0.85
  const textX = config.textAlignment === "center" ? w / 2 : w * 0.85

  ctx.direction = "rtl"
  ctx.textAlign = config.textAlignment === "center" ? "center" : "right"
  ctx.font = `${fontSize}px '${config.font}'`
  ctx.fillStyle = config.textColor

  // Text shadow
  if (config.textShadow) {
    ctx.shadowColor = config.textShadowColor
    ctx.shadowBlur = config.textShadowBlur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
  }

  const lines = wrapArabicText(
    verse.text_uthmani,
    config.font,
    fontSize,
    maxTextWidth
  )

  const totalTextHeight = calculateTextHeight(lines, fontSize, lineHeight)
  // Position text in center-lower area
  const baseY = h * 0.5 - totalTextHeight / 2 + yOffset

  if (config.textAnimation === "wordByWord") {
    // Draw word by word
    const words = verse.text_uthmani.split(/\s+/)
    const visibleCount = getVisibleWordCount(words.length, textAnimProgress)
    const visibleText = words.slice(0, visibleCount).join(" ")
    const wordLines = wrapArabicText(
      visibleText,
      config.font,
      fontSize,
      maxTextWidth
    )
    const wordTextHeight = calculateTextHeight(wordLines, fontSize, lineHeight)
    const wordBaseY = h * 0.5 - wordTextHeight / 2 + yOffset

    for (let i = 0; i < wordLines.length; i++) {
      const ly = wordBaseY + (i + 1) * fontSize * lineHeight
      ctx.fillText(wordLines[i], textX, ly)
    }
  } else {
    // Draw full text
    if (textAnimProgress < 1) {
      ctx.globalAlpha = transitionOpacity * textAnimProgress
    }

    for (let i = 0; i < lines.length; i++) {
      const ly = baseY + (i + 1) * fontSize * lineHeight
      ctx.fillText(lines[i], textX, ly)
    }
  }

  // Reset shadow
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 7. Draw translation
  if (config.showTranslation && verse.translations?.[0]) {
    const transFontSize = fontSize * 0.4
    ctx.direction = "ltr"
    ctx.textAlign = "center"
    ctx.font = `${transFontSize}px 'Figtree', sans-serif`
    ctx.fillStyle = `rgba(255,255,255,${0.7 * transitionOpacity})`

    const translation = verse.translations[0].translation
    // Simple wrap for translation
    const transLines = wrapTranslationText(
      translation,
      transFontSize,
      maxTextWidth
    )
    const transBaseY = baseY + totalTextHeight + transFontSize * 2

    for (let i = 0; i < Math.min(transLines.length, 3); i++) {
      const ly = transBaseY + i * transFontSize * 1.5
      ctx.fillText(transLines[i], w / 2, ly)
    }
  }

  // 8. Draw verse number badge
  if (config.showVerseNumber) {
    const badgeText = formatVerseBadge(verse.verse_number)
    const badgeFontSize = fontSize * 0.35
    ctx.direction = "rtl"
    ctx.textAlign = "center"
    ctx.font = `${badgeFontSize}px '${config.font}'`
    ctx.fillStyle = `rgba(255,255,255,${0.5 * transitionOpacity})`
    ctx.fillText(badgeText, w / 2, h * 0.88)
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

/**
 * Simple word-wrap for English translation text.
 */
function wrapTranslationText(
  text: string,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = words[0] ?? ""

  // Reuse a single temp canvas for all measurements
  const tempCanvas = document.createElement("canvas")
  const tempCtx = tempCanvas.getContext("2d")!
  tempCtx.font = `${fontSize}px 'Figtree', sans-serif`

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`
    const width = tempCtx.measureText(testLine).width

    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = words[i]
    }
  }

  lines.push(currentLine)
  return lines
}

/**
 * Reset particle cache (call when config changes).
 */
export function resetParticleCache(): void {
  cachedParticles = null
}
