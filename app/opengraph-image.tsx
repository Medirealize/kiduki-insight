import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ほんね。— 気づいて！私のきもち";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1877F2 0%, #0d5cbf 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 背景装飾 */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          display: "flex",
        }} />

        {/* メインコンテンツ */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            fontSize: 96, fontWeight: 900, color: "white",
            letterSpacing: "0.08em", lineHeight: 1,
            textShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}>
            ほんね。
          </div>
          <div style={{
            fontSize: 28, color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.22em", fontWeight: 500,
          }}>
            気づいて！私のきもち
          </div>

          <div style={{
            marginTop: 24,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 40px",
            display: "flex",
          }}>
            <div style={{ fontSize: 22, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
              先生に伝えたい気持ちを、言葉にするお手伝い
            </div>
          </div>
        </div>

        {/* ドメイン */}
        <div style={{
          position: "absolute", bottom: 40,
          fontSize: 20, color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.1em",
          display: "flex",
        }}>
          insight.medirealize.jp
        </div>
      </div>
    ),
    { ...size }
  );
}
