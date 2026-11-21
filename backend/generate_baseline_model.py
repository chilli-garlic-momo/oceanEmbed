"""Export a TorchScript baseline model that conforms to the OceanEmbed Model Contract.

This scripted model satisfies all acceptance criteria in acceptance_test.py and allows
evaluating the full pipeline end-to-end even before a trained deep learning model is provided.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import xarray as xr


class OceanEmbedBaselineModule(nn.Module):
    """Physics-informed ocean temperature vertical stratification baseline model."""

    def __init__(self, valid_mask: np.ndarray, depths: np.ndarray) -> None:
        super().__init__()
        # Register valid mask buffer: (1, 15, 100, 240)
        self.register_buffer("valid_mask", torch.from_numpy(valid_mask).unsqueeze(0))
        # Register depth levels buffer: (1, 15, 1, 1)
        self.register_buffer("depths", torch.from_numpy(depths).view(1, -1, 1, 1))

        self.t_deep = 4.5
        self.z0 = 160.0

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """Forward pass taking raw 19-channel input planes.

        Input x: (B, 19, 100, 240)
        Output:
            temp: (B, 15, 100, 240) temperature in degC (land masked as NaN)
            sigma: (B, 15, 100, 240) uncertainty in degC (land masked as NaN)
        """
        # Channel 0: SST, Channel 1: SST_anom, Channel 6: SLA
        sst_raw = x[:, 0:1, :, :]
        sst = torch.nan_to_num(sst_raw, nan=28.0)
        sst = torch.clamp(sst, min=15.0, max=35.0)

        sst_anom = torch.nan_to_num(x[:, 1:2, :, :], nan=0.0)
        sla = torch.nan_to_num(x[:, 6:7, :, :], nan=0.0)

        # Vertical thermocline decay profile
        z = self.depths
        decay = torch.exp(-torch.pow(z / self.z0, 0.95))

        # Thermocline modulation factor by SLA (deepening/shoaling) and SST anomaly
        sla_factor = 15.0 * sla * torch.exp(-torch.pow((z - 120.0) / 70.0, 2.0))
        anom_factor = sst_anom * torch.exp(-z / 80.0)

        # Temperature profile: T(z) = T_deep + (SST - T_deep) * decay + perturbations
        temp = self.t_deep + (sst - self.t_deep) * decay + sla_factor + anom_factor
        temp = torch.clamp(temp, min=1.0, max=35.0)

        # Physically realistic uncertainty sigma(z) (higher in thermocline ~100m)
        sigma_base = 0.25 + 0.65 * torch.exp(-torch.pow((z - 100.0) / 60.0, 2.0))
        sigma_dyn = 0.08 * torch.abs(sst_anom) + 0.15 * torch.abs(sla)
        sigma = sigma_base + sigma_dyn
        sigma = torch.clamp(sigma, min=0.1, max=3.0)

        # Apply valid ocean mask (land cells -> NaN)
        nan_val = float("nan")
        temp = torch.where(self.valid_mask, temp, torch.tensor(nan_val, device=temp.device))
        sigma = torch.where(self.valid_mask, sigma, torch.tensor(nan_val, device=sigma.device))

        return temp, sigma


def export_baseline_model(
    cube_path: Path = Path("data/oceanembed_cube.zarr"),
    output_path: Path = Path("data/oceanembed_baseline_model.pt"),
) -> None:
    cube = xr.open_zarr(cube_path)
    valid_np = np.asarray(cube["valid"].values, dtype=bool)
    depths_np = np.asarray(cube["depth"].values, dtype="float32")

    model = OceanEmbedBaselineModule(valid_np, depths_np)
    model.eval()

    scripted = torch.jit.script(model)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    scripted.save(str(output_path))
    print(f"Exported TorchScript baseline model to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export OceanEmbed TorchScript baseline model.")
    parser.add_argument("--cube", type=Path, default=Path("data/oceanembed_cube.zarr"))
    parser.add_argument("--output", type=Path, default=Path("data/oceanembed_baseline_model.pt"))
    args = parser.parse_args()
    export_baseline_model(args.cube, args.output)
