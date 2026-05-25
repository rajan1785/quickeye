"use client";

export default function InspectPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Inspect Unit</h1>

        <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900 text-sm text-zinc-500">
          Camera coming Tuesday
        </div>

        <button
          type="button"
          disabled
          className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-800 px-5 py-4 text-sm font-medium text-zinc-400"
        >
          Snap &amp; Inspect
        </button>
        {/* TODO: camera + predict integration. */}
      </div>
    </main>
  );
}
