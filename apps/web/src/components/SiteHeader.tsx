// apps/web/src/components/SiteHeader.tsx
"use client";
import { useState } from "react";

export type RecommendedItem = {
  id: string;
  handle: string;
  name: string;
  avatar?: string | null;
  category?: string | null;
  live?: boolean;
  viewers?: number;
};

type Props = {
  recommended?: RecommendedItem[];
};

export default function SiteHeader({ recommended = [] }: Props) {
  const [open, setOpen] = useState(false);
  // … buton hamburger care deschide sidebarul
  // pasează recommended către Sidebar (dacă îl ai ca component separat)
  return null; // aici folosești implementarea ta existentă
}
