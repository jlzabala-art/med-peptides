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

  // 6. Must not render ▶ or ✔ before SCAN FOR REFILL, must strip Part N, and must upgrade Topical Wash / Treatment Solution to Tricho*
  assert.equal(src.includes('▶ SCAN FOR REFILL'), false, 'Must not render ▶ before SCAN FOR REFILL');
  assert.equal(src.includes('✔ SCAN FOR REFILL'), false, 'Must not render ✔ before SCAN FOR REFILL');
  assert.ok(src.includes('solution|wash|foam'), 'Must upgrade Topical Wash / Treatment Solution to TrichoWash / TrichoSol');
  assert.ok(src.includes("'TrichoWash Shampoo 250ml'"), 'Must normalize TrichoWash product name to TrichoWash Shampoo 250ml');
  assert.ok(src.includes('summarizeApplicationInstructions'), 'Must summarize additional application instructions into posology');

  // 7. Must convert mL to pump(s) for transdermal cream / pump dispensers in posology
  assert.ok(src.includes('isTransdermalPumpDispenser'), 'Must convert mL to pump(s) in posology for transdermal pump/pen dispensers');
  assert.ok(src.includes("'1 pump'"), 'Must express 1 mL transdermal dispenser dose as 1 pump');
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

test('Clinical Formulations: filters out vehicles from APIs, normalizes titles, and removes PART X OF Y', async () => {
  const src = read('src/utils/clinical/clinicalFormulations.js');
  assert.ok(src.includes('export function resolvePrescriptionParts(rx, lang = \'en\')'), 'resolvePrescriptionParts must accept lang');
  assert.ok(src.includes('!a?.isVehicleOrBase'), 'Must exclude vehicles from APIs list');
  assert.equal(src.includes('PART 1 OF 2'), false, 'clinicalFormulations must not emit PART 1 OF 2');
  assert.equal(src.includes('PART 2 OF 2'), false, 'clinicalFormulations must not emit PART 2 OF 2');

  const { normalizeClinicalFormulaTitle } = await import('../src/utils/clinical/clinicalFormulations.js');
  assert.equal(normalizeClinicalFormulaTitle('Part 2 · Oral Hair Capsules (90 Capsules)'), 'Oral Hair Capsules (90 Capsules)');
  assert.equal(normalizeClinicalFormulaTitle('Topical Treatment Solution (TrichoSol™)', 'TrichoSol'), 'TrichoSol');
  assert.equal(normalizeClinicalFormulaTitle('Topical Wash', 'TrichoWash'), 'TrichoWash Shampoo 250ml');
  assert.equal(normalizeClinicalFormulaTitle('Shampoo TrichoWash 250ml'), 'TrichoWash Shampoo 250ml');
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

test('Frontend Price Comparison Modules: wired to canonical model without mocks or type restrictions', () => {
  const variantCompSrc = read('src/components/admin/catalog/VariantCompetitorComparisonTable.jsx');
  assert.ok(variantCompSrc.includes('buildSupplierComparisonRows'), 'VariantCompetitorComparisonTable must use canonical supplier comparison');
  assert.ok(variantCompSrc.includes('/api/suppliers/set-preferred'), 'VariantCompetitorComparisonTable must support setting preferred supplier');
  assert.equal(variantCompSrc.includes('if (targetVariants.length === 0) {\n    return null;'), false, 'Must not block non-peptide products from supplier comparison');

  const supplierModeSrc = read('src/components/admin/imports/pricing/SupplierComparisonMode.jsx');
  assert.equal(supplierModeSrc.includes('Supplier B'), false, 'SupplierComparisonMode must not use hardcoded mock Supplier B');
  assert.ok(supplierModeSrc.includes('buildSupplierComparisonRows'), 'SupplierComparisonMode must use live canonical comparison');

  const benchmarkSrc = read('src/components/admin/market/BenchmarkingWorkspace.jsx');
  assert.equal(benchmarkSrc.includes("margin: 'TBD'"), false, 'BenchmarkingWorkspace must compute real margin');
  assert.equal(benchmarkSrc.includes('score: 85'), false, 'BenchmarkingWorkspace must compute real score');
});

test('DNA Profile Resolver: TrichoTest/TeloTest/AcneTest never show Nutrigenomics lactose/caffeine fallback', async () => {
  const { detectDnaTestFamily, resolveNonNutrigenomicDnaProfile } = await import('../src/utils/clinical/dnaProfileResolver.js');
  assert.equal(detectDnaTestFamily({ code: 'BOX03519AATRI', testType: 'TrichoTest™ Pharmacogenomics' }), 'trichotest');
  assert.equal(detectDnaTestFamily({ code: 'BOX001AATEL' }), 'telotest');
  assert.equal(detectDnaTestFamily({ code: 'BOX001AAACN' }), 'acnetest');
  assert.equal(detectDnaTestFamily({ testType: '24Genetics Nutrigenomics' }), 'nutrigenomics');

  const tricho = resolveNonNutrigenomicDnaProfile({ code: 'BOX03519AATRI' }, 'trichotest');
  assert.ok(tricho.axes.some((a) => a.genesLabel.includes('SRD5A1')), 'TrichoTest must show trichology genes');
  assert.equal(JSON.stringify(tricho).includes('MCM6'), false, 'TrichoTest must not show lactose MCM6');
  assert.equal(JSON.stringify(tricho).includes('ADORA2A'), false, 'TrichoTest must not show caffeine ADORA2A');
});

test('QR Refill Flow: deep-links product+part, renders ExpressQrRefillCard, and notifies Atlas via /request-refill', () => {
  const svgSrc = read('src/components/prescription/PharmapolisLabelSvg.jsx');
  assert.ok(svgSrc.includes('&action=refill'), 'QR URL must include action=refill');
  assert.ok(svgSrc.includes('&product=${encodeURIComponent(productTitle)}'), 'QR URL must bind exact product title');

  const rxClientSrc = read('src/app/rx/[code]/PublicPrescriptionClient.jsx');
  assert.ok(rxClientSrc.includes('ExpressQrRefillCard'), 'PublicPrescriptionClient must render ExpressQrRefillCard');
  assert.ok(rxClientSrc.includes("actionParam === 'refill'"), 'Must show ExpressQrRefillCard when QR action=refill is scanned');

  const apiSrc = read('src/app/api/prescriptions/[code]/request-refill/route.js');
  assert.ok(apiSrc.includes("targetRoles: ['admin', 'doctor']"), 'Must notify Atlas admin and doctor in Firestore notifications');
  assert.ok(apiSrc.includes('mail_notifications'), 'Must log email alert in mail_notifications');
});

test('Pharmapolis HRT Bulk Offers: 6 high-frequency hormones include batch costs and bulkTier comparison', async () => {
  const { getAllPharmapolisHrtBulkOffers } = await import('../src/data/pharmapolisHrtBulkOffers.js');
  const { buildSupplierComparisonRows } = await import('../src/utils/supplierComparison.js');
  const offers = getAllPharmapolisHrtBulkOffers();
  assert.equal(offers.length, 6);

  const rows = buildSupplierComparisonRows(offers, { productTypeFilter: 'hormone' });
  const tWomen = rows.find((r) => r.canonicalKey === 'hormone:testosterone-cream-women:1mg-ml');
  assert.ok(tWomen, 'Must include Testosterone cream (women) bulk offer');
  assert.equal(tWomen.bestOffer.costEur, 21.04);
  assert.equal(tWomen.bestOffer.bulkTier.packsPerBatch, 50);
  assert.equal(tWomen.bestOffer.bulkTier.unitProductionCostEur, 10.52);
});

test('Sidebar Layout FOUC Prevention: sidebars use static CSS imports instead of <style jsx>', () => {
  const drPortal = read('src/app/dr/[slug]/DoctorPublicPortalClient.jsx');
  assert.equal(drPortal.includes('<style jsx'), false, 'DoctorPublicPortalClient must not use <style jsx>');
  assert.ok(drPortal.includes('./DoctorPublicPortal.css'), 'DoctorPublicPortalClient must import static DoctorPublicPortal.css');

  const portalSidebar = read('src/components/ui/PortalSidebar.jsx');
  assert.equal(portalSidebar.includes('<style jsx'), false, 'PortalSidebar must not use <style jsx>');

  const ctxSidebar = read('src/components/shared/public/ContextualSidebar.jsx');
  assert.equal(ctxSidebar.includes('<style jsx'), false, 'ContextualSidebar must not use <style jsx>');
});

test('Clinical Domain Classifier: isolates nasal sprays & BHRT hormones from TrichoSol fallback', async () => {
  const { resolveClinicalDomain, CLINICAL_DOMAINS } = await import('../src/utils/clinical/clinicalDomainClassifier.js');
  assert.equal(
    resolveClinicalDomain({ code: 'NSLBSO1640', productName: 'Selank Nasal Spray (75 mg / 10 mL)' }),
    CLINICAL_DOMAINS.NASAL_SPRAY
  );
  assert.equal(
    resolveClinicalDomain({ title: 'Morning Formula DHEA + Testosterone Transdermal Cream', vehicle: 'Pentravan' }),
    CLINICAL_DOMAINS.HORMONE_BHRT
  );
  assert.equal(
    resolveClinicalDomain({ code: 'BOX03519AATRI', items: [{ name: 'Minoxidil 4% + Dutasteride 0.25%' }] }),
    CLINICAL_DOMAINS.TRICHOLOGY
  );

  const hookSrc = read('src/hooks/usePrescriptionData.js');
  assert.ok(hookSrc.includes('resolveClinicalDomain'), 'usePrescriptionData must use resolveClinicalDomain instead of forcing TrichoSol');
});
