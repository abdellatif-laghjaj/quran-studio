"use client"

import { create } from "zustand"
import {
  type Chapter,
  type Verse,
  type Reciter,
  type AudioFile,
} from "@/types/quran"
import type { PixabayVideoHit } from "@/types/pixabay"

interface AssetStore {
  // Quran data
  chapters: Chapter[]
  setChapters: (chapters: Chapter[]) => void
  verses: Verse[]
  setVerses: (verses: Verse[]) => void
  reciters: Reciter[]
  setReciters: (reciters: Reciter[]) => void
  audioFiles: AudioFile[]
  setAudioFiles: (files: AudioFile[]) => void

  // Audio buffers (decoded)
  audioBuffers: Map<string, ArrayBuffer>
  setAudioBuffer: (key: string, buffer: ArrayBuffer) => void
  clearAudioBuffers: () => void

  // Pixabay results
  pixabayResults: PixabayVideoHit[]
  setPixabayResults: (results: PixabayVideoHit[]) => void

  // Loading states
  chaptersLoading: boolean
  setChaptersLoading: (loading: boolean) => void
  versesLoading: boolean
  setVersesLoading: (loading: boolean) => void
  recitersLoading: boolean
  setRecitersLoading: (loading: boolean) => void
  audioLoading: boolean
  setAudioLoading: (loading: boolean) => void
  pixabayLoading: boolean
  setPixabayLoading: (loading: boolean) => void

  // Font loading
  loadedFonts: Set<string>
  addLoadedFont: (font: string) => void
}

export const useAssetStore = create<AssetStore>((set) => ({
  chapters: [],
  setChapters: (chapters) => set({ chapters }),

  verses: [],
  setVerses: (verses) => set({ verses }),

  reciters: [],
  setReciters: (reciters) => set({ reciters }),

  audioFiles: [],
  setAudioFiles: (files) => set({ audioFiles: files }),

  audioBuffers: new Map(),
  setAudioBuffer: (key, buffer) =>
    set((state) => {
      const next = new Map(state.audioBuffers)
      next.set(key, buffer)
      return { audioBuffers: next }
    }),
  clearAudioBuffers: () => set({ audioBuffers: new Map() }),

  pixabayResults: [],
  setPixabayResults: (results) => set({ pixabayResults: results }),

  chaptersLoading: false,
  setChaptersLoading: (loading) => set({ chaptersLoading: loading }),
  versesLoading: false,
  setVersesLoading: (loading) => set({ versesLoading: loading }),
  recitersLoading: false,
  setRecitersLoading: (loading) => set({ recitersLoading: loading }),
  audioLoading: false,
  setAudioLoading: (loading) => set({ audioLoading: loading }),
  pixabayLoading: false,
  setPixabayLoading: (loading) => set({ pixabayLoading: loading }),

  loadedFonts: new Set(),
  addLoadedFont: (font) =>
    set((state) => {
      const next = new Set(state.loadedFonts)
      next.add(font)
      return { loadedFonts: next }
    }),
}))
