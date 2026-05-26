"""FastAPI app exposing the QuickEye backend."""

from __future__ import annotations

import io
import json
import os
import pathlib
from typing import Annotated

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .classifier import CentroidClassifier
from .embeddings import embed_image
from .vision_agent import explain_defect

app = FastAPI(title="QuickEye API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = pathlib.Path(os.environ.get("QUICKEYE_MODEL_DIR", "/tmp/quickeye_models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_MODEL_PATH = MODEL_DIR / "default.npz"

_classifier_cache: dict[str, CentroidClassifier] = {}


def _model_path(model_id: str) -> pathlib.Path:
    return MODEL_DIR / f"{model_id}.npz"


def _get_classifier(model_id: str = "default") -> CentroidClassifier:
    if model_id in _classifier_cache:
        return _classifier_cache[model_id]

    model_path = _model_path(model_id)
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")

    classifier = CentroidClassifier.load(str(model_path))
    _classifier_cache[model_id] = classifier
    return classifier


def _embed_upload(upload: UploadFile) -> np.ndarray:
    content = upload.file.read()
    with Image.open(io.BytesIO(content)) as image:
        return embed_image(image)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "0.1.0"}


@app.post("/train")
def train(
    ok_files: Annotated[list[UploadFile], File(...)],
    defect_files: Annotated[list[UploadFile], File(...)],
    model_id: Annotated[str, Form()] = "default",
) -> dict[str, str | int]:
    if len(ok_files) < 5 or len(defect_files) < 5:
        raise HTTPException(status_code=400, detail="At least 5 OK and 5 defect images are required.")

    ok_embeddings = np.stack([_embed_upload(upload) for upload in ok_files], axis=0)
    defect_embeddings = np.stack([_embed_upload(upload) for upload in defect_files], axis=0)

    classifier = CentroidClassifier()
    classifier.train(ok_embeddings, defect_embeddings)

    model_path = _model_path(model_id)
    classifier.save(str(model_path))
    _classifier_cache.pop(model_id, None)
    _classifier_cache[model_id] = classifier

    return {
        "model_id": model_id,
        "ok_count": len(ok_files),
        "defect_count": len(defect_files),
        "saved_to": str(model_path),
    }


@app.post("/predict")
def predict(
    file: Annotated[UploadFile, File(...)],
    model_id: Annotated[str, Form()] = "default",
    explain: Annotated[bool, Form()] = True,
) -> dict[str, object]:
    content = file.file.read()
    classifier = _get_classifier(model_id)

    with Image.open(io.BytesIO(content)) as image:
        embedding = embed_image(image)

    prediction = classifier.predict(embedding)
    explanation: dict[str, object] | None = None
    if explain and (prediction["confidence"] < 0.85 or prediction["label"] == "defect"):
        explanation = explain_defect(content)

    return {
        "label": prediction["label"],
        "confidence": prediction["confidence"],
        "sim_ok": prediction["sim_ok"],
        "sim_defect": prediction["sim_defect"],
        "explanation": explanation,
        "model_id": model_id,
    }


@app.post("/explain")
def explain(
    file: Annotated[UploadFile, File(...)],
    product_context: Annotated[str, Form()] = "",
) -> dict[str, object]:
    content = file.file.read()
    return explain_defect(content, product_context=product_context)


@app.post("/predict-burst")
def predict_burst(
    files: Annotated[list[UploadFile], File(...)],
    model_id: Annotated[str, Form()] = "default",
    explain: Annotated[bool, Form()] = True,
) -> dict[str, object]:
    """
    Burst-vote inspection: accepts 2-8 images of the same unit (different angles
    or rapid sequential captures). Returns aggregated verdict with uncertain state
    for low-agreement or low-confidence bursts. Optionally runs GPT-5 sanity check
    on defect verdicts and downgrades to uncertain if AI disagrees.
    """
    n = len(files)
    if n < 2 or n > 8:
        raise HTTPException(
            status_code=400,
            detail="Burst must contain between 2 and 8 images.",
        )

    contents_list: list[bytes] = [upload.file.read() for upload in files]
    classifier = _get_classifier(model_id)

    per_image: list[dict[str, object]] = []
    for content in contents_list:
        with Image.open(io.BytesIO(content)) as image:
            embedding = embed_image(image)
        per_image.append(classifier.predict(embedding))

    n_ok = sum(1 for p in per_image if p["label"] == "ok")
    n_def = sum(1 for p in per_image if p["label"] == "defect")
    agreement = max(n_ok, n_def) / n
    avg_confidence = float(np.mean([p["confidence"] for p in per_image]))

    if agreement < 0.6:
        label: str = "uncertain"
    elif avg_confidence < 0.75:
        label = "uncertain"
    else:
        label = "ok" if n_ok > n_def else "defect"

    explanation: dict[str, object] | None = None
    if explain and label == "defect":
        defect_idx = next(
            (i for i, p in enumerate(per_image) if p["label"] == "defect"),
            0,
        )
        explanation = explain_defect(contents_list[defect_idx])
        if explanation.get("defect_detected") is False:
            label = "uncertain"

    return {
        "label": label,
        "agreement": agreement,
        "avg_confidence": avg_confidence,
        "per_image": per_image,
        "explanation": explanation,
        "model_id": model_id,
        "burst_size": n,
    }
