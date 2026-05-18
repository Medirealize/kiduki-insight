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
    "言いたいのに言えない——そんな気持ちを、ここで言葉にしてみませんか。性格統計学とAIがあなたの本音を引き出すコミュニケーション支援ツールです。",
  keywords: [
    "言いたいのに言えない",
    "気持ちを言葉にする",
    "本音 言語化",
    "コミュニケーション 苦手",
    "気持ち 伝え方",
    "自分の気持ち 整理",
    "気づき 自己理解",
    "ほんね",
    "感情 言語化",
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
      "言いたいのに言えない——そんな気持ちを、ここで言葉にしてみませんか。",
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
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
      "言いたいのに言えない——そんな気持ちを、ここで言葉にしてみませんか。",
    images: [`${BASE_URL}/opengraph-image`],
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

// WebApplication スキーマ
const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ほんね。",
  alternateName: "ほんね。— 言いたいのに、言えない。",
  description: "言いたいのに言えない気持ちを言語化するコミュニケーション支援ツール。",
  url: BASE_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "iOS, Android, Web",
  inLanguage: "ja",
  isAccessibleForFree: true,
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "JPY", name: "無料プラン" },
    { "@type": "Offer", price: "500", priceCurrency: "JPY", name: "プレミアムプラン", billingDuration: "P1M" },
  ],
  author: {
    "@type": "Organization",
    name: "Medirealize",
    url: "https://medirealize.jp",
  },
  featureList: [
    "性格統計学に基づく問いかけ",
    "AIによる本音の言語化",
    "誰かへの伝え方のサポート",
    "本音の記録と振り返り",
  ],
};

// Organization スキーマ
const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Medirealize",
  url: "https://medirealize.jp",
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@medirealize.jp",
    contactType: "customer support",
    availableLanguage: "Japanese",
  },
};

// HowTo スキーマ
const jsonLdHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "ほんね。の使い方",
  description: "言葉にできない気持ちを3ステップで言語化する方法",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "今の自分に近いタイプを選ぶ",
      text: "「自分のペースで考えたい」「まず気持ちをわかってほしい」「仕事や生活への影響が気になる」の3つから選びます。",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "言葉にできない気持ちを書く",
      text: "上司・先生・パートナー・親など、誰かに言えずにいることをそのまま入力します。うまく書けなくても大丈夫です。",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "3つの問いに答える",
      text: "あなたのタイプに合わせた深掘り質問に答えると、AIと性格統計学があなたの本音を言語化します。",
    },
  ],
};

// FAQPage スキーマ
const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "「ほんね。」はどんなアプリですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "上司・先生・パートナー・家族など、誰かに言えない気持ちを言語化するコミュニケーション支援ツールです。性格統計学とAIを使って、あなたの本音を言葉にするお手伝いをします。",
      },
    },
    {
      "@type": "Question",
      name: "無料で使えますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、基本機能は無料でご利用いただけます。1日3回まで利用でき、記録は3件まで閲覧可能です。プレミアムプラン（月額500円）では回数無制限・記録無制限でご利用いただけます。",
      },
    },
    {
      "@type": "Question",
      name: "入力した内容はどこに保存されますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ログインしない場合はお使いの端末内（ローカルストレージ）にのみ保存されます。ログインするとSupabase社のクラウドに保存され、複数端末から確認できます。",
      },
    },
    {
      "@type": "Question",
      name: "医療的なアドバイスはもらえますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "いいえ。本アプリは気持ちの言語化を支援するツールであり、医療診断・治療の提案・専門的なカウンセリングは行いません。体調・精神面に深刻な不安がある場合は、医療機関や相談窓口をご利用ください。",
      },
    },
    {
      "@type": "Question",
      name: "どんな場面で使えますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "上司への不満・要望、パートナーへの気持ち、親への感謝、友人関係の違和感、病院での相談内容の整理など、誰かに「言えない・伝えにくい」と感じる場面であればどんな状況にもご活用いただけます。",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" prefix="og: https://ogp.me/ns#">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
