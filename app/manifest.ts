import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "先生、本当はね。 — 診察前の気づきガイド",
    short_name: "本当はね",
    description:
      "診察前に自分の想いを言葉にしやすくするコミュニケーション支援ツールです。医学的診断は行いません。",
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
