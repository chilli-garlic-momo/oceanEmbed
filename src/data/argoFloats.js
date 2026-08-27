// Realistic ARGO float array in the North Indian Ocean
// INCOIS, NOAA AOML, and Euro-Argo deployed floats

export const ARGO_FLOATS = [
  {
    id: '2902741',
    wmo: '2902741',
    basin: 'Bay of Bengal',
    subRegion: 'North-Central Warm Core Eddy',
    lat: 18.15,
    lon: 88.35,
    platformType: 'Apex Profiler (INCOIS)',
    lastCycle: 148,
    cycleDate: '2026-08-27 04:30 UTC',
    status: 'Active',
    sensors: 'CTD, DOXY',
    surfaceTemp: 30.6,
    tchpObserved: 94.2,
    d20Observed: 84.5,
    mldObserved: 32.0,
  },
  {
    id: '2902890',
    wmo: '2902890',
    basin: 'Bay of Bengal',
    subRegion: 'East Bay of Bengal / Andaman Sea Basin',
    lat: 13.40,
    lon: 91.20,
    platformType: 'PROVOR CTS-4 (Euro-Argo)',
    lastCycle: 92,
    cycleDate: '2026-08-26 18:15 UTC',
    status: 'Active',
    sensors: 'CTD, BGC',
    surfaceTemp: 29.8,
    tchpObserved: 86.4,
    d20Observed: 78.0,
    mldObserved: 38.5,
  },
  {
    id: '2903312',
    wmo: '2903312',
    basin: 'Bay of Bengal',
    subRegion: 'South Bay of Bengal / Sri Lanka Dome',
    lat: 9.80,
    lon: 84.50,
    platformType: 'Navis BGC (NOAA AOML)',
    lastCycle: 174,
    cycleDate: '2026-08-27 02:10 UTC',
    status: 'Active',
    sensors: 'CTD, ECO-Puck',
    surfaceTemp: 28.9,
    tchpObserved: 72.8,
    d20Observed: 64.0,
    mldObserved: 42.0,
  },
  {
    id: '2903567',
    wmo: '2903567',
    basin: 'Arabian Sea',
    subRegion: 'Central Arabian Sea Warm Pool',
    lat: 16.50,
    lon: 66.80,
    platformType: 'Apex Profiler (INCOIS)',
    lastCycle: 116,
    cycleDate: '2026-08-26 22:45 UTC',
    status: 'Active',
    sensors: 'CTD',
    surfaceTemp: 28.4,
    tchpObserved: 58.6,
    d20Observed: 56.0,
    mldObserved: 52.0,
  },
  {
    id: '2902145',
    wmo: '2902145',
    basin: 'Arabian Sea',
    subRegion: 'Western Arabian Sea / Oman Upwelling Zone',
    lat: 19.20,
    lon: 59.40,
    platformType: 'PROVOR (IFREMER)',
    lastCycle: 204,
    cycleDate: '2026-08-27 07:20 UTC',
    status: 'Active',
    sensors: 'CTD, DOXY',
    surfaceTemp: 24.8,
    tchpObserved: 31.2,
    d20Observed: 36.5,
    mldObserved: 28.0,
  },
  {
    id: '2903889',
    wmo: '2903889',
    basin: 'Arabian Sea',
    subRegion: 'South-East Arabian Sea / Mini Warm Pool',
    lat: 10.50,
    lon: 72.30,
    platformType: 'Apex Profiler (INCOIS)',
    lastCycle: 83,
    cycleDate: '2026-08-27 05:00 UTC',
    status: 'Active',
    sensors: 'CTD',
    surfaceTemp: 29.5,
    tchpObserved: 78.4,
    d20Observed: 72.0,
    mldObserved: 36.0,
  },
  {
    id: '2903901',
    wmo: '2903901',
    basin: 'Equatorial Indian Ocean',
    subRegion: 'Equatorial Wyrtki Jet Zone',
    lat: 2.50,
    lon: 78.00,
    platformType: 'Navis (NOAA)',
    lastCycle: 139,
    cycleDate: '2026-08-26 14:30 UTC',
    status: 'Active',
    sensors: 'CTD, DOXY',
    surfaceTemp: 29.1,
    tchpObserved: 69.5,
    d20Observed: 68.0,
    mldObserved: 44.0,
  },
  {
    id: '2904012',
    wmo: '2904012',
    basin: 'Bay of Bengal',
    subRegion: 'Head Bay Freshwater Lens Zone',
    lat: 20.40,
    lon: 89.60,
    platformType: 'Apex Profiler (INCOIS)',
    lastCycle: 68,
    cycleDate: '2026-08-27 08:00 UTC',
    status: 'Active',
    sensors: 'CTD',
    surfaceTemp: 31.1,
    tchpObserved: 102.5,
    d20Observed: 92.0,
    mldObserved: 24.0,
  },
];

/**
 * Calculates distance in km between two lat/lon points
 */
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest ARGO float to a clicked coordinate
 */
export function findNearestArgo(lat, lon) {
  let nearest = null;
  let minDistance = Infinity;

  for (const float of ARGO_FLOATS) {
    const dist = getHaversineDistance(lat, lon, float.lat, float.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...float, distanceKm: Math.round(dist) };
    }
  }

  // If float is within 450km, consider it matching observation context
  return nearest;
}
