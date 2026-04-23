# PRD — AyahVid: Quran Video Generator

> Open-source Next.js web app · Fully browser-based · No backend required

---

## 1. Overview

**AyahVid** lets any Muslim user compose and export beautiful Quran recitation videos directly in the browser — no server, no paid API, no FFmpeg binary to install. The user picks a surah, a verse range (max 10 ayahs), a reciter, a background video, a font, an aspect ratio, and visual effects. The app renders everything on a `<canvas>` and exports a downloadable video file.

**Target users:** Content creators, dawah channels, personal use, mosques, educators.

**Constraints:** Everything runs in the browser. Zero paid services. Zero backend.

---

## 2. Goals & Non-Goals

### Goals

- Generate publication-ready Quran videos from browser only
- Support 4 aspect ratios (16:9, 9:16, 1:1, 4:5)
- Support multiple Quranic fonts, all Arabic-shaped correctly
- Verse-by-verse playback and video export with recitation audio
- Background footage from Pixabay (free, API-key-gated but free tier is enough)
- Effects: Ken Burns on background, verse fade-in/out, text animation, vignette

### Non-Goals

- Server-side rendering or cloud video processing
- Paid API integrations
- Mobile native apps (PWA is a stretch goal)
- Custom user-uploaded background videos (v2)
- Custom user-uploaded audio (v2)

---

## 3. User Flow

```
[1] Select Surah
    └─> [2] Select Ayah Range (start – end, max 10)
              └─> [3] Select Reciter
                        └─> [4] Select Aspect Ratio
                                  └─> [5] Choose Background (search Pixabay)
                                            └─> [6] Style Panel (font, size, colors, effects)
                                                      └─> [7] Live Preview (canvas)
                                                                └─> [8] Generate & Download
```

---

## 4. Tech Stack

| Layer            | Choice                                                  | Why                                        |
| ---------------- | ------------------------------------------------------- | ------------------------------------------ |
| Framework        | **Next.js 16.2.3** (App Router)                         | Static export capable, good DX             |
| Language         | **TypeScript**                                          | Type safety for canvas math and API shapes |
| Styling          | **Tailwind CSS v4.2.4**                                 | Utility-first, no runtime                  |
| UI Components    | **shadcn/ui**                                           | Accessible, unstyled-first, Radix-based    |
| State            | **Zustand 5.0.12**                                      | Minimal, no boilerplate                    |
| Canvas Rendering | **Browser Canvas 2D API**                               | Native, no deps                            |
| Video Recording  | **MediaRecorder API**                                   | Native, no deps, outputs WebM              |
| MP4 Encoding     | **@ffmpeg/ffmpeg 0.12.15 + @ffmpeg/util 0.12.2** (WASM) | Client-side MP4 transcode from WebM        |
| Audio            | **Web Audio API**                                       | Mix recitation audio with canvas stream    |
| Font Loading     | **FontFace API**                                        | Load Quranic fonts at runtime              |
| Animations (UI)  | **Framer Motion 12.38.0**                               | Smooth UI transitions                      |
| HTTP Client      | **native fetch**                                        | No extra dep needed                        |

---

## 5. APIs & Free Resources

### 5.1 Quran Data — Quran.com API v4

**Base URL:** `https://api.qurancdn.com/api/qdc`
No API key required. CORS-enabled. Completely free.

```ts
// Get all surahs (chapters)
GET /chapters?language=en
→ { chapters: [{ id, name_arabic, name_simple, verses_count, ... }] }

// Get verses for a chapter
GET /verses/by_chapter/{chapter_id}
  ?translations=131          // 131 = Saheeh International (English)
  &fields=text_uthmani       // clean Uthmani script
  &per_page=50
  &page=1
→ { verses: [{ id, verse_key, text_uthmani, translations: [...] }] }

// Get all reciters
GET /audio/reciters?language=en
→ { reciters: [{ id, name, style, ... }] }

// Get audio file URLs for a reciter + chapter
GET /audio/reciters/{reciter_id}/audio_files
  ?chapter_number={surah_number}
  &segments=true             // returns per-ayah timestamps
→ { audio_files: [{ verse_key, url, duration, ... }] }
```

