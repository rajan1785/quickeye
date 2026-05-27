"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { API_URL } from "@/lib/api";
import { playBuzz, playChime, playUncertain } from "@/lib/sound";

type Status = "idle" | "watching" | "capturing" | "verdict" | "cooldown";
type Sensitivity = "strict" | "balanced" | "permissive";
type Verdict = {
  label: "ok" | "defect" | "uncertain";
  confidence: number;
};

type Stats = {
  total: number;
  ok: number;
  defect: number;
  uncertain: number;
};

const THRESHOLDS: Record<Sensitivity, number> = {
  strict: 5,
  balanced: 8,
  permissive: 11,
};

function makeCustomerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cust_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  return `cust_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateCustomerId(): string {
  if (typeof window === "undefined") {
    return "anonymous";
  }

  const key = "quickeye:customer_id";
  const existing = window.localStorage.getItem(key);
  if (existing && existing.length >= 4 && !existing.includes("__")) {
    return existing;
  }

  const created = makeCustomerId();
  window.localStorage.setItem(key, created);
  return created;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.85,
) : Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to capture frame"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export default function AutoInspectPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const stableFramesCountRef = useRef<number>(0);
  const lastTriggerAtRef = useRef<number>(0);
  const statusRef = useRef<Status>("idle");
  const captureLockRef = useRef<boolean>(false);
  const verdictTimerRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const [streamReady, setStreamReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    ok: 0,
    defect: 0,
    uncertain: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [modelId] = useState<string>("default");
  const [sensitivity, setSensitivity] = useState<Sensitivity>("balanced");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    try {
      getOrCreateCustomerId();
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: 640,
            height: 480,
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          return;
        }

        video.srcObject = stream;
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            if (mounted) {
              setStreamReady(true);
            }
          } catch (cause) {
            if (mounted) {
              setError(cause instanceof Error ? cause.message : "Unable to start camera");
            }
          }
        };
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Camera permission denied");
        }
      }
    }

    void setupCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isRunning || !streamReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (captureLockRef.current || statusRef.current !== "watching") {
        stableFramesCountRef.current = 0;
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      canvas.width = 80;
      canvas.height = 60;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const current = new Uint8ClampedArray(imageData);

      let diff = 999;
      if (prevFrameDataRef.current && prevFrameDataRef.current.length === current.length) {
        let sum = 0;
        for (let index = 0; index < current.length; index += 1) {
          sum += Math.abs(current[index] - prevFrameDataRef.current[index]);
        }
        diff = sum / current.length;
      }

      prevFrameDataRef.current = current;
      const threshold = THRESHOLDS[sensitivity];

      if (diff < threshold) {
        stableFramesCountRef.current += 1;
      } else {
        stableFramesCountRef.current = 0;
      }

      const now = Date.now();
      if (
        stableFramesCountRef.current >= 4 &&
        statusRef.current === "watching" &&
        now - lastTriggerAtRef.current > 1200
      ) {
        void triggerBurst();
      }
    }, 200);

    pollIntervalRef.current = intervalId;

    return () => {
      window.clearInterval(intervalId);
      pollIntervalRef.current = null;
    };
  }, [isRunning, streamReady, sensitivity]);

  useEffect(() => {
    return () => {
      if (verdictTimerRef.current) {
        window.clearTimeout(verdictTimerRef.current);
      }
      if (cooldownTimerRef.current) {
        window.clearTimeout(cooldownTimerRef.current);
      }
      if (errorTimerRef.current) {
        window.clearTimeout(errorTimerRef.current);
      }
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && streamReady && status === "idle") {
      setStatus("watching");
    }
  }, [isRunning, streamReady, status]);

  async function triggerBurst(): Promise<void> {
    if (captureLockRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }

    captureLockRef.current = true;
    lastTriggerAtRef.current = Date.now();
    stableFramesCountRef.current = 0;
    prevFrameDataRef.current = null;

    setStatus("capturing");
    setError(null);

    try {
      const frames: Blob[] = [];
      for (let index = 0; index < 3; index += 1) {
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Unable to read camera frame");
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(await canvasToBlob(canvas, "image/jpeg", 0.85));
        if (index < 2) {
          await sleep(80);
        }
      }

      const customerId = getOrCreateCustomerId();
      const formData = new FormData();
      frames.forEach((blob, index) => {
        formData.append("files", blob, `burst-${index + 1}.jpg`);
      });
      formData.append("model_id", modelId);
      formData.append("explain", "true");

      const response = await fetch(`${API_URL}/predict-burst`, {
        method: "POST",
        headers: {
          "X-Customer-ID": customerId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as {
        label: "ok" | "defect" | "uncertain";
        avg_confidence: number;
      };

      const nextVerdict: Verdict = {
        label: data.label,
        confidence: data.avg_confidence,
      };

      setVerdict(nextVerdict);
      setStatus("verdict");
      setStats((current) => ({
        total: current.total + 1,
        ok: current.ok + (data.label === "ok" ? 1 : 0),
        defect: current.defect + (data.label === "defect" ? 1 : 0),
        uncertain: current.uncertain + (data.label === "uncertain" ? 1 : 0),
      }));

      if (data.label === "defect") {
        playBuzz();
      } else if (data.label === "ok") {
        playChime();
      } else {
        playUncertain();
      }

      if (verdictTimerRef.current) {
        window.clearTimeout(verdictTimerRef.current);
      }
      if (cooldownTimerRef.current) {
        window.clearTimeout(cooldownTimerRef.current);
      }

      verdictTimerRef.current = window.setTimeout(() => {
        setStatus("cooldown");
        cooldownTimerRef.current = window.setTimeout(() => {
          setVerdict(null);
          setStatus(isRunning ? "watching" : "idle");
          captureLockRef.current = false;
        }, 500);
      }, 2000);
    } catch (cause) {
      captureLockRef.current = false;
      setStatus(isRunning ? "watching" : "idle");
      setError(cause instanceof Error ? cause.message : "Auto inspect failed");
      if (errorTimerRef.current) {
        window.clearTimeout(errorTimerRef.current);
      }
      errorTimerRef.current = window.setTimeout(() => setError(null), 2500);
    }
  }

  function toggleRunning() {
    if (isRunning) {
      setIsRunning(false);
      setStatus("idle");
      setVerdict(null);
      captureLockRef.current = false;
      stableFramesCountRef.current = 0;
      prevFrameDataRef.current = null;
      return;
    }

    setIsRunning(true);
    setStatus(streamReady ? "watching" : "idle");
  }

  const verdictClass =
    verdict?.label === "ok"
      ? "bg-emerald-500/30 text-emerald-50"
      : verdict?.label === "defect"
        ? "bg-red-500/30 text-red-50"
        : "bg-amber-500/30 text-amber-50";

  const verdictText =
    verdict?.label === "ok" ? "✓ OK" : verdict?.label === "defect" ? "✗ DEFECT" : "? UNCERTAIN";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-4 py-4">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
          <Link href="/" className="text-2xl text-zinc-300">
            ←
          </Link>
          <h1 className="text-center text-xl font-semibold tracking-tight">Auto Inspect</h1>
          <label className="flex items-center gap-2">
            <span className="sr-only">Sensitivity</span>
            <select
              value={sensitivity}
              onChange={(event) => setSensitivity(event.target.value as Sensitivity)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="strict">Strict</option>
              <option value="balanced">Balanced</option>
              <option value="permissive">Permissive</option>
            </select>
          </label>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-zinc-800 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            <div className="absolute right-3 top-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-[11px] text-zinc-100 backdrop-blur">
              Inspected: {stats.total} · OK: {stats.ok} · Defect: {stats.defect} · Uncertain: {stats.uncertain}
            </div>

            {verdict ? (
              <div
                className={`absolute inset-0 flex items-center justify-center text-center backdrop-blur-md transition-opacity duration-500 ${
                  verdict.label === "ok"
                    ? "bg-emerald-500/30"
                    : verdict.label === "defect"
                      ? "bg-red-500/30"
                      : "bg-amber-500/30"
                } ${status === "cooldown" ? "opacity-0" : "opacity-100"}`}
              >
                <div className="space-y-2">
                  <div className="text-5xl font-black sm:text-7xl">{verdictText}</div>
                  <div className="text-sm font-medium text-white/90">
                    Confidence: {(verdict.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ) : null}

            <div className="absolute bottom-3 left-3 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-100 backdrop-blur">
              {status === "watching" ? <span className="animate-pulse">watching</span> : null}
              {status === "capturing" ? <span>⟳ capturing</span> : null}
              {status === "verdict" ? <span>✓ verdict</span> : null}
              {status === "cooldown" ? <span>⌛ cooldown</span> : null}
              {status === "idle" ? <span>idle</span> : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleRunning}
          className={`w-full rounded-2xl py-4 font-semibold transition ${
            isRunning
              ? "border border-red-500/40 bg-zinc-900 text-red-200 hover:bg-zinc-800"
              : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
          }`}
        >
          {isRunning ? "Stop" : "Start Auto Inspect"}
        </button>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
