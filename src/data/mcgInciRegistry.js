/**
 * src/data/mcgInciRegistry.js
 * 
 * Authoritative International Nomenclature of Cosmetic Ingredients (INCI) Registry
 * & Clinical Active Ingredients Database for MCG Cosmetics / McG Medical Cosmeceutical Group.
 * 
 * Featured Formulations:
 * 1. mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack
 *    (Kapigen Intensive Anti-Hair Loss Scalp Spray with 5% Procapil® — Double Advantage Pack)
 */

export const MCG_PRODUCTS_INCI_REGISTRY = {
  // ─── 1. MCG KAPIGEN 5% PROCAPIL ANTI-HAIR LOSS SPRAY (2-PACK) ───────────────
  'mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack': {
    slug: 'mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack',
    canonicalKey: 'mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack',
    brand: 'MCG Cosmetics',
    brandBadge: 'McG Medical Cosmeceutical Group',
    title: 'Kapigen Intensive 5% Procapil® Anti-Hair Loss Scalp Spray (Double Advantage Pack 2 × 75 mL)',
    key_actives_summary: '5% PROCAPIL® Matrix (Biotinyl Tripeptide-1, Oleanolic Acid & Apigenin), Pure D-Biotin, Provitamin B5 (Panthenol), Hydrolyzed Vegetable Phytokeratin, D-Alpha Tocopherol (Vitamin E), Allantoin & Natural L-Menthol',
    routine_badge: 'SCALP DERMA ACTIVATOR · LEAVE-IN BIO-SERUM',
    hero_stats: [
      { stat: '5.0%', label: 'Procapil® Complex', sub: 'Clinical multi-active peptide matrix' },
      { stat: '−58%', label: 'Follicular DHT', sub: 'Botanical 5α-reductase I/II suppression' },
      { stat: '+46%', label: 'Follicle Anchoring', sub: 'Laminin-5 & Collagen IV upregulation' },
      { stat: '0%', label: 'Minoxidil Dependency', sub: 'Zero withdrawal shedding or rebound effect' }
    ],
    application_tip: 'Direct Scalp Protocol: Apply twice daily directly onto dry or towel-damp scalp. Focus 5 to 8 targeted pump sprays along receding hair lines, crown parting, and thinning zones. Massage gently with finger pads for 2 minutes to induce microcirculation. Leave in completely without rinsing.',
    clinical_focus_dossier: 'Targeted trichological therapy for androgenetic alopecia (AGA), chronic and acute telogen effluvium, seasonal diffuse thinning, and post-hair restoration graft maintenance (FUE/DHI, Day 14+). Formulated to address the root causes of hair miniaturization without the systemic side effects or dependency cycles of conventional minoxidil.',
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Follicular Root Anchoring & ECM Adhesion Upregulation',
        pathway: 'Biotinyl-GHK / Integrin & Basal Membrane Signal Cascade',
        target: 'Dermal Papilla & Outer Root Sheath (ORS)',
        endpoint: '+46% Follicular Anchoring Strength',
        tag: 'Extracellular Matrix Adhesion',
        description: 'Biotinyl Tripeptide-1 (Biotinyl-GHK) acts directly on follicular basement membrane macromolecules, stimulating the synthesis of Laminin-5 and Collagen IV. This secures the follicle deeply within the dermis, dramatically increasing anchoring resistance and halting premature telogen shedding.'
      },
      {
        id: 'MEC-02',
        title: 'Botanical 5α-Reductase Type I & II DHT Blockade',
        pathway: 'Oleanolic Acid Steroid Reductase Enzymatic Competitive Inhibition',
        target: 'Follicular Sebaceous & Papilla Androgen Receptors',
        endpoint: 'Halts Follicular Miniaturization',
        tag: 'Anti-Androgenic Shield',
        description: 'Oleanolic acid, a natural triterpenoid extracted from olive tree leaves (Olea europaea), exerts powerful non-hormonal inhibitory activity against both Type I and Type II 5-alpha reductase enzymes, preventing the conversion of testosterone into follicle-miniaturizing Dihydrotestosterone (DHT).'
      },
      {
        id: 'MEC-03',
        title: 'Perifollicular Microvascular Vasodilation & TRPM8 Activation',
        pathway: 'Apigenin Flavone & L-Menthol Synergistic Capillary Flow',
        target: 'Peribulbar Microcapillary Plexus',
        endpoint: '+28% Dermal Microcirculation & Oxygenation',
        tag: 'Follicular Perfusion',
        description: 'Apigenin, a citrus bioflavonoid, promotes local vasodilation and improves microcapillary perfusion around the hair bulb. Synergized with bioactive L-menthol, it activates sensory cooling and endothelial nitric oxide pathways, delivering optimal nutrient flow to anagen matrix cells.'
      },
      {
        id: 'MEC-04',
        title: 'Keratinocyte Bio-Nutrient Matrix & Cuticle Tensile Repair',
        pathway: 'D-Biotin, Phytokeratin & Provitamin B5 Shaft Reinforcement',
        target: 'Hair Shaft Cortex, Cuticle & Scalp Hydrolipid Barrier',
        endpoint: '+22% Tensile Elasticity & Breakage Reduction',
        tag: 'Shaft Densification',
        description: 'Micronized plant-derived phytokeratin and Provitamin B5 (Panthenol) penetrate deep into the hair cortex to restore depleted disulfide bonds and re-hydrate keratin lamellae. Pure D-Biotin reinforces the hair matrix structure, while Allantoin soothes inflammation and prevents scalp flaking.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Follicular Anchoring & Retention',
        compound: 'Biotinyl-GHK (Procapil® Peptide Matrix)',
        mechanism: 'Induction of Laminin-5 and Collagen IV Basal Proteins',
        outcome: 'Reinforces the structural anchoring of hair roots in the dermis, significantly delaying the entry of hair into the catagen phase.',
        stat: '+46% Anchor Density'
      },
      {
        target: 'DHT Miniaturization Prevention',
        compound: 'Oleanolic Acid (5α-Reductase Inhibitor)',
        mechanism: 'Competitive Inhibition of Follicular 5α-Reductase Types I & II',
        outcome: 'Suppresses follicular testosterone-to-DHT conversion, protecting hair bulbs against progressive miniaturization and calvities.',
        stat: '−58% DHT Activity'
      },
      {
        target: 'Microcapillary Scalp Perfusion',
        compound: 'Apigenin Flavonoid & L-Menthol',
        mechanism: 'Endothelial Vasodilation & Nitric Oxide Mediated Flow',
        outcome: 'Enhances microvascular delivery of oxygen, glucose, and trace minerals directly to dividing anagen matrix cells.',
        stat: '+28% Perfusion'
      },
      {
        target: 'Hair Caliber & Cortical Elasticity',
        compound: 'Phytokeratin, D-Biotin & Panthenol',
        mechanism: 'Cross-Linking of Keratin Fibers & Hydrophobic Moisture Lock',
        outcome: 'Restores tensile strength, expands hair strand diameter, and eliminates brittleness and post-styling mechanical breakage.',
        stat: '+22% Tensile Strength'
      },
      {
        target: 'Scalp Tolerance & Anti-Irritation',
        compound: 'Allantoin & D-Alpha Tocopherol',
        mechanism: 'Re-epithelialization & Lipid Peroxidation Interception',
        outcome: 'Maintains optimal scalp microbiota balance, controls micro-inflammation, and mitigates dry flaking and itching.',
        stat: '100% Scalp Calming'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Deionized Water',
        function: ['Solvent', 'Primary Aqueous Carrier'],
        inci_group: 'base',
        concentration_range: '65–75%',
        origin: 'Ultra-Pure Deionized Grade',
        role: 'Aqueous solvent system adjusted to optimal scalp physiological pH 5.5 to ensure maximum delivery of water-soluble actives.'
      },
      {
        inci_name: 'Alcohol Denat.',
        common_name: 'Denatured Ethanol',
        function: ['Solvent', 'Penetration Enhancer'],
        inci_group: 'base',
        concentration_range: '10–15%',
        origin: 'Fermented Plant Origin',
        role: 'Ensures instantaneous trans-epidermal penetration of Procapil® peptide fractions without leaving any greasy or heavy film on the scalp.'
      },
      {
        inci_name: 'Butylene Glycol',
        common_name: 'Butylene Glycol',
        function: ['Humectant', 'Bio-Delivery Vehicle'],
        inci_group: 'base',
        concentration_range: '3–6%',
        origin: 'Cosmetic Grade',
        role: 'Facilitates cellular partition and maintains active humectant moisture around follicular ostia.'
      },
      {
        inci_name: 'PPG-26-Buteth-26',
        common_name: 'Polyoxyalkylene Glycol Ether',
        function: ['Solubilizer', 'Conditioning Agent'],
        inci_group: 'functional',
        concentration_range: '1–3%',
        origin: 'Cosmetic Emulsifier',
        role: 'Solubilizes oleanolic acid and apigenin into an ultra-fine, transparent micro-sprayable dispersion.'
      },
      {
        inci_name: 'PEG-40 Hydrogenated Castor Oil',
        common_name: 'Hydrogenated Castor Oil Ether',
        function: ['Non-Ionic Emulsifier', 'Solubilizer'],
        inci_group: 'functional',
        concentration_range: '1–2%',
        origin: 'Castor Seed (Ricinus communis)',
        biodegradable: true,
        role: 'Ensures homogeneous suspension of lipophilic botanical fractions in the light aqueous spray base.'
      },
      {
        inci_name: 'Apigenin',
        common_name: 'Apigenin Bioflavonoid (Procapil® Constituent)',
        function: ['Vasodilator', 'Microcirculation Activator', 'Antioxidant'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Botanical Citrus & Grapefruit Extract',
        role: 'Potent natural flavonoid that induces perifollicular capillary vasodilation and neutralizes reactive oxygen species in the dermal papilla.'
      },
      {
        inci_name: 'Oleanolic Acid',
        common_name: 'Oleanolic Acid (Procapil® Constituent)',
        function: ['5α-Reductase Inhibitor', 'Anti-Androgenic Shield'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Olive Tree Leaves (Olea europaea)',
        role: 'Specific inhibitor of 5-alpha reductase, preventing local follicular DHT synthesis and cellular miniaturization.'
      },
      {
        inci_name: 'Biotinyl Tripeptide-1',
        common_name: 'Biotinyl-GHK Peptide (Procapil® Constituent)',
        function: ['Extracellular Matrix Signal Peptide', 'Follicle Anchoring'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Biotechnological Vitamin-Conjugated Peptide',
        role: 'Signal peptide combining biotin with Gly-His-Lys. Stimulates cellular metabolism and anchors hair roots firmly via Laminin-5 synthesis.'
      },
      {
        inci_name: 'Biotin',
        common_name: 'Pure Vitamin B7 / D-Biotin',
        function: ['Keratin Biosynthesis Co-factor', 'Hair Fortifier'],
        inci_group: 'key_active',
        concentration_range: '0.2–0.5%',
        origin: 'Pharmaceutical Grade Vitamin',
        role: 'Essential cofactor in fatty acid and amino acid synthesis, providing critical building blocks for keratin fiber assembly.'
      },
      {
        inci_name: 'Panthenol',
        common_name: 'Provitamin B5',
        function: ['Humectant', 'Deep Dermal Soother', 'Shaft Plumper'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.5%',
        origin: 'USP Pharmaceutical Grade',
        role: 'Penetrates the hair cuticle into the cortex, expanding fiber diameter and soothing scalp irritation.'
      },
      {
        inci_name: 'Hydrolyzed Vegetable Protein',
        common_name: 'Phytokeratin Peptides',
        function: ['Tensile Reinforcement', 'Cuticle Smoothing'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Enzymatically Hydrolyzed Plant Protein',
        role: 'Low-molecular-weight amino acids that penetrate micro-fractures in the hair fiber, restoring disulfide tensile strength.'
      },
      {
        inci_name: 'Tocopheryl Acetate',
        common_name: 'Vitamin E Acetate',
        function: ['Lipophilic Antioxidant', 'Membrane Protector'],
        inci_group: 'functional_active',
        concentration_range: '0.2–0.5%',
        origin: 'Natural Plant Tocopherol',
        role: 'Protects follicular cell membranes and lipid bilayers from environmental and UV-induced oxidative peroxidation.'
      },
      {
        inci_name: 'Menthol',
        common_name: 'Natural L-Menthol',
        function: ['Sensory Cooling', 'Microvascular Flow Enhancer'],
        inci_group: 'functional_active',
        concentration_range: '0.1–0.3%',
        origin: 'Mentha arvensis Essential Oil',
        role: 'Activates TRPM8 cold-sensitive receptors, promoting immediate refreshing sensory relief and microvascular hyperemia.'
      },
      {
        inci_name: 'Allantoin',
        common_name: 'Allantoin Glyoxyldiureide',
        function: ['Scalp Calming', 'Epithelial Repair', 'Anti-Irritant'],
        inci_group: 'functional_active',
        concentration_range: '0.1–0.3%',
        origin: 'Botanical Comfrey / Synthetic Pure',
        role: 'Accelerates physiological cellular desquamation, prevents epidermal scaling, and protects sensitive scalp skin.'
      },
      {
        inci_name: 'Citric Acid',
        common_name: 'Citric Acid Monohydrate',
        function: ['pH Regulator', 'Buffer'],
        inci_group: 'functional',
        concentration_range: '< 0.1%',
        origin: 'Fermented Citrus Origin',
        role: 'Micro-buffers the formulation to a hair and scalp physiological pH 5.2–5.5.'
      },
      {
        inci_name: 'Phenoxyethanol',
        common_name: 'Phenoxyethanol',
        function: ['Broad-Spectrum Preservative'],
        inci_group: 'preservative',
        concentration_range: '0.4–0.7%',
        origin: 'Clean Cosmetic Grade',
        role: 'Prevents microbial, fungal, and bacterial contamination, preserving active peptide stability.'
      },
      {
        inci_name: 'Ethylhexylglycerin',
        common_name: 'Ethylhexylglycerin',
        function: ['Preservative Booster', 'Skin Softener'],
        inci_group: 'preservative',
        concentration_range: '0.05–0.1%',
        origin: 'Vegetable Glycerin Derivative',
        role: 'Enhances antimicrobial efficacy while improving product sensorial spreadability.'
      }
    ]
  }
};

export const MCG_SAFETY_REGISTRY = {
  'mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack': {
    categoryBadge: 'TRICHOLOGICAL SCALP SAFETY',
    title: 'Kapigen Intensive Scalp Tolerance, Post-Transplant Safety & Protocol',
    warnings: [
      'For external topical application onto the scalp only. Do not ingest or inhale spray mist.',
      'Avoid contact with eyes, mucous membranes, or open weeping lesions. In case of accidental contact, flush thoroughly with clean running water.',
      'Initial application note: Contains pure natural L-menthol. A mild, pleasant tingling and cooling sensation is normal and indicates activated microcirculation.',
      'Post-Hair Transplant Protocol (FUE/DHI): Recommended for use starting on Day 14+ post-op, once grafts have firmly anchored and crusts have fallen off. Consult your surgeon prior to application.',
      'Zero minoxidil dependency: This formulation is free from synthetic minoxidil and finasteride. Discontinuation does not trigger acute telogen rebound shedding.',
      'Storage: Store between 15°C and 25°C away from direct sunlight and excessive heat. Keep bottles tightly sealed with applicator cap in place.'
    ],
    protocolTitle: 'KAPIGEN 24-HOUR DOUBLE-DOSE SCALP PROTOCOL',
    protocolSteps: [
      'Morning application: Part dry or towel-dried hair into sections. Apply 5–8 targeted pumps directly at the roots of thinning areas. Massage gently with fingertips for 60–90 seconds. Style as desired.',
      'Evening application: Repeat 5–8 pumps before bed to allow undisturbed nocturnal delivery while cellular mitotic repair peaks.',
      'Consistency rule: For optimal follicular reactivation, maintain twice-daily use consistently for a minimum recommended course of 3 to 6 months (2 to 4 packs).',
      'Synergistic hygiene: Pair with a gentle physiological pH 5.5 sulfate-free hair cleanser (such as Colway Strengthening Shampoo) to ensure clear follicular ostia.'
    ],
    disclaimer: 'Medical-grade trichological leave-in cosmeceutical manufactured under ISO 22716 Cosmetics GMP standards and compliant with EU Regulation (EC) 1223/2009 and US FDA cosmetic labeling guidelines.'
  }
};

/**
 * Resolves canonical key for any MCG product slug.
 * @param {string} slug
 * @returns {string|null}
 */
export function resolveMcgCanonicalKey(slug = '') {
  const clean = String(slug || '').toLowerCase().trim();
  if (clean.includes('kapigen') || clean.includes('procapil') || clean.includes('mcg-')) {
    return 'mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack';
  }
  return null;
}

/**
 * Returns tailored clinical safety data for any MCG product slug.
 * @param {string} slug
 * @returns {object|null}
 */
export function getMcgProductSafety(slug = '') {
  const key = resolveMcgCanonicalKey(slug);
  return key ? MCG_SAFETY_REGISTRY[key] : null;
}

/**
 * Returns complete MCG INCI and active ingredients data for any product slug.
 * @param {string} slug 
 * @returns {object|null}
 */
export function getMcgProductData(slug = '') {
  if (!slug) return null;
  const key = resolveMcgCanonicalKey(slug);
  if (key && MCG_PRODUCTS_INCI_REGISTRY[key]) {
    const data = { ...MCG_PRODUCTS_INCI_REGISTRY[key] };
    data.safety_precautions = MCG_SAFETY_REGISTRY[key] || null;
    return data;
  }
  return null;
}

/**
 * Returns complete canonical Product object with variants for public catalog resolution
 * @param {string} slug
 * @returns {object|null}
 */
export function getMcgProductBySlug(slug = '') {
  const key = resolveMcgCanonicalKey(slug);
  if (!key) return null;

  const inci = MCG_PRODUCTS_INCI_REGISTRY[key];
  if (!inci) return null;

  return {
    id: key,
    canonicalKey: key,
    slug: key,
    name: 'MCG Kapigen 5% Procapil® Anti-Hair Loss Spray (2-Pack)',
    canonicalName: 'MCG Kapigen 5% Procapil® Anti-Hair Loss Spray (2-Pack)',
    brand: 'MCG Cosmetics',
    vendor: 'MCG Cosmetics',
    supplier: 'MCG Cosmetics',
    supplierName: 'MCG Cosmetics',
    supplierId: 'supplier-mcg',
    suppliers: ['supplier-mcg'],
    supplierIds: ['supplier-mcg'],
    isSingleSupplierLocked: true,
    status: 'published',
    category: 'cosmetics',
    therapeutic_category: 'Medical Cosmeceuticals & Follicular Trichology',
    type: 'cosmetic',
    productType: 'cosmetic',
    is_cosmetic: true,
    isCosmetic: true,
    isTrichology: true,
    dosageForm: 'Topical Scalp Solution (Direct Micro-Spray Nozzle)',
    dispensingForm: 'Leave-In Scalp Serum (2-Pack)',
    leadTimeDays: 3,
    purity: '5% Clinically Certified Procapil® Matrix (Biotinyl-GHK + Oleanolic Acid + Apigenin)',
    rating: 4.96,
    reviewsCount: 42,
    cost: 28,
    price: 74.99,
    wholesale_price: 42,
    retail_price: 74.99,
    unit_price: 74.99,
    image: '/images/products/mcg/kapigen-spray.svg',
    images: [
      '/images/products/mcg/kapigen-spray.svg',
      'https://cdn.myikas.com/images/dc0227e7-82bf-421b-bb54-d5c006f52080/63572ca1-929d-40eb-93b4-33a15c09a658/1080/turkce.webp'
    ],
    description:
      'MCG Kapigen Anti-Hair Loss Spray is an intensive leave-in scalp serum formulated by the McG Medical Cosmeceutical Group R&D team. Powered by a clinically proven 5% concentration of patented Procapil® (Biotinyl Tripeptide-1, Oleanolic Acid, and Apigenin), pure D-Biotin, Provitamin B5, phytokeratin, and natural menthol, it targets the biological root causes of hair miniaturization and follicular shedding. It strengthens follicular anchoring, inhibits local 5α-reductase enzymatic conversion to DHT, and boosts perifollicular microcirculation without the rebound shedding or cardiovascular side effects of synthetic minoxidil.',
    shortDescription:
      'Patented 5% Procapil® Peptide Matrix + Biotin + Phytokeratin + Provitamin B5 + Menthol (Double Advantage 2 × 75 mL Pack).',
    mechanism:
      'Biotinyl-GHK upregulates ECM anchoring proteins (Laminin-5 and Collagen IV) in the outer root sheath; Oleanolic acid competitively inhibits 5α-reductase Types I and II to block follicular DHT miniaturization; Apigenin flavone and L-menthol induce microvascular dilation to perfuse anagen hair bulb matrix cells.',
    dosingInstructions:
      'Apply 5 to 8 sprays directly onto dry or towel-damp scalp twice daily (morning & night). Massage with fingertips for 2 minutes. Leave in without rinsing.',
    variants: [
      {
        id: 'mcg-kapigen-spray-2pk',
        productId: key,
        productName: 'MCG Kapigen 5% Procapil® Anti-Hair Loss Spray (2-Pack)',
        name: 'Double Advantage Pack (2 × 75 mL / 150 mL Total)',
        sku: 'SKU-MCG-KAPIGEN-2PK',
        format: 'Spray',
        dosage: '2 × 75 mL (150 mL Total)',
        size: '2 Bottles Box (Double Advantage Pack)',
        pricing: {
          master: { perUnit: 28, currency: 'USD' },
          wholesale: { perUnit: 42, currency: 'USD' },
          clinic: { perUnit: 49, currency: 'USD' },
          retail: { perUnit: 74.99, currency: 'USD' }
        },
        cost: 28,
        price: 74.99,
        unit_price: 74.99,
        stock: { available: 120, allocated: 0, reserved: 0 },
        supplierId: 'supplier-mcg',
        supplierName: 'MCG Cosmetics',
        supplier: 'MCG Cosmetics',
        status: 'published',
        isDefault: true
      },
      {
        id: 'mcg-kapigen-spray-1pk',
        productId: key,
        productName: 'MCG Kapigen 5% Procapil® Anti-Hair Loss Spray (Single Bottle)',
        name: 'Single Clinical Bottle (1 × 75 mL)',
        sku: 'SKU-MCG-KAPIGEN-1PK',
        format: 'Spray',
        dosage: '1 × 75 mL',
        size: '1 Bottle (75 mL)',
        pricing: {
          master: { perUnit: 16, currency: 'USD' },
          wholesale: { perUnit: 24, currency: 'USD' },
          clinic: { perUnit: 28, currency: 'USD' },
          retail: { perUnit: 39.99, currency: 'USD' }
        },
        cost: 16,
        price: 39.99,
        unit_price: 39.99,
        stock: { available: 85, allocated: 0, reserved: 0 },
        supplierId: 'supplier-mcg',
        supplierName: 'MCG Cosmetics',
        supplier: 'MCG Cosmetics',
        status: 'published',
        isDefault: false
      }
    ]
  };
}
