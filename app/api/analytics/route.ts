import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const event = typeof body.event === "string" ? body.event : "unknown";
    const step = typeof body.step === "number" ? body.step : undefined;
    if (process.env.NODE_ENV !== "production") {
      console.log("[analytics]", { event, step, ...body });
    }
  } catch {
    /* ignore malformed */
  }
  return new NextResponse(null, { status: 204 });
}
