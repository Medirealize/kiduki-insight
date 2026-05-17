import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const COOKIE_NAME = "admin_token";

function isAdminAuthed(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return req.cookies.get(COOKIE_NAME)?.value === adminPassword;
}

function buildEmptyChart(): { date: string; count: number }[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 };
  });
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = createServerClient();

    // 総ログ件数
    const { count: totalLogs } = await db
      .from("honne_logs")
      .select("*", { count: "exact", head: true });

    // ユニークユーザー数（distinct user_id）
    const { data: userRows } = await db
      .from("honne_logs")
      .select("user_id");
    const totalUsers = new Set((userRows ?? []).map((r) => r.user_id)).size;

    const logCount = totalLogs ?? 0;
    const avgLogsPerUser = totalUsers > 0
      ? Math.round((logCount / totalUsers) * 10) / 10
      : 0;

    // 直近14日の日別ログ数
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const { data: recentLogs } = await db
      .from("honne_logs")
      .select("created_at")
      .gte("created_at", since.toISOString());

    const chart = buildEmptyChart();
    (recentLogs ?? []).forEach((row) => {
      const d = new Date(row.created_at);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const entry = chart.find((c) => c.date === label);
      if (entry) entry.count += 1;
    });

    return NextResponse.json({
      totalUsers,
      totalLogs: logCount,
      avgLogsPerUser,
      conversionClickRate: 0, // 課金未実装のため0
      chart,
      isMock: false,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
