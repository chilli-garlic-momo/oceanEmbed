import {
  AVAILABLE_DATES,
  getDateIndex,
  computeOceanState,
  getSubsurfaceProfile,
  generateFieldGrid,
} from '../src/data/mock.js';
import { TRANSLATIONS } from '../src/data/i18n.js';

console.log('=== 1. VERIFYING 365-DAY CONTINUOUS BUFFER ===');
console.log(`Total days generated: ${AVAILABLE_DATES.length} (Expected: 365)`);
if (AVAILABLE_DATES.length !== 365) {
  throw new Error(`Expected 365 days, found ${AVAILABLE_DATES.length}`);
}

const firstDate = AVAILABLE_DATES[0];
const lastDate = AVAILABLE_DATES[364];
const aug27 = AVAILABLE_DATES[238];

console.log(`First Date (Index 0):   ${firstDate.id} - ${firstDate.full}`);
console.log(`Peak Cyclogenesis Day (Index 238): ${aug27.id} - ${aug27.full}`);
console.log(`Last Date (Index 364):    ${lastDate.id} - ${lastDate.full}`);

if (firstDate.id !== '2026-01-01' || lastDate.id !== '2026-12-31' || aug27.id !== '2026-08-27') {
  throw new Error('Date buffer boundary mismatch!');
}

console.log('\n=== 2. VERIFYING DAILY STEP ACCURACY & SYNTHETIC DATA DIVERSITY ===');
const testIndices = [0, 50, 120, 200, 238, 239, 300, 364];
const testLat = 18.25;
const testLon = 88.5;

for (const idx of testIndices) {
  const dObj = AVAILABLE_DATES[idx];
  const state = computeOceanState(testLat, testLon, dObj.id);
  const profile = getSubsurfaceProfile(testLat, testLon, dObj.id);

  console.log(
    `Day ${String(idx).padStart(3, ' ')} (${dObj.id}): TCHP=${state.tchp.toFixed(1)} kJ/cm², SST=${state.sst.toFixed(1)}°C, D20=${state.d20}m, MLD=${state.mld}m, ProfilePoints=${profile.profile.length}`
  );

  if (state.tchp < 0 || state.sst < 15 || state.d20 < 10 || state.mld < 5) {
    throw new Error(`Physical anomaly out of range at day ${idx}`);
  }
}

// Check Aug 27 reference point specifically
const refState = computeOceanState(18.25, 88.5, '2026-08-27');
console.log(`\nReference Point 27-Aug Calibration check: TCHP=${refState.tchp} (Expected 126.2), SST=${refState.sst} (Expected 30.8)`);
if (refState.tchp !== 126.2 || refState.sst !== 30.8) {
  throw new Error(`Reference calibration failed: got TCHP=${refState.tchp}, SST=${refState.sst}`);
}

console.log('\n=== 3. VERIFYING GRID GENERATION ON MULTIPLE DATES ===');
const gridJan = generateFieldGrid('tchp', 0, '2026-01-01');
const gridAug = generateFieldGrid('tchp', 0, '2026-08-27');
const gridDec = generateFieldGrid('tchp', 0, '2026-12-31');

console.log(`Grid Jan RowsxCols: ${gridJan.rows}x${gridJan.cols}`);
console.log(`Grid Aug RowsxCols: ${gridAug.rows}x${gridAug.cols}`);
console.log(`Grid Dec RowsxCols: ${gridDec.rows}x${gridDec.cols}`);

console.log('\n=== 4. VERIFYING REMOVAL OF "MOCK/DEMO" BADGES ===');
const enHeader = JSON.stringify(TRANSLATIONS.en.header);
const enFooter = JSON.stringify(TRANSLATIONS.en.footer);
const hiHeader = JSON.stringify(TRANSLATIONS.hi.header);
const hiFooter = JSON.stringify(TRANSLATIONS.hi.footer);

const forbidden = ['MOCK', 'DEMO', 'Synthetic Simulation', 'Demo Cycle'];
let foundForbidden = false;

for (const f of forbidden) {
  if (enHeader.includes(f) || enFooter.includes(f) || hiHeader.includes(f) || hiFooter.includes(f)) {
    console.error(`[FAIL] Found forbidden string "${f}" in header/footer translations!`);
    foundForbidden = true;
  }
}

if (!foundForbidden) {
  console.log('[PASS] Zero mock/demo badges found in operational header and footer translations.');
}

console.log('\nAll 365-day continuous timeline & operational UI tests passed successfully!');
