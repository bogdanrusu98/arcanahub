import { ImageResponse } from "next/og";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type VideoDoc = {
  title?: string;
  channelId?: string;
  thumbnailUrl?: string | null;
};
type ChannelDoc = {
  name?: string;
  handle?: string;
  avatarUrl?: string | null;
};

const BG_FALLBACK = "linear-gradient(135deg, #0b0b0f 0%, #1a0f1f 100%)";

async function getVideoAndChannel(id: string) {
  const vSnap = await adminDb.collection("videos").doc(id).get();
  if (!vSnap.exists) return null;

  const v = (vSnap.data() || {}) as VideoDoc;
  const chId = v.channelId ?? "";
  let ch: ChannelDoc | null = null;

  if (chId) {
    const chSnap = await adminDb.collection("channels").doc(chId).get();
    ch = chSnap.exists ? ((chSnap.data() || {}) as ChannelDoc) : null;
  }

  return { v, ch };
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getVideoAndChannel(id);

  const title =
    data?.v?.title?.trim() ||
    "Watch on ArcanaHub";
  const channelName = data?.ch?.name?.trim() || "ArcanaHub";
  const handle = data?.ch?.handle ? `@${data.ch.handle}` : "";
  const thumb = data?.v?.thumbnailUrl ?? null;
  const avatar = data?.ch?.avatarUrl ?? null;

  // Title size adapts to length
  const titleFontSize =
    title.length > 64 ? 48 : title.length > 48 ? 56 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          position: "relative",
          background: BG_FALLBACK,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        {/* Blurred background from thumbnail */}
        {thumb ? (
          <img
            src={thumb}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              filter: "blur(6px) brightness(0.55)",
            }}
          />
        ) : null}

        {/* Overlay gradient for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 60% at 20% 20%, rgba(168,85,247,0.25) 0%, rgba(0,0,0,0.0) 60%), linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35))",
          }}
        />

        {/* Foreground content */}
        <div
          style={{
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: 64,
            width: "100%",
            height: "100%",
            justifyContent: "center",
          }}
        >
          {/* Brand chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                background: "rgba(168,85,247,0.9)",
                boxShadow: "0 0 24px rgba(168,85,247,0.7)",
              }}
            />
            <div style={{ fontSize: 28, color: "#c4b5fd", letterSpacing: 0.5 }}>
              ArcanaHub
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#fff",
              textShadow: "0 4px 24px rgba(0,0,0,0.35)",
              maxWidth: 960,
            }}
          >
            {title}
          </div>

          {/* Channel row (avatar + name + handle) */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width={48}
                height={48}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  objectFit: "cover",
                  boxShadow: "0 0 16px rgba(167,139,250,0.5)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "#a78bfa",
                  boxShadow: "0 0 16px rgba(167,139,250,0.7)",
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 26, color: "#e5e7eb" }}>{channelName}</div>
              <div style={{ fontSize: 22, color: "#a1a1aa" }}>{handle}</div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 28,
              right: 36,
              color: "#a1a1aa",
              fontSize: 20,
            }}
          >
            arcanahub.com • video
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
