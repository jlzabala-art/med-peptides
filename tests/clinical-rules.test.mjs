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

test('Pellet Data Model & Supplier Cost Benchmark: pairs Pharmapolis vs NP LABS by canonicalKey', async () => {
  const { PRODUCT_TYPE, BILLING_UNIT } = await import('../src/constants/productEnums.js');
  const { buildPelletComparisonRows } = await import('../src/utils/pelletComparison.js');
  const { getAllNpLabsPellets } = await import('../src/data/nplabPelletsRegistry.js');
  const { getAllPharmapolisPellets } = await import('../src/data/pharmapolisPelletsRegistry.js');

  assert.equal(PRODUCT_TYPE.PELLET, 'pellet');
  assert.equal(BILLING_UNIT.PELLET, 'pellet');

  const rows = buildPelletComparisonRows([...getAllPharmapolisPellets(), ...getAllNpLabsPellets()]);
  const t50 = rows.find((r) => r.canonicalKey === 'testosterone-50mg-pellet');
  assert.ok(t50, 'Must pair Testosterone 50mg across both suppliers');
  assert.equal(t50.overlapStatus, 'both');
  assert.equal(t50.pharmapolisCostEur, 50.56);
  assert.equal(t50.nplabsCostEur, 45);
  assert.equal(t50.cheaperSupplier, 'nplabs');

  const e25 = rows.find((r) => r.canonicalKey === 'estradiol-25mg-pellet');
  assert.equal(e25.cheaperSupplier, 'pharmapolis');

  const g10 = rows.find((r) => r.canonicalKey === 'gestrinone-10mg-pellet');
  assert.equal(g10.overlapStatus, 'nplabs_only');
  assert.equal(g10.nplabsCostEur, 55);
});

test('Universal Supplier Comparison & resolvePrice: handles N suppliers, FX conversion, and supplierOffers', async () => {
  const { buildSupplierComparisonRows, resolveActiveSupplierOffer } = await import('../src/utils/supplierComparison.js');
  const { resolveVariantPrice } = await import('../src/utils/resolvePrice.js');

  const multiSupplierItem = {
    id: 'bpc157-10mg',
    name: 'BPC-157 10 mg',
    productType: 'peptide',
    canonicalKey: 'peptide:bpc-157:10mg',
    preferredSupplierId: 'supplier-pharmapolis',
    supplierOffers: {
      'supplier-pharmapolis': {
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis',
        costPrice: 30,
        currency: 'EUR',
        certification: 'EU_GMP',
        leadTimeDays: 3,
      },
      'supplier-lotusland': {
        supplierId: 'supplier-lotusland',
        supplierName: 'LotusLand',
        costPrice: 25,
        currency: 'USD', // 25 * 0.92 = 23.00 EUR
        certification: 'STANDARD',
        leadTimeDays: 10,
      },
    },
  };

  const rows = buildSupplierComparisonRows([multiSupplierItem]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].supplierCount, 2);
  assert.equal(rows[0].bestOffer.supplierId, 'supplier-lotusland');
  assert.equal(rows[0].bestOffer.costEur, 23);
  assert.equal(rows[0].maxSpreadEur, 7);

  // Respects preferredSupplierId by default, lowest_cost when requested, and EU_GMP filter
  assert.equal(resolveActiveSupplierOffer(multiSupplierItem).supplierId, 'supplier-pharmapolis');
  assert.equal(resolveActiveSupplierOffer(multiSupplierItem, { preferLowestCost: true }).supplierId, 'supplier-lotusland');
  assert.equal(resolveActiveSupplierOffer(multiSupplierItem, { preferLowestCost: true, requireEuGmp: true }).supplierId, 'supplier-pharmapolis');

  // resolveVariantPrice consumes supplierOffers into master tier
  const resolved = resolveVariantPrice(multiSupplierItem, { tier: 'master' });
  assert.equal(resolved.perUnit, 30);
  assert.equal(resolved.currency, 'EUR');
});
