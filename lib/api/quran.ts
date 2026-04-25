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

export async function fetchChapterAudioSegments(
  reciterId: number,
  chapterNumber: number
): Promise<Map<string, { start: number; end: number; duration: number }>> {
  const audioFiles = await fetchAudioFiles(reciterId, chapterNumber)
  const segments = new Map<
    string,
    { start: number; end: number; duration: number }
  >()

  for (const file of audioFiles) {
    // Each audio file covers a range of verses
    // The segments field contains timestamp data for each verse
    if (file.segments) {
      for (const [verseKey, timings] of Object.entries(file.segments)) {
        const seg = timings as {
          start?: number
          end?: number
          duration?: number
        }
        segments.set(verseKey, {
          start: seg.start ?? 0,
          end: seg.end ?? seg.start ?? 0,
          duration: seg.duration ?? (seg.end ? seg.end - (seg.start ?? 0) : 0),
        })
      }
    }
  }

  return segments
}

export function getVerseAudioUrl(
  reciterId: number,
  verseNumber: number
): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${verseNumber}.mp3`
}

export function getChapterAudioUrl(
  reciterId: number,
  chapterNumber: number
): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${chapterNumber}.mp3`
}
