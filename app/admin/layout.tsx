import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理者ダッシュボード — ほんね。",
  description: "管理者専用ページ",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
