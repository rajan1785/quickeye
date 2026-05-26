"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HistoryEntry = {
  timestamp: string;
  previewUrl: string | null;
  result: {
    label: "ok" | "defect";
    confidence: number;
    sim_ok: number;
    sim_defect: number;
    explanation: null | {
      defect_detected: boolean;
      defect_type: string | null;
      location_hint: string | null;
      explanation: string;
    };
    model_id: string;
  };
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("quickeye:history");
      setEntries(raw ? (JSON.parse(raw) as HistoryEntry[]) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  function clearAll() {
    if (!window.confirm("Clear all history?")) {
      return;
    }
    localStorage.removeItem("quickeye:history");
    setEntries([]);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <div className="grid grid-cols-3 items-center">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-start text-2xl text-zinc-300">
            ←
          </Link>
          <h1 className="text-center text-2xl font-semibold tracking-tight">History</h1>
          <div className="flex justify-end">
            {entries.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                Clear All
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <div className="text-4xl">📋</div>
            <div className="mt-4 text-lg font-semibold">No inspections yet.</div>
            <Link
              href="/inspect"
              className="mt-5 inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Start Inspecting
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, index) => {
              const verdictIsOk = entry.result.label === "ok";
              const broken = brokenImages[index] || !entry.previewUrl;

              return (
                <article key={`${entry.timestamp}-${index}`} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                    {broken ? (
                      <div className="flex h-full items-center justify-center text-zinc-500">
                        <div className="text-center">
                          <div className="text-3xl">📷</div>
                          <div className="mt-2 text-sm">Preview unavailable</div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={entry.previewUrl as string}
                        alt="Inspection preview"
                        className="h-full w-full object-cover"
                        onError={() => setBrokenImages((current) => ({ ...current, [index]: true }))}
                      />
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        verdictIsOk
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                          : "border-red-500/40 bg-red-500/20 text-red-300"
                      }`}
                    >
                      {verdictIsOk ? "✓ OK" : "✗ DEFECT"}
                    </span>
                    <span className="text-sm text-zinc-400">{formatTimeAgo(entry.timestamp)}</span>
                  </div>

                  <div className="mt-3 text-sm text-zinc-300">{(entry.result.confidence * 100).toFixed(1)}%</div>

                  {entry.result.explanation?.explanation ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                      {entry.result.explanation.explanation}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
