import Link from "next/link";

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to app
        </Link>

        <header className="mt-6">
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            Pitch · OpenAI x Outskill AI Builders Hackathon · May 2026
          </div>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight sm:text-6xl">
            QuickEye
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Few-shot visual QA for India&apos;s 6.3 crore MSME factories. Phone-camera
            defect detector, trained in 5 minutes, verdict in under 2 seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="https://quickeye-fcwee7cp0-risabh6971-gmailcoms-projects.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Try the live app ↗
            </a>
            <a
              href="https://github.com/rajan1785/quickeye"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-600"
            >
              GitHub ↗
            </a>
            <a
              href="https://github.com/rajan1785/quickeye/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-600"
            >
              Download APK ↗
            </a>
          </div>
        </header>

        <Slide number="01" title="Problem">
          <p className="text-lg leading-8 text-zinc-300">
            India has <span className="font-semibold text-zinc-100">6.3 crore MSMEs</span>.
            The vast majority do quality control by human eye because industrial vision systems
            (Cognex, Keyence, Basler) cost ₹15&ndash;40 lakh per station and require an ML engineer to set up.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Defect leakage" value="5–15%" sub="from human-only inspection at end-of-shift fatigue" />
            <Stat label="Cost per Cognex station" value="₹15–40L" sub="plus integrator + maintenance" />
            <Stat label="MSMEs running zero automated QA" value=">99%" sub="across fabrication, plastics, packaging, printing" />
          </div>
          <p className="mt-6 text-zinc-400">
            Customers chargeback, brand reputation tanks, ISO/export audits fail.
            Owners know they need it. They cannot afford it.
          </p>
        </Slide>

        <Slide number="02" title="Solution">
          <p className="text-lg leading-8 text-zinc-300">
            QuickEye turns any Android phone into a custom defect detector in 5 minutes.
            Worker shoots <span className="font-semibold text-zinc-100">20 OK + 20 defective units</span>.
            The phone becomes the QA station for that product line.
            No labeling, no fine-tuning, no IT team, no integration.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Feature
              title="Few-shot training"
              body="DINOv2 embeddings (768-dim, L2-normalized) + centroid classifier. Train in 30 seconds on the phone."
            />
            <Feature
              title="Three-layer false-positive defense"
              body="Burst capture (3–8 frames) → agreement voting → confidence threshold → GPT-5 sanity check. Returns ok / defect / uncertain."
            />
            <Feature
              title="Explainable AI verdicts"
              body="GPT-5.4-mini Vision tells the worker WHY a unit is defective: defect type, location hint, plain-English description."
            />
            <Feature
              title="Auto Inspect mode (Phase 2)"
              body="Phone on a ₹200 tripod over the inspection station. Motion-triggered. Hands-free. Worker just places units."
            />
            <Feature
              title="Daily AI shift report (Phase 2)"
              body="GPT-5 reads the day's inspections, writes a Hindi+English summary: defect patterns, station-level alerts."
            />
            <Feature
              title="Native APK + web"
              body="Capacitor wraps the Next.js PWA as an installable Android app. Auto-built by GitHub Actions on every push."
            />
          </div>
        </Slide>

        <Slide number="03" title="Stack">
          <div className="grid gap-4 lg:grid-cols-2">
            <StackBlock
              title="Frontend"
              items={[
                "Next.js 14 App Router (PWA)",
                "TypeScript + Tailwind",
                "Capacitor wraps the PWA as Android APK",
                "Native camera capture via input[capture=environment]",
                "localStorage for offline-first history",
              ]}
            />
            <StackBlock
              title="Backend"
              items={[
                "FastAPI on Modal Labs (serverless, scales to zero)",
                "Persistent volume for trained classifiers",
                "CPU container, 600ms warm latency, no GPU required",
                "5 endpoints: /health, /train, /predict, /predict-burst, /explain",
              ]}
            />
            <StackBlock
              title="AI"
              items={[
                "DINOv2-base (Meta, open) — 768-dim image embeddings",
                "Centroid classifier with temperature-scaled softmax",
                "GPT-5.4-mini Vision with Pydantic structured outputs",
                "GPT-5 sanity check downgrades questionable defect verdicts",
              ]}
            />
            <StackBlock
              title="DevOps"
              items={[
                "Modal deploy — persistent backend, no terminal needed",
                "Vercel — production web app with global CDN",
                "GitHub Actions — APK auto-built and signed on every push",
                "100% built with OpenAI Codex (full session log at /journey)",
              ]}
            />
          </div>
        </Slide>

        <Slide number="04" title="ICP & Business Model">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="text-xs uppercase tracking-wider text-emerald-400">Customer</div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">
                Indian MSME factory owners
              </div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>• 1–50 workers</li>
                <li>• ₹50L–₹10 Cr annual revenue</li>
                <li>• Verticals: fabrication, plastic moulding, packaging, printing, electronics assembly, food</li>
                <li>• Geo: Tier-2 / Tier-3 manufacturing hubs (Pune, Coimbatore, Rajkot, Indore, Surat, Ludhiana)</li>
                <li>• Decision-maker: owner-operator (not procurement)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="text-xs uppercase tracking-wider text-emerald-400">Pricing</div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">
                ₹999/month per phone-station
              </div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>• No hardware cost — uses owner&apos;s existing Android phone</li>
                <li>• ₹200 tripod (optional, for Auto Inspect mode)</li>
                <li>• Target: 3 stations per customer (₹3K MRR)</li>
                <li>• Annual ARPU: ₹36K</li>
                <li>• ROI for customer: catching 2-3 defective shipments/month pays for the year</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label="TAM (India, 1% capture)" value="₹2,250 Cr" sub="1% of 6.3 cr MSMEs × ₹36K ARPU" />
            <Stat label="SAM (manufacturing MSMEs)" value="₹400 Cr" sub="Top 5 verticals × 10% adoption" />
            <Stat label="Y1 SOM target" value="₹50L ARR" sub="500 customers at ₹999/mo across 3 cities" />
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <div className="text-xs uppercase tracking-wider text-emerald-400">Why we win</div>
            <p className="mt-2 text-sm leading-6 text-zinc-200">
              Cognex/Keyence sell to enterprises with ML teams. QuickEye sells to the bottom 90%
              of factories where the owner IS the ML team. The cloud-first phone-only architecture
              that incumbents would never build is precisely what unlocks this market.
            </p>
          </div>
        </Slide>

        <footer className="mt-16 border-t border-zinc-900 pt-6 text-sm text-zinc-500">
          <div>
            QuickEye · Rajan Kumar Kushwaha · #AIBuildersHackathon
          </div>
          <div className="mt-1">
            Built during May 26–31, 2026 · Backend{" "}
            <a className="underline" href="https://rajankushwaha178534--quickeye-fastapi-app.modal.run/health">
              live
            </a>{" "}
            on Modal · APK auto-built via GitHub Actions
          </div>
        </footer>
      </div>
    </main>
  );
}

function Slide({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-zinc-900 pt-10">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-zinc-500">#{number}</span>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-emerald-300">{value}</div>
      <div className="mt-1 text-xs leading-5 text-zinc-400">{sub}</div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="text-base font-semibold text-zinc-100">{title}</div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  );
}

function StackBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-zinc-300">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
