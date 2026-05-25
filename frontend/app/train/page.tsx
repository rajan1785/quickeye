"use client";

export default function TrainPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Train Model</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 text-sm text-zinc-400">OK Samples (0/20)</div>
            <div className="flex min-h-56 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 text-sm text-zinc-500">
              Upload zone
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 text-sm text-zinc-400">Defect Samples (0/20)</div>
            <div className="flex min-h-56 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 text-sm text-zinc-500">
              Upload zone
            </div>
          </section>
        </div>

        <button
          type="button"
          disabled
          className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-800 px-5 py-4 text-sm font-medium text-zinc-400"
        >
          Train
        </button>
        {/* TODO: camera capture + upload logic Tuesday. */}
      </div>
    </main>
  );
}
