import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f2f5] px-6 font-sans text-[#1c1e21]">
      <div className="w-full max-w-sm rounded-2xl border border-[#dfe3e8] bg-white px-8 py-12 text-center shadow-sm">
        <p className="text-5xl font-black tracking-[0.08em] text-[#1877f2]">ほんね。</p>
        <p className="mt-6 text-4xl font-bold text-[#1c1e21]">404</p>
        <p className="mt-2 text-base font-semibold text-[#606770]">ページが見つかりません</p>
        <p className="mt-3 text-sm leading-relaxed text-[#8d949e]">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-[#1877f2] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5]"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
