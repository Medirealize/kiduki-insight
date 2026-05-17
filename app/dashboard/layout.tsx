import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description:
    "利用状況の確認と App Store 進出レディネスを管理するダッシュボードです。",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
