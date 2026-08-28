from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    meta_path: Path
    store_url: str


def get_settings() -> Settings:
    meta_path = Path(os.getenv("OCEANEMBED_META_PATH", "data/oceanembed_meta.json"))
    if not meta_path.is_absolute():
        meta_path = BASE_DIR / meta_path
    return Settings(
        meta_path=meta_path,
        store_url=os.getenv("OCEANEMBED_STORE_URL", "data/oceanembed_pred_2020.zarr"),
    )
