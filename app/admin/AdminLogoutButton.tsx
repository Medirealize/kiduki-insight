"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-honne-border-light px-3 py-1.5 text-xs text-honne-secondary transition hover:bg-honne-bg"
    >
      ログアウト
    </button>
  );
}
