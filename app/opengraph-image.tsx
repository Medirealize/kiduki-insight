import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ほんね。— 言いたいのに、言えない。";
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
          background: "linear-gradient(135deg, #f4f9f6 0%, #fffaf9 45%, #fdf2f2 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 左側：コーラルグラデーションパネル */}
        <div style={{
          width: "46%",
          height: "100%",
          background: "linear-gradient(160deg, #f9928a 0%, #f88379 50%, #e87068 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -60, left: -60,
            width: 280, height: 280, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)", display: "flex",
          }} />
          <div style={{
            position: "absolute", bottom: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", display: "flex",
          }} />

          <div style={{
            fontSize: 110, fontWeight: 900, color: "white",
            letterSpacing: "0.06em", lineHeight: 1,
            display: "flex",
          }}>
            ほんね。
          </div>
          <div style={{
            marginTop: 12, fontSize: 20, color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.18em", display: "flex",
          }}>
            HONNE
          </div>
        </div>

        {/* 右側：コンテンツ */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 56px",
          gap: 0,
        }}>
          <div style={{
            fontSize: 42, fontWeight: 800, color: "#4a3e3e",
            lineHeight: 1.3, display: "flex", flexDirection: "column",
          }}>
            <span style={{ display: "flex" }}>言いたいのに、</span>
            <span style={{ display: "flex", color: "#f06292" }}>言えない。</span>
          </div>

          <div style={{
            marginTop: 24, fontSize: 22, color: "#8c8282",
            lineHeight: 1.6, display: "flex", flexDirection: "column",
          }}>
            <span style={{ display: "flex" }}>上司・先生・パートナー・家族…</span>
            <span style={{ display: "flex" }}>誰かへの本音を、言葉にする。</span>
          </div>

          <div style={{
            marginTop: 36, display: "flex", flexDirection: "column", gap: 12,
          }}>
            {[
              "① タイプを選ぶ",
              "② 気持ちを書く",
              "③ 本音が言葉になる",
            ].map((step) => (
              <div key={step} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <div style={{
                  fontSize: 18, color: "#4a3e3e",
                  display: "flex",
                }}>
                  {step}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 40, fontSize: 16,
            color: "#a89a9a",
            letterSpacing: "0.08em", display: "flex",
          }}>
            insight.medirealize.jp
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
