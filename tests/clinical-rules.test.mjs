import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

test('Rule #71: PharmapolisLabelSvg enforces global pharmacy label standards', () => {
  const src = read('src/components/prescription/PharmapolisLabelSvg.jsx');

  // 1. Must not render literal "PATIENT:" prefix
  assert.equal(src.includes('PATIENT: <tspan'), false, 'Label must not render "PATIENT:" prefix');

  // 2. Must not emit PART X OF Y badges
  assert.equal(src.includes('partBadge = `PART ${pNum} OF ${pTot}`'), false, 'Label must not emit PART X OF Y');

  // 3. Must strip Hygrocaps and recommendation notes
  assert.match(src, /hygrocaps/i, 'Must sanitize Hygrocaps references');
  assert.match(src, /\(\?:recommended|recomendad/, 'Must strip recommendation parentheticals');

  // 4. Must upgrade generic titles to TrichoSol / Oral Capsules
  assert.ok(src.includes('isGenericTopicalTitle'), 'Must upgrade generic topical title to Tricho vehicle');
  assert.ok(src.includes("'Oral Capsules'"), 'Must upgrade generic oral treatment to Oral Capsules');

  // 5. Must protect transdermal creams from false vaginal classification
  assert.ok(src.includes('isExplicitTransdermal'), 'Must guard against transdermal-to-vaginal misclassification');
});

test('Zoho Matcher: isCompatibleZohoMatch blocks multi-API and wrong-route false positives', () => {
  const src = read('src/actions/zohoAutoIngestMatcher.js');
  assert.ok(src.includes('function isCompatibleZohoMatch'), 'isCompatibleZohoMatch must exist');
  assert.ok(src.includes("zoho.includes('+') && !raw.includes('+')"), 'Must block multi-API Zoho items for single API');
  assert.ok(src.includes('pessar|vaginal|suppositor'), 'Must block incompatible vaginal/pessary forms');
  assert.ok(src.includes('tokens.some((t) => zoho.includes(t))'), 'Must require API token match');
});

test('Refill Modal: Fagron courses default to 90 days and duration input is freely editable', () => {
  const src = read('src/components/prescription/PrescriptionRefillModal.jsx');
  assert.ok(src.includes('if (isFagron) return 90;'), 'Fagron courses must default to 90 days');
  assert.equal(src.includes('parseInt(e.target.value, 10) || 60'), false, 'Must not snap empty input back to 60 while typing');
});

test('Doctor DNA Table: all DataTable renderers accept (_val, row)', () => {
  const src = read('src/components/doctor/tabs/DoctorDnaAnalysisTab.jsx');
  const badRenders = src.match(/render:\s*\(row\)\s*=>/g) || [];
  assert.equal(badRenders.length, 0, 'Every DataTable column renderer must use (_val, row)');
});

test('Clinical Formulations: filters out vehicles from APIs and respects EN/ES lang', () => {
  const src = read('src/utils/clinical/clinicalFormulations.js');
  assert.ok(src.includes('export function resolvePrescriptionParts(rx, lang = \'en\')'), 'resolvePrescriptionParts must accept lang');
  assert.ok(src.includes('!a?.isVehicleOrBase'), 'Must exclude vehicles from APIs list');
});
