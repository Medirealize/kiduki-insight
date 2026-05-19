import type { MetadataRoute } from "next";

const BASE_URL = "https://insight.medirealize.jp";
const LOCALES = ["ja", "en"] as const;

type SitemapEntry = MetadataRoute.Sitemap[number];

function localizedEntries(
  path: string,
  opts: Omit<SitemapEntry, "url" | "alternates">
): SitemapEntry[] {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    ...opts,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  }));
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ルートリダイレクト（/ → /ja）
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // メインページ（両ロケール）
    ...localizedEntries("", {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    }),

    // 履歴ページ（noindex だがクロール対象として明示）
    ...localizedEntries("/history", {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    }),

    // プライバシーポリシー
    ...localizedEntries("/privacy", {
      lastModified: new Date("2026-05-17"),
      changeFrequency: "yearly",
      priority: 0.3,
    }),

    // 利用規約
    ...localizedEntries("/terms", {
      lastModified: new Date("2026-05-19"),
      changeFrequency: "yearly",
      priority: 0.3,
    }),

    // 特定商取引法 / Legal Notice
    ...localizedEntries("/legal", {
      lastModified: new Date("2026-05-19"),
      changeFrequency: "yearly",
      priority: 0.2,
    }),
  ];
}
