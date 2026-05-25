# Built with Codex

## Sessions

### Session 2 — DINOv3 Embeddings (May 26, ~3k tokens)
Prompt: implement embeddings module with HuggingFace transformers, singleton lazy-load, L2-normalized CLS token output. Codex wrote correct code first try including pytest mocks for offline testing. Zero hand-edits required.

### Session 4 — Vision Agent (May 26, ~3k tokens)
Prompt: GPT-5.4-mini vision wrapper with Pydantic structured outputs, base64 image input, defensive fallback. Codex used the chat.completions.parse helper (the SDK's typed wrapper around response_format) — cleaner than manual JSON.loads. Zero hand-edits.

### Session 5 — FastAPI API Layer (May 26, ~4k tokens)
Prompt: 4 endpoints (/health, /train, /predict, /explain), CORS open, on-disk model persistence with in-memory cache, confidence-gated vision agent calls. Codex picked sync upload reads (correct since embedding is CPU-bound) and used Annotated syntax for typed form fields.
