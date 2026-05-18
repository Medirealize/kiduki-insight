import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1877F2 0%, #0d5cbf 100%)",
          borderRadius: 8,
          fontFamily: "sans-serif",
          fontSize: 18,
          fontWeight: 900,
          color: "white",
          letterSpacing: "-0.02em",
        }}
      >
        ほ
      </div>
    ),
    { ...size }
  );
}
