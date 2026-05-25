"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type CardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  accent?: "default" | "primary" | "muted";
};

const accentClasses: Record<NonNullable<CardProps["accent"]>, string> = {
  default: "border-zinc-800 bg-zinc-900 hover:bg-zinc-800",
  primary: "border-emerald-500/40 bg-zinc-900 hover:bg-zinc-800",
  muted: "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800",
};

export function Card({ href, icon, title, subtitle, accent = "default" }: CardProps) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-6 transition ${accentClasses[accent]}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold text-zinc-100">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-zinc-400">{subtitle}</div> : null}
        </div>
      </div>
    </Link>
  );
}
