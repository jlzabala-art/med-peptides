/**
 * seed-aesthetic-injectables.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Firestore seed — Aesthetic Injectables catalog
 * Source: PHARMAMEDIC EXPORT, S.L. (Lorenzo) · PRICE LIST DUBAI.xlsx
 *
 * 40 products across 5 subcategories:
 *   • Dermal Fillers       (JUVEDERM, RADIESSE, SCULPTRA, TEOSYAL, BELOTERO)
 *   • Skin Boosters        (PROFHILO, JALUPRO, RESTYLANE, TEOSYAL PURESENSE REDENSITY)
 *   • Biostimulators       (ELLANSÉ, RADIESSE diluted, SCULPTRA)
 *   • Polynucleotides      (NUCLEOFILL, PLINEST, PLURYAL SILK, PRONOVA PN)
 *   • Fat-Dissolving       (LEMON BOTTLE, BELKYRA/KYBELLA, PC/DC)
 *
 * Run:
 *   node scripts/seed-aesthetic-injectables.cjs
 *
 * Requirements:
 *   - serviceAccount-target.json in project root
 *   - firebase-admin installed
 */

'use strict';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccount-target.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const SUPPLIER_ID = 'pharmamedic-export-sl';

// ── Helper ─────────────────────────────────────────────────────────────────────
const ai = (id, code, name, brand, subcategory, productType, activeIngredient, treatments, price, notes = null) => ({
  id,
  slug: id,
  atlas_product_code: code,
  name,                           // public display name
  product_name: name,
  brand,
  category: 'Aesthetic Injectables',
  subcategory,
  product_type: productType,
  // Catalog flags
  is_peptide: false,
  is_cosmetic: false,
  is_aesthetic_injectable: true,
  requires_professional_administration: true,
  // Clinical
  active_ingredient: activeIngredient,
  route: 'injectable',
  treatment_areas: treatments,
  specialties: ['Aesthetic Medicine', 'Dermatology', 'Plastic Surgery'],
  professional_use_only: true,
  // Commercial (AED prices from supplier spreadsheet — market reference: Dubai/UAE)
  cost_price_aed: price,
  cost_currency: 'AED',
  selling_price: null,
  margin_percent: null,
  supplier_id: SUPPLIER_ID,
  supplier_name: 'PHARMAMEDIC EXPORT, S.L.',
  supplier_contact: 'Lorenzo',
  supplier_email: 'admin@pharmaspain.net',
  supplier_phone: '+34 618 222 793',
  market_reference: 'Dubai / UAE',
  // Availability
  status: 'published',
  visibility: 'B2B',
  availability: 'on_request',
  minimum_order_quantity: null,
  // Regulatory
  prescription_status: 'professional_use',
  verify_before_sale: true,
  // Packaging — to verify with supplier
  packaging_note: 'Unit/pack basis not specified in source spreadsheet; verify with supplier before ordering.',
  // Notes / normalization
  normalization_notes: notes,
  // Search
  search_tags: [brand, name, subcategory, 'aesthetic injectable', activeIngredient, productType].filter(Boolean),
  featured: false,
  created_at: admin.firestore.FieldValue.serverTimestamp(),
  updated_at: admin.firestore.FieldValue.serverTimestamp(),
  data_source: 'PRICE LIST DUBAI.xlsx / Gulf Order 04.01',
  data_prepared: '2026-09-25',
});

