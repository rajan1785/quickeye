"""Centroid-based few-shot classifier."""

from __future__ import annotations

from typing import Any

import numpy as np


class CentroidClassifier:
    ok_centroid: np.ndarray | None
    defect_centroid: np.ndarray | None

    def __init__(self) -> None:
        self.ok_centroid = None
        self.defect_centroid = None

    def train(self, ok_embeddings: np.ndarray, defect_embeddings: np.ndarray) -> None:
        if ok_embeddings.shape[0] < 5 or defect_embeddings.shape[0] < 5:
            raise ValueError("At least 5 OK and 5 defect embeddings are required.")

        self.ok_centroid = self._normalize(ok_embeddings.mean(axis=0))
        self.defect_centroid = self._normalize(defect_embeddings.mean(axis=0))

    def predict(self, embedding: np.ndarray) -> dict[str, Any]:
        if self.ok_centroid is None or self.defect_centroid is None:
            raise RuntimeError("Classifier must be trained before prediction.")

        normalized_embedding = self._normalize(embedding)
        sim_ok = float(np.dot(normalized_embedding, self.ok_centroid))
        sim_defect = float(np.dot(normalized_embedding, self.defect_centroid))
        probabilities = self._softmax(np.array([sim_ok, sim_defect], dtype=np.float32) * 10.0)

        if probabilities[0] >= probabilities[1]:
            return {
                "label": "ok",
                "confidence": float(probabilities[0]),
                "sim_ok": sim_ok,
                "sim_defect": sim_defect,
            }

        return {
            "label": "defect",
            "confidence": float(probabilities[1]),
            "sim_ok": sim_ok,
            "sim_defect": sim_defect,
        }

    def save(self, path: str) -> None:
        if self.ok_centroid is None or self.defect_centroid is None:
            raise RuntimeError("Classifier must be trained before saving.")

        np.savez(
            path,
            ok_centroid=self.ok_centroid.astype(np.float32),
            defect_centroid=self.defect_centroid.astype(np.float32),
        )

    @classmethod
    def load(cls, path: str) -> "CentroidClassifier":
        classifier = cls()
        with np.load(path, allow_pickle=False) as data:
            classifier.ok_centroid = data["ok_centroid"].astype(np.float32)
            classifier.defect_centroid = data["defect_centroid"].astype(np.float32)
        return classifier

    @staticmethod
    def _normalize(vector: np.ndarray) -> np.ndarray:
        vector = np.asarray(vector, dtype=np.float32)
        norm = np.linalg.norm(vector)
        return (vector / max(norm, 1e-12)).astype(np.float32)

    @staticmethod
    def _softmax(values: np.ndarray) -> np.ndarray:
        shifted = values - np.max(values)
        exp_values = np.exp(shifted)
        return exp_values / np.sum(exp_values)
