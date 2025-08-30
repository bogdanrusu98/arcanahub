import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";

export const metadata: Metadata = {
  title: "ArcanaHub",
  description: "Live & VOD platform for tarot creators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              <span className="text-purple-400">Arcana</span>Hub
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/watch" className="text-neutral-200 hover:text-white">Watch</Link>
              <Link href="/live/demo" className="text-neutral-200 hover:text-white">Live</Link>
              <AuthStatus />
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-12 border-t border-neutral-800 bg-neutral-900">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-400">
            © {new Date().getFullYear()} ArcanaHub. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
