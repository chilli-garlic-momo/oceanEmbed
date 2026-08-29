from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
import xarray as xr

from app.derived import isotherm_depth, mld, tchp
from app.input_builder import build_input_day
from app.predictor import generate_dataset_predictions


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Precompute an OceanEmbed prediction Zarr store from a model or directly from the dataset."
    )
    parser.add_argument(
        "--model",
        type=Path,
        default=None,
        help="Optional path to PyTorch TorchScript model (.pt). If omitted, uses dataset-grounded realistic predictions.",
    )
    parser.add_argument(
        "--mode",
        choices=["auto", "model", "dataset"],
        default="auto",
        help="Execution mode: 'model' (run PyTorch inference), 'dataset' (derive from dataset observations), or 'auto'.",
    )
    parser.add_argument(
        "--meta",
        type=Path,
        default=Path("data/oceanembed_meta.json"),
        help="Path to oceanembed_meta.json metadata file.",
    )
    parser.add_argument(
        "--cube",
        default="data/oceanembed_cube.zarr",
        help="Input oceanembed_cube.zarr URL or local path.",
    )
    parser.add_argument(
        "--output",
        default="data/oceanembed_pred_2020.zarr",
        help="Output prediction Zarr path.",
    )
    parser.add_argument(
        "--year",
        type=int,
        default=2020,
        help="Target year to precompute (default: 2020).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    meta_path = Path(args.meta)
    if not meta_path.is_file():
        raise FileNotFoundError(f"Metadata file not found at {meta_path}. Run generate_meta.py first.")

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    if len(meta.get("input_vars", [])) != 19 or len(meta.get("depths_m", [])) != 15:
        raise ValueError("Metadata does not meet the OceanEmbed v1 19-channel / 15-depth contract")

    cube = xr.open_zarr(args.cube)
    selected = np.flatnonzero(cube["time"].dt.year.isin([args.year]).values)
    if not len(selected):
        raise ValueError(f"Cube contains no dates for year {args.year}")

    # Determine mode
    mode = args.mode
    if mode == "auto":
        mode = "model" if (args.model is not None and Path(args.model).is_file()) else "dataset"

    depths = np.asarray(meta["depths_m"], dtype="float32")

    if mode == "model":
        if args.model is None or not Path(args.model).is_file():
            raise FileNotFoundError(f"Model file not found at {args.model}")
        print(f"Precomputing predictions for {args.year} ({len(selected)} days) using Model: {args.model}...")
        model = torch.jit.load(str(args.model), map_location="cpu")
        model.eval()

        temperature = np.empty((len(selected), 15, 100, 240), dtype="float16")
        sigma = np.empty_like(temperature)
        for output_index, source_index in enumerate(selected):
            inputs = torch.from_numpy(build_input_day(cube, int(source_index), meta))
            with torch.no_grad():
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
                "latitude": np.asarray(meta["latitude"], dtype="float64"),
                "longitude": np.asarray(meta["longitude"], dtype="float64"),
            },
            attrs={"model_version": meta["version"]},
        )
    else:
        print(f"Precomputing predictions for {args.year} ({len(selected)} days) using Dataset Baseline Engine...")
        output = generate_dataset_predictions(cube, meta, selected)

    encoding = {
        "t_pred": {"chunks": (1, 15, 100, 240)},
        "t_sigma": {"chunks": (1, 15, 100, 240)},
        "tchp": {"chunks": (1, 100, 240)},
        "d20": {"chunks": (1, 100, 240)},
        "mld": {"chunks": (1, 100, 240)},
        "valid": {"chunks": (15, 100, 240)},
    }
    output.to_zarr(args.output, mode="w", consolidated=True, encoding=encoding)
    print(f"Successfully saved prediction store to {args.output}")


if __name__ == "__main__":
    main()
