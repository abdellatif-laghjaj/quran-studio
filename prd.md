# PRD — AyahVid: Quran Video Generator

> Open-source Next.js 16 web app · Server-side FFmpeg rendering · Zero paid services

---

## 1. Overview

**AyahVid** lets any Muslim user compose and export beautiful Quran recitation videos — picking a surah, verse range (max 10 ayahs), reciter, background video, font, aspect ratio, and visual effects. The user configures everything in the browser UI; video rendering is handled on the **server** via a Next.js API route using `fluent-ffmpeg`. The finished MP4 streams directly back to the browser for download.

**Target users:** Content creators, dawah channels, personal use, mosques, educators.

**Key constraint:** No paid services. All APIs and packages are free/open-source.

---

## 2. Architecture Overview

```
Browser (React UI)
  │  Form data (surah, ayah range, reciter, theme, font, dimensions, opacity)
  │
  ▼
POST /api/generate  (Next.js API Route — server)
  │
  ├─ quran.com API v4  →  verse texts (text_uthmani) + audio URLs
  ├─ Pixabay API       →  random background video URL (by theme)
  ├─ fluent-ffmpeg     →  render MP4 (drawtext overlays + audio concat)
  │
  └─ Stream MP4 back to browser  →  <a download> triggered on client
```

**Why server-side FFmpeg instead of browser WASM?**

| Factor              | Browser WASM (@ffmpeg/ffmpeg) | Server fluent-ffmpeg       |
| ------------------- | ----------------------------- | -------------------------- |
| Arabic text shaping | Manual reshaper or broken     | HarfBuzz (system FFmpeg)   |
| Font rendering      | Canvas-dependent              | Full freetype + fontconfig |
| Performance         | Slow, RAM-limited             | Full CPU, no 32MB limit    |
| Output quality      | WebM-first, MP4 optional      | Native H.264 + AAC MP4     |
| Cross-browser       | COOP/COEP headers required    | No browser quirks          |

The server uses system FFmpeg (Docker/Linux on production, `@ffmpeg-installer/ffmpeg` as local fallback) and detects HarfBuzz support automatically — enabling native Arabic text shaping when available, and falling back to a built-in reshape + reverse pipeline for local dev.

---

## 3. User Flow

```
[1] Select Surah          (searchable dropdown — 114 surahs)
      └─> [2] Ayah Range  (start / end, max 10 verses)
                └─> [3] Reciter
                          └─> [4] Aspect Ratio  (16:9, 9:16, 1:1, 4:5)
                                    └─> [5] Background Theme  (Pixabay category)
                                              └─> [6] Style   (font, dimness, opacity)
                                                        └─> [7] Generate → stream MP4 download
```

---

## 4. Tech Stack

| Layer          | Package                         | Version                 | Notes                                   |
| -------------- | ------------------------------- | ----------------------- | --------------------------------------- |
| Framework      | `next`                          | **16.2.4**              | App Router, streaming responses         |
| UI Runtime     | `react` + `react-dom`           | **19.2.4**              |                                         |
| Language       | `typescript`                    | **6.0.2**               | Strict mode                             |
| Styling        | `tailwindcss`                   | **4.2.2**               | Via `@tailwindcss/postcss`              |
| CSS PostCSS    | `@tailwindcss/postcss`          | **4.2.2**               | Replaces old postcss plugin             |
| UI Components  | `shadcn` (CLI) + `radix-ui`     | **4.2.0** / **1.4.3**   | Headless, accessible                    |
| Icons          | `lucide-react`                  | **1.8.0**               |                                         |
| Variants       | `class-variance-authority`      | **0.7.1**               |                                         |
| Class merge    | `tailwind-merge` + `clsx`       | **3.5.0** / **2.1.1**   | `cn()` helper                           |
| Animations     | `tw-animate-css`                | **1.4.0**               | Tailwind v4 animation plugin            |
| HTTP client    | `axios`                         | **1.15.1**              | Quran + Pixabay API calls (server-side) |
| FFmpeg wrapper | `fluent-ffmpeg`                 | **2.1.3**               | Server-side video rendering             |
| FFmpeg binary  | `@ffmpeg-installer/ffmpeg`      | **1.1.0**               | Local dev fallback                      |
| FFprobe binary | `@ffprobe-installer/ffprobe`    | **2.1.2**               | Audio duration probing                  |
| FFmpeg types   | `@types/fluent-ffmpeg`          | **2.1.28**              |                                         |
| UUID           | `uuid` + `@types/uuid`          | **14.0.0** / **11.0.0** | Temp dir naming                         |
| Linting        | `eslint` + `eslint-config-next` | **10.2.0** / **16.2.4** |                                         |
| Formatting     | `prettier`                      | latest                  |                                         |

