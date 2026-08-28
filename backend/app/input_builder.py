"""One shared raw-unit input builder for precompute and future live inference."""

from __future__ import annotations

from typing import Any

import numpy as np


def build_input_day(ds: Any, t_index: int, meta: dict[str, Any]) -> np.ndarray:
    """Return (1, 19, 100, 240) float32 in the model's original physical units.

    NaNs are intentionally retained. The TorchScript model standardises and masks them
    internally, using the constants and valid mask exported with the model.
    """
    day = ds.isel(time=t_index)
    latitude_count = len(meta["latitude"])
    longitude_count = len(meta["longitude"])
    planes: list[np.ndarray] = []
    for name in meta["input_vars"]:
        data_array = day[name]
        if set(data_array.dims) == {"latitude", "longitude"}:
            values = data_array.transpose("latitude", "longitude").values
        else:
            values = np.full((latitude_count, longitude_count), float(data_array.values), dtype="float32")
        planes.append(np.asarray(values, dtype="float32"))
    return np.stack(planes, axis=0)[None]
