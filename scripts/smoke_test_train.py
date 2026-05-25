"""Smoke test for /train endpoint — generates synthetic test images and posts them."""

from __future__ import annotations

import io
import sys

import requests
from PIL import Image, ImageDraw

API_URL = "https://rajankushwaha178534--quickeye-fastapi-app-dev.modal.run"


def make_image(color: tuple[int, int, int], label: str) -> bytes:
    image = Image.new("RGB", (224, 224), color=color)
    draw = ImageDraw.Draw(image)
    draw.text((20, 100), label, fill=(255, 255, 255))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def main() -> None:
    print("Generating 10 synthetic images (5 OK = green, 5 defect = red)...")

    ok_bytes = [make_image((30, 200, 30), f"OK{i}") for i in range(5)]
    defect_bytes = [make_image((220, 30, 30), f"DEF{i}") for i in range(5)]

    files = []
    for i, content in enumerate(ok_bytes):
        files.append(("ok_files", (f"ok_{i}.jpg", content, "image/jpeg")))
    for i, content in enumerate(defect_bytes):
        files.append(("defect_files", (f"defect_{i}.jpg", content, "image/jpeg")))

    print(f"POST {API_URL}/train  (this takes 60-90s on cold container)")
    response = requests.post(f"{API_URL}/train", files=files, timeout=300)

    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

    if response.status_code != 200:
        sys.exit(1)

    print("\nNow testing /predict with an OK-colored image...")
    predict_bytes = make_image((30, 200, 30), "TEST")
    predict_files = {"file": ("test.jpg", predict_bytes, "image/jpeg")}
    predict_data = {"explain": "false"}  # skip OpenAI call for speed
    predict_response = requests.post(
        f"{API_URL}/predict", files=predict_files, data=predict_data, timeout=60
    )
    print(f"Status: {predict_response.status_code}")
    print(f"Response: {predict_response.text}")


if __name__ == "__main__":
    main()
