"""End-to-end check of 04_train.py against a synthetic cube with the real schema."""
import importlib.util, os, shutil, sys
import numpy as np, pandas as pd, xarray as xr

OUT = "/tmp/e2e"; shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)

t = pd.date_range("2015-01-01", "2017-12-31", freq="D")
lat = np.arange(5.125, 10.0, 0.25); lon = np.arange(45.125, 51.0, 0.25)
dep = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]
nt, nla, nlo, nd = len(t), len(lat), len(lon), len(dep)
rng = np.random.default_rng(1)

doy = t.dayofyear.values
seas = np.sin(2 * np.pi * doy / 365.25)[:, None, None]
sst = 28 + 2 * seas + 0.3 * rng.standard_normal((nt, nla, nlo))
sla = 0.05 * seas + 0.05 * rng.standard_normal((nt, nla, nlo))

# below-bottom NaNs on part of the grid, exactly like the real cube
prof = np.array([28, 28, 27.8, 27, 26, 22, 18, 15, 13, 12, 10, 8, 6, 4, 3.5], "f4")
thetao = (prof[None, :, None, None] + (sst - 28)[:, None] * np.linspace(1, 0, nd)[None, :, None, None]
          + 0.05 * rng.standard_normal((nt, nd, nla, nlo))).astype("f4")
shelf = np.zeros((nla, nlo), bool); shelf[:4] = True          # shallow strip
land = np.zeros((nla, nlo), bool); land[:, :2] = True         # land strip
for k in range(nd):
    bad = land | (shelf & (dep[k] > 150))
    thetao[:, k, bad] = np.nan

d3 = lambda a: (("time", "latitude", "longitude"), a.astype("f4"))
ds = xr.Dataset(
    {
        "thetao": (("time", "depth", "latitude", "longitude"), thetao),
        "sst": d3(np.where(land, np.nan, sst)),
        "sos": d3(35 + 0.5 * rng.standard_normal((nt, nla, nlo))),
        "sla": d3(sla), "adt": d3(sla + 0.5),
        "ugos": d3(0.2 * rng.standard_normal((nt, nla, nlo))),
        "vgos": d3(0.2 * rng.standard_normal((nt, nla, nlo))),
        "eastward_wind": d3(rng.standard_normal((nt, nla, nlo))),
        "northward_wind": d3(rng.standard_normal((nt, nla, nlo))),
        "sst_model": d3(sst + 0.1), "so": d3(35.1 + 0.5 * rng.standard_normal((nt, nla, nlo))),
        "zos": d3(sla + 0.02), "uo": d3(0.2 * rng.standard_normal((nt, nla, nlo))),
        "vo": d3(0.2 * rng.standard_normal((nt, nla, nlo))),
        "sst_anom": d3(sst - sst.mean(0)), "sla_anom": d3(sla - sla.mean(0)),
        "sst_lag3": d3(np.roll(sst, 3, 0)), "sst_lag7": d3(np.roll(sst, 7, 0)),
        "sla_lag3": d3(np.roll(sla, 3, 0)), "sla_lag7": d3(np.roll(sla, 7, 0)),
        "valid": (("depth", "latitude", "longitude"), np.isfinite(thetao[0])),
        "bathy_proxy": (("latitude", "longitude"), np.isfinite(thetao[0]).mean(0).astype("f4")),
        "lat_norm": (("latitude", "longitude"), np.broadcast_to(((lat - 5) / 25)[:, None], (nla, nlo)).astype("f4")),
        "lon_norm": (("latitude", "longitude"), np.broadcast_to(((lon - 45) / 60)[None], (nla, nlo)).astype("f4")),
        "doy_sin": ("time", np.sin(2 * np.pi * doy / 365.25).astype("f4")),
        "doy_cos": ("time", np.cos(2 * np.pi * doy / 365.25).astype("f4")),
    },
    coords={"time": t, "depth": dep, "latitude": lat, "longitude": lon},
)
cube = f"{OUT}/input/fake/oceanembed_cube.zarr"
os.makedirs(os.path.dirname(cube), exist_ok=True)
ds.to_zarr(cube, mode="w", consolidated=True)
print("synthetic cube written")

spec = importlib.util.spec_from_file_location("tr", "/home/claude/04_train.py")
tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)
tr.OUT = f"{OUT}/working"; os.makedirs(tr.OUT)
tr.CUBE_GLOB = f"{OUT}/input/**/*.zarr"
tr.TEST_YEARS = [2017]
tr.VAL_YEARS = [2016]
tr.CASE_STUDY_WINDOWS = [("2015-05-01", "2015-06-15")]
tr.EPOCHS = {"A": 2, "B": 2, "scratch": 2}
tr.BASE_WIDTH = 8
tr.main()

import json
m = json.load(open(f"{tr.OUT}/oceanembed_meta.json"))
assert m["depths_m"] == dep and len(m["input_vars"]) == 19
import torch
mdl = torch.jit.load(f"{tr.OUT}/oceanembed_model.pt")
raw = torch.from_numpy(np.stack([ds[v].isel(time=100).values if ds[v].ndim == 3 else
                                 (np.broadcast_to(ds[v].values, (nla, nlo)) if ds[v].ndim == 2 else
                                  np.full((nla, nlo), float(ds[v].isel(time=100))))
                                 for v in m["input_vars"]])[None]).float()
T, S = mdl(raw)
print("inference:", T.shape, "NaN cells:", int(torch.isnan(T).sum()),
      "T range:", float(torch.nanquantile(T.flatten(), 0.01)), float(torch.nanquantile(T.flatten(), 0.99)))
assert T.shape == (1, 15, nla, nlo) and (S[~torch.isnan(S)] > 0).all()
print("E2E OK")