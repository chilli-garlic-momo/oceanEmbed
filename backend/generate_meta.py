"""Generate metadata JSON file matching oceanembed_cube.zarr coordinates and contract."""

from __future__ import annotations

import json
from pathlib import Path

import xarray as xr


def generate_metadata(
    cube_path: Path = Path("data/oceanembed_cube.zarr"),
    output_path: Path = Path("data/oceanembed_meta.json"),
    version: str = "oceanembed-v1-baseline",
) -> None:
    cube = xr.open_zarr(cube_path)
    input_vars = [
        "sst",
        "sst_anom",
        "sst_lag3",
        "sst_lag7",
        "sst_model",
        "adt",
        "sla",
        "sla_anom",
        "sla_lag3",
        "sla_lag7",
        "ugos",
        "vgos",
        "eastward_wind",
        "northward_wind",
        "so",
        "zos",
        "doy_sin",
        "doy_cos",
        "bathy_proxy",
    ]

    meta = {
        "version": version,
        "description": "OceanEmbed Subsurface Ocean Temperature & Heat Potential Model Metadata",
        "depths_m": [float(d) for d in cube.depth.values],
        "latitude": [float(lat) for lat in cube.latitude.values],
        "longitude": [float(lon) for lon in cube.longitude.values],
        "input_vars": input_vars,
        "split": {
            "train": [2015, 2016, 2017, 2018, 2019, 2020],
            "val": [2021],
        },
        "units": {
            "temperature": "degC",
            "depth": "m",
            "latitude": "degrees_north",
            "longitude": "degrees_east",
            "tchp": "kJ/cm2",
            "d20": "m",
            "mld": "m",
            "sigma": "degC",
        },
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"Generated {output_path} with version '{version}' ({len(meta['depths_m'])} depths, {len(meta['latitude'])}x{len(meta['longitude'])} grid)")


if __name__ == "__main__":
    generate_metadata()
