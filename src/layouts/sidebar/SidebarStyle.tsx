import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Loader2,
  Palette,
  Play,
  Search,
  Sparkles,
  Subtitles,
  Trash2,
  Type,
  Upload,
  Video,
} from "lucide-react";
import { VideoConfig } from "../../features/video-editor/types";
import ColorPicker from "../../shared/components/ColorPicker";
import { ToggleSwitch } from "../../shared/components/ToggleSwitch";
import {
  PIXABAY_TOPICS,
  PixabayImageResult,
  PixabayVideoResult,
  searchPixabayImages,
  searchPixabayVideos,
} from "../../features/video-editor/utils/pixabay";

interface SidebarStyleProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

export default function SidebarStyle({ config, setConfig }: SidebarStyleProps) {
  const [imageQuery, setImageQuery] = useState("nature");
  const [videoQuery, setVideoQuery] = useState("ocean");
  const [images, setImages] = useState<PixabayImageResult[]>([]);
  const [videos, setVideos] = useState<PixabayVideoResult[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const activeTab = useMemo(
    () => config.backgroundType,
    [config.backgroundType],
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setConfig({
            ...config,
            backgroundImage: event.target.result as string,
            backgroundType: "image",
            backgroundVideo: null,
            backgroundVideoPoster: null,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadImages = async (query = imageQuery) => {
    setImageLoading(true);
    setImageError(null);
    try {
      setImages(await searchPixabayImages(query));
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Could not load images.",
      );
    } finally {
      setImageLoading(false);
    }
  };

  const loadVideos = async (query = videoQuery) => {
    setVideoLoading(true);
    setVideoError(null);
    try {
      setVideos(await searchPixabayVideos(query));
    } catch (error) {
      setVideoError(
        error instanceof Error ? error.message : "Could not load videos.",
      );
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "image" && images.length === 0 && !imageLoading) {
      void loadImages();
    }
    if (activeTab === "video" && videos.length === 0 && !videoLoading) {
      void loadVideos();
    }
  }, [activeTab]);

  const selectImage = (imageResult: PixabayImageResult) => {
    setConfig({
      ...config,
      backgroundType: "image",
      backgroundImage: imageResult.imageUrl,
      backgroundVideo: null,
      backgroundVideoPoster: null,
    });
  };

  const selectVideo = (videoResult: PixabayVideoResult) => {
    setConfig({
      ...config,
      backgroundType: "video",
      backgroundImage: videoResult.posterUrl,
      backgroundVideo: videoResult.videoUrl,
      backgroundVideoPoster: videoResult.posterUrl,
    });
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
        <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">
          Style
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* Quran Text Color - NEW */}
        <div className="flex items-center justify-between p-3 bg-[#1a1a1e] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-zinc-500">
              <Type className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Quran Text</span>
              <span className="text-[10px] text-zinc-500">Main Text Color</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ColorPicker
              color={config.textColor}
              onChange={(c) => setConfig({ ...config, textColor: c })}
            />
          </div>
        </div>

        {/* Highlight */}
        <div className="flex items-center justify-between p-3 bg-[#1a1a1e] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${config.enableHighlight ? "bg-studio-accent text-white" : "bg-black/40 text-zinc-500"}`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                Active Word
              </span>
              <span className="text-[10px] text-zinc-500">Highlight Color</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ColorPicker
              color={config.highlightColor}
              onChange={(c) => setConfig({ ...config, highlightColor: c })}
            />
            <ToggleSwitch
              checked={config.enableHighlight}
              onChange={() =>
                setConfig({
                  ...config,
                  enableHighlight: !config.enableHighlight,
                })
              }
            />
          </div>
        </div>

        {/* End of Ayah Color */}
        <div className="flex items-center justify-between p-3 bg-[#1a1a1e] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-zinc-500">
              <div className="w-4 h-4 rounded-full border-2 border-current opacity-60" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                End of Ayah
              </span>
              <span className="text-[10px] text-zinc-500">Symbol Color</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ColorPicker
              color={config.verseNumberColor}
              onChange={(c) => setConfig({ ...config, verseNumberColor: c })}
            />
          </div>
        </div>

        <div className="p-4 bg-[#1a1a1e] rounded-xl border border-white/5 space-y-4">
          <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg">
            <button
              onClick={() => setConfig({ ...config, backgroundType: "color" })}
              className={`flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold rounded-md transition-all ${config.backgroundType === "color" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Palette className="w-3.5 h-3.5" />
              Solid
            </button>
            <button
              onClick={() => setConfig({ ...config, backgroundType: "image" })}
              className={`flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold rounded-md transition-all ${config.backgroundType === "image" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Image className="w-3.5 h-3.5" />
              Game Image
            </button>
            <button
              onClick={() => setConfig({ ...config, backgroundType: "video" })}
              className={`flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold rounded-md transition-all ${config.backgroundType === "video" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Video className="w-3.5 h-3.5" />
              Video
            </button>
          </div>

          {config.backgroundType === "color" ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Background Color</span>
              <ColorPicker
                color={config.backgroundColor}
                onChange={(c) => setConfig({ ...config, backgroundColor: c })}
              />
            </div>
          ) : config.backgroundType === "image" ? (
            <div className="space-y-4">
              {config.backgroundImage && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/20">
                  <img
                    src={config.backgroundImage}
                    className="w-full h-full object-cover"
                    alt="Selected background"
                  />
                  <button
                    onClick={() =>
                      setConfig({ ...config, backgroundImage: null })
                    }
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-colors z-20 pointer-events-auto"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={imageQuery}
                    onChange={(event) => setImageQuery(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && void loadImages()
                    }
                    className="w-full h-10 rounded-lg bg-black/40 border border-white/10 pl-9 pr-3 text-xs text-white outline-none focus:border-studio-accent"
                    placeholder="Search Pixabay"
                  />
                </div>
                <button
                  onClick={() => void loadImages()}
                  className="h-10 w-10 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white flex items-center justify-center transition-colors"
                  title="Search images"
                >
                  {imageLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PIXABAY_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setImageQuery(topic);
                      void loadImages(topic);
                    }}
                    className="px-2 py-1 rounded-md bg-black/30 border border-white/5 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:border-studio-accent/50 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {imageError && (
                <p className="text-xs text-red-300">{imageError}</p>
              )}

              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {images.map((imageResult) => (
                  <button
                    key={imageResult.id}
                    onClick={() => selectImage(imageResult)}
                    className={`relative aspect-[9/12] overflow-hidden rounded-lg border transition-all ${config.backgroundImage === imageResult.imageUrl ? "border-studio-accent ring-2 ring-studio-accent/25" : "border-white/10 hover:border-white/30"}`}
                    title={`Photo by ${imageResult.user}`}
                  >
                    <img
                      src={imageResult.previewUrl}
                      alt={imageResult.tags}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-center gap-2 w-full h-10 border border-dashed border-white/10 rounded-lg hover:border-studio-accent/50 hover:bg-white/5 transition-all cursor-pointer group">
                <Upload className="w-4 h-4 text-zinc-500 group-hover:text-studio-accent transition-colors" />
                <span className="text-xs text-zinc-500 font-medium">
                  Upload local image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {config.backgroundImage && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Horizontal Position</span>
                      <span>{config.backgroundImageX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.backgroundImageX}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backgroundImageX: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Vertical Position</span>
                      <span>{config.backgroundImageY ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.backgroundImageY ?? 50}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backgroundImageY: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Overlay Opacity</span>
                      <span>
                        {Math.round(config.backgroundImageOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.backgroundImageOpacity}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backgroundImageOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {config.backgroundVideoPoster && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/20">
                  <img
                    src={config.backgroundVideoPoster}
                    className="w-full h-full object-cover"
                    alt="Selected video frame"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="w-11 h-11 rounded-full bg-black/55 border border-white/20 flex items-center justify-center text-white">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        backgroundVideo: null,
                        backgroundVideoPoster: null,
                        backgroundImage: null,
                      })
                    }
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-colors z-20 pointer-events-auto"
                    title="Remove Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={videoQuery}
                    onChange={(event) => setVideoQuery(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && void loadVideos()
                    }
                    className="w-full h-10 rounded-lg bg-black/40 border border-white/10 pl-9 pr-3 text-xs text-white outline-none focus:border-studio-accent"
                    placeholder="Search Pixabay"
                  />
                </div>
                <button
                  onClick={() => void loadVideos()}
                  className="h-10 w-10 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white flex items-center justify-center transition-colors"
                  title="Search videos"
                >
                  {videoLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PIXABAY_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setVideoQuery(topic);
                      void loadVideos(topic);
                    }}
                    className="px-2 py-1 rounded-md bg-black/30 border border-white/5 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:border-studio-accent/50 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {videoError && (
                <p className="text-xs text-red-300">{videoError}</p>
              )}

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {videos.map((videoResult) => (
                  <button
                    key={videoResult.id}
                    onClick={() => selectVideo(videoResult)}
                    className={`relative aspect-video overflow-hidden rounded-lg border transition-all ${config.backgroundVideo === videoResult.videoUrl ? "border-studio-accent ring-2 ring-studio-accent/25" : "border-white/10 hover:border-white/30"}`}
                    title={`Video by ${videoResult.user}`}
                  >
                    <img
                      src={videoResult.posterUrl}
                      alt={videoResult.tags}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white tabular-nums">
                      {videoResult.duration}s
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center text-white/90">
                      <Play className="w-5 h-5 fill-current drop-shadow" />
                    </span>
                  </button>
                ))}
              </div>

              {config.backgroundVideo && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Horizontal Position</span>
                      <span>{config.backgroundImageX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.backgroundImageX}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backgroundImageX: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Vertical Position</span>
                      <span>{config.backgroundImageY ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.backgroundImageY ?? 50}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backgroundImageY: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>Overlay Opacity</span>
                      <span>
                        {Math.round(config.backgroundImageOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.backgroundImageOpacity}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          backgroundImageOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Subtitles */}
        <div className="p-4 bg-[#1a1a1e] rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${config.showTranslation ? "bg-studio-accent text-white" : "bg-black/40 text-zinc-500"}`}
              >
                <Subtitles className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-white">Subtitles</span>
            </div>
            <div className="flex items-center gap-3">
              <ColorPicker
                color={config.translationColor}
                onChange={(c) => setConfig({ ...config, translationColor: c })}
              />
              <ToggleSwitch
                checked={config.showTranslation}
                onChange={() =>
                  setConfig({
                    ...config,
                    showTranslation: !config.showTranslation,
                  })
                }
              />
            </div>
          </div>

          {config.showTranslation && (
            <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                  <span>Animation Mode</span>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg">
                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        translationHighlightMode: "karaoke",
                      })
                    }
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${config.translationHighlightMode === "karaoke" ? "bg-studio-accent text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Karaoke
                  </button>
                  <button
                    onClick={() =>
                      setConfig({ ...config, translationHighlightMode: "word" })
                    }
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${config.translationHighlightMode === "word" ? "bg-studio-accent text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Word
                  </button>
                  <button
                    onClick={() =>
                      setConfig({ ...config, translationHighlightMode: "none" })
                    }
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${config.translationHighlightMode === "none" ? "bg-studio-accent text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Normal
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                  <span>Subtitle Size</span>
                  <span>{config.translationFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={config.translationFontSize}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      translationFontSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                  <span>Vertical Position</span>
                  <span>{config.translationY}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={config.translationY}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      translationY: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-studio-accent h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
