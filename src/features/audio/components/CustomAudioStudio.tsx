import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AudioPlayer from "react-modern-audio-player";
import {
  CheckCircle2,
  FileAudio,
  PlayCircle,
  RotateCcw,
  Scissors,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { VideoConfig } from "../../video-editor/types";
import { VerseData } from "../../quran/types";

interface CustomAudioStudioProps {
  isOpen: boolean;
  onClose: () => void;
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  verses: VerseData[];
}

interface AudioAnalysis {
  peaks: number[];
  durationMs: number;
}

const formatTime = (ms: number) => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;
};

const parseTimestamp = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":").map((part) => part.trim());
  const secondsText = parts.pop();
  if (!secondsText) return null;

  const seconds = Number(secondsText);
  const minutes = parts.length ? Number(parts.pop()) : 0;
  const hours = parts.length ? Number(parts.pop()) : 0;

  if (
    !Number.isFinite(seconds) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(hours)
  ) {
    return null;
  }

  return Math.round(((hours * 60 + minutes) * 60 + seconds) * 1000);
};

const buildEvenTimings = (verses: VerseData[], durationMs: number) => {
  const nextTimings: VideoConfig["customVerseTimings"] = {};
  const segmentMs = durationMs / Math.max(verses.length, 1);

  verses.forEach((verse, index) => {
    nextTimings[verse.verseKey] = {
      startMs: Math.round(index * segmentMs),
      endMs: Math.round(
        index === verses.length - 1 ? durationMs : (index + 1) * segmentMs,
      ),
    };
  });

  return nextTimings;
};

