import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-honne-bg px-6 font-sans text-honne-text">
      <div className="w-full max-w-sm rounded-2xl border border-honne-border-light bg-white px-8 py-12 text-center shadow-sm">
        <p className="text-5xl font-black tracking-[0.08em] text-honne-primary">ほんね。</p>
        <p className="mt-6 text-4xl font-bold text-honne-text">404</p>
        <p className="mt-2 text-base font-semibold text-honne-secondary">ページが見つかりません</p>
        <p className="mt-3 text-sm leading-relaxed text-honne-placeholder">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="honne-btn-primary mt-8 inline-block rounded-full px-8 py-3 text-sm font-semibold"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
