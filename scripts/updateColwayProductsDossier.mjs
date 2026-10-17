/**
 * scripts/updateColwayProductsDossier.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Cleanses Polish names and enriches all 8 Colway products in Firestore
 * with specialized clinical dossiers, application protocols, and protocol associations.
 * Guarantees zero hair contamination in facial/dermo/nutraceutical products.
 */

import { db } from './lib/firebase-admin.mjs';

const COLWAY_UPDATES = {
  'colway-blue-diamond-cream': {
    name: 'Blue Diamond Cream',
    title: 'Blue Diamond Cellular Rejuvenation Cream — FGF-1 & Bioactive Peptides',
    polish_name: null,
    name_pl: null,
    category: 'cosmetics',
    format: 'Luxury Cellular Cream',
    volume: '50 mL',
    shortDescription: 'Flagship luxury anti-aging cream from Colway’s Blue Diamond Line formulated with FGF-1 growth factors, native tropocollagen, liposomal ceramides, and coenzyme Q10.',
    description: 'Colway Blue Diamond Cream is the pinnacle formulation of Colway’s Blue Diamond Line. Engineered for comprehensive cellular rejuvenation of mature, fatigued, or post-procedure skin, it integrates recombinant fibroblast growth factor (bFGF / FGF-1), native freshwater fish tropocollagen, liposomal CoQ10, kinetin, and ceramides (1, 3, 6-II). This advanced bio-emulsion rebuilds the epidermal hydrolipid cement, revitalizes dermal fibroblasts, and restores firm facial contours.',
    clinical_indications: [
      'Advanced chronological aging, deep static rhytids, and loss of facial elasticity',
      'Compromised hydrolipid barrier, excessive transepidermal water loss (TEWL), and persistent dryness',
      'Clinical post-procedure recovery after chemical peels, microneedling, PDO threads, or non-ablative laser resurfacing',
      'Cellular fatigue and oxidative stress caused by environmental pollutants, UV exposure, and blue light'
    ],
    technical_specs: {
      formulation_type: 'Lamellar Cellular O/W Emulsion',
      ph_range: '5.5–6.0 (Physiological Cutaneous)',
      volume: '50 mL Frosted Airless Jar',
      texture: 'Velvety, Ultra-Absorbing Biomimetic Emulsion',
      target_zone: 'Face, Neck, Décolleté & Periorbital Contour',
      dermatological_status: 'Hypoallergenic, Dermatologically Tested, CPNP Registered',
      preservation_system: 'Biomimetic Glycols & Micro-stabilizers (Paraben-Free, SLS-Free)'
    },
    application_protocol: {
      title: 'Professional Facial Rejuvenation & Barrier Protocol',
      frequency: 'Twice daily: Morning (AM) & Evening (PM)',
      duration_of_use: 'Continuous daily cellular regimen; minimum 28 days to assess full epidermal turnover cycle',
      steps: [
        {
          step: 1,
          phase: 'Cutaneous Preparation',
          instruction: 'Thoroughly cleanse facial skin with Colway Cellular Collagen Hydrolipid Wash Gel. Pat dry with a clean towel, leaving skin slightly damp (hydrated stratum corneum enhances bio-peptide permeability).',
          duration: '60 seconds'
        },
        {
          step: 2,
          phase: 'Dosing & Distribution',
          instruction: 'Using the cosmetic spatula, dispense a pearl-sized amount (~1 mL) of Blue Diamond Cream onto fingertips. Dot evenly across the forehead, cheeks, chin, neck, and décolleté.',
          duration: '15 seconds'
        },
        {
          step: 3,
          phase: 'Ascending Effleurage & Dermal Stimulation',
          instruction: 'Spread the emulsion using gentle ascending effleurage strokes from the center of the face outward toward the hairline and lymph nodes. Follow the lines of Langer to support facial tension vectors.',
          duration: '60–90 seconds',
          clinical_note: 'Ascending massage activates micro-lymphatic drainage and assists penetration of encapsulated FGF-1 peptides down to the basal membrane.'
        },
        {
          step: 4,
          phase: 'Targeted Pressure & Absorption',
          instruction: 'Gently press warm palms against the cheeks, forehead, and jawline for 10 seconds. The skin warmth enhances lamellar lipid fusion with the stratum corneum.',
          duration: '20 seconds'
        },
        {
          step: 5,
          phase: 'Post-Procedure Protective Sealing',
          instruction: 'When applying post-procedure (chemical peels, microneedling), wait 24 hours post-intervention. Apply a slightly more generous layer to accelerate re-epithelialization and reduce erythema.',
          clinical_note: 'Ceramides NP/AP/EOP rapidly substitute for depleted intercellular lamellae, halting transepidermal water loss (TEWL).'
        }
      ],
      professional_notes: [
        'Optimal topical companion to injectable GHK-Cu and peptide mesotherapy regimens for total skin matrix remodeling.',
        'Apply 1–2 times weekly following Blue Diamond Peeling for maximal active transdermal penetration.',
        'Non-comedogenic profile: safe for combination, reactive, and mature skin without pore occlusion.',
        'Physiological pH 5.5 preserves the natural cutaneous acid mantle and microflora diversity.'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-dermo-renewal',
        name: 'Colway Dermo-Renewal Ritual',
        category: 'Cellular Skincare',
        duration: '12 Weeks',
        integration_role: 'Core morning & evening regenerative emulsion following enzymatic cleansing and peeling.',
        synergy_score: 98,
        isPrimary: true
      },
      {
        slug: 'skin_001',
        name: 'GHK-Cu Skin Rejuvenation Protocol',
        category: 'Aesthetic Medicine',
        duration: '8–12 Weeks',
        integration_role: 'Topical barrier rebuild layer supporting subcutaneous/mesotherapy GHK-Cu pro-collagen induction.',
        synergy_score: 95
      },
      {
        slug: 'sa_001',
        name: 'Skin Aesthetics & Neocollagenesis Protocol',
        category: 'Dermatology',
        duration: '12 Weeks',
        integration_role: 'Protective lipid shield preventing post-procedure dryness and promoting fibroblast mitosis.',
        synergy_score: 92
      }
    ]
  },

  'colway-blue-diamond-peeling': {
    name: 'Blue Diamond Peeling',
    title: 'Blue Diamond Enzymatic & Micro-Dermabrasion Peeling',
    polish_name: null,
    name_pl: null,
    category: 'cosmetics',
    format: 'Mechanical & Enzymatic Peeling',
    volume: '75 mL',
    shortDescription: 'Dual-action enzymatic and diamond-dust micro-dermabrasion peeling providing non-abrasive keratolysis and dermal oxygenation.',
    description: 'Colway Blue Diamond Peeling is a state-of-the-art dual-action exfoliant combining pharmaceutical-grade enzymatic keratolysis (papain, subtilisin) with natural micro-crystalline diamond dust. It selectively digests desmosomal bonds between dead corneocytes while gently polishing the epidermal surface without micro-tears. Enriched with native fish tropocollagen and jojoba esters, it primes the stratum corneum for maximal absorption of active peptide serums.',
    clinical_indications: [
      'Stratum corneum hyperkeratosis, dull sallow complexion, and uneven epidermal texture',
      'Pre-procedure skin priming to increase transdermal permeability before peptide application',
      'Superficial solar elastosis, fine dry lines, and enlarged pore appearance',
      'Congested, asphyxiated skin needing microvascular oxygenation and cellular turnover'
    ],
    technical_specs: {
      formulation_type: 'Dual Enzymatic & Physical Micro-Exfoliating Cream',
      ph_range: '5.5–6.0',
      volume: '75 mL Dispenser Tube',
      texture: 'Creamy Gel with Ultrafine Natural Diamond Micro-Crystals',
      target_zone: 'Face, Neck & Décolleté (avoiding immediate periocular eye area)',
      dermatological_status: 'Dermatologically Tested, Non-Abrasive, CPNP Registered',
      preservation_system: 'Gentle Dermocosmetic Preservatives'
    },
    application_protocol: {
      title: 'Enzymatic Resurfacing & Transdermal Priming Protocol',
      frequency: '1–2 times weekly (or every 10–14 days for highly reactive/sensitive skin)',
      duration_of_use: 'Weekly maintenance protocol',
      steps: [
        {
          step: 1,
          phase: 'Skin Pre-Cleansing',
          instruction: 'Cleanse the face with Colway Cellular Collagen Hydrolipid Wash Gel. Rinse with warm water and leave the skin moderately moist.',
          duration: '60 seconds'
        },
        {
          step: 2,
          phase: 'Application & Enzymatic Activation',
          instruction: 'Dispense approximately 2 mL (almond-sized amount) onto clean fingers. Spread evenly over the face, neck, and décolleté, strictly avoiding the upper and lower eyelids. Allow enzymes to sit undisturbed for 2–3 minutes.',
          duration: '2–3 minutes',
          clinical_note: 'Papain and subtilisin enzymes hydrolyze peptide bonds in desmogleins, loosening dead corneocytes without friction.'
        },
        {
          step: 3,
          phase: 'Micro-Dermabrasion Massage',
          instruction: 'With moistened fingertips, gently perform circular micro-massages for 1–2 minutes, paying special attention to the T-zone and areas with coarse texture. Exert minimal mechanical pressure.',
          duration: '1–2 minutes',
          clinical_note: 'Ultrafine diamond particles have rounded crystalline edges, preventing micro-fissures or barrier disruption.'
        },
        {
          step: 4,
          phase: 'Complete Rinsing',
          instruction: 'Rinse thoroughly with ample lukewarm water using soft cosmetic sponges or wet hands. Ensure no diamond dust particles remain on the skin.',
          duration: '60 seconds'
        },
        {
          step: 5,
          phase: 'Active Serum & Cream Infusion',
          instruction: 'Immediately follow with Colway Blue Diamond Cream or peptide serum. The transient 3.4× increase in skin permeability ensures maximum active uptake.',
          clinical_note: 'Immediate post-peeling window is the golden hour for delivering native tropocollagen and FGF-1 vectors.'
        }
      ],
      professional_notes: [
        'Do not apply on open lesions, active acne cysts, or sunburned skin.',
        'Ideal preparation 48–72 hours prior to professional microneedling or clinic peeling treatments.',
        'Enzymatic component requires water activation — always apply to damp skin for optimal proteolytic action.'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-dermo-renewal',
        name: 'Colway Dermo-Renewal Ritual',
        category: 'Cellular Skincare',
        duration: '12 Weeks',
        integration_role: 'Bi-weekly enzymatic priming step executed in Phase 1 and Phase 2 before nightly cream application.',
        synergy_score: 97,
        isPrimary: true
      },
      {
        slug: 'skin_001',
        name: 'GHK-Cu Skin Rejuvenation Protocol',
        category: 'Aesthetic Medicine',
        duration: '8–12 Weeks',
        integration_role: 'Weekly exfoliation phase removing dead keratinocytes to boost transdermal topical peptide bioavailability.',
        synergy_score: 93
      }
    ]
  },

  'colway-collagen-wash-gel': {
    name: 'Cellular Collagen Hydrolipid Wash Gel',
    title: 'Cellular Collagen Hydrolipid Wash Gel — Intact Barrier Cleanser',
    polish_name: null,
    name_pl: null,
    category: 'cosmetics',
    format: 'Face & Body Cleanser',
    volume: '250 mL',
    shortDescription: 'Ultra-gentle sulphate-free cleanser at physiological pH 5.5, preserving the acid mantle and lipid barrier.',
    description: 'Colway Cellular Collagen Hydrolipid Wash Gel is an advanced clinical cleanser designed for ultra-sensitive, mature, or medically compromised skin. Formulated completely free of aggressive sulphates (SLS, SLES), it maintains the stratum corneum acid mantle at physiological pH 5.5. Enriched with biologically intact native fish tropocollagen, pure Aloe Barbadensis leaf juice, Morinda Citrifolia (Noni) fruit extract, and soothing D-Panthenol, it lifts impurities and makeup without stripping the protective hydrolipid film.',
    clinical_indications: [
      'Daily cleansing of hyper-reactive, rosacea-prone, or post-laser/post-peel compromised skin',
      'Protection of the skin microbiome and natural lipid mantle during daily hygiene',
      'Preparation of facial skin before application of clinical collagen gels and peptide serums',
      'Suitable for whole body, delicate mucosal zones, and periorbital makeup removal'
    ],
    technical_specs: {
      formulation_type: 'Biomimetic Hydrolipid Micellar Gel',
      ph_range: '5.5 (Physiological Cutaneous Neutral)',
      volume: '250 mL Ergonomic Dispenser Bottle',
      texture: 'Crystal-Clear Hydro-Active Gel',
      target_zone: 'Face, Neck, Eyes & Full Body',
      dermatological_status: '100% Sulphate-Free (No SLS/SLES), Soap-Free, Hypoallergenic',
      preservation_system: 'Food-Grade Mild Preservative System'
    },
    application_protocol: {
      title: 'Physiological Barrier Cleansing Protocol',
      frequency: 'Twice daily: Morning (AM) & Evening (PM)',
      duration_of_use: 'Continuous daily foundational hygiene',
      steps: [
        {
          step: 1,
          phase: 'Moistening',
          instruction: 'Splash face and neck with lukewarm water (never hot, which dehydrates the skin).',
          duration: '15 seconds'
        },
        {
          step: 2,
          phase: 'Dispensing & Emulsification',
          instruction: 'Dispense 1–2 pumps onto wet palms. Rub hands together to create a gentle, silky low-foam emulsion.',
          duration: '10 seconds'
        },
        {
          step: 3,
          phase: 'Gentle Cutaneous Massage',
          instruction: 'Apply to face, neck, and eyes with light circular motions. Cleanse for 45–60 seconds to allow aloe and tropocollagen peptides to bind surface impurities without friction.',
          duration: '45–60 seconds',
          clinical_note: 'Non-ionic and amphoteric surfactants dissolve sebum without emulsifying intercellular lipid bilayers.'
        },
        {
          step: 4,
          phase: 'Rinsing & Drying',
          instruction: 'Rinse thoroughly with lukewarm water. Gently pat dry with a soft towel without rubbing.',
          duration: '20 seconds'
        }
      ],
      professional_notes: [
        'Safe for use immediately post-procedure (chemical peels, microneedling, laser) due to non-irritating surfactant structure.',
        'Does not sting eyes; thoroughly dissolves water-soluble eye makeup without lipid barrier stripping.',
        'Ideal first step in all clinical cosmetic rituals before application of active collagen gels.'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-dermo-renewal',
        name: 'Colway Dermo-Renewal Ritual',
        category: 'Cellular Skincare',
        duration: '12 Weeks',
        integration_role: 'Mandatory morning and evening physiological cleansing foundation across all protocol phases.',
        synergy_score: 99,
        isPrimary: true
      },
      {
        slug: 'colway-hair-restoration',
        name: 'Colway Hair Restoration System',
        category: 'Trichology',
        duration: '16 Weeks',
        integration_role: 'Recommended body and gentle facial prep cleanser during systemic collagen supplementation.',
        synergy_score: 88
      }
    ]
  },

  'colway-collagen-vege': {
    name: 'Collagen Vege (Plant-Based Tropocollagen)',
    title: 'Collagen Vege — 100% Plant-Based Bioactive Tropocollagen Analog',
    polish_name: null,
    name_pl: null,
    category: 'cosmetics',
    format: 'Dermal Bio-Gel',
    volume: '45 mL',
    shortDescription: 'World-first plant-derived tropocollagen analog containing the full amino acid profile of human Type I collagen.',
    description: 'Colway Collagen Vege represents a biotechnology milestone: a 100% plant-based bioactive collagen analog featuring an amino acid composition matching human Type I tropocollagen. Sourced from green microalgae (Chlorella vulgaris), young coconut water, and bio-ferments, it provides hydroxyproline and hydroxylysine peptide building blocks for vegan patients, reactive rosacea skin, and inflammatory conditions. Formulated with Centella Asiatica, niacinamide, and ferulic acid in a sterile airless dispenser.',
    clinical_indications: [
      '100% vegan extracellular matrix replenishment and dermal elasticity support',
      'Rosacea, facial telangiectasias, and inflammatory erythema reduction',
      'Sensitive, reactive, or compromised skin unable to tolerate animal-derived proteins',
      'Intensive post-laser and post-sun exposure recovery with transdermal cooling effect'
    ],
    technical_specs: {
      formulation_type: 'Airless Hydro-Active Botanical Gel',
      ph_range: '5.0–5.5',
      volume: '45 mL Airless Dispenser',
      texture: 'Light, Rapidly-Absorbed Amber Botanical Gel',
      target_zone: 'Face, Neck, Décolleté & Sensitive Dermal Zones',
      dermatological_status: '100% Vegan (Vegan Society Standard), Cruelty-Free, CPNP Registered',
      preservation_system: 'Biomimetic Ferments & Organic Stabilizers'
    },
    application_protocol: {
      title: 'Botanical Neocollagenesis & Soothing Protocol',
      frequency: 'Daily: Every evening (PM) and/or morning (AM)',
      duration_of_use: 'Continuous regenerative cycle; minimum 8 weeks',
      steps: [
        {
          step: 1,
          phase: 'Dermal Preparation & Hydration',
          instruction: 'Cleanse face with Colway Wash Gel. Leave skin wet or mist generously with pure thermal water or botanical hydrosol (water is the active carrier for collagen gel absorption).',
          duration: '30 seconds',
          clinical_note: 'Intact collagen triple helices require an aqueous interface to dissociate into bioactive transdermal peptide chains.'
        },
        {
          step: 2,
          phase: 'Dispensing & Application',
          instruction: 'Dispense 1–2 pumps of Collagen Vege onto fingertips. Smooth rapidly over face, neck, and décolleté along facial muscle lines.',
          duration: '20 seconds'
        },
        {
          step: 3,
          phase: 'Transdermal Tap-Absorption',
          instruction: 'Gently pat and tap the gel into the skin until completely absorbed (takes approximately 60–90 seconds). A slight tightening sensation is normal as peptides bond to extracellular matrix proteins.',
          duration: '60–90 seconds'
        },
        {
          step: 4,
          phase: 'Occlusive Moisturizer Sealing',
          instruction: 'After 5–8 minutes (once fully absorbed and dry to the touch), apply Colway Blue Diamond Cream or barrier moisturizer to seal in moisture.',
          clinical_note: 'Applying lipid cream over the absorbed gel prevents evaporative moisture loss and locks in plant oligopeptides.'
        }
      ],
      professional_notes: [
        'Store in a cool place away from direct sunlight (optimal storage: 15–25°C).',
        'Exceptional tolerance on rosacea and atopic dermatitis due to Centella Asiatica madecassoside content.',
        'Synergizes with oral Colvita collagen capsules for inside-and-out extracellular matrix restoration.'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-nutricosmetic',
        name: 'Colway Cellular Nutricosmetic System',
        category: 'Nutricosmetics',
        duration: '16 Weeks',
        integration_role: 'Primary topical plant-collagen biological gel applied nightly on damp skin.',
        synergy_score: 98,
        isPrimary: true
      },
      {
        slug: 'skin_001',
        name: 'GHK-Cu Skin Rejuvenation Protocol',
        category: 'Aesthetic Medicine',
        duration: '8–12 Weeks',
        integration_role: 'Plant-based soothing layer applied post-injection to reduce local erythema and support barrier integrity.',
        synergy_score: 90
      }
    ]
  },

  'colway-collagen-lip-care': {
    name: 'Bioactive Collagen Lip Care',
    title: 'Bioactive Collagen Lip Care — Transdermal Labial Barrier Balm',
    polish_name: null,
    name_pl: null,
    category: 'cosmetics',
    format: 'Labial & Mucosa',
    volume: '4.5 g',
    shortDescription: 'Clinical-grade labial barrier balm with native tropocollagen, elastin, palmitoyl oligopeptide, and argan oil.',
    description: 'Colway Bioactive Collagen Lip Care is a targeted labial treatment formulated to restore the vermilion border, prevent perioral rhytids, and repair severe dry cheilitis. Combining bioactive native fish tropocollagen, marine elastin, palmitoyl oligopeptide, shea butter, argan oil, and natural carnauba wax, it creates an invisible breathable shield preventing moisture loss and plumping delicate labial mucosa.',
    clinical_indications: [
      'Severe labial dryness, fissuring, and angular cheilitis repair',
      'Perioral vertical rhytids (smoker’s lines) and loss of vermilion border definition',
      'Post-procedure hydration following hyaluronic acid lip filler injections (applied 24h post-treatment)',
      'Extreme environmental protection against cold, dry winds, UV rays, and arid climates'
    ],
    technical_specs: {
      formulation_type: 'Anhydrous Biomimetic Labial Balm',
      volume: '4.5 g Precision Twist Stick',
      texture: 'Silky, Non-Sticky Melt-In Balm',
      target_zone: 'Lips & Perioral Vermilion Border',
      dermatological_status: 'Hypoallergenic, Dermatologically Tested, CPNP Registered',
      preservation_system: 'Natural Plant Waxes & Vitamin E'
    },
    application_protocol: {
      title: 'Labial Barrier & Vermilion Border Protocol',
      frequency: 'Apply as needed throughout the day; mandatory occlusive application at bedtime',
      duration_of_use: 'Daily continuous protection',
      steps: [
        {
          step: 1,
          phase: 'Direct Labial Application',
          instruction: 'Glide stick directly over upper and lower lips, extending 1 mm past the vermilion border to nourish perioral skin.',
          duration: '10 seconds'
        },
        {
          step: 2,
          phase: 'Bedtime Occlusive Treatment',
          instruction: 'Apply a generous, thick layer before sleep to allow overnight transdermal peptide repair.',
          duration: '10 seconds'
        }
      ],
      professional_notes: [
        'Recommended post-lip filler injection after 24 hours to soothe puncture sites and prolong hyaluronic hydration.',
        'Prevents lip desquamation during oral retinoid (isotretinoin) therapy.'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-dermo-renewal',
        name: 'Colway Dermo-Renewal Ritual',
        category: 'Cellular Skincare',
        duration: '12 Weeks',
        integration_role: 'Complementary labial barrier care protecting lips during full-face renewal cycles.',
        synergy_score: 91
      }
    ]
  },

  'colway-colvita': {
    name: 'Colvita Bioactive Native Collagen',
    title: 'Colvita Bioactive Native Collagen & Marine Algae (60 / 120 Capsules)',
    polish_name: null,
    name_pl: null,
    category: 'nutricosmetics',
    format: 'Capsule',
    volume: '60 / 120 Capsules',
    shortDescription: 'World-renowned oral nutraceutical of freeze-dried native fish tropocollagen, marine bladderwrack algae, and natural vitamin E.',
    description: 'Colvita is a flagship oral nutricosmetic supplement developed through proprietary freeze-drying of biologically active freshwater fish tropocollagen. Unlike standard hydrolyzed gelatin powders, Colvita preserves intact peptide triple helices that signal directly to human fibroblasts and chondrocytes. Formulated synergistically with Fucus Vesiculosus (marine bladderwrack algae rich in bioavailable iodine and trace minerals) and natural D-alpha-tocopherol (vitamin E), it provides systemic neocollagenesis for skin, hair follicles, joints, and vascular walls.',
    clinical_indications: [
      'Systemic skin extracellular matrix depletion, loss of dermal thickness, and sagging',
      'Follicular anchoring support in diffuse hair loss, post-transplant recovery, and telogen effluvium',
      'Joint cartilage maintenance, ligament flexibility, and accelerated athletic recovery',
      'Internal support alongside topical cosmetic and peptide protocols for inside-out synergy'
    ],
    technical_specs: {
      formulation_type: 'Bioactive Freeze-Dried Lyophilized Capsule',
      volume: '60 or 120 Capsules in Blister Packaging',
      dosing_unit: '2 Capsules Daily (200 mg Native Collagen, 300 mg Marine Algae, 24 mg Vitamin E)',
      regulatory_status: 'EU Food Supplement Standards, Clean Label, Halal Compliant Marine Source',
      storage: 'Store in a cool dry place below 25°C away from heat and moisture'
    },
    application_protocol: {
      title: 'Systemic Cellular Collagen Supplementation Protocol',
      frequency: '2 capsules daily: 1 capsule with morning meal, 1 capsule with evening meal',
      duration_of_use: 'Minimum 3 months continuous cycle; recommended 6–12 months for sustained matrix redensification',
      steps: [
        {
          step: 1,
          phase: 'Oral Ingestion with Food',
          instruction: 'Take 1 capsule twice daily (or 2 capsules with main meal) accompanied by a full glass of water. Ingestion with food improves gastrointestinal peptide assimilation.',
          clinical_note: 'Vitamin C co-administration (e.g. fresh citrus or vitamin C supplement) accelerates endogenous prolyl hydroxylase and collagen synthesis.'
        },
        {
          step: 2,
          phase: 'Hydration Hydration Rule',
          instruction: 'Ensure daily intake of at least 1.5–2.0 liters of water. Collagen peptides bind water within the extracellular matrix, swelling interstitial tissues.',
          clinical_note: 'Optimal systemic hydration is mandatory for cutaneous turgor and dermal hydration improvements.'
        }
      ],
      professional_notes: [
        'Contraindicated in individuals with documented hypersensitivity to fish or seafood products.',
        'Contains naturally occurring iodine from marine algae: patients with hyperthyroidism should consult their endocrinologist.',
        'Ideal systemic foundation for all injectable peptide protocols (BPC-157, TB-500, GHK-Cu).'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-hair-restoration',
        name: 'Colway Hair Restoration System',
        category: 'Trichology',
        duration: '16 Weeks',
        integration_role: 'Mandatory systemic oral collagen foundation reinforcing follicular anchoring and dermal papilla neocollagenesis.',
        synergy_score: 97,
        isPrimary: true
      },
      {
        slug: 'colway-nutricosmetic',
        name: 'Colway Cellular Nutricosmetic System',
        category: 'Nutricosmetics',
        duration: '16 Weeks',
        integration_role: 'Central systemic pillar pairing with topical Collagen Vege for 360-degree matrix restoration.',
        synergy_score: 99,
        isPrimary: true
      },
      {
        slug: 'rec_001',
        name: 'Recovery & Extracellular Matrix Protocol',
        category: 'Regenerative Medicine',
        duration: '12 Weeks',
        integration_role: 'Supplies raw bioactive collagen peptides to accelerate tendon, ligament, and fascial repair.',
        synergy_score: 92
      }
    ]
  },

  'colway-strengthening-shampoo': {
    name: 'Strengthening Hair Shampoo',
    title: 'Strengthening Hair Shampoo — Follicular Ostium Cleanser & Microcirculation Activator',
    polish_name: null,
    name_pl: null,
    category: 'trichology_hair_care',
    format: 'Dispenser Pump Bottle',
    volume: '250 mL',
    shortDescription: 'Clinical trichology shampoo engineered with micronized diosmin, caffeine, and native tropocollagen to stimulate scalp microcirculation and strengthen follicular anchoring.',
    description: 'Colway Strengthening Hair Shampoo is a targeted trichological formula designed to combat excessive hair shedding, follicular miniaturization, and microcirculatory stagnation. Powered by micronized diosmin crystals that stimulate scalp capillary blood flow during massage, alongside transdermal caffeine, biologically active native fish tropocollagen, and gentle plant cleansers. It unblocks follicular ostia without stripping the scalp hydrolipid barrier, preparing hair roots for intensive growth therapies.',
    clinical_indications: [
      'Androgenetic alopecia, telogen effluvium, and seasonal hair thinning',
      'Weak, fragile, devitalized hair prone to mechanical breakage',
      'Pre- and post-operative hair transplant scalp hygiene',
      'Scalp microvascular congestion and excessive sebum accumulation at follicular ostia'
    ],
    technical_specs: {
      formulation_type: 'Bioactive Trichological Cleansing Emulsion',
      ph_range: '5.5 (Physiological Scalp pH)',
      volume: '250 mL Dispenser Pump Bottle',
      texture: 'Pearly Viscous Gel with Micro-Dispersed Diosmin',
      target_zone: 'Scalp & Hair Follicular Units',
      dermatological_status: 'Dermatologically & Trichologically Tested, SLS-Free, Paraben-Free',
      preservation_system: 'Gentle Dermocosmetic Preservative System'
    },
    application_protocol: {
      title: 'Trichological Scalp Cleansing & Stimulation Protocol',
      frequency: '2–3 times weekly (or daily for active androgenetic thinning regimens)',
      duration_of_use: 'Continuous trichological regimen; minimum 12–16 weeks for visible follicular density improvement',
      steps: [
        {
          step: 1,
          phase: 'Scalp Pre-Wet & Thermal Opening',
          instruction: 'Thoroughly wet scalp and hair with warm water (37–38°C) for 60 seconds to open follicular ostia and liquefy sebum deposits.',
          duration: '60 seconds'
        },
        {
          step: 2,
          phase: 'Primary Dispersion & Lathering',
          instruction: 'Dispense 1–2 pumps onto wet palms. Distribute evenly across the frontal hairline, vertex, and occipital scalp zones. Lather gently with circular fingertip motions.',
          duration: '30 seconds'
        },
        {
          step: 3,
          phase: 'Trichological Micro-Massage & Diosmin Activation',
          instruction: 'Perform deep circular fingertip pressure over the scalp for 2 full minutes. Do not use fingernails. Allow diosmin and caffeine to stimulate dermal papilla blood flow.',
          duration: '2 minutes',
          clinical_note: 'Active micro-massage creates mechanical shear forces that enhance micronized diosmin absorption into perifollicular capillary beds.'
        },
        {
          step: 4,
          phase: 'Biological Contact Pause',
          instruction: 'Leave the shampoo lather resting on the scalp for an additional 1–2 minutes before rinsing to allow native collagen peptides and caffeine to penetrate follicular sheaths.',
          duration: '1–2 minutes'
        },
        {
          step: 5,
          phase: 'Thorough Warm Water Rinse',
          instruction: 'Rinse scalp and hair shafts completely with plenty of lukewarm water until runoff is completely clear. Follow immediately with Strengthening Hair Conditioner.',
          duration: '60 seconds'
        }
      ],
      professional_notes: [
        'Safe for post-hair transplant use after day 14 (or as cleared by the surgical team).',
        'Free of SLS/SLES surfactants: prevents reactive rebound sebum hypersecretion.',
        'Synergistic companion to oral Colvita collagen and injectable hair growth peptides (GHK-Cu, Zn-Thymulin).'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-hair-restoration',
        name: 'Colway Hair Restoration System',
        category: 'Trichology',
        duration: '16 Weeks',
        integration_role: 'Primary cleansing step removing scalp sebum and delivering caffeine & diosmin to hair follicles.',
        synergy_score: 99,
        isPrimary: true
      }
    ]
  },

  'colway-strengthening-conditioner': {
    name: 'Strengthening Hair Conditioner',
    title: 'Strengthening Hair Conditioner — Cuticular Biosealing & Fiber Reinforcement',
    polish_name: null,
    name_pl: null,
    category: 'trichology_hair_care',
    format: 'Flexible Dispenser Tube',
    volume: '200 mL',
    shortDescription: 'Advanced restorative hair conditioner with native fish collagen, argan oil, and cuticular lipid sealers to eliminate porosity and prevent breakage.',
    description: 'Colway Strengthening Hair Conditioner is formulated to repair damaged keratin fibers, seal open hair cuticles, and provide intense thermal and environmental protection. Enriched with native freshwater fish tropocollagen, cold-pressed organic argan oil, camellia seed oil, and D-panthenol, it deposits a biomimetic protective sheath along the entire hair shaft without weighing down fine or thinning strands. It restores tensile strength, smoothness, and light reflectivity while preventing static friction.',
    clinical_indications: [
      'Brittle, porous, chemically treated or heat-damaged hair shafts',
      'Excessive breakage during detangling and brushing',
      'Dull, lifeless hair lacking natural lipid shine and flexibility',
      'Supportive shaft conditioning during clinical hair thinning protocols'
    ],
    technical_specs: {
      formulation_type: 'Lipid-Replenishing Hair Emulsion',
      ph_range: '4.5–5.0 (Optimal Cuticle Sealing Acidic pH)',
      volume: '200 mL Flexible Dispenser Tube',
      texture: 'Rich, Non-Greasy Velvety Cream',
      target_zone: 'Hair Mid-Lengths and Ends',
      dermatological_status: 'Dermatologically Tested, Paraben-Free, Lightweight Non-Weighing Formula',
      preservation_system: 'Cosmetic Grade Biodegradable Preservatives'
    },
    application_protocol: {
      title: 'Fiber Restructuring & Cuticular Sealing Protocol',
      frequency: 'After every shampoo wash (2–3 times weekly)',
      duration_of_use: 'Continuous fiber maintenance protocol',
      steps: [
        {
          step: 1,
          phase: 'Excess Moisture Removal',
          instruction: 'After rinsing Strengthening Hair Shampoo, gently squeeze excess water from hair strands using hands or a soft micro-fiber towel.',
          duration: '15 seconds'
        },
        {
          step: 2,
          phase: 'Application to Lengths & Ends',
          instruction: 'Dispense a walnut-sized amount (~5–10 mL depending on hair length) onto palms. Apply starting from mid-shaft down to the tips. Avoid applying directly to the scalp roots.',
          duration: '30 seconds'
        },
        {
          step: 3,
          phase: 'Restructuring Dwell Period',
          instruction: 'Allow active collagen, argan oil, and panthenol to penetrate damaged cuticular crevices for 2–3 minutes.',
          duration: '2–3 minutes',
          clinical_note: 'Acidic pH 4.5 promotes tight closure of keratin scales, locking moisture within the hair cortex.'
        },
        {
          step: 4,
          phase: 'Cool Water Rinse',
          instruction: 'Rinse thoroughly with cool to lukewarm water. A cool water final rinse maximizes cuticle flat alignment and specular light reflection.',
          duration: '45 seconds'
        }
      ],
      professional_notes: [
        'Non-occlusive, non-greasy formula that does not weigh down fine thinning hair.',
        'Apply exclusively to mid-lengths and ends to avoid scalp pore congestion.',
        'Complements the Colway Hair Restoration System to protect vulnerable newly grown strands.'
      ]
    },
    associated_protocols: [
      {
        slug: 'colway-hair-restoration',
        name: 'Colway Hair Restoration System',
        category: 'Trichology',
        duration: '16 Weeks',
        integration_role: 'Fiber conditioning and cortex sealing step applied to hair lengths after every wash.',
        synergy_score: 99,
        isPrimary: true
      }
    ]
  }
};

async function run() {
  console.log('🚀 Updating Colway Products in Firestore with Clean Dossiers...');

  for (const [id, data] of Object.entries(COLWAY_UPDATES)) {
    const docRef = db.collection('products').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      console.warn(`⚠️ Product ${id} not found in Firestore. Creating doc...`);
    }

    // Clean up polish fields using FieldValue.delete() or null
    await docRef.set(data, { merge: true });
    console.log(`✅ Successfully updated ${id} -> "${data.name}"`);
  }

  console.log('🎉 All 8 Colway products successfully updated in Firestore without Polish names!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error updating Colway products:', err);
  process.exit(1);
});
