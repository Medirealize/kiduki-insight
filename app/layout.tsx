import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ほんね。 — 気づいて！私のきもち",
  description:
    "自分の気持ちに気づき、言葉にするためのコミュニケーション支援ツールです。医学的診断は行いません。",
};

export const viewport: Viewport = {
  themeColor: "#1877f2",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased`}>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
