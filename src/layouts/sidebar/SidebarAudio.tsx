import React, { useState } from "react";
import { FileAudio, Mic, Mic2, SlidersHorizontal } from "lucide-react";
import { VideoConfig } from "../../features/video-editor/types";
import { VerseData } from "../../features/quran/types";
import { RECITERS } from "../../shared/constants";
import CustomAudioStudio from "../../features/audio/components/CustomAudioStudio";

interface SidebarAudioProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  verses?: VerseData[];
}

export default function SidebarAudio({
  config,
  setConfig,
  verses = [],
}: SidebarAudioProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const selectedModeClasses =
    "bg-studio-accent text-white shadow-[0_0_20px_rgba(163,0,76,0.25)]";
  const idleModeClasses =
    "bg-white/[0.03] text-zinc-400 hover:bg-white/5 hover:text-white";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
        <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">
          Audio
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#1a1a1e] p-1 border border-white/5">
        <button
          onClick={() => setConfig({ ...config, audioSource: "reciter" })}
          className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            config.audioSource === "reciter"
              ? selectedModeClasses
              : idleModeClasses
          }`}
        >
          <Mic className="w-4 h-4" />
          Library
        </button>
        <button
          onClick={() => {
            setConfig({ ...config, audioSource: "custom" });
            setIsStudioOpen(true);
          }}
          className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            config.audioSource === "custom"
              ? selectedModeClasses
              : idleModeClasses
          }`}
        >
          <FileAudio className="w-4 h-4" />
          Custom
        </button>
      </div>

      {config.audioSource === "custom" && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1e] p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {config.customAudioName || "No custom audio selected"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {Object.keys(config.customVerseTimings).length
                  ? "Timing map ready for export"
                  : "Upload audio and sync ayah boundaries"}
              </p>
            </div>
            <button
              onClick={() => setIsStudioOpen(true)}
              className="h-10 w-10 shrink-0 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
              title="Open custom reciter studio"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1a1a1e] border border-white/5 rounded-xl overflow-hidden">
        <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() =>
                setConfig({
                  ...config,
                  reciterId: r.id,
                  audioSource: "reciter",
                })
              }
              className={`group flex items-center gap-3 p-2.5 rounded-lg transition-all text-left w-full mb-1 last:mb-0
                            ${
                              config.reciterId === r.id
                                ? "bg-studio-accent text-white shadow-md"
                                : "hover:bg-white/5 text-zinc-400 hover:text-white"
                            }`}
            >
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${config.reciterId === r.id ? "bg-white/20" : "bg-black/20"}`}
              >
                {config.reciterId === r.id ? (
                  <Mic2 className="w-4 h-4 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate leading-tight">
                  {r.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <CustomAudioStudio
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        config={config}
        setConfig={setConfig}
        verses={verses}
      />
    </div>
  );
}