// ══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════
const PRODUCTS = [
  // ── DERMAL FILLERS ─────────────────────────────────────────────────────────
  ai('juvederm-ultra-2',        'AI-001', 'Ultra 2',              'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Lips', 'Fine lines', 'Perioral area'],                         86),
  ai('juvederm-ultra-3',        'AI-002', 'Ultra 3',              'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Nasolabial folds', 'Lips', 'Mid-face'],                        143),
  ai('juvederm-ultra-4',        'AI-003', 'Ultra 4',              'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Deep folds', 'Cheek contouring', 'Jaw'],                       143),
  ai('juvederm-voluma',         'AI-004', 'Voluma',               'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Cheek augmentation', 'Mid-face volume', 'Contouring'],         143),
  ai('juvederm-volbella',       'AI-005', 'Volbella',             'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Lips', 'Lip border', 'Perioral lines'],                       143),
  ai('juvederm-vollure',        'AI-006', 'Vollure',              'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Nasolabial folds', 'Marionette lines', 'Mid-face'],            143),
  ai('juvederm-volux',          'AI-007', 'Volux',                'JUVEDERM',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Chin', 'Jawline', 'Facial contouring'],                       150),
  ai('juvederm-volite',         'AI-008', 'Volite',               'JUVEDERM',  'Skin Boosters',   'Hyaluronic acid skin booster',             'Hyaluronic acid (HA)', ['Skin quality', 'Hydration', 'Fine lines'],                    150),
  ai('radiesse-15',             'AI-009', 'Radiesse 1.5mL',       'RADIESSE',  'Biostimulators',  'Calcium hydroxylapatite biostimulator',    'Calcium Hydroxylapatite (CaHA)', ['Hands', 'Face', 'Neck', 'Décolletage'],             120),
  ai('radiesse-3',              'AI-010', 'Radiesse 3mL',         'RADIESSE',  'Biostimulators',  'Calcium hydroxylapatite biostimulator',    'Calcium Hydroxylapatite (CaHA)', ['Body biostimulation', 'Face', 'Collagen induction'], 200),
  ai('sculptra',                'AI-011', 'Sculptra',             'SCULPTRA',  'Biostimulators',  'Poly-L-lactic acid (PLLA) biostimulator',  'Poly-L-Lactic Acid (PLLA)', ['Volume restoration', 'Temple hollowing', 'Facial rejuvenation'], 250),
  ai('teosyal-rha-1',           'AI-012', 'RHA 1',                'TEOSYAL',   'Dermal Fillers',  'Resilient hyaluronic acid filler',         'Resilient HA (RHA)', ['Periocular area', 'Fine lines', 'Neck'],                        95),
  ai('teosyal-rha-2',           'AI-013', 'RHA 2',                'TEOSYAL',   'Dermal Fillers',  'Resilient hyaluronic acid filler',         'Resilient HA (RHA)', ['Nasolabial folds', 'Dynamic lines', 'Forehead'],                110),
  ai('teosyal-rha-3',           'AI-014', 'RHA 3',                'TEOSYAL',   'Dermal Fillers',  'Resilient hyaluronic acid filler',         'Resilient HA (RHA)', ['Deep folds', 'Cheeks', 'Mid-face contouring'],                 115),
  ai('teosyal-rha-4',           'AI-015', 'RHA 4',                'TEOSYAL',   'Dermal Fillers',  'Resilient hyaluronic acid filler',         'Resilient HA (RHA)', ['Chin', 'Jaw', 'Structural contouring'],                        120),
  ai('teosyal-puresense-redensity-1', 'AI-016', 'Puresense Redensity 1', 'TEOSYAL', 'Skin Boosters', 'Skin booster / revitaliser',          'HA + Amino acids + Antioxidants', ['Skin revitalisation', 'Radiance', 'Texture'],        110),
  ai('teosyal-puresense-redensity-2', 'AI-017', 'Puresense Redensity 2', 'TEOSYAL', 'Skin Boosters', 'Tear trough filler',                  'HA (Redensity II)', ['Tear trough', 'Under-eye hollows'],                               110),
  ai('belotero-soft',           'AI-018', 'Belotero Soft',        'BELOTERO',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Fine lines', 'Periocular', 'Upper lip lines'],                 90),
  ai('belotero-balance',        'AI-019', 'Belotero Balance',     'BELOTERO',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Moderate lines', 'Nasolabial', 'Perioral'],                   100),
  ai('belotero-intense',        'AI-020', 'Belotero Intense',     'BELOTERO',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Deep folds', 'Volume', 'Lips'],                               110),
  ai('belotero-volume',         'AI-021', 'Belotero Volume',      'BELOTERO',  'Dermal Fillers',  'Hyaluronic acid dermal filler',            'Hyaluronic acid (HA)', ['Cheek volume', 'Facial contouring'],                          115),
  // ── SKIN BOOSTERS ─────────────────────────────────────────────────────────
  ai('profhilo-2ml',            'AI-022', 'Profhilo 2mL',         'PROFHILO',  'Skin Boosters',   'High-concentration HA bioremodeller',      'NAHYCO HA (High + Low MW)', ['Skin laxity', 'Hydration', 'Bioremodelling', 'Neck', 'Arms'], 180),
  ai('jalupro-classic',         'AI-023', 'Jalupro Classic',      'JALUPRO',   'Skin Boosters',   'Amino acid + HA skin revitaliser',         'HA + Amino acids (Glycine, L-Proline, L-Leucine, L-Lysine)', ['Skin hydration', 'Fine lines', 'Dull skin'], 75),
  ai('jalupro-hmw',             'AI-024', 'Jalupro HMW',          'JALUPRO',   'Skin Boosters',   'High molecular weight HA + amino acids',   'HMW-HA + Amino acids', ['Moderate skin laxity', 'Face', 'Neck', 'Décolletage'],       90),
  ai('restylane-skinbooster',   'AI-025', 'Restylane Skinbooster', 'RESTYLANE', 'Skin Boosters',  'HA skin booster (NASHA technology)',       'NASHA Hyaluronic acid', ['Skin texture', 'Hydration', 'Facial glow', 'Hands'],         120),
  ai('restylane-vital',         'AI-026', 'Restylane Vital',      'RESTYLANE', 'Skin Boosters',   'HA skin booster',                         'Hyaluronic acid (HA)', ['Skin quality', 'Radiance', 'Fine lines'],                     115),
  // ── BIOSTIMULATORS ────────────────────────────────────────────────────────
  ai('ellanse-s',               'AI-027', 'Ellansé S',            'ELLANSÉ',   'Biostimulators',  'PCL collagen stimulator (12–14 months)',   'Polycaprolactone (PCL)', ['Moderate lines', 'Mid-face', 'Face'],                       160),
  ai('ellanse-m',               'AI-028', 'Ellansé M',            'ELLANSÉ',   'Biostimulators',  'PCL collagen stimulator (18–24 months)',   'Polycaprolactone (PCL)', ['Deep folds', 'Volume restoration', 'Face'],                 175),
  ai('ellanse-l',               'AI-029', 'Ellansé L',            'ELLANSÉ',   'Biostimulators',  'PCL collagen stimulator (24–36 months)',   'Polycaprolactone (PCL)', ['Structural augmentation', 'Chin', 'Jaw', 'Cheeks'],         185),
  ai('ellanse-e',               'AI-030', 'Ellansé E',            'ELLANSÉ',   'Biostimulators',  'PCL collagen stimulator (up to 48 months)', 'Polycaprolactone (PCL)', ['Long-term volume', 'Structural correction', 'Face'],       195),
  // ── POLYNUCLEOTIDES ───────────────────────────────────────────────────────
  ai('nucleofill-medium',       'AI-031', 'Nucleofill Medium',    'NUCLEOFILL', 'Polynucleotides', 'Polynucleotide (PN) skin revitaliser',    'Polynucleotides (PDRN/PN)', ['Skin hydration', 'Tissue regeneration', 'Anti-ageing'],   95),
  ai('nucleofill-strong',       'AI-032', 'Nucleofill Strong',    'NUCLEOFILL', 'Polynucleotides', 'Polynucleotide (PN) skin revitaliser',    'Polynucleotides (PDRN/PN)', ['Hair loss', 'Scalp', 'Deep tissue regeneration'],          110),
  ai('plinest-classic',         'AI-033', 'Plinest Classic',      'PLINEST',   'Polynucleotides', 'Salmon-derived polynucleotide revitaliser', 'Salmon PDRN', ['Skin revitalisation', 'Anti-ageing', 'Acne scars'],                    90),
  ai('plinest-fast',            'AI-034', 'Plinest Fast',         'PLINEST',   'Polynucleotides', 'Polynucleotide skin booster',             'Salmon PDRN', ['Face', 'Neck', 'Rapid skin improvement'],                               100),
  ai('pluryal-silk',            'AI-035', 'Pluryal Silk',         'PLURYAL',   'Polynucleotides', 'HA + PN skin quality injection',          'HA + Polynucleotides', ['Skin quality', 'Luminosity', 'Fine lines'],                     85),
  ai('pronova-pn-plus',         'AI-036', 'Pronova PN Plus',      'PRONOVA',   'Polynucleotides', 'Polynucleotide tissue repair injection',  'Polynucleotides (PN)', ['Joint regeneration', 'Tendons', 'Skin repair', 'Hair'],         105),
  // ── FAT-DISSOLVING INJECTABLES ─────────────────────────────────────────────
  ai('lemon-bottle-5ml',        'AI-037', 'Lemon Bottle 5mL',     'LEMON BOTTLE', 'Fat-Dissolving Injectables', 'Premium fat-dissolving cocktail', 'Riboflavin + Bromelain + Lecithin', ['Localised fat', 'Double chin', 'Jowls', 'Body contouring'], 120),
  ai('lemon-bottle-10ml',       'AI-038', 'Lemon Bottle 10mL',    'LEMON BOTTLE', 'Fat-Dissolving Injectables', 'Premium fat-dissolving cocktail', 'Riboflavin + Bromelain + Lecithin', ['Body fat deposits', 'Abdomen', 'Flanks', 'Thighs'],          210),
  ai('belkyra-kybella',         'AI-039', 'Belkyra / Kybella',    'BELKYRA',   'Fat-Dissolving Injectables', 'Deoxycholic acid (approved lipolytic)', 'Deoxycholic acid (DCA)', ['Submental fat', 'Double chin'],                     200),
  ai('aqualyx-8ml',             'AI-040', 'Aqualyx 8mL',          'AQUALYX',   'Fat-Dissolving Injectables', 'Aqueous polymer solution lipolytic', 'Deoxycholate compound (Aqualyx)', ['Localised adiposity', 'Body contouring', 'Face'], 90),
];

// ══════════════════════════════════════════════════════════════════════════════
//  SEED
// ══════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log(`\n🎯  Seeding ${PRODUCTS.length} Aesthetic Injectable products to Firestore…\n`);

  let ok = 0;
  let fail = 0;

  // Ensure supplier document exists
  const supplierRef = db.collection('suppliers').doc(SUPPLIER_ID);
  const supplierSnap = await supplierRef.get();
  if (!supplierSnap.exists) {
    await supplierRef.set({
      id: SUPPLIER_ID,
      name: 'PHARMAMEDIC EXPORT, S.L.',
      country: 'Spain',
      address: 'Calle de Eros 16, 1ºC, 28045 Madrid, Spain',
      bigin_account_id: '7006116000001567031',
      contact_name: 'Lorenzo',
      contact_email: 'admin@pharmaspain.net',
      contact_phone: '+34 618 222 793',
      bigin_contact_id: '7006116000001559010',
      specialties: ['Aesthetic Injectables', 'Dermal Fillers', 'Skin Boosters', 'Biostimulators'],
      status: 'approved',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('  ✅  Supplier PHARMAMEDIC EXPORT created.');
  } else {
    console.log('  ℹ️   Supplier already exists, skipping.');
  }

  // Seed products in batches of 20
  for (let i = 0; i < PRODUCTS.length; i += 20) {
    const batch = db.batch();
    const chunk = PRODUCTS.slice(i, i + 20);
    for (const product of chunk) {
      const ref = db.collection('products').doc(product.id);
      const snap = await ref.get();
      if (snap.exists) {
        console.log(`  ⏭️   ${product.id} already exists — updating`);
        batch.update(ref, { ...product, updated_at: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        batch.set(ref, product);
      }
    }
    await batch.commit();
    chunk.forEach(p => {
      console.log(`  ✅  ${p.id}  (${p.subcategory})  — AED ${p.cost_price_aed}`);
      ok++;
    });
  }

  console.log(`\n✅  Done — ${ok} products seeded, ${fail} failed.\n`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
