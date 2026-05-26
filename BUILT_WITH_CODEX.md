# Built with Codex

## Sessions

### Session 2 — DINOv3 Embeddings (May 26, ~3k tokens)
Prompt: implement embeddings module with HuggingFace transformers, singleton lazy-load, L2-normalized CLS token output. Codex wrote correct code first try including pytest mocks for offline testing. Zero hand-edits required.

### Session 4 — Vision Agent (May 26, ~3k tokens)
Prompt: GPT-5.4-mini vision wrapper with Pydantic structured outputs, base64 image input, defensive fallback. Codex used the chat.completions.parse helper (the SDK's typed wrapper around response_format) — cleaner than manual JSON.loads. Zero hand-edits.

### Session 5 — FastAPI API Layer (May 26, ~4k tokens)
Prompt: 4 endpoints (/health, /train, /predict, /explain), CORS open, on-disk model persistence with in-memory cache, confidence-gated vision agent calls. Codex picked sync upload reads (correct since embedding is CPU-bound) and used Annotated syntax for typed form fields.

### Session 6 — Modal Deployment (May 26, ~3k tokens)
Prompt: wrap FastAPI as Modal ASGI app with CPU container, persistent volume for trained models, secret injection for OpenAI key. Codex used current Modal API (add_local_python_source, min_containers, scaledown_window) — none of the deprecated patterns. Added backend/__init__.py manually for namespace package safety.

### Session 7 — Modal Deployment Live (May 26)
Backend deployed to https://rajankushwaha178534--quickeye-fastapi-app-dev.modal.run/health returns 200. Image built in 81s. DINOv3 + GPT-5.4-mini + FastAPI bundled. Auth setup script (scripts/setup_modal_auth.sh) bypassed Modal CLI hanging browser flow.

### Session 9 — Frontend Foundation (May 26)
Next.js 14 PWA: typed API client (trainModel, predictImage, explainImage, healthCheck), landing page with live health check + abbreviated API URL display, dark theme, Card component with accent variants, screen skeletons for Train/Inspect/History. Tailwind + App Router. Codex shipped clean useEffect cleanup pattern (mounted flag), proper Next.js metadata/viewport exports, and dimension-correct types matching backend Pydantic schemas. Zero hand-edits.

### Session 10 — Train UI (May 27)
Full training screen: native camera capture via input[capture=environment], live count badges (OK X/20, defect Y/20), thumbnail previews with revokeObjectURL cleanup, sticky bottom action button, error banner with dismiss, success state with "Inspect Now" CTA, localStorage persistence of active model. Codex shipped working accessibility (aria-disabled, htmlFor, aria-label) without being asked.

### Session 11 — Inspect UI (May 27)
Inspect screen: native camera capture, big verdict badge (✓OK/✗DEFECT with aria-live), confidence %, OK/defect similarity bars, AI Inspector card showing defect_type/location chips + GPT-5 explanation, Save to History (localStorage cap 50), Inspect Another flow with file input reset. Codex used previewUrlRef pattern to dodge stale closure bug with revokeObjectURL.
