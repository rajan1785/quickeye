"""GPT-5.4-mini vision agent for defect explanation."""

from __future__ import annotations

import base64
import json
import os

from openai import OpenAI
from pydantic import BaseModel, Field

_client: OpenAI | None = None


class DefectReport(BaseModel):
    defect_detected: bool
    defect_type: str | None = Field(
        default=None,
        description=(
            "Short name e.g. 'scratch', 'crack', 'missing_part', 'color_drift', "
            "'deformation', 'contamination', or null if none"
        ),
    )
    location_hint: str | None = Field(
        default=None,
        description="Brief spatial hint e.g. 'top-left edge', 'center', 'right side' or null",
    )
    explanation: str = Field(description="Max 40 words, terse and specific")


def _get_client() -> OpenAI:
    global _client

    if _client is None:
        api_key = os.environ["OPENAI_API_KEY"]
        _client = OpenAI(api_key=api_key)

    return _client


def explain_defect(image_bytes: bytes, image_mime: str = "image/jpeg", product_context: str = "") -> dict:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{image_mime};base64,{encoded}"

    try:
        client = _get_client()
        response = client.chat.completions.parse(
            model="gpt-5.4-mini",
            response_format=DefectReport,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an industrial quality control inspector. Examine the product image "
                        "and identify any visible defects: scratches, cracks, missing parts, color drift, "
                        "deformation, or contamination. Be specific and terse. If no defect, set "
                        "defect_detected=false."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": product_context or "Inspect this unit."},
                        {"type": "image_url", "image_url": {"url": data_uri}},
                    ],
                },
            ],
        )
        parsed = response.choices[0].message.parsed
        if parsed is None:
            raise ValueError("No parsed response returned.")
        return parsed.model_dump()
    except Exception:
        return {
            "defect_detected": False,
            "defect_type": None,
            "location_hint": None,
            "explanation": "AI inspector unavailable",
        }
