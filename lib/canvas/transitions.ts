import type { VerseTransition, TextAnimation } from "@/types/editor"

/**
 * Calculate the transition opacity for a verse.
 * Returns 0–1 opacity based on progress and transition type.
 */
export function getTransitionOpacity(
  progress: number, // 0–1 over the verse duration
  transition: VerseTransition
): number {
  switch (transition) {
    case "none":
      return 1
    case "fade": {
      // Fade in during first 10%, fade out during last 10%
      if (progress < 0.1) return progress / 0.1
      if (progress > 0.9) return (1 - progress) / 0.1
      return 1
    }
    case "slideUp": {
      // Quick slide up in first 15%, fade out in last 10%
      if (progress < 0.15) {
        const t = progress / 0.15
        return t // opacity
      }
      if (progress > 0.9) {
        return (1 - progress) / 0.1
      }
      return 1
    }
  }
}

/**
 * Calculate the Y offset for slide-up transition.
 */
export function getTransitionYOffset(
  progress: number,
  transition: VerseTransition,
  canvasHeight: number
): number {
  switch (transition) {
    case "none":
    case "fade":
      return 0
    case "slideUp": {
      if (progress < 0.15) {
        const t = progress / 0.15
        return canvasHeight * 0.05 * (1 - t)
      }
      return 0
    }
  }
}

/**
 * Calculate text animation progress.
 * Returns a value that determines how much of the text is visible.
 */
export function getTextAnimationProgress(
  progress: number, // 0–1 over verse duration
  animation: TextAnimation
): number {
  switch (animation) {
    case "none":
      return 1
    case "fadeIn": {
      if (progress < 0.15) return progress / 0.15
      return 1
    }
    case "wordByWord": {
      // Words appear one by one over first 40% of duration
      if (progress < 0.4) return progress / 0.4
      return 1
    }
  }
}

/**
 * Get the number of words that should be visible given word-by-word animation.
 */
export function getVisibleWordCount(
  totalWords: number,
  animProgress: number
): number {
  return Math.ceil(totalWords * animProgress)
}
