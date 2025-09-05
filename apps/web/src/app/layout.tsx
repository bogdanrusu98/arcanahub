import type { Metadata } from "next";
import "./globals.css";
import { getRecommendedChannels } from "@/lib/server/getChannels";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "ArcanaHub",
  description: "Live & VOD platform for tarot creators",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const recommended = await getRecommendedChannels(20);

  return (
    <html lang="en">
      <body>
        <AppShell recommended={recommended}>{children}</AppShell>
      </body>
    </html>
  );
}
