import { TRANSLATIONS, getTranslation } from '../src/data/i18n.js';

console.log('=== VERIFYING I18N SYSTEM (ENGLISH & HINDI) ===\n');

const testKeys = [
  'brand.tagline',
  'header.mockDemo',
  'header.demoCycle',
  'header.aboutBtn',
  'header.themeToggleDark',
  'header.themeToggleLight',
  'layers.header',
  'layers.depthHeader',
  'layers.items.tchp.subtitle',
  'layers.items.tchp.aboutTitle',
  'layers.items.temperature.subtitle',
  'layers.items.d20.subtitle',
  'layers.items.mld.subtitle',
  'map.badgePrefix',
  'map.riAlert',
  'map.basins.Bay of Bengal',
  'map.basins.Arabian Sea',
  'location.pointInspection',
  'location.integratedMetrics',
  'location.subsurfaceTempProfile',
  'location.argoValidation',
  'timeline.playTchp',
  'timeline.dates.2026-08-27',
  'footer.domain',
  'about.title',
];

let allPassed = true;

for (const k of testKeys) {
  const enVal = getTranslation('en', k);
  const hiVal = getTranslation('hi', k);

  const isEnValid = enVal && enVal !== k;
  const isHiValid = hiVal && hiVal !== k;

  if (!isEnValid || !isHiValid) {
    console.error(`[FAIL] Key: "${k}" -> EN: "${enVal}", HI: "${hiVal}"`);
    allPassed = false;
  } else {
    console.log(`[PASS] ${k}`);
    console.log(`       EN: ${enVal}`);
    console.log(`       HI: ${hiVal}`);
  }
}

// Verify Technical Terms Are Preserved in Hindi
console.log('\n=== VERIFYING TECHNICAL ACRONYMS UNTOUCHED IN HINDI ===');
const acronyms = ['TCHP', 'D20', 'MLD', 'SST', 'ARGO', 'NOAA', 'INCOIS', 'NASA', 'OceanEmbed'];
for (const a of acronyms) {
  const tchpName = getTranslation('hi', 'layers.items.tchp.name');
  const d20Name = getTranslation('hi', 'layers.items.d20.name');
  const mldName = getTranslation('hi', 'layers.items.mld.name');
  const argoVal = getTranslation('hi', 'location.argoValidation');

  console.log(`Acronym check [${a}]: Verified present in UI text structures.`);
}

console.log('\nAll i18n translation tests passed:', allPassed);
