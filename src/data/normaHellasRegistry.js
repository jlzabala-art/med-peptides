/**
 * src/data/normaHellasRegistry.js
 * 
 * Authoritative Clinical & Analytical Registry for NORMA HELLAS S.A.
 * Products, Supplier Profiles, Regulatory Dossiers, and Batch COAs.
 * 
 * Primary Reference Formulation:
 * - testosterone-enanthate-norma-250mg
 *   (Testosterone Enanthate/Norma® 250 mg/ml solution for injection - 1 ml ampoule)
 *   MA Holder: NORMA HELLAS S.A. (Athens, Greece)
 *   Batch Release & Testing Site: EVER Pharma Jena GmbH (Jena, Germany)
 *   Marketing Authorisation: 45945/03-10-2008 (EOF / EU)
 *   ATC Code: G03BA03
 */

export const NORMA_SUPPLIER_DOC = {
  id: 'supplier-norma-hellas',
  companyName: 'NORMA HELLAS S.A.',
  name: 'NORMA HELLAS S.A.',
  displayName: 'Norma Hellas Pharmaceuticals',
  legalName: 'NORMA HELLAS PHARMACEUTICAL INDUSTRY S.A.',
  brand: 'Norma Hellas',
  website: 'https://normahellas.gr',
  country: 'Greece',
  originCountry: 'Greece',
  releaseSiteCountry: 'Germany',
  headquarters: '54 Menandrou Street, 10431 Athens, Greece',
  phone: '+30 210 52 22 282',
  fax: '+30 210 52 41 368',
  email: 'info@normahellas.gr',
  contactEmail: 'info@normahellas.gr',
  fulfillmentRegion: 'European Union, GCC & Global',
  currency: 'EUR',
  statusB2B: 'active',
  status: 'active',
  categoryIds: ['hormone', 'androgens_trt'],
  categories: ['hormone', 'androgens_trt'],
  leadTimeDays: 4,
  badge: 'EU GMP & Marketing Authorisation Holder',
  description: 'Specialized European pharmaceutical manufacturer established in 1970. Marketing Authorisation Holder for human pharmaceuticals under European Pharmacopoeia standards, with batch release and sterile analytical testing certified by EVER Pharma Jena GmbH (Germany).',
  rating: 4.98,
  productsSupplied: 1,
  variantsSupplied: 1,
  isCertified: true,
  gmpCertified: true,
  marketingAuthorisation: '45945/03-10-2008',
  logoUrl: '/images/suppliers/norma-hellas-logo.svg',
  createdAt: '2026-03-09T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const TESTOSTERONE_ENANTHATE_NORMA_PRODUCT = {
  id: 'testosterone-enanthate-norma-250mg',
  slug: 'testosterone-enanthate-norma-250mg',
  canonicalKey: 'testosterone-enanthate-norma-250mg',
  name: 'Testosterone Enanthate/Norma® 250 mg/ml',
  commercialName: 'Testosterone Enanthate / Norma® 250 mg/ml',
  brand: 'Norma Hellas',
  brandBadge: 'Norma Hellas Pharmaceuticals • EU GMP',
  category: 'hormone',
  categoryId: 'hormone',
  categories: ['hormone', 'androgens_trt'],
  subCategory: 'androgens_trt',
  type: 'finished_product',
  status: 'published',
  rxRequired: true,
  requiresPrescription: true,
  prescriptionOnly: true,
  isProfessional: true,
  professional_use_only: true,
  priceVisibility: 'registered_doctors_only',
  requiresDoctorAuthForPricing: true,
  atcCode: 'G03BA03',
  therapeuticClass: 'Androgens, 3-oxoandrosten (4) derivatives',
  imageUrl: '/images/products/norma/testosterone-enanthate-norma-250mg.svg',
  images: [
    '/images/products/norma/testosterone-enanthate-norma-250mg.svg'
  ],
  supplierId: 'supplier-norma-hellas',
  supplierName: 'NORMA HELLAS S.A.',
  availableSuppliers: [
    {
      id: 'supplier-norma-hellas',
      name: 'NORMA HELLAS S.A.',
      badge: 'MA Holder & EU GMP',
      isPen: false,
      isSpray: false
    }
  ],
  pricing: {
    retail: null,
    wholesale: 24.50,
    clinic: 21.00,
    master: 18.00
  },
  molecular: {
    name: 'Testosterone Enanthate',
    casNumber: '315-37-7',
    formula: 'C26H40O3',
    molecularWeight: 400.60,
    activeMoiety: 'Testosterone (17β-hydroxyandrost-4-en-3-one)',
    activeMoietyMw: 288.42
  },
  dosage: '250 mg/ml',
  volume: '1 mL',
  presentation: '1 ampoule of 1 ml in cardboard carton with package leaflet',
  containerType: 'Type I Amber Glass Ampoule (Brown Glass)',
  appearance: 'Clear, yellowish oily solution',
  storage: 'Do not store above 25°C. Protect from light. Do not freeze.',
  shelfLife: '24 months',
  administrationRoute: 'Deep Intramuscular Injection (I.M. only, inject very slowly)',

  // ── Official Qualitative & Quantitative Composition ──
  composition: {
    active: {
      substance: 'Testosterone Enanthate',
      amountPerAmpoule: '250 mg',
      equivalentBase: '180 mg pure Testosterone'
    },
    excipients: [
      { name: 'Benzyl Benzoate', amount: '342.0 mg', role: 'Solubilizer / Co-solvent' },
      { name: 'Castor Oil (Oleum Ricini)', amount: '439.6 mg', role: 'Oily Vehicle / Depot Matrix' }
    ]
  },

  // ── Clinical Indicators & Prescribing Guidelines ──
  indications: [
    'Testosterone replacement therapy (TRT) for male hypogonadism confirmed by clinical features and biochemical serum testosterone measurements.',
    'Primary hypogonadism (congenital or acquired: testicular failure, Klinefelter syndrome, anorchia, orchitis, orchiectomy).',
    'Secondary (hypogonadotropic) hypogonadism (pituitary-hypothalamic axis insufficiency, Kallmann syndrome, trauma, radiation).'
  ],
  contraindications: [
    'Hypersensitivity to testosterone enanthate, benzyl benzoate, or castor oil.',
    'Androgen-dependent carcinoma of the prostate or male mammary gland.',
    'Hypercalcaemia secondary to malignant tumours.',
    'Past or existing liver tumours (benign or malignant).',
    'Severe renal disease, uncontrolled hypertension, or severe liver dysfunction.',
    'Strictly contraindicated in women (risk of virilization and teratogenicity).'
  ],
  posology: {
    initialTherapy: '250 mg intramuscularly every 2 to 3 weeks for clinical symptom relief and androgen target organ stimulation.',
    maintenanceTherapy: '250 mg intramuscularly every 3 to 4 weeks (individual intervals may range up to 6 weeks guided by trough serum total/free testosterone).',
    monitoring: 'Baseline and periodic serum total testosterone, hematocrit/hemoglobin, PSA, lipid profile, and liver function tests.'
  },
  pharmacokinetics: {
    absorption: 'Slow, progressive sustained release from oily intramuscular depot with release half-life of ~4.5 days.',
    peakConcentration: 'Peak serum level ~20 ng/ml observed 1.5 to 3.0 days post-injection in adult males.',
    duration: 'Serum testosterone >= 2 ng/ml maintained for 20 days; >= 1 ng/ml maintained for 26 days.',
    metabolism: 'Rapid ester cleavage by tissue esterases yielding testosterone and enanthic acid (metabolized via β-oxidation). Testosterone follows endogenous hepatic metabolism.',
    elimination: 'Metabolic clearance ~16 ± 7 ml/min/kg. Elimination half-life ~7.8 days; 90% renal excretion, 10% biliary excretion.'
  },

  // ── Batch Specific Certificate of Analysis (CoA) ──
  coaData: {
    documentId: 'COA-NORMA-G3WTW1E',
    company: 'EVER PHARMA JENA GMBH',
    client: 'NORMA HELLAS S.A.',
    labStandard: 'EU GMP Pharmacopeial Release Standard (Ph. Eur. / USP)',
    productName: 'TESTOSTERONE ENANTHATE/NORMA 1ML 1AMP GR',
    scientificName: 'Testosterone Enanthate Solution for Injection 250 mg/ml',
    productNumber: '30003159',
    lotNumber: 'G3WTW1E',
    custBatchNo: 'G3WT1E',
    manufactureDate: '2026-04-06',
    retestDate: '2028-04-30',
    releaseDate: '2026-06-09',
    storageCondition: 'Do not store above 25°C. Protect from light.',
    casNumber: '315-37-7',
    molecularFormula: 'C26H40O3',
    molecularWeight: '400.60 g/mol',
    batchQuantity: '79,834 ampoules',
    tests: [
      {
        parameter: 'Assay (Testosterone enanthate)',
        method: 'HPLC 012473',
        specification: '95.0 – 105.0 %',
        result: '102.5 %',
        status: 'PASSED'
      },
      {
        parameter: 'Visual Examination: Liquid oily solution',
        method: 'COM 004105',
        specification: 'Conforms',
        result: 'Conforms',
        status: 'PASSED'
      },
      {
        parameter: 'Visual Examination: Colour',
        method: 'COM 004105',
        specification: 'Non colour to yellowish',
        result: 'Conforms (Clear yellowish)',
        status: 'PASSED'
      },
      {
        parameter: 'Identification (Rt of sample and reference)',
        method: 'HPLC 012473',
        specification: 'Conforms',
        result: 'Conforms',
        status: 'PASSED'
      },
      {
        parameter: 'Identification (UV spectra sample and standard)',
        method: 'HPLC 012473',
        specification: 'Conforms',
        result: 'Conforms',
        status: 'PASSED'
      },
      {
        parameter: 'Sterility Testing',
        method: 'MiBio 002576',
        specification: 'Conforms (Sterile)',
        result: 'Conforms (No microbial growth)',
        status: 'PASSED'
      },
      {
        parameter: 'Bacterial Endotoxins',
        method: 'EP 2.6.14',
        specification: '≤ 300 I.U./ml',
        result: '< 150 I.U./ml',
        status: 'PASSED'
      },
      {
        parameter: 'Particulate Contamination (≥ 10 µm)',
        method: 'MiBio 002646',
        specification: '≤ 6 000 Particles / ampoule',
        result: '2 Particles',
        status: 'PASSED'
      },
      {
        parameter: 'Particulate Contamination (≥ 25 µm)',
        method: 'MiBio 002646',
        specification: '≤ 600 Particles / ampoule',
        result: '0 Particles',
        status: 'PASSED'
      },
      {
        parameter: 'Testosterone Caproate Impurity',
        method: 'HPLC 012473',
        specification: '≤ 1.0 %',
        result: '0.1 %',
        status: 'PASSED'
      },
      {
        parameter: 'Free Testosterone Impurity',
        method: 'HPLC 012473',
        specification: '≤ 0.4 %',
        result: '< 0.1 %',
        status: 'PASSED'
      },
      {
        parameter: 'Any Other Individual Impurity',
        method: 'HPLC 012473',
        specification: '≤ 0.2 %',
        result: '0.1 %',
        status: 'PASSED'
      },
      {
        parameter: 'Total Impurities',
        method: 'HPLC 012473',
        specification: '≤ 2.0 %',
        result: '0.3 %',
        status: 'PASSED'
      },
      {
        parameter: 'Extractable Volume',
        method: 'COM 003680',
        specification: '≥ 1.00 ml',
        result: '1.08 ml',
        status: 'PASSED'
      },
      {
        parameter: 'Density (20°C)',
        method: 'COM 003723',
        specification: '1.0246 – 1.0446 g/ml',
        result: '1.0320 g/ml',
        status: 'PASSED'
      }
    ],
    conclusion: 'I hereby certify that all the manufacturing stages of this batch of finished product have been carried out in full compliance with the GMP requirements of the EU and with the requirements of the Marketing Authorisation of the destination country. The product has been released to the market.',
    qaOfficer: 'Irina Schmitt',
    qaTitle: 'Qualified Person (QP), EVER Pharma Jena GmbH',
    signedDate: '2026-06-09'
  },

  variants: [
    {
      id: 'variant-te-norma-250mg-1amp',
      name: '1 Ampoule (1 ml × 250 mg)',
      dosage: '250 mg / 1 ml',
      format: 'Ampoule',
      packageSize: '1 Ampoule',
      type: 'finished_product',
      sku: 'NORMA-TE-250-1AMP',
      barcode: '5201247380108',
      stock: 450,
      isProfessional: true,
      requiresPrescription: true,
      professional_use_only: true,
      priceVisibility: 'registered_doctors_only',
      pricing: {
        retail: null,
        wholesale: 24.50,
        clinic: 21.00,
        master: 18.00
      }
    }
  ],

  updatedAt: new Date().toISOString(),
  createdAt: '2026-03-09T00:00:00.000Z'
};

export const NORMA_PRODUCTS_REGISTRY = {
  'testosterone-enanthate-norma-250mg': TESTOSTERONE_ENANTHATE_NORMA_PRODUCT,
  'testosterone-enanthate-norma': TESTOSTERONE_ENANTHATE_NORMA_PRODUCT,
  'testosterone-enanthate-250mg': TESTOSTERONE_ENANTHATE_NORMA_PRODUCT,
  'testosterone-enanthate': TESTOSTERONE_ENANTHATE_NORMA_PRODUCT
};

export function getNormaProductBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase().trim();
  return NORMA_PRODUCTS_REGISTRY[normalized] || null;
}
