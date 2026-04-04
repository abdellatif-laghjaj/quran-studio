# Quran Studio | استوديو القرآن

<div align="center">

**Create beautiful Quranic videos with recitations, Arabic text overlays, and serene backgrounds**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[English](#english) | [العربية](#arabic)

</div>

---

## <a name="english"></a>🌟 Features

- 🎥 **Video Generation**: Create MP4 videos with Quranic verses and audio recitations
- 🎨 **Beautiful Themes**: Choose from 5 background themes (Nature, Ocean, Sky, Desert, Forest)
- 🎙️ **Multiple Reciters**: Select from renowned Quran reciters
- 📖 **Arabic Typography**: 10 beautiful Arabic fonts including Amiri, Cairo, Noto Naskh, and more
- 🌓 **Dark/Light Mode**: Seamless theme switching with persistent preferences
- 🌍 **Bilingual Interface**: Full support for Arabic (RTL) and English (LTR)
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Auto Mode**: Randomize reciter and theme for quick video generation
- 🎬 **Multiple Aspect Ratios**: 16:9 (YouTube), 9:16 (Reels), 1:1 (Instagram), 4:5 (Facebook)
- 💾 **Persistent Settings**: Language and theme preferences saved locally

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- FFmpeg installed on your system

### Installation

```bash
# Clone the repository
git clone https://github.com/abdellatif-laghjaj/quran-studio.git
cd quran-studio

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Add your PIXABAY_API_KEY to .env.local

# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3034](http://localhost:3034) in your browser.

---

## 🎨 Tech Stack

| Category             | Technology                                            |
| -------------------- | ----------------------------------------------------- |
| **Framework**        | Next.js 16.2 (App Router)                             |
| **Language**         | TypeScript 6                                          |
| **Styling**          | Tailwind CSS v4 + shadcn/ui                           |
| **UI Components**    | Radix UI primitives                                   |
| **Video Processing** | FFmpeg + fluent-ffmpeg                                |
| **Fonts**            | Cairo (Arabic), Rubik (English), Amiri (Quranic text) |
| **APIs**             | Quran.com API v4, Pixabay API                         |

---

## 📁 Project Structure

```
quran-studio/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── generate/     # Video generation endpoint
│   │   │   └── quran/        # Quran data endpoints
│   │   ├── page.tsx          # Main UI page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── *.tsx            # Feature components
│   └── lib/
│       ├── ffmpeg.ts        # Video generation logic
│       ├── quran-api.ts     # Quran.com API client
│       ├── pixabay.ts       # Pixabay API client
│       └── i18n.ts          # Internationalization
├── public/
│   └── fonts/               # Arabic font files
└── package.json
```

---

## 🎯 Usage

1. **Select a Surah**: Choose from 114 chapters of the Quran
2. **Pick Verse Range**: Select start and end verses (max 10 verses)
3. **Choose Reciter**: Select your preferred reciter (or enable Auto Mode)
4. **Customize Design**:
   - Background theme
   - Brightness level
   - Aspect ratio
   - Arabic font style
5. **Generate**: Click the generate button and wait for your video
6. **Download**: Preview and download your MP4 video

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
PIXABAY_API_KEY=your_pixabay_api_key_here
```

### Video Limits

- **Max verses per video**: 10
- **Max resolution**: 854×480 (configurable)
- **Timeout**: 5 minutes per generation

---

## 🌐 API Endpoints

### `POST /api/generate`

Generate a Quranic video.

**Request Body:**

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

**Response:** MP4 video stream

### `GET /api/quran/chapters`

Get list of all Quran chapters.

### `GET /api/quran/reciters`

Get list of available reciters.

---

## 🎨 Customization

### Adding a New Font

1. Add the `.ttf` file to `public/fonts/`
2. Update `src/components/FontSelector.tsx`
3. Restart the development server

### Adding a New Theme

1. Add theme to `Theme` type in `src/app/page.tsx`
2. Add keyword mapping in `src/lib/pixabay.ts`
3. Add translations in `src/lib/i18n.ts`
4. Add option in `src/components/ThemeSelector.tsx`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [Quran.com](https://quran.com) for the Quran API
- [Pixabay](https://pixabay.com) for background videos
- [shadcn/ui](https://ui.shadcn.com) for UI components
- All the amazing Quran reciters

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

<div align="center">

Made with ❤️ for the Muslim community

**[⬆ Back to Top](#quran-studio--استوديو-القرآن)**

</div>

---

## <a name="arabic"></a>العربية

### 🌟 المميزات

- 🎥 **إنشاء الفيديو**: إنشاء مقاطع فيديو MP4 مع آيات القرآن والتلاوات الصوتية
- 🎨 **ثيمات جميلة**: اختر من 5 خلفيات (طبيعة، محيط، سماء، صحراء، غابة)
- 🎙️ **قراء متعددون**: اختر من قراء القرآن المشهورين
- 📖 **خطوط عربية**: 10 خطوط عربية جميلة منها أميري، القاهرة، نوتو نسخ
- 🌓 **الوضع الليلي/النهاري**: تبديل سلس مع حفظ التفضيلات
- 🌍 **واجهة ثنائية اللغة**: دعم كامل للعربية والإنجليزية
- 📱 **تصميم متجاوب**: يعمل بشكل مثالي على الكمبيوتر والجوال
- ⚡ **الوضع التلقائي**: اختيار عشوائي للقارئ والثيم
- 🎬 **نسب أبعاد متعددة**: 16:9 (يوتيوب)، 9:16 (ريلز)، 1:1 (انستغرام)، 4:5 (فيسبوك)
- 💾 **حفظ الإعدادات**: حفظ تفضيلات اللغة والثيم محلياً

### 🚀 البدء السريع

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/quran-studio.git
cd quran-studio

# تثبيت المكتبات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local
# أضف PIXABAY_API_KEY في .env.local

# تشغيل السيرفر
npm run dev
```

افتح [http://localhost:3034](http://localhost:3034) في المتصفح.

### 📧 التواصل

لأي استفسارات أو دعم، يرجى فتح issue على GitHub.

---

<div align="center">

صُنع بـ ❤️ للمجتمع الإسلامي

</div>
