const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY as
  | string
  | undefined;

export const PIXABAY_TOPICS = [
  "ocean",
  "forest",
  "nature",
  "sea",
  "universe",
  "mountains",
  "stars",
  "waterfall",
] as const;

export interface PixabayImageResult {
  id: number;
  previewUrl: string;
  imageUrl: string;
  pageUrl: string;
  tags: string;
  user: string;
}

export interface PixabayVideoResult {
  id: number;
  posterUrl: string;
  videoUrl: string;
  pageUrl: string;
  tags: string;
  user: string;
  duration: number;
}

interface PixabayImageHit {
  id: number;
  previewURL: string;
  webformatURL: string;
  largeImageURL?: string;
  pageURL: string;
  tags: string;
  user: string;
}

interface PixabayVideoFile {
  url: string;
  thumbnail: string;
}

interface PixabayVideoHit {
  id: number;
  pageURL: string;
  tags: string;
  user: string;
  duration: number;
  videos: {
    large?: PixabayVideoFile;
    medium?: PixabayVideoFile;
    small?: PixabayVideoFile;
    tiny?: PixabayVideoFile;
  };
}

const assertApiKey = () => {
  if (!PIXABAY_API_KEY) {
    throw new Error("Missing VITE_PIXABAY_API_KEY in your environment.");
  }
  return PIXABAY_API_KEY;
};

const buildUrl = (endpoint: string, params: Record<string, string>) => {
  const url = new URL(endpoint);
  url.searchParams.set("key", assertApiKey());
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

export async function searchPixabayImages(query: string) {
  const response = await fetch(
    buildUrl("https://pixabay.com/api/", {
      q: query,
      image_type: "photo",
      category: "nature",
      orientation: "all",
      safesearch: "true",
      order: "popular",
      per_page: "18",
    }),
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as { hits: PixabayImageHit[] };
  return data.hits.map((hit) => ({
    id: hit.id,
    previewUrl: hit.previewURL,
    imageUrl: hit.largeImageURL || hit.webformatURL,
    pageUrl: hit.pageURL,
    tags: hit.tags,
    user: hit.user,
  }));
}

export async function searchPixabayVideos(query: string) {
  const response = await fetch(
    buildUrl("https://pixabay.com/api/videos/", {
      q: query,
      video_type: "film",
      category: "nature",
      safesearch: "true",
      order: "popular",
      per_page: "18",
    }),
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as { hits: PixabayVideoHit[] };
  return data.hits
    .map((hit) => {
      const rendition =
        hit.videos.medium ||
        hit.videos.small ||
        hit.videos.tiny ||
        hit.videos.large;

      if (!rendition?.url || !rendition.thumbnail) return null;

      return {
        id: hit.id,
        posterUrl: rendition.thumbnail,
        videoUrl: rendition.url,
        pageUrl: hit.pageURL,
        tags: hit.tags,
        user: hit.user,
        duration: hit.duration,
      };
    })
    .filter((hit): hit is PixabayVideoResult => hit !== null);
}
