from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
import xarray as xr

from app.derived import isotherm_depth, mld, tchp
from app.input_builder import build_input_day


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Precompute an OceanEmbed prediction Zarr store.")
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--meta", type=Path, required=True)
    parser.add_argument("--cube", required=True, help="Input oceanembed_cube.zarr URL or path")
    parser.add_argument("--output", required=True, help="Output prediction Zarr path")
    parser.add_argument("--year", type=int, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    meta = json.loads(args.meta.read_text(encoding="utf-8"))
    if len(meta["input_vars"]) != 19 or len(meta["depths_m"]) != 15:
        raise ValueError("metadata does not meet the OceanEmbed v1 19-channel / 15-depth contract")
    cube = xr.open_zarr(args.cube)
    model = torch.jit.load(str(args.model), map_location="cpu")
    selected = np.flatnonzero(cube["time"].dt.year.isin([args.year]).values)
    if not len(selected):
        raise ValueError(f"cube contains no dates for {args.year}")

    depths = np.asarray(meta["depths_m"], dtype="float32")
    temperature = np.empty((len(selected), 15, 100, 240), dtype="float16")
    sigma = np.empty_like(temperature)
    for output_index, source_index in enumerate(selected):
        # No normalisation, reordering, interpolation, or NaN filling.
        inputs = torch.from_numpy(build_input_day(cube, int(source_index), meta))
        temp, uncertainty = model(inputs)
        temperature[output_index] = temp[0].cpu().numpy()
        sigma[output_index] = uncertainty[0].cpu().numpy()

    temperature32 = temperature.astype("float32")
    output = xr.Dataset(
        {
            "t_pred": (("time", "depth", "latitude", "longitude"), temperature),
            "t_sigma": (("time", "depth", "latitude", "longitude"), sigma),
            "tchp": (("time", "latitude", "longitude"), np.stack([tchp(day, depths) for day in temperature32])),
            "d20": (("time", "latitude", "longitude"), np.stack([isotherm_depth(day, depths, 20.0) for day in temperature32])),
            "mld": (("time", "latitude", "longitude"), np.stack([mld(day, depths) for day in temperature32])),
            "valid": (("depth", "latitude", "longitude"), np.isfinite(temperature[0])),
        },
        coords={
            "time": cube["time"].values[selected],
            "depth": depths,
            "latitude": np.asarray(meta["latitude"]),
            "longitude": np.asarray(meta["longitude"]),
        },
        attrs={"model_version": meta["version"]},
    )
    encoding = {
        "t_pred": {"chunks": (1, 15, 100, 240)},
        "t_sigma": {"chunks": (1, 15, 100, 240)},
        "tchp": {"chunks": (1, 100, 240)},
        "d20": {"chunks": (1, 100, 240)},
        "mld": {"chunks": (1, 100, 240)},
        "valid": {"chunks": (15, 100, 240)},
    }
    output.to_zarr(args.output, mode="w", consolidated=True, encoding=encoding)


if __name__ == "__main__":
    main()
