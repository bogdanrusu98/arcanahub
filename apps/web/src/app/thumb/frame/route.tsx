import { ImageResponse } from "next/og";
export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Video";
  const playbackId = searchParams.get("playbackId") || "";
  const t = Number(searchParams.get("t") || "5");

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex", // ✅ OBLIGATORIU pentru div-ul root
            position: "relative",
            background: "linear-gradient(135deg, #0b0b0f 0%, #1a0f1f 100%)",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Container principal cu flexbox explicit */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {/* Background video frame - doar dacă playbackId există */}
            {playbackId && (
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  display: "flex",
                  backgroundImage: `url(https://livepeercdn.com/thumbnail/${encodeURIComponent(playbackId)}.jpg?time=${t})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.3,
                }}
              />
            )}

            {/* Overlay gradient */}
            <div
              style={{
                position: "absolute",
                inset: "0",
                display: "flex",
                background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)",
              }}
            />

            {/* Content container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                padding: "40px",
                textAlign: "center",
              }}
            >
              {/* Play button icon */}
              <div
                style={{
                  display: "flex",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  color: "#1e293b",
                  marginBottom: "24px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                ▶
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "800",
                  lineHeight: "1.1",
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  maxWidth: "800px",
                  textAlign: "center",
                  marginBottom: "16px",
                }}
              >
                {title}
              </div>

              {/* ArcanaHub branding - exact ca în UI */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0", // fără gap ca să fie lipite
                  fontSize: "43px",
                  fontWeight: "600",
                  opacity: 0.95,
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                <span style={{ color: "#a855f7" }}>Arcana</span>
                <span style={{ color: "white" }}>Hub</span>
              </div>
            </div>

            {/* Bottom info bar cu logo ArcanaHub */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 40px",
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0",
                  fontSize: "22px",
                  fontWeight: "700",
                }}
              >
                <span style={{ color: "#a855f7" }}>Arcana</span>
                <span style={{ color: "white" }}>Hub</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  opacity: 0.8,
                  color: "white",
                }}
              >
                {Math.floor(t / 60)}:{(t % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("OG thumbnail generation error:", error);
    
    // Fallback ultra-simplu
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex", // ✅ OBLIGATORIU
            alignItems: "center",
            justifyContent: "center",
            background: "#1e293b",
            color: "#fff",
            fontSize: "48px",
            fontWeight: "700",
          }}
        >
          <div style={{ display: "flex", textAlign: "center" }}>
            {title || "ArcanaHub Video"}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}