/**
 * Seed Script: Labesp Supplier, Canonical Dermpeels (6 Formulations) & Packaging
 * Matches Zoho Books Vendor VEN-3 (Brand Business Health S.L. org 721887857)
 */
import { adminDb } from '../lib/firebaseAdmin.js';

const SUPPLIER_ID = 'supplier-labesp';

const LABESP_SUPPLIER_DATA = {
  id: SUPPLIER_ID,
  name: 'Laboratorio Español de Investigación Cosmetológica, SLU',
  companyName: 'Laboratorio Español de Investigación Cosmetológica, SLU',
  displayName: 'Labesp Dermpeels & Packaging',
  commercialName: 'Labesp / OEM Spain',
  shortName: 'Labesp',
  code: 'LABESP',
  statusB2B: 'active',
  statusB2C: 'inactive',
  status: 'active',
  country: 'Spain',
  originCountry: 'Spain',
  city: 'Alcoy (Alicante)',
  address: 'Calle El Cami, Alcoy, Alicante, Spain',
  type: 'Contract Manufacturer / OEM Peels & Packaging',
  category: 'dermatology_cosmeceuticals',
  productCategories: [
    'Dermatology & Cosmeceuticals',
    'Chemical Peels',
    'Pharmaceutical Packaging'
  ],
  website: 'https://www.labesp.com',
  email: 'info@labesp.com',
  phone: '+34 966 526 395',
  contactPerson: {
    name: 'Mauricio Sanchis',
    role: 'CEO',
    email: 'ceo@labesp.com',
    phone: '+34 966 526 395'
  },
  contacts: [
    { name: 'Mauricio Sanchis', role: 'CEO', email: 'ceo@labesp.com' },
    { name: 'Marisa', role: 'OEM Private Label & Quotations', email: 'info@labesp.com' }
  ],
  zohoOrg: 'Brand Business Health S.L. (721887857)',
  zohoOrgId: '721887857',
  zohoVendorNumber: 'VEN-3',
  zohoVendorNumber_EUR: 'VEN-3',
  zohoContactId: '2337828000002722913',
  zohoContactId_EUR: '2337828000002722913',
  zohoCustomerNumber: 'CUS-1239',
  zohoCustomerId: '2337828000002716547',
  currency: 'EUR',
  defaultCurrency: 'EUR',
  paymentTerms: 'Pagadero a la recepción / Standard OEM Terms',
  standards: [
    'ISO 22716:2007 (Cosmetics GMP)',
    'EU Cosmetic Regulation (EC) No 1223/2009',
    '100% Vegan & Natural Origin Formulations'
  ],
  catalogLinks: {
    dermpeelsPdf: 'https://labesp.com/wp-content/uploads/2026/11/LABESP-DERMPEELS.pdf',
    packagingPdf: 'https://labesp.com/wp-content/uploads/2024/04/Cat-Packaging-2024.pdf',
    oemChoiceLineUrl: 'https://labesp.com/cat-choice-line/'
  },
  notes: 'Spanish OEM/ODM manufacturer of professional chemical peels (Dermpeels line) and in-stock pharmaceutical primary packaging (Airless, Droppers, Vials, Jars). Master record in Zoho Books VEN-3.',
  updatedAt: new Date().toISOString()
};

