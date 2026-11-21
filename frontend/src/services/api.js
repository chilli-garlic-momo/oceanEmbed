// OceanEmbed API Service Layer
// Clean abstraction ready to toggle between realistic engine and real backend
// Features resilient caching and fallback to prevent blank screens or visualization loss

import {
  computeOceanState,
  getSubsurfaceProfile,
  generateFieldGrid,
  AVAILABLE_DATES,
  isLand,
} from '../data/mock';
import { ARGO_FLOATS } from '../data/argoFloats';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = !API_BASE_URL;

// Ultra-snappy roundtrip for continuous 365-day scrubbing
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache for resilient fallbacks
let lastValidField = null;
let lastValidProfile = null;

function toMapField(payload, valueKey, layer, depth = null) {
  const latitude = payload.latitude;
  const longitude = payload.longitude;
  // Metadata coordinates are south-to-north; Leaflet's raster starts at its northern edge.
  // This only changes row order for display and never interpolates the native 100 × 240 grid.
  const grid = payload[valueKey].slice().reverse();
  return {
    layer,
    depth,
    date: payload.date,
    bounds: {
      minLat: latitude[0],
      maxLat: latitude[latitude.length - 1],
      minLon: longitude[0],
      maxLon: longitude[longitude.length - 1],
    },
    rows: latitude.length,
    cols: longitude.length,
    grid,
    modelVersion: payload.model_version,
  };
}

function toLegacyProfile(payload) {
  const profile = payload.depths_m.map((depth, index) => {
    const predictedTemp = payload.temperature_degC[index];
    const uncertainty = payload.sigma_degC[index];
    return {
      depth,
      predictedTemp,
      uncertainty,
      tempMin: predictedTemp === null || uncertainty === null ? null : predictedTemp - uncertainty,
      tempMax: predictedTemp === null || uncertainty === null ? null : predictedTemp + uncertainty,
      argoTemp: null,
    };
  });
  return {
    isLand: Boolean(payload.masked),
    lat: payload.lat,
    lon: payload.lon,
    date: payload.date,
    modelVersion: payload.model_version,
    inTrainingSet: payload.in_training_set,
    metrics: {
      tchp: payload.tchp_kJ_cm2,
      d20: payload.d20_m,
      mld: payload.mld_m,
      sst: payload.temperature_degC[0],
    },
    profile,
  };
}

/**
 * GET /profile?lat={lat}&lon={lon}&date={date}
 * Returns subsurface temperature profile, metrics, uncertainty bounds, and nearest ARGO float
 */
export async function getProfile({ lat, lon, date }) {
  if (USE_MOCK) {
    await delay(15);

    if (isLand(lat, lon)) {
      return {
        isLand: true,
        error: 'Selected point is over land. Click on an ocean basin (Bay of Bengal, Arabian Sea, Equatorial Indian Ocean).',
        lat,
        lon,
        date,
      };
    }

    try {
      const data = getSubsurfaceProfile(lat, lon, date);
      lastValidProfile = data;
      return data;
    } catch (err) {
      console.warn('Profile generation fallback to last valid state:', err);
      if (lastValidProfile) return lastValidProfile;
      throw err;
    }
  }

  try {
    const url = `${API_BASE_URL}/profile?lat=${lat}&lon=${lon}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Profile fetch failed with status: ${res.status}`);
    }
    const data = toLegacyProfile(await res.json());
    lastValidProfile = data;
    return data;
  } catch (err) {
    if (lastValidProfile) {
      console.warn('API error, showing previous valid profile:', err);
      return {
        ...lastValidProfile,
        warning: 'Unable to load live data. Showing the previous available profile.',
      };
    }
    throw err;
  }
}

/**
 * GET /field?layer={layer}&depth={depth}&date={date}
 * Returns 2D spatial grid array for North Indian Ocean
 */
export async function getField({ layer = 'tchp', depth = 0, date }) {
  if (USE_MOCK) {
    await delay(20);
    try {
      const data = generateFieldGrid(layer, depth, date);
      lastValidField = data;
      return data;
    } catch (err) {
      console.warn('Field generation fallback:', err);
      if (lastValidField) return lastValidField;
      throw err;
    }
  }

  try {
    let url;
    if (layer === 'tchp') {
      url = `${API_BASE_URL}/tchp?date=${encodeURIComponent(date)}`;
    } else if (layer === 'd20') {
      url = `${API_BASE_URL}/d20?date=${encodeURIComponent(date)}`;
    } else if (layer === 'mld') {
      url = `${API_BASE_URL}/mld?date=${encodeURIComponent(date)}`;
    } else {
      url = `${API_BASE_URL}/field?depth=${depth}&date=${encodeURIComponent(date)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Field fetch failed with status: ${res.status}`);
    }
    const payload = await res.json();
    let data;
    if (layer === 'tchp') {
      data = toMapField(payload, 'tchp_kJ_cm2', 'tchp');
    } else if (layer === 'd20') {
      data = toMapField(payload, 'd20_m', 'd20');
    } else if (layer === 'mld') {
      data = toMapField(payload, 'mld_m', 'mld');
    } else {
      data = toMapField(payload, 'temperature_degC', 'temperature', depth);
    }
    lastValidField = data;
    return data;
  } catch (err) {
    if (lastValidField) {
      console.warn('API error, showing previous available field:', err);
      return {
        ...lastValidField,
        warning: 'Unable to load data. Showing the previous available field.',
      };
    }
    throw err;
  }
}

/**
 * GET /tchp?date={date}
 */
export async function getTCHP({ date }) {
  return getField({ layer: 'tchp', date });
}

/**
 * GET /health
 */
export async function getHealth() {
  if (USE_MOCK) {
    await delay(10);
    return {
      status: 'healthy',
      version: 'OceanEmbed-NIO-v1.0',
      model: 'Physics-Informed Ocean Neural Operator (PIONO-NIO)',
      resolution: '0.20° x 0.20° grid, 11 depth levels (0-1000m)',
      lastAssimilation: '2026-08-27T12:00:00Z',
      activeArgoFloats: ARGO_FLOATS.length,
      domain: 'North Indian Ocean (5°S–26°N, 45°E–99°E)',
      inferenceLatencyMs: 22,
    };
  }

  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

/**
 * GET /argo?date={date}
 */
export async function getArgoFloats(date) {
  if (USE_MOCK) {
    await delay(10);
    return ARGO_FLOATS;
  }

  const res = await fetch(`${API_BASE_URL}/argo?date=${encodeURIComponent(date)}`);
  if (!res.ok) {
    throw new Error(`ARGO fetch failed: ${res.status}`);
  }
  return res.json();
}

export { AVAILABLE_DATES };
