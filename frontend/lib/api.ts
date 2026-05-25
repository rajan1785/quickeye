export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ExplainResult = {
  defect_detected: boolean;
  defect_type: string | null;
  location_hint: string | null;
  explanation: string;
};

export type PredictResult = {
  label: "ok" | "defect";
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

async function requestJson<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
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
  return requestJson<TrainResult>("/train", formData);
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
