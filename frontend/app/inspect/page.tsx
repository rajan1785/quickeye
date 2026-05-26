"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { predictImage, type PredictResult } from "@/lib/api";

type HistoryEntry = {
  timestamp: string;
  previewUrl: string | null;
  result: PredictResult;
};

export default function InspectPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    clearPreview();
    setError(null);
    setResult(null);

    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selected);
    previewUrlRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
  }

  async function handleInspect() {
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await predictImage(file, "default", true);
      setResult(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Inspection failed");
    } finally {
      setLoading(false);
    }
  }

  function handleInspectAnother() {
    clearPreview();
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setLoading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function saveToHistory() {
    if (!result) {
      return;
    }

    const entry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      previewUrl,
      result,
    };

    const current = (() => {
      try {
        const raw = localStorage.getItem("quickeye:history");
        return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
      } catch {
        return [];
      }
    })();

    const next = [entry, ...current].slice(0, 50);
    localStorage.setItem("quickeye:history", JSON.stringify(next));
  }

  const verdictIsOk = result?.label === "ok";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-6">
        <div className="grid grid-cols-3 items-center">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-start text-2xl text-zinc-300">
            ←
          </Link>
          <h1 className="text-center text-2xl font-semibold tracking-tight">Inspect Unit</h1>
          <div />
        </div>

        <div className="mt-8">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            {previewUrl ? (
              <img src={previewUrl} alt="Selected capture preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 border-dashed border-zinc-700 text-zinc-400">
                <div className="text-5xl">📷</div>
                <div className="text-sm">Tap below to capture</div>
              </div>
            )}
          </div>
        </div>

        <label htmlFor="inspect-file" className="mt-4 block">
          <input
            ref={inputRef}
            id="inspect-file"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleFileChange}
          />
          <span className="block w-full cursor-pointer rounded-2xl border border-zinc-700 bg-zinc-900 py-4 text-center font-medium text-zinc-100 transition hover:bg-zinc-800">
            📷 Capture Image
          </span>
        </label>

        {file && !loading ? (
          <button
            type="button"
            onClick={handleInspect}
            className="mt-3 w-full rounded-2xl bg-emerald-500 py-4 font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            Inspect
          </button>
        ) : null}

        {loading ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-3 w-full rounded-2xl bg-emerald-500 py-4 font-semibold text-zinc-950 opacity-80"
          >
            Analyzing... (warm container &lt;1s)
          </button>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-base font-semibold text-red-200"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        {result ? (
          <section className="mt-5 space-y-4">
            <div
              role="status"
              aria-live="polite"
              aria-label={`Verdict ${result.label}`}
              className={`rounded-3xl border p-5 ${
                verdictIsOk
                  ? "border-emerald-500/40 bg-emerald-500/20"
                  : "border-red-500/40 bg-red-500/20"
              }`}
            >
              <div className={`text-3xl font-semibold ${verdictIsOk ? "text-emerald-300" : "text-red-300"}`}>
                {verdictIsOk ? "✓ OK" : "✗ DEFECT"}
              </div>
              <div className="mt-2 text-sm text-zinc-200">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <div>
                <div className="mb-1 text-sm text-zinc-400">OK similarity</div>
                <div className="h-3 rounded-full bg-zinc-800">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(0, Math.min(1, result.sim_ok)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm text-zinc-400">Defect similarity</div>
                <div className="h-3 rounded-full bg-zinc-800">
                  <div
                    className="h-3 rounded-full bg-red-500"
                    style={{ width: `${Math.max(0, Math.min(1, result.sim_defect)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {result.explanation && result.explanation.defect_detected ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="text-lg font-semibold">AI Inspector</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.explanation.defect_type ? (
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
                      {result.explanation.defect_type}
                    </span>
                  ) : null}
                  {result.explanation.location_hint ? (
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
                      {result.explanation.location_hint}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-300">{result.explanation.explanation}</p>
                <div className="mt-4 text-xs text-zinc-500">Powered by OpenAI GPT-5 Vision</div>
              </div>
            ) : null}

            <div className="grid gap-3">
              <button
                type="button"
                onClick={saveToHistory}
                className="rounded-2xl bg-emerald-500 py-4 font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                Save to History
              </button>
              <button
                type="button"
                onClick={handleInspectAnother}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 py-4 font-semibold text-zinc-100 transition hover:bg-zinc-800"
              >
                Inspect Another
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
