import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quran Video Generator | مُولِّد فيديو القرآن",
  description:
    "Create beautiful Quranic videos with recitations, Arabic text, and calm backgrounds. أنشئ فيديوهات قرآنية بتلاوات جميلة",
  keywords: [
    "quran",
    "video",
    "recitation",
    "islamic",
    "arabic",
    "قرآن",
    "فيديو",
    "تلاوة",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