**Verse audio CDN (fallback):**

```
https://cdn.islamic.network/quran/audio/128/{reciter_id}/{verse_number}.mp3
```

Example reciters on islamic.network: `ar.alafasy`, `ar.minshawi`, `ar.husary`

### 5.2 Background Videos — Pixabay API

**Free tier:** 5,000 requests/hour. API key is stored in `.env.local` — never hardcoded or committed. Get a free key at pixabay.com/api/docs/.

**Environment setup:**

```bash
# .env.local  ← git-ignored, never committed
NEXT_PUBLIC_PIXABAY_API_KEY=your_key_here
```

```bash
# .env.example  ← committed to repo, no real values
NEXT_PUBLIC_PIXABAY_API_KEY=
```

```ts
// lib/api/pixabay.ts
const PIXABAY_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY
if (!PIXABAY_KEY)
  throw new Error("Missing NEXT_PUBLIC_PIXABAY_API_KEY — see .env.example")
```

```ts
// Search videos
GET https://pixabay.com/api/videos/
  ?key={API_KEY}
  &q={query}            // e.g. "nature", "sky", "desert", "water"
  &video_type=all
  &per_page=20
  &safesearch=true
→ {
    hits: [{
      id,
      tags,
      videos: {
        large:  { url, width, height, size },   // 1920px
        medium: { url, ... },                    // 1280px
        small:  { url, ... },                    // 960px
        tiny:   { url, ... }                     // 640px
      }
    }]
  }
```

**Recommended default queries to preload as categories:**
`nature`, `sky clouds`, `rain water`, `desert sand`, `mountains`, `ocean waves`, `forest`, `light bokeh`, `islamic architecture`

### 5.3 Fallback Background — Static Gradients

When Pixabay is unavailable or user skips it, offer 8 built-in CSS gradient presets rendered directly onto canvas (no external request).

### 5.4 Fonts (all free, self-hostable via Google Fonts or direct download)

| Font Name              | Source                 | Style                        |
| ---------------------- | ---------------------- | ---------------------------- |
| **Amiri Bold**         | Google Fonts           | Classic Naskh — most popular |
| **Scheherazade New**   | Google Fonts (SIL OFL) | Traditional Naskh            |
| **Noto Naskh Arabic**  | Google Fonts           | Clean, modern Naskh          |
| **Lateef**             | Google Fonts (SIL OFL) | Sindhi/Nastaliq-adjacent     |
| **Noto Nastaliq Urdu** | Google Fonts           | Nastaliq calligraphy style   |

Load at runtime using `FontFace` API:

```ts
const font = new FontFace("Amiri", "url(/fonts/Amiri-Bold.woff2)")
await font.load()
document.fonts.add(font)
```

Store `.woff2` files in `/public/fonts/` so they are served statically.

---

## 6. Feature Spec

### 6.1 Configuration Panel

#### Quran Settings

- **Surah selector** — searchable dropdown of all 114 surahs (Arabic name + transliteration + verse count)
- **Start Ayah** — number input (1 to surah.verses_count)
- **End Ayah** — number input (start + 1 to min(start + 9, surah.verses_count)) — enforced max 10 verses
- **Reciter** — searchable dropdown from `/audio/reciters`; show reciter style (Murattal, Mujawwad, etc.)
- **Show Translation** — toggle; language selector (default: English / Saheeh International)
- **Show Verse Number** — toggle (renders badge e.g. ﴿١٢٣﴾)

#### Video Settings

- **Aspect Ratio**

| Label | Resolution  | Use Case                |
| ----- | ----------- | ----------------------- |
| 16:9  | 1920 × 1080 | YouTube                 |
| 9:16  | 1080 × 1920 | Reels / Shorts / TikTok |
| 1:1   | 1080 × 1080 | Instagram Post          |
| 4:5   | 1080 × 1350 | Instagram Feed Portrait |

