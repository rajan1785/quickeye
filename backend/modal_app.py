"""Modal entrypoint — wraps FastAPI with @asgi_app on CPU container."""

from __future__ import annotations

import pathlib

import modal

APP_NAME = "quickeye"
MODEL_VOLUME_NAME = "quickeye-models"
MODEL_DIR_INSIDE_CONTAINER = "/models"

image = modal.Image.debian_slim(python_version="3.11").pip_install(
    [
        "torch>=2.4",
        "torchvision",
        "transformers>=4.56",
        "Pillow",
        "numpy",
        "scikit-learn",
        "fastapi",
        "uvicorn[standard]",
        "python-multipart",
        "python-dotenv",
        "openai>=1.50",
        "tqdm",
        "pydantic>=2.7",
    ]
)
image = image.add_local_python_source("backend")

app = modal.App(APP_NAME)
models_volume = modal.Volume.from_name(MODEL_VOLUME_NAME, create_if_missing=True)


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("openai-secret")],
    volumes={MODEL_DIR_INSIDE_CONTAINER: models_volume},
    cpu=2.0,
    memory=4096,
    timeout=300,
    scaledown_window=300,
    min_containers=0,
)
@modal.asgi_app()
def fastapi_app() -> modal.ASGIApp:
    import os

    os.environ["QUICKEYE_MODEL_DIR"] = MODEL_DIR_INSIDE_CONTAINER
    from backend.app.api import app as api

    return api


if __name__ == "__main__":
    print("Run with: modal serve backend/modal_app.py (dev) or modal deploy backend/modal_app.py (prod)")
