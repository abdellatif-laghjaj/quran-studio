# Quran Studio

Quran Studio is a web and desktop-ready editor for creating Quran recitation videos. It combines Quran text, translations, timed recitation audio, typography controls, and visual backgrounds into an exportable MP4 canvas workflow.

The app is built with React, Vite, TypeScript, Tailwind CSS, Bun, and Tauri.

## Features

- Quran verse selection by surah and ayah range.
- Multiple reciters with timed audio playback.
- Canvas preview in `9:16`, `16:9`, and `1:1` formats.
- Quran typography controls, including Quran.com font families.
- Translation display with normal, karaoke, and word highlight modes.
- Surah header, Bismillah, and verse marker styling.
- Background modes:
  - Solid color.
  - Pixabay image search with automatic initial fetch.
  - Pixabay video search with poster previews and video canvas rendering.
  - Local image upload.
- HD MP4 export using WebCodecs and `mp4-muxer`.
- Tauri-compatible file saving for desktop builds.

## Requirements

- [Bun](https://bun.sh/)
- A Pixabay API key
- A browser with WebCodecs support for MP4 export

## Environment

Create a `.env.local` file in the project root:

```env
VITE_PIXABAY_API_KEY=your_pixabay_api_key_here
```

The key is used by the Image and Video background tabs to fetch results from Pixabay.

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Vite is configured to run on port `3000` by default:

```text
http://localhost:3000
```

## Scripts

```bash
bun run dev
```

Start the Vite development server.

```bash
bun run build
```

Type-check and build the production app.

```bash
bun run preview
```

Preview the production build locally.

```bash
bun run lint
```

Run ESLint.

```bash
bun run tauri
```

Run Tauri CLI commands.

## Backgrounds

The Image tab is the default background mode. On initial load, the app automatically fetches Pixabay image results and applies a random image as the canvas background.

The Video tab fetches Pixabay videos on initial load as well. Until a video is selected, the editor keeps the current image background instead of falling back to a solid color. Selecting a video applies its poster as the preview and uses the MP4 stream while rendering the canvas.

## Export Notes

MP4 export is rendered from the canvas at 30 FPS with H.264 video and AAC audio. The exported file name includes the surah, ayah range, and reciter.

For best results:

- Wait for audio, fonts, and background assets to load before exporting.
- Use same-origin or CORS-enabled visual assets for canvas export.
- Keep the browser tab active while exporting long videos.

## Project Structure

```text
src/
  app/                         Main application shell
  features/
    audio/                     Audio playback and recording hooks
    quran/                     Quran data, surah data, and fetching hooks
    video-editor/              Canvas, export hooks, media loading, rendering
  layouts/                     Left/right sidebars and editor controls
  shared/                      Reusable components, constants, utilities
public/
  fonts/                       Local font assets
  icon/                        App icons and manifest files
```
