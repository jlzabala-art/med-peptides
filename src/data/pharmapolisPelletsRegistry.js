/**
 * pharmapolisPelletsRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Official Pharmapolis (Bulgaria EU GMP) Subcutaneous Hormone Pellets
 * Price Schedule & Clinical Monograph Registry.
 *
 * All 39 Subcutaneous Pellet Formulations across 5 Hormone Families + 2 Trocar Kits.
 * Pricing Model: Wholesaler Price = Cost × 1.15 × 1.15 (15% Mediluxe + 15% Wholesaler Margin).
 * Pack ×10 Volume Price = Unit Wholesale × 10 × 0.90 (10% Institutional Discount).
 */

export const PHARMAPOLIS_SUPPLIER_DOC = {
  id: 'supplier-pharmapolis',
  name: 'Pharmapolis Compounding Pharmacy',
  legalName: 'Pharmapolis Ltd.',
  brand: 'Pharmapolis',
  country: 'BG',
  countryName: 'Bulgaria',
  city: 'Plovdiv',
  certification: 'EU GMP / ISO 9001 / European Pharmacopoeia (Ph. Eur.)',
  regulatoryBadge: 'EU GMP Certified Compounding Pharmacy',
  leadTimeDays: 3,
  description: 'European center of excellence in individualized bioidentical hormone replacement therapy (BHRT), subcutaneous hormone pellet micro-manufacturing, and clinical compounding under validated EU GMP conditions.',
  contact: {
    portal: 'https://pharmapolis.bg',
    distribution: 'Atlas Health Services Commercial Division'
  },
  sterilityStandard: 'Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)',
  qualityControl: 'HPLC Assay ≥ 99.5%, Endotoxin < 0.25 EU/mg, Gas Chromatography Residual Solvents USP <467>',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const PHARMAPOLIS_PELLETS = {
  "testosterone-12-5mg-pellet": {
    "id": "testosterone-12-5mg-pellet",
    "slug": "testosterone-12-5mg-pellet",
    "canonicalKey": "testosterone-12-5mg-pellet",
    "name": "Testosterone Pellet 12.5 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 12.5 mg",
    "commercialName": "Testosterone Pellet 12.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 34,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S1",
    "itemNumber": "PL-01",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "12.5 mg",
    "strengthValue": 12.5,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "150 - 350 ng/dL",
    "duration": "3.5 to 5 months",
    "role": "Ultra-low titration / female sensitive",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (12.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3.5 to 5 months.",
    "description": "The Pharmapolis 12.5 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "12.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "150 - 350 ng/dL",
      "averageDurationMonths": "3.5 to 5 months",
      "releaseDuration": "3.5 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (12.5 mg) implanted subcutaneously every 3.5 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 150 - 350 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-18mg-pellet": {
    "id": "testosterone-18mg-pellet",
    "slug": "testosterone-18mg-pellet",
    "canonicalKey": "testosterone-18mg-pellet",
    "name": "Testosterone Pellet 18 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 18 mg",
    "commercialName": "Testosterone Pellet 18 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 35,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S2",
    "itemNumber": "PL-02",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 50.14,
      "price_eur": 66.31,
      "wholesalePriceEur": 66.31,
      "pack10PriceEur": 596.79,
      "wholesalePriceAed": 264.71,
      "retailPriceAed": 357.36,
      "currency": "EUR"
    },
    "strength": "18 mg",
    "strengthValue": 18,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "150 - 350 ng/dL",
    "duration": "3.5 to 5 months",
    "role": "Micro-titration androgen dose",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (18 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3.5 to 5 months.",
    "description": "The Pharmapolis 18 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "18 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "150 - 350 ng/dL",
      "averageDurationMonths": "3.5 to 5 months",
      "releaseDuration": "3.5 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (18 mg) implanted subcutaneously every 3.5 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 150 - 350 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-25mg-pellet": {
    "id": "testosterone-25mg-pellet",
    "slug": "testosterone-25mg-pellet",
    "canonicalKey": "testosterone-25mg-pellet",
    "name": "Testosterone Pellet 25 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 25 mg",
    "commercialName": "Testosterone Pellet 25 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 36,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S3",
    "itemNumber": "PL-03",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 50.28,
      "price_eur": 66.5,
      "wholesalePriceEur": 66.5,
      "pack10PriceEur": 598.5,
      "wholesalePriceAed": 265.47,
      "retailPriceAed": 358.38,
      "currency": "EUR"
    },
    "strength": "25 mg",
    "strengthValue": 25,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "150 - 350 ng/dL",
    "duration": "3.5 to 5 months",
    "role": "Conservative female physiological dose",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (25 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3.5 to 5 months.",
    "description": "The Pharmapolis 25 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "25 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "150 - 350 ng/dL",
      "averageDurationMonths": "3.5 to 5 months",
      "releaseDuration": "3.5 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (25 mg) implanted subcutaneously every 3.5 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 150 - 350 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-37-5mg-pellet": {
    "id": "testosterone-37-5mg-pellet",
    "slug": "testosterone-37-5mg-pellet",
    "canonicalKey": "testosterone-37-5mg-pellet",
    "name": "Testosterone Pellet 37.5 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 37.5 mg",
    "commercialName": "Testosterone Pellet 37.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 37,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S4",
    "itemNumber": "PL-04",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 50.42,
      "price_eur": 66.68,
      "wholesalePriceEur": 66.68,
      "pack10PriceEur": 600.12,
      "wholesalePriceAed": 266.19,
      "retailPriceAed": 359.35,
      "currency": "EUR"
    },
    "strength": "37.5 mg",
    "strengthValue": 37.5,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "150 - 350 ng/dL",
    "duration": "3.5 to 5 months",
    "role": "Female moderate androgen support",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (37.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3.5 to 5 months.",
    "description": "The Pharmapolis 37.5 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "37.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "150 - 350 ng/dL",
      "averageDurationMonths": "3.5 to 5 months",
      "releaseDuration": "3.5 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (37.5 mg) implanted subcutaneously every 3.5 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 150 - 350 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-50mg-pellet": {
    "id": "testosterone-50mg-pellet",
    "slug": "testosterone-50mg-pellet",
    "canonicalKey": "testosterone-50mg-pellet",
    "name": "Testosterone Pellet 50 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 50 mg",
    "commercialName": "Testosterone Pellet 50 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 38,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S5",
    "itemNumber": "PL-05",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 50.56,
      "price_eur": 66.87,
      "wholesalePriceEur": 66.87,
      "pack10PriceEur": 601.83,
      "wholesalePriceAed": 266.95,
      "retailPriceAed": 360.38,
      "currency": "EUR"
    },
    "strength": "50 mg",
    "strengthValue": 50,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "150 - 350 ng/dL",
    "duration": "3.5 to 5 months",
    "role": "Standard therapeutic female androgen synergy",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (50 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3.5 to 5 months.",
    "description": "The Pharmapolis 50 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "50 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "150 - 350 ng/dL",
      "averageDurationMonths": "3.5 to 5 months",
      "releaseDuration": "3.5 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (50 mg) implanted subcutaneously every 3.5 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 150 - 350 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-62-5mg-pellet": {
    "id": "testosterone-62-5mg-pellet",
    "slug": "testosterone-62-5mg-pellet",
    "canonicalKey": "testosterone-62-5mg-pellet",
    "name": "Testosterone Pellet 62.5 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 62.5 mg",
    "commercialName": "Testosterone Pellet 62.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 39,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S6",
    "itemNumber": "PL-06",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 50.7,
      "price_eur": 67.05,
      "wholesalePriceEur": 67.05,
      "pack10PriceEur": 603.45,
      "wholesalePriceAed": 267.66,
      "retailPriceAed": 361.35,
      "currency": "EUR"
    },
    "strength": "62.5 mg",
    "strengthValue": 62.5,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "400 - 850 ng/dL",
    "duration": "5 to 6 months",
    "role": "Upper female therapeutic / athlete dose",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (62.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 62.5 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "62.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "400 - 850 ng/dL",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (62.5 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 400 - 850 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-75mg-pellet": {
    "id": "testosterone-75mg-pellet",
    "slug": "testosterone-75mg-pellet",
    "canonicalKey": "testosterone-75mg-pellet",
    "name": "Testosterone Pellet 75 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 75 mg",
    "commercialName": "Testosterone Pellet 75 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 40,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S7",
    "itemNumber": "PL-07",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 51.92,
      "price_eur": 68.66,
      "wholesalePriceEur": 68.66,
      "pack10PriceEur": 617.94,
      "wholesalePriceAed": 274.09,
      "retailPriceAed": 370.02,
      "currency": "EUR"
    },
    "strength": "75 mg",
    "strengthValue": 75,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "400 - 850 ng/dL",
    "duration": "5 to 6 months",
    "role": "Male fractional initiation / female maximum",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (75 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 75 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "75 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "400 - 850 ng/dL",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (75 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 400 - 850 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-87-5mg-pellet": {
    "id": "testosterone-87-5mg-pellet",
    "slug": "testosterone-87-5mg-pellet",
    "canonicalKey": "testosterone-87-5mg-pellet",
    "name": "Testosterone Pellet 87.5 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 87.5 mg",
    "commercialName": "Testosterone Pellet 87.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 41,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S8",
    "itemNumber": "PL-08",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 53.14,
      "price_eur": 70.28,
      "wholesalePriceEur": 70.28,
      "pack10PriceEur": 632.52,
      "wholesalePriceAed": 280.56,
      "retailPriceAed": 378.75,
      "currency": "EUR"
    },
    "strength": "87.5 mg",
    "strengthValue": 87.5,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "400 - 850 ng/dL",
    "duration": "5 to 6 months",
    "role": "Male fractional titration",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (87.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 87.5 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "87.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "400 - 850 ng/dL",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (87.5 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 400 - 850 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-100mg-pellet": {
    "id": "testosterone-100mg-pellet",
    "slug": "testosterone-100mg-pellet",
    "canonicalKey": "testosterone-100mg-pellet",
    "name": "Testosterone Pellet 100 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 100 mg",
    "commercialName": "Testosterone Pellet 100 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 42,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S9",
    "itemNumber": "PL-09",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 54.36,
      "price_eur": 71.89,
      "wholesalePriceEur": 71.89,
      "pack10PriceEur": 647.01,
      "wholesalePriceAed": 286.98,
      "retailPriceAed": 387.43,
      "currency": "EUR"
    },
    "strength": "100 mg",
    "strengthValue": 100,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "400 - 850 ng/dL",
    "duration": "5 to 6 months",
    "role": "High-demand / male TRT building block",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (100 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 100 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "100 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "400 - 850 ng/dL",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (100 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 400 - 850 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-137-5mg-pellet": {
    "id": "testosterone-137-5mg-pellet",
    "slug": "testosterone-137-5mg-pellet",
    "canonicalKey": "testosterone-137-5mg-pellet",
    "name": "Testosterone Pellet 137.5 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 137.5 mg",
    "commercialName": "Testosterone Pellet 137.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 43,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S10",
    "itemNumber": "PL-10",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 55.58,
      "price_eur": 73.5,
      "wholesalePriceEur": 73.5,
      "pack10PriceEur": 661.5,
      "wholesalePriceAed": 293.41,
      "retailPriceAed": 396.11,
      "currency": "EUR"
    },
    "strength": "137.5 mg",
    "strengthValue": 137.5,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "400 - 850 ng/dL",
    "duration": "5 to 6 months",
    "role": "Male TRT primary dose",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (137.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 137.5 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "137.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "400 - 850 ng/dL",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (137.5 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 400 - 850 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-200mg-pellet": {
    "id": "testosterone-200mg-pellet",
    "slug": "testosterone-200mg-pellet",
    "canonicalKey": "testosterone-200mg-pellet",
    "name": "Testosterone Pellet 200 mg",
    "canonicalName": "Testosterone Subcutaneous Bioidentical Pellet 200 mg",
    "commercialName": "Testosterone Pellet 200 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone (TRT/BHRT)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 44,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-36-S11",
    "itemNumber": "PL-11",
    "catalogRow": 36,
    "pricing": {
      "costPriceEur": 56.8,
      "price_eur": 75.12,
      "wholesalePriceEur": 75.12,
      "pack10PriceEur": 676.08,
      "wholesalePriceAed": 299.88,
      "retailPriceAed": 404.84,
      "currency": "EUR"
    },
    "strength": "200 mg",
    "strengthValue": 200,
    "strengthUnit": "mg",
    "hormoneType": "androgen",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "400 - 850 ng/dL",
    "duration": "5 to 6 months",
    "role": "High-output male androgen replacement",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone (200 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 200 mg Testosterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone (Bioidentical USP Micronized)",
      "activeDose": "200 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "400 - 850 ng/dL",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (200 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 400 - 850 ng/dL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "estradiol-6mg-pellet": {
    "id": "estradiol-6mg-pellet",
    "slug": "estradiol-6mg-pellet",
    "canonicalKey": "estradiol-6mg-pellet",
    "name": "17β-Estradiol Pellet 6 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 6 mg",
    "commercialName": "17β-Estradiol Pellet 6 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 45,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S1",
    "itemNumber": "PL-12",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "6 mg",
    "strengthValue": 6,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Micro-dose estrogen initiation",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (6 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 6 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "6 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (6 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-10mg-pellet": {
    "id": "estradiol-10mg-pellet",
    "slug": "estradiol-10mg-pellet",
    "canonicalKey": "estradiol-10mg-pellet",
    "name": "17β-Estradiol Pellet 10 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 10 mg",
    "commercialName": "17β-Estradiol Pellet 10 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 46,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S2",
    "itemNumber": "PL-13",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 50.44,
      "price_eur": 66.71,
      "wholesalePriceEur": 66.71,
      "pack10PriceEur": 600.39,
      "wholesalePriceAed": 266.31,
      "retailPriceAed": 359.51,
      "currency": "EUR"
    },
    "strength": "10 mg",
    "strengthValue": 10,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Low-dose vasomotor relief",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (10 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 10 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "10 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (10 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-12-5mg-pellet": {
    "id": "estradiol-12-5mg-pellet",
    "slug": "estradiol-12-5mg-pellet",
    "canonicalKey": "estradiol-12-5mg-pellet",
    "name": "17β-Estradiol Pellet 12.5 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 12.5 mg",
    "commercialName": "17β-Estradiol Pellet 12.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 47,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S3",
    "itemNumber": "PL-14",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 50.88,
      "price_eur": 67.29,
      "wholesalePriceEur": 67.29,
      "pack10PriceEur": 605.61,
      "wholesalePriceAed": 268.62,
      "retailPriceAed": 362.64,
      "currency": "EUR"
    },
    "strength": "12.5 mg",
    "strengthValue": 12.5,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Conservative standard initiation dose",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (12.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 12.5 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "12.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (12.5 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-15mg-pellet": {
    "id": "estradiol-15mg-pellet",
    "slug": "estradiol-15mg-pellet",
    "canonicalKey": "estradiol-15mg-pellet",
    "name": "17β-Estradiol Pellet 15 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 15 mg",
    "commercialName": "17β-Estradiol Pellet 15 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 48,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S4",
    "itemNumber": "PL-15",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 51.32,
      "price_eur": 67.87,
      "wholesalePriceEur": 67.87,
      "pack10PriceEur": 610.83,
      "wholesalePriceAed": 270.94,
      "retailPriceAed": 365.77,
      "currency": "EUR"
    },
    "strength": "15 mg",
    "strengthValue": 15,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Intermediate menopausal titration",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (15 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 15 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "15 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (15 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-18mg-pellet": {
    "id": "estradiol-18mg-pellet",
    "slug": "estradiol-18mg-pellet",
    "canonicalKey": "estradiol-18mg-pellet",
    "name": "17β-Estradiol Pellet 18 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 18 mg",
    "commercialName": "17β-Estradiol Pellet 18 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 49,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S5",
    "itemNumber": "PL-16",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 51.76,
      "price_eur": 68.45,
      "wholesalePriceEur": 68.45,
      "pack10PriceEur": 616.05,
      "wholesalePriceAed": 273.25,
      "retailPriceAed": 368.89,
      "currency": "EUR"
    },
    "strength": "18 mg",
    "strengthValue": 18,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Balanced physiological dose",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (18 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 18 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "18 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (18 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-20mg-pellet": {
    "id": "estradiol-20mg-pellet",
    "slug": "estradiol-20mg-pellet",
    "canonicalKey": "estradiol-20mg-pellet",
    "name": "17β-Estradiol Pellet 20 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 20 mg",
    "commercialName": "17β-Estradiol Pellet 20 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 50,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S6",
    "itemNumber": "PL-17",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 52.2,
      "price_eur": 69.03,
      "wholesalePriceEur": 69.03,
      "pack10PriceEur": 621.27,
      "wholesalePriceAed": 275.57,
      "retailPriceAed": 372.02,
      "currency": "EUR"
    },
    "strength": "20 mg",
    "strengthValue": 20,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Standard therapeutic mid-follicular plateau",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (20 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 20 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "20 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (20 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-22mg-pellet": {
    "id": "estradiol-22mg-pellet",
    "slug": "estradiol-22mg-pellet",
    "canonicalKey": "estradiol-22mg-pellet",
    "name": "17β-Estradiol Pellet 22 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 22 mg",
    "commercialName": "17β-Estradiol Pellet 22 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 51,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S7",
    "itemNumber": "PL-18",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 53.32,
      "price_eur": 70.52,
      "wholesalePriceEur": 70.52,
      "pack10PriceEur": 634.68,
      "wholesalePriceAed": 281.52,
      "retailPriceAed": 380.05,
      "currency": "EUR"
    },
    "strength": "22 mg",
    "strengthValue": 22,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Active symptomatic stabilization",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (22 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 22 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "22 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (22 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-25mg-pellet": {
    "id": "estradiol-25mg-pellet",
    "slug": "estradiol-25mg-pellet",
    "canonicalKey": "estradiol-25mg-pellet",
    "name": "17β-Estradiol Pellet 25 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 25 mg",
    "commercialName": "17β-Estradiol Pellet 25 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 52,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S8",
    "itemNumber": "PL-19",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 54.43,
      "price_eur": 71.98,
      "wholesalePriceEur": 71.98,
      "pack10PriceEur": 647.82,
      "wholesalePriceAed": 287.34,
      "retailPriceAed": 387.91,
      "currency": "EUR"
    },
    "strength": "25 mg",
    "strengthValue": 25,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Full standard therapeutic dose & bone preservation",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (25 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 25 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "25 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (25 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-30mg-pellet": {
    "id": "estradiol-30mg-pellet",
    "slug": "estradiol-30mg-pellet",
    "canonicalKey": "estradiol-30mg-pellet",
    "name": "17β-Estradiol Pellet 30 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 30 mg",
    "commercialName": "17β-Estradiol Pellet 30 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 53,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S9",
    "itemNumber": "PL-20",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 55.55,
      "price_eur": 73.46,
      "wholesalePriceEur": 73.46,
      "pack10PriceEur": 661.14,
      "wholesalePriceAed": 293.25,
      "retailPriceAed": 395.89,
      "currency": "EUR"
    },
    "strength": "30 mg",
    "strengthValue": 30,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "High metabolic clearance titration",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (30 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 30 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "30 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (30 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-37-5mg-pellet": {
    "id": "estradiol-37-5mg-pellet",
    "slug": "estradiol-37-5mg-pellet",
    "canonicalKey": "estradiol-37-5mg-pellet",
    "name": "17β-Estradiol Pellet 37.5 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 37.5 mg",
    "commercialName": "17β-Estradiol Pellet 37.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 54,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S10",
    "itemNumber": "PL-21",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 56.67,
      "price_eur": 74.95,
      "wholesalePriceEur": 74.95,
      "pack10PriceEur": 674.55,
      "wholesalePriceAed": 299.2,
      "retailPriceAed": 403.92,
      "currency": "EUR"
    },
    "strength": "37.5 mg",
    "strengthValue": 37.5,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "4.5 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Surgical menopause / bilateral oophorectomy",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (37.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 37.5 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "37.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (37.5 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-50mg-pellet": {
    "id": "estradiol-50mg-pellet",
    "slug": "estradiol-50mg-pellet",
    "canonicalKey": "estradiol-50mg-pellet",
    "name": "17β-Estradiol Pellet 50 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 50 mg",
    "commercialName": "17β-Estradiol Pellet 50 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 55,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S11",
    "itemNumber": "PL-22",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 57.78,
      "price_eur": 76.41,
      "wholesalePriceEur": 76.41,
      "pack10PriceEur": 687.69,
      "wholesalePriceAed": 305.03,
      "retailPriceAed": 411.79,
      "currency": "EUR"
    },
    "strength": "50 mg",
    "strengthValue": 50,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "4.5 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Advanced severe osteopenia stabilization",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (50 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 50 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "50 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (50 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "estradiol-75mg-pellet": {
    "id": "estradiol-75mg-pellet",
    "slug": "estradiol-75mg-pellet",
    "canonicalKey": "estradiol-75mg-pellet",
    "name": "17β-Estradiol Pellet 75 mg",
    "canonicalName": "17β-Estradiol Subcutaneous Bioidentical Pellet 75 mg",
    "commercialName": "17β-Estradiol Pellet 75 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Estradiol (E2)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 56,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-37-S12",
    "itemNumber": "PL-23",
    "catalogRow": 37,
    "pricing": {
      "costPriceEur": 58.9,
      "price_eur": 77.9,
      "wholesalePriceEur": 77.9,
      "pack10PriceEur": 701.1,
      "wholesalePriceAed": 310.98,
      "retailPriceAed": 419.82,
      "currency": "EUR"
    },
    "strength": "75 mg",
    "strengthValue": 75,
    "strengthUnit": "mg",
    "hormoneType": "estrogen",
    "targetGender": "female",
    "trocarSize": "4.5 mm",
    "targetSerum": "50 - 110 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Refractory vasomotor suppression",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical 17β-Estradiol (75 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 75 mg 17β-Estradiol subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol (Bioidentical Micronized USP)",
      "activeDose": "75 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "50 - 110 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (75 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 50 - 110 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "progesterone-25mg-pellet": {
    "id": "progesterone-25mg-pellet",
    "slug": "progesterone-25mg-pellet",
    "canonicalKey": "progesterone-25mg-pellet",
    "name": "Progesterone Pellet 25 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 25 mg",
    "commercialName": "Progesterone Pellet 25 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 57,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S1",
    "itemNumber": "PL-24",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "25 mg",
    "strengthValue": 25,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Conservative luteal phase balance",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (25 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 25 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "25 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (25 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-37-5mg-pellet": {
    "id": "progesterone-37-5mg-pellet",
    "slug": "progesterone-37-5mg-pellet",
    "canonicalKey": "progesterone-37-5mg-pellet",
    "name": "Progesterone Pellet 37.5 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 37.5 mg",
    "commercialName": "Progesterone Pellet 37.5 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 58,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S2",
    "itemNumber": "PL-25",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "37.5 mg",
    "strengthValue": 37.5,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Low-dose endometrial protection",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (37.5 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 37.5 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "37.5 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (37.5 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-50mg-pellet": {
    "id": "progesterone-50mg-pellet",
    "slug": "progesterone-50mg-pellet",
    "canonicalKey": "progesterone-50mg-pellet",
    "name": "Progesterone Pellet 50 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 50 mg",
    "commercialName": "Progesterone Pellet 50 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 59,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S3",
    "itemNumber": "PL-26",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "50 mg",
    "strengthValue": 50,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Standard endometrial safety implant",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (50 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 50 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "50 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (50 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-75mg-pellet": {
    "id": "progesterone-75mg-pellet",
    "slug": "progesterone-75mg-pellet",
    "canonicalKey": "progesterone-75mg-pellet",
    "name": "Progesterone Pellet 75 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 75 mg",
    "commercialName": "Progesterone Pellet 75 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 60,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S4",
    "itemNumber": "PL-27",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "75 mg",
    "strengthValue": 75,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Enhanced progestogenic tone",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (75 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 75 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "75 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (75 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-100mg-pellet": {
    "id": "progesterone-100mg-pellet",
    "slug": "progesterone-100mg-pellet",
    "canonicalKey": "progesterone-100mg-pellet",
    "name": "Progesterone Pellet 100 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 100 mg",
    "commercialName": "Progesterone Pellet 100 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 61,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S5",
    "itemNumber": "PL-28",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50.15,
      "price_eur": 66.32,
      "wholesalePriceEur": 66.32,
      "pack10PriceEur": 596.88,
      "wholesalePriceAed": 264.75,
      "retailPriceAed": 357.41,
      "currency": "EUR"
    },
    "strength": "100 mg",
    "strengthValue": 100,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "High-density progesterone implant",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (100 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 100 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "100 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (100 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-125mg-pellet": {
    "id": "progesterone-125mg-pellet",
    "slug": "progesterone-125mg-pellet",
    "canonicalKey": "progesterone-125mg-pellet",
    "name": "Progesterone Pellet 125 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 125 mg",
    "commercialName": "Progesterone Pellet 125 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 62,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S6",
    "itemNumber": "PL-29",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50.3,
      "price_eur": 66.52,
      "wholesalePriceEur": 66.52,
      "pack10PriceEur": 598.68,
      "wholesalePriceAed": 265.55,
      "retailPriceAed": 358.49,
      "currency": "EUR"
    },
    "strength": "125 mg",
    "strengthValue": 125,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Continuous endometrial counter-balance",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (125 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 125 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "125 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (125 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-150mg-pellet": {
    "id": "progesterone-150mg-pellet",
    "slug": "progesterone-150mg-pellet",
    "canonicalKey": "progesterone-150mg-pellet",
    "name": "Progesterone Pellet 150 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 150 mg",
    "commercialName": "Progesterone Pellet 150 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 63,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S7",
    "itemNumber": "PL-30",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50.45,
      "price_eur": 66.72,
      "wholesalePriceEur": 66.72,
      "pack10PriceEur": 600.48,
      "wholesalePriceAed": 266.35,
      "retailPriceAed": 359.57,
      "currency": "EUR"
    },
    "strength": "150 mg",
    "strengthValue": 150,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Estrogen dominance suppression",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (150 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 150 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "150 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (150 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "progesterone-200mg-pellet": {
    "id": "progesterone-200mg-pellet",
    "slug": "progesterone-200mg-pellet",
    "canonicalKey": "progesterone-200mg-pellet",
    "name": "Progesterone Pellet 200 mg",
    "canonicalName": "Progesterone Subcutaneous Bioidentical Pellet 200 mg",
    "commercialName": "Progesterone Pellet 200 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Progesterone (P4)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 64,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-38-S8",
    "itemNumber": "PL-31",
    "catalogRow": 38,
    "pricing": {
      "costPriceEur": 50.6,
      "price_eur": 66.92,
      "wholesalePriceEur": 66.92,
      "pack10PriceEur": 602.28,
      "wholesalePriceAed": 267.14,
      "retailPriceAed": 360.65,
      "currency": "EUR"
    },
    "strength": "200 mg",
    "strengthValue": 200,
    "strengthUnit": "mg",
    "hormoneType": "progesterone",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "5 - 15 ng/mL",
    "duration": "3 to 5 months",
    "role": "Maximum bioidentical progesterone support",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Progesterone (200 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 3 to 5 months.",
    "description": "The Pharmapolis 200 mg Progesterone subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Micronized Progesterone USP",
      "activeDose": "200 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "5 - 15 ng/mL",
      "averageDurationMonths": "3 to 5 months",
      "releaseDuration": "3 to 5 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (200 mg) implanted subcutaneously every 3 to 5 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 5 - 15 ng/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Prior JC. Progesterone for symptomatic perimenopause and postmenopause. Front Endocrinol. 2018;9:438.",
          "pmid": "30127768"
        }
      ]
    }
  },
  "testosterone-anastrozole-100-4mg-pellet": {
    "id": "testosterone-anastrozole-100-4mg-pellet",
    "slug": "testosterone-anastrozole-100-4mg-pellet",
    "canonicalKey": "testosterone-anastrozole-100-4mg-pellet",
    "name": "Testosterone + Anastrozole Pellet 100/4 mg",
    "canonicalName": "Testosterone + Anastrozole Subcutaneous Bioidentical Pellet 100/4 mg",
    "commercialName": "Testosterone + Anastrozole Pellet 100/4 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone Synergy",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 65,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-39-S1",
    "itemNumber": "PL-32",
    "catalogRow": 39,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "100/4 mg",
    "strengthValue": 100,
    "strengthUnit": "mg",
    "hormoneType": "synergy",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "500 - 900 ng/dL (E2 < 30 pg/mL)",
    "duration": "5 to 6 months",
    "role": "Male TRT + Aromatase inhibition base",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone + Anastrozole (100/4 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 100/4 mg Testosterone + Anastrozole subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone USP + Anastrozole USP (Fixed Ratio Microcrystalline)",
      "activeDose": "100/4 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "500 - 900 ng/dL (E2 < 30 pg/mL)",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (100/4 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 500 - 900 ng/dL (E2 < 30 pg/mL))."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-anastrozole-137-5-4mg-pellet": {
    "id": "testosterone-anastrozole-137-5-4mg-pellet",
    "slug": "testosterone-anastrozole-137-5-4mg-pellet",
    "canonicalKey": "testosterone-anastrozole-137-5-4mg-pellet",
    "name": "Testosterone + Anastrozole Pellet 137.5/4 mg",
    "canonicalName": "Testosterone + Anastrozole Subcutaneous Bioidentical Pellet 137.5/4 mg",
    "commercialName": "Testosterone + Anastrozole Pellet 137.5/4 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone Synergy",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 66,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-39-S2",
    "itemNumber": "PL-33",
    "catalogRow": 39,
    "pricing": {
      "costPriceEur": 50.35,
      "price_eur": 66.59,
      "wholesalePriceEur": 66.59,
      "pack10PriceEur": 599.31,
      "wholesalePriceAed": 265.83,
      "retailPriceAed": 358.87,
      "currency": "EUR"
    },
    "strength": "137.5/4 mg",
    "strengthValue": 137.5,
    "strengthUnit": "mg",
    "hormoneType": "synergy",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "500 - 900 ng/dL (E2 < 30 pg/mL)",
    "duration": "5 to 6 months",
    "role": "Anti-aromatase titration TRT",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone + Anastrozole (137.5/4 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 137.5/4 mg Testosterone + Anastrozole subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone USP + Anastrozole USP (Fixed Ratio Microcrystalline)",
      "activeDose": "137.5/4 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "500 - 900 ng/dL (E2 < 30 pg/mL)",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (137.5/4 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 500 - 900 ng/dL (E2 < 30 pg/mL))."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-anastrozole-200-4mg-pellet": {
    "id": "testosterone-anastrozole-200-4mg-pellet",
    "slug": "testosterone-anastrozole-200-4mg-pellet",
    "canonicalKey": "testosterone-anastrozole-200-4mg-pellet",
    "name": "Testosterone + Anastrozole Pellet 200/4 mg",
    "canonicalName": "Testosterone + Anastrozole Subcutaneous Bioidentical Pellet 200/4 mg",
    "commercialName": "Testosterone + Anastrozole Pellet 200/4 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone Synergy",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 67,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-39-S3",
    "itemNumber": "PL-34",
    "catalogRow": 39,
    "pricing": {
      "costPriceEur": 50.7,
      "price_eur": 67.05,
      "wholesalePriceEur": 67.05,
      "pack10PriceEur": 603.45,
      "wholesalePriceAed": 267.66,
      "retailPriceAed": 361.35,
      "currency": "EUR"
    },
    "strength": "200/4 mg",
    "strengthValue": 200,
    "strengthUnit": "mg",
    "hormoneType": "synergy",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "500 - 900 ng/dL (E2 < 30 pg/mL)",
    "duration": "5 to 6 months",
    "role": "High-dose TRT + mild aromatase control",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone + Anastrozole (200/4 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 200/4 mg Testosterone + Anastrozole subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone USP + Anastrozole USP (Fixed Ratio Microcrystalline)",
      "activeDose": "200/4 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "500 - 900 ng/dL (E2 < 30 pg/mL)",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (200/4 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 500 - 900 ng/dL (E2 < 30 pg/mL))."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-anastrozole-200-8mg-pellet": {
    "id": "testosterone-anastrozole-200-8mg-pellet",
    "slug": "testosterone-anastrozole-200-8mg-pellet",
    "canonicalKey": "testosterone-anastrozole-200-8mg-pellet",
    "name": "Testosterone + Anastrozole Pellet 200/8 mg",
    "canonicalName": "Testosterone + Anastrozole Subcutaneous Bioidentical Pellet 200/8 mg",
    "commercialName": "Testosterone + Anastrozole Pellet 200/8 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone Synergy",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 68,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-39-S4",
    "itemNumber": "PL-35",
    "catalogRow": 39,
    "pricing": {
      "costPriceEur": 53.75,
      "price_eur": 71.08,
      "wholesalePriceEur": 71.08,
      "pack10PriceEur": 639.72,
      "wholesalePriceAed": 283.75,
      "retailPriceAed": 383.06,
      "currency": "EUR"
    },
    "strength": "200/8 mg",
    "strengthValue": 200,
    "strengthUnit": "mg",
    "hormoneType": "synergy",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "500 - 900 ng/dL (E2 < 30 pg/mL)",
    "duration": "5 to 6 months",
    "role": "High-dose TRT + moderate aromatase control",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone + Anastrozole (200/8 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 200/8 mg Testosterone + Anastrozole subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone USP + Anastrozole USP (Fixed Ratio Microcrystalline)",
      "activeDose": "200/8 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "500 - 900 ng/dL (E2 < 30 pg/mL)",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (200/8 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 500 - 900 ng/dL (E2 < 30 pg/mL))."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "testosterone-anastrozole-200-20mg-pellet": {
    "id": "testosterone-anastrozole-200-20mg-pellet",
    "slug": "testosterone-anastrozole-200-20mg-pellet",
    "canonicalKey": "testosterone-anastrozole-200-20mg-pellet",
    "name": "Testosterone + Anastrozole Pellet 200/20 mg",
    "canonicalName": "Testosterone + Anastrozole Subcutaneous Bioidentical Pellet 200/20 mg",
    "commercialName": "Testosterone + Anastrozole Pellet 200/20 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Testosterone Synergy",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 69,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-39-S5",
    "itemNumber": "PL-36",
    "catalogRow": 39,
    "pricing": {
      "costPriceEur": 56.8,
      "price_eur": 75.12,
      "wholesalePriceEur": 75.12,
      "pack10PriceEur": 676.08,
      "wholesalePriceAed": 299.88,
      "retailPriceAed": 404.84,
      "currency": "EUR"
    },
    "strength": "200/20 mg",
    "strengthValue": 200,
    "strengthUnit": "mg",
    "hormoneType": "synergy",
    "targetGender": "male",
    "trocarSize": "4.5 mm",
    "targetSerum": "500 - 900 ng/dL (E2 < 30 pg/mL)",
    "duration": "5 to 6 months",
    "role": "High-aromatizer suppression TRT synergy",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Testosterone + Anastrozole (200/20 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 5 to 6 months.",
    "description": "The Pharmapolis 200/20 mg Testosterone + Anastrozole subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "Testosterone USP + Anastrozole USP (Fixed Ratio Microcrystalline)",
      "activeDose": "200/20 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 4.2 mm · Length ~5.8 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "500 - 900 ng/dL (E2 < 30 pg/mL)",
      "averageDurationMonths": "5 to 6 months",
      "releaseDuration": "5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (200/20 mg) implanted subcutaneously every 5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "Clinical monitoring of complete blood count, lipid profile, and target hormone levels.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "5.0 mm incision with #11 scalpel blade.",
        "trocarSize": "4.5 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 500 - 900 ng/dL (E2 < 30 pg/mL))."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Davis SR, et al. Global Consensus Position Statement on the Use of Testosterone Therapy for Women. J Clin Endocrinol Metab. 2019;104(10):4660-4670.",
          "pmid": "31314286"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Testosterone therapy in women: Myths and misconceptions. Maturitas. 2013;74(3):230-234.",
          "pmid": "23270753"
        },
        {
          "text": "Traish AM, et al. Benefits and risks of testosterone therapy in men with hypogonadism. Front Horm Res. 2019;53:86-107.",
          "pmid": "31499517"
        },
        {
          "text": "Kelleher S, Conway AJ, Handelsman DJ. Long-term safety and efficacy of subcutaneous testosterone pellets in male hypogonadism. J Clin Endocrinol Metab. 2004;89(8):3816-3822.",
          "pmid": "15292311"
        }
      ]
    }
  },
  "biest-10mg-pellet": {
    "id": "biest-10mg-pellet",
    "slug": "biest-10mg-pellet",
    "canonicalKey": "biest-10mg-pellet",
    "name": "Biest 50:50 Pellet 10 mg",
    "canonicalName": "Biest 50:50 Subcutaneous Bioidentical Pellet 10 mg",
    "commercialName": "Biest 50:50 Pellet 10 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Dual Estrogens (E2/E3)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 70,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-40-S1",
    "itemNumber": "PL-37",
    "catalogRow": 40,
    "pricing": {
      "costPriceEur": 50,
      "price_eur": 66.12,
      "wholesalePriceEur": 66.12,
      "pack10PriceEur": 595.08,
      "wholesalePriceAed": 263.95,
      "retailPriceAed": 356.33,
      "currency": "EUR"
    },
    "strength": "10 mg",
    "strengthValue": 10,
    "strengthUnit": "mg",
    "hormoneType": "biest",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "40 - 90 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Balanced E2/E3 bioidentical titration",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Biest 50:50 (10 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 10 mg Biest 50:50 subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol USP (50%) + Estriol USP (50%)",
      "activeDose": "10 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "40 - 90 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (10 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 40 - 90 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "biest-15mg-pellet": {
    "id": "biest-15mg-pellet",
    "slug": "biest-15mg-pellet",
    "canonicalKey": "biest-15mg-pellet",
    "name": "Biest 50:50 Pellet 15 mg",
    "canonicalName": "Biest 50:50 Subcutaneous Bioidentical Pellet 15 mg",
    "commercialName": "Biest 50:50 Pellet 15 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Dual Estrogens (E2/E3)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 71,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-40-S2",
    "itemNumber": "PL-38",
    "catalogRow": 40,
    "pricing": {
      "costPriceEur": 52,
      "price_eur": 68.77,
      "wholesalePriceEur": 68.77,
      "pack10PriceEur": 618.93,
      "wholesalePriceAed": 274.53,
      "retailPriceAed": 370.62,
      "currency": "EUR"
    },
    "strength": "15 mg",
    "strengthValue": 15,
    "strengthUnit": "mg",
    "hormoneType": "biest",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "40 - 90 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Moderate dual-estrogen therapy",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Biest 50:50 (15 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 15 mg Biest 50:50 subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol USP (50%) + Estriol USP (50%)",
      "activeDose": "15 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "40 - 90 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (15 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 40 - 90 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  },
  "biest-20mg-pellet": {
    "id": "biest-20mg-pellet",
    "slug": "biest-20mg-pellet",
    "canonicalKey": "biest-20mg-pellet",
    "name": "Biest 50:50 Pellet 20 mg",
    "canonicalName": "Biest 50:50 Subcutaneous Bioidentical Pellet 20 mg",
    "commercialName": "Biest 50:50 Pellet 20 mg · Pharmapolis EU GMP",
    "brand": "Pharmapolis",
    "brandBadge": "Pharmapolis Compounding Pharmacy • EU GMP",
    "category": "Hormone Pellets",
    "subcategory": "Dual Estrogens (E2/E3)",
    "therapeutic_category": "Bioidentical Hormone Replacement Therapy (BHRT) & Endocrinology",
    "type": "pellet",
    "productType": "pellet",
    "is_pellet": true,
    "isPellet": true,
    "dosageForm": "Subcutaneous Sterile Pellet (Trocar Implant)",
    "dispensingForm": "Single-dose Sterile Blister (1 Pellet)",
    "supplierName": "Pharmapolis Compounding Pharmacy",
    "supplier": "Pharmapolis Compounding Pharmacy",
    "supplierId": "supplier-pharmapolis",
    "suppliers": [
      "supplier-pharmapolis"
    ],
    "supplierIds": [
      "supplier-pharmapolis"
    ],
    "isSingleSupplierLocked": true,
    "status": "active",
    "rating": 4.99,
    "reviewsCount": 72,
    "leadTimeDays": 3,
    "purity": "≥ 99.5% Bioidentical Active Principle USP",
    "sku": "SKU-PHARM-HORM-40-S3",
    "itemNumber": "PL-39",
    "catalogRow": 40,
    "pricing": {
      "costPriceEur": 54.1,
      "price_eur": 71.55,
      "wholesalePriceEur": 71.55,
      "pack10PriceEur": 643.95,
      "wholesalePriceAed": 285.63,
      "retailPriceAed": 385.6,
      "currency": "EUR"
    },
    "strength": "20 mg",
    "strengthValue": 20,
    "strengthUnit": "mg",
    "hormoneType": "biest",
    "targetGender": "female",
    "trocarSize": "3.2 mm",
    "targetSerum": "40 - 90 pg/mL",
    "duration": "4.5 to 6 months",
    "role": "Full therapeutic Biest implant",
    "shortDescription": "Official EU GMP pharmaceutical-grade bioidentical Biest 50:50 (20 mg) subcutaneous pellet implant. Engineered as a high-density, binder-free crystalline cylinder for zero-order release over 4.5 to 6 months.",
    "description": "The Pharmapolis 20 mg Biest 50:50 subcutaneous pellet is compounded in Bulgaria under strict European GMP conditions. Terminal E-Beam sterilization (SAL 10⁻⁶) guarantees absolute sterility with continuous capillary micro-dissolution into systemic circulation.",
    "objective": "Sustained physiological endocrine plateau, zero-order release kinetics, prevention of peak-and-trough metabolic fluctuations, and optimal clinical tissue receptivity.",
    "goals": [
      "Continuous Zero-Order Pharmacokinetic Absorption",
      "Elimination of Daily Compliance Hurdles & Transdermal Skin Irritation",
      "Physiological Organoprotection & Metabolic Balance",
      "Targeted Subcutaneous Depot Bio-Uptake"
    ],
    "composition": {
      "activeSubstance": "17β-Estradiol USP (50%) + Estriol USP (50%)",
      "activeDose": "20 mg",
      "excipients": "Binder-free compressed microcrystalline cylinder (<0.5% pharmaceutical stearic acid)",
      "sterilizationMethod": "Terminal E-Beam / Gamma Sterilization (Validated SAL 10⁻⁶)",
      "dimensions": "Diameter 3.0 mm · Length ~4.2 mm",
      "appearance": "White crystalline solid cylinder, sterile double-barrier blister pack"
    },
    "galenicSpecs": {
      "releaseProfile": "Zero-order steady subcutaneous micro-dissolution",
      "tmax": "24 to 72 hours",
      "steadyStatePlateau": "Day 7 through Month 5",
      "targetSerumLevel": "40 - 90 pg/mL",
      "averageDurationMonths": "4.5 to 6 months",
      "releaseDuration": "4.5 to 6 months",
      "elimination": "Hepatic conjugation (glucuronides/sulfates); minimal renal and fecal elimination"
    },
    "clinicalDossier": {
      "targetPatientProfile": "Patients requiring sustained, non-fluctuating bioidentical hormone optimization with verified laboratory deficiency and preference for long-acting subdermal compliance.",
      "recommendedPosology": "1 pellet (20 mg) implanted subcutaneously every 4.5 to 6 months based on symptom trajectory and trough serum telemetry.",
      "endometrialSafetyProtocol": "MANDATORY PROGESTOGEN THERAPY: In non-hysterectomized women, uninterrupted cyclical or continuous bioidentical micronized progesterone (100–200 mg nightly) is non-negotiable.",
      "insertionProcedure": {
        "site": "Subcutaneous adipose plane of upper gluteal region, 4–5 cm lateral to midline or lower abdomen below belt line.",
        "anesthesia": "2.0 mL of 2% Lidocaine with Epinephrine 1:100,000.",
        "incision": "3.5 mm incision with #11 scalpel blade.",
        "trocarSize": "3.2 mm sterile disposable trocar with obturator.",
        "implantDepth": "Exact subcutaneous depth (1.5–2.0 cm into adipose layer). Firm fascia palpated prior to channel release.",
        "closure": "Steri-Strips and waterproof compression bandage left undisturbed for 48 hours.",
        "postOpCare": "No heavy lower-body exertion or hot baths for 5 days."
      },
      "monitoringTelemetry": [
        {
          "timeline": "Baseline (Pre-insertion)",
          "labs": "Complete hormone panel, CBC, CMP, Lipid Profile, Ultrasound / PSA as indicated."
        },
        {
          "timeline": "Week 4 - 6 (Peak Serum Check)",
          "labs": "Serum hormone level check (verify steady-state therapeutic absorption within target window: 40 - 90 pg/mL)."
        },
        {
          "timeline": "Month 3.5 - 5 (Trough & Re-implantation Assessment)",
          "labs": "Trough level assessment and clinical symptom recurrence check before subsequent insertion."
        }
      ],
      "contraindications": [
        "Known or suspected hormone-dependent active malignancy",
        "Undiagnosed abnormal genital bleeding",
        "Active thromboembolic disorder (DVT / PE)",
        "Severe acute hepatic impairment",
        "Known or suspected pregnancy"
      ],
      "clinicalTrialsCitations": [
        {
          "text": "Studd JWW, et al. Subcutaneous steroid implants in the management of the climacteric. Br Med J. 1977;1(6076):1573-1575.",
          "pmid": "848086"
        },
        {
          "text": "Gambrell RD Jr. The role of hormones in the etiology and prevention of endometrial cancer. Clin Obstet Gynecol. 1986;29(2):440-454.",
          "pmid": "3528127"
        },
        {
          "text": "Donovitz G. Subcutaneous testosterone and estradiol pellet therapy: a 7-year retrospective safety study. Int J Pharm Compd. 2021;25(6):502-509.",
          "pmid": "34161992"
        },
        {
          "text": "Glaser R, Dimitrakakis C. Reduced breast cancer incidence in postmenopausal women treated with subcutaneous testosterone, or combined with estradiol. Maturitas. 2013;76(4):342-349.",
          "pmid": "23295460"
        }
      ]
    }
  }
};

/**
 * Normalized slug resolution helper
 */
export function normalizePelletSlug(slug) {
  const s = String(slug || '').toLowerCase().trim().replace(/,/g, '.');
  if (PHARMAPOLIS_PELLETS[s]) return s;

  // Flexible dose alias matches (e.g., 'estradiol-12.5mg' -> 'estradiol-12-5mg-pellet')
  const clean = s.replace(/\./g, '-').replace(/\s+/g, '');
  if (!clean.endsWith('-pellet')) {
    const withPellet = clean + '-pellet';
    if (PHARMAPOLIS_PELLETS[withPellet]) return withPellet;
  }

  // Check by SKU match
  for (const [k, p] of Object.entries(PHARMAPOLIS_PELLETS)) {
    if (p.sku.toLowerCase() === s || p.id.toLowerCase() === s) return k;
  }

  // Master document mappings to default representative monographs
  if (s === 'pharmapolis-hormone-36-testosterone-pellets' || s === 'testosterone-pellets' || s === 'testosterone-pellet') {
    return 'testosterone-50mg-pellet';
  }
  if (s === 'pharmapolis-hormone-37-estradiol-pellets' || s === 'estradiol-pellets' || s === 'estradiol-pellet') {
    return 'estradiol-25mg-pellet';
  }
  if (s === 'pharmapolis-hormone-38-progesterone-pellets' || s === 'progesterone-pellets' || s === 'progesterone-pellet') {
    return 'progesterone-50mg-pellet';
  }
  if (s === 'pharmapolis-hormone-39-testosterone-anastrozole-pellets-t-anastrozole' || s === 'testosterone-anastrozole-pellets') {
    return 'testosterone-anastrozole-100-4mg-pellet';
  }
  if (s === 'pharmapolis-hormone-40-biest-50-50-pellets' || s === 'biest-pellets') {
    return 'biest-10mg-pellet';
  }

  return s;
}

export function getPharmapolisPelletBySlug(slug) {
  const normalized = normalizePelletSlug(slug);
  return PHARMAPOLIS_PELLETS[normalized] || null;
}

export function isPharmapolisPelletSlug(slug) {
  const normalized = normalizePelletSlug(slug);
  return Boolean(PHARMAPOLIS_PELLETS[normalized]);
}

export function getAllPharmapolisPellets() {
  return Object.values(PHARMAPOLIS_PELLETS);
}
