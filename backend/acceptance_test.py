from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate Role 2 OceanEmbed model artefacts.")
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--meta", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    meta = json.loads(args.meta.read_text(encoding="utf-8"))
    model = torch.jit.load(str(args.model), map_location="cpu")
    assert len(meta["input_vars"]) == 19
    assert len(meta["depths_m"]) == 15
    x = torch.randn(1, 19, len(meta["latitude"]), len(meta["longitude"]))
    temp, sigma = model(x)
    assert temp.shape == (1, 15, 100, 240) == sigma.shape
    assert torch.isnan(temp).any(), "no masked cells - the valid mask did not export"
    finite = temp[torch.isfinite(temp)]
    assert -3 < finite.min() and finite.max() < 40, "temperatures are not in Celsius"
    assert (sigma[torch.isfinite(sigma)] > 0).all(), "sigma must be positive"
    x2 = x.clone()
    x2[0, 0, 0, 0] = float("nan")
    assert torch.isfinite(model(x2)[0]).sum() > 0, "a single NaN input poisoned the field"
    print("model artefact OK")


if __name__ == "__main__":
    main()
