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
          background: "#0f172a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 左側：青グラデーションパネル */}
        <div style={{
          width: "46%",
          height: "100%",
          background: "linear-gradient(160deg, #1877F2 0%, #0d47c2 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          {/* 装飾円 */}
          <div style={{
            position: "absolute", top: -60, left: -60,
            width: 280, height: 280, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", display: "flex",
          }} />
          <div style={{
            position: "absolute", bottom: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", display: "flex",
          }} />

          {/* ロゴ */}
          <div style={{
            fontSize: 110, fontWeight: 900, color: "white",
            letterSpacing: "0.06em", lineHeight: 1,
            display: "flex",
          }}>
            ほんね。
          </div>
          <div style={{
            marginTop: 12, fontSize: 20, color: "rgba(255,255,255,0.65)",
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
          {/* キャッチコピー */}
          <div style={{
            fontSize: 42, fontWeight: 800, color: "white",
            lineHeight: 1.3, display: "flex", flexDirection: "column",
          }}>
            <span style={{ display: "flex" }}>言いたいのに、</span>
            <span style={{ display: "flex" }}>言えない。</span>
          </div>

          {/* サブコピー */}
          <div style={{
            marginTop: 24, fontSize: 22, color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6, display: "flex", flexDirection: "column",
          }}>
            <span style={{ display: "flex" }}>上司・先生・パートナー・家族…</span>
            <span style={{ display: "flex" }}>誰かへの本音を、言葉にする。</span>
          </div>

          {/* 3ステップ */}
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
                  fontSize: 18, color: "rgba(255,255,255,0.85)",
                  display: "flex",
                }}>
                  {step}
                </div>
              </div>
            ))}
          </div>

          {/* ドメイン */}
          <div style={{
            marginTop: 40, fontSize: 16,
            color: "rgba(255,255,255,0.3)",
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
