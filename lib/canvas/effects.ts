import type { KenBurnsDirection } from "@/types/editor"

/**
 * Apply Ken Burns effect (slow zoom/pan) to the canvas context.
 * Returns a transform matrix that should be applied before drawing the background.
 */
export function applyKenBurns(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  progress: number, // 0 to 1 over verse duration
  direction: KenBurnsDirection
): void {
  const scale = getKenBurnsScale(progress, direction)
  const offset = getKenBurnsOffset(
    progress,
    direction,
    canvasWidth,
    canvasHeight,
    scale
  )

  ctx.save()
  ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y)
}

function getKenBurnsScale(
  progress: number,
  direction: KenBurnsDirection
): number {
  switch (direction) {
    case "in":
      return 1 + progress * 0.08
    case "out":
      return 1.08 - progress * 0.08
    case "pan-left":
    case "pan-right":
      return 1.04
  }
}

function getKenBurnsOffset(
  progress: number,
  direction: KenBurnsDirection,
  w: number,
  h: number,
  scale: number
): { x: number; y: number } {
  const overshootX = (w * (scale - 1)) / 2
  const overshootY = (h * (scale - 1)) / 2

  switch (direction) {
    case "in":
      return { x: -overshootX, y: -overshootY }
    case "out":
      return { x: -overshootX, y: -overshootY }
    case "pan-left":
      return {
        x: -overshootX - progress * overshootX * 2,
        y: -overshootY,
      }
    case "pan-right":
      return {
        x: -overshootX + progress * overshootX * 2,
        y: -overshootY,
      }
  }
}

/**
 * Draw a vignette overlay — dark edges fading to transparent center.
 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number // 0–1
): void {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.max(width, height) * 0.7

  const gradient = ctx.createRadialGradient(
    cx,
    cy,
    radius * 0.3,
    cx,
    cy,
    radius
  )
  gradient.addColorStop(0, `rgba(0,0,0,0)`)
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draw an overlay gradient from the bottom — helps text contrast.
 */
export function drawOverlayGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number // 0–1
): void {
  const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height)
  gradient.addColorStop(0, `rgba(0,0,0,0)`)
  gradient.addColorStop(0.5, `rgba(0,0,0,${intensity * 0.3})`)
  gradient.addColorStop(1, `rgba(0,0,0,${intensity * 0.7})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draw a dimming overlay for background.
 */
export function drawDimOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dimness: number // 0–1
): void {
  ctx.fillStyle = `rgba(0,0,0,${dimness})`
  ctx.fillRect(0, 0, width, height)
}

/**
 * Simple particle system — floating dots/sparkles.
 * Uses a seeded pseudo-random approach for deterministic rendering.
 */
export interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  phase: number
}

export function generateParticles(
  width: number,
  height: number,
  density: number // 0–1
): Particle[] {
  const count = Math.floor(density * 60)
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    // Simple deterministic pseudo-random using index
    const seed = i * 7919
    particles.push({
      x: ((seed * 13) % 1000) / 1000,
      y: ((seed * 17) % 1000) / 1000,
      size: (((seed * 23) % 1000) / 1000) * 2 + 0.5,
      speed: (((seed * 29) % 1000) / 1000) * 0.3 + 0.1,
      opacity: (((seed * 31) % 1000) / 1000) * 0.4 + 0.1,
      phase: ((seed * 37) % 1000) / 1000,
    })
  }

  return particles
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  time: number // seconds
): void {
  for (const p of particles) {
    const yOff = (p.speed * time) % 1
    const drawY = ((p.y + yOff) % 1) * height
    const drawX =
      p.x * width + Math.sin(time * 0.5 + p.phase * Math.PI * 2) * 20
    const flicker = 0.5 + 0.5 * Math.sin(time * 2 + p.phase * Math.PI * 2)

    ctx.beginPath()
    ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${p.opacity * flicker})`
    ctx.fill()
  }
}
