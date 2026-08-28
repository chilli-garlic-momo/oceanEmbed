"""Shared masked-profile diagnostics used by precompute and evaluation."""

from __future__ import annotations

import numpy as np


def isotherm_depth(T: np.ndarray, z: np.ndarray, t_iso: float = 20.0) -> np.ndarray:
    """Depth of the shallowest isotherm crossing; NaN means no crossing exists."""
    out = np.full(T.shape[1:], np.nan, "float32")
    for k in range(len(z) - 1):
        t0, t1 = T[k], T[k + 1]
        hit = np.isnan(out) & np.isfinite(t0) & np.isfinite(t1) & (t0 >= t_iso) & (t1 < t_iso)
        fraction = (t0[hit] - t_iso) / (t0[hit] - t1[hit])
        out[hit] = z[k] + fraction * (z[k + 1] - z[k])
    return out


def tchp(T: np.ndarray, z: np.ndarray, rho: float = 1026.0, cp: float = 3985.0) -> np.ndarray:
    """Tropical Cyclone Heat Potential in kJ/cm² for a masked profile."""
    d26 = isotherm_depth(T, z, 26.0)
    integ = np.zeros(T.shape[1:], "float32")
    for k in range(len(z) - 1):
        dz = z[k + 1] - z[k]
        top = np.clip(d26 - z[k], 0.0, dz)
        a = np.nan_to_num(T[k] - 26.0)
        slope = (np.nan_to_num(T[k + 1] - 26.0) - a) / dz
        integ += top * a + 0.5 * slope * top**2
    out = (rho * cp * integ * 1e-7).astype("float32")
    out[np.isfinite(T[0]) & (T[0] < 26.0)] = 0.0
    out[~np.isfinite(T[0])] = np.nan
    return out


def mld(T: np.ndarray, z: np.ndarray, delta: float = 0.2, z_ref: float = 10.0) -> np.ndarray:
    """Temperature-threshold mixed layer depth; NaN means no crossing was found."""
    reference_index = int(np.argmin(np.abs(np.asarray(z) - z_ref)))
    threshold = T[reference_index] - delta
    out = np.full(T.shape[1:], np.nan, "float32")
    for k in range(reference_index, len(z) - 1):
        t0, t1 = T[k], T[k + 1]
        hit = np.isnan(out) & np.isfinite(t0) & np.isfinite(t1) & (t0 >= threshold) & (t1 < threshold)
        fraction = (t0[hit] - threshold[hit]) / (t0[hit] - t1[hit])
        out[hit] = z[k] + fraction * (z[k + 1] - z[k])
    return out
