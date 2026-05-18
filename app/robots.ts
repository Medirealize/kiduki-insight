import type { MetadataRoute } from "next";

const BASE_URL = "https://insight.medirealize.jp";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Facebookクローラーは明示的に許可
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      // Twitterクローラーも許可
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      // LINE / その他SNSクローラー許可
      {
        userAgent: "Slackbot",
        allow: "/",
      },
      // 一般クローラー
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