const DERMPEEL_PRODUCTS = [
  {
    id: 'labesp-peel-cellular-renewal-15',
    slug: 'dermpeels-cellular-renewal-15',
    canonicalKey: 'peel-cellular-renewal-15',
    name: 'Dermpeels Multi-Depth Cellular Renewal Peel 15% AHA',
    canonicalName: 'Cellular Renewal Chemical Peel (15% Glycolic + Mandelic)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    supplierIds: [SUPPLIER_ID],
    categoryId: 'dermatology_cosmeceuticals',
    category: 'dermatology_cosmeceuticals',
    type: 'chemical_peel',
    status: 'active',
    classification: 'Superficial-to-Medium Multi-Depth Epidermal Resurfacing',
    totalAcidsPercent: 15.0,
    totalActivesPercent: 15.0,
    phRange: '2.8 - 3.2',
    naturalOrigin: true,
    isVegan: true,
    hsCode: '3304.99.00',
    customsMnemonic: 'DERM-REN-15',
    description: 'Professional chemical peel combining low molecular weight Glycolic Acid (10%) for deep cellular turnover with high molecular weight Mandelic Acid (5%) for uniform superficial exfoliation and antibacterial action. Accelerates skin renewal, refines pores, and restores radiance.',
    actives: [
      { name: 'Glycolic Acid', percentage: 10, unit: '%', role: 'Low MW (76 Da) AHA for deep epidermal turnover and dermal-epidermal junction stimulation' },
      { name: 'Mandelic Acid', percentage: 5, unit: '%', role: 'High MW (152 Da) lipophilic AHA with gentle keratolysis and natural antibacterial activity' }
    ],
    fullInci: 'Aqua, Glycolic Acid, Glycerin, Mandelic Acid, Polysorbate-20, Propylene Glycol, Linoleic Acid, Linolenic Acid, Phenoxyethanol, Ethylhexylglycerin.',
    indications: [
      'Asphyxiated and dull skin complexion',
      'Enlarged follicular pores',
      'Uneven epidermal texture',
      'Early photoaging and fine surface rhytids',
      'Accelerated keratinocyte turnover'
    ],
    protocol: {
      exposureTime: '3-8 minutes (depending on patient tolerance and erythema end-point)',
      recommendedSessions: '4 to 6 sessions every 14-21 days',
      neutralizerRequired: true,
      neutralizer: 'Aqueous Sodium Bicarbonate buffer solution',
      postCare: 'Strict broad-spectrum photoprotection (SPF 50+) and barrier repair balm'
    },
    packagingOptions: [
      { type: 'Dropper Bottle', material: 'Amber Glass', capacity: '50 mL', role: 'Clinical Backbar' },
      { type: 'Dropper Bottle', material: 'Amber Glass', capacity: '30 mL', role: 'Supervised Patient Home Regimen' }
    ],
    variants: [
      {
        id: 'labesp-peel-cellular-renewal-50ml',
        dosage: '15% AHA (Glycolic 10% + Mandelic 5%)',
        dose: '15% AHA',
        presentation: 'bottle',
        presentationName: '50 mL Amber Dropper Bottle',
        fill_volume: '50 mL',
        costPrice: 8.12,
        currency: 'EUR',
        price_aed: 135,
        patientPrice_aed: 270,
        patientPrice: 270,
        status: 'active',
        inStock: true
      },
      {
        id: 'labesp-peel-cellular-renewal-30ml',
        dosage: '15% AHA (Glycolic 10% + Mandelic 5%)',
        dose: '15% AHA',
        presentation: 'bottle',
        presentationName: '30 mL Amber Dropper Bottle',
        fill_volume: '30 mL',
        costPrice: 19.50,
        currency: 'EUR',
        price_aed: 95,
        patientPrice_aed: 190,
        patientPrice: 190,
        status: 'active',
        inStock: true
      }
    ]
  },
  {
    id: 'labesp-peel-depigmenting-25-7',
    slug: 'dermpeels-advanced-depigmenting-25-7',
    canonicalKey: 'peel-depigmenting-25-7',
    name: 'Dermpeels Advanced Multi-Action Depigmenting Peel 25.7%',
    canonicalName: 'Depigmenting Chemical Peel (Malic 10% + Tranexamic 5% + Glycolic 5% + Phytic 5% + Arbutin 2% + Kojic 0.7%)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    supplierIds: [SUPPLIER_ID],
    categoryId: 'dermatology_cosmeceuticals',
    category: 'dermatology_cosmeceuticals',
    type: 'chemical_peel',
    status: 'active',
    classification: 'Multi-Pathway Melano-Regulatory & Vascular Dyschromia Resurfacing',
    totalAcidsPercent: 25.0,
    totalActivesPercent: 25.7,
    phRange: '2.5 - 3.0',
    naturalOrigin: true,
    isVegan: true,
    hsCode: '3304.99.00',
    customsMnemonic: 'DERM-DEP-25',
    description: 'High-potency multi-target depigmenting chemical peel with 25.7% total active load. Combines Tranexamic Acid (5%) and Arbutin (2%) to suppress melanin synthesis and transfer, Malic and Glycolic AHAs (15%) for rapid elimination of pigmented cells, and Kojic Acid (0.7%) to block the tyrosinase enzyme cascade.',
    actives: [
      { name: 'Malic Acid', percentage: 10, unit: '%', role: 'Dicarboxylic AHA for corneocyte desquamation' },
      { name: 'Tranexamic Acid', percentage: 5, unit: '%', role: 'Inhibits plasmin/plasminogen pathway, suppressing melanocyte-VEGF hyperactivity' },
      { name: 'Glycolic Acid', percentage: 5, unit: '%', role: 'Accelerates melanin-laden corneocyte desquamation' },
      { name: 'Phytic Acid', percentage: 5, unit: '%', role: 'Copper chelator and potent antioxidant preventing lipid peroxidation' },
      { name: 'Arbutin', percentage: 2, unit: '%', role: 'Competitive reversible inhibitor of melanosomal tyrosinase' },
      { name: 'Kojic Acid', percentage: 0.7, unit: '%', role: 'Direct copper chelator at the active site of tyrosinase' }
    ],
    fullInci: 'Aqua, Alcohol Denat., Malic Acid, Glycerin, Glycolic Acid, Tranexamic Acid, Phytic Acid, Polysorbate-20, Arbutin, Propylene Glycol, Linoleic Acid, Linolenic Acid, Kojic Acid, Phenoxyethanol, Ethylhexylglycerin.',
    indications: [
      'Epidermal and mixed melasma',
      'Solar lentigines and age spots',
      'Post-inflammatory hyperpigmentation (PIH)',
      'Recalcitrant facial and body dyschromia',
      'Uneven photoaged complexion'
    ],
    protocol: {
      exposureTime: '3-6 minutes per layer (up to 2 layers based on phototype)',
      recommendedSessions: '4 to 6 sessions every 21 days',
      neutralizerRequired: true,
      neutralizer: 'Aqueous Sodium Bicarbonate buffer solution',
      postCare: 'Mandatory daily application of broad-spectrum SPF 50+ and topical tranexamic/niacinamide serum'
    },
    packagingOptions: [
      { type: 'Dropper Bottle', material: 'Amber Glass (UV Shield)', capacity: '50 mL', role: 'Clinical Backbar' },
      { type: 'Dropper Bottle', material: 'Amber Glass (UV Shield)', capacity: '30 mL', role: 'Supervised Patient Home Regimen' }
    ],
    variants: [
      {
        id: 'labesp-peel-depigmenting-50ml',
        dosage: '25.7% Actives (Malic 10% + Tranexamic 5% + Glycolic 5% + Phytic 5% + Arbutin 2% + Kojic 0.7%)',
        dose: '25.7% Actives',
        presentation: 'bottle',
        presentationName: '50 mL Amber UV-Dropper Bottle',
        fill_volume: '50 mL',
        costPrice: 12.60,
        currency: 'EUR',
        price_aed: 170,
        patientPrice_aed: 340,
        patientPrice: 340,
        status: 'active',
        inStock: true
      },
      {
        id: 'labesp-peel-depigmenting-30ml',
        dosage: '25.7% Actives (Malic 10% + Tranexamic 5% + Glycolic 5% + Phytic 5% + Arbutin 2% + Kojic 0.7%)',
        dose: '25.7% Actives',
        presentation: 'bottle',
        presentationName: '30 mL Amber UV-Dropper Bottle',
        fill_volume: '30 mL',
        costPrice: 24.50,
        currency: 'EUR',
        price_aed: 120,
        patientPrice_aed: 240,
        patientPrice: 240,
        status: 'active',
        inStock: true
      }
    ]
  },
  {
    id: 'labesp-peel-hydra-barrier-16-5',
    slug: 'dermpeels-hydra-barrier-comfort-16-5',
    canonicalKey: 'peel-hydra-barrier-16-5',
    name: 'Dermpeels Hydra-Barrier Comfort Peel 16.5%',
    canonicalName: 'Hydrating Comfort Peel (Lactic 15% + Hyaluronic Acid 1.5%)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    supplierIds: [SUPPLIER_ID],
    categoryId: 'dermatology_cosmeceuticals',
    category: 'dermatology_cosmeceuticals',
    type: 'chemical_peel',
    status: 'active',
    classification: 'Non-Disruptive Moisture-Enhancing Keratolytic Peel',
    totalAcidsPercent: 15.0,
    totalActivesPercent: 16.5,
    phRange: '3.0 - 3.4',
    naturalOrigin: true,
    isVegan: true,
    hsCode: '3304.99.00',
    customsMnemonic: 'DERM-HYD-16',
    description: 'High-tolerance exfoliating treatment formulated with 15% Lactic Acid and 1.5% Hyaluronic Acid. Gently dissolves corneocyte bonds while preserving cutaneous barrier function and stimulating Natural Moisturizing Factors (NMF). Plumps, deeply hydrates, and delivers immediate elasticity and suppleness.',
    actives: [
      { name: 'Lactic Acid', percentage: 15, unit: '%', role: 'Humectant AHA promoting gentle desquamation and epidermal ceramide synthesis' },
      { name: 'Hyaluronic Acid', percentage: 1.5, unit: '%', role: 'High-affinity water-retention polymer reducing TEWL' }
    ],
    fullInci: 'Aqua, Lactic Acid, Glycerin, Polysorbate-20, Hyaluronic Acid, Linoleic Acid, Linolenic Acid, Propylene Glycol, Phenoxyethanol, Ethylhexylglycerin.',
    indications: [
      'Dehydrated, xerotic, or flaky skin',
      'Compromised stratum corneum barrier',
      'Introductory peel for patients with lower chemical peel tolerance',
      'Immediate smoothing for event-ready skin'
    ],
    protocol: {
      exposureTime: '5-10 minutes',
      recommendedSessions: '4 to 6 sessions every 14 days',
      neutralizerRequired: true,
      neutralizer: 'Rinse with cool water or mild neutralizer',
      postCare: 'Daily lipid barrier moisturizing cream and broad-spectrum SPF 50+'
    },
    packagingOptions: [
      { type: 'Dropper Bottle', material: 'Amber Glass', capacity: '50 mL', role: 'Clinical Backbar' },
      { type: 'Airless Dispenser', material: 'PP (Airless01_Ed)', capacity: '30 mL', role: 'Patient Home-Care' }
    ],
    variants: [
      {
        id: 'labesp-peel-hydra-50ml',
        dosage: '16.5% Actives (Lactic 15% + HA 1.5%)',
        dose: '16.5% Actives',
        presentation: 'bottle',
        presentationName: '50 mL Amber Dropper Bottle',
        fill_volume: '50 mL',
        costPrice: 8.50,
        currency: 'EUR',
        price_aed: 125,
        patientPrice_aed: 250,
        patientPrice: 250,
        status: 'active',
        inStock: true
      },
      {
        id: 'labesp-peel-hydra-30ml',
        dosage: '16.5% Actives (Lactic 15% + HA 1.5%)',
        dose: '16.5% Actives',
        presentation: 'bottle',
        presentationName: '30 mL Amber Dropper Bottle',
        fill_volume: '30 mL',
        costPrice: 18.00,
        currency: 'EUR',
        price_aed: 90,
        patientPrice_aed: 180,
        patientPrice: 180,
        status: 'active',
        inStock: true
      }
    ]
  },
  {
    id: 'labesp-peel-anti-wrinkle-25-5',
    slug: 'dermpeels-anti-wrinkle-photo-defense-25-5',
    canonicalKey: 'peel-anti-wrinkle-25-5',
    name: 'Dermpeels Advanced Anti-Wrinkle & Photo-Defense Peel 25.5%',
    canonicalName: 'Anti-Wrinkle & Photoaging Peel (Glycolic 10% + Phytic 10% + Citric 3% + Ferulic 1% + HA 1.5%)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    supplierIds: [SUPPLIER_ID],
    categoryId: 'dermatology_cosmeceuticals',
    category: 'dermatology_cosmeceuticals',
    type: 'chemical_peel',
    status: 'active',
    classification: 'Intensive Dermal Density & Antioxidant Resurfacing',
    totalAcidsPercent: 24.0,
    totalActivesPercent: 25.5,
    phRange: '2.6 - 3.1',
    naturalOrigin: true,
    isVegan: true,
    hsCode: '3304.99.00',
    customsMnemonic: 'DERM-WRN-25',
    description: 'High-concentration anti-aging peel (24% acids + 1.5% Hyaluronic Acid) engineered to combat moderate-to-severe photoaging. Glycolic Acid (10%) drives deep cellular turnover, while Phytic (10%) and Citric (3%) acids impart luminosity. Ferulic Acid (1%) provides formidable antioxidant protection, stabilized with Hyaluronic Acid (1.5%) for cutaneous elasticity and firmness.',
    actives: [
      { name: 'Glycolic Acid', percentage: 10, unit: '%', role: 'Dermal remodeling and collagen synthesis stimulation' },
      { name: 'Phytic Acid', percentage: 10, unit: '%', role: 'Antioxidant and heavy-metal chelation preventing elastosis' },
      { name: 'Citric Acid', percentage: 3, unit: '%', role: 'Improves cellular respiration and radiance' },
      { name: 'Ferulic Acid', percentage: 1, unit: '%', role: 'Potent phenolic free-radical scavenger stabilizing the acid matrix' },
      { name: 'Hyaluronic Acid', percentage: 1.5, unit: '%', role: 'Plumps fine rhytids and provides intensive dermal hydration' }
    ],
    fullInci: 'Aqua, Alcohol Denat., Glycolic Acid, Phytic Acid, Glycerin, Polysorbate-20, Citric Acid, Hyaluronic Acid, Ferulic Acid, Propylene Glycol, Linoleic Acid, Linolenic Acid, Phenoxyethanol, Ethylhexylglycerin.',
    indications: [
      'Moderate to advanced photoaging and solar elastosis',
      'Fine expression lines and superficial wrinkles',
      'Loss of skin density, firmness, and tone',
      'Leathery or thickened photoaged epidermis'
    ],
    protocol: {
      exposureTime: '3-7 minutes',
      recommendedSessions: '4 to 6 sessions every 21 days',
      neutralizerRequired: true,
      neutralizer: 'Aqueous Sodium Bicarbonate buffer solution',
      postCare: 'Strict broad-spectrum photoprotection (SPF 50+) and peptide/growth factor recovery serums'
    },
    packagingOptions: [
      { type: 'Dropper Bottle', material: 'Amber Glass (UV Protective)', capacity: '50 mL', role: 'Clinical Backbar' },
      { type: 'Dropper Bottle', material: 'Amber Glass (UV Protective)', capacity: '30 mL', role: 'Patient Home Regimen' }
    ],
    variants: [
      {
        id: 'labesp-peel-anti-wrinkle-50ml',
        dosage: '25.5% Actives (Glycolic 10% + Phytic 10% + Citric 3% + Ferulic 1% + HA 1.5%)',
        dose: '25.5% Actives',
        presentation: 'bottle',
        presentationName: '50 mL Amber UV-Dropper Bottle',
        fill_volume: '50 mL',
        costPrice: 11.02,
        currency: 'EUR',
        price_aed: 160,
        patientPrice_aed: 320,
        patientPrice: 320,
        status: 'active',
        inStock: true
      },
      {
        id: 'labesp-peel-anti-wrinkle-30ml',
        dosage: '25.5% Actives (Glycolic 10% + Phytic 10% + Citric 3% + Ferulic 1% + HA 1.5%)',
        dose: '25.5% Actives',
        presentation: 'bottle',
        presentationName: '30 mL Amber UV-Dropper Bottle',
        fill_volume: '30 mL',
        costPrice: 23.00,
        currency: 'EUR',
        price_aed: 110,
        patientPrice_aed: 220,
        patientPrice: 220,
        status: 'active',
        inStock: true
      }
    ]
  },
  {
    id: 'labesp-peel-anti-acne-17',
    slug: 'dermpeels-clarifying-anti-acne-17',
    canonicalKey: 'peel-anti-acne-17',
    name: 'Dermpeels Clarifying Anti-Acne & Sebum Control Peel 17%',
    canonicalName: 'Clarifying Anti-Acne Peel (Lactic 10% + Azelaic 5% + Salicylic BHA 2%)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    supplierIds: [SUPPLIER_ID],
    categoryId: 'dermatology_cosmeceuticals',
    category: 'dermatology_cosmeceuticals',
    type: 'chemical_peel',
    status: 'active',
    classification: 'Folliculotropic Comedolytic & Anti-Inflammatory Peel',
    totalAcidsPercent: 17.0,
    totalActivesPercent: 17.0,
    phRange: '2.7 - 3.2',
    naturalOrigin: true,
    isVegan: true,
    hsCode: '3304.99.00',
    customsMnemonic: 'DERM-ACN-17',
    description: 'Targeted comedolytic and anti-inflammatory chemical peel formulated with 17% active ingredients. Combines lipophilic Salicylic Acid (2% BHA) for follicular sebum liquefaction, Azelaic Acid (5%) for antimicrobial activity against Cutibacterium acnes, and Lactic Acid (10%) for superficial desquamation. Visibly clears active breakouts, blackheads, and dilated pores.',
    actives: [
      { name: 'Lactic Acid', percentage: 10, unit: '%', role: 'Superficial desquamation and post-inflammatory hydration' },
      { name: 'Azelaic Acid', percentage: 5, unit: '%', role: 'Antibacterial, anti-inflammatory, and reduces post-inflammatory erythema' },
      { name: 'Salicylic Acid', percentage: 2, unit: '%', role: 'Lipophilic BHA penetrating the sebaceous gland to dissolve microcomedones' }
    ],
    fullInci: 'Alcohol Denat., Aqua, Lactic Acid, Glycerin, Azelaic Acid, Polysorbate-20, Salicylic Acid, Propylene Glycol, Linoleic Acid, Linolenic Acid, Phenoxyethanol, Ethylhexylglycerin.',
    indications: [
      'Active acne vulgaris (Grades I-III)',
      'Open and closed microcomedones',
      'Excessive cutaneous seborrhea',
      'Congested and dilated pores',
      'Post-acne red marks and blemishes'
    ],
    protocol: {
      exposureTime: '2-5 minutes (frosting check for BHA)',
      recommendedSessions: '4 to 6 sessions every 14 days',
      neutralizerRequired: true,
      neutralizer: 'Aqueous Sodium Bicarbonate buffer solution or copious cold water',
      postCare: 'Oil-free non-comedogenic hydration and daily mineral SPF 50+'
    },
    packagingOptions: [
      { type: 'Dropper Bottle', material: 'Amber Glass', capacity: '50 mL', role: 'Clinical Backbar' },
      { type: 'Dropper Bottle', material: 'Amber Glass', capacity: '30 mL', role: 'Patient Home Regimen' }
    ],
    variants: [
      {
        id: 'labesp-peel-anti-acne-50ml',
        dosage: '17% Actives (Lactic 10% + Azelaic 5% + Salicylic 2% BHA)',
        dose: '17% Actives',
        presentation: 'bottle',
        presentationName: '50 mL Amber Dropper Bottle',
        fill_volume: '50 mL',
        costPrice: 7.00,
        currency: 'EUR',
        price_aed: 130,
        patientPrice_aed: 260,
        patientPrice: 260,
        status: 'active',
        inStock: true
      },
      {
        id: 'labesp-peel-anti-acne-30ml',
        dosage: '17% Actives (Lactic 10% + Azelaic 5% + Salicylic 2% BHA)',
        dose: '17% Actives',
        presentation: 'bottle',
        presentationName: '30 mL Amber Dropper Bottle',
        fill_volume: '30 mL',
        costPrice: 19.00,
        currency: 'EUR',
        price_aed: 95,
        patientPrice_aed: 190,
        patientPrice: 190,
        status: 'active',
        inStock: true
      }
    ]
  },
  {
    id: 'labesp-peel-sensitive-skin-15',
    slug: 'dermpeels-sensitive-skin-tolerance-15',
    canonicalKey: 'peel-sensitive-skin-15',
    name: 'Dermpeels Sensitive Skin & Post-Blemish Tolerance Peel 15%',
    canonicalName: 'Sensitive Skin & Post-Blemish Tolerance Peel (Mandelic 5% + Azelaic 5% + Citric 5%)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    supplierIds: [SUPPLIER_ID],
    categoryId: 'dermatology_cosmeceuticals',
    category: 'dermatology_cosmeceuticals',
    type: 'chemical_peel',
    status: 'active',
    classification: 'Ultra-Gentle Barrier-Protective Desensitizing Peel',
    totalAcidsPercent: 15.0,
    totalActivesPercent: 15.0,
    phRange: '3.0 - 3.5',
    naturalOrigin: true,
    isVegan: true,
    hsCode: '3304.99.00',
    customsMnemonic: 'DERM-SNS-15',
    description: 'Hypoallergenic peeling formula developed specifically for reactive, rosacea-prone, or sensitized skin. Balanced with 15% high-tolerance acids: Mandelic Acid (5%) provides gentle non-irritating exfoliation, Azelaic Acid (5%) suppresses neurogenic erythema and inflammation, and Citric Acid (5%) infuses antioxidant protection.',
    actives: [
      { name: 'Mandelic Acid', percentage: 5, unit: '%', role: 'High molecular weight AHA ensuring zero stinging and surface renewal' },
      { name: 'Azelaic Acid', percentage: 5, unit: '%', role: 'Soothes reactive erythema, calms rosacea flare-ups, and evens post-blemish marks' },
      { name: 'Citric Acid', percentage: 5, unit: '%', role: 'Mild antioxidant brightening without compromising barrier lipids' }
    ],
    fullInci: 'Aqua, Alcohol Denat., Glycerin, Azelaic Acid, Mandelic Acid, Citric Acid, Polysorbate-20, Propylene Glycol, Linoleic Acid, Linolenic Acid, Phenoxyethanol, Ethylhexylglycerin.',
    indications: [
      'Reactive, intolerant, or easily flushed skin',
      'Vascular redness and rosacea-prone skin',
      'Post-inflammatory erythema (PIE) red marks',
      'Sensitized epidermal barrier with rough texture'
    ],
    protocol: {
      exposureTime: '4-8 minutes',
      recommendedSessions: '4 to 6 sessions every 14-21 days',
      neutralizerRequired: true,
      neutralizer: 'Rinse with cold water or gentle soothing neutralizer',
      postCare: 'Ceramide-rich soothing recovery balm and broad-spectrum physical SPF 50+'
    },
    packagingOptions: [
      { type: 'Dropper Bottle', material: 'Amber Glass', capacity: '50 mL', role: 'Clinical Backbar' },
      { type: 'Airless Dispenser', material: 'PP (Airless05_La)', capacity: '30 mL', role: 'Patient Home Regimen' }
    ],
    variants: [
      {
        id: 'labesp-peel-sensitive-50ml',
        dosage: '15% Actives (Mandelic 5% + Azelaic 5% + Citric 5%)',
        dose: '15% Actives',
        presentation: 'bottle',
        presentationName: '50 mL Amber Dropper Bottle',
        fill_volume: '50 mL',
        costPrice: 8.56,
        currency: 'EUR',
        price_aed: 130,
        patientPrice_aed: 260,
        patientPrice: 260,
        status: 'active',
        inStock: true
      },
      {
        id: 'labesp-peel-sensitive-30ml',
        dosage: '15% Actives (Mandelic 5% + Azelaic 5% + Citric 5%)',
        dose: '15% Actives',
        presentation: 'bottle',
        presentationName: '30 mL Amber Dropper Bottle',
        fill_volume: '30 mL',
        costPrice: 19.50,
        currency: 'EUR',
        price_aed: 95,
        patientPrice_aed: 190,
        patientPrice: 190,
        status: 'active',
        inStock: true
      }
    ]
  }
];

