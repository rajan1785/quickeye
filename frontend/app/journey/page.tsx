import Link from "next/link";

type Session = {
  number: string;
  title: string;
  body: string;
  meta?: string;
};

type Day = {
  label: string;
  date: string;
  summary: string;
  sessions: Session[];
};

const journey: Day[] = [
  {
    label: "Day 1",
    date: "Mon, May 26, 2026",
    summary:
      "Stood up the full AI backend. DINOv2 embeddings, centroid classifier, GPT-5.4-mini vision agent, FastAPI integration, Modal deployment, end-to-end pipeline verified.",
    sessions: [
      {
        number: "01",
        title: "Repo scaffold",
        body:
          "Monorepo structure for backend (FastAPI + Modal) + frontend (Next.js + Capacitor). Codex created all empty files, requirements pin, .codexignore, README, LICENSE, GitHub Actions slot.",
        meta: "Codex · gpt-5.4-mini · ~3k tokens",
      },
      {
        number: "02",
        title: "DINOv3 → DINOv2 embeddings",
        body:
          "HuggingFace transformers singleton, lazy-load, L2-normalized CLS token output. DINOv3 turned out to be a gated repo — swapped to DINOv2-base (same 768-dim output, fully open). Tests use mocked model so no 400MB download in CI.",
        meta: "Codex · gpt-5.5 medium · ~3k tokens",
      },
      {
        number: "03",
        title: "Centroid classifier",
        body:
          "Few-shot classifier with temperature-scaled softmax, npz save/load (no pickle), full pytest coverage including a save/load round-trip test. Defensive re-normalization in predict was an unprompted touch from Codex.",
        meta: "Codex · gpt-5.5 medium · ~3k tokens",
      },
      {
        number: "04",
        title: "GPT-5.4-mini vision agent",
        body:
          "Pydantic structured-output wrapper around chat.completions.parse (the SDK's typed helper around response_format). Defensive fallback returns 'AI inspector unavailable' on any API error so the demo never crashes.",
        meta: "Codex · gpt-5.4-mini · ~3k tokens",
      },
      {
        number: "05",
        title: "FastAPI integration layer",
        body:
          "/health, /train, /predict, /explain. CORS open, on-disk model persistence with in-memory cache, confidence-gated vision agent calls (only invoked for low-confidence or defect verdicts to keep API spend low).",
        meta: "Codex · gpt-5.4-mini · ~4k tokens",
      },
      {
        number: "06",
        title: "Modal deployment",
        body:
          "Wraps the FastAPI app as a Modal ASGI app. CPU container, persistent volume for trained classifiers, OPENAI_API_KEY injected via Modal Secret. Codex used current Modal API (add_local_python_source, min_containers, scaledown_window) — none of the deprecated Mount/Stub patterns.",
        meta: "Codex · gpt-5.4-mini · ~3k tokens",
      },
      {
        number: "07",
        title: "Backend live + smoke test passing",
        body:
          "Deployed to Modal cloud. /health returns 200. Image built in 81s. End-to-end smoke test: 10 synthetic images → /train returns 200, /predict returns 200 with classifier output + GPT-5 explanation. 600ms warm latency on CPU container.",
      },
      {
        number: "08",
        title: "Frontend foundation",
        body:
          "Next.js 14 PWA: typed API client (trainModel, predictImage, explainImage, healthCheck), landing page with live health-check dot, dark theme, reusable Card component with accent variants, route skeletons for Train/Inspect/History.",
        meta: "Codex · gpt-5.4-mini · ~5k tokens",
      },
    ],
  },
  {
    label: "Day 2",
    date: "Tue, May 27, 2026",
    summary:
      "Shipped a fully mobile-installable product. Train + Inspect + History screens, burst-voting backend, Vercel deploy, Capacitor APK pipeline via GitHub Actions.",
    sessions: [
      {
        number: "09",
        title: "Train screen",
        body:
          "Native camera capture via input[capture=environment], multi-file selection, live count badges (OK X/20, defect Y/20), horizontal thumbnail strip with revokeObjectURL cleanup, sticky bottom Train button, error banner with dismiss, success state with 'Inspect Now' CTA.",
        meta: "Codex · gpt-5.4-mini",
      },
      {
        number: "10",
        title: "Inspect screen",
        body:
          "Capture → big verdict badge (✓ OK in emerald / ✗ DEFECT in red) with role=status aria-live → confidence percentage → OK vs defect similarity bars → AI Inspector card with defect_type/location chips and the GPT-5 explanation. Save-to-history with localStorage cap at 50.",
        meta: "Codex · gpt-5.4-mini",
      },
      {
        number: "11",
        title: "History screen",
        body:
          "Responsive grid of past inspections (1/2/3 columns), formatTimeAgo helper, per-card broken-image fallback (object URLs don't survive page reloads), Clear All with confirm dialog, empty state with CTA back to inspect.",
        meta: "Codex · gpt-5.4-mini",
      },
      {
        number: "12",
        title: "/predict-burst with three-layer defense",
        body:
          "New endpoint accepts 2–8 frames of the same unit. Embeds all, classifies all, then applies: (1) agreement check — needs ≥60% of frames voting the same label; (2) confidence threshold — average confidence must clear 0.75; (3) GPT-5 sanity check — if classifier votes defect, GPT-5 must agree, else downgrade to 'uncertain'. Solves single-shot false positives.",
        meta: "Hand-written (Claude) · backend extension",
      },
      {
        number: "13",
        title: "Vercel production deploy",
        body:
          "Static export build via Capacitor-compatible next.config (output: 'export', images.unoptimized, trailingSlash). NEXT_PUBLIC_API_URL wired to the deployed Modal URL. Live, mobile-responsive, camera works natively on Chrome Android.",
      },
      {
        number: "14",
        title: "Modal persistent deploy",
        body:
          "Moved from ephemeral 'modal serve' to permanent 'modal deploy'. Backend now stays up independent of any local terminal session. Same URL serves Vercel, the APK, and any curl test from anywhere.",
      },
      {
        number: "15",
        title: "Capacitor + GitHub Actions APK pipeline",
        body:
          "PWA manifest with SVG icon, Capacitor config, Next.js static export. GitHub Actions workflow: Node 20 + Java 21 + Android SDK → npm ci → next build → cap sync → gradle assembleDebug → upload signed-debug APK as artifact. Every push to main produces an installable .apk in ~7 minutes. First build green ✓ on first try.",
        meta: "Codex · gpt-5.4-mini",
      },
    ],
  },
];

