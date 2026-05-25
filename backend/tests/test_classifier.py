from __future__ import annotations

import numpy as np
import pytest

from backend.app.classifier import CentroidClassifier


def _normalize(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    return (vector / max(norm, 1e-12)).astype(np.float32)


def _training_data() -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(42)
    ok = rng.normal(loc=1.0, scale=0.1, size=(20, 768)).astype(np.float32)
    defect = rng.normal(loc=-1.0, scale=0.1, size=(20, 768)).astype(np.float32)
    return ok, defect


def test_predicts_well_separated_blobs() -> None:
    ok, defect = _training_data()
    classifier = CentroidClassifier()
    classifier.train(ok, defect)

    ok_prediction = classifier.predict(_normalize(ok[0]))
    defect_prediction = classifier.predict(_normalize(defect[0]))

    assert ok_prediction["label"] == "ok"
    assert ok_prediction["confidence"] > 0.9
    assert defect_prediction["label"] == "defect"
    assert defect_prediction["confidence"] > 0.9


def test_save_load_round_trip(tmp_path) -> None:
    ok, defect = _training_data()
    classifier = CentroidClassifier()
    classifier.train(ok, defect)

    path = tmp_path / "classifier.npz"
    classifier.save(str(path))
    loaded = CentroidClassifier.load(str(path))

    sample = _normalize(ok[0])
    assert loaded.predict(sample) == classifier.predict(sample)


def test_train_requires_at_least_five_samples() -> None:
    classifier = CentroidClassifier()
    ok = np.ones((4, 768), dtype=np.float32)
    defect = -np.ones((5, 768), dtype=np.float32)

    with pytest.raises(ValueError):
        classifier.train(ok, defect)


def test_predict_before_train_raises_runtime_error() -> None:
    classifier = CentroidClassifier()

    with pytest.raises(RuntimeError):
        classifier.predict(np.ones((768,), dtype=np.float32))