---

## 5. Environment Variables

All secrets live in `.env.local` (git-ignored by Next.js by default). Never commit real keys.

```bash
# .env.local  ← never commit
PIXABAY_API_KEY=your_pixabay_key_here
```

```bash
# .env.example  ← commit this, no real values
PIXABAY_API_KEY=
```

**Why no `NEXT_PUBLIC_` prefix?**
The Pixabay API call is made from the **server** (inside the `/api/generate` route), so the key never reaches the browser. Using a plain `PIXABAY_API_KEY` keeps it fully private.

```ts
// lib/pixabay.ts — server-only
const PIXABAY_KEY = process.env.PIXABAY_API_KEY
if (!PIXABAY_KEY) throw new Error("Missing PIXABAY_API_KEY in .env.local")
```

---

## 6. APIs & Free Resources

### 6.1 Quran.com API v4

**Base URL:** `https://api.quran.com/api/v4`
No API key required. CORS-enabled. Completely free.

```ts
// All 114 chapters
GET /chapters
→ { chapters: [{ id, name_simple, name_arabic, verses_count, revelation_place }] }

// Verses for a chapter (paginated, 50 per page)
GET /verses/by_chapter/{chapter_id}
  ?language=ar
  &fields=text_uthmani
  &per_page=50
  &page=1
→ { verses: [{ id, verse_number, verse_key, text_uthmani }],
    pagination: { total_pages, ... } }

// All reciters
GET /resources/recitations
→ { recitations: [{ id, reciter_name, style, translated_name }] }

// Audio files for a reciter + chapter (paginated)
GET /recitations/{reciter_id}/by_chapter/{chapter_id}
  ?per_page=50&page=1
→ { audio_files: [{ verse_key, url }],
    pagination: { total_pages } }

// Tafsir for a single verse
GET /tafsirs/{tafsir_id}/by_ayah/{chapter}:{verse}
  // tafsir_id 16 = Ibn Kathir (English)
→ { tafsir: { text } }
```

**Audio CDN:** Relative URLs from `/recitations/` are resolved to:

```
https://verses.quran.com/{relative_url}
```

**Retry strategy:** All API calls wrapped in exponential-backoff retry (3 attempts: 1s, 2s, 4s) for transient network errors (`ECONNRESET`, `ETIMEDOUT`, etc.).

### 6.2 Pixabay API

