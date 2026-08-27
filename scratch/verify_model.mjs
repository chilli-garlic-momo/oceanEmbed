import { isLand, computeOceanState, generateFieldGrid, getSubsurfaceTempAtDepth } from '../src/data/mock.js';
import { COLOR_SCALES, getRGBAFromScale } from '../src/data/colormaps.js';

console.log('=== VERIFYING NORTH INDIAN OCEAN DOMAIN SPECIFICATION ===');
console.log('Domain: 5°S to 26°N, 45°E to 99°E\n');

const testPoints = [
  { name: 'Bay of Bengal Genesis Core', lat: 18.25, lon: 88.50, expectedLand: false },
  { name: 'Central Arabian Sea', lat: 16.50, lon: 66.80, expectedLand: false },
  { name: 'Lakshadweep Sea', lat: 10.50, lon: 72.30, expectedLand: false },
  { name: 'Maldives Ridge / Equator', lat: 2.50, lon: 78.00, expectedLand: false },
  { name: 'Andaman Sea', lat: 11.50, lon: 95.50, expectedLand: false },
  { name: 'Southern Equatorial Boundary (4°S)', lat: -4.00, lon: 75.00, expectedLand: false },
  { name: 'Mainland India (Nagpur)', lat: 21.00, lon: 79.00, expectedLand: true },
  { name: 'Sri Lanka Interior', lat: 7.50, lon: 80.60, expectedLand: true },
  { name: 'Oman Desert', lat: 21.00, lon: 56.50, expectedLand: true },
  { name: 'Pakistan Mainland', lat: 27.00, lon: 65.00, expectedLand: true },
  { name: 'Bangladesh Interior', lat: 24.00, lon: 90.00, expectedLand: true },
  { name: 'Myanmar Mainland', lat: 19.00, lon: 96.00, expectedLand: true },
  { name: 'Thailand (Outside Basin)', lat: 14.00, lon: 101.00, expectedLand: true },
  { name: 'South Outside Domain (-12°S)', lat: -12.00, lon: 75.00, expectedLand: true },
];

let allPassed = true;
for (const pt of testPoints) {
  const actual = isLand(pt.lat, pt.lon);
  const status = actual === pt.expectedLand ? 'PASS' : 'FAIL';
  if (status === 'FAIL') allPassed = false;
  console.log(`[${status}] ${pt.name} (${pt.lat}°, ${pt.lon}°) -> isLand: ${actual} (expected: ${pt.expectedLand})`);
}

console.log('\n=== TESTING HIGH-RESOLUTION GRID FOR ALL 4 LAYERS ===');
const layers = ['tchp', 'temperature', 'd20', 'mld'];
for (const l of layers) {
  const g = generateFieldGrid(l, 0, '2026-08-27');
  console.log(`Layer [${l.toUpperCase()}]: ${g.rows} rows x ${g.cols} cols = ${g.rows * g.cols} points (Bounds: ${g.bounds.minLat}° to ${g.bounds.maxLat}°N, ${g.bounds.minLon}° to ${g.bounds.maxLon}°E)`);
}

console.log('\n=== TESTING 3D SUBSURFACE TEMPERATURES AT 18.25°N, 88.50°E ===');
const depths = [0, 50, 100, 200, 500, 1000];
for (const d of depths) {
  const temp = getSubsurfaceTempAtDepth(18.25, 88.50, d, '2026-08-27');
  const [r, g, b] = getRGBAFromScale(temp, COLOR_SCALES.temperature);
  console.log(`Depth ${String(d).padStart(4)}m -> ${temp.toFixed(1)}°C [RGB: (${r}, ${g}, ${b})]`);
}

console.log('\nAll North Indian Ocean tests passed:', allPassed);
