# 🌊 OceanEmbed

> **Physics-Informed Subsurface Ocean Temperature & Tropical Cyclone Heat Potential (TCHP) Engine** for the North Indian Ocean (Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean).

---

## 📌 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [End-to-End Setup & Run Guide](#-end-to-end-setup--run-guide)
  - [1. Dataset Download (Kaggle)](#1-dataset-download-kaggle)
  - [2. Backend Setup & Precomputation](#2-backend-setup--precomputation)
  - [3. Frontend Setup & Run](#3-frontend-setup--run)
- [How Predictions Work](#-how-predictions-work)
  - [A. Dataset-Grounded Realistic Baseline](#a-dataset-grounded-realistic-baseline)
  - [B. Switching to a Trained ML Model](#b-switching-to-a-trained-ml-model)
- [API Reference](#-api-reference)
- [Automated Testing & Validation](#-automated-testing--validation)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏗 Architecture Overview

The repository consists of two decoupled components communicating over a REST API:

1. **`backend/` (FastAPI + Zarr + Xarray + PyTorch)**:
   - High-performance, low-latency prediction store server complying with the OceanEmbed Model ↔ Backend Contract.
   - Reads precomputed multi-dimensional Zarr prediction stores with sub-15ms query response times.
   - Preserves masked land values as JSON `null`.
   - Supports both dataset-grounded physics inference and PyTorch TorchScript model inference.

2. **`frontend/` (Vite + React + Leaflet + Chart.js)**:
   - Interactive GIS map visualization for horizontal 2D basin fields (SST, subsurface depth temperature slices, and TCHP).
   - Dynamic vertical profile inspection chart with depth-resolved temperature curves and uncertainty bounds ($\pm \sigma$).
   - Dual operating mode: runs standalone with internal simulator or connects to the live FastAPI backend.

---

## ⚙ Prerequisites

Before starting, ensure you have installed:
- **Python**: `3.10` or higher (`3.11` / `3.12` / `3.13` supported)
- **Node.js**: `18.x` or higher (with `npm`)
- **Git**
- *(Optional)* **Kaggle CLI** for automated dataset downloads (`pip install kaggle`)

---

## 🚀 End-to-End Setup & Run Guide

### 1. Dataset Download (Kaggle)

The prototype and model precomputation pipeline use the OceanEmbed V2 source dataset cube:
* 📥 **Kaggle Dataset**: [chilligarlicmomo/oceanembeddataset](https://www.kaggle.com/datasets/chilligarlicmomo/oceanembeddataset)

#### Option A: Manual Download via Browser
1. Download the archive from the [Kaggle Dataset Page](https://www.kaggle.com/datasets/chilligarlicmomo/oceanembeddataset).
2. Extract the `oceanembed_cube.zarr` folder into `backend/data/`:
   ```text
   backend/data/
     └── oceanembed_cube.zarr/
   ```

#### Option B: Automated Download via Kaggle CLI
```powershell
cd backend
kaggle datasets download -d chilligarlicmomo/oceanembeddataset -p data --unzip
```

---

### 2. Backend Setup & Precomputation

Open a terminal in the `backend/` directory:

```powershell
# 1. Navigate to backend
cd backend

# 2. Create and activate a Python virtual environment
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# (On macOS/Linux: source .venv/bin/activate)

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate the contract metadata file (data/oceanembed_meta.json)
python generate_meta.py

# 5. Precompute realistic predictions for year 2020 from the dataset
python precompute.py --cube data/oceanembed_cube.zarr --meta data/oceanembed_meta.json --output data/oceanembed_pred_2020.zarr --year 2020

# 6. Configure environment variables
Copy-Item .env.example .env

# 7. Start the FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

✅ **The backend is now live at:** `http://127.0.0.1:8000`  
Check status in your browser or curl: `http://127.0.0.1:8000/health`

---

### 3. Frontend Setup & Run

Open a **second terminal** in the `frontend/` directory:

```powershell
# 1. Navigate to frontend
cd frontend

# 2. Install JavaScript packages
npm install

# 3. (Optional) Point the frontend to the live backend
# Create frontend/.env.local with the backend URL:
Set-Content -Path .env.local -Value "VITE_API_BASE_URL=http://127.0.0.1:8000"

# 4. Start the Vite development server
npm run dev
```

✅ **The web interface is now running at:** `http://localhost:5173`

Open `http://localhost:5173` in your browser. You can click anywhere on the ocean to view subsurface temperature profiles, scrub through dates, or toggle between TCHP and temperature depth slices.

---

## 🧠 How Predictions Work

### A. Dataset-Grounded Realistic Baseline
When no trained machine learning model is available, the backend avoids random or hardcoded numbers by utilizing a dataset-driven physics engine (`app/predictor.py`):
1. **Vertical Thermal Stratification**: Extracts real potential ocean temperatures from `thetao` and `sst` across all 15 depth layers ($0\,\text{m}, 5\,\text{m}, 10\,\text{m}, 20\,\text{m}, 30\,\text{m}, 50\,\text{m}, 75\,\text{m}, 100\,\text{m}, 125\,\text{m}, 150\,\text{m}, 200\,\text{m}, 300\,\text{m}, 500\,\text{m}, 700\,\text{m}, 1000\,\text{m}$).
2. **Dynamic Uncertainty ($\sigma$)**: Dynamically models prediction standard deviation $\sigma(z, y, x, t)$ from the vertical thermocline temperature gradient $|\partial T / \partial z|$ and surface anomalies ($|SST_{anom}|$ and $|SLA|$). Peak uncertainty occurs in the active thermocline ($50-200\,\text{m}$), with lower uncertainty in the mixed layer and deep abyss.
3. **Ocean Diagnostics**: Calculates Tropical Cyclone Heat Potential (`tchp`), $20^\circ\text{C}$ isotherm depth (`d20`), Mixed Layer Depth (`mld`), and land masks (`valid`).

### B. Switching to a Trained ML Model
As soon as your team trains or downloads a PyTorch TorchScript model (`.pt`):

```powershell
cd backend

# Step 1: Validate that the model conforms to the 19-channel / 15-depth contract
python acceptance_test.py --model path\to\oceanembed_model.pt --meta data\oceanembed_meta.json

# Step 2: Precompute predictions using the model
python precompute.py --model path\to\oceanembed_model.pt --meta data\oceanembed_meta.json --cube data\oceanembed_cube.zarr --output data\oceanembed_pred_2020.zarr --year 2020

# Step 3: Restart the backend (No frontend or API code changes required!)
uvicorn app.main:app --reload
```

---

## 📡 API Reference

All endpoints return JSON and preserve land cells as `null`.

| Endpoint | Method | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | *None* | Health status, model version, store version, and available date range. |
| `/profile` | `GET` | `lat` (float), `lon` (float), `date` (YYYY-MM-DD) | Vertical temperature profile (15 depths), $\sigma$, TCHP, D20, and MLD. |
| `/field` | `GET` | `depth` (float), `date` (YYYY-MM-DD) | $100 \times 240$ 2D temperature raster grid for the selected depth. |
| `/tchp` | `GET` | `date` (YYYY-MM-DD) | $100 \times 240$ 2D Tropical Cyclone Heat Potential ($kJ/\text{cm}^2$) raster grid. |

#### Example Profile Query:
```bash
curl "http://127.0.0.1:8000/profile?lat=15.0&lon=85.0&date=2020-05-15"
```
**Response:**
```json
{
  "lat": 14.875,
  "lon": 84.875,
  "date": "2020-05-15",
  "depths_m": [0.0, 5.0, 10.0, 20.0, 30.0, 50.0, 75.0, 100.0, 125.0, 150.0, 200.0, 300.0, 500.0, 700.0, 1000.0],
  "temperature_degC": [31.31, 31.05, 30.72, 29.85, 28.60, 26.42, 24.80, 23.53, 21.40, 19.20, 15.10, 12.05, 9.80, 8.50, 7.97],
  "sigma_degC": [0.80, 0.82, 0.85, 0.95, 1.05, 1.18, 1.15, 1.12, 1.02, 0.90, 0.65, 0.45, 0.30, 0.25, 0.20],
  "tchp_kJ_cm2": 112.81,
  "d20_m": 124.48,
  "mld_m": 21.95,
  "model_version": "oceanembed-v1-baseline",
  "in_training_set": true
}
```

---

## 🧪 Automated Testing & Validation

Run the complete backend test suite:
```powershell
cd backend
pytest
```
*Executes all 11 unit and API integration tests in `backend/tests/`.*

Validate a baseline model artefact:
```powershell
python generate_baseline_model.py
python acceptance_test.py --model data/oceanembed_baseline_model.pt --meta data/oceanembed_meta.json
```

---

## 📂 Project Directory Structure

```text
oceanEmbed/
├── README.md                      # End-to-end project guide (this document)
├── PROTOTYPE_ARCHITECTURE.md      # Detailed prediction & architecture deep-dive
├── .gitignore                     # Git rules (excludes data, models, virtualenvs)
│
├── backend/                       # FastAPI Service
│   ├── .env.example               # Template environment configuration
│   ├── .env                       # Active environment configuration
│   ├── requirements.txt           # Python dependencies
│   ├── acceptance_test.py         # Model contract validation script
│   ├── precompute.py              # Prediction Zarr precomputation pipeline
│   ├── generate_meta.py           # Metadata JSON generator
│   ├── generate_baseline_model.py # TorchScript baseline exporter
│   │
│   ├── app/
│   │   ├── main.py                # FastAPI endpoints & CORS configuration
│   │   ├── config.py              # Environment settings loader
│   │   ├── store.py               # Zarr PredictionStore data access layer
│   │   ├── predictor.py           # Dataset-grounded realistic prediction engine
│   │   ├── derived.py             # Vectorized TCHP, D20, and MLD diagnostics
│   │   └── input_builder.py       # 19-channel raw input tensor builder
│   │
│   ├── data/                      # Data storage (git-ignored)
│   │   ├── oceanembed_cube.zarr/  # Downloaded source dataset cube (Kaggle)
│   │   ├── oceanembed_meta.json   # Generated contract metadata
│   │   └── oceanembed_pred_2020.zarr/ # Precomputed prediction Zarr store
│   │
│   └── tests/                     # Automated test suite
│       ├── test_api.py            # API endpoint integration tests
│       └── test_derived.py        # Physical diagnostic unit tests
│
└── frontend/                      # Vite + React Interface
    ├── package.json               # Node dependencies & scripts
    ├── vite.config.js             # Vite configuration
    ├── index.html                 # HTML shell
    └── src/
        ├── App.jsx                # Main interface application
        ├── services/api.js        # API service layer (live backend / mock toggle)
        ├── components/            # UI components (MapView, Profile, Timeline, etc.)
        └── data/                  # Mock simulator & ARGO float coordinates
```

---

## ❓ Troubleshooting & FAQs

#### Q: The backend returns `503 Service Unavailable` on startup.
- **Cause**: Either `data/oceanembed_meta.json` or `data/oceanembed_pred_2020.zarr` is missing, or their `model_version` values do not match.
- **Solution**: Run `python generate_meta.py` followed by `python precompute.py --cube data/oceanembed_cube.zarr --meta data/oceanembed_meta.json --output data/oceanembed_pred_2020.zarr --year 2020`.

#### Q: How do I switch the frontend between standalone mock mode and live backend mode?
- **Live Backend**: Set `VITE_API_BASE_URL=http://127.0.0.1:8000` in `frontend/.env.local` and restart the Vite server (`npm run dev`).
- **Standalone Mock**: Remove `VITE_API_BASE_URL` from `frontend/.env.local` (or leave it empty).

#### Q: PowerShell script activation error (`Activate.ps1 cannot be loaded`).
- Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell window before activating the virtual environment.
