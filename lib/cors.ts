const ALLOWED_ORIGINS = new Set([
  "https://kiduki-insight-v2.vercel.app",
  "capacitor://localhost",
  "http://localhost:3000",
  "http://localhost",
]);

export function corsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin =
    requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)
      ? requestOrigin
      : "https://kiduki-insight-v2.vercel.app";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
