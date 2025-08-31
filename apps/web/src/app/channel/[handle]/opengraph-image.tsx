import { ImageResponse } from "next/og";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type ChannelDoc = {
  name?: string;
  handle?: string;
  avatarUrl?: string | null;
  id?: string;
};

const BG_FALLBACK = "linear-gradient(135deg, #0b0b0f 0%, #1a0f1f 100%)";

async function getChannelByHandle(handle: string) {
  const snap = await adminDb
    .collection("channels")
    .where("handle", "==", handle)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  const ch = d.data() as ChannelDoc;
  ch.id = d.id;
  return ch;
}

async function getLatestVideoThumb(channelId: string) {
  const snap = await adminDb
    .collection("videos")
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const v = snap.docs[0].data();
  return (v.thumbnailUrl as string | null) ?? null;
}

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const ch = await getChannelByHandle(handle);
  const name = ch?.name?.trim() || "ArcanaHub Channel";
  const at = ch?.handle ? `@${ch.handle}` : "";
  const avatar = ch?.avatarUrl ?? null;
  const hero = ch?.id ? await getLatestVideoThumb(ch.id) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          position: "relative",
          display: "flex",
          background: BG_FALLBACK,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        {/* Background from latest video thumbnail (blurred) */}
        {hero ? (
          <img
            src={hero}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              filter: "blur(6px) brightness(0.5)",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(50% 50% at 15% 20%, rgba(168,85,247,0.25) 0%, rgba(0,0,0,0.0) 60%), linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35))",
          }}
        />

        <div
          style={{
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: 72,
            width: "100%",
            height: "100%",
            justifyContent: "center",
          }}
        >
          {/* Brand */}
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

          {/* Channel header */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width={84}
                height={84}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 999,
                  objectFit: "cover",
                  boxShadow: "0 0 18px rgba(167,139,250,0.6)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 999,
                  background: "#a78bfa",
                  boxShadow: "0 0 18px rgba(167,139,250,0.6)",
                }}
              />
            )}

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.05,
                  textShadow: "0 4px 24px rgba(0,0,0,0.35)",
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: 28, color: "#a1a1aa" }}>{at}</div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 28,
              right: 36,
              color: "#a1a1aa",
              fontSize: 20,
            }}
          >
            arcanahub.com • channel
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
