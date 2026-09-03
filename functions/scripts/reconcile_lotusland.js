#!/usr/bin/env node
/**
 * Lotusland / RegenPept Catalog Reconciliation Script
 *
 * Source of truth: RegenPept_Portfolio_31_(6).pdf (pages 6-7)
 * Supplier: Lotusland Limited (OLlBbQjgrj6tY7GmM2Jo)
 *
 * Usage:
 *   node functions/scripts/reconcile_lotusland.js --dry-run   # Preview only
 *   node functions/scripts/reconcile_lotusland.js --execute   # Write to Firestore
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

const SUPPLIER_ID   = 'OLlBbQjgrj6tY7GmM2Jo';
const SUPPLIER_NAME = 'Lotusland Limited';
const CATALOG_BRAND = 'RegenPept';
const SOURCE_DOC    = 'RegenPept_Portfolio_31_(6).pdf';
const SOURCE_DATE   = '2026-07-02';

const args    = process.argv.slice(2);
const DRY_RUN = !args.includes('--execute');
if (DRY_RUN) console.log('\n🔍 DRY-RUN MODE — No data will be written.\n');
else         console.log('\n🚀 EXECUTE MODE — Writing changes to Firestore.\n');

// ─── Alias map ───────────────────────────────────────────────────────────────
const ALIASES = {
  'FST344': 'Follistatin 344', 'FST-344': 'Follistatin 344',
  'IGF LR3': 'IGF-1 LR3',
  'PT-141': 'Bremelanotide',
  'MT2': 'Melanotan II', 'Melanotan 2': 'Melanotan II',
  'TB-500': 'Thymosin Beta-4', 'Thymosin β4': 'Thymosin Beta-4',
  'PE 22-28': 'PE-22-28', 'PE22-28': 'PE-22-28',
  'GHRP - 2': 'GHRP-2',
  'GW501516': 'GW-501516',
  'GHK-Cu Human Copper': 'GHK-Cu',
  'CJC-1295 without DAC': 'Modified GRF 1-29',
  'Thymosin Alpha-1': 'Thymosin Alpha 1',
  '5-Amino 1 MQ': '5-Amino-1MQ', '5 Amino 1MQ': '5-Amino-1MQ',
};

const normName    = (n) => { if (!n) return ''; const t = n.trim(); return ALIASES[t] || t; };
const normDosage  = (d) => d ? d.replace(/\s*\/\s*(vial|bottle|kit|tab|tablet|box)/gi, '').replace(/\s+/g, ' ').trim() : '';
const compositeKey = (name, dosage, form, pkg) =>
  `${SUPPLIER_ID}|${normName(name)}|${normDosage(dosage)}|${form || 'Lyophilized vial'}|${pkg || 'vial'}`;

// ─── Authoritative variants from PDF pp.6-7 ──────────────────────────────────
const VARIANTS = [
  { name: 'AOD-9604',             dosage: '2 mg',                   unitCost: 30,  kitCost: 150 },
  { name: 'AOD-9604',             dosage: '10 mg',                  unitCost: 100, kitCost: 600 },
  { name: 'BPC-157',              dosage: '5 mg',                   unitCost: 25,  kitCost: 150 },
  { name: 'BPC-157',              dosage: '10 mg',                  unitCost: 45,  kitCost: 250 },
  { name: 'BPC-157 + TB-500',     dosage: '5 mg + 5 mg',           unitCost: 70,  kitCost: 380 },
  { name: 'Modified GRF 1-29',    dosage: '2 mg',                   unitCost: 20,  kitCost: 100 },
  { name: 'Modified GRF 1-29',    dosage: '5 mg',                   unitCost: 30,  kitCost: 160 },
  { name: 'Modified GRF 1-29 + Ipamorelin', dosage: '5 mg + 5 mg', unitCost: 90,  kitCost: 480 },
  { name: 'Epithalon',            dosage: '10 mg',                  unitCost: 30,  kitCost: 150 },
  { name: 'Follistatin 344',      dosage: '1 mg',                   unitCost: 150, kitCost: 800 },
  { name: 'GLOW',                 dosage: '10 mg + 10 mg + 75 mg', unitCost: 120, kitCost: 750 },
  { name: 'KLOW',                 dosage: '10 mg + 10 mg + 75 mg + 10 mg', unitCost: 140, kitCost: 850 },
  { name: 'GHRP-2',              dosage: '5 mg',                   unitCost: 15,  kitCost: 70  },
  { name: 'GHRP-6',              dosage: '5 mg',                   unitCost: 15,  kitCost: 70  },
  { name: 'GHK-Cu',              dosage: '200 mg',                  unitCost: 50,  kitCost: 280 },
  { name: 'Hexarelin',            dosage: '2 mg',                   unitCost: 20,  kitCost: 100 },
  { name: 'IGF-1 LR3',           dosage: '1 mg',                   unitCost: 150, kitCost: 850 },
  { name: 'Ipamorelin',           dosage: '5 mg',                   unitCost: 20,  kitCost: 100 },
  { name: 'KPV',                  dosage: '10 mg',                  unitCost: 30,  kitCost: 180 },
  { name: 'LL-37',               dosage: '10 mg',                  unitCost: 50,  kitCost: 280 },
  { name: 'Melanotan II',         dosage: '10 mg',                  unitCost: 25,  kitCost: 130 },
  { name: 'MOTs-C',              dosage: '10 mg',                  unitCost: 40,  kitCost: 220 },
  { name: 'NADK',                dosage: '50 mg',                  unitCost: 80,  kitCost: 450 },
  { name: 'PE-22-28',            dosage: '10 mg',                  unitCost: 70,  kitCost: 380 },
  { name: 'Bremelanotide',        dosage: '10 mg',                  unitCost: 50,  kitCost: 280 },
  { name: 'Selank',               dosage: '5 mg',                   unitCost: 25,  kitCost: 130 },
  { name: 'Semax',                dosage: '5 mg',                   unitCost: 25,  kitCost: 130 },
  { name: 'Sermorelin',           dosage: '2 mg',                   unitCost: 20,  kitCost: 100 },
  { name: 'Sermorelin',           dosage: '5 mg',                   unitCost: 35,  kitCost: 190 },
  { name: 'SS-31',               dosage: '10 mg',                  unitCost: 60,  kitCost: 340 },
  { name: 'TB-500',              dosage: '5 mg',                   unitCost: 40,  kitCost: 220 },
  { name: 'TB-500',              dosage: '10 mg',                  unitCost: 70,  kitCost: 380 },
  { name: 'Tesamorelin',          dosage: '2 mg',                   unitCost: 30,  kitCost: 160 },
  { name: 'Tesamorelin',          dosage: '10 mg',                  unitCost: 100, kitCost: 580 },
  { name: 'Thymosin Alpha 1',     dosage: '5 mg',                   unitCost: 50,  kitCost: 280 },
  { name: 'Thymosin Alpha 1',     dosage: '10 mg',                  unitCost: 80,  kitCost: 380 },
  { name: 'Thymosin Beta-4',      dosage: '5 mg',                   unitCost: 40,  kitCost: 220 },
  { name: 'Thymulin',             dosage: '20 mg',                  unitCost: 50,  kitCost: 280 },
  { name: 'VIP',                  dosage: '2 mg',                   unitCost: 80,  kitCost: 450 },
  { name: '5-Amino-1MQ',          dosage: '50 mg',                  unitCost: 40,  kitCost: 220 },
  { name: 'CJC-1295',            dosage: '2 mg',                   unitCost: 25,  kitCost: 130 },
  { name: 'CJC-1295',            dosage: '5 mg',                   unitCost: 40,  kitCost: 220 },
  // Oral tablets
  { name: 'MK-677',   dosage: '10 mg',    unitCost: 30, kitCost: null, dosageForm: 'Oral tablet', unitsPerKit: 100, packageType: 'bottle' },
  { name: 'GW-501516', dosage: '10 mg',   unitCost: 35, kitCost: null, dosageForm: 'Oral tablet', unitsPerKit: 100, packageType: 'bottle' },
  { name: 'NMN',       dosage: '250 mg',  unitCost: 40, kitCost: null, dosageForm: 'Oral tablet', unitsPerKit: 90,  packageType: 'bottle' },
  { name: 'SLU-PP-332', dosage: '250 mcg', unitCost: 80, kitCost: null, dosageForm: 'Oral tablet', unitsPerKit: 90, packageType: 'bottle' },
  // Accessories
  { name: 'Insulin Syringes',            dosage: '1 ml',  unitCost: 15, kitCost: null, dosageForm: 'Syringe',              unitsPerKit: 100, packageType: 'box', category: 'Accessories and reconstitution supplies' },
  { name: 'Bac Water 30 ml',             dosage: '30 ml', unitCost: 10, kitCost: null, dosageForm: 'Bacteriostatic water',  unitsPerKit: 1,   packageType: 'bottle', category: 'Accessories and reconstitution supplies' },
  { name: 'Bac Water 3 ml',              dosage: '3 ml',  unitCost: 25, kitCost: null, dosageForm: 'Bacteriostatic water',  unitsPerKit: 10,  packageType: 'box', category: 'Accessories and reconstitution supplies' },
  { name: 'Syringe and Bac Water Bundle', dosage: 'kit',  unitCost: 35, kitCost: null, dosageForm: 'Bundle',                unitsPerKit: 1,   packageType: 'kit', category: 'Accessories and reconstitution supplies' },
];

// Attach defaults for vials
VARIANTS.forEach(v => {
  if (!v.dosageForm)   v.dosageForm   = 'Lyophilized vial';
  if (!v.unitsPerKit)  v.unitsPerKit  = 10;
  if (!v.packageType)  v.packageType  = 'vial';
  if (!v.category)     v.category     = 'Peptides';
});

// ─── Main ─────────────────────────────────────────────────────────────────────
async function reconcile() {
  // 1. Read all existing Lotusland supplier records
  console.log('📖 Reading existing Lotusland records...');
  const existingByKey = {};
  const allDocs = [];
  for (const col of ['supplierOffers', 'supplierProducts', 'products']) {
    try {
      const snap = await db.collection(col).where('supplierId', '==', SUPPLIER_ID).get();
      snap.docs.forEach(d => {
        const data = d.data();
        const key  = compositeKey(data.name || data.canonicalName, data.dosage || data.normalizedDosage, data.dosageForm, data.packageType);
        existingByKey[key] = { id: d.id, col, data };
        allDocs.push({ id: d.id, col, data });
      });
    } catch (e) { console.warn(`  ⚠️  ${col}: ${e.message}`); }
  }
  console.log(`  Found ${allDocs.length} existing records.\n`);

  const authKeys = new Set(VARIANTS.map(v => compositeKey(v.name, v.dosage, v.dosageForm, v.packageType)));

  const toCreate     = [];
  const toUpdate     = [];
  const toDeactivate = [];
  const unchanged    = [];

  // 2. Match against authoritative list
  for (const v of VARIANTS) {
    const key      = compositeKey(v.name, v.dosage, v.dosageForm, v.packageType);
    const existing = existingByKey[key];
    const payload  = {
      supplierId: SUPPLIER_ID, supplierName: SUPPLIER_NAME, catalogBrand: CATALOG_BRAND,
      name: v.name, dosage: v.dosage, normalizedDosage: normDosage(v.dosage),
      dosageForm: v.dosageForm, packageType: v.packageType, unitsPerKit: v.unitsPerKit,
      productCategory: v.category,
      supplierUnitCostUSD: v.unitCost,
      supplierKitCostUSD: v.kitCost ?? null,
      supplierCurrency: 'USD',
      supplierCostSource: SOURCE_DOC,
      supplierCostSourceDate: SOURCE_DATE,
      supplierCostUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      activeForSupplier: true, catalogStatus: 'active',
    };

    if (!existing) {
      toCreate.push({ key, payload });
    } else {
      const d = existing.data;
      const needsUpdate = d.supplierUnitCostUSD !== v.unitCost || d.supplierKitCostUSD !== (v.kitCost ?? null) || !d.supplierCurrency || !d.supplierCostSource;
      if (needsUpdate) toUpdate.push({ id: existing.id, col: existing.col, prev: { supplierUnitCostUSD: d.supplierUnitCostUSD, supplierKitCostUSD: d.supplierKitCostUSD }, payload });
      else unchanged.push(key);
    }
  }

  // 3. Find records to deactivate
  for (const doc of allDocs) {
    const d   = doc.data;
    const key = compositeKey(d.name || d.canonicalName, d.dosage || d.normalizedDosage, d.dosageForm, d.packageType);
    if (!authKeys.has(key) && d.catalogStatus !== 'needs_review') toDeactivate.push({ id: doc.id, col: doc.col, key });
  }

  // ─── Report ──────────────────────────────────────────────────────────────
  console.log('═'.repeat(60));
  console.log('RECONCILIATION REPORT');
  console.log('═'.repeat(60));
  console.log(`  + TO CREATE:     ${toCreate.length}`);
  console.log(`  ~ TO UPDATE:     ${toUpdate.length}`);
  console.log(`  ⊘ TO DEACTIVATE: ${toDeactivate.length}`);
  console.log(`  ✔ UNCHANGED:     ${unchanged.length}\n`);

  if (toCreate.length)     { console.log('── CREATE ──'); toCreate.forEach(r => console.log(`  + ${r.payload.name} | ${r.payload.dosage} | $${r.payload.supplierUnitCostUSD}`)); console.log(''); }
  if (toUpdate.length)     { console.log('── UPDATE ──'); toUpdate.forEach(r => console.log(`  ~ [${r.id}] $${r.prev.supplierUnitCostUSD} → $${r.payload.supplierUnitCostUSD}`)); console.log(''); }
  if (toDeactivate.length) { console.log('── DEACTIVATE ──'); toDeactivate.forEach(r => console.log(`  ⊘ [${r.id}] ${r.key}`)); console.log(''); }

  if (DRY_RUN) { console.log('🔍 Dry-run complete. Run with --execute to apply.\n'); return; }

  // ─── Execute ─────────────────────────────────────────────────────────────
  // Firestore batch limit is 500; split if needed
  const allOps = [
    ...toCreate.map(r => ({ type: 'create', ref: db.collection('supplierOffers').doc(), data: { ...r.payload, _auditLog: { op: 'CREATE', source: SOURCE_DOC, ts: admin.firestore.FieldValue.serverTimestamp() } } })),
    ...toUpdate.map(r => ({ type: 'update', ref: db.collection(r.col).doc(r.id), data: { ...r.payload, _auditLog: { op: 'UPDATE', prev: { supplierUnitCostUSD: r.prev.supplierUnitCostUSD ?? null, supplierKitCostUSD: r.prev.supplierKitCostUSD ?? null }, source: SOURCE_DOC, ts: admin.firestore.FieldValue.serverTimestamp() } } })),
    ...toDeactivate.map(r => ({ type: 'update', ref: db.collection(r.col).doc(r.id), data: { catalogStatus: 'needs_review', activeForSupplier: false, reviewReason: `Not present in RegenPept Portfolio dated ${SOURCE_DATE}`, _auditLog: { op: 'DEACTIVATE', source: SOURCE_DOC, ts: admin.firestore.FieldValue.serverTimestamp() } } })),
  ];

  for (let i = 0; i < allOps.length; i += 499) {
    const batch = db.batch();
    allOps.slice(i, i + 499).forEach(op => {
      if (op.type === 'create') batch.set(op.ref, op.data);
      else batch.update(op.ref, op.data);
    });
    await batch.commit();
    console.log(`  ✅ Committed batch ${Math.floor(i/499)+1} (${Math.min(i+499, allOps.length)} ops).`);
  }

  // ─── Validation ──────────────────────────────────────────────────────────
  console.log('\n🔎 Post-import validation...');
  const finalSnap = await db.collection('supplierOffers').where('supplierId', '==', SUPPLIER_ID).where('activeForSupplier', '==', true).get();
  const finals    = finalSnap.docs.map(d => d.data());
  const badCurr   = finals.filter(d => d.supplierCurrency !== 'USD');
  const badCost   = finals.filter(d => !d.supplierUnitCostUSD);
  console.log(`  Active offers: ${finals.length}`);
  if (badCurr.length) console.log(`  ❌ Missing USD currency: ${badCurr.length}`);
  if (badCost.length) console.log(`  ❌ Missing unit cost:    ${badCost.length}`);
  if (!badCurr.length && !badCost.length) console.log('  ✅ All validations passed.\n');
}

reconcile().catch(err => { console.error('Fatal:', err); process.exit(1); });
