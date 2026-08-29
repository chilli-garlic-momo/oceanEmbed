from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import xarray as xr


class StoreUnavailable(RuntimeError):
    """The model metadata and precomputed prediction store cannot safely be served."""


def json_value(value: Any) -> Any:
    """Convert NumPy values to JSON values while preserving every mask as null."""
    if isinstance(value, np.ndarray):
        return json_value(value.tolist())
    if isinstance(value, list):
        return [json_value(item) for item in value]
    if isinstance(value, np.generic):
        return json_value(value.item())
    if isinstance(value, float) and not np.isfinite(value):
        return None
    return value


class PredictionStore:
    """Read-only access to one prediction store with the contract's cache layout."""

    def __init__(self, meta_path: Path, store_url: str) -> None:
        with meta_path.open(encoding="utf-8") as handle:
            self.meta = json.load(handle)
        self.model_version = self.meta["version"]
        self.depths = [float(depth) for depth in self.meta["depths_m"]]
        self.latitude = np.asarray(self.meta["latitude"], dtype="float64")
        self.longitude = np.asarray(self.meta["longitude"], dtype="float64")
        self.dataset = xr.open_zarr(store_url, consolidated=True)
        self.store_version = self.dataset.attrs.get("model_version")
        if self.store_version != self.model_version:
            raise StoreUnavailable(
                f"model/store version mismatch: metadata is {self.model_version!r}, store is {self.store_version!r}"
            )
        required = {"t_pred", "t_sigma", "tchp", "d20", "mld", "valid"}
        missing = required.difference(self.dataset.data_vars)
        if missing:
            raise StoreUnavailable(f"prediction store is missing variables: {sorted(missing)}")
        self.dates = tuple(np.datetime_as_string(value, unit="D") for value in self.dataset.time.values)
        self._date_indices = {date: index for index, date in enumerate(self.dates)}
        # Per contract, derived fields are eager; profiles and temperature fields are day reads.
        self.derived = {name: np.asarray(self.dataset[name].values) for name in ("tchp", "d20", "mld")}
        self.valid = np.asarray(self.dataset["valid"].values, dtype=bool)

    @property
    def available_range(self) -> list[str]:
        return [self.dates[0], self.dates[-1]]

    def date_index(self, date: str) -> int:
        try:
            return self._date_indices[date]
        except KeyError as exc:
            raise KeyError(f"date unavailable; available range is {self.available_range}") from exc



    def nearest_cell(self, lat: float, lon: float) -> tuple[int, int, float, float]:
        if not (self.latitude.min() <= lat <= self.latitude.max()) or not (self.longitude.min() <= lon <= self.longitude.max()):
            raise ValueError(
                f"lat/lon outside domain {self.latitude.min()}–{self.latitude.max()} N, "
                f"{self.longitude.min()}–{self.longitude.max()} E"
            )
        lat_index = int(np.abs(self.latitude - lat).argmin())
        lon_index = int(np.abs(self.longitude - lon).argmin())
        return lat_index, lon_index, float(self.latitude[lat_index]), float(self.longitude[lon_index])

    @lru_cache(maxsize=32)
    def load_day(self, date: str) -> tuple[np.ndarray, np.ndarray]:
        index = self.date_index(date)
        temperature = np.asarray(self.dataset["t_pred"].isel(time=index).values)
        sigma = np.asarray(self.dataset["t_sigma"].isel(time=index).values)
        return temperature, sigma

    def profile(self, lat: float, lon: float, date: str) -> dict[str, Any]:
        date_index = self.date_index(date)
        lat_index, lon_index, grid_lat, grid_lon = self.nearest_cell(lat, lon)
        temperature, sigma = self.load_day(date)
        masked = not bool(self.valid[:, lat_index, lon_index].any())
        response = {
            "lat": grid_lat,
            "lon": grid_lon,
            "date": date,
            "depths_m": self.depths,
            "temperature_degC": json_value(temperature[:, lat_index, lon_index]),
            "sigma_degC": json_value(sigma[:, lat_index, lon_index]),
            "tchp_kJ_cm2": json_value(self.derived["tchp"][date_index, lat_index, lon_index]),
            "d20_m": json_value(self.derived["d20"][date_index, lat_index, lon_index]),
            "mld_m": json_value(self.derived["mld"][date_index, lat_index, lon_index]),
            "model_version": self.model_version,
            "in_training_set": int(date[:4]) in set(self.meta.get("split", {}).get("train", [])),
        }
        if masked:
            response["masked"] = True
        return response

    def field(self, depth: float, date: str) -> dict[str, Any]:
        if depth not in self.depths:
            raise ValueError(f"depth must be one of {self.depths}")
        temperature, _ = self.load_day(date)
        return {
            "date": date,
            "depth_m": depth,
            "latitude": json_value(self.latitude),
            "longitude": json_value(self.longitude),
            "temperature_degC": json_value(temperature[self.depths.index(depth)]),
            "model_version": self.model_version,
        }

    def tchp(self, date: str) -> dict[str, Any]:
        date_index = self.date_index(date)
        return {
            "date": date,
            "latitude": json_value(self.latitude),
            "longitude": json_value(self.longitude),
            "tchp_kJ_cm2": json_value(self.derived["tchp"][date_index]),
            "model_version": self.model_version,
        }
