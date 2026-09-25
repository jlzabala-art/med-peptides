/**
 * seed-colway-hair-products.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Firestore seed script — Colway International Hair Products
 * 
 * Products:
 *   1. colway-strengthening-shampoo
 *   2. colway-strengthening-conditioner
 *
 * Run:
 *   node scripts/seed-colway-hair-products.js
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS or firebase-admin initialized
 *   - firebase-admin installed
 */

const admin = require('firebase-admin');

// Init only if not already done
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccount-target.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

// ── Shared ingredient lists ────────────────────────────────────────────────────
const SHAMPOO_INGREDIENTS = [
  { name: 'Native Collagen', role: 'Structural protein matrix reinforcement' },
  { name: 'Biotin (Vitamin B7)', role: '5α-reductase support & keratin co-enzyme' },
  { name: 'Keratin Hydrolysate', role: 'Cuticle sealing & cortical gap filling' },
  { name: 'Caffeine Extract', role: 'Anagen phase extension via IGF-1 stimulation' },
  { name: 'Zinc PCA', role: 'DHT inhibition at scalp level (5α-reductase inhibitor)' },
  { name: 'Niacinamide (Vitamin B3)', role: 'Scalp microvascular VEGF upregulation' },
  { name: 'Panthenol (Pro-Vitamin B5)', role: 'Moisture retention & shaft swelling' },
  { name: 'Hydrolysed Wheat Protein', role: 'Mechanical resistance & electrostatic film' },
  { name: 'Silk Amino Acids', role: 'Friction reduction & cuticle manageability' },
  { name: 'Aloe Vera Extract', role: 'Scalp anti-inflammatory & hydration' },
  { name: 'Aqua (Water)', role: 'Vehicle / solvent' },
  { name: 'Sodium Laureth Sulfate', role: 'Cleansing surfactant (mild, SLS-free formula)' },
  { name: 'Cocamidopropyl Betaine', role: 'Amphoteric co-surfactant, scalp mildness' },
  { name: 'Glycerin', role: 'Humectant, scalp barrier support' },
  { name: 'Citric Acid', role: 'pH adjuster (target pH 4.5–5.5)' },
  { name: 'Phenoxyethanol', role: 'Preservative system' },
];

const CONDITIONER_INGREDIENTS = [
  { name: 'Native Collagen', role: 'Structural protein matrix reinforcement' },
  { name: 'Keratin Hydrolysate', role: 'Cuticle sealing & cortical gap filling' },
  { name: 'Panthenol (Pro-Vitamin B5)', role: 'Deep moisture retention & shaft swelling' },
  { name: 'Biotin (Vitamin B7)', role: 'Keratinocyte differentiation support' },
  { name: 'Argan Oil (Argania Spinosa)', role: 'Lipid barrier sealing, UV protection, tocopherol antioxidants' },
  { name: 'Silk Amino Acids (Fibroin)', role: 'Surface friction reduction, cuticle alignment' },
  { name: 'Hydrolysed Wheat Protein', role: 'Electrostatic bonding, volumising & mechanical protection' },
  { name: 'Cetyl Alcohol', role: 'Emollient, emulsifier, texture modifier' },
  { name: 'Behentrimonium Chloride', role: 'Quaternary conditioning agent, anti-static' },
  { name: 'Niacinamide (Vitamin B3)', role: 'Scalp microcirculation support' },
  { name: 'Vitamin E (Tocopheryl Acetate)', role: 'Antioxidant protection against oxidative shaft damage' },
  { name: 'Glycerin', role: 'Humectant, barrier support' },
  { name: 'Aqua (Water)', role: 'Vehicle / solvent' },
  { name: 'Citric Acid', role: 'pH adjuster (4.5–5.5)' },
  { name: 'Phenoxyethanol', role: 'Preservative system' },
];

// ── Shared clinical metadata ───────────────────────────────────────────────────
const ASSOCIATED_PROTOCOLS = [
  {
    id: 'hair-loss-androgenic-alopecia',
    slug: 'hair-loss-androgenic-alopecia',
    name: 'Androgenic Alopecia — DHT & Follicular Peptide Protocol',
    category: 'Hair Loss',
    duration: '16 Weeks',
    isPrimary: true,
    tagline: 'Multi-modal: DHT blockade + follicular peptides'
  },
  {
    id: 'ghk-cu-hair-regeneration',
    slug: 'ghk-cu-hair-regeneration',
    name: 'GHK-Cu Hair Follicle Regeneration Protocol',
    category: 'Hair Regeneration',
    duration: '12 Weeks',
    tagline: 'Copper peptide · Stem cell activation · Anagen extension'
  },
  {
    id: 'epithalon-longevity-hair',
    slug: 'epithalon-longevity-hair',
    name: 'Epithalon Anti-Aging & Hair Cycle Restoration',
    category: 'Longevity & Hair',
    duration: '20 Days',
    tagline: 'Telomere extension · Follicular rhythm reset'
  }
];

