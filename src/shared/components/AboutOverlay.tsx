import { useState, useEffect } from "react";
import {
  Info,
  Download,
  Settings,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  FolderOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";
import appInfo from "../../config/app-info.json";
import { getAppDefaultPath, pickDirectory, isTauri } from "../utils/tauri-fs";
import Tooltip from "./Tooltip";

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutOverlay({ isOpen, onClose }: AboutOverlayProps) {
  const [activeTab, setActiveTab] = useState<"info" | "download" | "settings">(
    "info",
  );
  const [isTauriApp] = useState(() => isTauri());
  const [exportPath, setExportPath] = useState<string>(() => {
    if (isTauri()) {
      return localStorage.getItem("exportPath") || "";
    }
    return "";
  });
  const [skipDialog, setSkipDialog] = useState<boolean>(() => {
    return localStorage.getItem("skipDialog") === "true";
  });

  useEffect(() => {
    if (isTauriApp && !exportPath) {
      // Default to Downloads if not set
      getAppDefaultPath("Download").then((path) => {
        if (path) {
          // Path already includes 'Quran_Video_Studio' from Rust backend
          setExportPath(path);
          localStorage.setItem("exportPath", path);
        }
      });
    }
  }, [isTauriApp, exportPath]);

  const handleBrowse = async () => {
    const path = await pickDirectory();
    if (path) {
      setExportPath(path);
      localStorage.setItem("exportPath", path);
    }
  };

  const handleSetDefault = async (base: "Download" | "Documents") => {
    const path = await getAppDefaultPath(base);
    if (path) {
      // Path already includes 'Quran_Video_Studio' from Rust backend
      setExportPath(path);
      localStorage.setItem("exportPath", path);
    }
  };

  const toggleSkipDialog = () => {
    const newValue = !skipDialog;
    setSkipDialog(newValue);
    localStorage.setItem("skipDialog", String(newValue));
  };

  if (!isOpen) return null;

  const renderContent = () => {
    const getSocialIcon = (platform: string) => {
      if (platform === "github") return <Github size={16} />;
      if (platform === "linkedin") return <Linkedin size={16} />;
      if (platform === "instagram") return <Instagram size={16} />;
      if (platform === "x") return <Twitter size={16} />;
      return <Info size={16} />;
    };

    switch (activeTab) {
      case "info":
        return (
          <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-200">
            <div className="mt-2">
              <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center border border-white/10">
                <img
                  src="/icon/favicon.svg"
                  alt="Logo"
                  className="w-12 h-12 opacity-90 invert brightness-0"
                />
              </div>
            </div>

            <div className="space-y-3 w-full max-w-sm">
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                {appInfo.appName}
              </h3>

              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-zinc-300 font-mono text-xs font-medium tracking-wide">
                  {appInfo.version}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-medium">
                  by {appInfo.author}
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {appInfo.description}
              </p>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {appInfo.socialLinks.map((link) => {
                return (
                  <Tooltip
                    key={link.platform}
                    content={link.platform === "x" ? "X" : link.platform}
                    position="top"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      title={link.label}
                      className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.96] transition-[transform,background-color,border-color,color] flex items-center justify-center"
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      case "download":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-200 w-full">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2">
              <Download className="w-8 h-8 text-zinc-500" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-lg font-medium text-white">
                Download Settings
              </h3>
              <p className="text-zinc-500 text-sm">
                Configure your default export location.
              </p>
            </div>

            {isTauriApp ? (
              <div className="w-full space-y-4">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleSetDefault("Download")}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] active:scale-[0.96] text-xs font-medium text-zinc-300 transition-[transform,background-color] flex items-center gap-2"
                  >
                    <Download size={14} />
                    Downloads
                  </button>
                  <button
                    onClick={() => handleSetDefault("Documents")}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] active:scale-[0.96] text-xs font-medium text-zinc-300 transition-[transform,background-color] flex items-center gap-2"
                  >
                    <FileText size={14} />
                    Documents
                  </button>
                </div>

                <div className="relative group">
                  <input
                    type="text"
                    value={exportPath}
                    readOnly
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-xs text-zinc-300 focus:outline-none focus:border-white/25 transition-colors"
                    placeholder="Select export folder..."
                  />
                  <button
                    onClick={handleBrowse}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 active:scale-[0.96] text-zinc-400 hover:text-white transition-[transform,background-color,color]"
                    title="Browse Folder"
                  >
                    <FolderOpen size={14} />
                  </button>
                </div>

                <button
                  onClick={toggleSkipDialog}
                  className={`w-full p-3 rounded-lg border transition-[transform,background-color,border-color] active:scale-[0.96] flex items-center justify-between group ${skipDialog ? "bg-white/[0.08] border-white/20" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07]"}`}
                >
                  <div className="text-left">
                    <span
                      className={`text-xs font-medium block ${skipDialog ? "text-white" : "text-zinc-300"}`}
                    >
                      Quick Export
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      Save directly without showing dialog
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${skipDialog ? "bg-white border-white" : "border-zinc-600"}`}
                  >
                    {skipDialog && (
                      <CheckCircle2 size={12} className="text-black" />
                    )}
                  </div>
                </button>

                <p className="text-[10px] text-zinc-600">
                  Videos will be saved to a 'Quran_Video_Studio' folder in this
                  location.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 w-full text-xs text-yellow-200/80">
                You are using the web version. Downloads will be saved to your
                browser's default download folder.
              </div>
            )}

            <div className="p-4 rounded-lg bg-white/[0.04] border border-white/10 w-full text-xs text-zinc-400 text-left space-y-1">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-white">MP4 (H.264)</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className="text-white">High (1080p)</span>
              </div>
              <div className="flex justify-between">
                <span>Audio:</span>
                <span className="text-white">AAC (128kbps)</span>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2">
              <Settings className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white">General Settings</h3>
            <p className="text-zinc-500 text-sm">Application preferences.</p>
            <div className="p-4 rounded-lg bg-white/[0.04] border border-white/10 w-full text-xs text-zinc-400">
              Theme: Dark
              <br />
              Language: English / Arabic
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Card Container */}
      <div className="relative w-full max-w-md bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-2 m-2 bg-white/[0.04] rounded-xl border border-white/10 relative z-10">
          <div className="flex items-center gap-1 w-full">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-[background-color,color] duration-200 flex items-center justify-center gap-2 ${activeTab === "info" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"}`}
            >
              <Info size={16} />
              <span>Info</span>
            </button>
            <button
              onClick={() => setActiveTab("download")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-[background-color,color] duration-200 flex items-center justify-center gap-2 ${activeTab === "download" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"}`}
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-[background-color,color] duration-200 flex items-center justify-center gap-2 ${activeTab === "settings" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"}`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Close Button (Absolute Top Right) */}
        {/* <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition-colors z-20"
        >
            <X size={20} />
        </button> */}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto min-h-[300px] relative z-10">
          {renderContent()}
        </div>

        {/* Footer - Developer Info */}
        <div className="p-4 border-t border-white/10 bg-black/20 text-center relative z-10">
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            Developed by{" "}
            <a
              href="https://github.com/abdellatif-laghjaj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              @{appInfo.author}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
