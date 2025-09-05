"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuthUser } from "../app/hooks/useAuthUser";

export type ChannelItem = {
  id: string;
  handle: string;
  name: string;
  avatar?: string | null;
  category?: string | null;
  live?: boolean;
  viewers?: number;
};

type Props = {
  recommended?: ChannelItem[];
  children: React.ReactNode;
};

export default function AppShell({ recommended = [], children }: Props) {
  const [open, setOpen] = useState(false);

  // user din Firebase
  const { user, loading } = useAuthUser();
  const avatarUrl =
    user?.photoURL ||
    (user ? `https://i.pravatar.cc/64?u=${encodeURIComponent(user.uid)}` : null);

  // închide drawer-ul la resize pe desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header peste tot (z mai mare ca sidebar) */}
      <header className="sticky top-0 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          {/* Hamburger MEREU vizibil (fără lg:hidden) */}
          <button
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-800"
          >
            <Menu size={18} />
          </button>

          {/* Search pe centru */}
          <form action="/search" className="mx-auto hidden sm:flex flex-1 max-w-xl">
            <input
              name="q"
              placeholder="Search creators or videos"
              className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </form>

          {/* Dreapta: Watch + Auth */}
          <nav className="ml-auto flex items-center  gap-3 text-sm">
            {/* <Link href="/watch" className="text-neutral-200 hover:text-white">
              Watch
            </Link> */}

            {!loading && (
              !user ? (
                <>
                  <Link
                    href="/signup"
                    className="rounded-md bg-purple-500/20 border border-purple-500/40 px-3 py-1.5 font-medium text-purple-200 hover:bg-purple-500/30"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-1.5 font-medium text-neutral-100 hover:bg-neutral-700"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                <Link
                  href="/account"
                  className="flex float-right items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-800"
                  title={user.displayName || user.email || "Account"}
                >
                  <img
                    src={avatarUrl ?? "/avatars/default.png"}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden sm:inline text-sm text-neutral-200 max-w-[10rem] truncate">
                    {user.displayName || user.email || "Account"}
                  </span>
                </Link>
                

                </>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Sidebar – z mai mic ca header, persistent pe lg */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-neutral-800 bg-neutral-900/90 backdrop-blur",
          "hidden lg:block",
        ].join(" ")}
      >
        <SidebarList recommended={recommended} />
      </aside>

      {/* Overlay + Drawer pe mobile */}
      <div
        className={[
          "fixed inset-0 z-50 bg-black/50 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
          "lg:hidden",
        ].join(" ")}
        onClick={() => setOpen(false)}
      />
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-800 bg-neutral-900/95 backdrop-blur transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:hidden",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-800">
          <button
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800"
          >
            <X size={16} />
          </button>
        </div>
        <SidebarList recommended={recommended} onNavigate={() => setOpen(false)} />
      </aside>

      {/* Conținut – împins la dreapta pe desktop */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-neutral-800 bg-neutral-900">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-400">
            © {new Date().getFullYear()} ArcanaHub. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarList({
  recommended = [],
  onNavigate,
}: {
  recommended?: ChannelItem[];
  onNavigate?: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-3xl p-4 font-semibold tracking-tight">
          <span className="text-purple-400">Arcana</span>Hub
        </Link>
      </div>

      <div className="px-4 py-3 text-xs uppercase tracking-wide text-neutral-400">
        Live & Creators
      </div>

      <ul className="px-2 space-y-1">
        {recommended.map((c) => {
          const href = `/channel/${encodeURIComponent(c.handle || c.id)}`;
          return (
            <li key={c.id}>
              <Link
                href={href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-neutral-800"
              >
                <div className="relative">
                  <img
                    src={c.avatar || "/avatars/default.png"}
                    alt={c.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  {c.live ? (
                    <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-neutral-900" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-neutral-400">
                    {c.live ? `${c.viewers ?? 0} watching` : c.category ?? "Creator"}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide text-neutral-400">Explore</div>
      <ul className="px-2 space-y-1 pb-8">
        <li>
          <Link href="/watch" onClick={onNavigate} className="block rounded-md px-2 py-2 hover:bg-neutral-800">
            All Videos
          </Link>
        </li>
        <li>
          <Link href="/live" onClick={onNavigate} className="block rounded-md px-2 py-2 hover:bg-neutral-800">
            Live Now
          </Link>
        </li>
      </ul>
    </div>
  );
}
