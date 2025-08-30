import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Dynamic OG image for /watch/[id]
 * Next 15 App Router: params is a Promise, must be awaited.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #0b0b0f 0%, #1a0f1f 100%)",
          color: "#fff",
          fontSize: 42,
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
        <div style={{ fontSize: 24, color: "#c4b5fd", marginBottom: 16 }}>ArcanaHub</div>
        <div style={{ fontWeight: 800, lineHeight: 1.2 }}>Watch video</div>
        <div style={{ fontSize: 20, marginTop: 12, color: "#d4d4d8" }}>ID: {id.slice(0, 10)}…</div>
      </div>
    ),
    { ...size }
  );
}
