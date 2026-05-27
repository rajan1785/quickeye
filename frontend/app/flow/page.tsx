import Link from "next/link";
import type { ReactNode } from "react";

type Step = {
  number: string;
  title: string;
  body: string;
  actor: "Owner" | "Worker" | "AI" | "System";
  icon: ReactNode;
};

const setupSteps: Step[] = [
  {
    number: "01",
    title: "Install QuickEye",
    body: "Owner downloads the APK from the GitHub release or opens the web app in any Chrome browser. One device, one minute.",
    actor: "Owner",
    icon: <PhoneIcon />,
  },
  {
    number: "02",
    title: "Train the line",
    body: "Worker captures 20 OK units + 20 defective units of the same product. Native camera, multi-shot, no labelling.",
    actor: "Worker",
    icon: <CaptureIcon />,
  },
  {
    number: "03",
    title: "Model is ready",
    body: "DINOv2 embeds all 40 images. Centroid classifier saved to Modal volume. The phone is now a custom QA station for that product. ~30 seconds.",
    actor: "AI",
    icon: <BrainIcon />,
  },
];

const inspectionSteps: Step[] = [
  {
    number: "04",
    title: "Unit arrives",
    body: "Worker places the next unit under the phone. Auto Inspect mode detects the still frame and triggers automatically (no tap).",
    actor: "Worker",
    icon: <ConveyorIcon />,
  },
  {
    number: "05",
    title: "Burst capture",
    body: "Phone snaps 3 frames in 300ms. All three are sent to the Modal backend as one multipart request.",
    actor: "System",
    icon: <BurstIcon />,
  },
  {
    number: "06",
    title: "Three-layer verdict",
    body: "Backend embeds all 3 frames → centroid classifier votes → confidence threshold check → if defect, GPT-5 Vision sanity check. Returns OK, DEFECT, or UNCERTAIN.",
    actor: "AI",
    icon: <LayersIcon />,
  },
  {
    number: "07",
    title: "Worker sees result",
    body: "Verdict appears in under 2 seconds. Defects get an AI explanation: scratch on left edge, missing screw, color drift. Worker either continues or pulls the unit aside.",
    actor: "Worker",
    icon: <VerdictIcon />,
  },
  {
    number: "08",
    title: "Logged automatically",
    body: "Every inspection saved with photo + verdict + AI explanation + timestamp. Builds the dataset the owner pays for.",
    actor: "System",
    icon: <LogIcon />,
  },
];

const ownerSteps: Step[] = [
  {
    number: "09",
    title: "Live dashboard",
    body: "Owner opens the dashboard from office: units inspected today, defect rate %, top defect type, recent flagged units with thumbnails.",
    actor: "Owner",
    icon: <DashboardIcon />,
  },
  {
    number: "10",
    title: "End-of-day AI brief",
    body: "GPT-5 reads the day's inspections and writes a Hindi+English summary. \"234 units inspected today, 18 defective. 12 of 18 were 'scratch on left edge' — check tooling on Station 3.\"",
    actor: "AI",
    icon: <ReportIcon />,
  },
];

export default function FlowPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-card {
          animation: fadeUp 0.5s ease-out both;
        }
      `}</style>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-zinc-100">
          ← Back to app
        </Link>

        <header className="mt-6">
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">User Flow</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            How QuickEye works
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400">
            One-time setup, hands-free daily inspection, owner-grade analytics. Two human
            touches a day. Everything else is automatic.
          </p>
        </header>

        <Track label="Setup · One-time per product line" steps={setupSteps} accent="zinc" />
        <Track label="Daily Inspection · Repeats per unit" steps={inspectionSteps} accent="emerald" />
        <Track label="Owner Value · Continuous" steps={ownerSteps} accent="violet" />

        <section className="mt-16 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8">
          <div className="text-xs uppercase tracking-wider text-emerald-300">In one sentence</div>
          <p className="mt-3 text-lg leading-8 text-zinc-100">
            Worker places units. Phone reads them. Owner gets the patterns.
            Cognex without the Cognex price tag.
          </p>
        </section>

        <footer className="mt-16 border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          QuickEye · #AIBuildersHackathon · Built with OpenAI Codex
        </footer>
      </div>
    </main>
  );
}

function Track({
  label,
  steps,
  accent,
}: {
  label: string;
  steps: Step[];
  accent: "zinc" | "emerald" | "violet";
}) {
  const accentRing = {
    zinc: "ring-zinc-700/40",
    emerald: "ring-emerald-500/40",
    violet: "ring-violet-500/40",
  }[accent];

  const accentDot = {
    zinc: "bg-zinc-500",
    emerald: "bg-emerald-400",
    violet: "bg-violet-400",
  }[accent];

  const accentLine = {
    zinc: "from-zinc-800 via-zinc-800 to-transparent",
    emerald: "from-emerald-500/40 via-emerald-500/20 to-transparent",
    violet: "from-violet-500/40 via-violet-500/20 to-transparent",
  }[accent];

  return (
    <section className="mt-14">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${accentDot}`} />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
          {label}
        </h2>
      </div>

      <ol className="mt-6 relative">
        <div
          aria-hidden
          className={`absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b ${accentLine}`}
        />
        {steps.map((step, idx) => (
          <li
            key={step.number}
            className="step-card relative pl-16"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div
              className={`absolute left-0 top-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-200 ring-1 ${accentRing}`}
            >
              {step.icon}
            </div>
            <article className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/80">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-zinc-500">#{step.number}</span>
                  <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
                </div>
                <ActorChip actor={step.actor} />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{step.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ActorChip({ actor }: { actor: Step["actor"] }) {
  const styles: Record<Step["actor"], string> = {
    Owner: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    Worker: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    AI: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    System: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[actor]}`}
    >
      {actor}
    </span>
  );
}

/* --- icons (tiny inline SVGs, all 20x20) --- */

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}
function CaptureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M5 8h3l1.5-2h5L16 8h3v11H5z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}
function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.7V16a3 3 0 0 0 4 2.8" />
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.7V16a3 3 0 0 1-4 2.8" />
      <path d="M9 4v16M15 4v16" />
    </svg>
  );
}
function ConveyorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
      <rect x="9" y="5" width="6" height="4" rx="0.5" />
    </svg>
  );
}
function BurstIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="7" width="12" height="10" rx="1" opacity="0.4" />
      <rect x="6" y="6" width="12" height="10" rx="1" opacity="0.7" />
      <rect x="9" y="5" width="12" height="10" rx="1" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3 3 7l9 4 9-4z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 17l9 4 9-4" />
    </svg>
  );
}
function VerdictIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}
function LogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M16 4v3h3" />
      <path d="M9 13l2 2 4-5" />
    </svg>
  );
}
