import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

function isAdminAuthed(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token === adminPassword;
}

// Generate deterministic mock chart data for the past 14 days.
// Replace the body of this function with real DB queries when Supabase is wired up.
function buildChartData(): { date: string; count: number }[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    // Deterministic mock value derived from day-of-month so it's stable across renders.
    const count = ((d.getDate() * 7 + 11) % 18) + 4; // 4–21 range
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count,
    };
  });
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // -----------------------------------------------------------------
  // TODO: Replace the mock values below with real Supabase queries:
  //   const { count: totalUsers }  = await supabase.from("users").select("*", { count: "exact", head: true });
  //   const { count: totalLogs }   = await supabase.from("diagnosis_logs").select("*", { count: "exact", head: true });
  //   const dailyChart             = await supabase.rpc("daily_log_counts_14d");
  // -----------------------------------------------------------------
  const totalUsers = 127;
  const totalLogs = 384;
  const avgLogsPerUser = totalUsers > 0 ? Math.round((totalLogs / totalUsers) * 10) / 10 : 0;
  const conversionClickRate = 4.7; // % — mock KPI

  return NextResponse.json({
    totalUsers,
    totalLogs,
    avgLogsPerUser,
    conversionClickRate,
    chart: buildChartData(),
    isMock: true, // flag to display "demo data" label in UI
  });
}
