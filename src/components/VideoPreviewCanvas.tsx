"use client";

import { useEffect, useRef } from "react";
import { Lang } from "@/lib/i18n";

interface Props {
  aspectRatio: string;
  fontFile: string;
  theme: string;
  dimOpacity: number;
  lang: Lang;
}

const SAMPLE_AYAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
const SAMPLE_VERSE_NUMBER = "﴿١﴾";

const THEME_IMAGES: Record<string, string> = {
  nature:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
  ocean:
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80",
  sky: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80",
  desert:
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80",
  forest:
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80",
};

const FONT_FAMILIES: Record<string, string> = {
  "Amiri.ttf": "Amiri, serif",
  "Amiri-Bold.ttf": "Amiri, serif",
  "NotoNaskhArabic.ttf": "Noto Naskh Arabic, serif",
  "ArefRuqaa.ttf": "Aref Ruqaa, serif",
  "ArefRuqaa-Bold.ttf": "Aref Ruqaa, serif",
  "Cairo.ttf": "Cairo, sans-serif",
  "Tajawal.ttf": "Tajawal, sans-serif",
  "Tajawal-Bold.ttf": "Tajawal, sans-serif",
  "Almarai.ttf": "Almarai, sans-serif",
  "Lemonada.ttf": "Lemonada, cursive",
};

export default function VideoPreviewCanvas({
  aspectRatio,
  fontFile,
  theme,
  dimOpacity,
  lang,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);
    const baseWidth = 800;
    const baseHeight = Math.round((baseWidth * heightRatio) / widthRatio);

    canvas.width = baseWidth;
    canvas.height = baseHeight;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = THEME_IMAGES[theme] || THEME_IMAGES.nature;

    const drawCanvas = () => {
      if (img.complete) {
        const imgAspect = img.width / img.height;
        const canvasAspect = baseWidth / baseHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          drawHeight = baseHeight;
          drawWidth = img.width * (baseHeight / img.height);
          offsetX = (baseWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = baseWidth;
          drawHeight = img.height * (baseWidth / img.width);
          offsetX = 0;
          offsetY = (baseHeight - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, baseWidth, baseHeight);
      }

      ctx.fillStyle = `rgba(0, 0, 0, ${dimOpacity / 100})`;
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      const fontFamily = FONT_FAMILIES[fontFile] || "Amiri, serif";
      const fontSize = Math.round(baseWidth / 20);

      ctx.fillStyle = "white";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      const centerX = baseWidth / 2;
      const centerY = baseHeight / 2;

      ctx.fillText(SAMPLE_AYAH, centerX, centerY - fontSize / 2);

      ctx.font = `${Math.round(fontSize * 0.6)}px ${fontFamily}`;
      ctx.fillStyle = "#b8922f";
      ctx.shadowBlur = 12;
      ctx.fillText(SAMPLE_VERSE_NUMBER, centerX, centerY + fontSize);

      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.font = `${Math.round(fontSize * 0.4)}px Cairo, sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(
        lang === "ar" ? "معاينة" : "Preview",
        centerX,
        baseHeight - 20,
      );
    };

    if (img.complete) {
      drawCanvas();
    } else {
      img.onload = drawCanvas;
    }

    const timeoutId = setTimeout(drawCanvas, 100);

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
    };
  }, [aspectRatio, fontFile, theme, dimOpacity, lang]);

  return (
    <div className="w-full flex items-center justify-center bg-muted/30 rounded-xl p-4">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-lg"
        style={{ maxHeight: "400px" }}
      />
    </div>
  );
}