- **Duration per verse** — slider: 3s – 15s per ayah (default: auto = audio duration + 1s padding)

#### Background Settings

- **Type** — Video (Pixabay) or Gradient (built-in)
- **Search bar** (Video type) — search Pixabay; shows thumbnail grid
- **Gradient picker** (Gradient type) — 8 presets + custom color stops
- **Background opacity** — 0–100% (used to darken video for text legibility)
- **Blur** — 0–20px on background

#### Style Settings

- **Font** — dropdown of 5 Quranic fonts
- **Font size** — slider (relative, adapts to canvas dimensions)
- **Text color** — color picker (default: white)
- **Text shadow** — toggle + shadow color + blur radius
- **Text alignment** — center (default), right
- **Overlay gradient** — linear gradient from bottom (helps text contrast); toggle + intensity

#### Effects Settings

- **Ken Burns** — slow zoom in/out or pan on background video; toggle + direction
- **Verse transition** — None, Fade, Slide Up
- **Text animation** — None, Fade In, Word-by-Word Appear
- **Vignette** — subtle dark edges; toggle + intensity
- **Particle overlay** — optional subtle floating particles (dots/sparkles); toggle + density

### 6.2 Live Preview

- A `<canvas>` element renders the current verse in real time
- Shows selected font, background, effects at correct aspect ratio
- "Play Preview" button plays audio + animates canvas for the selected verse range
- Previous / Next buttons to scrub between verses in range

### 6.3 Video Generation & Export

**Generation pipeline (all in-browser):**

```
1. Prefetch all assets
   ├─ Fetch verse texts from qurancdn API
   ├─ Fetch audio URLs per verse (qurancdn or islamic.network CDN)
   ├─ Preload all audio as ArrayBuffers via fetch()
   ├─ Fetch selected Pixabay video → load into <video> element
   └─ Ensure all fonts are loaded via FontFace API

2. Setup canvas
   ├─ Create OffscreenCanvas (or visible canvas) at target resolution
   └─ Create AudioContext

3. For each verse (index i):
   ├─ Decode audio[i] via AudioContext.decodeAudioData()
   ├─ Play audio[i] through AudioContext → MediaStreamDestination node
   ├─ Render loop (requestAnimationFrame or setInterval at 30fps):
   │   ├─ Draw background frame (video currentTime advances, or gradient)
   │   ├─ Apply Ken Burns transform (CSS-like matrix on canvas)
   │   ├─ Draw vignette overlay
   │   ├─ Draw gradient overlay
   │   ├─ Compute text animation progress (0→1 based on elapsed / duration)
   │   ├─ Draw Arabic text (RTL, centered, with shadow)
   │   ├─ Draw translation text (if enabled)
   │   └─ Draw verse number badge
   └─ Wait for audio[i] to finish → crossfade transition → next verse

4. Capture streams
   ├─ canvas.captureStream(30)           → videoStream
   ├─ AudioContext destination.stream    → audioStream
   └─ new MediaStream([videoTrack, audioTrack]) → combinedStream

5. MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' })
   ├─ Collect Blob chunks
   └─ On stop → assemble Blob

6. (Optional) FFmpeg.wasm transcode
   ├─ @ffmpeg/ffmpeg loads WASM (~32MB, cached after first load)
   ├─ ffmpeg.writeFile('input.webm', new Uint8Array(webmBlob))
   ├─ ffmpeg.exec(['-i','input.webm','-c:v','libx264','-c:a','aac','output.mp4'])
   └─ Read output.mp4 → download

7. Offer download
   ├─ WebM (fast, no transcode)
   └─ MP4 (requires FFmpeg WASM transcode, slower)
```

**FFmpeg.wasm Setup (Next.js):**

```ts
// next.config.ts — required for SharedArrayBuffer (FFmpeg WASM dependency)
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ]
  },
}
```

---

## 7. Architecture

