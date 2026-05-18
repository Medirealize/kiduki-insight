import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ほんねの記録",
  description:
    "これまでに言葉にしてきた本音の記録です。振り返ることで、自分の気持ちの変化に気づけます。",
  openGraph: {
    title: "ほんねの記録 | ほんね。",
    description: "あなたが言語化してきた本音の記録一覧。振り返りと気づきのページです。",
  },
  robots: { index: false },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
