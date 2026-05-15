import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const event = typeof body.event === "string" ? body.event : "unknown";
    const step = typeof body.step === "number" ? body.step : undefined;
    if (process.env.NODE_ENV !== "production") {
      console.log("[analytics]", { event, step });
    }
  } catch {
    /* ignore malformed */
  }
  return new NextResponse(null, { status: 204, headers: cors });
}
