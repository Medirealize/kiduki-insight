import type { Metadata } from "next";

const BASE_URL = "https://insight.medirealize.jp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Privacy Policy" : "プライバシーポリシー",
    description: isEn
      ? "Privacy policy for honne. — how we handle your data."
      : "ほんね。のプライバシーポリシー。個人情報の取り扱いについて説明します。",
    robots: { index: true, follow: false },
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        ja: `${BASE_URL}/ja/privacy`,
        en: `${BASE_URL}/en/privacy`,
        "x-default": `${BASE_URL}/ja/privacy`,
      },
    },
  };
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
