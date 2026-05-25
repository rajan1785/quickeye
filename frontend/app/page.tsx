import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 px-6 py-12">
        <h1 className="text-5xl font-semibold tracking-tight">QuickEye</h1>
        <div className="flex gap-3">
          <Link
            href="/train"
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium"
          >
            Train
          </Link>
          <Link
            href="/inspect"
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium"
          >
            Inspect
          </Link>
        </div>
      </div>
    </main>
  );
}
