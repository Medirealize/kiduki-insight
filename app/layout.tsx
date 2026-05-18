import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://insight.medirealize.jp";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ほんね。— 気づいて！私のきもち",
    template: "%s | ほんね。",
  },
  description:
    "先生に伝えたいのに、うまく言葉にできない——そんな気持ちを、ここで整理してから診察室へ。性格統計学とAIがあなたの本音を引き出すコミュニケーション支援ツールです。",
  keywords: [
    "先生に言えない気持ち",
    "診察前 準備",
    "医師 コミュニケーション",
    "本音 言葉にする",
    "病院 不安 伝え方",
    "自分の気持ち 言語化",
    "気づき 自己理解",
    "ほんね",
    "患者 コミュニケーション",
    "心の声",
  ],
  authors: [{ name: "Medirealize", url: "https://medirealize.jp" }],
  creator: "Medirealize",
  publisher: "Medirealize",
  category: "health",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: BASE_URL,
    siteName: "ほんね。",
    title: "ほんね。— 気づいて！私のきもち",
    description:
      "先生に伝えたいのに、うまく言葉にできない——そんな気持ちを、ここで整理してから診察室へ。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ほんね。— 気づいて！私のきもち",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ほんね。— 気づいて！私のきもち",
    description:
      "先生に伝えたいのに、うまく言葉にできない——そんな気持ちを、ここで整理してから診察室へ。",
    images: ["/og-image.png"],
    site: "@medirealize",
    creator: "@medirealize",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: { "ja-JP": BASE_URL },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/pwa-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ほんね。",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1877f2",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ほんね。",
  alternateName: "ほんね。— 気づいて！私のきもち",
  description:
    "先生に伝えたいのに、うまく言葉にできない気持ちを整理するコミュニケーション支援ツール。",
  url: BASE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "iOS, Android, Web",
  inLanguage: "ja",
  isAccessibleForFree: true,
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "JPY", name: "無料プラン" },
    { "@type": "Offer", price: "980", priceCurrency: "JPY", name: "プレミアムプラン", billingDuration: "P1M" },
  ],
  author: {
    "@type": "Organization",
    name: "Medirealize",
    url: "https://medirealize.jp",
  },
  featureList: [
    "性格統計学に基づく問いかけ",
    "AIによる本音の言語化",
    "医師への伝え方のサポート",
    "本音の記録と振り返り",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" prefix="og: https://ogp.me/ns#">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
