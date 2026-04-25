import type {
  ChaptersResponse,
  VersesResponse,
  RecitersResponse,
  Chapter,
  Verse,
  Reciter,
  AudioFile,
} from "@/types/quran"

const BASE_URL = "https://api.quran.com/api/v4"

/** Retry wrapper — retries up to 3 times with exponential backoff */
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err: any) {
      const isTransient = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNABORTED",
        "ERR_SOCKET_CONNECTION_TIMEOUT",
      ].includes(err?.code)
      if (!isTransient || i === retries - 1) throw err
      const delay = 1000 * Math.pow(2, i)
      console.log(
        `[quran-api] Retry ${i + 1}/${retries} after ${delay}ms (${err.code})`
      )
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw new Error("Retry exhausted")
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Quran API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function getChapters(): Promise<Chapter[]> {
  const data = await withRetry(() =>
    fetchJSON<ChaptersResponse>(`${BASE_URL}/chapters`)
  )
  return data.chapters
}

export async function getReciters(): Promise<Reciter[]> {
  const data = await withRetry(() =>
    fetchJSON<RecitersResponse>(`${BASE_URL}/resources/recitations`)
  )
  return data.recitations
}

export async function getVerses(
  chapter: number,
  from: number,
  to: number
): Promise<Verse[]> {
  const verses: Verse[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const url = `${BASE_URL}/verses/by_chapter/${chapter}?language=ar&fields=text_uthmani&translations=131&per_page=50&page=${page}`
    const data = await withRetry(() => fetchJSON<VersesResponse>(url))
    totalPages = data.pagination.total_pages

    const filtered = data.verses.filter(
      (v: Verse) => v.verse_number >= from && v.verse_number <= to
    )
    verses.push(...filtered)
    page++

    if (data.verses.some((v: Verse) => v.verse_number >= to)) break
  }

  return verses
}

export async function getAudioFiles(
  reciterId: number,
  chapter: number
): Promise<AudioFile[]> {
  const allFiles: AudioFile[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const data = await withRetry(() =>
      fetchJSON<{
        audio_files: AudioFile[]
        pagination: { total_pages: number }
      }>(
        `${BASE_URL}/recitations/${reciterId}/by_chapter/${chapter}?per_page=50&page=${page}`
      )
    )
    totalPages = data.pagination.total_pages
    allFiles.push(...data.audio_files)
    page++
  }

  return allFiles
}

export function getAudioUrl(relativeUrl: string): string {
  return `https://verses.quran.com/${relativeUrl}`
}

// Legacy exports for backward compatibility with existing code
export const fetchChapters = getChapters
export const fetchReciters = getReciters

export async function fetchAllVerses(chapterId: number): Promise<Verse[]> {
  const data = await withRetry(() =>
    fetchJSON<VersesResponse>(
      `${BASE_URL}/verses/by_chapter/${chapterId}?language=ar&fields=text_uthmani&translations=131&per_page=50`
    )
  )
  return data.verses
}

export async function fetchChapterAudioSegments(
  reciterId: number,
  chapterNumber: number
): Promise<Map<string, { start: number; end: number; duration: number }>> {
  return new Map()
}

export function getChapterAudioUrl(
  reciterId: number,
  chapterNumber: number
): string {
  return `https://verses.quran.com/${reciterId}/${chapterNumber}.mp3`
}

export const fetchAudioFiles = getAudioFiles

export function getVerseAudioUrl(
  reciterId: number,
  verseNumber: number
): string {
  return `https://verses.quran.com/${reciterId}/${verseNumber}.mp3`
}
