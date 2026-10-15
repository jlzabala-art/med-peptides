const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function registerColvita() {
  const colvitaData = {
    id: 'colway-colvita',
    slug: 'colway-colvita',
    canonicalKey: 'colway-colvita',
    name: 'Colvita Bioactive Native Collagen & Marine Algae',
    canonicalName: 'Colvita Bioactive Native Collagen & Marine Algae',
    polish_name: 'Colvita (Liofilizowany Kolagen Rybi + Algi Morskie + Witamina E)',
    brand: 'Colway',
    vendor: 'Colway International',
    supplier: 'Colway International',
    supplierId: 'supplier-colway',
    suppliers: ['supplier-colway'],
    supplierIds: ['supplier-colway'],
    isSingleSupplierLocked: true,
    status: 'published',
    category: 'Dietary Supplement',
    therapeutic_category: 'Cellular ECM & Bioactive Tropocollagen Nutricosmetic',
    type: 'supplement',
    productType: 'supplement',
    is_supplement: true,
    isSupplement: true,
    dosageForm: 'Oral Route (100% Fish Gelatin Capsules)',
    dispensingForm: 'Oral Bioactive Capsules',
    leadTimeDays: 3,
    purity: 'Lyophilized Native Biologically Active Tropocollagen (Triple Helix Preserved)',
    rating: 4.95,
    reviewsCount: 78,
    cost: 28,
    price: 64,
    wholesale_price: 42,
    retail_price: 64,
    unit_price: 64,
    image: '/images/products/colway/colvita.png',
    images: ['/images/products/colway/colvita.png'],
    description:
      'Colvita is the legendary flagship nutricosmetic and dietary supplement developed by Colway Laboratories. Unlike conventional hydrolyzed collagens on the market that are denatured into broken peptide fragments, Colvita utilizes pure biologically active freeze-dried fish tropocollagen obtained through gentle low-temperature sublimation drying. This preserves the intact triple-helix spatial structure and high cellular bioavailability. Formulated synergistically with micronized marine bladderwrack algae (Fucus vesiculosus), a rich source of organic iodine, magnesium, calcium, and amino acids, and natural vitamin E (D-alpha-tocopheryl acetate) to stimulate fibroblast neo-collagenesis and protect cellular membranes against oxidative degradation.',
    shortDescription:
      'Pure Bioactive Freeze-Dried Fish Tropocollagen (Triple Helix) + Fucus vesiculosus Sea Algae + Natural Vitamin E in 100% fish gelatin capsules.',
    mechanism:
      'Freeze-dried native fish tropocollagen supplies complete signal peptides and essential amino acids (glycine, proline, hydroxyproline, and hydroxylysine) with rapid mucosal absorption. These bio-peptides trigger signal cascades in dermal and synovial fibroblasts, upregulating endogenous type I and type III collagen synthesis. Bladderwrack algae (Fucus vesiculosus) provides bio-available trace minerals and organic iodine supporting thyroid hormone synthesis and cellular metabolism, while D-alpha-tocopheryl vitamin E halts lipid peroxidation and guards newly formed extracellular matrix fibrils from oxidative cross-linking.',
    dosingInstructions:
      'Take 2 capsules daily, during or immediately after a meal with a full glass of water (fat in meals optimizes absorption of natural fat-soluble vitamin E). For optimal results in connective tissue, skin density, and follicular anchoring, maintain for a minimum course of 2 to 3 months (60–90 days).',
    activeIngredients: [
      {
        name: 'Lyophilized Native Fish Tropocollagen',
        dose: '240 mg (per 2 capsules)',
        inci_name: 'Freeze-Dried Marine Tropocollagen',
        target: 'Fibroblast Neo-Collagenesis & ECM Matrix Density',
        role: 'Preserves the biologically active triple helix; delivers intact building blocks and signaling peptides directly to dermal, joint, and follicular connective tissues.'
      },
      {
        name: 'Bladderwrack Sea Algae (Fucus vesiculosus Extract)',
        dose: '300 mg (per 2 capsules)',
        inci_name: 'Fucus Vesiculosus Powder',
        target: 'Cellular Mineralization & Thyroid Axis Synergy',
        role: 'Rich in organic iodine, trace minerals (potassium, calcium, magnesium, selenium, zinc), and polysaccharides, enhancing metabolic rate and extracellular collagen cross-linking.'
      },
      {
        name: 'Natural Vitamin E (D-alpha-Tocopheryl Acetate)',
        dose: '24 mg / 200% NRV (per 2 capsules)',
        inci_name: 'D-alpha-Tocopheryl Acetate',
        target: 'Cell Membrane Lipid Protection & Antioxidant Shield',
        role: 'Potent lipophilic antioxidant that scavenges free radicals, defends cell membrane polyunsaturated lipids, and protects newly synthesized collagen fibers.'
      }
    ],
    variants: [
      {
        id: 'colway-colvita-var-60',
        productId: 'colway-colvita',
        productName: 'Colvita Bioactive Native Collagen',
        name: 'Colvita - 60 Capsules (30-Day Supply)',
        sku: 'SKU-COLWAY-COLVITA-60',
        format: 'Capsules',
        dosage: '60 Capsules',
        size: '60 Capsules Bottle',
        pricing: {
          master: { perUnit: 28, currency: 'USD' },
          wholesale: { perUnit: 42, currency: 'USD' },
          clinic: { perUnit: 49, currency: 'USD' },
          retail: { perUnit: 64, currency: 'USD' }
        },
        cost: 28,
        price: 64,
        unit_price: 64,
        stock: { available: 50, allocated: 0, reserved: 0 },
        reorderPoint: 10,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        hasCoa: true,
        hasGmp: true,
        status: 'published',
        volume: '60 Capsules'
      },
      {
        id: 'colway-colvita-var-120',
        productId: 'colway-colvita',
        productName: 'Colvita Bioactive Native Collagen',
        name: 'Colvita - 120 Capsules (60-Day Supply)',
        sku: 'SKU-COLWAY-COLVITA-120',
        format: 'Capsules',
        dosage: '120 Capsules',
        size: '120 Capsules Bottle',
        pricing: {
          master: { perUnit: 50, currency: 'USD' },
          wholesale: { perUnit: 74, currency: 'USD' },
          clinic: { perUnit: 86, currency: 'USD' },
          retail: { perUnit: 112, currency: 'USD' }
        },
        cost: 50,
        price: 112,
        unit_price: 112,
        stock: { available: 45, allocated: 0, reserved: 0 },
        reorderPoint: 10,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        hasCoa: true,
        hasGmp: true,
        status: 'published',
        volume: '120 Capsules'
      }
    ],
    formats: [
      { id: 'bottle-60', name: '60 Capsules Bottle (30-Day Protocol)', description: '2 capsules daily' },
      { id: 'bottle-120', name: '120 Capsules Bottle (60-Day Protocol)', description: '2 capsules daily' }
    ],
    strengths: [
      { id: 'st-60', name: '60 Capsules (30 Days)' },
      { id: 'st-120', name: '120 Capsules (60 Days)' }
    ],
    keywords: [
      'Colvita',
      'Colway',
      'Native Collagen',
      'Liofilizowany Kolagen',
      'Fucus vesiculosus',
      'Vitamin E',
      'Marine Collagen',
      'Collagen Capsules',
      'Tropocollagen',
      'Poland Collagen',
      'Skin Firming',
      'Joint Cartilage'
    ],
    origin: 'Poland (EU)',
    compliance: 'EU Food Supplement Regulation & GMP Compliant · GIS Registered',
    updatedAt: new Date().toISOString()
  };

  await db.collection('products').doc('colway-colvita').set(colvitaData, { merge: true });
  console.log('✅ colway-colvita successfully registered in Firestore products collection!');
}

registerColvita()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error registering Colvita:', err);
    process.exit(1);
  });
