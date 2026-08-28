# OceanEmbed

This repository has two independent applications:

- `frontend/` — the Vite/React map interface.
- `backend/` — the FastAPI service for the precomputed OceanEmbed prediction store.

The backend is implemented to the supplied Model ↔ Backend Contract. It serves only precomputed output, preserves masked values as JSON `null`, does not normalise inputs, and does not run the model per request.

## Run the frontend

```powershell
cd frontend
npm run dev
```

To use the backend instead of the mock client, set `VITE_API_BASE_URL`, for example in `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Run the backend

Provide the model team's `oceanembed_meta.json` and a matching precomputed Zarr store. The model file is only required for `precompute.py` and `acceptance_test.py`; the API itself reads the metadata and store.

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Set `OCEANEMBED_META_PATH` and `OCEANEMBED_STORE_URL` in `backend/.env`. The store may be a local Zarr directory or a remote fsspec-compatible URL. The API returns `503` until both artefacts are readable and their versions match.

## Precompute and model validation

```powershell
cd backend
python acceptance_test.py --model path\to\oceanembed_model.pt --meta path\to\oceanembed_meta.json
python precompute.py --model path\to\oceanembed_model.pt --meta path\to\oceanembed_meta.json --cube path\to\oceanembed_cube.zarr --output data\oceanembed_pred_2020.zarr --year 2020
```