const PACKAGING_CATALOG_ITEMS = [
  {
    id: 'pack-labesp-airless-01-ed',
    sku: 'Airless01_Ed',
    name: 'Airless Dispenser 01 Ed',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    category: 'packaging_airless',
    bottleMaterial: 'PP',
    pumpMaterial: 'PP',
    capMaterial: 'PP or SAN',
    options: [
      { capacity: '15ml', priceEur: 1.89 },
      { capacity: '30ml', priceEur: 2.18 },
      { capacity: '50ml', priceEur: 2.42 }
    ],
    bestFor: 'Post-peel soothing creams, barrier repair balms, and BHRT transdermal emulsions.'
  },
  {
    id: 'pack-labesp-airless-02-xa',
    sku: 'Airless02_Xa',
    name: 'Airless Dispenser 02 Xa (Aluminum Shell)',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    category: 'packaging_airless',
    bottleMaterial: 'Plastic + Aluminum',
    pumpMaterial: 'PP',
    capMaterial: 'Aluminum',
    options: [
      { capacity: '15ml', priceEur: 2.21 },
      { capacity: '30ml', priceEur: 2.36 },
      { capacity: '50ml', priceEur: 2.79 }
    ],
    bestFor: 'Premium clinical anti-aging serums and dermatological compounds.'
  },
  {
    id: 'pack-labesp-airless-04-ga',
    sku: 'Airless04_Ga',
    name: 'Airless Large Volume Pump 04 Ga',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    category: 'packaging_airless',
    bottleMaterial: 'HDPE',
    pumpMaterial: 'PE',
    capMaterial: 'PP',
    options: [
      { capacity: '50ml', priceEur: 1.37 },
      { capacity: '100ml', priceEur: 1.51 },
      { capacity: '200ml', priceEur: 2.22 }
    ],
    bestFor: 'Backbar pre-peel degreasing cleansers and post-peel neutralizing solutions.'
  },
  {
    id: 'pack-labesp-amber-dropper',
    sku: 'Dropper_Amber_Glass',
    name: 'Amber Glass Chemical Peel Dropper Bottle with Graduated Pipette',
    supplierId: SUPPLIER_ID,
    supplierName: 'Labesp',
    category: 'packaging_droppers',
    bottleMaterial: 'Type III Amber Glass',
    pumpMaterial: 'Rubber Bulb + Glass Pipette',
    capMaterial: 'PP Tamper-Evident',
    options: [
      { capacity: '30ml', priceEur: 1.25 },
      { capacity: '50ml', priceEur: 1.45 }
    ],
    bestFor: 'Professional chemical peels (protects light-sensitive Kojic, Ferulic, and Tranexamic acids).'
  }
];

async function seed() {
  console.log('Seeding Labesp Supplier into Firestore...');
  await adminDb.collection('suppliers').doc(SUPPLIER_ID).set(LABESP_SUPPLIER_DATA, { merge: true });
  console.log(`[✓] Supplier ${SUPPLIER_ID} created / updated.`);

  console.log('Seeding 6 Canonical Dermpeel Products...');
  for (const prod of DERMPEEL_PRODUCTS) {
    prod.createdAt = new Date().toISOString();
    prod.updatedAt = new Date().toISOString();
    await adminDb.collection('products').doc(prod.id).set(prod, { merge: true });
    console.log(`[✓] Product seeded: ${prod.id} (${prod.name})`);
  }

  console.log('Seeding Labesp In-Stock Primary Packaging Catalog...');
  for (const pack of PACKAGING_CATALOG_ITEMS) {
    pack.createdAt = new Date().toISOString();
    pack.updatedAt = new Date().toISOString();
    await adminDb.collection('packaging_catalog').doc(pack.id).set(pack, { merge: true });
    console.log(`[✓] Packaging item seeded: ${pack.id} (${pack.name})`);
  }

  console.log('Done! All Labesp records successfully populated in Firestore.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });

