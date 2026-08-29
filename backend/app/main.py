from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, Callable

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .store import PredictionStore, StoreUnavailable


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.store = None
    app.state.unavailable_reason = None
    try:
        app.state.store = PredictionStore(settings.meta_path, settings.store_url)
    except Exception as exc:  # Do not serve corrupted, mismatched, or invented data.
        app.state.unavailable_reason = str(exc)
    yield


app = FastAPI(title="OceanEmbed API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def get_store(request: Request) -> PredictionStore:
    store = request.app.state.store
    if store is None:
        raise HTTPException(
            status_code=503,
            detail={"error": "prediction store unavailable", "reason": request.app.state.unavailable_reason},
        )
    return store


def translate_errors(operation: Callable[[], dict[str, Any]]) -> dict[str, Any]:
    try:
        return operation()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except StoreUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/health")
def health(request: Request) -> dict[str, Any]:
    store = request.app.state.store
    if store is None:
        raise HTTPException(
            status_code=503,
            detail={"status": "unavailable", "reason": request.app.state.unavailable_reason},
        )
    return {
        "status": "ok",
        "model_version": store.model_version,
        "store_version": store.store_version,
        "days_available": store.available_range,
    }


@app.get("/profile")
def profile(lat: float, lon: float, date: str, request: Request) -> dict[str, Any]:
    return translate_errors(lambda: get_store(request).profile(lat, lon, date))


@app.get("/field")
def field(depth: float, date: str, request: Request) -> dict[str, Any]:
    return translate_errors(lambda: get_store(request).field(depth, date))


@app.get("/tchp")
def tchp(date: str, request: Request) -> dict[str, Any]:
    return translate_errors(lambda: get_store(request).tchp(date))


@app.get("/d20")
def d20(date: str, request: Request) -> dict[str, Any]:
    return translate_errors(lambda: get_store(request).d20(date))


@app.get("/mld")
def mld(date: str, request: Request) -> dict[str, Any]:
    return translate_errors(lambda: get_store(request).mld(date))