```
ayahvid/
├── app/
│   ├── layout.tsx              # COOP/COEP headers set in next.config.ts
│   ├── page.tsx                # Main editor page
│   └── api/                    # (empty — no backend needed)
│
├── components/
│   ├── editor/
│   │   ├── ConfigPanel.tsx     # Left sidebar: all settings
│   │   ├── PreviewCanvas.tsx   # Center: canvas preview
│   │   ├── VerseTimeline.tsx   # Bottom: verse scrubber
│   │   └── ExportModal.tsx     # Export progress + download
│   │
│   ├── panels/
│   │   ├── QuranPanel.tsx      # Surah, ayah range, reciter
│   │   ├── VideoPanel.tsx      # Aspect ratio, duration
│   │   ├── BackgroundPanel.tsx # Pixabay search + gradient picker
│   │   ├── StylePanel.tsx      # Font, color, overlay
│   │   └── EffectsPanel.tsx    # Ken Burns, transitions, particles
│   │
│   └── ui/                     # shadcn/ui components
│
├── lib/
│   ├── api/
│   │   ├── quran.ts            # Quran.com API wrappers + types
│   │   ├── pixabay.ts          # Pixabay API wrapper + types
│   │   └── audio.ts            # Audio fetch + decode helpers
│   │
│   ├── canvas/
│   │   ├── renderer.ts         # Core frame render function
│   │   ├── textLayout.ts       # Arabic text measurement + wrap
│   │   ├── effects.ts          # Ken Burns, vignette, particles
│   │   └── transitions.ts      # Fade, slide-up crossfade logic
│   │
│   ├── video/
│   │   ├── recorder.ts         # MediaRecorder pipeline
│   │   ├── ffmpegWorker.ts     # FFmpeg WASM transcode (web worker)
│   │   └── export.ts           # Orchestrates full export flow
│   │
│   └── store/
│       ├── editorStore.ts      # Zustand: all config state
│       └── assetStore.ts       # Zustand: fetched API data cache
│
├── hooks/
│   ├── useQuranData.ts         # SWR-like fetcher for chapters/verses
│   ├── usePixabaySearch.ts     # Debounced Pixabay video search
│   ├── useAudioPlayer.ts       # Preview playback with Web Audio API
│   └── useExport.ts            # Export pipeline state + progress
│
├── public/
│   ├── fonts/
│   │   ├── Amiri-Bold.woff2
│   │   ├── ScheherazadeNew-Bold.woff2
│   │   ├── NotoNaskhArabic-Bold.woff2
│   │   ├── Lateef-SemiBold.woff2
│   │   └── NotoNastaliqUrdu-Bold.woff2
│   └── ffmpeg/                 # FFmpeg WASM core files (copied from @ffmpeg/core)
│       ├── ffmpeg-core.js
│       ├── ffmpeg-core.wasm
│       └── ffmpeg-core.worker.js
│
├── types/
│   ├── quran.ts
│   ├── pixabay.ts
│   └── editor.ts
│
└── next.config.ts              # COOP/COEP headers for SharedArrayBuffer
```

---

## 8. Data Models

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
  | "Amiri"
  | "Scheherazade New"
  | "Noto Naskh Arabic"
  | "Lateef"
  | "Noto Nastaliq Urdu"

export type VerseTransition = "none" | "fade" | "slideUp"
export type TextAnimation = "none" | "fadeIn" | "wordByWord"

export interface EditorConfig {
  // Quran
  chapterId: number
  startAyah: number
  endAyah: number
  reciterId: number
  showTranslation: boolean
  translationId: number // 131 = Saheeh International
  showVerseNumber: boolean

  // Video
  aspectRatio: AspectRatio
  durationPerVerse: number | "auto" // seconds

  // Background
  backgroundType: "video" | "gradient"
  pixabayVideoUrl: string | null
  gradientPreset: number // 0–7 for built-in presets
  backgroundDimness: number // 0–1
  backgroundBlur: number // px