const detectPauseTimings = (
  verses: VerseData[],
  buffer: AudioBuffer,
): VideoConfig["customVerseTimings"] => {
  const durationMs = buffer.duration * 1000;
  if (verses.length <= 1) return buildEvenTimings(verses, durationMs);

  const channel = buffer.getChannelData(0);
  const windowSize = Math.max(1, Math.floor(buffer.sampleRate * 0.025));
  const rmsFrames: number[] = [];

  for (let i = 0; i < channel.length; i += windowSize) {
    let sum = 0;
    const end = Math.min(channel.length, i + windowSize);
    for (let j = i; j < end; j++) sum += channel[j] * channel[j];
    rmsFrames.push(Math.sqrt(sum / (end - i)));
  }

  const maxRms = Math.max(...rmsFrames, 0.001);
  const threshold = Math.max(0.012, maxRms * 0.08);
  const frameMs = 25;
  const minSilenceFrames = Math.ceil(300 / frameMs);
  const candidates: { timeMs: number; length: number }[] = [];
  let silenceStart = -1;

  rmsFrames.forEach((rms, index) => {
    if (rms < threshold && silenceStart === -1) {
      silenceStart = index;
    }
    if (
      (rms >= threshold || index === rmsFrames.length - 1) &&
      silenceStart !== -1
    ) {
      const silenceEnd = rms >= threshold ? index - 1 : index;
      const length = silenceEnd - silenceStart + 1;
      if (length >= minSilenceFrames) {
        candidates.push({
          timeMs: ((silenceStart + silenceEnd) / 2) * frameMs,
          length,
        });
      }
      silenceStart = -1;
    }
  });

  const boundaries = [0];
  const used = new Set<number>();

  for (let i = 1; i < verses.length; i++) {
    const ideal = (durationMs / verses.length) * i;
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    candidates.forEach((candidate, index) => {
      if (used.has(index)) return;
      const distance = Math.abs(candidate.timeMs - ideal);
      const score = distance - candidate.length * 8;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0) {
      used.add(bestIndex);
      boundaries.push(candidates[bestIndex].timeMs);
    } else {
      boundaries.push(ideal);
    }
  }

  boundaries.push(durationMs);
  boundaries.sort((a, b) => a - b);

  const nextTimings: VideoConfig["customVerseTimings"] = {};
  verses.forEach((verse, index) => {
    nextTimings[verse.verseKey] = {
      startMs: Math.round(boundaries[index]),
      endMs: Math.round(boundaries[index + 1]),
    };
  });

  return nextTimings;
};

export default function CustomAudioStudio({
  isOpen,
  onClose,
  config,
  setConfig,
  verses,
}: CustomAudioStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  const selectedVerse = useMemo(
    () =>
      verses.find((verse) => verse.verseKey === activeVerseKey) || verses[0],
    [activeVerseKey, verses],
  );

  const timingReadyCount = verses.filter(
    (verse) => config.customVerseTimings[verse.verseKey],
  ).length;

  const audioDurationMs =
    config.customAudioDurationMs || analysis?.durationMs || 0;

  const syncCurrentTime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTimeMs(Math.round(audio.currentTime * 1000));
  };

  const applyTimings = (timings: VideoConfig["customVerseTimings"]) => {
    setConfig((current) => ({
      ...current,
      audioSource: "custom",
      customVerseTimings: {
        ...current.customVerseTimings,
        ...timings,
      },
    }));
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const url = URL.createObjectURL(file);
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      const peaks = buildWaveformPeaks(buffer);
      const durationMs = Math.round(buffer.duration * 1000);
      const timings = detectPauseTimings(verses, buffer);

      if (config.customAudioUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(config.customAudioUrl);
      }

      setAnalysis({ peaks, durationMs });
      setActiveVerseKey(verses[0]?.verseKey || null);
      setConfig((current) => ({
        ...current,
        audioSource: "custom",
        customAudioUrl: url,
        customAudioName: file.name,
        customAudioDurationMs: durationMs,
        customVerseTimings: {
          ...current.customVerseTimings,
          ...timings,
        },
      }));
      await audioContext.close();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateVerseTiming = (
    verseKey: string,
    patch: Partial<{ startMs: number; endMs: number }>,
  ) => {
    const existing = config.customVerseTimings[verseKey] || {
      startMs: 0,
      endMs: config.customAudioDurationMs || 0,
    };
    const next = {
      ...existing,
      ...patch,
    };
    if (next.endMs < next.startMs + 100) next.endMs = next.startMs + 100;

    setConfig((current) => ({
      ...current,
      customVerseTimings: {
        ...current.customVerseTimings,
        [verseKey]: next,
      },
    }));
  };

  const updateVerseTimestamp = (
    verseKey: string,
    kind: "startMs" | "endMs",
    value: string,
  ) => {
    const parsedMs = parseTimestamp(value);
    if (parsedMs === null) return;

    const durationMs =
      config.customAudioDurationMs || analysis?.durationMs || parsedMs;
    updateVerseTiming(verseKey, {
      [kind]: Math.min(Math.max(0, parsedMs), durationMs),
    });
  };

  const markBoundary = (kind: "startMs" | "endMs") => {
    const audio = audioRef.current;
    if (!audio || !selectedVerse) return;
    updateVerseTiming(selectedVerse.verseKey, {
      [kind]: Math.round(audio.currentTime * 1000),
    });
  };

  const playVerse = (verse: VerseData) => {
    const audio = audioRef.current;
    const timing = config.customVerseTimings[verse.verseKey];
    if (!audio || !timing) return;
    audio.currentTime = timing.startMs / 1000;
    audio.play();
    const stopAt = timing.endMs / 1000;
    const stop = () => {
      if (audio.currentTime >= stopAt) {
        audio.pause();
        audio.removeEventListener("timeupdate", stop);
      }
    };
    audio.addEventListener("timeupdate", stop);
  };

  const rebuildEven = () => {
    if (!config.customAudioDurationMs) return;
    applyTimings(buildEvenTimings(verses, config.customAudioDurationMs));
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => syncCurrentTime();
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeked", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeked", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
    };
  }, [config.customAudioUrl]);

  const playList = config.customAudioUrl
    ? [
        {
          id: 1,
          src: config.customAudioUrl,
          name: config.customAudioName || "Custom recitation",
          writer: `Surah ${config.surahId} ayah ${config.verseStart}-${config.verseEnd}`,
        },
      ]
    : [];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Scissors className="w-5 h-5 text-studio-accent" />
              <h2 className="text-lg font-bold">Custom Reciter Studio</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Upload one recitation, detect pauses, then refine ayah boundaries.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_1fr]">
          <aside className="border-r border-white/10 p-5 space-y-4 overflow-y-auto custom-scrollbar">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void analyzeFile(file);
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing || verses.length === 0}
              className="w-full rounded-xl border border-studio-accent/40 bg-studio-accent/15 px-4 py-4 text-left hover:bg-studio-accent/20 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-studio-accent text-white flex items-center justify-center">
                  {isAnalyzing ? (
                    <Wand2 className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {isAnalyzing ? "Analyzing pauses..." : "Upload audio"}
                  </p>
                  <p className="text-xs text-zinc-500">MP3, WAV, M4A, OGG</p>
                </div>
              </div>
            </button>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileAudio className="w-4 h-4 text-zinc-500" />
                <span className="truncate">
                  {config.customAudioName || "No custom file loaded"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-zinc-500">Range</p>
                  <p className="mt-1 font-mono text-white">
                    {config.verseStart}-{config.verseEnd}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-zinc-500">Synced</p>
                  <p className="mt-1 font-mono text-white">
                    {timingReadyCount}/{verses.length}
                  </p>
                </div>
              </div>
              <button
                onClick={rebuildEven}
                disabled={!config.customAudioDurationMs}
                className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" />
                Even split fallback
              </button>
            </div>

            <div className="space-y-2">
              {verses.map((verse) => {
                const timing = config.customVerseTimings[verse.verseKey];
                const isActive = selectedVerse?.verseKey === verse.verseKey;
                return (
                  <button
                    key={verse.verseKey}
                    onClick={() => setActiveVerseKey(verse.verseKey)}
                    className={`w-full rounded-xl p-3 text-left transition-colors ${
                      isActive
                        ? "bg-studio-accent text-white"
                        : "bg-white/[0.03] text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">
                        Ayah {verse.verseNumber}
                      </span>
                      {timing && (
                        <CheckCircle2 className="w-4 h-4 opacity-80" />
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs opacity-75">
                      {timing
                        ? `${formatTime(timing.startMs)} - ${formatTime(timing.endMs)}`
                        : "Timing missing"}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-5">
            {config.customAudioUrl ? (
              <div className="custom-audio-player-shell rounded-2xl border border-white/10 bg-[#17171a] p-3">
                <AudioPlayer
                  audioRef={
                    audioRef as React.MutableRefObject<HTMLAudioElement>
                  }
                  playList={playList}
                  colorScheme="dark"
                  activeUI={{
                    all: true,
                    artwork: false,
                    playList: false,
                    prevNnext: false,
                    repeatType: false,
                    playbackRate: false,
                    progress: "bar",
                  }}
                  placement={{
                    player: "static",
                    volumeSlider: "top",
                  }}
                  audioInitialState={{
                    curPlayId: 1,
                    volume: 1,
                  }}
                  rootContainerProps={{
                    className: "custom-reciter-player",
                  }}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-8 text-center">
                <FileAudio className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                <p className="text-sm font-semibold text-white">
                  Upload audio to begin syncing
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Choose the surah and ayah range first, then load the matching
                  recitation.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-studio-accent shadow-[0_0_12px_var(--color-studio-accent)]" />
                  Live audio
                </div>
                <span className="text-xs font-mono text-zinc-500">
                  {formatTime(currentTimeMs)} / {formatTime(audioDurationMs)}
                </span>
              </div>
              <LiveAudioVisualizer
                audioRef={audioRef}
                isReady={Boolean(config.customAudioUrl)}
                onClock={setCurrentTimeMs}
              />
            </div>

            {selectedVerse && (
              <section className="rounded-xl border border-white/10 bg-[#17171a] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Selected ayah
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-white">
                      {selectedVerse.verseKey}
                    </h3>
                  </div>
                  <button
                    onClick={() => playVerse(selectedVerse)}
                    disabled={
                      !config.customVerseTimings[selectedVerse.verseKey]
                    }
                    className="h-11 rounded-full bg-white text-black px-5 text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-40"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Play ayah
                  </button>
                </div>

                <p
                  dir="rtl"
                  className="mt-5 text-right text-2xl leading-loose text-white font-lateef"
                >
                  {selectedVerse.text}
                </p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["startMs", "endMs"] as const).map((kind) => {
                    const timing =
                      config.customVerseTimings[selectedVerse.verseKey];
                    const value = timing?.[kind] || 0;
                    return (
                      <div
                        key={kind}
                        className="rounded-xl bg-black/25 border border-white/10 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            {kind === "startMs" ? "Start" : "End"}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            aria-label={`${kind === "startMs" ? "Start" : "End"} timestamp`}
                            defaultValue={formatTime(value)}
                            key={`${selectedVerse.verseKey}-${kind}-${value}`}
                            onBlur={(event) =>
                              updateVerseTimestamp(
                                selectedVerse.verseKey,
                                kind,
                                event.currentTarget.value,
                              )
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.currentTarget.blur();
                              }
                            }}
                            className="w-20 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-right font-mono text-sm text-white outline-none transition-colors focus:border-studio-accent focus:bg-black/50"
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={
                            config.customAudioDurationMs ||
                            analysis?.durationMs ||
                            1
                          }
                          value={value}
                          onChange={(event) =>
                            updateVerseTiming(selectedVerse.verseKey, {
                              [kind]: Number(event.target.value),
                            })
                          }
                          className="w-full accent-studio-accent"
                        />
                        <button
                          onClick={() => markBoundary(kind)}
                          disabled={!config.customAudioUrl}
                          className="mt-3 h-9 w-full rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors disabled:opacity-40"
                        >
                          Use current player time
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function buildWaveformPeaks(buffer: AudioBuffer) {
  const samples = buffer.getChannelData(0);
  const barCount = 120;
  const blockSize = Math.floor(samples.length / barCount);
  const peaks: number[] = [];

  for (let i = 0; i < barCount; i++) {
    let peak = 0;
    const start = i * blockSize;
    const end = Math.min(samples.length, start + blockSize);
    for (let j = start; j < end; j++) {
      peak = Math.max(peak, Math.abs(samples[j]));
    }
    peaks.push(Math.min(1, peak * 2.5));
  }

  return peaks;
}

function LiveAudioVisualizer({
  audioRef,
  isReady,
  onClock,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  isReady: boolean;
  onClock: (timeMs: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceConnectedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || !isReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let hasAnalyser = false;

    const setupAnalyser = async () => {
      if (!audioContextRef.current) {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!analyserRef.current) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.82;
        analyserRef.current = analyser;
      }

      if (!sourceConnectedRef.current) {
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);
        sourceConnectedRef.current = true;
      }

      hasAnalyser = true;
    };

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    // Idle: flat uniform bars with very subtle breathing
    const drawIdle = (time = 0) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      const barCount = 54;
      const gap = 4;
      const barWidth = Math.max(3, (width - gap * (barCount - 1)) / barCount);
      const baseH = 6;

      for (let i = 0; i < barCount; i++) {
        // Very gentle sine-based breathing — all bars same neutral height
        const breath = Math.sin(time / 1200 + i * 0.18) * 0.5 + 0.5; // 0..1
        const barHeight = baseH + breath * 6; // 6..12 px — subtle
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = "rgba(163, 0, 76, 0.30)";
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    const drawLive = () => {
      const analyser = analyserRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);
      onClock(Math.round(audio.currentTime * 1000));

      // If paused or analyser not ready, draw idle
      if (!hasAnalyser || !analyser || audio.paused) {
        drawIdle(performance.now());
        animationFrame = requestAnimationFrame(drawLive);
        return;
      }

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      const barCount = 64;
      const gap = 3;
      const barWidth = Math.max(3, (width - gap * (barCount - 1)) / barCount);

      // No shadow, no glow
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency range (focus on 0..72% of bins — covers speech/vocal range)
        const start = Math.floor((i / barCount) * data.length * 0.72);
        const end = Math.floor(((i + 1) / barCount) * data.length * 0.72);
        let sum = 0;
        for (let j = start; j <= end; j++) sum += data[j] || 0;
        const avg = sum / Math.max(1, end - start + 1);

        // Gamma-correct to make quiet parts more visible
        const normalized = Math.pow(avg / 255, 0.65);
        const barHeight = Math.max(4, normalized * (height - 16));
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Uniform accent color — full opacity when loud, dimmed when quiet
        const alpha = 0.35 + normalized * 0.65; // 0.35..1.0
        ctx.fillStyle = `rgba(163, 0, 76, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(drawLive);
    };

    const handlePlay = () => {
      setupAnalyser()
        .catch((err) => {
          console.warn("Live audio visualizer unavailable:", err);
        })
        .finally(() => {
          cancelAnimationFrame(animationFrame);
          animationFrame = requestAnimationFrame(drawLive);
        });
    };

    resizeCanvas();
    drawIdle();
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", () =>
      onClock(Math.round(audio.currentTime * 1000)),
    );
    audio.addEventListener("seeked", () =>
      onClock(Math.round(audio.currentTime * 1000)),
    );
    animationFrame = requestAnimationFrame(drawLive);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrame);
      audio.removeEventListener("play", handlePlay);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [audioRef, isReady, onClock]);

  return (
    <canvas
      ref={canvasRef}
      className="h-32 w-full rounded-lg border border-white/5 bg-[#09090b]"
    />
  );
}
