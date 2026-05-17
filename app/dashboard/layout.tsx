import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "マイページ",
  description: "利用状況や記録件数、会員プランをかんたんに確認できるマイページです。",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
