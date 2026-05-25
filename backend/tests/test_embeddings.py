from __future__ import annotations

from unittest.mock import Mock

import numpy as np
import torch
from PIL import Image

from backend.app import embeddings


class _FakeModel:
    def __call__(self, **_: object) -> object:
        return type(
            "Outputs",
            (),
            {"last_hidden_state": torch.ones((1, 2, 768), dtype=torch.float32)},
        )()


class _FakeProcessor:
    def __call__(self, images: Image.Image, return_tensors: str) -> dict[str, torch.Tensor]:
        return {"pixel_values": torch.zeros((1, 3, 224, 224), dtype=torch.float32)}


def test_embed_image_returns_normalized_768_vector(monkeypatch) -> None:
    monkeypatch.setattr(embeddings, "_model", None)
    monkeypatch.setattr(embeddings, "_processor", None)
    monkeypatch.setattr(embeddings, "_load", lambda: (_FakeModel(), _FakeProcessor()))

    array = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
    image = Image.fromarray(array, mode="RGB")

    out = embeddings.embed_image(image)

    assert out.shape == (768,)
    assert abs(np.linalg.norm(out) - 1.0) < 1e-4


def test_embed_image_singleton_loads_once(monkeypatch) -> None:
    monkeypatch.setattr(embeddings, "_model", None)
    monkeypatch.setattr(embeddings, "_processor", None)

    def fake_load() -> tuple[_FakeModel, _FakeProcessor]:
        model = _FakeModel()
        processor = _FakeProcessor()
        monkeypatch.setattr(embeddings, "_model", model)
        monkeypatch.setattr(embeddings, "_processor", processor)
        return model, processor

    load_mock = Mock(side_effect=fake_load)
    monkeypatch.setattr(embeddings, "_load", load_mock)

    array = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
    image = Image.fromarray(array, mode="RGB")

    embeddings.embed_image(image)
    embeddings.embed_image(image)

    assert load_mock.call_count == 1
