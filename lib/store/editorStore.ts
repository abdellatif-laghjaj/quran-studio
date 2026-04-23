"use client"

import { create } from "zustand"
import {
  type EditorConfig,
  DEFAULT_CONFIG,
  type ExportState,
} from "@/types/editor"

interface EditorStore extends EditorConfig {
  // Config setters
  setConfig: <K extends keyof EditorConfig>(
    key: K,
    value: EditorConfig[K]
  ) => void
  updateConfig: (partial: Partial<EditorConfig>) => void
  resetConfig: () => void

  // Preview state
  currentVerseIndex: number
  setCurrentVerseIndex: (index: number) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void

  // Export state
  exportState: ExportState
  setExportState: (state: Partial<ExportState>) => void
  resetExportState: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  ...DEFAULT_CONFIG,

  setConfig: (key, value) => set((state) => ({ ...state, [key]: value })),

  updateConfig: (partial) => set((state) => ({ ...state, ...partial })),

  resetConfig: () => set(DEFAULT_CONFIG),

  currentVerseIndex: 0,
  setCurrentVerseIndex: (index) => set({ currentVerseIndex: index }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  exportState: {
    status: "idle",
    progress: 0,
    currentVerse: 0,
    totalVerses: 0,
    error: null,
  },
  setExportState: (partial) =>
    set((state) => ({
      exportState: { ...state.exportState, ...partial },
    })),
  resetExportState: () =>
    set({
      exportState: {
        status: "idle",
        progress: 0,
        currentVerse: 0,
        totalVerses: 0,
        error: null,
      },
    }),
}))
