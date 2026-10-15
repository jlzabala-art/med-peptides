import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function seedColwayVegeAndBlueLine() {
  console.log('--- Seeding Colway Collagen Vege & Blue Diamond Line to Firestore ---');

  const now = new Date().toISOString();

  // 1. Colway Collagen Vege (Kolagen Vege)
  const vegeDoc = {
    id: 'colway-collagen-vege',
    slug: 'colway-collagen-vege',
    name: 'Collagen Vege (100% Plant-Based Bioactive Collagen)',
    title: 'Collagen Vege — 100% Botanical Native Tropocollagen Analogue (pH 5.5)',
    brand: 'Colway',
    vendor: 'Colway',
    supplierId: 'supplier-colway',
    supplierName: 'Colway International',
    category: 'cosmetics',
    status: 'published',
    isPublished: true,
    visibility: 'public',
    format: 'Dermal Bio-Gel',
    size: '45 mL Airless Dispenser',
    volume: '45 mL',
    image: '/images/products/colway/vege-collagen.png',
    imageUrl: '/images/products/colway/vege-collagen.png',
    heroImage: '/images/products/colway/vege-collagen.png',
    images: ['/images/products/colway/vege-collagen.png'],
    price: 68,
    wholesale_price: 38,
    unit_price: 68,
    retail_price: 68,
    cost: 22,
    currency: 'USD',
    shortDescription: 'World’s first 100% plant-based bioactive collagen gel replicating the full human tropocollagen type I aminogram with hydroxyproline from Chlorella vulgaris microalgae.',
    description: 'Colway Collagen Vege represents a biotechnology milestone: the first 100% vegan, cruelty-free cosmetic gel that delivers the exact amino acid profile of human vertebrate tropocollagen type I. Engineered with green algae (Chlorella vulgaris) hydroxyproline, an organic coconut water base, Centella Asiatica, and high-molecular hyaluronic acid, it delivers deep cellular hydration, stimulates fibroblast neocollagenesis, and calms irritated or sensitized skin without animal-derived constituents.',
    clinical_indications: [
      'Daily anti-aging and dermal matrix firming for vegan, ethical, or hypoallergenic protocols',
      'Post-procedure epidermal soothing following chemical peels, microneedling, or non-ablative lasers',
      'Deep cutaneous rehydration for sensitized, barrier-compromised, or rosacea-prone skin',
      'Loss of cutaneous turgor, micro-wrinkles, and UV-induced solar elastosis'
    ],
    mechanism_of_action: 'Delivers plant-isolated hydroxyproline and essential amino acids directly to the epidermal-dermal junction. Phyto-derived kinetin and Chlorella vulgaris peptides upregulate procollagen mRNA transcription in dermal fibroblasts, while the isotonic coconut water matrix provides physiological electrolyte balance (potassium, magnesium, calcium) to accelerate cellular healing.',
    active_complexes: [
      {
        name: 'Chlorella Vulgaris Hydroxyproline Matrix',
        description: 'First plant-isolated hydroxyproline from freshwater microalgae cell walls, supplying the critical rate-limiting amino acid for stable collagen triple-helix assembly.'
      },
      {
        name: 'Isotonic Young Coconut Water Base (Cocos Nucifera)',
        description: 'Natural mineral and B-vitamin reservoir replacing conventional deionized water, enhancing transdermal bioavailability and barrier recovery.'
      },
      {
        name: 'Centella Asiatica & Betula Alba (Birch) Complex',
        description: 'Synergistic botanical extract rich in madecassoside and betulin, promoting microvascular capillary health and reducing cutaneous erythema.'
      },
      {
        name: 'Hyaluronic Acid & Niacinamide Shield',
        description: 'Multi-molecular moisture binder and vitamin B3 barrier fortifier that suppresses TEWL and optimizes cutaneous lipid synthesis.'
      }
    ],
    inci_list: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Spring Water',
        function: ['Solvent'],
        inci_group: 'base',
        role: 'Pure carrier base.'
      },
      {
        inci_name: 'Cocos Nucifera Fruit Juice',
        common_name: 'Young Coconut Water',
        function: ['Nutrient Carrier', 'Mineral Matrix'],
        inci_group: 'key_active',
        role: 'Bioactive electrolyte base rich in potassium, magnesium, and natural amino cofactors.'
      },
      {
        inci_name: 'Chlorella Vulgaris Extract',
        common_name: 'Green Microalgae Peptide & Hydroxyproline',
        function: ['Collagen Building Block', 'Fibroblast Stimulator'],
        inci_group: 'key_active',
        role: 'Supplies authentic plant hydroxyproline and microalgae peptides essential for collagen synthesis.'
      },
      {
        inci_name: 'Centella Asiatica Leaf Extract',
        common_name: 'Gotu Kola Extract',
        function: ['Microcirculatory Support', 'Anti-Erythema'],
        inci_group: 'key_active',
        role: 'Stimulates microcirculation, boosts hyaluronic acid production, and calms acute inflammation.'
      },
      {
        inci_name: 'Niacinamide',
        common_name: 'Vitamin B3',
        function: ['Barrier Repair', 'Ceramide Booster'],
        inci_group: 'key_active',
        role: 'Improves epidermal barrier cohesion, fades post-inflammatory erythema, and regulates sebum.'
      },
      {
        inci_name: 'Sodium Hyaluronate',
        common_name: 'Hyaluronic Acid',
        function: ['Deep Hydration'],
        inci_group: 'key_active',
        role: 'Binds up to 1000x its weight in water, plumping fine lines and maintaining viscoelasticity.'
      },
      {
        inci_name: 'Betula Alba Bark Extract',
        common_name: 'Birch Bark Extract',
        function: ['Antioxidant', 'Elasticity Booster'],
        inci_group: 'functional_active',
        role: 'Contains betulinic acid, protecting collagen and elastin fibers against enzymatic degradation.'
      },
      {
        inci_name: 'Aloe Barbadensis Leaf Juice',
        common_name: 'Aloe Vera Gel',
        function: ['Soothing Agent'],
        inci_group: 'functional_active',
        role: 'Calms redness, supplies polysaccharides, and accelerates epidermal re-epithelialization.'
      }
    ],
    variants: [
      {
        id: 'colway-vege-var-45ml',
        productId: 'colway-collagen-vege',
        productName: 'Collagen Vege (45 mL)',
        name: 'Colway Collagen Vege - 45 mL',
        sku: 'SKU-COLWAY-VEGE-45',
        format: 'Airless Dispenser',
        dosage: '45 mL',
        size: '45 mL',
        price: 68,
        cost: 22,
        stock: { available: 50, allocated: 0, reserved: 0 },
        reorderPoint: 10,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        status: 'published'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // 2. Colway Blue Diamond Cream (Krem Niebieski Diament)
  const blueCreamDoc = {
    id: 'colway-blue-diamond-cream',
    slug: 'colway-blue-diamond-cream',
    name: 'Blue Diamond Cream (Krem Niebieski Diament)',
    title: 'Blue Diamond Cellular Rejuvenation Cream — FGF-1 & Bioactive Peptides',
    brand: 'Colway',
    vendor: 'Colway',
    supplierId: 'supplier-colway',
    supplierName: 'Colway International',
    category: 'cosmetics',
    status: 'published',
    isPublished: true,
    visibility: 'public',
    format: 'Luxury Cellular Cream',
    size: '50 mL Cosmetic Jar',
    volume: '50 mL',
    image: '/images/products/colway/blue-diamond-cream.png',
    imageUrl: '/images/products/colway/blue-diamond-cream.png',
    heroImage: '/images/products/colway/blue-diamond-cream.png',
    images: ['/images/products/colway/blue-diamond-cream.png'],
    price: 88,
    wholesale_price: 48,
    unit_price: 88,
    retail_price: 88,
    cost: 28,
    currency: 'USD',
    shortDescription: 'Flagship luxury anti-aging cream from Colway’s Blue Diamond Line formulated with FGF-1 growth factors, native tropocollagen, liposomal ceramides, and coenzyme Q10.',
    description: 'Colway Blue Diamond Cream is the pinnacle formulation of Colway’s legendary Blue Line. Designed for comprehensive cellular rejuvenation of mature, stressed, or dehydrated skin, it integrates recombinant basic fibroblast growth factor (bFGF / FGF-1), native fish tropocollagen, liposomal CoQ10, kinetin, and ceramides. This advanced emulsion rebuilds the epidermal hydrolipid cement, revitalizes dormant fibroblasts, and restores firm facial contours.',
    clinical_indications: [
      'Advanced chronological aging, deep static rhytids, and facial volume laxity',
      'Severe skin dehydration, compromised hydrolipid barrier, and flakiness',
      'Intensive post-procedure recovery after chemical peels, PDO threads, or laser resurfacing',
      'Chronically tired, dull skin exposed to environmental pollution and blue-light stress'
    ],
    mechanism_of_action: 'Fibroblast Growth Factor 1 (FGF-1) encapsulated in lipid vesicles penetrates the stratum corneum to activate stem cells in the basal membrane, triggering accelerated neocollagenesis and elastin renewal. Liposomal CoQ10 and kinetin inhibit mitochondrial oxidative stress and delay cellular senescence (telomere protection), while bio-identical ceramides 1, 3, and 6-II repair intercellular lamellar sheets.',
    active_complexes: [
      {
        name: 'Encapsulated FGF-1 Growth Factor',
        description: 'Patented polypeptide vector stimulating fibroblast proliferation, procollagen I transcription, and extracellular matrix remodeling.'
      },
      {
        name: 'Native Marine Tropocollagen Triple Helix',
        description: 'Biologically active collagen peptide fragments restoring moisture reservoirs and tensile dermal elasticity.'
      },
      {
        name: 'Liposomal Ceramides (1, 3, 6-II) & Phytosphingosine',
        description: 'Lamellar barrier reconstituent restoring the epidermal cement and sealing against transepidermal water loss.'
      },
      {
        name: 'Kinetin & Liposomal CoQ10 Energy Engine',
        description: 'Powerful anti-senescence bio-molecules boosting ATP synthesis and shielding DNA against ultraviolet free-radical cascades.'
      }
    ],
    inci_list: [
      {
        inci_name: 'Aqua',
        common_name: 'Deionized Water',
        function: ['Solvent'],
        inci_group: 'base',
        role: 'Emulsion base.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Marine Tropocollagen',
        function: ['Matrix Hydration', 'Biomimetic Scaffold'],
        inci_group: 'key_active',
        role: 'Preserved triple-helix collagen providing dermal elasticity and immediate smoothing.'
      },
      {
        inci_name: 'sh-Polypeptide-1 (FGF-1)',
        common_name: 'Fibroblast Growth Factor 1',
        function: ['Cellular Regeneration', 'Growth Factor'],
        inci_group: 'key_active',
        role: 'Triggers cellular mitosis in fibroblasts, dramatically accelerating dermal regeneration.'
      },
      {
        inci_name: 'Ceramide NP, Ceramide AP, Ceramide EOP',
        common_name: 'Liposomal Ceramide Complex',
        function: ['Barrier Repair', 'Lipid Cement'],
        inci_group: 'key_active',
        role: 'Replaces lost stratum corneum lipids and prevents environmental moisture depletion.'
      },
      {
        inci_name: 'Ubiquinone (CoQ10)',
        common_name: 'Liposomal Coenzyme Q10',
        function: ['Cellular Energy', 'Antioxidant'],
        inci_group: 'key_active',
        role: 'Revitalizes cellular mitochondrial respiration and neutralizes lipid peroxyl radicals.'
      },
      {
        inci_name: 'Kinetin',
        common_name: 'Plant Cytokinin Longevity Vector',
        function: ['Anti-Senescence'],
        inci_group: 'key_active',
        role: 'Natural growth factor prolonging the lifespan of human dermal fibroblasts in culture.'
      },
      {
        inci_name: 'Macadamia Ternifolia Seed Oil',
        common_name: 'Macadamia Nut Oil',
        function: ['Biomimetic Lipid', 'Emollient'],
        inci_group: 'functional_active',
        role: 'Rich in palmitoleic acid (omega-7), mirroring natural human sebum.'
      },
      {
        inci_name: 'Simmondsia Chinensis (Jojoba) Seed Oil',
        common_name: 'Pure Jojoba Oil',
        function: ['Hydrolipid Barrier'],
        inci_group: 'functional_active',
        role: 'Non-comedogenic liquid wax providing supple non-greasy occlusion.'
      }
    ],
    variants: [
      {
        id: 'colway-blue-cream-var-50ml',
        productId: 'colway-blue-diamond-cream',
        productName: 'Blue Diamond Cream (50 mL)',
        name: 'Colway Blue Diamond Cream - 50 mL',
        sku: 'SKU-COLWAY-BLUEDIAMOND-50',
        format: 'Cosmetic Jar',
        dosage: '50 mL',
        size: '50 mL',
        price: 88,
        cost: 28,
        stock: { available: 40, allocated: 0, reserved: 0 },
        reorderPoint: 8,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        status: 'published'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // 3. Colway Blue Diamond Peeling (Peeling Niebieski Diament)
  const bluePeelingDoc = {
    id: 'colway-blue-diamond-peeling',
    slug: 'colway-blue-diamond-peeling',
    name: 'Blue Diamond Peeling (Peeling Niebieski Diament)',
    title: 'Blue Diamond Exfoliating & Micro-Resurfacing Cream — Diamond Dust & Enzymes',
    brand: 'Colway',
    vendor: 'Colway',
    supplierId: 'supplier-colway',
    supplierName: 'Colway International',
    category: 'cosmetics',
    status: 'published',
    isPublished: true,
    visibility: 'public',
    format: 'Mechanical & Enzymatic Peeling',
    size: '75 mL Cosmetic Tube',
    volume: '75 mL',
    image: '/images/products/colway/blue-diamond-peeling.png',
    imageUrl: '/images/products/colway/blue-diamond-peeling.png',
    heroImage: '/images/products/colway/blue-diamond-peeling.png',
    images: ['/images/products/colway/blue-diamond-peeling.png'],
    price: 64,
    wholesale_price: 35,
    unit_price: 64,
    retail_price: 64,
    cost: 19,
    currency: 'USD',
    shortDescription: 'Dual-action mechanical and enzymatic resurfacing peeling combining micronized natural diamond dust, proteolytic fruit enzymes, and native tropocollagen.',
    description: 'Colway Blue Diamond Peeling is an elite two-in-one dermatological exfoliator engineered for instant cutaneous illumination and texture refinement. It synergizes the physical micro-polishing power of genuine calibrated diamond dust with the selective enzymatic breakdown of dead corneocytes via Papain and Bromelain. Enriched with native collagen and cold-pressed botanical oils, it prepares the skin to maximize absorption of subsequent peptide serums without micro-trauma or erythema.',
    clinical_indications: [
      'Pre-treatment skin preparation prior to applying Blue Diamond Cream, Vege Collagen, or Minoxidil',
      'Hyperkeratosis, rough skin texture, enlarged follicular ostia, and dull complexion',
      'Post-acne superficial scarring and localized epidermal hyperpigmentation',
      'Anti-aging mechanical-enzymatic cellular stimulation without chemical burn risk'
    ],
    mechanism_of_action: 'Sub-micronized natural diamond particles mechanically detach superficial dead keratinocytes with rounded, non-scratching facets. Concurrently, biological fruit enzymes selectively digest inter-corneocyte desmosomal bonds. Native tropocollagen and jojoba oil cushion friction, preventing barrier disruption and leaving skin polished, nourished, and microcirculatory invigorated.',
    active_complexes: [
      {
        name: 'Natural Diamond Dust Micro-Abrasive',
        description: 'High-precision calibrated diamond crystals with ultra-fine facets delivering frictionless, uniform mechanical microdermabrasion.'
      },
      {
        name: 'Proteolytic Papain & Bromelain Bio-Enzymes',
        description: 'Plant-derived proteases that digest oxidized cellular debris and unblock congested sebaceous ostia.'
      },
      {
        name: 'Native Tropocollagen & Elastin Complex',
        description: 'Rebuilds immediate cutaneous hydration and prevents post-exfoliation tightness.'
      },
      {
        name: 'Subtilisin & Cellular Permeability Promoters',
        description: 'Optimizes trans-epidermal permeability channels for 300% greater absorption of anti-aging active peptides.'
      }
    ],
    inci_list: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent'],
        inci_group: 'base',
        role: 'Emulsion vehicle.'
      },
      {
        inci_name: 'Diamond Powder',
        common_name: 'Natural Diamond Dust',
        function: ['Micro-Exfoliant', 'Illuminator'],
        inci_group: 'key_active',
        role: 'Gently removes dead corneocytes and imparts immediate radiant skin glow.'
      },
      {
        inci_name: 'Papain & Bromelain',
        common_name: 'Bioactive Proteolytic Enzymes',
        function: ['Enzymatic Exfoliant'],
        inci_group: 'key_active',
        role: 'Selectively dissolves protein bonds between dead skin cells without harming viable tissue.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Marine Tropocollagen',
        function: ['Moisture Shield', 'Anti-Irritation'],
        inci_group: 'key_active',
        role: 'Buffers the skin barrier during exfoliation, preventing inflammation or erythema.'
      },
      {
        inci_name: 'Simmondsia Chinensis Seed Oil',
        common_name: 'Jojoba Oil',
        function: ['Conditioning Emollient'],
        inci_group: 'functional_active',
        role: 'Provides smooth glide and restores essential fatty acids to the epidermis.'
      },
      {
        inci_name: 'Persea Gratissima (Avocado) Oil',
        common_name: 'Cold-Pressed Avocado Oil',
        function: ['Nutrient Shield'],
        inci_group: 'functional_active',
        role: 'Rich in phytosterols and vitamins A, D, and E to deeply nourish freshly exfoliated skin.'
      }
    ],
    variants: [
      {
        id: 'colway-blue-peeling-var-75ml',
        productId: 'colway-blue-diamond-peeling',
        productName: 'Blue Diamond Peeling (75 mL)',
        name: 'Colway Blue Diamond Peeling - 75 mL',
        sku: 'SKU-COLWAY-BLUEDIAMOND-PEELING-75',
        format: 'Cosmetic Tube',
        dosage: '75 mL',
        size: '75 mL',
        price: 64,
        cost: 19,
        stock: { available: 45, allocated: 0, reserved: 0 },
        reorderPoint: 8,
        supplierId: 'supplier-colway',
        supplierName: 'Colway International',
        status: 'published'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  await db.collection('products').doc('colway-collagen-vege').set(vegeDoc, { merge: true });
  console.log('Successfully created/merged: colway-collagen-vege ✓');

  await db.collection('products').doc('colway-blue-diamond-cream').set(blueCreamDoc, { merge: true });
  console.log('Successfully created/merged: colway-blue-diamond-cream ✓');

  await db.collection('products').doc('colway-blue-diamond-peeling').set(bluePeelingDoc, { merge: true });
  console.log('Successfully created/merged: colway-blue-diamond-peeling ✓');

  console.log('--- Colway Collagen Vege & Blue Diamond Line seeding completed successfully! ---');
}

seedColwayVegeAndBlueLine().catch(err => {
  console.error('Error seeding Colway products:', err);
  process.exit(1);
});
