# AGENTS.md — Quran Studio

## Project Overview

Quran Studio is a **Next.js 16 (App Router)** web application that generates MP4 videos of Quranic verses. A user picks a Surah, an ayah range, a reciter, a visual theme, and optional settings; the server then fetches audio from Quran.com, fetches a background video from Pixabay, composites Arabic text overlays via FFmpeg/libass, and streams the finished MP4 back to the browser.

The UI is fully bilingual (Arabic RTL / English LTR) and is contained in a single client-side page.

---

## Repository Layout

```
quran-studio/
├── public/
│   └── fonts/               # Arabic TTF fonts served statically & registered with fontconfig in Docker
├── src/
│   ├── app/
│   │   ├── page.tsx          # Single-page client UI (all state lives here)
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Tailwind + custom CSS variables / animations
│   │   └── api/
│   │       ├── generate/     # POST /api/generate — orchestrates video pipeline
│   │       ├── quran/        # GET /api/quran/chapters, /api/quran/reciters
│   │       ├── videos/       # (background video proxy, if used)
│   │       └── debug/        # Debug/health endpoints
│   ├── components/           # Stateless/controlled UI components (see below)
│   └── lib/
│       ├── ffmpeg.ts         # FFmpeg wrapper — video composition pipeline
│       ├── quran-api.ts      # Quran.com API v4 client (chapters, verses, audio, tafsir)
│       ├── pixabay.ts        # Pixabay API client — background video search
│       └── i18n.ts           # Bilingual string table + `t(lang, key)` helper
├── Dockerfile                # Multi-stage build; production image installs system FFmpeg + fontconfig
├── render.yaml               # Render deployment config
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Tech Stack

| Layer           | Technology                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Framework       | Next.js 16.2 (App Router)                                                                       |
| Language        | TypeScript 6                                                                                    |
| Styling         | Tailwind CSS v4 + custom CSS variables                                                          |
| React           | React 19                                                                                        |
| Video encoding  | FFmpeg via `fluent-ffmpeg`; `@ffmpeg-installer/ffmpeg` for local dev, system `ffmpeg` in Docker |
| HTTP client     | Axios                                                                                           |
| IDs             | `uuid` v13                                                                                      |
| Arabic text     | `arabic-reshaper` + libass (in FFmpeg)                                                          |
| Package manager | npm (canonical lock file: `package-lock.json`); `bun.lock` also present                         |

---

## Running Locally

```sh
bun install
bun run dev          # starts on http://localhost:3034
```

Other scripts:

```sh
bun run build        # production build
bun run start        # production server
bun run lint         # ESLint
bun run format       # Prettier
```

---

## Environment Variables

| Variable          | Required   | Description                                                                                                                     |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `PIXABAY_API_KEY` | Yes (prod) | Pixabay API key for background video search. A fallback key is hard-coded for development only — replace it for production use. |

Set this in a `.env.local` file for local development:

```
PIXABAY_API_KEY=your_key_here
```

In Docker / Render, set it as a secret environment variable. **Never commit a real API key.**

---

## Architecture: Video Generation Pipeline

`POST /api/generate` (max timeout: 5 minutes) runs these steps in sequence:

1. **Validate** — checks required fields; enforces a hard cap of **10 verses per request**.
2. **Fetch verses** — `quran-api.getVerses(chapter, from, to)` → Quran.com API v4, Uthmani script.
3. **Fetch audio** — `quran-api.getAudioFiles(reciterId, chapter)` → per-ayah MP3 URLs from `verses.quran.com`.
4. **Fetch tafsir** (optional) — `quran-api.getTafsir(chapter, verseNumber)` → Tafsir ID 16 (default); HTML tags stripped; truncated to 200 chars.
5. **Fetch background video** — `pixabay.getRandomVideoUrl(theme)` → random medium-quality MP4 from Pixabay.
6. **Generate video** — `ffmpeg.generateVideo(overlays, bgUrl, dimOpacity, width, height, fontFile)`.
7. **Stream response** — the output MP4 is streamed back using a Web `ReadableStream`; the temp directory is deleted 3 seconds after streaming completes.

### Resolution Cap

On the server the resolution is capped at **854 × 480** to avoid OOM on the 512 MB Render free tier, regardless of what the client requests.

---

## API Routes

### `POST /api/generate`

**Body (JSON):**

```json
{
  "chapter": 1,
  "from": 1,
  "to": 7,
  "reciterId": 7,
  "theme": "nature",
  "includeTafsir": false,
  "dimOpacity": 0.55,
  "videoWidth": 1280,
  "videoHeight": 720,
  "fontFile": "Amiri.ttf"
}
```

**Response:** `video/mp4` stream.  
**Errors:** JSON `{ error, details }` with appropriate HTTP status codes.

### `GET /api/quran/chapters`

Returns `{ chapters: Chapter[] }` from Quran.com.

### `GET /api/quran/reciters`

Returns `{ reciters: Reciter[] }` from Quran.com.

---

## UI Components (`src/components/`)

All components are controlled (props in, callback out) and accept a `lang: "ar" | "en"` prop for bilingual rendering.

| Component             | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `SurahSelector`       | Dropdown to pick a Surah (114 chapters)                                   |
| `AyahRangePicker`     | Start/end ayah number inputs, bounded by chapter length                   |
| `ReciterSelector`     | Dropdown to pick a reciter                                                |
| `ThemeSelector`       | Button group for background theme                                         |
| `BrightnessControl`   | Slider for `dimOpacity` (0–100 mapped to 0.0–1.0)                         |
| `AspectRatioSelector` | Picks video dimensions (16:9, 9:16, 1:1, etc.)                            |
| `FontSelector`        | Picks Arabic font (TTF files from `public/fonts/`)                        |
| `TafsirToggle`        | Checkbox to include tafsir overlay                                        |
| `AutoMode`            | Toggle that randomises reciter + theme on each Surah change               |
| `GenerateButton`      | Submit button with progress bar and status text                           |
| `VideoPreview`        | Renders the returned blob URL in a `<video>` element with a download link |
| `LanguageSwitcher`    | Toggles `lang` state; also sets `document.documentElement.lang` and `dir` |

---

## Internationalisation (`src/lib/i18n.ts`)

- `Lang` type: `"ar" | "en"`.
- All UI strings live in the `translations` record.
- Use `t(lang, key)` to look up a string. If the key is missing it returns the key itself as fallback.
- When adding a new string, add it to **both** `ar` and `en` blocks.
- The root `<html>` element's `lang` and `dir` attributes are updated on language switch (handled in `page.tsx`).

---

## FFmpeg / Font Notes (`src/lib/ffmpeg.ts`)

- On **local dev** (Windows or any OS without system FFmpeg): the `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe` npm packages provide the binaries.
- In **Docker/production**: system `ffmpeg` (Alpine `apk`) is preferred via `execSync('command -v ffmpeg')`.
- Arabic text shaping is handled by **libass** inside FFmpeg. Fonts must be registered with fontconfig:
  - In Docker, `public/fonts/*.ttf` are copied to `/usr/share/fonts/app/` and `fc-cache -fv` is run at image build time.
  - Locally, ensure the font files are accessible to libass or specify full paths.
- Temp files are written to `os.tmpdir()` with UUID-named subdirectories and cleaned up after streaming.

---

## Background Themes (`src/lib/pixabay.ts`)

Five themes are supported: `nature`, `ocean`, `sky`, `desert`, `forest`.

Each maps to a Pixabay search query that excludes people. To add a new theme:

1. Add the key to the `Theme` union type.
2. Add an entry to `themeKeywords`.
3. Add the translated label to both `ar` and `en` in `i18n.ts`.
4. Add the option to `ThemeSelector.tsx` and the `AUTO_THEMES` array in `page.tsx`.

---

## Adding a New Font

1. Place the `.ttf` file in `public/fonts/`.
2. Add an option to `FontSelector.tsx` (use the filename as the value).
3. Rebuild the Docker image so the font is registered with fontconfig.

---

## Deployment (Render / Docker)

- `render.yaml` configures the Render service.
- `Dockerfile` is a two-stage build: **builder** (Node 22 Alpine, `npm ci` + `next build`) → **runner** (Node 22 Alpine, system FFmpeg, fontconfig).
- Set `PIXABAY_API_KEY` as a secret environment variable in the Render dashboard.
- The app listens on `PORT` (default `3000`) with `HOSTNAME=0.0.0.0`.

---

## Key Constraints & Limits

- **Max 10 verses per video** — enforced server-side in `/api/generate`.
- **Max output resolution: 854 × 480** — server-side cap to protect the 512 MB Render tier.
- **5-minute server timeout** (`maxDuration = 300` on the route).
- **Quran.com API is unauthenticated** — respect rate limits; the `withRetry` helper retries up to 3 times with exponential backoff on transient network errors.
- **Auto Mode** randomises the reciter (from `AUTO_RECITERS = [7, 2, 3, 5]`) and theme on each Surah change; reciter/theme pickers are hidden in this mode.

---

## Code Style

- TypeScript strict mode is enabled.
- Tailwind CSS v4 utility classes plus custom CSS variables defined in `globals.css`.
- All API route files are named `route.ts` following Next.js App Router conventions.
- Prefer `async/await` over promise chains.
- `console.log` prefixed with `[GEN]` or `[quran-api]` is used for server-side progress tracing — keep this pattern for new pipeline steps.
