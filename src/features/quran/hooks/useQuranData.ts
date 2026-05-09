import { useState, useEffect } from "react";
import { VerseData } from "../types";
import { VideoConfig } from "../../video-editor/types";

// In-memory cache to persist data across component re-renders
const textCache = new Map<number, any>();
const audioCache = new Map<string, any>();

export function useQuranData(config: VideoConfig) {
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Raw data state
  const [fullTextData, setFullTextData] = useState<any>(null);
  const [fullAudioData, setFullAudioData] = useState<any>(null);

  // 1. Fetch Data Effect (Triggered only when Surah or Reciter changes)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Check cache immediately
      const cachedText = textCache.get(config.surahId);
      const audioKey = `${config.reciterId}-${config.surahId}`;
      const cachedAudio =
        config.audioSource === "reciter" ? audioCache.get(audioKey) : null;

      // If both are cached, we can skip the "loading" phase entirely to prevent UI flash
      if (cachedText && (cachedAudio || config.audioSource === "custom")) {
        if (isMounted) {
          setErrorMsg(null);
          // Important: We must still update the raw data state,
          // which will trigger the processing effect (Effect 2)
          setFullTextData(cachedText);
          setFullAudioData(cachedAudio);
          // Ensure loading is false
          setIsLoading(false);
          setLoadingProgress("");
        }
        return; // Exit early, no network request needed
      }

      // If not fully cached, we must load
      // Clear previous state for a clean switch if we are about to fetch new data
      setVerses([]);
      setAudioUrl(null);
      setErrorMsg(null);
      setFullTextData(null);
      setFullAudioData(null);
      setIsLoading(true);

      try {
        // --- TEXT DATA ---
        let tData = cachedText;

        if (!tData) {
          setLoadingProgress("Fetching Text...");
          // Added per_page=300 to ensure we fetch the FULL surah at once (Max Ayahs is 286 in Surah 2)
          // This allows us to cache the entire text and slice it locally later.
          const textUrl = `https://api.quran.com/api/v4/verses/by_chapter/${config.surahId}?language=en&words=true&translations=131&word_fields=text_uthmani,code_v1,code_v2,page_number,location&per_page=300`;

          const textRes = await fetch(textUrl);
          if (!textRes.ok) {
            console.error(
              "Text fetch failed:",
              textRes.status,
              textRes.statusText,
            );
            throw new Error("Failed to fetch text");
          }
          const textJson = await textRes.json();
          tData = textJson.verses;
          // Cache it
          textCache.set(config.surahId, tData);
        }

        // --- AUDIO DATA ---
        let aData = cachedAudio;

        if (config.audioSource === "custom") {
          aData = null;
        } else if (!aData) {
          setLoadingProgress("Fetching Audio...");

          const targetAudioUrl = `https://api.quran.com/api/qdc/audio/reciters/${config.reciterId}/audio_files?chapter=${config.surahId}&segments=true`;

          // Direct fetch - quran.com API supports CORS
          const audioRes = await fetch(targetAudioUrl);
          if (!audioRes.ok) {
            console.error(
              "Audio fetch failed:",
              audioRes.status,
              audioRes.statusText,
            );
            throw new Error("Failed to fetch audio");
          }
          const audioJson = await audioRes.json();

          if (!audioJson.audio_files || audioJson.audio_files.length === 0) {
            throw new Error("Audio not available for this reciter/surah");
          }

          aData = audioJson;
          // Cache it
          audioCache.set(audioKey, aData);
        }

        if (isMounted) {
          setFullTextData(tData);
          setFullAudioData(aData);
          setIsLoading(false);
          setLoadingProgress("");
        }
      } catch (err) {
        if (isMounted) {
          console.error("useQuranData Error:", err);
          setErrorMsg(
            "Failed to load Quran data. Please check your connection.",
          );
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [config.surahId, config.reciterId, config.audioSource]);

  // 2. Processing Effect (Triggered when raw data or verse range changes)
  // This is fast and synchronous (mostly), so it feels instant.
  useEffect(() => {
    if (!fullTextData) return;
    if (config.audioSource === "reciter" && !fullAudioData) return;

    // Slice Text
    const slicedVerses = fullTextData.slice(
      config.verseStart - 1,
      config.verseEnd,
    );

    const audioFile =
      config.audioSource === "reciter" ? fullAudioData.audio_files[0] : null;

    if (config.audioSource === "reciter" && !audioFile) {
      setErrorMsg("Audio format not supported");
      return;
    }

    setAudioUrl(
      config.audioSource === "custom"
        ? config.customAudioUrl
        : audioFile.audio_url,
    );

    const timings =
      config.audioSource === "reciter" ? audioFile.verse_timings || [] : [];

    const processedVerses = slicedVerses.map((v: any) => {
      const verseKey = v.verse_key; // "1:1"
      const timing = timings.find((t: any) => t.verse_key === verseKey);
      const customTiming =
        config.audioSource === "custom"
          ? config.customVerseTimings[verseKey]
          : undefined;

      return {
        id: v.id,
        text: v.text_uthmani,
        translation: v.translations?.[0]?.text || "",
        verseNumber: v.verse_number,
        verseKey: v.verse_key,
        words: v.words,
        timing: customTiming
          ? {
              verse_key: verseKey,
              timestamp_from: customTiming.startMs,
              timestamp_to: customTiming.endMs,
              duration: customTiming.endMs - customTiming.startMs,
              segments: [],
            }
          : timing
            ? {
                verse_key: timing.verse_key,
                timestamp_from: timing.timestamp_from,
                timestamp_to: timing.timestamp_to,
                duration: timing.duration,
                segments: timing.segments,
              }
            : undefined,
      };
    });

    setVerses(processedVerses);
  }, [
    fullTextData,
    fullAudioData,
    config.verseStart,
    config.verseEnd,
    config.audioSource,
    config.customAudioUrl,
    config.customVerseTimings,
  ]);

  return {
    verses,
    audioUrl,
    isLoading,
    loadingProgress,
    errorMsg,
    fullAudioData,
  };
}
