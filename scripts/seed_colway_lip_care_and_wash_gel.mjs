import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function seedColwayProducts() {
  console.log('--- Seeding Colway Lip Care & Wash Gel to Firestore ---');

  const now = new Date().toISOString();

  // 1. Colway Bioactive Collagen Lip Care
  const lipCareDoc = {
    id: 'colway-collagen-lip-care',
    slug: 'colway-collagen-lip-care',
    name: 'Bioactive Collagen Lip Care',
    title: 'Bioactive Collagen Lip Care & Vermilion Restorative Serum',
    brand: 'Colway International',
    vendor: 'Colway International',
    supplierId: 'supplier-colway',
    supplierName: 'Colway International',
    category: 'cosmetics',
    status: 'published',
    isPublished: true,
    visibility: 'public',
    format: 'Labial & Mucosa',
    size: '3 × 4.2 g Sticks (Clinical Pack)',
    volume: '12.6 g (3 Sticks)',
    image: '/images/products/colway/lip-care.png',
    imageUrl: '/images/products/colway/lip-care.png',
    heroImage: '/images/products/colway/lip-care.png',
    images: ['/images/products/colway/lip-care.png'],
    price: 28,
    wholesale_price: 16,
    unit_price: 28,
    retail_price: 28,
    cost: 10,
    currency: 'USD',
    shortDescription: 'Advanced bioactive lip serum combining native marine tropocollagen, Palmitoyl Oligopeptide, and cold-pressed botanical lipids for mucosal barrier repair.',
    description: 'Colway Bioactive Collagen Lip Care is a clinically formulated transdermal lip serum designed for intensive mucosal barrier regeneration. Featuring preserved triple-helix native tropocollagen, Palmitoyl Oligopeptide (Bio-Peptide CL), and an esterified antioxidant network of Vitamins C and E, it restores the vermilion border, prevents trans-epidermal water loss (TEWL), and accelerates recovery following aesthetic procedures or drying systemic pharmacotherapies.',
    clinical_indications: [
      'Post-procedure mucosal recovery (lip filler hydration, perioral microneedling, laser resurfacing)',
      'Cheilitis and severe vermilion micro-fissuring induced by systemic isotretinoin or topical retinoids',
      'Solar elastosis and photo-induced volume loss of the labial vermilion',
      'Extreme environmental protection against arid desert winds and sub-zero dehydration'
    ],
    mechanism_of_action: 'Delivers native tropocollagen micro-fragments and bio-identical palmitoyl oligopeptide to stimulate endogenous collagen and hyaluronic acid synthesis in the labial mucosa. Simmondsia chinensis (jojoba) and argan oil matrices reconstitute the intercellular lipid cement, forming a breathable semi-permeable film that prevents dehydration without occlusive comedogenicity.',
    active_complexes: [
      {
        name: 'Native Tropocollagen & Elastin Peptides',
        description: 'Biologically active marine collagen in native triple-helix conformation, restoring cellular hydration and viscoelastic turgor to the vermilion border.'
      },
      {
        name: 'Palmitoyl Oligopeptide (Bio-Peptide CL)',
        description: 'Clinically proven messenger peptide fragment that signals fibroblasts to upregulate collagen I and glycosaminoglycan synthesis.'
      },
      {
        name: 'Biomimetic Lipid Shield (Jojoba, Argan & Shea)',
        description: 'Non-comedogenic cold-pressed botanical triglycerides restoring the fragile hydrolipid film of the labial mucosa.'
      },
      {
        name: 'Esterified Vitamin C & E Synergistic Matrix',
        description: 'Lipophilic Ascorbyl Palmitate and Tocopheryl Acetate providing dual antioxidant defense against UV-induced lipid peroxidation.'
      }
    ],
    inci_list: [
      {
        inci_name: 'Paraffinum Liquidum',
        common_name: 'Pharmaceutical Mineral Oil',
        function: ['Protective Emollient'],
        inci_group: 'functional',
        role: 'High-purity medical grade barrier base that limits transepidermal moisture loss.'
      },
      {
        inci_name: 'Petrolatum',
        common_name: 'Medical Petrolatum',
        function: ['Occlusive Barrier'],
        inci_group: 'functional',
        role: 'Gold-standard dermato-protective agent shielding micro-fissures from saliva enzymes.'
      },
      {
        inci_name: 'Synthetic Beeswax',
        common_name: 'Beeswax Structure Matrix',
        function: ['Consistency Factor'],
        inci_group: 'functional',
        role: 'Provides structural firmness and uniform melting point at physiological lip temperature.'
      },
      {
        inci_name: 'Ozokerite',
        common_name: 'Ozokerite Mineral Wax',
        function: ['Wax Binder'],
        inci_group: 'functional',
        role: 'Stabilizes lipid emulsion and prevents stick deformation in high ambient temperatures.'
      },
      {
        inci_name: 'Simmondsia Chinensis (Jojoba) Seed Oil',
        common_name: 'Cold-Pressed Jojoba Oil',
        function: ['Biomimetic Lipid', 'Barrier Shield'],
        inci_group: 'key_active',
        role: 'Liquid wax ester mirroring human sebum, rapidly absorbing into mucosa without greasy film.'
      },
      {
        inci_name: 'Butyrospermum Parkii Butter',
        common_name: 'Unrefined Shea Butter',
        function: ['Deep Lipid Replenishment', 'Soothing'],
        inci_group: 'key_active',
        role: 'Rich in phytosterols and cinnamic acid esters that calm stinging and micro-inflammation.'
      },
      {
        inci_name: 'Tocopheryl Acetate',
        common_name: 'Vitamin E Acetate',
        function: ['Lipophilic Antioxidant'],
        inci_group: 'key_active',
        role: 'Protects fragile mucosal membranes against environmental oxidative stress and premature aging.'
      },
      {
        inci_name: 'Ascorbyl Palmitate',
        common_name: 'Lipid-Soluble Vitamin C',
        function: ['Collagen Co-Factor', 'Antioxidant'],
        inci_group: 'key_active',
        role: 'Stable esterified Vitamin C that neutralizes free radicals and supports collagen synthesis.'
      },
      {
        inci_name: 'Argania Spinosa Kernel Oil',
        common_name: 'Organic Moroccan Argan Oil',
        function: ['Tissue Softener', 'Fatty Acid Supply'],
        inci_group: 'key_active',
        role: 'Delivers high concentrations of linoleic and oleic acids to repair damaged stratum corneum.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Marine Tropocollagen',
        function: ['Hydration Scaffold', 'Cellular Matrix'],
        inci_group: 'key_active',
        role: 'Core biologically active fish-derived collagen preserving triple-helix elasticity.'
      },
      {
        inci_name: 'Elastin & Elastin Amino Acids',
        common_name: 'Bio-Identical Elastin Polypeptides',
        function: ['Tissue Flexibility', 'Elastic Recovery'],
        inci_group: 'key_active',
        role: 'Restores contractile elasticity and prevents angular cheilitis tearing upon smiling.'
      },
      {
        inci_name: 'Palmitoyl Oligopeptide',
        common_name: 'Bio-Peptide CL Messenger',
        function: ['Pro-Collagen Stimulator', 'Redensifier'],
        inci_group: 'key_active',
        role: 'Stimulates neo-collagenesis and hyaluronic acid synthesis, smoothing vertical lip wrinkles.'
      }
    ],
    total_ingredients_count: 19,
    variants: [
      {
        id: 'colway-lip-care-var-3pack',
        productId: 'colway-collagen-lip-care',
        productName: 'Bioactive Collagen Lip Care - 3-Pack Clinical Set',
        name: 'Colway Collagen Lip Care (3-Pack)',
        sku: 'SKU-COLWAY-LIP-3PK',
        format: 'Labial Sticks',
        dosage: '3 × 4.2 g',
        size: '3-Piece Set',
        pricing: {
          master: { perUnit: 10, currency: 'USD' },
          wholesale: { perUnit: 16, currency: 'USD' },
          clinic: { perUnit: 20, currency: 'USD' },
          retail: { perUnit: 28, currency: 'USD' }
        },
        cost: 10,
        price: 28,
        stock: { available: 45, allocated: 0, reserved: 0 },
        reorderPoint: 10,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        hasCoa: true,
        hasGmp: true,
        status: 'published',
        unit_price: 28
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // 2. Colway Cellular Collagen Face & Body Wash Gel
  const washGelDoc = {
    id: 'colway-collagen-wash-gel',
    slug: 'colway-collagen-wash-gel',
    name: 'Cellular Collagen Hydrolipid Wash Gel',
    title: 'Cellular Collagen Hydrolipid Wash Gel (pH 5.5)',
    brand: 'Colway International',
    vendor: 'Colway International',
    supplierId: 'supplier-colway',
    supplierName: 'Colway International',
    category: 'cosmetics',
    status: 'published',
    isPublished: true,
    visibility: 'public',
    format: 'Face & Body Cleanser',
    size: '250 mL Pump Bottle',
    volume: '250 mL',
    image: '/images/products/colway/washing-gel.png',
    imageUrl: '/images/products/colway/washing-gel.png',
    heroImage: '/images/products/colway/washing-gel.png',
    images: ['/images/products/colway/washing-gel.png'],
    price: 42,
    wholesale_price: 24,
    unit_price: 42,
    retail_price: 42,
    cost: 15,
    currency: 'USD',
    shortDescription: 'Ultra-mild physiological pH 5.5 non-stripping cleansing gel formulated with native tropocollagen, D-Panthenol, and Gluconolactone for sensitized post-procedure skin.',
    description: 'Colway Cellular Collagen Hydrolipid Wash Gel is an advanced dermato-cosmetic cleanser engineered to respect the cutaneous microbiome and acid mantle. Featuring a 100% sulfate-free amphoteric surfactant matrix, bio-active fish collagen peptides, Provitamin B5, and natural polyhydroxy acid (Gluconolactone), it dissolves impurities and cellular debris while maintaining epidermal lipid cohesion and cellular hydration.',
    clinical_indications: [
      'Gentle pre-treatment decontamination before topical peptide, retinoid, or minoxidil application',
      'Daily non-stripping hygiene for reactive, rosacea-prone, or atopic skin with compromised barrier',
      'Post-procedure cleansing following chemical peels, fractional lasers, or facial microneedling',
      'Non-irritating facial wash safe for delicate periocular and mucosal zones'
    ],
    mechanism_of_action: 'Utilizes high-tolerance amphoteric and non-ionic coconut glucosides that lift lipids without disrupting intercellular ceramide lamellae. Native tropocollagen electrostatically binds to keratin surface residues during rinsing, leaving an invisible hydrophilic bio-veil that eliminates post-wash skin tightness. Gluconolactone provides micro-keratolysis to keep follicular ostia unblocked.',
    active_complexes: [
      {
        name: 'Sulfate-Free Amphoteric Surfactant Matrix',
        description: 'Zero SLS/SLES surfactant system formulated with Sodium Cocoamphoacetate and Cocamidopropyl Betaine, with ocular-grade tolerance.'
      },
      {
        name: 'Native Tropocollagen Complex',
        description: 'Biologically active triple-helix fish collagen peptides that shield against cleansing-induced trans-epidermal moisture loss.'
      },
      {
        name: 'Gluconolactone (PHA Micro-Exfoliant)',
        description: 'Natural polyhydroxy acid with gentle keratolytic action that refines skin texture without erythema or stinging.'
      },
      {
        name: 'Provitamin B5 (Panthenol) & Noni Bioferment',
        description: 'Synergistic cellular calming complex that downregulates pro-inflammatory cytokines and reinforces epidermal barrier integrity.'
      }
    ],
    inci_list: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water Base',
        function: ['Solvent'],
        inci_group: 'functional',
        role: 'Deionized pharmaceutical base ensuring optimal bio-peptide stability.'
      },
      {
        inci_name: 'Sodium Cocoamphoacetate',
        common_name: 'Ultra-Mild Coconut Surfactant',
        function: ['Gentle Cleanser', 'Barrier Safe'],
        inci_group: 'key_active',
        role: 'Extremely mild amphoteric surfactant with zero irritation potential, preserving barrier lipids.'
      },
      {
        inci_name: 'Cocamidopropyl Betaine',
        common_name: 'Foam Booster & Cleanser',
        function: ['Secondary Cleanser'],
        inci_group: 'functional',
        role: 'Gentle surfactant creating velvety micro-foam that cushions friction during washing.'
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerin',
        function: ['Humectant'],
        inci_group: 'functional',
        role: 'Draws moisture into stratum corneum, counteracting wash-induced dehydration.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Biologically Active Fish Tropocollagen',
        function: ['Peptide Hydrator', 'Barrier Shield'],
        inci_group: 'key_active',
        role: 'Native triple-helix collagen that leaves a protective moisture veil on keratinocytes.'
      },
      {
        inci_name: 'Panthenol & Pantolactone',
        common_name: 'D-Panthenol (Provitamin B5)',
        function: ['Epithelial Repair', 'Anti-Inflammatory'],
        inci_group: 'key_active',
        role: 'Soothes erythema, promotes re-epithelialization and suppresses neurosensory stinging.'
      },
      {
        inci_name: 'Gluconolactone',
        common_name: 'Polyhydroxy Acid (PHA)',
        function: ['Gentle Keratolytic', 'Antioxidant'],
        inci_group: 'key_active',
        role: 'Loosens pore-clogging dead corneocytes without irritation; chelates heavy metals.'
      },
      {
        inci_name: 'Aloe Barbadensis Leaf Extract',
        common_name: 'Pure Aloe Leaf Gel Extract',
        function: ['Soothe & Hydrate'],
        inci_group: 'key_active',
        role: 'Delivers acemannan polysaccharides that calm acute micro-inflammation.'
      },
      {
        inci_name: 'Morinda Citrifolia Fruit Extract',
        common_name: 'Noni Fruit Antioxidant Extract',
        function: ['Free Radical Scavenger', 'Cellular Protection'],
        inci_group: 'key_active',
        role: 'Rich in bioflavonoids and iridoids that support natural skin immunity.'
      }
    ],
    total_ingredients_count: 20,
    variants: [
      {
        id: 'colway-wash-gel-var-250ml',
        productId: 'colway-collagen-wash-gel',
        productName: 'Cellular Collagen Hydrolipid Wash Gel (250 mL)',
        name: 'Colway Collagen Wash Gel - 250 mL',
        sku: 'SKU-COLWAY-WASH-250',
        format: 'Dispenser Bottle',
        dosage: '250 mL',
        size: '250 mL Pump Bottle',
        pricing: {
          master: { perUnit: 15, currency: 'USD' },
          wholesale: { perUnit: 24, currency: 'USD' },
          clinic: { perUnit: 30, currency: 'USD' },
          retail: { perUnit: 42, currency: 'USD' }
        },
        cost: 15,
        price: 42,
        stock: { available: 35, allocated: 0, reserved: 0 },
        reorderPoint: 8,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        hasCoa: true,
        hasGmp: true,
        status: 'published',
        unit_price: 42,
        volume: '250 mL'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  await db.collection('products').doc('colway-collagen-lip-care').set(lipCareDoc, { merge: true });
  console.log('Successfully created/merged product: colway-collagen-lip-care ✓');

  await db.collection('products').doc('colway-collagen-wash-gel').set(washGelDoc, { merge: true });
  console.log('Successfully created/merged product: colway-collagen-wash-gel ✓');

  console.log('--- Colway products seeding complete! ---');
}

seedColwayProducts().catch(err => {
  console.error('Error seeding Colway products:', err);
  process.exit(1);
});
