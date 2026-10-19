/**
 * scripts/enrich_colway_from_official_catalogues.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Synchronizes authoritative clinical data extracted directly from the official
 * Colway EU Catalogues:
 * - CI_catalogue_cosmetics_EN.pdf
 * - CI_catalogue_supplements_EN.pdf
 * - Catalogue-Colway-EN.pdf
 * - Katalog_kosmetyczny_aktualizacja_27_05_2025__.pdf
 *
 * Populates all 8 Colway products in Firestore with:
 * 1. Proprietary bioactive complexes (Matrigenics 14G, RonaFlair, Superox-C,
 *    Baicapil™, Kerascalp™, Chlorella Aminogram, Cottonseed Oil, Noni Extract).
 * 2. Official clinical indications (Triangle of Beauty reversal, stem cell anagen
 *    activation, anti-graying, barrier diagnostic peeling, vermilion hydro-compress).
 * 3. Exact professional usage tips, protocols, and mechanisms of action.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';

const ENRICHED_PRODUCTS = [
  // ─── 1. BLUE DIAMOND CREAM ──────────────────────────────────────────────────
  {
    id: 'colway-blue-diamond-cream',
    slug: 'colway-blue-diamond-cream',
    name: 'Colway Blue Diamond Cellular Rejuvenation Cream',
    title: 'Blue Diamond Cellular Rejuvenation Cream — Matrigenics 14G, FGF-1 & Bioactive Peptides',
    subtitle: 'Matrigenics 14G, Recombinant FGF-1, Native Collagen & RonaFlair® Flawless Soft-Look Matrix',
    category: 'Advanced Cellular Anti-Aging',
    volume: '50 mL',
    presentation: 'Luxury Frosted Cosmetic Jar (with Free Moissanite Excellence Blue Gem in Special Sets)',
    key_actives_summary: 'MATRIGENICS 14 G (14 Youth Genes Reactivator), Recombinant FGF-1 (sh-Polypeptide-1), Native Tropocollagen, RONAFLAIR® FLAWLESS Soft-Look Silica, SUPEROX-C™ Kakadu Plum (100× Natural Vitamin C), Liposomal Ceramides NP/AP/EOP, CoQ10, Amino-Glyco Kaviar, Squalane, and Shea Butter',
    description: 'An elite cellular cream engineered to reverse the inversion of the "Triangle of Beauty" in mature and perimenopausal skin. Combines patented MATRIGENICS 14G (Undaria pinnatifida stipes extract that reactivates 14 youth genes for structural ECM synthesis) with micro-encapsulated recombinant FGF-1 (bFGF), native freshwater tropocollagen, and intelligent RonaFlair® Flawless silica for an immediate soft-focus optical wrinkle blur. Rich in Superox-C™ (Kakadu plum extract with 100× natural Vitamin C) to reinforce fragile capillary walls, reduce facial erythema, and deliver 4D structural redensification.',
    shortDescription: 'Patented Matrigenics 14G and recombinant FGF-1 cellular emulsion designed to reverse facial V-contour collapse, blur micro-wrinkles with soft-focus silica, and reinforce fragile capillaries.',
    clinical_indications: [
      'Reversal of the "Triangle of Beauty" inversion (cheek deflation, pronounced nasolabial folds, down-turned oral commissures, and loss of jawline definition)',
      'Perimenopausal and menopausal cutaneous atrophy, density loss, and micro-capillary fragility (couperose / persistent erythema)',
      'Post-procedure cellular regeneration following microneedling, fractionated lasers, and chemical peels',
      'Immediate optical micro-wrinkle and pore blurring for daily executive and clinical presentations ("Soft Look" effect)'
    ],
    application_tip: 'Warming Protocol: Before application, gently warm a small pearl-sized amount between fingertips. This immediately liquefies the rich lamellar lipid base, allowing ultra-fast transdermal absorption without any greasy residue.',
    application_protocol: 'Apply morning and evening to cleansed and toned facial, neck, and décolleté skin. For maximum bio-synergy, mist the skin with Cellular AteloWater or clean hydrolat prior to application to enhance peptide transdermal conduit uptake.',
    clinical_focus_dossier: 'Targets 14 structural youth genes to rebuild collagen, elastin, and hyaluronic acid architecture. Restores the youthful triangular geometry of the face while calming reactive vascular flushing with 100× natural Vitamin C.',
    active_complexes: [
      { name: 'MATRIGENICS 14 G', detail: 'Fertile stipes extract from Undaria pinnatifida; reactivates 14 youth genes for ECM synthesis & cross-linking.' },
      { name: 'RONAFLAIR® FLAWLESS', detail: 'Intelligent spherical silica matrix; multi-angle light diffraction providing an instant optical soft-focus blur.' },
      { name: 'SUPEROX-C™', detail: 'Organic Australian Kakadu Plum extract; 100× higher Vitamin C concentration than oranges for capillary sealing.' },
      { name: 'Recombinant FGF-1', detail: 'Micro-encapsulated basic fibroblast growth factor (sh-Polypeptide-1); stimulates FGFR1-mediated neocollagenesis.' },
      { name: 'Bio-Identical Ceramides 3:1:1:1', detail: 'Ceramides NP, AP, EOP with phytosphingosine and plant cholesterol to seal intercellular lipid lamellae.' }
    ],
    hero_stats: [
      { stat: '14 Youth Genes', label: 'Matrigenics 14G', sub: 'Wakame stipes cellular activator' },
      { stat: 'FGF-1 + Peptides', label: 'Polypeptide Vector', sub: 'Mitogenic stem cell renewal' },
      { stat: 'Soft-Look 4D', label: 'RonaFlair® Flawless', sub: 'Optical spherical micro-blurring' },
      { stat: '100× Vitamin C', label: 'Superox-C™ Plum', sub: 'Capillary sealing & anti-erythema' }
    ],
    landedCostAed: 220,
    wholesalePriceAed: 253,
    clinicPriceAed: 320,
    retailPriceAed: 395
  },

  // ─── 2. BLUE DIAMOND PEELING ────────────────────────────────────────────────
  {
    id: 'colway-blue-diamond-peeling',
    slug: 'colway-blue-diamond-peeling',
    name: 'Colway Blue Diamond Exfoliating & Micro-Resurfacing Cream',
    title: 'Blue Diamond Exfoliating & Micro-Resurfacing Cream — Diamond Dust, Dual Enzymes & Neuro-Calming Hyssop',
    subtitle: 'Calibrated Natural Diamond Dust, Papain & Subtilisin Enzymes, Mexican Giant Hyssop & Glyacide ECO',
    category: 'Exfoliation & Cellular Renewal',
    volume: '75 mL',
    presentation: 'Cosmetic Professional Treatment Tube',
    key_actives_summary: 'Natural Diamond Dust, Proteolytic Papain & Subtilisin Enzymes, Mexican Giant Hyssop (Agastache Mexicana), Glyacide ECO, Glycosaminoglycans (GAGs), Native Tropocollagen, Squalane, Avocado & Jojoba Oils, D-Panthenol, and Vitamin E',
    description: 'A breakthrough multi-tasking hybrid formulation combining dual-action enzymatic keratolysis and diamond microdermabrasion within a rich, anti-aging restorative cream vehicle. As the product is massaged onto the skin, it functions as an interactive diagnostic test: areas with an impaired hydrolipid barrier absorb the cream base rapidly, highlighting zones of compromised moisture retention. Natural diamond dust gently polishes away dead corneocytes without micro-tears, while papain and subtilisin digest protein desmosomes. Infused with Mexican Giant Hyssop to block neuro-vascular flushing and erythema.',
    shortDescription: 'Dual mechanical diamond dust and enzymatic resurfacing in a rich anti-aging cream vehicle that diagnoses barrier health and primes skin for 300% greater peptide absorption.',
    clinical_indications: [
      'Stratum corneum hyperkeratosis, dull uneven complexion, and clogged follicular ostia',
      'Diagnostic assessment of epidermal barrier integrity and localized dehydration prior to clinical procedures',
      'Skin priming to increase transdermal permeability for peptides, serums, and mesotherapy by up to 300%',
      'Safe micro-polishing for sensitive, couperose, and rosacea-prone skin due to neuro-calming Agastache mexicana'
    ],
    application_tip: 'Dry Skin Application Rule: Thoroughly dry the skin before applying the peeling. Apply an even layer and allow the enzymatic phase to digest dead keratin bonds for 5–10 minutes while the rich anti-aging cream base absorbs. Then gently massage with slightly moistened fingertips to activate the diamond abrasive polishing phase, and rinse with lukewarm water.',
    application_protocol: 'Use 1–2 times weekly. On dry skin, apply a generous layer. Observe cream absorption rate across different facial zones (diagnostic barrier indicator). After 5–10 minutes, moisten hands and massage in circular upward motions for 1–2 minutes. Rinse thoroughly with water and follow with Collagen Wash Gel or native collagen gel.',
    clinical_focus_dossier: 'Zero micro-scratch guarantee. Mechanical diamond particles are calibrated with rounded microscopic facets. Synergizes enzymatic proteolysis with neuro-cosmetic anti-inflammatory hyssop to prevent post-peel flare-ups.',
    active_complexes: [
      { name: 'Natural Diamond Dust', detail: 'Precious calibrated micro-diamond abrasive; smooths skin texture with zero micro-abrasions.' },
      { name: 'Dual Proteolytic Enzymes', detail: 'Papain + Subtilisin; selectively cleaves corneodesmosomal protein bonds in dull dead cells.' },
      { name: 'Mexican Giant Hyssop', detail: 'Agastache mexicana extract; suppresses NF-κB neurogenic inflammation and thermal facial flushing.' },
      { name: 'Glyacide ECO & GAGs', detail: 'Bio-fermented penetration promoters that fluidize intercellular lipids and buffer the exfoliating action.' }
    ],
    hero_stats: [
      { stat: 'Diamond Dust', label: 'Micro-Exfoliant', sub: 'Precious non-scratching abrasive' },
      { stat: 'Dual Enzymes', label: 'Papain + Subtilisin', sub: 'Selective corneodesmosome lysis' },
      { stat: 'Neuro-Calm', label: 'Mexican Hyssop', sub: 'Calms stress-induced redness' },
      { stat: 'Diagnostic', label: 'Barrier Test Cream', sub: 'Reveals compromised barrier zones' }
    ],
    landedCostAed: 115,
    wholesalePriceAed: 132.25,
    clinicPriceAed: 175,
    retailPriceAed: 220
  },

  // ─── 3. STRENGTHENING HAIR SHAMPOO ──────────────────────────────────────────
  {
    id: 'colway-strengthening-shampoo',
    slug: 'colway-strengthening-shampoo',
    name: 'Colway Strengthening Anti-Hair Loss Trichological Shampoo',
    title: 'Strengthening Anti-Hair Loss Trichological Shampoo (pH 5.5)',
    subtitle: 'Baicapil™ (2%), Kerascalp™ Amla Cellular Stem-Cell Vector & Native Tropocollagen',
    category: 'Trichology & Scalp',
    volume: '250 mL',
    presentation: 'Ergonomic Dispenser Pump Bottle',
    key_actives_summary: 'Baicapil™ 2% (Scutellaria Baicalensis, Soy & Wheat Sprouts), Kerascalp™ (Phyllanthus Emblica / Amla), Native Tropocollagen, Bio-Silica (Equisetum Arvense), Hydrafeel® 3, Caffeine, and L-Arginine',
    description: 'An advanced medical-trichological shampoo formulated to arrest progressive hair shedding and activate dormant follicular stem cells. Powered by 2.0% Baicapil™, a clinically proven botanical complex that stimulates hair follicle stem cells in the bulge niche, prolonging the anagen (active growth) phase and reducing the telogen (shedding) phase. Features Kerascalp™ (amla fruit extract) acting at the cellular level to reinforce Collagen XVII at the dermal-follicular junction, preventing follicle miniaturization and protecting natural hair melanogenesis. Formulated at physiological scalp pH 5.5 with zero sulfates (SLS/SLES).',
    shortDescription: 'Clinical trichological shampoo with 2.0% Baicapil™ and Kerascalp™ amla to stimulate follicle stem cells, extend the anagen growth cycle, and arrest hair thinning.',
    clinical_indications: [
      'Androgenetic alopecia, telogen effluvium, and diffuse seasonal or stress-induced hair loss in men and women',
      'Pre-hair transplant scalp preparation and post-FUE follicular hygiene (Day 10+ post-op)',
      'Premature hair follicle aging, miniaturization, and loss of hair density and caliber',
      'Scalp microbiome imbalances, follicular ostium clogging, and sebum hypersecretion'
    ],
    application_tip: 'Trichological Protocol: Use systematically for 2–3 months. Apply to wet scalp, massage gently with fingertips to stimulate microcirculation, leave the active lather on the scalp for 2 minutes to allow caffeine and Baicapil™ transfollicular absorption, then rinse thoroughly. Always follow with Colway Strengthening Conditioner.',
    application_protocol: 'Wash hair and scalp 2–3 times per week. Use a 2-step wash: Step 1 cleanses superficial pollutants and sebum; Step 2 leaves the rich active lather on the scalp for 2–3 minutes for deep follicular infusion before rinsing.',
    clinical_focus_dossier: 'Documented in 84-day clinical trials to reduce hair loss by 60.6% and increase active hair density by up to 49%. Preserves Collagen XVII follicular anchoring anchors.',
    active_complexes: [
      { name: 'Baicapil™ 2.0%', detail: 'Synergistic combination of Scutellaria baicalensis, soy and wheat germ; reactivates stem cells, prolongs anagen phase.' },
      { name: 'Kerascalp™ Amla Extract', detail: 'Standardized Phyllanthus emblica; maintains Collagen XVII expression, prevents miniaturization & premature graying.' },
      { name: 'Native Freshwater Tropocollagen', detail: 'Reinforces the dermal extracellular matrix surrounding the hair bulb, anchoring the follicle in the dermis.' },
      { name: 'L-Arginine & Caffeine', detail: 'Vasodilating microcirculatory stimulants delivering oxygen and amino nutrients to dividing anagen matrix cells.' }
    ],
    hero_stats: [
      { stat: '2.0%', label: 'Baicapil™ Complex', sub: 'Clinical stem cell concentration' },
      { stat: '−60.6%', label: 'Hair Loss Reduction', sub: 'Documented in 84 days clinical trial' },
      { stat: '+49%', label: 'Hair Count Increase', sub: 'Telogen-to-anagen transition' },
      { stat: '0% SLS/SLES', label: 'Gentle Cleansing', sub: 'Coco-sulfate & glucosides at pH 5.5' }
    ],
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180
  },

  // ─── 4. STRENGTHENING HAIR CONDITIONER ──────────────────────────────────────
  {
    id: 'colway-strengthening-conditioner',
    slug: 'colway-strengthening-conditioner',
    name: 'Colway Strengthening Anti-Hair Loss Trichological Conditioner',
    title: 'Strengthening Anti-Hair Loss Trichological Conditioner (pH 4.5)',
    subtitle: 'Baicapil™ 2%, Kerascalp™ Amla, Cottonseed & Argan Oils & Cuticle Acid Lock',
    category: 'Trichology & Scalp',
    volume: '200 mL',
    presentation: 'Flexible Dispenser Treatment Tube',
    key_actives_summary: 'Baicapil™ 2%, Kerascalp™ (Amla), Cold-Pressed Cottonseed Oil (Gossypium Herbaceum), Argan Oil, Native Tropocollagen, Hydrafeel® 3, Hydrolyzed Keratin, D-Panthenol, and Sweet Almond Lipids',
    description: 'A high-performance restorative trichological conditioner designed as the vital second step in Colway’s hair strengthening protocol. Formulated at an acidic pH 4.5 to instantly close and seal hair cuticle scales, locking in hydration and reflective shine. Enriched with rare cold-pressed Cottonseed Oil, exceptionally rich in polyunsaturated essential fatty acids that coat cuticular micro-fractures, stop split ends, and restore the natural 18-MEA protective F-layer. Synergizes with Baicapil™ and Kerascalp™ to maintain follicular stimulation across the scalp surface without silicones or pore-clogging residues.',
    shortDescription: 'Acidic pH 4.5 cuticle-sealing trichological conditioner enriched with Cottonseed oil, Argan oil, and Baicapil™ to repair cuticular micro-fractures and prevent split ends.',
    clinical_indications: [
      'Damaged, brittle, heat-treated or color-processed hair experiencing high breakage and split ends',
      'Post-transplant hair maintenance to fortify newly emerged hair shafts against mechanical shock loss',
      'Cuticular porosity repair and restoration of the hydrophobic 18-MEA lipid layer',
      'Instant detangling with 47% reduction in combing friction without heavy silicone buildup'
    ],
    application_tip: 'Synergistic Protocol: Use after every wash with Colway Strengthening Shampoo for 2–3 months. Apply evenly along the lengths to ends, and gently massage residual product into the scalp to prolong active Baicapil™ and Kerascalp™ contact. Leave for 3–5 minutes before rinsing.',
    application_protocol: 'Dispense a walnut-sized portion onto damp hair. Comb through gently with wide-tooth comb to distribute the cottonseed-keratin matrix. Rinse thoroughly with cool water to enhance the pH 4.5 cuticle-closing shine.',
    clinical_focus_dossier: '96.73% natural ingredients. Cottonseed oil prevents split ends while hydrolyzed keratin micro-peptides bond to structural cortex voids (+24% fiber strength improvement).',
    active_complexes: [
      { name: 'Cottonseed Oil (Gossypium)', detail: 'Rich in unsaturated fatty acids (linoleic acid); seals porous cuticles and prevents split ends.' },
      { name: 'Baicapil™ & Kerascalp™', detail: 'Prolongs follicular stem cell activation and protects Collagen XVII anchors at the scalp surface.' },
      { name: 'Hydrolyzed Keratin Peptides', detail: 'Penetrates cortical voids to repair broken disulfide bridges and restore tensile elasticity.' },
      { name: 'Hydrafeel® 3 (Polyglyceryl-3 PCA)', detail: 'Provides biomimetic moisture retention and reduces wet/dry combing force by 47%.' }
    ],
    hero_stats: [
      { stat: '96.73%', label: 'Natural Ingredients', sub: 'Plant lipid & botanical formula' },
      { stat: 'pH 4.5', label: 'Cuticle Acid Lock', sub: 'Flattens cuticle scales for shine' },
      { stat: 'Cottonseed Oil', label: 'Lipid Shield', sub: 'Seals split ends & micro-fractures' },
      { stat: '−47%', label: 'Combing Force', sub: 'Instant detangling without silicones' }
    ],
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180
  },

  // ─── 5. COLLAGEN VEGE ───────────────────────────────────────────────────────
  {
    id: 'colway-collagen-vege',
    slug: 'colway-collagen-vege',
    name: 'Colway Collagen Vege (100% Plant-Derived Bioactive Tropocollagen)',
    title: 'Collagen Vege — 100% Botanical Native Tropocollagen Analogue (pH 5.5)',
    subtitle: 'First in the World 100% Plant-Based Full Tropocollagen Type I Aminogram Analogue',
    category: 'Bioactive Barrier Care',
    volume: '45 mL',
    presentation: 'Airless Precision Dispenser (Protects Delicate Plant Polypeptides)',
    key_actives_summary: 'Chlorella Vulgaris Hydroxyproline Bio-Collagen, Isotonic Young Coconut Water, Bladderwrack (Fucus Vesiculosus), Niacinamide, Hyaluronic Acid, Glycyrrhetinic Acid, Centella Asiatica, Betula Alba, Mountain Arnica, Ginkgo Biloba, and 24 Botanical Phyto-Extracts',
    description: 'The world’s first complete, biologically active plant substitute for collagen, composed 100% of botanical amino acids that accurately mirror the human Type I tropocollagen aminogram. Developed through proprietary bio-fermentation of Chlorella vulgaris and botanical extracts in an isotonic young coconut water base. Multi-targeted clinical action: diminishes wrinkle depth, lifts and firms, evens out hyperpigmentation, calms acne and bacterial flora, suppresses erythema, and regulates sebum secretion. 100% vegan, cruelty-free, and hypoallergenic for the most sensitive and compromised skin.',
    shortDescription: 'The world’s first 100% plant-based bioactive collagen replicating the human tropocollagen Type I aminogram, powered by 24 botanical phyto-extracts in isotonic coconut water.',
    clinical_indications: [
      '100% vegan anti-aging, lifting, and deep neocollagenesis for patients declining animal/marine derivatives',
      'Post-procedure calming and barrier re-epithelialization following micro-needling, laser ablation, or chemical peeling',
      'Sensitive, reactive, couperose, and rosacea-prone cutaneous terrain requiring zero-irritation soothing',
      'Combination, acne-prone, and oily skin requiring non-comedogenic collagen hydration with sebum regulation'
    ],
    application_tip: 'Transdermal Absorption Rule: Apply 1–2 pumps onto clean, slightly damp skin (ideally misted with pure water or Cellular AteloWater). Spread gently along facial contours and pat until absorbed. Use morning and evening as a standalone serum or under Blue Diamond Cream.',
    application_protocol: 'Ideal for both daily clinical homecare and professional post-treatment recovery. Safe for delicate eye contour, neck, and chest areas.',
    clinical_focus_dossier: 'Features complete 24-extract botanical matrix: Chlorella amino acids, Fucus, Niacinamide, Hyaluronic acid, Glycyrrhetinic acid, Aloe Vera, Birch, St. John’s wort, Strawberry, Wild Rose, Arnica, Ginkgo, Horse Chestnut, Witch Hazel, Centella Asiatica, Vanilla, Tonka, Bitter Orange, Cinnamon, Thyme, Clove, Lime, Jasmine, Damask Rose, Coconut.',
    active_complexes: [
      { name: '100% Plant Tropocollagen Aminogram', detail: 'Chlorella-derived amino acid sequence replicating human Type I collagen with authentic hydroxyproline.' },
      { name: 'Isotonic Young Coconut Water', detail: 'Replaces plain water with pure coconut electrolytes (K, Mg, Ca) and cytokinins for 72h cellular hydration.' },
      { name: '24-Extract Botanical Matrix', detail: 'Synergistic phyto-complex delivering simultaneous antioxidant, vascular, sebum-regulating, and brightening actions.' },
      { name: 'Glycyrrhetinic & Hyaluronic Acid', detail: 'High-purity licorice extract combined with sodium hyaluronate to quench cutaneous micro-inflammation.' }
    ],
    hero_stats: [
      { stat: '100%', label: 'Phytocosmetic', sub: 'Full plant-derived aminogram' },
      { stat: '24 Actives', label: 'Botanical Matrix', sub: 'Chlorella, Centella, Rose & Arnica' },
      { stat: 'pH 5.5', label: 'Physiological Mantle', sub: 'Zero-irritation dermal harmony' },
      { stat: '72h', label: 'Isotonic Moisture', sub: 'Coconut electrolyte cellular pool' }
    ],
    landedCostAed: 85,
    wholesalePriceAed: 97.75,
    clinicPriceAed: 135,
    retailPriceAed: 175
  },

  // ─── 6. COLLAGEN WASH GEL ───────────────────────────────────────────────────
  {
    id: 'colway-collagen-wash-gel',
    slug: 'colway-collagen-wash-gel',
    name: 'Colway Cellular Collagen Hydrolipid Wash Gel',
    title: 'Cellular Collagen Hydrolipid Wash Gel (pH 5.5)',
    subtitle: 'Sulfate-Free Physiological pH 5.5 Intact Cutaneous Cleanser with Noni Fruit & Native Collagen',
    category: 'Cellular Cleansing',
    volume: '250 mL',
    presentation: 'Ergonomic Pump Dispenser Bottle',
    key_actives_summary: 'Native Freshwater Tropocollagen, Sulfate-Free Amphoteric Surfactant Matrix, Noni Fruit Extract (Morinda Citrifolia), Aloe Barbadensis Leaf Juice, D-Panthenol (Pro-Vitamin B5), and Vegetable Glycerin',
    description: 'An ultra-delicate, physiological pH 5.5 facial and body wash gel formulated to respect and preserve the skin’s natural protective shield — the hydrolipid film. Delivers deep, thorough cleansing of environmental airborne pollutants, heavy makeup, and excess sebum without causing any tightness, dryness, or stinging (brak uczucia ściągnięcia). Enriched with Noni Fruit Extract, an exceptional exotic antioxidant rich in proxeronine and bioflavonoids, paired with biologically active native fish tropocollagen and aloe vera to leave skin velvety soft, calm, and hydrated.',
    shortDescription: 'Physiological pH 5.5 sulfate-free cleanser with native tropocollagen and noni fruit extract that purifies deeply with zero barrier stripping or post-wash tightness.',
    clinical_indications: [
      'Daily morning and evening cleansing for all skin types, including highly sensitive, mature, and dry skin',
      'Pre-procedure cutaneous preparation before peptide serums, peeling treatments, and laser procedures',
      'Post-procedural hygiene for compromised skin that cannot tolerate standard soap or sulfate detergents',
      'Gentle makeup removal, including delicate eyelid and periocular zones without eye irritation'
    ],
    application_tip: 'Micro-Emulsion Protocol: Highly concentrated and economical formula. Dispense a single pea-sized drop onto wet palms, add lukewarm water, and rub hands together to build a silky, creamy micro-emulsion. Massage gently over face and neck, then rinse cleanly with water.',
    application_protocol: 'Use twice daily. Does not strip the acid mantle or sebaceous lipids, ensuring the skin barrier remains intact and primed for collagen/peptide application.',
    clinical_focus_dossier: 'Zero sulfates, zero parabens, zero SLS/SLES. Guarantees "No Tightness" post-rinse. Native collagen electrostatically binds to surface keratin during cleansing, leaving a protective hydration cushion.',
    active_complexes: [
      { name: 'Native Freshwater Tropocollagen', detail: 'Forms a hydrophilic shield that prevents moisture evaporation during and after cleansing.' },
      { name: 'Noni Fruit Extract (Morinda citrifolia)', detail: 'Exotic botanical antioxidant rich in proxeronine; detoxifies cellular pollutants and neutralizes free radicals.' },
      { name: 'Aloe Barbadensis Leaf Juice', detail: 'Calms redness, supplies essential enzymes, and accelerates epidermal soothing.' },
      { name: 'Amphoteric Surfactant System', detail: 'Ultra-mild cocoamphoacetate micelles that lift sebum and makeup with zero ceramide dissolution.' }
    ],
    hero_stats: [
      { stat: '0% Sulfates', label: 'Sulfate-Free', sub: 'Zero SLS, SLES or harsh salts' },
      { stat: 'pH 5.5', label: 'Acid Mantle Match', sub: 'Zero barrier lipid stripping' },
      { stat: 'Zero Tightness', label: 'Hydrolipid Veil', sub: 'Velvety soft post-wash skin' },
      { stat: 'Noni Extract', label: 'Cellular Detox', sub: 'Proxeronine antioxidant defense' }
    ],
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 185
  },

  // ─── 7. COLLAGEN LIP CARE ───────────────────────────────────────────────────
  {
    id: 'colway-collagen-lip-care',
    slug: 'colway-collagen-lip-care',
    name: 'Colway Bioactive Collagen Lip Care',
    title: 'Bioactive Collagen Lip Care & Vermilion Restorative Serum',
    subtitle: 'Palmitoyl Oligopeptide, Native Tropocollagen, Argan & Jojoba Hydro-Lipid Compress',
    category: 'Bioactive Barrier Care',
    volume: '4.5 g',
    presentation: 'Precision Twist Stick Dispenser',
    key_actives_summary: 'Palmitoyl Oligopeptide (Bio-Peptide CL), Native Freshwater Tropocollagen, Elastin, Argan Oil, Jojoba Seed Oil, Shea Butter, Carnauba Wax, and Esterified Vitamins C & E',
    description: 'A specialized lipid-replenishing labial barrier balm formulated with native fish tropocollagen, signal oligopeptides, and biomimetic botanical lipids. Creates an invisible, breathable "hydro-lipid compress" that provides immediate relief to dry, chapped, or cracked lips while shielding fragile mucosal tissue against extreme arid heat, desert wind, and air-conditioned GCC indoor environments. Stimulates endogenous collagen and glycosaminoglycan synthesis in the vermilion border to fill vertical fine lines, prevent contour loss, and accelerate recovery after lip filler injections.',
    shortDescription: 'Regenerative labial balm with native tropocollagen, Palmitoyl Oligopeptide, and argan butter providing an instant hydro-lipid compress for chapped lips and post-filler recovery.',
    clinical_indications: [
      'Severe labial xerosis, chronic cheilitis, and deep vertical micro-fissures of the vermilion border',
      'Daily environmental protection in arid, hot, and intensely air-conditioned climates (UAE / GCC region)',
      'Post-filler aesthetic recovery: Accelerates re-epithelialization and smooths swelling post-hyaluronic acid injections',
      'Perioral smoker’s lines and age-related volume loss of the lips'
    ],
    application_tip: 'Hydro-Compress Protocol: Apply generously to lips as often as needed throughout the day. For intense overnight regeneration, apply a thick layer before bedtime to act as a rejuvenating labial sleeping mask.',
    application_protocol: 'Glide gently over the vermilion border. Glides effortlessly without wax drag, leaving a subtle, non-sticky satin finish.',
    clinical_focus_dossier: 'Bio-Peptide CL stimulates fibroblasts in the labial mucosa (+40% lip hydration & contour improvement). Natural argan oil and shea butter rebuild the thin lipid film lacking in human lip tissue.',
    active_complexes: [
      { name: 'Palmitoyl Oligopeptide (Bio-Peptide CL)', detail: 'Signal matrikine peptide that stimulates collagen and hyaluronic acid production in vermilion tissue.' },
      { name: 'Native Fish Tropocollagen & Elastin', detail: 'Restores tensile elasticity and softness to fragile labial mucous membranes.' },
      { name: 'Argan & Jojoba Lipid Matrix', detail: 'Cold-pressed botanical oils providing essential fatty acids to seal moisture without petroleum occlusives.' },
      { name: 'Esterified Vitamins C & E', detail: 'Defends delicate lip tissue against solar elastosis and salivary digestive enzymes.' }
    ],
    hero_stats: [
      { stat: 'Bio-Peptide CL', label: 'Signal Oligopeptide', sub: 'Matrikine vermilion plumping' },
      { stat: '+40%', label: 'Lip Hydration', sub: 'Smooths vertical fissures' },
      { stat: 'Hydro-Compress', label: 'Arid Climate Shield', sub: 'Zero wax drag or stickiness' },
      { stat: 'Post-Filler', label: 'Aesthetic Recovery', sub: 'Safe for compromised mucosa' }
    ],
    landedCostAed: 15,
    wholesalePriceAed: 17.25,
    clinicPriceAed: 25,
    retailPriceAed: 35
  },

  // ─── 8. COLVITA ─────────────────────────────────────────────────────────────
  {
    id: 'colway-colvita',
    slug: 'colway-colvita',
    name: 'Colvita Bioactive Native Collagen & Marine Algae',
    title: 'Colvita Bioactive Native Collagen & Marine Algae (60 / 120 Capsules)',
    subtitle: 'Lyophilized Native Fish Tropocollagen, Micronized Fucus Algae & Natural Vitamin E',
    category: 'Systemic Nutraceutical',
    volume: '60 / 120 Capsules',
    presentation: 'Luxury Retail Box (Capsules in Pharmaceutical Blister Packs)',
    key_actives_summary: 'Lyophilized Native Freshwater Fish Tropocollagen (240 mg per 2 caps), Micronized Bladderwrack Algae Fucus Vesiculosus (300 mg), Natural Vitamin E D-alpha-tocopherol (24 mg / 200% NRV), and Marine Fish Gelatin Capsule',
    description: 'An authoritative systemic nutricosmetic manufactured using low-temperature freeze-drying (lyophilization) of biologically active freshwater fish skin tropocollagen. Unlike degraded hydrolysates, lyophilized native collagen preserves biological signal peptides that pass through the intestinal mucosa via PepT1 transporters to directly signal human fibroblasts and chondrocytes to synthesize endogenous collagen. Formulated in synergy with micronized Fucus vesiculosus (providing bioavailable organic iodine, silica, and trace minerals for lysyl oxidase cross-linking) and natural D-alpha-tocopherol to shield newly synthesized collagen fibrils from oxidative glycation.',
    shortDescription: 'Flagship systemic nutricosmetic with lyophilized native fish tropocollagen signal peptides, micronized Fucus algae, and natural Vitamin E to stimulate whole-body neocollagenesis.',
    clinical_indications: [
      'Systemic skin redensification: Reverses dermal collagen thinning, increases elasticity, and reduces full-body wrinkle volume',
      'Trichological support: Anchors hair follicles firmly into the dermal papilla matrix, reducing shedding and reinforcing nail plates',
      'Articular and connective tissue preservation: Supports joint cartilage elasticity and tendon resilience',
      'Post-aesthetic procedure recovery: Accelerates healing following deep chemical peels, laser resurfacing, and plastic surgery'
    ],
    application_tip: 'Posology Protocol: Take 2 capsules daily, preferably 1 capsule in the morning and 1 in the evening during or immediately after meals with a glass of water. For intensive post-operative or clinical recovery, dosage may be titrated to 4 capsules daily under physician supervision.',
    application_protocol: 'Consistent 3-month supplementation protocol recommended to complete the full turnover cycle of dermal collagen and hair follicular anchoring.',
    clinical_focus_dossier: 'Features intact signal peptides that trigger endogenous procollagen mRNA transcription. Encapsulated in 100% fish gelatin, free of bovine/porcine components.',
    active_complexes: [
      { name: 'Lyophilized Native Tropocollagen (240mg)', detail: 'Biologically active signal peptides (Pro-Hyp, Gly-Pro-Hyp) that activate fibroblast neocollagenesis.' },
      { name: 'Micronized Fucus Vesiculosus (300mg)', detail: 'Bladderwrack supplying organic iodine, fucoidans, and silica for enzymatic collagen cross-linking.' },
      { name: 'Natural Vitamin E (24mg / 200% NRV)', detail: 'Optical D-alpha isomer protecting nascent collagen fibrils from free-radical lipid peroxidation.' },
      { name: '100% Fish Gelatin Capsule', detail: 'Pharmaceutical blister packaging guaranteeing zero bovine/porcine ingredients and peak peptide stability.' }
    ],
    hero_stats: [
      { stat: '240 mg', label: 'Native Tropocollagen', sub: 'Signal peptides per 2 capsules' },
      { stat: '300 mg', label: 'Fucus Vesiculosus', sub: 'Organic iodine & trace bio-minerals' },
      { stat: '200% NRV', label: 'Natural Vitamin E', sub: 'D-alpha optical isomer (24mg)' },
      { stat: '100%', label: 'Fish Gelatin Capsule', sub: 'Zero bovine or porcine gelatin' }
    ],
    landedCostAed: 105,
    wholesalePriceAed: 120.75,
    clinicPriceAed: 160,
    retailPriceAed: 210
  }
];

async function syncColwayCatalogues() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  SYNCING OFFICIAL COLWAY CATALOGUE DATA TO FIRESTORE PRODUCTS');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const prod of ENRICHED_PRODUCTS) {
    const docRef = adminDb.collection('products').doc(prod.id);
    const existingSnap = await docRef.get();
    const existing = existingSnap.exists ? existingSnap.data() : {};

    const payload = {
      ...existing,
      ...prod,
      brand: 'Colway',
      supplier: 'Colway',
      supplierName: 'Colway Medical & Cellular Derma (Poland)',
      supplierId: 'colway',
      isPublished: true,
      status: 'published',
      updatedAt: now,
      updated_at: now
    };

    await docRef.set(payload, { merge: true });
    console.log(`✅ [${prod.id}] Updated: "${prod.name}"`);
    console.log(`   Actives: ${prod.key_actives_summary.slice(0, 90)}...`);
    console.log(`   Tip: ${prod.application_tip ? prod.application_tip.slice(0, 80) : 'None'}...\n`);
    updatedCount++;
  }

  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`🎉 SUCCESS: All ${updatedCount} Colway products enriched with official catalogue data!`);
  console.log('══════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

syncColwayCatalogues().catch(err => {
  console.error('❌ Error synchronizing Colway catalogue data:', err);
  process.exit(1);
});
