import type { PixabaySearchResponse, PixabayVideoHit } from "@/types/pixabay"

const PIXABAY_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY

export function hasPixabayKey(): boolean {
  return !!PIXABAY_KEY
}

export async function searchPixabayVideos(
  query: string,
  perPage = 20
): Promise<PixabayVideoHit[]> {
  if (!PIXABAY_KEY) {
    throw new Error("Missing NEXT_PUBLIC_PIXABAY_API_KEY — see .env.example")
  }

  const params = new URLSearchParams({
    key: PIXABAY_KEY,
    q: query,
    video_type: "all",
    per_page: String(perPage),
    safesearch: "true",
  })

  const res = await fetch(`https://pixabay.com/api/videos/?${params}`)
  if (!res.ok) {
    throw new Error(`Pixabay API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as PixabaySearchResponse
  return data.hits
}

export const PIXABAY_CATEGORIES = [
  "nature",
  "sky clouds",
  "rain water",
  "desert sand",
  "mountains",
  "ocean waves",
  "forest",
  "light bokeh",
  "islamic architecture",
] as const

export function getBestVideoUrl(hit: PixabayVideoHit, maxWidth = 1920): string {
  const { large, medium, small, tiny } = hit.videos

  // Pick the best quality that fits
  if (large.width <= maxWidth) return large.url
  if (medium.width <= maxWidth) return medium.url
  if (small.width <= maxWidth) return small.url
  return tiny.url
}
