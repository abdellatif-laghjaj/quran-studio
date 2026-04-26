import React from "react";
import { AlertCircle } from "lucide-react";
import { VideoConfig } from "../features/video-editor/types";
import { Surah } from "../features/quran/types";
import SidebarSelection from "./sidebar/SidebarSelection";
import SidebarAudio from "./sidebar/SidebarAudio";
import SidebarFormat from "./sidebar/SidebarFormat";
import { isTauri } from "../shared/utils/platform";

interface LeftSidebarProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  errorMsg: string | null;
  currentSurah: Surah;
  filteredSurahs: Surah[];
  isSurahOpen: boolean;
  setIsSurahOpen: (v: boolean) => void;
  surahSearch: string;
  setSurahSearch: (v: string) => void;
}

export default function LeftSidebar({
  config,
  setConfig,
  errorMsg,
  currentSurah,
  filteredSurahs,
  isSurahOpen,
  setIsSurahOpen,
  surahSearch,
  setSurahSearch,
}: LeftSidebarProps) {
  const isApp = isTauri();

  return (
    <div className="w-full md:w-[320px] flex flex-col border-r border-white/5 bg-[#121214] h-full z-10 shadow-2xl relative transition-all duration-300 font-sans">
      {/* Header */}
      <div
        className={`py-5 border-b border-white/5 bg-[#121214] shrink-0 text-center relative overflow-hidden ${isApp ? "cursor-move" : ""}`}
        data-tauri-drag-region
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-studio-accent to-transparent opacity-50 pointer-events-none"
          data-tauri-drag-region
        ></div>
        <h1
          className="text-xl font-bold tracking-tight text-white pointer-events-none"
          data-tauri-drag-region
        >
          Quran Video Studio
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex gap-2 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <SidebarSelection
          config={config}
          setConfig={setConfig}
          currentSurah={currentSurah}
          filteredSurahs={filteredSurahs}
          isSurahOpen={isSurahOpen}
          setIsSurahOpen={setIsSurahOpen}
          surahSearch={surahSearch}
          setSurahSearch={setSurahSearch}
        />

        <SidebarAudio config={config} setConfig={setConfig} />

        <SidebarFormat config={config} setConfig={setConfig} />
      </div>
    </div>
  );
}