const links = [
  { label: "Live web app", href: "https://quickeye-fcwee7cp0-risabh6971-gmailcoms-projects.vercel.app" },
  { label: "GitHub repo", href: "https://github.com/rajan1785/quickeye" },
  { label: "Backend /health", href: "https://rajankushwaha178534--quickeye-fastapi-app.modal.run/health" },
  { label: "APK builds", href: "https://github.com/rajan1785/quickeye/actions" },
];

export default function JourneyPage() {
  const totalSessions = journey.reduce((sum, day) => sum + day.sessions.length, 0);
  const days = journey.length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to app
        </Link>

        <header className="mt-6">
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">Build Journey</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">QuickEye</h1>
          <p className="mt-3 text-base text-zinc-400">
            Few-shot visual QA for India&apos;s 6.3 crore MSMEs. Phone-camera defect detector trained in 5 minutes,
            verdict in under 2 seconds. Built during the OpenAI x Outskill AI Builders Hackathon, May 26–31, 2026.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Days" value={String(days)} />
          <Stat label="Sessions" value={String(totalSessions)} />
          <Stat label="Stack" value="Codex + Claude" />
          <Stat label="Status" value="Live" accent />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
            >
              {link.label} ↗
            </a>
          ))}
        </div>

        <div className="mt-12 space-y-12">
          {journey.map((day) => (
            <section key={day.label}>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold text-zinc-50">{day.label}</div>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">{day.date}</div>
                </div>
                <div className="text-xs text-zinc-500">
                  {day.sessions.length} sessions
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">{day.summary}</p>

              <ol className="mt-6 space-y-4 border-l border-zinc-800 pl-6">
                {day.sessions.map((session) => (
                  <li key={session.number} className="relative">
                    <div className="absolute -left-[31px] mt-1.5 h-2.5 w-2.5 rounded-full border border-zinc-700 bg-zinc-900" />
                    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                      <div className="flex items-baseline gap-3">
                        <span className="text-xs font-mono text-zinc-500">#{session.number}</span>
                        <h3 className="text-base font-semibold text-zinc-100">{session.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-300">{session.body}</p>
                      {session.meta ? (
                        <div className="mt-3 text-[11px] uppercase tracking-wide text-zinc-500">{session.meta}</div>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          <div>Updated daily — refresh for the latest sessions.</div>
          <div className="mt-1">
            QuickEye · #AIBuildersHackathon · Built with OpenAI Codex + Claude
          </div>
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${accent ? "text-emerald-300" : "text-zinc-100"}`}>{value}</div>
    </div>
  );
}
