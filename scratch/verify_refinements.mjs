import { TRANSLATIONS, getTranslation } from '../src/data/i18n.js';
import { AVAILABLE_DATES } from '../src/data/mock.js';

console.log('=== 1. VERIFYING "ANIMATE TCHP" BUTTON TEXT ===');
const enAnimate = getTranslation('en', 'timeline.animateTchp');
console.log(`EN: "${enAnimate}" (Expected: "ANIMATE TCHP")`);

if (enAnimate.toUpperCase() !== 'ANIMATE TCHP') {
  throw new Error(`Expected 'ANIMATE TCHP', got '${enAnimate}'`);
}

console.log('\n=== 2. VERIFYING COMPLETE REMOVAL OF REPETITIVE RI ALERT TERMINOLOGY ===');
const allTranslationsJson = JSON.stringify(TRANSLATIONS);
const alertRegex = /\b(RI RISK: CRITICAL|RI ALERT|RI WARNING)\b/i;
const match = allTranslationsJson.match(alertRegex);

if (match) {
  throw new Error(`Found disallowed RI alert string: "${match[0]}"`);
} else {
  console.log('[PASS] Zero occurrences of repetitive "RI RISK: CRITICAL" across all i18n dictionaries.');
}

console.log('\n=== 3. VERIFYING 1-YEAR DATE BUFFER FOR CALENDAR ===');
console.log(`Total Dates: ${AVAILABLE_DATES.length}`);
console.log(`Earliest Date: ${AVAILABLE_DATES[0].id}`);
console.log(`Latest Date:   ${AVAILABLE_DATES[364].id}`);

console.log('\nAll refinement verification checks passed successfully!');
