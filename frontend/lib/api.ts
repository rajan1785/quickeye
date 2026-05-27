export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ExplainResult = {
  defect_detected: boolean;
  defect_type: string | null;
  location_hint: string | null;
  explanation: string;
};

export type PredictResult = {
  label: "ok" | "defect" | "uncertain";
  confidence: number;
  sim_ok: number;
  sim_defect: number;
  explanation: ExplainResult | null;
  model_id: string;
};

export type TrainResult = {
  model_id: string;
  ok_count: number;
  defect_count: number;
  saved_to: string;
};

const CUSTOMER_KEY = "quickeye:customer_id";
const WRITE_KEY = "quickeye:write_key";

function makeCustomerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cust_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  return `cust_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateCustomerId(): string {
  if (typeof window === "undefined") return "anonymous";
  const existing = window.localStorage.getItem(CUSTOMER_KEY);
  if (existing && existing.length >= 4 && !existing.includes("__")) return existing;
  const created = makeCustomerId();
  window.localStorage.setItem(CUSTOMER_KEY, created);
  return created;
}

function getWriteKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(WRITE_KEY);
}

export function setWriteKey(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WRITE_KEY, key);
}

function authHeaders(opts: { write?: boolean } = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Customer-ID": getOrCreateCustomerId(),
  };
  if (opts.write) {
    const key = getWriteKey();
    if (key) headers["X-API-Key"] = key;
  }
  return headers;
}

async function requestJson<T>(
  path: string,
  formData: FormData,
  opts: { write?: boolean } = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
    headers: authHeaders(opts),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T;
}

export async function trainModel(
  okFiles: File[],
  defectFiles: File[],
  modelId = "default",
): Promise<TrainResult> {
  const formData = new FormData();
  okFiles.forEach((file) => formData.append("ok_files", file));
  defectFiles.forEach((file) => formData.append("defect_files", file));
  formData.append("model_id", modelId);
  return requestJson<TrainResult>("/train", formData, { write: true });
}

export async function predictImage(
  file: File,
  modelId = "default",
  explain = true,
): Promise<PredictResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_id", modelId);
  formData.append("explain", String(explain));
  return requestJson<PredictResult>("/predict", formData);
}

export async function explainImage(
  file: File,
  productContext = "",
): Promise<ExplainResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_context", productContext);
  return requestJson<ExplainResult>("/explain", formData);
}

export async function healthCheck(): Promise<{ status: string; version: string }> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as { status: string; version: string };
}
