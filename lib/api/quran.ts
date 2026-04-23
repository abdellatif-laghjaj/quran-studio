import type {
  ChaptersResponse,
  VersesResponse,
  RecitersResponse,
  AudioFilesResponse,
  Chapter,
  Verse,
  Reciter,
  AudioFile,
} from "@/types/quran"

const BASE_URL = "https://api.qurancdn.com/api/qdc"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Quran API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchChapters(): Promise<Chapter[]> {
  const data = await fetchJSON<ChaptersResponse>(
    `${BASE_URL}/chapters?language=en`
  )
  return data.chapters
}

export async function fetchVerses(
  chapterId: number,
  page = 1,
  perPage = 50
): Promise<{ verses: Verse[]; totalPages: number }> {
  const data = await fetchJSON<VersesResponse>(
    `${BASE_URL}/verses/by_chapter/${chapterId}?translations=131&fields=text_uthmani&per_page=${perPage}&page=${page}`
  )
  return {
    verses: data.verses,
    totalPages: data.pagination.total_pages,
  }
}

export async function fetchAllVerses(chapterId: number): Promise<Verse[]> {
  const firstPage = await fetchVerses(chapterId, 1, 50)
  const allVerses = [...firstPage.verses]

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const result = await fetchVerses(chapterId, page, 50)
    allVerses.push(...result.verses)
  }

  return allVerses
}

export async function fetchReciters(): Promise<Reciter[]> {
  const data = await fetchJSON<RecitersResponse>(
    `${BASE_URL}/audio/reciters?language=en`
  )
  return data.reciters
}

export async function fetchAudioFiles(
  reciterId: number,
  chapterNumber: number
): Promise<AudioFile[]> {
  const data = await fetchJSON<AudioFilesResponse>(
    `${BASE_URL}/audio/reciters/${reciterId}/audio_files?chapter_number=${chapterNumber}&segments=true`
  )
  return data.audio_files
}

export function getVerseAudioUrl(
  reciterId: number,
  verseNumber: number
): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${verseNumber}.mp3`
}
