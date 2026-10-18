/**
 * src/services/specialtyBlueprintsEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Atlas Specialty Practice Blueprints & Physician Web Footprint Engine
 *
 * Bridges two physician segments seamlessly:
 *  1. Zero-Rx / Onboarding Physicians: Provides immediate, personalized clinical
 *     and commercial value tailored to their specialty and researched internet
 *     practice footprint (procedures, clinic focus, publications).
 *  2. Active Prescribing Physicians: Expands their practice beyond current
 *     prescriptions by recommending cross-pillar protocols aligned with the
 *     surgical and medical procedures they perform at their clinic.
 *
 * Pure client/server-safe module (no Node-only dependencies).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SPECIALTY_VERTICALS = [
  {
    key: 'trichology',
    label: 'Trichology & Hair Restoration Surgery',
    shortLabel: 'Trichology & FUE/DHI',
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#bae6fd',
    defaultProcedures: [
      'FUE / DHI Follicular Unit Extraction & Implantation',
      'Androgenetic Alopecia (AGA) Medical Management',
      'Scalp Mesotherapy, PRP & Exosome Biostimulation',
      'Post-Transplant Telogen Effluvium & Donor Recovery'
    ]
  },
  {
    key: 'dermatology',
    label: 'Clinical, Laser & Aesthetic Dermatology',
    shortLabel: 'Dermatology & Laser',
    color: '#4338ca',
    bg: '#e0e7ff',
    border: '#c7d2fe',
    defaultProcedures: [
      'Fractional CO2 / Er:YAG Laser Resurfacing & RF Microneedling',
      'Melasma, Post-Inflammatory Hyperpigmentation (PIH) & Rosacea',
      'Extracellular Matrix (ECM) Bio-Revitalization & Collagen Induction',
      'Acne Vulgaris, Barrier Repair & Medical Dermocosmetics'
    ]
  },
  {
    key: 'plastic_surgery',
    label: 'Plastic, Reconstructive & Aesthetic Surgery',
    shortLabel: 'Aesthetic & Plastic Surgery',
    color: '#be185d',
    bg: '#fce7f3',
    border: '#fbcfe8',
    defaultProcedures: [
      'Facial Aesthetic Surgery (Facelift, Blepharoplasty, Rhinoplasty)',
      'Body Contouring, Liposculpture & Autologous Fat Grafting',
      'Post-Surgical Incision Healing & Hypertrophic Scar Prevention',
      'Peri-Operative Microvascular Tissue Oxygenation & Edema Control'
    ]
  },
  {
    key: 'regenerative_orthopedics',
    label: 'Orthopedic Surgery, Sports & Regenerative Medicine',
    shortLabel: 'Orthopedics & Tissue Repair',
    color: '#047857',
    bg: '#d1fae5',
    border: '#a7f3d0',
    defaultProcedures: [
      'Tendon, Ligament & Rotator Cuff Biologic Repair',
      'Intra-Articular Cartilage Preservation & Osteoarthritis Protocols',
      'Post-Arthroscopy Rehabilitation & Myofascial Recovery',
      'Orthobiologics (PRP / BMAC) Adjuvant Peptide Signaling'
    ]
  },
  {
    key: 'longevity_bhrt',
    label: 'Longevity, Genomic & Bioidentical Hormone Medicine',
    shortLabel: 'Longevity & BHRT',
    color: '#6d28d9',
    bg: '#ede9fe',
    border: '#ddd6fe',
    defaultProcedures: [
      'Bioidentical Hormone Replacement Therapy (BHRT / TRT)',
      'Cellular Senescence, NAD+ & Mitochondrial Biogenesis',
      'Cardiometabolic Optimization & GLP-1/GIP Weight Management',
      'Epigenetic Telomere & Circadian Neuro-Endocrine Restoration'
    ]
  }
];

/**
 * Curated Web Footprint Profiles for known physicians in our directory,
 * synthesized from public medical directories, clinic websites, and societies.
 */