**Free tier:** 5,000 requests/hour. API key stored in `PIXABAY_API_KEY` env var (server-side only).
Get a free key at [pixabay.com/api/docs](https://pixabay.com/api/docs/).

```ts
GET https://pixabay.com/api/videos/
  ?key={PIXABAY_API_KEY}
  &q={theme}           // e.g. "nature", "sky", "desert", "water"
  &video_type=all
  &per_page=20
  &safesearch=true
→ { hits: [{ videos: { large: { url }, medium: { url }, small: { url } } }] }
```

**Predefined themes (user selects from dropdown):**

| Theme Label          | Query                         |
| -------------------- | ----------------------------- |
| Nature               | `nature`                      |
| Sky & Clouds         | `sky clouds`                  |
| Rain & Water         | `rain water`                  |
| Desert               | `desert sand`                 |
| Mountains            | `mountains`                   |
| Ocean                | `ocean waves`                 |
| Forest               | `forest`                      |
| Light Bokeh          | `light bokeh`                 |
| Islamic Architecture | `islamic architecture mosque` |
| Night Stars          | `night stars galaxy`          |

The server picks a **random video** from the results for variety on each generation.

### 6.3 Fonts (self-hosted in `/public/fonts/`)

All fonts are free and open-source (SIL OFL license):

| Font Name          | File                           | Style                                 |
| ------------------ | ------------------------------ | ------------------------------------- |
| Amiri              | `Amiri.ttf` / `Amiri-Bold.ttf` | Classic Naskh — best for Quranic text |
| Noto Naskh Arabic  | `NotoNaskhArabic.ttf`          | Clean, modern Naskh                   |
| Scheherazade New   | `ScheherazadeNew-Regular.ttf`  | Traditional Naskh                     |
| Lateef             | `Lateef-Regular.ttf`           | Sindhi-style Naskh                    |
| Noto Nastaliq Urdu | `NotoNastaliqUrdu-Regular.ttf` | Nastaliq calligraphy                  |

**Important:** Only `Amiri.ttf`, `Amiri-Bold.ttf`, and `NotoNaskhArabic.ttf` contain Arabic Presentation Forms B glyphs (FE70–FEFF) required for the built-in reshaper. The others rely on HarfBuzz (production/Docker) for correct Arabic shaping.

---

## 7. Feature Spec

### 7.1 Configuration Panel

#### Quran Settings

- **Surah** — searchable dropdown (Arabic name + transliteration + verse count)
- **Start Ayah** — number input; min: 1, max: `surah.verses_count`
- **End Ayah** — number input; min: `startAyah + 1`, max: `min(startAyah + 9, surah.verses_count)` — **hard cap: 10 verses**
- **Reciter** — searchable dropdown from `GET /resources/recitations`; shows style (Murattal / Mujawwad)
- **Include Tafsir** — toggle; shows Ibn Kathir English tafsir below each verse (truncated to 120 chars, 2 lines)
- **Verse Number Badge** — toggle; renders ﴿N﴾ below each verse in gold

#### Video Settings

| Ratio | Resolution  | Platform                |
| ----- | ----------- | ----------------------- |
| 16:9  | 1920 × 1080 | YouTube                 |
| 9:16  | 1080 × 1920 | Reels / Shorts / TikTok |
| 1:1   | 1080 × 1080 | Instagram Post          |
| 4:5   | 1080 × 1350 | Instagram Feed          |

#### Background Settings

- **Theme** — dropdown of 10 Pixabay categories (server fetches + picks random video)
- **Dim Opacity** — slider 0–1 (default 0.5); controls black overlay `drawbox=c=black@{opacity}`

#### Style Settings

- **Font** — dropdown of 5 Quranic fonts (value = filename e.g. `Amiri-Bold.ttf`)
- **Adaptive font size** — auto-calculated from video width and verse visible character count (no manual input needed)

### 7.2 Video Generation & Export

**Server-side pipeline (`POST /api/generate`):**

```
1. Validate request body
   ├─ Required: chapter, from, to, reciterId
   └─ Guard: to - from > 10  →  400 error

2. Fetch verse texts
   └─ GET /verses/by_chapter/{chapter}?fields=text_uthmani (paginated)

3. Fetch audio URLs
   └─ GET /recitations/{reciterId}/by_chapter/{chapter} (paginated)
      └─ Resolve to: https://verses.quran.com/{url}

4. Fetch tafsir (if enabled)
   └─ GET /tafsirs/16/by_ayah/{chapter}:{verse}  per verse
      └─ Strip HTML tags, truncate to 200 chars

5. Get background video
   └─ GET Pixabay API with theme query → pick random hit → use medium video URL

6. generateVideo()  (lib/ffmpeg.ts)
   ├─ Download background video      → tmpDir/background.mp4
   ├─ Download all verse audio        → tmpDir/audio_0.mp3 … audio_N.mp3
   ├─ Probe each audio duration via ffprobe
   ├─ Concat audio via ffmpeg concat demuxer  → tmpDir/merged_audio.mp3
   ├─ Build drawtext filter chain:
   │   For each verse:
   │   ├─ Prepare Arabic text (HarfBuzz or reshape+reverse pipeline)
   │   ├─ Split into lines (max chars per line scaled to video width)
   │   ├─ Adaptive font size (based on video width + visible char count)
   │   ├─ Fade-in / fade-out alpha expressions (0.5s in, 0.4s out)
   │   ├─ drawtext for each line  (white, shadow, border)
   │   ├─ drawtext for verse badge ﴿N﴾  (gold #b8922f)
   │   └─ drawtext for tafsir lines  (if enabled, 2 lines max)
   ├─ Write filter chain to tmpDir/filters.txt (avoids shell length limits)
   └─ Run FFmpeg:
       input 0: background.mp4 (stream_loop -1)
       input 1: merged_audio.mp3
       filter_complex_script: filters.txt
       video: libx264, preset ultrafast, crf 28, maxrate 1500k
       audio: aac, 128k
       output: tmpDir/output.mp4

7. Stream output.mp4 as ReadableStream response
   ├─ Content-Type: video/mp4
   ├─ Content-Disposition: attachment; filename="quran_{chapter}_{from}-{to}.mp4"
   └─ Content-Length: file size
      └─ cleanupTempDir 3s after stream ends
```

**Arabic text rendering strategy:**

```
Does system FFmpeg have HarfBuzz?
  YES (Docker / production / Render.com)
    → Pass raw Unicode text to drawtext + text_shaping=1
    → HarfBuzz handles: connections, diacritics, ligatures, bidi

  NO (local dev — @ffmpeg-installer/ffmpeg binary)
    → Font has Presentation Forms B glyphs? (Amiri, NotoNaskhArabic)
        YES → normalizeArabicText → reshapeArabicText → reverseArabicClusters
        NO  → normalizeArabicText → reverseArabicClusters only
```

**Adaptive font size formula:**

```ts
// Base size scaled to video width
width >= 3840 → base = 156   // 4K
width >= 2560 → base = 104   // 1440p
width >= 1920 → base = 78    // 1080p
width >= 1280 → base = 52    // 720p
width >= 720  → base = 42    // SD
else          → base = 34

// Scale down by visible character count (diacritics excluded)
visibleChars < 30  → base × 1.00
visibleChars < 60  → base × 0.82
visibleChars < 100 → base × 0.68
visibleChars < 150 → base × 0.56
else               → base × 0.48
```

---

## 8. Project Structure

```
ayahvid/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main editor UI
│   └── api/
│       └── generate/
│           └── route.ts            # POST handler — video generation pipeline
│
├── components/
│   ├── editor/
│   │   ├── ConfigPanel.tsx         # Full settings sidebar
│   │   ├── GenerateButton.tsx      # Triggers POST, shows progress
│   │   └── DownloadLink.tsx        # Receives blob URL → <a download>
│   │
│   ├── panels/
│   │   ├── QuranPanel.tsx          # Surah, ayah range, reciter, toggles
│   │   ├── VideoPanel.tsx          # Aspect ratio selector
│   │   ├── BackgroundPanel.tsx     # Theme dropdown + dim opacity slider
│   │   └── StylePanel.tsx          # Font picker
│   │
│   └── ui/                         # shadcn/ui generated components
│
├── lib/
│   ├── ffmpeg.ts                   # generateVideo() + Arabic reshaper + cleanupTempDir
│   ├── quran-api.ts                # getChapters, getVerses, getAudioFiles,
│   │                               # getReciters, getTafsir, getAudioUrl + retry wrapper
│   └── pixabay.ts                  # getRandomVideoUrl(theme) — server-only
│
├── public/
│   └── fonts/
│       ├── Amiri.ttf
│       ├── Amiri-Bold.ttf
│       ├── NotoNaskhArabic.ttf
│       ├── ScheherazadeNew-Regular.ttf
│       ├── Lateef-Regular.ttf
│       └── NotoNastaliqUrdu-Regular.ttf
│
├── types/
│   ├── quran.ts                    # Chapter, Reciter, Verse, AudioFile
│   └── editor.ts                   # AspectRatio, GenerateRequest, Theme
│
├── .env.local                      # ← git-ignored (real keys)
├── .env.example                    # ← committed (empty values)
├── Dockerfile                      # system FFmpeg + HarfBuzz for production
└── next.config.ts
```

---

## 9. Data Models

```ts
// types/editor.ts

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5"

export const RESOLUTIONS: Record<AspectRatio, { w: number; h: number }> = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
  "1:1": { w: 1080, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
}

export type QuranicFont =
  | "Amiri.ttf"
  | "Amiri-Bold.ttf"
  | "NotoNaskhArabic.ttf"
  | "ScheherazadeNew-Regular.ttf"
  | "Lateef-Regular.ttf"
  | "NotoNastaliqUrdu-Regular.ttf"

export type Theme =
  | "nature"
  | "sky clouds"
  | "rain water"
  | "desert sand"
  | "mountains"
  | "ocean waves"
  | "forest"
  | "light bokeh"
  | "islamic architecture mosque"
  | "night stars galaxy"

export interface GenerateRequest {
  chapter: number
  from: number
  to: number // max: from + 9
  reciterId: number
  theme: Theme
  includeTafsir: boolean
  dimOpacity: number // 0–1, default 0.5
  videoWidth: number
  videoHeight: number
  fontFile: QuranicFont
}
```

```ts
// types/quran.ts

export interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  revelation_place: string
  translated_name: { name: string; language_name: string }
}

export interface Reciter {
  id: number
  reciter_name: string
  style: string | null
  translated_name: { name: string; language_name: string }
}

export interface Verse {
  id: number
  verse_number: number
  verse_key: string
  text_uthmani: string
}

export interface AudioFile {
  verse_key: string
  url: string
}
```

---

## 10. package.json

Versions verified from npm registry — April 2026.

```json
{
  "name": "ayahvid",
  "version": "0.1.0",
  "description": "Open-source Quran video generator — Next.js + fluent-ffmpeg",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3034",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@ffprobe-installer/ffprobe": "^2.1.2",
    "@types/fluent-ffmpeg": "^2.1.28",
    "@types/uuid": "^11.0.0",
    "axios": "^1.15.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "fluent-ffmpeg": "^2.1.3",
    "lucide-react": "^1.8.0",
    "next": "16.2.4",
    "radix-ui": "^1.4.3",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "shadcn": "^4.2.0",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "uuid": "^14.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.2",
    "@types/node": "^25.6.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint": "^10.2.0",
    "eslint-config-next": "16.2.4",
    "prettier": "latest",
    "tailwindcss": "^4.2.2",
    "typescript": "^6.0.2"
  }
}
```

**Changes from your original `package.json`:**

- `uuid`: `^13.0.0` → **`^14.0.0`** (latest on npm as of April 2026)
- `axios`: `^1.15.0` → **`^1.15.1`** (latest patch)
- `next` / `eslint-config-next`: `16.2.2` → **`16.2.4`**
- `arabic-reshaper` **removed** — replaced by the built-in reshaper in `lib/ffmpeg.ts` (no external dep needed, already in your uploaded code)
- `phosphor-react` **removed** — replaced by `lucide-react` which is already included
- `postcss` **removed** — no longer needed standalone; `@tailwindcss/postcss` covers it for Tailwind v4
- `prettier` **added** — referenced in `format` script but was missing from deps

---

## 11. next.config.ts

```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["fluent-ffmpeg"], // don't bundle — keep as native require
}

export default nextConfig
```

No COOP/COEP headers needed — those are only required for `SharedArrayBuffer` (browser FFmpeg WASM). Since all rendering is server-side, no special browser headers are needed.

---

## 12. Dockerfile (Production)

```dockerfile
FROM node:22-slim

# Install system FFmpeg with HarfBuzz (enables text_shaping=1 for native Arabic)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

EXPOSE 3034
CMD ["npm", "start"]
```

System FFmpeg on Debian/Ubuntu includes HarfBuzz. The app auto-detects this via:

```ts
const conf = execSync("ffmpeg -buildconf 2>&1", { encoding: "utf8" })
const hasHarfBuzz = conf.includes("harfbuzz")
```

---

## 13. Deployment

| Platform       | Supported | Notes                                                                                          |
| -------------- | --------- | ---------------------------------------------------------------------------------------------- |
| **Render.com** | ✅        | Use Docker deploy; free tier available                                                         |
| **Railway**    | ✅        | Docker or Nixpacks; generous free tier                                                         |
| **Fly.io**     | ✅        | Docker; pay-as-you-go                                                                          |
| **Vercel**     | ⚠️        | Serverless functions have 50MB size limit and are fragile for video streaming; not recommended |
| **Local dev**  | ✅        | `@ffmpeg-installer/ffmpeg` used automatically; no system install needed                        |

---

## 14. UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ☪ AyahVid                                        [?] [GitHub]  │
├────────────────────┬────────────────────────────────────────────┤
│                    │                                            │
│  📖 QURAN          │   OUTPUT INFO                              │
│  ─────────────     │   ─────────────────────────────────────   │
│  Surah             │                                            │
│  [Al-Baqarah  ▾]   │   Surah: Al-Baqarah (2)                   │
│                    │   Verses: 1 – 5  (5 verses)               │
│  Start   End       │   Reciter: Mishary Al-Afasy               │
│  [  1 ]  [ 5 ]     │   Resolution: 1920 × 1080 (16:9)          │
│  max 10 verses     │   Font: Amiri Bold                        │
│                    │   Background: Nature                       │
│  Reciter           │                                            │
│  [Al-Afasy    ▾]   │                                            │
│                    │                                            │
│  ☑ Tafsir          │                                            │
│  ☑ Verse badge     │                                            │
│                    │                                            │
│  📐 DIMENSIONS     │                                            │
│  ◉ 16:9  ○ 9:16    │                                            │
│  ○ 1:1   ○ 4:5     │                                            │
│                    │                                            │
│  🖼 BACKGROUND     │                                            │
│  [Nature      ▾]   │                                            │
│                    │                                            │
│  Dim: ████░  0.5   │                                            │
│                    │                                            │
│  🔤 FONT           │                                            │
│  [Amiri Bold  ▾]   │                                            │
│                    │                                            │
├────────────────────┴────────────────────────────────────────────┤
│                                                                 │
│   [  ▶  Generate & Download MP4  ]    ≈ 30–90s depending on length  │
│   ████████████████████░░░░░░░░░░░  Rendering…                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. Milestones

| #   | Milestone              | Deliverables                                                                           |
| --- | ---------------------- | -------------------------------------------------------------------------------------- |
| M1  | **Scaffold**           | Next.js 16 + TS + Tailwind v4 + shadcn setup; fonts in `/public/fonts`; `.env.example` |
| M2  | **Quran API**          | `lib/quran-api.ts` — chapters, verses, reciters, audio, tafsir with retry wrapper      |
| M3  | **Pixabay API**        | `lib/pixabay.ts` — theme search, random video picker; `PIXABAY_API_KEY` from env       |
| M4  | **FFmpeg Core**        | `lib/ffmpeg.ts` — Arabic reshaper, drawtext builder, audio concat, render pipeline     |
| M5  | **API Route**          | `app/api/generate/route.ts` — full POST handler, file streaming, cleanup               |
| M6  | **UI — Config Panel**  | Surah/ayah/reciter selectors, aspect ratio, theme, font, opacity controls              |
| M7  | **UI — Generate Flow** | Submit button, loading state, error display, download trigger                          |
| M8  | **Polish**             | Input validation, empty states, error toasts, responsive layout                        |
| M9  | **Docker**             | `Dockerfile` with system FFmpeg; verify HarfBuzz Arabic shaping in prod                |
| M10 | **Open Source Launch** | `README.md`, `CONTRIBUTING.md`, `LICENSE` (MIT), demo GIF, GitHub Actions CI           |

---

## 16. Known Constraints & Mitigations

| Constraint                                                   | Mitigation                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `fluent-ffmpeg` v2.1.3 is unmaintained (no new npm releases) | Stable API, widely used in production; types via `@types/fluent-ffmpeg`       |
| Vercel serverless not suitable                               | Deploy on Render.com, Railway, or Fly.io with Dockerfile                      |
| `@ffmpeg-installer/ffmpeg` (local) lacks HarfBuzz            | Built-in reshape+reverse pipeline handles dev correctly for Amiri + NotoNaskh |
| Pixabay cross-origin video download                          | Server downloads the video directly — no browser CORS issue                   |
| Long generation time (30–90s per video)                      | `maxDuration = 300`; show client-side spinner; v2 can add SSE progress        |
| Temp files accumulate on crash                               | `cleanupTempDir` called in both success and error paths; UUID-named temp dirs |
| Max 10 verses = potentially long audio                       | FFmpeg `-t {totalDuration}` cap prevents accidental infinite loops            |
