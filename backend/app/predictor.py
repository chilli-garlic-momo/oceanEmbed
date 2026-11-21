"""Dataset-grounded realistic prediction engine for OceanEmbed prototype."""

from __future__ import annotations

from typing import Any

import numpy as np
import xarray as xr

from .derived import isotherm_depth, mld, tchp


def generate_dataset_predictions(
    cube: xr.Dataset,
    meta: dict[str, Any],
    selected_indices: list[int] | np.ndarray,
) -> xr.Dataset:
    """Generate realistic 3D predictions and diagnostics directly from the ocean cube dataset.

    Parameters
    ----------
    cube : xr.Dataset
        The loaded oceanembed_cube.zarr dataset.
    meta : dict[str, Any]
        Metadata dictionary matching the OceanEmbed contract.
    selected_indices : list[int] or np.ndarray
        Time indices to compute predictions for.

    Returns
    -------
    xr.Dataset
        Precomputed prediction dataset containing t_pred, t_sigma, tchp, d20, mld, and valid.
    """
    depths = np.asarray(meta["depths_m"], dtype="float32")
    num_days = len(selected_indices)
    num_depths = len(depths)
    num_lats = len(meta["latitude"])
    num_lons = len(meta["longitude"])

    temperature = np.full((num_days, num_depths, num_lats, num_lons), np.nan, dtype="float32")
    sigma = np.full_like(temperature, np.nan)

    # 2D land mask from surface SST
    ocean_mask_2d = np.isfinite(cube.sst.isel(time=selected_indices[0]).values)

    dz = np.diff(depths)

    for out_idx, src_idx in enumerate(selected_indices):
        day = cube.isel(time=int(src_idx))
        
        # Surface layer (depth 0m)
        if "sst" in day:
            temperature[out_idx, 0] = day["sst"].values
        
        # Subsurface layers (depths 5m to 700m -> indices 1 to 13)
        if "thetao" in day:
            thetao_vals = day["thetao"].values
            if thetao_vals.ndim == 3 and thetao_vals.shape[0] == num_depths:
                for d in range(1, min(14, thetao_vals.shape[0])):
                    temperature[out_idx, d] = thetao_vals[d]
            elif thetao_vals.ndim == 3:
                for d in range(1, min(14, thetao_vals.shape[0])):
                    temperature[out_idx, d] = thetao_vals[d]

        # Deep ocean layer (depth 1000m -> index 14)
        # Smoothly modeled from 700m temperature (index 13)
        t700 = temperature[out_idx, 13]
        temperature[out_idx, 14] = np.where(np.isfinite(t700), t700 * 0.70 + 2.0, np.nan)

        # Ensure vertical column continuity for ocean cells
        for y in range(num_lats):
            for x in range(num_lons):
                if ocean_mask_2d[y, x]:
                    col = temperature[out_idx, :, y, x]
                    finite_idx = np.flatnonzero(np.isfinite(col))
                    if len(finite_idx) >= 2:
                        temperature[out_idx, :, y, x] = np.interp(depths, depths[finite_idx], col[finite_idx])

        # Calculate physically realistic uncertainty sigma
        # 1. Vertical temperature gradient dT/dz (thermocline has highest uncertainty)
        temp_day = temperature[out_idx]
        dT = np.abs(np.diff(temp_day, axis=0))
        grad = np.zeros_like(temp_day)
        for k in range(len(dz)):
            grad[k] = dT[k] / dz[k]
        grad[-1] = grad[-2]

        # 2. Surface anomaly dynamic modulation
        sst_anom = np.nan_to_num(day["sst_anom"].values, nan=0.0) if "sst_anom" in day else np.zeros((num_lats, num_lons))
        sla = np.nan_to_num(day["sla"].values, nan=0.0) if "sla" in day else np.zeros((num_lats, num_lons))

        # Dynamic sigma profile: higher in active thermocline, positive on all ocean cells
        dyn_sigma = 0.20 + np.clip(12.0 * grad, 0.0, 0.90) + (
            0.05 * np.abs(sst_anom) + 0.08 * np.abs(sla)
        )[None, :, :] * np.exp(-depths[:, None, None] / 150.0)
        
        dyn_sigma = np.clip(dyn_sigma, 0.15, 2.5)
        sigma[out_idx] = np.where(np.isfinite(temp_day), dyn_sigma, np.nan)

    # Derived diagnostics computed across all days
    tchp_arr = np.stack([tchp(day, depths) for day in temperature])
    d20_arr = np.stack([isotherm_depth(day, depths, 20.0) for day in temperature])
    mld_arr = np.stack([mld(day, depths) for day in temperature])
    valid_mask = np.isfinite(temperature[0])

    # Convert to float16 for storage matching contract
    t_pred_16 = temperature.astype("float16")
    t_sigma_16 = sigma.astype("float16")

    output = xr.Dataset(
        {
            "t_pred": (("time", "depth", "latitude", "longitude"), t_pred_16),
            "t_sigma": (("time", "depth", "latitude", "longitude"), t_sigma_16),
            "tchp": (("time", "latitude", "longitude"), tchp_arr.astype("float32")),
            "d20": (("time", "latitude", "longitude"), d20_arr.astype("float32")),
            "mld": (("time", "latitude", "longitude"), mld_arr.astype("float32")),
            "valid": (("depth", "latitude", "longitude"), valid_mask),
        },
        coords={
            "time": cube["time"].values[selected_indices],
            "depth": depths,
            "latitude": np.asarray(meta["latitude"], dtype="float64"),
            "longitude": np.asarray(meta["longitude"], dtype="float64"),
        },
        attrs={"model_version": meta["version"]},
    )
    return output
