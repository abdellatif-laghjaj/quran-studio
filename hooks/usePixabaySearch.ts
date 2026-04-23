"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  searchPixabayVideos,
  hasPixabayKey,
  PIXABAY_CATEGORIES,
} from "@/lib/api/pixabay"
import { useAssetStore } from "@/lib/store/assetStore"
import type { PixabayVideoHit } from "@/types/pixabay"

export function usePixabaySearch() {
  const {
    pixabayResults,
    setPixabayResults,
    pixabayLoading,
    setPixabayLoading,
  } = useAssetStore()

  const [query, setQuery] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return
      setPixabayLoading(true)
      try {
        const results = await searchPixabayVideos(searchQuery)
        setPixabayResults(results)
      } catch (err) {
        console.error("Pixabay search failed:", err)
        setPixabayResults([])
      } finally {
        setPixabayLoading(false)
      }
    },
    [setPixabayResults, setPixabayLoading]
  )

  // Debounced search
  useEffect(() => {
    if (!query.trim()) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      search(query)
    }, 400)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, search])

  const searchCategory = useCallback(
    (category: string) => {
      setQuery(category)
      search(category)
    },
    [search, setQuery]
  )

  return {
    query,
    setQuery,
    results: pixabayResults,
    loading: pixabayLoading,
    searchCategory,
    hasApiKey: hasPixabayKey(),
    categories: PIXABAY_CATEGORIES,
  }
}
