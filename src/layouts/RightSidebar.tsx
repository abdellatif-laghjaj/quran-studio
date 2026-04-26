import React from "react";
import { VideoConfig } from "../features/video-editor/types";
import SidebarLayout from "./sidebar/SidebarLayout";
import SidebarTypography from "./sidebar/SidebarTypography";
import SidebarStyle from "./sidebar/SidebarStyle";

interface RightSidebarProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  typoTab: "quran" | "translation";
  setTypoTab: (v: "quran" | "translation") => void;
}

export default function RightSidebar({
  config,
  setConfig,
  typoTab,
  setTypoTab,
}: RightSidebarProps) {
  return (
    <div className="w-full md:w-[320px] flex flex-col border-l border-white/5 bg-[#121214] h-full z-10 shadow-2xl relative transition-all duration-300 font-sans">
      {/* Header */}
      <div className="py-5 border-b border-white/5 bg-[#121214] shrink-0 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-studio-accent to-transparent opacity-50 pointer-events-none"></div>
        <h1 className="text-xl font-bold tracking-tight text-white pointer-events-none">
          Styling
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
        <SidebarLayout config={config} setConfig={setConfig} />

        <SidebarTypography
          config={config}
          setConfig={setConfig}
          typoTab={typoTab}
          setTypoTab={setTypoTab}
        />

        <SidebarStyle config={config} setConfig={setConfig} />
      </div>
    </div>
  );
}