  // Style
  font: QuranicFont
  fontSize: number // base size, scaled to canvas
  textColor: string
  textShadow: boolean
  textShadowColor: string
  textShadowBlur: number
  overlayGradient: boolean
  overlayIntensity: number

  // Effects
  kenBurns: boolean
  kenBurnsDirection: "in" | "out" | "pan-left" | "pan-right"
  verseTransition: VerseTransition
  textAnimation: TextAnimation
  vignette: boolean
  vignetteIntensity: number
  particles: boolean
  particleDensity: number
}
```

---

## 9. Key Implementation Notes

### Arabic Text Rendering on Canvas

Modern browsers (Chrome 95+, Firefox 110+, Safari 16.4+) handle Arabic shaping and bidirectional text natively in `canvas.fillText()` when:

1. The font is loaded via `FontFace` API (not just CSS `@font-face`) before drawing
2. The canvas context direction is set: `ctx.direction = 'rtl'`
3. Text is aligned center: `ctx.textAlign = 'center'`

```ts
ctx.direction = "rtl"
ctx.textAlign = "center"
ctx.font = `${fontSize}px 'Amiri'`
ctx.fillStyle = textColor
ctx.fillText(verse.text_uthmani, canvasWidth / 2, y)
```

For multi-line wrapping, measure word widths and break manually — Arabic words should not be split mid-word.

### Ken Burns Effect

Apply a slow `ctx.setTransform()` scale/translate on the background draw call:

```ts
const scale = 1 + progress * 0.05 // 5% zoom over verse duration
const offsetX = (canvasWidth * (scale - 1)) / 2
const offsetY = (canvasHeight * (scale - 1)) / 2
ctx.save()
ctx.setTransform(scale, 0, 0, scale, -offsetX, -offsetY)
ctx.drawImage(videoEl, 0, 0, canvasWidth, canvasHeight)
ctx.restore()
```

### Audio + Video Sync via Web Audio API

```ts
const audioCtx = new AudioContext()
const dest = audioCtx.createMediaStreamDestination()

// For each verse:
const buffer = await audioCtx.decodeAudioData(arrayBuffer)
const source = audioCtx.createBufferSource()
source.buffer = buffer
source.connect(dest)
source.start()