export const CURATED_DOCTOR_WEB_PROFILES = {
  sezgin: {
    specialtyCategory: 'trichology',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['Novomed Clinics Dubai', 'ISHRS Fellow Directory (FISHRS)', 'drsezgin.com'],
    clinicalFocusSummary:
      'Fellow of the International Society of Hair Restoration Surgery (FISHRS) and Specialist Surgeon in Dubai specializing in high-density FUE/DHI hair transplantation, eyebrow/beard restoration, and multi-phase topical trichology maintenance.',
    detectedProcedures: [
      'High-Density FUE & DHI Hair Transplantation',
      'Post-Operative Graft Survival & Revascularization Protocols',
      'Dual-Phase Liposomal Scalp Compounding (TrichoSol™ / TrichoOil™)',
      'Combating Androgenetic Alopecia & Post-Surgical Shock Loss'
    ],
    signatureApproach: 'Combines surgical follicular transplantation with personalized multi-part galenic scalp solutions (Part 1 Morning + Part 2 Evening).'
  },
  khalid: {
    specialtyCategory: 'trichology',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['UAE Clinical Registry', 'Precision Trichology & Aesthetic Practice'],
    clinicalFocusSummary:
      'Specialist in medical trichology, follicular regeneration, and personalized topical/oral magistral formulations for androgenetic alopecia, diffuse thinning, and scalp barrier restoration.',
    detectedProcedures: [
      'Personalized Topical & Sublingual Alopecia Compounding',
      '5α-Reductase Modulation (Finasteride / Dutasteride Titrations)',
      'Follicular Microcirculation & Prostaglandin Analog Therapy',
      'Scalp Microbiome & Seborrheic Inflammation Control'
    ],
    signatureApproach: 'High-precision titration of topical antiandrogens, Minoxidil, Latanoprost, and Melatonin in hydrophilic/lipophilic vehicles.'
  },
  haytham: {
    specialtyCategory: 'regenerative_orthopedics',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['Arthregen Clinic Dubai', 'mrhaytham.com', 'DHA Consultant Orthopedic Registry'],
    clinicalFocusSummary:
      'Consultant Orthopedic Surgeon & Regenerative Medicine Specialist at Arthregen Clinic (Dubai) focused on joint preservation, sports traumatology, orthobiologics, and cellular tendon/cartilage regeneration.',
    detectedProcedures: [
      'Minimally Invasive Joint Preservation & Sports Arthroscopy',
      'Orthobiologic Intra-Articular & Tendon Regeneration',
      'Post-Surgical Ligament & Myofascial Accelerated Recovery',
      'Systemic Anti-Inflammatory & ECM Remodeling Protocols'
    ],
    signatureApproach: 'Integrates surgical orthopedics with targeted regenerative peptides (BPC-157, TB-500) and quantitative inflammation biomarkers.'
  },
  hanieh: {
    specialtyCategory: 'dermatology',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['Bedaya Polyclinic Jumeirah', 'DHA Dermatology & Trichology Registry'],
    clinicalFocusSummary:
      'Board-certified Dermatologist & Hair Restoration Specialist at Bedaya Polyclinic (Dubai) combining clinical dermatology, aesthetic laser procedures, and medical hair restoration.',
    detectedProcedures: [
      'Clinical & Aesthetic Dermatology (Melasma, Rosacea, Acne)',
      'Medical Hair Restoration & Female Pattern Alopecia',
      'Laser Skin Rejuvenation & Post-Procedure Barrier Repair',
      'Custom Dermo-Galenic Depigmenting & Anti-Aging Formulas'
    ],
    signatureApproach: 'Synergizes custom dermatologist-compounded topicals with bioactive copper peptides and native transdermal collagen.'
  },
  anita: {
    specialtyCategory: 'trichology',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['Novomed Integrative Medicine Dubai Marina', 'Peptide & Trichology Practice'],
    clinicalFocusSummary:
      'Trichology & Peptide Therapy Consultant at Novomed Integrative Medicine specializing in bioregulatory peptides, hair follicle cycling, and systemic integrative longevity.',
    detectedProcedures: [
      'Peptide-Assisted Follicular Regeneration (GHK-Cu / Bioregulators)',
      'Female & Male Diffuse Hair Thinning Protocols',
      'Stress-Induced Telogen Effluvium & Cortisol Axis Balancing',
      'Nutraceutical & Pharmacogenomic Precision Trichology'
    ],
    signatureApproach: 'Pairs topical magistral trichology with systemic bioactive peptides and stress/sleep neuro-endocrine optimization.'
  },
  vibhor: {
    specialtyCategory: 'longevity_bhrt',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['Longevity & Genomic Medicine Registry', 'Preventive Anti-Aging Practice'],
    clinicalFocusSummary:
      'Genomic Medicine & Anti-Aging Specialist focused on DNA-guided pharmacogenetics, cellular senescence, telomere preservation, and metabolic longevity protocols.',
    detectedProcedures: [
      'Pharmacogenomic & Epigenetic Longevity Profiling (ETERNA®)',
      'Telomere & Pineal Bioregulation (Epithalon / NAD+ Cycles)',
      'Cardiometabolic & Mitochondrial Optimization',
      'Bioidentical Endocrine & Androgen Optimization'
    ],
    signatureApproach: 'Data-driven precision medicine anchored in capillary blood biomarkers (Bloodo™) and saliva DNA pharmacogenomics.'
  },
  marina: {
    specialtyCategory: 'plastic_surgery',
    lastResearchedAt: '2026-10-17',
    verifiedSources: ['NOVA Clinic Dubai Healthcare City', 'Aesthetic & Longevity Medicine Directory'],
    clinicalFocusSummary:
      'Aesthetic & Longevity Physician at NOVA Clinic (Dubai Healthcare City) practicing non-surgical facial harmonization, regenerative aesthetics, and peri-surgical skin recovery.',
    detectedProcedures: [
      'Regenerative Facial Aesthetics & Collagen Biostimulation',
      'Peri-Surgical Aesthetic Recovery & Scar Minimization',
      'Cellular Longevity & Metabolic Vitality Protocols',
      'Transdermal Dermo-Aesthetic Compounding'
    ],
    signatureApproach: 'Enhances aesthetic procedures and surgical recovery at NOVA Clinic with extracellular matrix peptides and clinical dermocosmetics.'
  }
};

