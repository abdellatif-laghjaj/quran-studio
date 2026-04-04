import axios from "axios";

const BASE = "https://api.quran.com/api/v4";

export interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  translated_name: { name: string; language_name: string };
}

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: { name: string; language_name: string };
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
}

export interface AudioFile {
  verse_key: string;
  url: string;
}

/** Retry wrapper — retries up to 3 times with exponential backoff */
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isTransient = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNABORTED",
        "ERR_SOCKET_CONNECTION_TIMEOUT",
      ].includes(err?.code);
      if (!isTransient || i === retries - 1) throw err;
      const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
      console.log(
        `[quran-api] Retry ${i + 1}/${retries} after ${delay}ms (${err.code})`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Retry exhausted");
}

export async function getChapters(): Promise<Chapter[]> {
  const { data } = await withRetry(() => axios.get(`${BASE}/chapters`));
  return data.chapters;
}

export async function getReciters(): Promise<Reciter[]> {
  const { data } = await withRetry(() =>
    axios.get(`${BASE}/resources/recitations`),
  );
  return data.recitations;
}

export async function getVerses(
  chapter: number,
  from: number,
  to: number,
): Promise<Verse[]> {
  const verses: Verse[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data } = await withRetry(() =>
      axios.get(`${BASE}/verses/by_chapter/${chapter}`, {
        params: {
          language: "ar",
          fields: "text_uthmani",
          per_page: 50,
          page,
        },
      }),
    );
    totalPages = data.pagination.total_pages;
    const filtered = data.verses.filter(
      (v: Verse) => v.verse_number >= from && v.verse_number <= to,
    );
    verses.push(...filtered);
    page++;
    if (data.verses.some((v: Verse) => v.verse_number >= to)) break;
  }

  return verses;
}

export async function getAudioFiles(
  reciterId: number,
  chapter: number,
): Promise<AudioFile[]> {
  const allFiles: AudioFile[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data } = await withRetry(() =>
      axios.get(`${BASE}/recitations/${reciterId}/by_chapter/${chapter}`, {
        params: { per_page: 50, page },
      }),
    );
    totalPages = data.pagination.total_pages;
    allFiles.push(...data.audio_files);
    page++;
  }

  return allFiles;
}

export async function getTafsir(
  chapter: number,
  verseNumber: number,
  tafsirId: number = 16,
): Promise<string> {
  try {
    const { data } = await withRetry(() =>
      axios.get(
        `${BASE}/tafsirs/${tafsirId}/by_ayah/${chapter}:${verseNumber}`,
      ),
    );
    return data.tafsir?.text || "";
  } catch {
    return "";
  }
}

export function getAudioUrl(relativeUrl: string): string {
  return `https://verses.quran.com/${relativeUrl}`;
}
