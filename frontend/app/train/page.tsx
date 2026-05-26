"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { trainModel } from "@/lib/api";

type TrainResult = {
  ok_count: number;
  defect_count: number;
};

function addFiles(existing: File[], incoming: FileList | null): File[] {
  if (!incoming) {
    return existing;
  }

  return [...existing, ...Array.from(incoming)];
}

function createPreviews(files: File[]): string[] {
  return files.slice(0, 8).map((file) => URL.createObjectURL(file));
}

export default function TrainPage() {
  const router = useRouter();
  const [okFiles, setOkFiles] = useState<File[]>([]);
  const [defectFiles, setDefectFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [okPreviews, setOkPreviews] = useState<string[]>([]);
  const [defectPreviews, setDefectPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = createPreviews(okFiles);
    setOkPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [okFiles]);

  useEffect(() => {
    const urls = createPreviews(defectFiles);
    setDefectPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [defectFiles]);

  async function handleTrain() {
    setLoading(true);
    setError(null);

    try {
      const response = await trainModel(okFiles, defectFiles, "default");
      localStorage.setItem("quickeye:active_model", response.model_id);
      setResult({
        ok_count: response.ok_count,
        defect_count: response.defect_count,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Training failed");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setOkFiles([]);
    setDefectFiles([]);
    setLoading(false);
    setError(null);
    setResult(null);
  }

  const canTrain = okFiles.length >= 5 && defectFiles.length >= 5 && !loading;
  const helperReady = okFiles.length >= 5 && defectFiles.length >= 5;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-6">
        <div className="grid grid-cols-3 items-center">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-start text-2xl text-zinc-300">
            ←
          </Link>
          <h1 className="text-center text-2xl font-semibold tracking-tight">Train Model</h1>
          <div />
        </div>

        {result ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl text-emerald-400">✓</div>
              <div>
                <div className="text-lg font-semibold text-zinc-50">
                  Trained! {result.ok_count} OK + {result.defect_count} defect images learned.
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/inspect")}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400"
                  >
                    Inspect Now
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-zinc-100 transition hover:bg-zinc-800"
                  >
                    Train Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-emerald-500/30 bg-zinc-900 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-200">OK Samples ({okFiles.length}/20)</div>
                  <button
                    type="button"
                    onClick={() => setOkFiles([])}
                    className="text-sm text-zinc-400 transition hover:text-zinc-200"
                  >
                    Clear
                  </button>
                </div>

                <label htmlFor="ok-files" className="block cursor-pointer">
                  <input
                    id="ok-files"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="sr-only"
                    onChange={(event) => setOkFiles((current) => addFiles(current, event.target.files))}
                  />
                  <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/30 bg-zinc-950 text-center text-zinc-300 transition hover:bg-zinc-900">
                    <div>
                      <div className="text-2xl">📷</div>
                      <div className="mt-2 text-sm">Tap to add photos</div>
                    </div>
                  </div>
                </label>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {okPreviews.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`OK preview ${index + 1}`}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-red-500/30 bg-zinc-900 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-200">Defect Samples ({defectFiles.length}/20)</div>
                  <button
                    type="button"
                    onClick={() => setDefectFiles([])}
                    className="text-sm text-zinc-400 transition hover:text-zinc-200"
                  >
                    Clear
                  </button>
                </div>

                <label htmlFor="defect-files" className="block cursor-pointer">
                  <input
                    id="defect-files"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="sr-only"
                    onChange={(event) => setDefectFiles((current) => addFiles(current, event.target.files))}
                  />
                  <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-red-500/30 bg-zinc-950 text-center text-zinc-300 transition hover:bg-zinc-900">
                    <div>
                      <div className="text-2xl">📷</div>
                      <div className="mt-2 text-sm">Tap to add photos</div>
                    </div>
                  </div>
                </label>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {defectPreviews.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`Defect preview ${index + 1}`}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 mt-auto bg-zinc-950/95 py-4 backdrop-blur">
              {error ? (
                <div className="mb-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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

              <button
                type="button"
                onClick={handleTrain}
                disabled={!canTrain}
                aria-disabled={!canTrain}
                className="w-full rounded-2xl bg-emerald-500 py-4 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {loading ? "Training... (this takes ~30s)" : "Train Model"}
              </button>

              <div className={`mt-2 text-center text-xs ${helperReady ? "text-zinc-400" : "text-red-400"}`}>
                Need at least 5 OK + 5 defect images
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
