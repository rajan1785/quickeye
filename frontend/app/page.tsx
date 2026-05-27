"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { API_URL, healthCheck } from "@/lib/api";

export default function HomePage() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    healthCheck()
      .then(() => {
        if (mounted) setHealthy(true);
      })
      .catch(() => {
        if (mounted) setHealthy(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const abbreviatedApi = useMemo(() => {
    const value = API_URL.replace(/^https?:\/\//, "");
    return value.length > 36 ? `${value.slice(0, 33)}...` : value;
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-10">
        <div className="mb-10 space-y-4 text-center">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">QuickEye</h1>
          <p className="text-base text-zinc-400 sm:text-lg">
            Few-shot visual QA. Train your phone in 5 minutes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Card
            href="/train"
            icon="⚙"
            title="Train Model"
            subtitle="Capture examples and build a defect classifier."
          />
          <Card
            href="/inspect"
            icon="■"
            title="Inspect Unit"
            subtitle="Manual: snap one photo, get a verdict."
          />
          <Card
            href="/auto-inspect"
            icon="◉"
            title="Auto Inspect"
            subtitle="Hands-free: phone on a tripod, motion-triggered burst."
            accent="primary"
          />
          <Card
            href="/history"
            icon="⌁"
            title="History"
            subtitle="Review recent inspections and outcomes."
            accent="muted"
          />
          <Card
            href="/dashboard"
            icon="▤"
            title="Dashboard"
            subtitle="KPIs, defect trends, AI shift summary."
          />
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <span className={`h-2.5 w-2.5 rounded-full ${healthy === true ? "bg-emerald-400" : healthy === false ? "bg-red-400" : "bg-zinc-600"}`} />
          <span>{abbreviatedApi}</span>
        </div>
      </div>
    </main>
  );
}