// Combine with canvas video track:
const canvasStream = canvas.captureStream(30)
const combinedStream = new MediaStream([
  canvasStream.getVideoTracks()[0],
  dest.stream.getAudioTracks()[0],
])
```

### FFmpeg WASM — Loading Strategy

- Load lazily, only when user clicks "Export as MP4"
- Show download size warning (~32MB on first load)
- Cache in browser (the WASM binary is served from `/public/ffmpeg/` so it's same-origin, not CDN)
- Run in a Web Worker to avoid blocking the main thread

### Pixabay API Key — Environment Variables

Load from `process.env.NEXT_PUBLIC_PIXABAY_API_KEY` set in `.env.local`. The `.env.local` file is git-ignored by default in every Next.js project — never commit real keys. The repo ships a `.env.example` with empty values so contributors know what to set. Never log the key value anywhere in the codebase.

---

## 10. Packages

Versions verified from npm registry as of April 2026.

```json
{
  "dependencies": {
    "next": "^16.2.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.8.3",
    "framer-motion": "^12.38.0",
    "zustand": "^5.0.12",
    "@ffmpeg/ffmpeg": "^0.12.15",
    "@ffmpeg/util": "^0.12.2"
  },
  "devDependencies": {
    "tailwindcss": "^4.2.4",
    "@tailwindcss/vite": "^4.2.4",
    "@types/node": "^22.15.3",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2"
  }
}
```

shadcn/ui components to add:
`button`, `slider`, `select`, `input`, `switch`, `badge`, `dialog`, `progress`, `tabs`, `tooltip`, `scroll-area`, `separator`, `popover`, `command` (for searchable selects)

---

## 11. UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  AyahVid                                          [?] [GitHub]  │
├──────────────────┬──────────────────────────┬───────────────────┤
│                  │                          │                   │
│  CONFIG PANEL    │     CANVAS PREVIEW       │   STYLE / FX      │
│  ─────────────   │   ───────────────────    │   ───────────     │
│  📖 Quran        │                          │   🎨 Font         │
│   Surah select   │   ┌──────────────────┐   │   🌈 Colors       │
│   Ayah range     │   │                  │   │   ✨ Effects      │
│   Reciter        │   │  Canvas renders  │   │   🎞 Transition   │
│                  │   │  here (live)     │   │                   │
│  📐 Dimensions   │   │                  │   │                   │
│   16:9 9:16      │   └──────────────────┘   │                   │
│   1:1  4:5       │                          │                   │
│                  │   [◀ Prev] [▶ Play] [Next▶]                  │
│  🖼 Background   │                          │                   │
│   Video search   │   Verse 3 / 7            │                   │
│   Gradient       │                          │                   │
│                  │                          │                   │
├──────────────────┴──────────────────────────┴───────────────────┤
│                                                                 │
│  ████████████████████████████░░░░░  Generating… (4/7 verses)   │
│                                                                 │
│  [⬇ Export WebM — Fast]     [⬇ Export MP4 — ~32MB first load]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Milestones

| #   | Milestone                 | Deliverables                                                                       |
| --- | ------------------------- | ---------------------------------------------------------------------------------- |
| M1  | **Foundation**            | Next.js 15 + TS scaffold, fonts in /public, shadcn/ui configured, Zustand stores   |
| M2  | **Quran API integration** | Surah list, verse fetch, reciter list, audio URL resolution, translation fetch     |
| M3  | **Canvas Renderer**       | Background draw (video + gradient), Arabic text (RTL), overlay, verse number badge |
| M4  | **Preview & Playback**    | Live canvas preview, audio playback via Web Audio API, prev/next verse navigation  |
| M5  | **Effects**               | Ken Burns, vignette, fade/slide transitions, text animation, particles             |
| M6  | **Pixabay Integration**   | Search UI, thumbnail grid, video selection and load into `<video>` element         |
| M7  | **Export — WebM**         | MediaRecorder pipeline, audio+video stream combine, Blob download                  |
| M8  | **Export — MP4**          | FFmpeg WASM integration, transcode WebM→MP4, progress reporting                    |
| M9  | **Polish**                | Loading states, error handling, keyboard shortcuts, responsive layout              |
| M10 | **Open Source Launch**    | README, CONTRIBUTING.md, LICENSE (MIT), demo GIF, GitHub Actions CI                |

---

## 13. Open Source Setup

- **License:** MIT
- **Repo structure:** monorepo (single Next.js app)
- **Demo:** Deploy to Vercel (free tier, static/edge, no server needed)
  - Note: Vercel doesn't require a backend, but COOP/COEP headers must be set in `next.config.ts` — Vercel supports this
- **Contributing:** Issues for each milestone as GitHub Projects board
- **README sections:** Demo GIF, Quick Start, API Key Setup (Pixabay), Font Attribution, Tech Stack, Contributing

---

## 14. Limitations & Known Constraints

| Issue                                                                      | Mitigation                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `MediaRecorder` outputs WebM only on Chromium; Safari outputs MP4 natively | Detect browser and skip FFmpeg transcode on Safari                             |
| FFmpeg WASM requires `SharedArrayBuffer` → needs COOP/COEP headers         | Set in `next.config.ts`; note this disables some third-party iframes           |
| Pixabay video is cross-origin → canvas `drawImage` taints the canvas       | Pixabay video URLs support CORS; add `video.crossOrigin = 'anonymous'`         |
| Large resolutions (1920×1080) may be slow in browser                       | Add a "fast preview" mode at 50% resolution; only render full-res on export    |
| Arabic font rendering in Canvas varies across OS/browser                   | Test matrix: Chrome/Windows, Chrome/Mac, Safari/Mac, Firefox/Linux             |
| Max 10 verses → max ~15 min audio possible                                 | MediaRecorder handles this fine; FFmpeg WASM may need more RAM for long videos |
