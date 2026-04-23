import type { QuranicFont } from "@/types/editor"

/**
 * Measure the width of Arabic text with the given font and size.
 * Uses a temporary canvas to measure.
 */
export function measureTextWidth(
  text: string,
  font: QuranicFont,
  fontSize: number
): number {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  ctx.font = `${fontSize}px '${font}'`
  return ctx.measureText(text).width
}

/**
 * Split Arabic text into words. Arabic words are separated by spaces.
 * We must not split mid-word.
 */
export function splitArabicWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0)
}

/**
 * Wrap Arabic text into lines that fit within maxWidth.
 * Returns array of lines, each being a string of words joined by spaces.
 */
export function wrapArabicText(
  text: string,
  font: QuranicFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = splitArabicWords(text)
  if (words.length === 0) return []

  const lines: string[] = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`
    const width = measureTextWidth(testLine, font, fontSize)

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
 * Calculate the total height needed for wrapped text lines.
 */
export function calculateTextHeight(
  lines: string[],
  fontSize: number,
  lineHeight = 1.6
): number {
  return lines.length * fontSize * lineHeight
}

/**
 * Convert Arabic verse number to Eastern Arabic numeral string.
 */
export function toArabicNumeral(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  return String(num)
    .split("")
    .map((d) => arabicNumerals[parseInt(d, 10)])
    .join("")
}

/**
 * Format verse number as an Arabic-style badge: ﴿١٢٣﴾
 */
export function formatVerseBadge(verseNumber: number): string {
  return `﴿${toArabicNumeral(verseNumber)}﴾`
}
