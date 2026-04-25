export interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  revelation_place: string
  translated_name: { name: string; language_name: string }
}

export interface Verse {
  id: number
  verse_number: number
  verse_key: string
  text_uthmani: string
  translations?: Translation[]
}

export interface Translation {
  id: number
  translation: string
  resource_id: number
  resource_name?: string
}

export interface Reciter {
  id: number
  reciter_name: string
  style: string | null
  translated_name: { name: string; language_name: string }
}

export interface AudioFile {
  verse_key: string
  url: string
}

export interface ChaptersResponse {
  chapters: Chapter[]
}

export interface VersesResponse {
  verses: Verse[]
  pagination: {
    per_page: number
    current_page: number
    next_page: number | null
    total_pages: number
  }
}

export interface RecitersResponse {
  recitations: Reciter[]
}

export interface AudioFilesResponse {
  audio_files: AudioFile[]
}
