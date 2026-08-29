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

The backend serves precomputed prediction Zarr stores along with the model contract metadata. A realistic dataset-grounded prediction store (`data/oceanembed_pred_2020.zarr`) and metadata (`data/oceanembed_meta.json`) are already generated from the downloaded V2 source cube (`backend/data/oceanembed_cube.zarr`).

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000` with endpoints `/health`, `/profile`, `/field`, and `/tchp`.

## Precompute and Seamless Model Switching

The pipeline supports both **Dataset Baseline Mode** (uses real observations and physical dynamics from `oceanembed_cube.zarr`) and **Model Mode** (runs inference with any TorchScript `.pt` model checkpoint).

### 1. Generating Baseline Predictions (No Model Required)
```powershell
cd backend
# Precompute predictions directly from the dataset:
python precompute.py --cube data/oceanembed_cube.zarr --meta data/oceanembed_meta.json --output data/oceanembed_pred_2020.zarr --year 2020
```

### 2. Switching to a Trained ML Model
As soon as you download or export your trained ML model:
1. **Validate Model Contract**:
   ```powershell
   python acceptance_test.py --model path\to\oceanembed_model.pt --meta data\oceanembed_meta.json
   ```
2. **Precompute Predictions with the Model**:
   ```powershell
   python precompute.py --model path\to\oceanembed_model.pt --meta data\oceanembed_meta.json --cube data\oceanembed_cube.zarr --output data\oceanembed_pred_2020.zarr --year 2020
   ```
3. **Restart the Backend** (or update `OCEANEMBED_STORE_URL` / `OCEANEMBED_META_PATH` in `backend/.env`). No frontend or API code changes required!

### 3. Running Automated Tests
```powershell
pytest
```

