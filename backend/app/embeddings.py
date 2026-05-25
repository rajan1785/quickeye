"""DINOv3 image embedding singleton."""

from __future__ import annotations

from typing import Any

import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModel

MODEL_ID = "facebook/dinov3-vitb16-pretrain-lvd1689m"

_model: Any | None = None
_processor: Any | None = None


def _device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"


def _load() -> tuple[Any, Any]:
    global _model, _processor

    if _model is None or _processor is None:
        _processor = AutoImageProcessor.from_pretrained(MODEL_ID)
        _model = AutoModel.from_pretrained(MODEL_ID).to(_device())
        _model.eval()

    return _model, _processor


def embed_image(image: Image.Image) -> np.ndarray:
    global _model, _processor

    if _model is None or _processor is None:
        model, processor = _load()
    else:
        model, processor = _model, _processor

    rgb_image = image if image.mode == "RGB" else image.convert("RGB")

    inputs = processor(images=rgb_image, return_tensors="pt")
    inputs = {key: value.to(_device()) for key, value in inputs.items()}

    with torch.no_grad(), torch.inference_mode():
        outputs = model(**inputs)
        embedding = outputs.last_hidden_state[:, 0, :]

    vector = embedding.cpu().numpy().squeeze().astype(np.float32)
    norm = np.linalg.norm(vector)
    return (vector / max(norm, 1e-12)).astype(np.float32)


def embed_image_path(path: str) -> np.ndarray:
    with Image.open(path) as image:
        return embed_image(image)
