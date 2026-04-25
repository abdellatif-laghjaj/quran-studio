"use client"

import { useEffect, useMemo, useRef } from "react"
import { useEditorStore } from "@/lib/store/editorStore"
import { useAssetStore } from "@/lib/store/assetStore"
import { fetchChapters, fetchAllVerses, fetchReciters } from "@/lib/api/quran"

/**
 * useQuranData handles all Quran data fetching.
 * The fetch effects run only once via refs to prevent duplicate fetches
 * from multiple components calling this hook simultaneously.
 */
export function useQuranData() {
  const chapterId = useEditorStore((s) => s.chapterId)
  const startAyah = useEditorStore((s) => s.startAyah)
  const endAyah = useEditorStore((s) => s.endAyah)
  const reciterId = useEditorStore((s) => s.reciterId)
  const {
    chapters,
    setChapters,
    chaptersLoading,
    setChaptersLoading,
    verses,
    setVerses,
    versesLoading,
    setVersesLoading,
    reciters,
    setReciters,
    recitersLoading,
    setRecitersLoading,
  } = useAssetStore()

  // Use refs to prevent duplicate fetches when multiple components use this hook
  const chaptersFetchedRef = useRef(false)
  const recitersFetchedRef = useRef(false)

  // Fetch chapters once
  useEffect(() => {
    if (chapters.length > 0 || chaptersFetchedRef.current) return
    chaptersFetchedRef.current = true

    setChaptersLoading(true)
    fetchChapters()
      .then((data) => setChapters(data))
      .catch((err) => console.error("Failed to fetch chapters:", err))
      .finally(() => setChaptersLoading(false))
  }, [chapters.length, setChapters, setChaptersLoading])

  // Fetch reciters once
  useEffect(() => {
    if (reciters.length > 0 || recitersFetchedRef.current) return
    recitersFetchedRef.current = true

    setRecitersLoading(true)
    fetchReciters()
      .then((data) => setReciters(data))
      .catch((err) => console.error("Failed to fetch reciters:", err))
      .finally(() => setRecitersLoading(false))
  }, [reciters.length, setReciters, setRecitersLoading])

  // Fetch verses when chapter changes
  useEffect(() => {
    setVersesLoading(true)
    fetchAllVerses(chapterId)
      .then((data) => setVerses(data))
      .catch((err) => console.error("Failed to fetch verses:", err))
      .finally(() => setVersesLoading(false))
  }, [chapterId, setVerses, setVersesLoading])

  // Get verses in the selected range (memoized for stable reference)
  const selectedVerses = useMemo(
    () =>
      verses.filter(
        (v) => v.verse_number >= startAyah && v.verse_number <= endAyah
      ),
    [verses, startAyah, endAyah]
  )

  // Get current chapter
  const currentChapter = chapters.find((c) => c.id === chapterId)

  // Get current reciter
  const currentReciter = reciters.find((r) => r.id === reciterId)

  return {
    chapters,
    chaptersLoading,
    verses,
    selectedVerses,
    versesLoading,
    reciters,
    recitersLoading,
    currentChapter,
    currentReciter,
  }
}
