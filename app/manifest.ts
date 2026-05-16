import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ほんね。 — 気づいて！私のきもち",
    short_name: "ほんね。",
    description:
      "自分の気持ちに気づき、言葉にするためのコミュニケーション支援ツールです。医学的診断は行いません。",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f2f5",
    theme_color: "#1877f2",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
