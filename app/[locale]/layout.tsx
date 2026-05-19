import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { RegisterServiceWorker } from "../register-sw";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const BASE_URL = "https://insight.medirealize.jp";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: isEn ? "honne. — Notice me. My true feelings." : "ほんね。— 気づいて！私のきもち",
      template: isEn ? "%s | honne." : "%s | ほんね。",
    },
    description: isEn
      ? "What you want to say, but can't — put it into words here. A communication support tool that uses personality statistics and AI to surface your true feelings."
      : "言いたいのに言えない——そんな気持ちを、ここで言葉にしてみませんか。性格統計学とAIがあなたの本音を引き出すコミュニケーション支援ツールです。",
    keywords: isEn
      ? ["unspoken feelings", "put feelings into words", "communication support", "self-awareness", "honne", "emotional expression", "personality statistics"]
      : ["言いたいのに言えない", "気持ちを言葉にする", "本音 言語化", "コミュニケーション 苦手", "気持ち 伝え方", "自分の気持ち 整理", "気づき 自己理解", "ほんね", "感情 言語化", "心の声"],
    authors: [{ name: "Medirealize", url: "https://medirealize.jp" }],
    creator: "Medirealize",
    publisher: "Medirealize",
    category: "health",
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "ja_JP",
      url: isEn ? `${BASE_URL}/en` : BASE_URL,
      siteName: isEn ? "honne." : "ほんね。",
      title: isEn ? "honne. — Notice me. My true feelings." : "ほんね。— 気づいて！私のきもち",
      description: isEn
        ? "What you want to say, but can't — put it into words here."
        : "言いたいのに言えない——そんな気持ちを、ここで言葉にしてみませんか。",
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: isEn ? "honne." : "ほんね。" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isEn ? "honne. — Notice me. My true feelings." : "ほんね。— 気づいて！私のきもち",
      description: isEn
        ? "What you want to say, but can't — put it into words here."
        : "言いたいのに言えない——そんな気持ちを、ここで言葉にしてみませんか。",
      images: [`${BASE_URL}/opengraph-image`],
      site: "@medirealize",
      creator: "@medirealize",
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: BASE_URL,
      languages: { "ja-JP": BASE_URL, "en-US": `${BASE_URL}/en` },
    },
    manifest: "/manifest.webmanifest",
    icons: { icon: "/favicon.ico", apple: "/pwa-icon.svg" },
    appleWebApp: { capable: true, statusBarStyle: "default", title: isEn ? "honne." : "ほんね。" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#1877f2",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ja" | "en")) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} prefix="og: https://ogp.me/ns#">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PCJRQ6D1W3" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-PCJRQ6D1W3');` }} />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <RegisterServiceWorker />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
