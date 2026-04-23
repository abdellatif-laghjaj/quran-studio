"use client"

import { useEffect, useMemo } from "react"
import { useEditorStore } from "@/lib/store/editorStore"
import { useAssetStore } from "@/lib/store/assetStore"
import { fetchChapters, fetchAllVerses, fetchReciters } from "@/lib/api/quran"

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

  // Fetch chapters on mount
  useEffect(() => {
    if (chapters.length > 0) return

    let cancelled = false
    setChaptersLoading(true)

    fetchChapters()
      .then((data) => {
        if (!cancelled) setChapters(data)
      })
      .catch((err) => {
        console.error("Failed to fetch chapters:", err)
      })
      .finally(() => {
        if (!cancelled) setChaptersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [chapters.length, setChapters, setChaptersLoading])

  // Fetch reciters on mount
  useEffect(() => {
    if (reciters.length > 0) return

    let cancelled = false
    setRecitersLoading(true)

    fetchReciters()
      .then((data) => {
        if (!cancelled) setReciters(data)
      })
      .catch((err) => {
        console.error("Failed to fetch reciters:", err)
      })
      .finally(() => {
        if (!cancelled) setRecitersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reciters.length, setReciters, setRecitersLoading])

  // Fetch verses when chapter changes
  useEffect(() => {
    let cancelled = false
    setVersesLoading(true)

    fetchAllVerses(chapterId)
      .then((data) => {
        if (!cancelled) setVerses(data)
      })
      .catch((err) => {
        console.error("Failed to fetch verses:", err)
      })
      .finally(() => {
        if (!cancelled) setVersesLoading(false)
      })

    return () => {
      cancelled = true
    }
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
