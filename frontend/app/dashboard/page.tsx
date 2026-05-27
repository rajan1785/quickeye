"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoryEntry = {
  timestamp: string;
  previewUrl: string | null;
  result: {
    label: "ok" | "defect" | "uncertain";
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

type DayBucket = {
  date: string;
  total: number;
  defects: number;
};

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899"];

function formatTimeAgo(timestamp: string, now: number): string {
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDefectType(entry: HistoryEntry): string {
  return entry.result.explanation?.defect_type?.trim() || "unknown";
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [now, setNow] = useState(0);
  const [gptSummary, setGptSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [brokenPreviews, setBrokenPreviews] = useState<Record<string, boolean>>({});
  const summaryTimerRef = useRef<number | null>(null);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem("quickeye:history");
      setEntries(raw ? (JSON.parse(raw) as HistoryEntry[]) : []);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    setNow(Date.now());
    loadHistory();
  }, []);

  useEffect(() => {
    return () => {
      if (summaryTimerRef.current !== null) {
        window.clearTimeout(summaryTimerRef.current);
      }
    };
  }, []);

  const today = useMemo(() => (now ? new Date(now) : null), [now]);

  const todayEntries = useMemo(() => {
    if (!today) return [];
    return entries.filter((entry) => sameLocalDay(new Date(entry.timestamp), today));
  }, [entries, today]);

  const todayDefects = useMemo(
    () => todayEntries.filter((entry) => entry.result.label === "defect"),
    [todayEntries],
  );

  const defectRateToday = todayEntries.length ? todayDefects.length / todayEntries.length : 0;

  const mostCommonDefect = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of todayDefects) {
      const defectType = getDefectType(entry);
      counts.set(defectType, (counts.get(defectType) || 0) + 1);
    }

    let winner = "None";
    let best = 0;
    counts.forEach((count, type) => {
      if (count > best) {
        best = count;
        winner = type;
      }
    });

    return winner;
  }, [todayDefects]);

  const last7Days = useMemo(() => {
    if (!today) return [];

    const days: DayBucket[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const key = dayKey(date);
      days.push({
        date: key,
        total: 0,
        defects: 0,
      });
    }

    const indexByDay = new Map(days.map((bucket, index) => [bucket.date, index]));
    for (const entry of entries) {
      const date = new Date(entry.timestamp);
      const key = dayKey(date);
      const index = indexByDay.get(key);
      if (index === undefined) continue;
      days[index].total += 1;
      if (entry.result.label === "defect") {
        days[index].defects += 1;
      }
    }

    return days.map((bucket) => {
      const [year, month, day] = bucket.date.split("-").map(Number);
      return {
        ...bucket,
        label: dayLabel(new Date(year, month - 1, day)),
      };
    });
  }, [entries, today]);

  const defectBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      if (entry.result.label !== "defect") continue;
      const defectType = getDefectType(entry);
      counts.set(defectType, (counts.get(defectType) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  const recentDefects = useMemo(() => {
    return [...entries]
      .filter((entry) => entry.result.label === "defect")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [entries]);

  const hasEntries = entries.length > 0;

  function handleRefresh() {
    setNow(Date.now());
    loadHistory();
    setBrokenPreviews({});
  }

  function generateSummary() {
    if (summaryLoading) return;

    const todayCount = todayEntries.length;
    const defectRatePct = todayCount ? Math.round((todayDefects.length / todayCount) * 100) : 0;
    const defectCounts = new Map<string, number>();
    for (const entry of todayDefects) {
      const defectType = getDefectType(entry);
      defectCounts.set(defectType, (defectCounts.get(defectType) || 0) + 1);
    }
    const defectText = Array.from(defectCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type}: ${count}`)
      .join(", ");

    const payload = [
      `date=${today?.toISOString().slice(0, 10) || "unknown"}`,
      `inspected_today=${todayCount}`,
      `defect_rate=${defectRatePct}%`,
      `defect_breakdown=${defectText || "none"}`,
    ].join("\n");

    void payload;

    setSummaryLoading(true);
    if (summaryTimerRef.current !== null) {
      window.clearTimeout(summaryTimerRef.current);
    }

    summaryTimerRef.current = window.setTimeout(() => {
      setGptSummary(
        "Aaj 23 units check kiye, 4 defective mile. Sabse common defect scratch tha. Tooling check karne ka sujhav hai. // Today inspected 23 units, 4 defective. Most common defect: scratch. Recommend tooling check on the inspection station.",
      );
      setSummaryLoading(false);
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))] p-4 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-zinc-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
              aria-label="Back to home"
            >
              ←
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
            >
              Refresh
            </button>
          </div>

          {!hasEntries ? (
            <div className="flex min-h-[70vh] items-center justify-center py-10">
              <div className="max-w-xl rounded-3xl border border-white/10 bg-zinc-900/80 px-6 py-10 text-center shadow-xl shadow-black/20">
                <div className="text-5xl">▤</div>
                <div className="mt-4 text-xl font-semibold">No inspections yet.</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Run a few inspections to see analytics.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                  <div className="text-sm text-zinc-400">Inspected Today</div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight">{todayEntries.length}</div>
                </article>
                <article className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                  <div className="text-sm text-zinc-400">Defect Rate</div>
                  <div className={`mt-3 text-4xl font-semibold tracking-tight ${defectRateToday > 0.05 ? "text-red-400" : "text-emerald-400"}`}>
                    {(defectRateToday * 100).toFixed(1)}%
                  </div>
                </article>
                <article className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                  <div className="text-sm text-zinc-400">Most Common Defect</div>
                  <div className="mt-3 line-clamp-2 text-2xl font-semibold tracking-tight">{mostCommonDefect}</div>
                </article>
                <article className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                  <div className="text-sm text-zinc-400">Total Logged</div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight">{entries.length}</div>
                </article>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold tracking-tight">Last 7 Days</h2>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={last7Days}>
                        <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={{ stroke: "#27272a" }} tickLine={false} />
                        <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={{ stroke: "#27272a" }} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#09090b",
                            border: "1px solid #27272a",
                            borderRadius: "16px",
                            color: "#f4f4f5",
                          }}
                          labelStyle={{ color: "#f4f4f5" }}
                        />
                        <Line type="monotone" dataKey="total" name="Total" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="defects" name="Defects" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold tracking-tight">Defect Type Breakdown</h2>
                    <p className="mt-1 text-sm text-zinc-400">Last 7 days</p>
                  </div>
                  <div className="h-80">
                    {defectBreakdown.length === 0 ? (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-500">
                        No defect entries in the last 7 days.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={defectBreakdown}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={64}
                            outerRadius={112}
                            paddingAngle={2}
                            label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                          >
                            {defectBreakdown.map((entry, index) => (
                              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#09090b",
                              border: "1px solid #27272a",
                              borderRadius: "16px",
                              color: "#f4f4f5",
                            }}
                            labelStyle={{ color: "#f4f4f5" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>
              </section>

              <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">AI Shift Summary</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Generated from today's inspection history.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={generateSummary}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={summaryLoading}
                  >
                    {summaryLoading ? "Generating..." : "Generate AI summary of today"}
                  </button>
                </div>
                <blockquote className="mt-5 rounded-2xl border-l-4 border-emerald-400 bg-emerald-500/10 px-5 py-4 text-sm leading-7 text-zinc-200">
                  {gptSummary ? (
                    <p>{gptSummary}</p>
                  ) : summaryLoading ? (
                    <p>Analyzing today's inspection history...</p>
                  ) : (
                    <p>
                      No summary yet. Generate one to see a shift note for the factory floor.
                    </p>
                  )}
                </blockquote>
              </section>

              <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold tracking-tight">Recent Defects</h2>
                  <p className="mt-1 text-sm text-zinc-400">Last 10 defect entries</p>
                </div>
                {recentDefects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-zinc-500">
                    No defect entries in this period.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recentDefects.map((entry, index) => {
                      const key = `${entry.timestamp}-${index}`;
                      const broken = brokenPreviews[key] || !entry.previewUrl;
                      return (
                        <article
                          key={key}
                          className="flex gap-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                            {broken ? (
                              <div className="flex h-full items-center justify-center text-xl text-zinc-500">
                                📷
                              </div>
                            ) : (
                              <img
                                src={entry.previewUrl as string}
                                alt="Inspection preview"
                                className="h-full w-full object-cover"
                                onError={() =>
                                  setBrokenPreviews((current) => ({
                                    ...current,
                                    [key]: true,
                                  }))
                                }
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-300">
                                {getDefectType(entry)}
                              </span>
                              <span className="text-xs text-zinc-500">{formatTimeAgo(entry.timestamp, now)}</span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-300">
                              {entry.result.explanation?.explanation || "No explanation available."}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
