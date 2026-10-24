import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";

export const alt = "Jagan Kumar Patra — Backend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const site = getSite();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: 80, background: "#F5F2EA", color: "#17212B", fontFamily: "sans-serif",
          border: "1px solid #D7D2C8",
        }}
      >
        <div style={{ fontSize: 24, color: "#12805C", marginBottom: 28 }}>BACKEND ENGINEER · NODE.JS · TYPESCRIPT · AWS</div>
        <div style={{ fontSize: 72, fontWeight: 650, letterSpacing: -2 }}>{site.name}</div>
        <div style={{ fontSize: 36, marginTop: 18, maxWidth: 940, lineHeight: 1.2 }}>{site.headline}</div>
        <div style={{ fontSize: 25, marginTop: 38, color: "#586574" }}>{site.impactLine}</div>
      </div>
    ),
    { ...size },
  );
}
