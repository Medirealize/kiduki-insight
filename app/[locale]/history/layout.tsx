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
    title: isEn ? "My Records" : "ほんねの記録",
    description: isEn
      ? "Your saved honne records — revisit and reflect on what you've put into words."
      : "これまでに言葉にしてきた本音の記録です。振り返ることで、自分の気持ちの変化に気づけます。",
    robots: { index: false },
    alternates: {
      canonical: `${BASE_URL}/${locale}/history`,
      languages: {
        ja: `${BASE_URL}/ja/history`,
        en: `${BASE_URL}/en/history`,
        "x-default": `${BASE_URL}/ja/history`,
      },
    },
  };
}

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
