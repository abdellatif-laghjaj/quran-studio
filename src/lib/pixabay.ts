import axios from "axios";

const PIXABAY_KEY =
  process.env.PIXABAY_API_KEY || "54784414-5bd6e778309f95ad9dc284e0e";

export type Theme = "nature" | "ocean" | "sky" | "desert" | "forest";

const themeKeywords: Record<Theme, string> = {
  nature: "nature+landscape+aerial+scenery+-people+-person+-woman+-man",
  ocean: "ocean+waves+aerial+seascape+-people+-person+-beach",
  sky: "sky+clouds+sunrise+timelapse+-people+-person",
  desert: "desert+sand+dunes+aerial+landscape+-people+-person",
  forest: "forest+trees+aerial+fog+landscape+-people+-person",
};

export interface PixabayVideo {
  id: number;
  pageURL: string;
  duration: number;
  videos: {
    large: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    small: { url: string; width: number; height: number };
    tiny: { url: string; width: number; height: number };
  };
}

export async function searchVideos(
  theme: Theme,
  page: number = 1,
  perPage: number = 10,
): Promise<PixabayVideo[]> {
  const { data } = await axios.get("https://pixabay.com/api/videos/", {
    params: {
      key: PIXABAY_KEY,
      q: themeKeywords[theme],
      video_type: "film",
      category: "nature",
      safesearch: "true",
      editors_choice: "true",
      order: "popular",
      per_page: perPage,
      page,
    },
  });

  return data.hits || [];
}

export async function getRandomVideoUrl(theme: Theme): Promise<string> {
  const videos = await searchVideos(
    theme,
    Math.floor(Math.random() * 3) + 1,
    20,
  );
  if (!videos.length) {
    // fallback — try without editors_choice
    const { data } = await axios.get("https://pixabay.com/api/videos/", {
      params: {
        key: PIXABAY_KEY,
        q: themeKeywords[theme],
        video_type: "film",
        safesearch: "true",
        order: "popular",
        per_page: 20,
      },
    });
    const fallback = data.hits || [];
    if (!fallback.length) throw new Error("No background videos found");
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    return pick.videos.medium?.url || pick.videos.small?.url;
  }

  const pick = videos[Math.floor(Math.random() * videos.length)];
  return pick.videos.medium?.url || pick.videos.small?.url;
}