// ── Product documents ──────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'colway-strengthening-shampoo',
    slug: 'colway-strengthening-shampoo',
    canonicalName: 'Colway Strengthening Shampoo',
    name: 'Strengthening Hair Shampoo',
    brand: 'Colway International',
    supplier: 'Colway',
    supplier_id: 'colway',
    category: 'cosmetics',
    subcategory: 'Hair & Scalp',
    goal: 'Hair',
    formulation_type: 'Cosmeceutical Shampoo',
    standard: 'EU Cosmetics Regulation · Dermatologically Tested',
    target_pathway: 'Follicular Anagen Phase & DHT Inhibition',
    status: 'published',
    language: 'en',

    // ── Images ──
    image_url: 'https://colway.pl/wp-content/uploads/2024/09/szampon-wzmacniajacy-wlosy-colway.png',
    source_url: 'https://colway.pl/produkty/szampon-wzmacniajacy-wlosy/',

    // ── Description ──
    description: 'Colway Strengthening Hair Shampoo is an advanced cosmeceutical formula that bridges the power of nature with modern trichological science. Engineered for individuals suffering from androgenic alopecia, telogen effluvium, or diffuse hair thinning, it combines native collagen with 11 clinically validated active compounds. The formula targets the follicular microenvironment by inhibiting DHT accumulation at the scalp, extending the anagen growth phase via caffeine-driven IGF-1 signalling, and reinforcing the keratin matrix from root to tip.',
    overview_summary: 'Advanced multi-active shampoo with native collagen, biotin, caffeine, zinc PCA, and keratin for follicular strengthening and DHT inhibition.',
    clinical_rationale: 'The primary drivers of hair loss — DHT accumulation, reduced anagen duration, and keratin matrix weakness — are addressed by the combination of Zinc PCA (5α-reductase inhibition), caffeine extract (anagen extension via adenosine receptor antagonism), and native collagen + keratin hydrolysate (cortex reinforcement).',
    
    // ── Ingredients ──
    ingredients: SHAMPOO_INGREDIENTS,

    // ── Usage ──
    usage_steps: [
      'Apply a generous amount to wet hair and scalp. Distribute evenly from roots to tips.',
      'Gently massage the scalp for 2–3 minutes using firm circular motions to activate caffeine & niacinamide-driven microcirculation.',
      'Leave the formula on the scalp for 3–5 minutes to maximise follicular caffeine penetration.',
      'Rinse thoroughly with lukewarm water (≤38°C). Avoid hot water which disrupts the cuticle.',
      'For best results, use 3–4× per week in combination with the Colway Strengthening Conditioner for a minimum of 8 weeks.'
    ],

    // ── Safety ──
    warnings: [
      'For external use only. Avoid contact with eyes; rinse immediately with water if contact occurs.',
      'Perform a patch test 24h before first full use to rule out sensitisation.',
      'Not recommended on open scalp lesions or active inflammatory dermatitis without dermatological supervision.',
      'Keep out of reach of children under 3 years.',
      'Discontinue if erythema, pruritus or allergic reaction develops.'
    ],

    // ── Protocol integration ──
    associated_protocols: ASSOCIATED_PROTOCOLS,

    // ── Paired product ──
    paired_product: {
      slug: 'colway-strengthening-conditioner',
      name: 'Colway Strengthening Conditioner'
    },

    // ── Variants ──
    variants: [
      {
        id: 'colway-shampoo-250ml',
        name: '250 mL Bottle',
        volume: '250 mL',
        presentation: '250 mL',
        unit_price: 29.00,
        price_usd: 29.00,
        currency: 'USD',
        sku: 'CWY-SHP-250'
      }
    ],

    // ── SEO ──
    meta_title: 'Colway Strengthening Shampoo — Medical-Grade Hair Loss Solution | Atlas Health',
    meta_description: 'Colway native collagen shampoo with caffeine, zinc PCA and biotin. Clinically mapped ingredients for androgenic alopecia, telogen effluvium and follicular strengthening.',

    // ── Firestore housekeeping ──
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    version: '1.0.0',
    source: 'colway_manual_import_2026'
  },

  {
    id: 'colway-strengthening-conditioner',
    slug: 'colway-strengthening-conditioner',
    canonicalName: 'Colway Strengthening Conditioner',
    name: 'Strengthening Hair Conditioner',
    brand: 'Colway International',
    supplier: 'Colway',
    supplier_id: 'colway',
    category: 'cosmetics',
    subcategory: 'Hair & Scalp',
    goal: 'Hair',
    formulation_type: 'Leave-In Cosmeceutical Conditioner',
    standard: 'EU Cosmetics Regulation · Dermatologically Tested',
    target_pathway: 'Keratin Cortex Reinforcement & Cuticle Sealing',
    status: 'published',
    language: 'en',

    // ── Images ──
    image_url: 'https://colway.pl/wp-content/uploads/2024/09/odzywka-wzmacniajaca-wlosy.png',
    source_url: 'https://colway.pl/produkty/odzywka-wzmacniajaca-wlosy/',

    // ── Description ──
    description: 'The Colway Strengthening Conditioner is an innovative cosmeceutical formulated to work synergistically with the Strengthening Shampoo, amplifying and accelerating outcomes in the treatment of weakened and thinning hair. Built on the brand\'s signature native collagen technology, it combines argan oil, silk amino acids, keratin hydrolysate, and panthenol to deliver a four-phase repair mechanism: cortex reinforcement, cuticle sealing, moisture retention, and long-term follicular health support. Ideal for patients following hair restoration peptide protocols.',
    overview_summary: 'Professional-grade conditioning treatment with native collagen, argan oil, silk proteins, and keratin for cortex repair and cuticle alignment.',
    clinical_rationale: 'Conditioner compounds address two key structural vulnerabilities: inter-fibre porosity (sealed by argan oil and silk amino acids) and intra-cortex micro-fractures (filled by keratin hydrolysate and collagen tripeptides). Panthenol binding to cortical proteins increases shaft diameter by up to 15% through sustained water retention.',

    // ── Ingredients ──
    ingredients: CONDITIONER_INGREDIENTS,

    // ── Usage ──
    usage_steps: [
      'After shampooing, gently squeeze excess water from hair. Do not rub vigorously — the cuticle is most vulnerable when wet.',
      'Apply conditioner generously to mid-lengths and tips. For severe damage or dryness, apply to the full length including root area.',
      'Work through the hair with fingers or a wide-tooth comb to ensure even distribution of active compounds.',
      'Leave on for 5–10 minutes to allow argan oil, silk proteins, and collagen to penetrate and bind to the cortex.',
      'Rinse with cool to lukewarm water (≤35°C). Cold rinsing encourages cuticle closure and enhances shine.',
      'Use after every shampooing session. Combine with the Strengthening Shampoo for maximum clinical benefit.'
    ],

    // ── Safety ──
    warnings: [
      'For external use only. Avoid contact with eyes; rinse immediately if contact occurs.',
      'Not intended for use as a leave-in treatment unless specifically directed by a trichologist.',
      'Perform a patch test 24h before first use if sensitivity to any ingredient is suspected.',
      'Discontinue if allergic reaction, erythema or persistent scalp irritation develops.',
      'Keep out of reach of children under 3 years of age.'
    ],

    // ── Protocol integration ──
    associated_protocols: ASSOCIATED_PROTOCOLS,

    // ── Paired product ──
    paired_product: {
      slug: 'colway-strengthening-shampoo',
      name: 'Colway Strengthening Shampoo'
    },

    // ── Variants ──
    variants: [
      {
        id: 'colway-conditioner-250ml',
        name: '250 mL Tube',
        volume: '250 mL',
        presentation: '250 mL',
        unit_price: 32.00,
        price_usd: 32.00,
        currency: 'USD',
        sku: 'CWY-CDN-250'
      }
    ],

    // ── SEO ──
    meta_title: 'Colway Strengthening Conditioner — Keratin & Collagen Hair Repair | Atlas Health',
    meta_description: 'Colway native collagen conditioner with argan oil, silk proteins and panthenol. Medical-grade cosmeceutical for hair cortex repair, cuticle sealing and follicular health.',

    // ── Firestore housekeeping ──
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    version: '1.0.0',
    source: 'colway_manual_import_2026'
  }
];

// ── Seed execution ─────────────────────────────────────────────────────────────
async function seedColwayProducts() {
  console.log('🌿 Starting Colway hair products seed...\n');
  const batch = db.batch();

  for (const product of PRODUCTS) {
    const { variants, ...docData } = product;

    // Main product document
    const productRef = db.collection('products').doc(product.id);
    batch.set(productRef, docData, { merge: true });
    console.log(`  ✓ Queued: ${product.id}`);

    // Variants as subcollection
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const variantRef = productRef.collection('variants').doc(variant.id);
        batch.set(variantRef, {
          ...variant,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`    └─ Variant: ${variant.id} (${variant.volume})`);
      }
    }
  }

  await batch.commit();
  console.log('\n✅ Colway products seeded successfully!');
  console.log('\nPublic URLs:');
  PRODUCTS.forEach(p => console.log(`  → https://med-peptides.com/product/${p.slug}`));
  process.exit(0);
}

seedColwayProducts().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