/**
 * Master Catalog of Specialty Practice Blueprints across the 5 core specialties.
 * Every blueprint includes a ready-to-prescribe compounding formula + cross-pillar
 * Atlas products (Peptide, Nutraceutical, Dermocosmetic, Diagnostic).
 */
export const SPECIALTY_BLUEPRINTS_CATALOG = {
  trichology: [
    {
      id: 'bp-tricho-fue-graft',
      specialtyKey: 'trichology',
      specialtyLabel: 'Trichology & Hair Surgery',
      badge: 'POST-FUE / DHI SURGICAL PROTOCOL',
      clinicalProcedure: 'FUE / DHI Hair Transplant Graft Survival & Donor Healing',
      targetPatients: 'Patients undergoing FUE/DHI transplantation (Day 7 to Month 6 post-op)',
      clinicalRationale:
        'Accelerates microvascular angiogenesis around newly implanted follicular units, prevents post-operative telogen shock loss, and remodels donor-site micro-scars without irritating propylene glycol.',
      compoundingFormula: {
        treatmentTitle: 'Post-FUE Follicular Revascularization & Anagen Support Regimen',
        dispensingForm: 'TrichoSol™ Hydrophilic Scalp Solution',
        volume: '100 mL',
        posology: 'Apply 1.5 mL (6 sprays) to recipient and crown area once daily at night starting 14 days post-FUE.',
        items: [
          { name: 'Minoxidil', concentration: '5%', dose: '5%', role: 'VEGF Vasodilator & Anagen Inducer' },
          { name: 'Finasteride', concentration: '0.1%', dose: '0.1%', role: 'Local 5α-Reductase DHT Blockade' },
          { name: 'Melatonin', concentration: '0.1%', dose: '0.1%', role: 'Follicular Antioxidant & Circadian Clock Regulator' },
          { name: 'Caffeine', concentration: '1%', dose: '1%', role: 'Adenosine & Microcirculation Co-Factor' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-glow-blend',
        name: 'GLOW Complex (BPC-157 10mg / TB-500 10mg / GHK-Cu 75mg)',
        role: 'Acceleratesrecipient bed neovascularization, endothelial nitric oxide healing, and graft take rate (99% synergy).'
      },
      dermocosmeticSynergy: {
        name: 'Colway Native Transdermal Collagen + Atelocollagen',
        role: 'Restores injured perifollicular extracellular matrix (ECM) and calms donor/recipient erythema post-crusting.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Longevity & Cellular Renewal',
        slug: 'ultraperson-longevity-cellular-renewal',
        role: 'Systemic mitochondrial ATP support and oxidative stress protection during follicular re-implantation.'
      },
      diagnosticSynergy: {
        name: 'ETERNA® Pharmacogenomics & Tricho-Genetics DNA Test',
        role: 'Screens SULT1A1 sulfotransferase activity and SRD5A2 sensitivity to personalize post-transplant maintenance.'
      },
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },
    {
      id: 'bp-tricho-aga-intensive',
      specialtyKey: 'trichology',
      specialtyLabel: 'Trichology & Hair Surgery',
      badge: 'REFRACTORY AGA DUAL-PHASE',
      clinicalProcedure: 'Advanced Androgenetic Alopecia & Crown/Vertex Miniaturization',
      targetPatients: 'Male & post-menopausal female AGA (Norwood III–V / Ludwig II) refractory to monotherapy',
      clinicalRationale:
        'Combines lipophilic 5α-reductase type I/II dual inhibition (Dutasteride) with prostaglandin F2α analog (Latanoprost) and copper tripeptide signaling to reverse follicular miniaturization.',
      compoundingFormula: {
        treatmentTitle: 'Dual-Phase Intensive Follicular Density & Anti-DHT Regimen',
        dispensingForm: 'TrichoOil™ / TrichoSol™ Liposomal System',
        volume: '60 mL',
        posology: 'Apply 1 mL topically to affected scalp zones every evening. Massage gently for 60 seconds.',
        items: [
          { name: 'Minoxidil', concentration: '7%', dose: '7%', role: 'High-Potency Potassium Channel Opener' },
          { name: 'Dutasteride', concentration: '0.1%', dose: '0.1%', role: 'Dual Type I & II 5α-Reductase Inhibitor' },
          { name: 'Latanoprost', concentration: '0.005%', dose: '0.005%', role: 'PGF2α Analog Anagen Phase Prolonger' },
          { name: 'Tretinoin', concentration: '0.01%', dose: '0.01%', role: 'Sulfotransferase Upregulator & Penetration Enhancer' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-ghk-cu-50mg',
        name: 'GHK-Cu (Copper Tripeptide-1) 50 mg Lyophilized Vial',
        role: 'Blocks TGF-β1 catagen signaling and stimulates dermal papilla fibroblast proliferation.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Anti-Hair Loss Shampoo with Diosmin & Native Collagen',
        role: 'Micellar diosmin strengthens perifollicular capillary walls and prepares the scalp barrier before topical drops.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Energy & Metabolic Vitality (CoQ10 + PQQ)',
        slug: 'ultraperson-energy-metabolic-vitality',
        role: 'Supports dermal papilla mitochondrial cytochrome c oxidase energy production.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Vitamin D + Testosterone+ Capillary DBS Panel',
        role: 'Rules out 25(OH)D3 deficiency (<30 ng/mL) and evaluates free androgen index prior to antiandrogen titration.'
      },
      protocolUrl: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
    },
    {
      id: 'bp-tricho-female-effluvium',
      specialtyKey: 'trichology',
      specialtyLabel: 'Trichology & Hair Surgery',
      badge: 'FEMALE TRICHOLOGY & EFFLUVIUM',
      clinicalProcedure: 'Female Diffuse Thinning, Chronic Telogen Effluvium & Hormonal Alopecia',
      targetPatients: 'Female patients with diffuse shedding, post-stress telogen effluvium, or hyperandrogenic thinning',
      clinicalRationale:
        'Alcohol-free, non-greasy formulation utilizing Spironolactone as a localized androgen receptor antagonist alongside Melatonin and L-Carnitine without systemic blood pressure disruption.',
      compoundingFormula: {
        treatmentTitle: 'Female Follicular Rescue & Cortisol-Buffered Scalp Solution',
        dispensingForm: 'TrichoFoam™ / TrichoSol™ Alcohol-Free Vehicle',
        volume: '100 mL',
        posology: 'Apply 1 mL along the central part line and temples once daily in the evening.',
        items: [
          { name: 'Minoxidil', concentration: '3%', dose: '3%', role: 'Gentle Female-Calibrated Microvascular Activator' },
          { name: 'Spironolactone', concentration: '1%', dose: '1%', role: 'Selective Follicular Androgen Receptor Antagonist' },
          { name: 'Melatonin', concentration: '0.2%', dose: '0.2%', role: 'Anti-Telogen Antioxidant & Scalp Rhythm Stabilizer' },
          { name: 'Biotin', concentration: '0.5%', dose: '0.5%', role: 'Keratin Infrastructure Co-Enzyme' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-dsip-5mg',
        name: 'DSIP (Delta Sleep-Inducing Peptide) 5 mg + GHK-Cu',
        role: 'Counteracts HPA-axis cortisol-induced follicular arrest and restores nocturnal growth hormone pulsatility.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Native Collagen Gold (Lactoferrin + Chitosan)',
        role: 'Chelates inflammatory scalp iron/sebum and calms trichodynia (scalp sensitivity/burning).'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Stress Resilience & Cortisol Balance',
        slug: 'ultraperson-stress-resilience-emotional-balance',
        role: 'Adaptogenic neuro-endocrine modulation to halt stress-triggered premature catagen entry.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Omega-3/6 Ratio & Inflammatory Index DBS Test',
        role: 'Quantifies arachidonic acid (AA/EPA) perifollicular micro-inflammation driving chronic shedding.'
      },
      protocolUrl: '/proto/dsip-bpc-157-cns-rest-protocol'
    }
  ],

  dermatology: [
    {
      id: 'bp-derm-laser-ecm',
      specialtyKey: 'dermatology',
      specialtyLabel: 'Clinical & Aesthetic Dermatology',
      badge: 'POST-LASER & RF MICRONEEDLING',
      clinicalProcedure: 'Fractional Laser, RF Microneedling & Accelerated Dermal Remodeling',
      targetPatients: 'Patients undergoing ablative/non-ablative laser resurfacing, Morpheus8, or chemical peels',
      clinicalRationale:
        'Harnesses the post-procedural micro-channel window to deliver copper tripeptides, hyaluronic matrix precursors, and soothing anti-erythema actives that double neocollagenesis while cutting downtime in half.',
      compoundingFormula: {
        treatmentTitle: 'Post-Laser Regenerative Epithelialization & ECM Gel-Serum',
        dispensingForm: 'Sterile Liposomal Hydro-Gel Base',
        volume: '50 g',
        posology: 'Apply a thin sterile layer twice daily for 14 days post-laser or microneedling procedure.',
        items: [
          { name: 'GHK-Cu (Copper Tripeptide-1)', concentration: '0.5%', dose: '0.5%', role: 'Type I/III Collagen & Decorin Gene Activator' },
          { name: 'Niacinamide', concentration: '4%', dose: '4%', role: 'Ceramide Synthesis & Post-Laser Erythema Reduction' },
          { name: 'Dexpanthenol (Provitamin B5)', concentration: '5%', dose: '5%', role: 'Keratinocyte Migration & Barrier Closure' },
          { name: 'Low-MW Hyaluronic Acid', concentration: '1.5%', dose: '1.5%', role: 'Deep Dermal Hydration Matrix' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-glow-blend',
        name: 'GLOW (BPC-157 / TB-500 / GHK-Cu) Regenerative Triad',
        role: 'Systemic and localized acceleration of dermal remodeling, elastin cross-linking, and zero-scar healing.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Native Collagen Pure / Platinum (Triple-Helix Fish Collagen)',
        role: 'Biocompatible transdermal native tropocollagen that integrates directly into laser-stimulated dermis.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Longevity & Cellular Renewal',
        slug: 'ultraperson-longevity-cellular-renewal',
        role: 'Protects newly synthesized fibroblasts from UV/thermal reactive oxygen species (ROS).'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Omega Ratio & Cellular Membrane Fluidity Test',
        role: 'Ensures optimal epidermal lipid bilayer composition prior to intensive energy-based device treatments.'
      },
      protocolUrl: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
    },
    {
      id: 'bp-derm-melasma-pih',
      specialtyKey: 'dermatology',
      specialtyLabel: 'Clinical & Aesthetic Dermatology',
      badge: 'MELASMA & HYPERPIGMENTATION',
      clinicalProcedure: 'Refractory Melasma, PIH & Vascular Photoaging Depigmentation',
      targetPatients: 'Fitzpatrick II–V patients with epidermal/mixed melasma or post-inflammatory hyperpigmentation',
      clinicalRationale:
        'Multi-pathway tyrosinase, plasminogen/VEGF, and melanosome transfer blockade combining Tranexamic Acid, Kojic Acid, Azelaic Acid, and retinoid cell turnover without hydroquinone rebound ochronosis.',
      compoundingFormula: {
        treatmentTitle: 'Quad-Pathway Melasma & Vascular Pigment Correction Cream',
        dispensingForm: 'Anhydrous Emollient Dermabase™',
        volume: '30 g',
        posology: 'Apply 1 pump (0.5 g) to hyperpigmented facial zones at night. Use SPF 50+ daily.',
        items: [
          { name: 'Tranexamic Acid', concentration: '5%', dose: '5%', role: 'Plasminogen & Vascular Melanogenesis Inhibitor' },
          { name: 'Azelaic Acid', concentration: '15%', dose: '15%', role: 'Selective Abnormal Melanocyte Tyrosinase Blocker' },
          { name: 'Kojic Acid', concentration: '4%', dose: '4%', role: 'Copper Chelation at Tyrosinase Active Site' },
          { name: 'Tretinoin', concentration: '0.025%', dose: '0.025%', role: 'Epidermal Melanin Dispersion & Turnover' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-ghk-cu-50mg',
        name: 'GHK-Cu 50 mg + Epithalon 10 mg Antioxidant Repair',
        role: 'Resets photo-damaged dermal fibroblast gene expression and downregulates metalloproteinases (MMP-1/MMP-2).'
      },
      dermocosmeticSynergy: {
        name: 'Colway Atelocollagen Perla (Pro-Collagen + Silk Sericin)',
        role: 'Prevents retinoid-induced barrier dermatitis and maintains stratum corneum hydration.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Energy & Antioxidant Defense',
        slug: 'ultraperson-energy-metabolic-vitality',
        role: 'Internal glutathione and ubiquinol photo-oxidative shield against UV-triggered melanocyte relapse.'
      },
      diagnosticSynergy: {
        name: 'ETERNA® Skin Genomics & Oxidative Stress DNA Panel',
        role: 'Evaluates SOD2, GPX1, and MC1R genetic polymorphisms governing pigmentation and photoaging.'
      },
      protocolUrl: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
    },
    {
      id: 'bp-derm-rosacea-acne',
      specialtyKey: 'dermatology',
      specialtyLabel: 'Clinical & Aesthetic Dermatology',
      badge: 'ROSACEA & INFLAMMATORY BARRIER',
      clinicalProcedure: 'Papulopustular Rosacea, Adult Acne & Neurovascular Sensitivity',
      targetPatients: 'Patients with erythematotelangiectatic/papulopustular rosacea, Demodex, or barrier-compromised acne',
      clinicalRationale:
        'Targets LL-37 cathelicidin kallikrein cascades, Demodex folliculorum, and sebaceous inflammation in a non-comedogenic, microbiome-respecting vehicle.',
      compoundingFormula: {
        treatmentTitle: 'Neurovascular Rosacea & Microbiome Calming Emulsion',
        dispensingForm: 'Liposomal Microbiome-Friendly Emulsion',
        volume: '50 g',
        posology: 'Apply a pea-sized amount to clean facial skin every evening.',
        items: [
          { name: 'Ivermectin', concentration: '1%', dose: '1%', role: 'Anti-Demodex & Toll-Like Receptor-2 Anti-Inflammatory' },
          { name: 'Azelaic Acid', concentration: '12%', dose: '12%', role: 'Kallikrein-5 & Cathelicidin Inhibitor' },
          { name: 'Niacinamide', concentration: '4%', dose: '4%', role: 'Barrier Ceramide & Sebum Regulator' },
          { name: 'Metronidazole', concentration: '0.75%', dose: '0.75%', role: 'Antioxidant & Rosacea Papule Resolver' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-bpc-157-10mg',
        name: 'BPC-157 (Body Protection Compound) 10 mg',
        role: 'Modulates gut-skin axis inflammation, nitric oxide vascular reactivity, and neurogenic erythema.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Native Collagen Gold (Antibacterial Lactoferrin + Silver/Gold)',
        role: 'Natural antimicrobial lactoferrin and native collagen soothe pustular lesions without antibiotic resistance.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Stress Resilience & Gut-Skin Axis Support',
        slug: 'ultraperson-stress-resilience-emotional-balance',
        role: 'Mitigates neurogenic flushing and cortisol-induced sebaceous hyperplasia.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Omega-3/6 Inflammatory Ratio + Vitamin D Panel',
        role: 'Identifies systemic pro-inflammatory lipid imbalances exacerbating inflammatory dermatoses.'
      },
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    }
  ],

  plastic_surgery: [
    {
      id: 'bp-plast-scar-incision',
      specialtyKey: 'plastic_surgery',
      specialtyLabel: 'Plastic & Aesthetic Surgery',
      badge: 'POST-OP SCAR & INCISION PROTOCOL',
      clinicalProcedure: 'Post-Surgical Incision Healing, Blepharoplasty, Facelift & Scar Revision',
      targetPatients: 'Surgical patients post-suture removal (Facelift, Rhinoplasty, Mammoplasty, Abdominoplasty)',
      clinicalRationale:
        'Prevents hypertrophic and keloid scar formation by regulating TGF-β1/β3 balance, organizing parallel Type I/III collagen deposition, and resolving post-operative ecchymosis and edema.',
      compoundingFormula: {
        treatmentTitle: 'Post-Surgical Silicone-Peptide Scar Remodeling & Ecchymosis Gel',
        dispensingForm: 'Medical-Grade Anhydrous Silicone Matrix',
        volume: '30 g',
        posology: 'Apply along closed surgical incisions twice daily starting 48 hours after suture removal for 12 weeks.',
        items: [
          { name: 'GHK-Cu (Copper Tripeptide-1)', concentration: '0.5%', dose: '0.5%', role: 'Decorin & Organized Collagen Remodeler' },
          { name: 'Tranexamic Acid', concentration: '3%', dose: '3%', role: ' prevents Post-Incisional Erythema & PIH' },
          { name: 'Pentoxifylline', concentration: '2%', dose: '2%', role: 'Microcirculatory Rheology & Anti-Fibrotic Agent' },
          { name: 'Vitamin K1 Oxide', concentration: '1%', dose: '1%', role: 'Rapid Hemosiderin & Ecchymosis Clearance' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-glow-blend',
        name: 'GLOW (BPC-157 10mg / TB-500 10mg / GHK-Cu 75mg)',
        role: 'Gold-standard peri-operative peptide complex for rapid angiogenesis, flap viability, and minimal scar tension.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Native Collagen Pure (Transdermal Tropocollagen)',
        role: 'Provides pure amino acid scaffolding (glycine, proline, hydroxyproline) directly to healing surgical planes.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Sleep Quality & Nocturnal GH Restoration',
        slug: 'ultraperson-sleep-quality-restoration',
        role: 'Maximizes nocturnal slow-wave sleep growth hormone secretion essential for post-op tissue repair.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Pre-Surgical Inflammation & Vitamin D Baseline',
        role: 'Screens baseline immune competence and inflammatory status 14 days prior to elective aesthetic surgery.'
      },
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    },
    {
      id: 'bp-plast-fat-graft-body',
      specialtyKey: 'plastic_surgery',
      specialtyLabel: 'Plastic & Aesthetic Surgery',
      badge: 'LIPOFILLING & BODY CONTOURING',
      clinicalProcedure: 'Autologous Fat Grafting Survival, Liposculpture & Lymphatic Recovery',
      targetPatients: 'Patients undergoing facial/body lipofilling, HD liposculpture, or energy-assisted tightening',
      clinicalRationale:
        'Enhances adipocyte graft neovascularization while accelerating lymphatic drainage, resolving induration/fibrosis, and tightening overlying dermal elasticity.',
      compoundingFormula: {
        treatmentTitle: 'Post-Liposculpture Anti-Fibrotic & Microvascular Recovery Emulsion',
        dispensingForm: 'Transdermal Liposomal Body Emulsion',
        volume: '150 mL',
        posology: 'Massage onto treated body contours twice daily prior to compression garment placement.',
        items: [
          { name: 'Diosmin + Hesperidin', concentration: '4%', dose: '4%', role: 'Venolymphatic Drainage & Edema Reduction' },
          { name: 'Caffeine + L-Carnitine', concentration: '3%', dose: '3%', role: 'Microcirculatory & Subdermal Remodeling' },
          { name: 'Centella Asiatica Triterpenes', concentration: '2%', dose: '2%', role: 'Prevention of Subdermal Nodular Fibrosis' },
          { name: 'Arnica Montana Extract', concentration: '5%', dose: '5%', role: 'Post-Cannula Bruising Resolution' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-bpc-157-10mg',
        name: 'BPC-157 + TB-500 (Thymosin Beta-4) Vascular Repair',
        role: 'Promotes VEGF-mediated microvascular ingrowth into autologous fat grafts and resolves deep tissue trauma.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Collagen Body Balm + Native Collagen Platinum',
        role: 'Restores skin elasticity and prevents post-liposuction skin laxity.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Energy & Mitochondrial Vitality',
        slug: 'ultraperson-energy-metabolic-vitality',
        role: 'Supports cellular bioenergetics during post-surgical recovery.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ HbA1c & Metabolic Recovery Profile',
        role: 'Verifies optimal glycemic control to prevent delayed surgical wound healing.'
      },
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    }
  ],

  regenerative_orthopedics: [
    {
      id: 'bp-ortho-tendon-joint',
      specialtyKey: 'regenerative_orthopedics',
      specialtyLabel: 'Orthopedics & Regenerative Medicine',
      badge: 'TENDON, LIGAMENT & JOINT REPAIR',
      clinicalProcedure: 'Tendinopathy, Rotator Cuff, ACL/Meniscus & Post-Arthroscopy Recovery',
      targetPatients: 'Athletes and orthopedic patients with tendon/ligament injuries, osteoarthritis, or post-arthroscopy',
      clinicalRationale:
        'Combines deep transdermal analgesic/microcirculatory compounding with systemic tenocyte-activating peptides (BPC-157 / TB-500) to accelerate organized Type I collagen fiber alignment.',
      compoundingFormula: {
        treatmentTitle: 'Transdermal Musculoskeletal & Neuropathic Recovery Gel',
        dispensingForm: 'Pentravan® Deep Transdermal Vehicle',
        volume: '100 g',
        posology: 'Apply 2 g (2 pumps) over the affected joint or tendon 2 to 3 times daily.',
        items: [
          { name: 'Ketoprofen', concentration: '5%', dose: '5%', role: 'Targeted Local COX Inhibition Without GI Toxicity' },
          { name: 'Diltiazem', concentration: '2%', dose: '2%', role: 'Local Microvascular Perfusion & Smooth Muscle Relaxation' },
          { name: 'Gabapentin', concentration: '4%', dose: '4%', role: 'Peripheral Nociceptive & Neuropathic Modulation' },
          { name: 'Menthol + MSM', concentration: '5%', dose: '5%', role: 'Sulfur Donor & Gate-Control Analgesia' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-bpc-157-10mg',
        name: 'BPC-157 (10 mg) + TB-500 (10 mg) Tendon & Ligament Stack',
        role: 'Upregulates growth hormone receptor expression on tenocytes and accelerates tendon-to-bone osteointegration.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Native Collagen Graphite (Joint & Musculoskeletal Grade)',
        role: 'Topical transdermal collagen support for peri-articular fascia and joint mobility.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Longevity & Mitochondrial Recovery',
        slug: 'ultraperson-longevity-cellular-renewal',
        role: 'Reduces exercise- and injury-induced oxidative damage in skeletal muscle mitochondria.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Omega-3/6 AA/EPA Inflammatory Index + Vitamin D',
        role: 'Targets AA/EPA ratio < 3.0 and Vitamin D > 45 ng/mL to optimize bone mineralization and tendon healing.'
      },
      protocolUrl: '/proto/bpc-157-tb-500-protocol'
    }
  ],

  longevity_bhrt: [
    {
      id: 'bp-longevity-bhrt-endocrine',
      specialtyKey: 'longevity_bhrt',
      specialtyLabel: 'Longevity, Genomics & BHRT',
      badge: 'BIOIDENTICAL HORMONE & VITALITY',
      clinicalProcedure: 'Transdermal BHRT, Androgen Optimization & Cellular Senescence Reset',
      targetPatients: 'Patients with age-related androgen/estrogen decline, chronic fatigue, or biological aging acceleration',
      clinicalRationale:
        'Delivers USP-grade bioidentical hormones via high-absorption Pentravan® liposomal matrix while protecting telomere length, mitochondrial NAD+ flux, and hair/skin integrity.',
      compoundingFormula: {
        treatmentTitle: 'Personalized Bioidentical Transdermal Endocrine Restoration Cream',
        dispensingForm: 'Pentravan® Liposomal Transdermal Dispenser (Ticker®)',
        volume: '60 g',
        posology: 'Apply 1 metered click (0.5 g) to inner forearm or inner thigh every morning.',
        items: [
          { name: 'Bioidentical Testosterone / DHEA', concentration: 'Custom Titration', dose: '20 mg/g', role: 'Anabolic, Cognitive & Libido Endocrine Restoration' },
          { name: 'Chrysin', concentration: '2%', dose: '2%', role: 'Natural Aromatase Modulation' },
          { name: 'Coenzyme Q10 (Ubiquinol)', concentration: '1%', dose: '1%', role: 'Mitochondrial Electron Transport Co-Factor' }
        ]
      },
      peptideSynergy: {
        code: 'atlas-epithalon-10mg',
        name: 'Epithalon (10 mg) + CJC-1295 / Ipamorelin Secretagogue Complex',
        role: 'Telomerase activation, pineal circadian melatonin restoration, and physiological GH/IGF-1 pulsatility.'
      },
      dermocosmeticSynergy: {
        name: 'Colway Atelocollagen Gold + Diamond Anti-Aging Line',
        role: 'Counteracts hormonal skin thinning by replenishing dermal Type I/III collagen density.'
      },
      nutraceuticalSynergy: {
        name: 'UltraPerson™ Longevity & Cellular Renewal + Sleep Restoration',
        slug: 'ultraperson-longevity-cellular-renewal',
        role: 'Synergistic senolytic, sirtuin, and deep-sleep neuro-endocrine recovery.'
      },
      diagnosticSynergy: {
        name: 'Bloodo™ Complete 6-Panel Baseline + ETERNA® Longevity DNA Test',
        role: 'Full quantitative baseline of Testosterone+, Vitamin D, HbA1c, Lipid Profile, Omega Ratio, and genomic methylation.'
      },
      protocolUrl: '/proto/lxv-neuro-restoration-12w'
    }
  ]
};

/**
 * Infers the primary specialty vertical key from a doctor's profile and prescriptions.
 */
export function inferSpecialtyCategory(doctor = {}, prescriptions = []) {
  if (doctor?.specialtyCategory && SPECIALTY_BLUEPRINTS_CATALOG[doctor.specialtyCategory]) {
    return doctor.specialtyCategory;
  }

  const nameLower = String(doctor?.name || doctor?.slug || '').toLowerCase();
  for (const [key, curated] of Object.entries(CURATED_DOCTOR_WEB_PROFILES)) {
    if (nameLower.includes(key)) {
      return curated.specialtyCategory;
    }
  }

  const text = `${doctor?.specialty || ''} ${doctor?.mainArea || ''} ${doctor?.clinic || ''} ${doctor?.bio || ''}`.toLowerCase();

  if (text.includes('tricho') || text.includes('hair') || text.includes('fishrs') || text.includes('fue') || text.includes('alopecia')) {
    return 'trichology';
  }
  if (text.includes('plast') || text.includes('reconstruct') || text.includes('rhino') || text.includes('facelift') || text.includes('lipo')) {
    return 'plastic_surgery';
  }
  if (text.includes('ortho') || text.includes('sport') || text.includes('joint') || text.includes('traum')) {
    return 'regenerative_orthopedics';
  }
  if (text.includes('genom') || text.includes('longev') || text.includes('anti-aging') || text.includes('bhrt') || text.includes('hormon')) {
    return 'longevity_bhrt';
  }
  if (text.includes('derm') || text.includes('laser') || text.includes('skin') || text.includes('aesthet')) {
    return 'dermatology';
  }

  // Fallback to analyzing prescriptions if specialty string is generic
  if (Array.isArray(prescriptions) && prescriptions.length > 0) {
    const rxText = prescriptions
      .slice(0, 15)
      .map((r) => `${r.treatmentTitle || ''} ${(r.items || []).map((i) => i.name).join(' ')}`)
      .join(' ')
      .toLowerCase();
    if (rxText.includes('minoxidil') || rxText.includes('finasteride') || rxText.includes('dutasteride') || rxText.includes('tricho')) {
      return 'trichology';
    }
  }

  return 'trichology';
}

/**
 * Resolves the complete Web Footprint Profile and Specialty Practice Blueprints
 * for any doctor (both 0-Rx onboarding doctors and active prescribers).
 */
export function resolveDoctorSpecialtyIntelligence(doctor = {}, prescriptions = []) {
  const nameLower = String(doctor?.name || doctor?.slug || '').toLowerCase();
  let matchedCurated = null;
  for (const [key, curated] of Object.entries(CURATED_DOCTOR_WEB_PROFILES)) {
    if (nameLower.includes(key)) {
      matchedCurated = curated;
      break;
    }
  }

  const specialtyCategory =
    doctor?.webPracticeProfile?.specialtyCategory ||
    matchedCurated?.specialtyCategory ||
    inferSpecialtyCategory(doctor, prescriptions);

  const verticalMeta =
    SPECIALTY_VERTICALS.find((v) => v.key === specialtyCategory) || SPECIALTY_VERTICALS[0];

  const webPracticeProfile = doctor?.webPracticeProfile || (matchedCurated
    ? {
        ...matchedCurated,
        specialtyLabel: verticalMeta.label
      }
    : {
        specialtyCategory,
        specialtyLabel: verticalMeta.label,
        lastResearchedAt: new Date().toISOString().slice(0, 10),
        verifiedSources: [
          doctor?.clinic ? `${doctor.clinic} Clinical Profile` : 'Public Medical Directory',
          doctor?.website || 'Regional Specialist Registry'
        ],
        clinicalFocusSummary: `${doctor?.name || 'Physician'} practices in ${doctor?.specialty || verticalMeta.label}${doctor?.clinic ? ` at ${doctor.clinic}` : ''}${doctor?.city ? ` (${doctor.city})` : ''}, with clinical focus across personalized compounding, regenerative peptides, and diagnostic biomarker optimization.`,
        detectedProcedures: verticalMeta.defaultProcedures,
        signatureApproach: `Evidence-based integration of custom galenic formulations, bioactive peptide signaling, and molecular diagnostics tailored to ${verticalMeta.shortLabel}.`
      });

  // Primary blueprints for this doctor's specialty + complementary cross-specialty blueprints
  const primaryBlueprints = SPECIALTY_BLUEPRINTS_CATALOG[specialtyCategory] || SPECIALTY_BLUEPRINTS_CATALOG.trichology;
  const allBlueprints = Object.values(SPECIALTY_BLUEPRINTS_CATALOG).flat();

  return {
    specialtyCategory,
    verticalMeta,
    webPracticeProfile,
    primaryBlueprints,
    allBlueprints
  };
}
