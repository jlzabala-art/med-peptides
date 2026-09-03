import { db } from './lib/firebase-admin.mjs';
import { FieldValue } from 'firebase-admin/firestore';

// Generate deterministic IDs
const toId = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const supplierId = 'supplier-nplabs';
const supplierName = 'NP LABS';

const nplabsData = {
  "task": "Import and normalize the NP LABS peptide catalogue into RegenPept using Master Products and Variants.",
  "instructions": {
    "supplier": "NP LABS",
    "currency": "EUR",
    "pricing_basis": "unit",
    "master_product_rule": "Create one Master Product for each unique single active ingredient or unique fixed combination of active ingredients.",
    "variant_rule": "Different strengths, concentrations, presentations, volumes, pack sizes and supplier prices must be stored as Variants of the same Master Product whenever the active ingredient composition is unchanged.",
    "combination_rule": "A fixed combination containing two or more active ingredients must be a separate Master Product and must not be stored as a variant of any single-ingredient product.",
    "preserve_source_prices": true,
    "do_not_infer_missing_data": true
  },
  "products": [
    {
      "name": "Sermorelin",
      "category": "Peptides",
      "goal": "GH Secretagogues",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00},
        {"presentation": "Nasal Spray", "strength": "15 mg", "volume": "15 mL", "price_eur": 50.00},
        {"presentation": "Sublingual Drops", "strength": "30 mg", "volume": "30 mL", "price_eur": 93.50}
      ]
    },
    {
      "name": "Ipamorelin",
      "category": "Peptides",
      "goal": "GH Secretagogues",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 45.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 75.00},
        {"presentation": "Nasal Spray", "strength": "15 mg", "volume": "15 mL", "price_eur": 50.00},
        {"presentation": "Sublingual Drops", "strength": "30 mg", "volume": "30 mL", "price_eur": 90.00}
      ]
    },
    {
      "name": "GHRP-6",
      "category": "Peptides",
      "goal": "GH Secretagogues",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00}
      ]
    },
    {
      "name": "CJC-1295 DAC",
      "category": "Peptides",
      "goal": "GH Secretagogues",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 80.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 120.00}
      ]
    },
    {
      "name": "CJC-1295 NO DAC",
      "category": "Peptides",
      "goal": "GH Secretagogues",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 80.00}
      ]
    },
    {
      "name": "CJC-1295 NO DAC + Ipamorelin",
      "category": "Peptide Combination",
      "goal": "GH Secretagogues",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "CJC-1295 NO DAC", "strength": "5 mg"},
            {"ingredient": "Ipamorelin", "strength": "5 mg"}
          ],
          "price_eur": 100.00
        }
      ]
    },
    {
      "name": "CJC-1295 NO DAC + Ipamorelin + BPC-157",
      "category": "Peptide Combination",
      "goal": "GH Secretagogues",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "CJC-1295 NO DAC", "strength": "5 mg"},
            {"ingredient": "Ipamorelin", "strength": "5 mg"},
            {"ingredient": "BPC-157", "strength": "15 mg"}
          ],
          "price_eur": 150.00
        },
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "CJC-1295 NO DAC", "strength": "2 mg"},
            {"ingredient": "Ipamorelin", "strength": "2 mg"},
            {"ingredient": "BPC-157", "strength": "5 mg"}
          ],
          "price_eur": 150.00
        }
      ]
    },
    {
      "name": "CJC-1295 NO DAC + Ipamorelin + Sermorelin",
      "category": "Peptide Combination",
      "goal": "GH Secretagogues",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "CJC-1295 NO DAC", "strength": "3 mg"},
            {"ingredient": "Ipamorelin", "strength": "3 mg"},
            {"ingredient": "Sermorelin", "strength": "6 mg"}
          ],
          "price_eur": 180.00
        }
      ]
    },
    {
      "name": "Tesamorelin",
      "category": "Peptides",
      "goal": "GH Secretagogues",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 80.00},
        {"presentation": "Nasal Spray", "strength": "15 mg", "volume": "15 mL", "price_eur": 50.00},
        {"presentation": "Sublingual Drops", "strength": "30 mg", "volume": "30 mL", "price_eur": 90.00}
      ]
    },
    {
      "name": "Tesamorelin + Ipamorelin",
      "category": "Peptide Combination",
      "goal": "GH Secretagogues",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "Tesamorelin", "strength": "20 mg"},
            {"ingredient": "Ipamorelin", "strength": "10 mg"}
          ],
          "price_eur": 220.00
        }
      ]
    },

    {
      "name": "Semaglutide",
      "category": "Peptides",
      "goal": "Weight Management",
      "variants": [
        {"presentation": "Vial", "strength": "2 mg", "price_eur": 70.00},
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 100.00},
        {"presentation": "Vial", "strength": "20 mg", "volume": "10 mL", "price_eur": 250.00}
      ]
    },
    {
      "name": "Tirzepatide",
      "category": "Peptides",
      "goal": "Weight Management",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 120.00},
        {"presentation": "Vial", "strength": "20 mg", "price_eur": 200.00},
        {"presentation": "Vial", "strength": "40 mg", "price_eur": 260.00},
        {"presentation": "Vial", "strength": "60 mg", "price_eur": 350.00}
      ]
    },
    {
      "name": "Retatrutide",
      "category": "Peptides",
      "goal": "Weight Management",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 100.00},
        {"presentation": "Vial", "strength": "12 mg", "price_eur": 150.00},
        {"presentation": "Vial", "strength": "24 mg", "price_eur": 200.00},
        {"presentation": "Vial", "strength": "50 mg", "volume": "10 mL", "price_eur": 300.00},
        {"presentation": "Vial", "strength": "60 mg", "volume": "10 mL", "price_eur": 350.00}
      ]
    },
    {
      "name": "Cagrilintide",
      "category": "Peptides",
      "goal": "Weight Management",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 120.00}
      ]
    },
    {
      "name": "Cagrilintide + Semaglutide",
      "category": "Peptide Combination",
      "goal": "Weight Management",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "Cagrilintide", "strength": "5 mg"},
            {"ingredient": "Semaglutide", "strength": "5 mg"}
          ],
          "price_eur": 180.00
        }
      ]
    },
    {
      "name": "AOD 9604",
      "category": "Peptides",
      "goal": "Weight Management",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00},
        {"presentation": "Capsule", "strength": "300 mcg", "pack_size": 30, "price_eur": 30.00}
      ]
    },
    {
      "name": "5-Amino-1MQ",
      "category": "Peptides",
      "goal": "Weight Management",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 50.00}
      ]
    },

    {
      "name": "BPC-157",
      "category": "Peptides",
      "goal": "Healing & Recovery",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 60.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 90.00},
        {"presentation": "Vial", "strength": "25 mg", "price_eur": 120.00},
        {"presentation": "Capsule", "strength": "100 mcg", "pack_size": 30, "price_eur": 30.00},
        {"presentation": "Capsule", "strength": "150 mcg", "pack_size": 30, "price_eur": 36.00},
        {"presentation": "Capsule", "strength": "200 mcg", "pack_size": 30, "price_eur": 44.00},
        {"presentation": "Capsule", "strength": "300 mcg", "pack_size": 30, "price_eur": 66.00},
        {"presentation": "Capsule", "strength": "500 mcg", "pack_size": 30, "price_eur": 88.00},
        {"presentation": "Capsule", "strength": "1000 mcg", "pack_size": 30, "price_eur": 150.00}
      ]
    },
    {
      "name": "BPC-157 + TB-500",
      "category": "Peptide Combination",
      "goal": "Healing & Recovery",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "BPC-157", "strength": "10 mg"},
            {"ingredient": "TB-500", "strength": "10 mg"}
          ],
          "price_eur": 150.00
        }
      ]
    },
    {
      "name": "BPC-157 + TB-500 + GHK-Cu",
      "category": "Peptide Combination",
      "goal": "Healing & Recovery",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "BPC-157", "strength": "10 mg"},
            {"ingredient": "TB-500", "strength": "10 mg"},
            {"ingredient": "GHK-Cu", "strength": "50 mg"}
          ],
          "price_eur": 200.00
        }
      ]
    },
    {
      "name": "BPC-157 + TB-500 + GHK-Cu + KPV",
      "category": "Peptide Combination",
      "goal": "Healing & Recovery",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "BPC-157", "strength": "10 mg"},
            {"ingredient": "TB-500", "strength": "10 mg"},
            {"ingredient": "GHK-Cu", "strength": "50 mg"},
            {"ingredient": "KPV", "strength": "10 mg"}
          ],
          "price_eur": 230.00
        }
      ]
    },
    {
      "name": "BPC-157 + Semaglutide",
      "category": "Peptide Combination",
      "goal": "Healing & Recovery",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "BPC-157", "strength": "3.5 mg"},
            {"ingredient": "Semaglutide", "strength": "30 mg"}
          ],
          "price_eur": 280.00
        }
      ]
    },
    {
      "name": "Thymosin Beta (TB-500)",
      "category": "Peptides",
      "goal": "Healing & Recovery",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 60.00},
        {"presentation": "Vial", "strength": "20 mg", "price_eur": 120.00},
        {"presentation": "Nasal Spray", "strength": "2 mg", "volume": "15 mL", "price_eur": 60.00}
      ]
    },
    {
      "name": "KPV",
      "category": "Peptides",
      "goal": "Healing & Recovery",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 30.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 50.00},
        {"presentation": "Nasal Spray", "concentration": "250 mcg/mL", "volume": "15 mL", "price_eur": 60.00}
      ]
    },
    {
      "name": "SS-31 (Elamipretide)",
      "category": "Peptides",
      "goal": "Healing & Recovery",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 25.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 50.00},
        {"presentation": "Vial", "strength": "50 mg", "price_eur": 250.00}
      ]
    },
    {
      "name": "GHK-Cu",
      "category": "Peptides",
      "goal": "Healing & Recovery",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 30.00},
        {"presentation": "Vial", "strength": "30 mg", "price_eur": 40.00},
        {"presentation": "Vial", "strength": "50 mg", "price_eur": 50.00}
      ]
    },

    {
      "name": "Epithalon",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "50 mg", "price_eur": 60.00}
      ]
    },
    {
      "name": "Thymalin",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00}
      ]
    },
    {
      "name": "Thymogen",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 60.00}
      ]
    },
    {
      "name": "Thymosin Alpha 1",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 80.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 120.00},
        {"presentation": "Nasal Spray", "strength": "5 mg", "volume": "15 mL", "price_eur": 50.00},
        {"presentation": "Sublingual Drops", "concentration": "1.5 mg/mL", "volume": "30 mL", "price_eur": 132.00},
        {"presentation": "Sublingual Drops", "concentration": "600 mcg/mL", "volume": "30 mL", "price_eur": 88.00}
      ]
    },
    {
      "name": "MOTS-C",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00},
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 80.00},
        {"presentation": "Vial", "strength": "20 mg", "price_eur": 120.00},
        {"presentation": "Vial", "strength": "50 mg", "price_eur": 150.00}
      ]
    },
    {
      "name": "Spermidine",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Injectable Vial", "strength": "20 mg", "price_eur": 40.00}
      ]
    },
    {
      "name": "DSIP",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00},
        {"presentation": "Sublingual Drops", "concentration": "1000 mcg/mL", "volume": "30 mL", "price_eur": 66.00}
      ]
    },
    {
      "name": "Follistatin 344",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "1 mg", "price_eur": 180.00}
      ]
    },
    {
      "name": "IGF-1 LR3",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "1 mg", "price_eur": 120.00}
      ]
    },
    {
      "name": "VIP (Vasoactive Intestinal Peptide)",
      "category": "Peptides",
      "goal": "Longevity & Anti-Aging",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 120.00}
      ]
    },

    {
      "name": "Semax",
      "category": "Peptides",
      "goal": "Cognitive & Mood",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00},
        {"presentation": "Nasal Spray", "concentration": "7500 mcg/mL", "volume": "15 mL", "price_eur": 50.00}
      ]
    },
    {
      "name": "Selank",
      "category": "Peptides",
      "goal": "Cognitive & Mood",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00},
        {"presentation": "Nasal Spray", "concentration": "7500 mcg/mL", "volume": "15 mL", "price_eur": 55.00},
        {"presentation": "Sublingual Drops", "concentration": "7500 mcg/mL", "volume": "30 mL", "price_eur": 88.00}
      ]
    },
    {
      "name": "Selank + Semax",
      "category": "Peptide Combination",
      "goal": "Cognitive & Mood",
      "variants": [
        {
          "presentation": "Vial",
          "composition": [
            {"ingredient": "Selank", "strength": "5 mg"},
            {"ingredient": "Semax", "strength": "5 mg"}
          ],
          "price_eur": 80.00
        }
      ]
    },
    {
      "name": "Dihexa",
      "category": "Capsules & Consumables",
      "goal": "Cognitive & Mood",
      "variants": [
        {"presentation": "Capsule", "strength": "5 mg", "pack_size": 30, "price_eur": 80.00},
        {"presentation": "Capsule", "strength": "10 mg", "pack_size": 30, "price_eur": 120.00},
        {"presentation": "Capsule", "strength": "30 mg", "pack_size": 30, "price_eur": 180.00}
      ]
    },
    {
      "name": "Cerebrolysin",
      "category": "Capsules & Consumables",
      "goal": "Cognitive & Mood",
      "variants": [
        {"presentation": "Capsule", "strength": "100 mg", "pack_size": 30, "price_eur": 45.00}
      ]
    },

    {
      "name": "PT-141",
      "category": "Peptides",
      "goal": "Sexual Health",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 50.00},
        {"presentation": "Nasal Spray", "strength": "20 mg", "volume": "15 mL", "price_eur": 80.00}
      ]
    },
    {
      "name": "Kisspeptin-10",
      "category": "Peptides",
      "goal": "Sexual Health",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 50.00}
      ]
    },
    {
      "name": "Oxytocin",
      "category": "Peptides",
      "goal": "Sexual Health",
      "variants": [
        {"presentation": "Vial", "strength": "5 mg", "price_eur": 25.00},
        {"presentation": "Nasal Spray", "concentration": "50 IU/mL", "volume": "15 mL", "price_eur": 40.00}
      ]
    },
    {
      "name": "Melanotan I",
      "category": "Peptides",
      "goal": "Sexual Health",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 80.00}
      ]
    },
    {
      "name": "Melanotan II",
      "category": "Peptides",
      "goal": "Sexual Health",
      "variants": [
        {"presentation": "Vial", "strength": "10 mg", "price_eur": 88.00},
        {"presentation": "Nasal Spray", "concentration": "2000 mcg/mL", "volume": "15 mL", "price_eur": 88.00}
      ]
    },

    {
      "name": "HCG",
      "category": "Peptides",
      "goal": "Fertility",
      "variants": [
        {"presentation": "Vial", "strength": "2000 IU", "price_eur": 20.00},
        {"presentation": "Vial", "strength": "5000 IU", "price_eur": 40.00}
      ]
    },
    {
      "name": "HMG",
      "category": "Peptides",
      "goal": "Fertility",
      "variants": [
        {"presentation": "Vial", "strength": "75 IU", "price_eur": 20.00}
      ]
    },
    {
      "name": "HGH",
      "category": "Peptides",
      "goal": "Other / Fertility",
      "variants": [
        {"presentation": "Vial", "strength": "36 IU", "volume": "3 mL", "price_eur": 100.00}
      ]
    },
    {
      "name": "Bacteriostatic Water",
      "category": "Excipients & Vehicles",
      "goal": null,
      "variants": [
        {
          "presentation": "Bottle",
          "volume": "10 mL",
          "composition": "0.9% Benzyl Alcohol",
          "price_eur": 5.00
        }
      ]
    },

    {
      "name": "Amlexanox",
      "category": "Capsules & Consumables",
      "goal": null,
      "variants": [
        {"presentation": "Capsule", "strength": "40 mg", "pack_size": 30, "price_eur": 33.00},
        {"presentation": "Capsule", "strength": "40 mg", "pack_size": 90, "price_eur": 88.00}
      ]
    },
    {
      "name": "SLU-PP-332",
      "category": "Capsules & Consumables",
      "goal": null,
      "variants": [
        {"presentation": "Capsule", "strength": "100 mg", "pack_size": 30, "price_eur": 150.00}
      ]
    }
  ]
};

const PRESENTATION_ALIASES = {
  // Pen variants
  'pre-filled pen':            'pen',
  'prefilled pen':             'pen',
  'pre filled pen':            'pen',
  'single use pen':            'pen',
  'single-use pen':            'pen',
  'singleuse pen':             'pen',
  'reconstitution pen':        'pen',
  'multi-dose pen':            'pen',
  'multidose pen':             'pen',
  'injection pen':             'pen',
  'auto-injector':             'pen',

  // Nasal spray variants
  'nasal spray':               'nasal_spray',
  'nasal_spray':               'nasal_spray',
  'nasal-spray':               'nasal_spray',
  'spray':                     'nasal_spray',
  'intranasal spray':          'nasal_spray',

  // Sublingual drops variants
  'sublingual drops':          'sublingual_drops',
  'sublingual':                'sublingual_drops',
  'drops':                     'sublingual_drops',

  // Capsule variants
  'capsule':                   'capsule',
  'capsules':                  'capsule',
  'cap':                       'capsule',
  'oral capsule':              'capsule',

  // Tablet variants
  'tablet':                    'tablet',
  'tablets':                   'tablet',
  'tab':                       'tablet',
  'pill':                      'tablet',
  'oral tablet':               'tablet',

  // Vial variants
  'vial':                      'vial',
  'vials':                     'vial',
  'lyophilised vial':          'vial',
  'lyophilized vial':          'vial',
  'powder vial':               'vial',
  'injectable vial':           'vial',
  'ampoule':                   'vial',

  // Topical
  'cream':                     'cream',
  'gel':                       'cream',
  'topical':                   'cream',

  // Bottle variants
  'bottle':                    'bottle',
  'liquid':                    'bottle',

  // Test kits
  'blood test':                'blood_test',
  'blood':                     'blood_test',
  'dna test':                  'dna_test',
  'dna':                       'dna_test',
  
  // Others
  'kit':                       'kit',
  'bundle':                    'bundle',
  'digital':                   'digital',
  'box':                       'box'
};

function normalizePresentation(raw) {
    if (!raw) return 'vial';
    const lower = raw.trim().toLowerCase();
    return PRESENTATION_ALIASES[lower] || 'vial';
}

async function run() {
  console.log("Starting NP Labs import...");

  const productsRef = db.collection('products');
  let newProducts = 0;
  let updatedVariants = 0;
  let newVariants = 0;

  for (const product of nplabsData.products) {
    const canonicalName = product.name.trim();
    const productId = toId(canonicalName);

    // 1. Ensure master product exists
    const docRef = productsRef.doc(productId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      await docRef.set({
        id: productId,
        name: canonicalName,
        canonicalName: canonicalName,
        category: product.category || 'Peptides',
        goalId: product.goal || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        searchAlias: [canonicalName.toLowerCase()],
        isActive: true,
        isArchived: false,
      }, { merge: true });
      newProducts++;
      console.log(`Created new master product: ${canonicalName}`);
    }

    const variantsRef = docRef.collection('variants');

    // 2. Process variants
    for (const v of product.variants) {
      let dosageString = '';
      if (v.composition && Array.isArray(v.composition)) {
        dosageString = v.composition.map(c => c.strength || c.concentration || '').filter(Boolean).join(' + ');
      } else {
        dosageString = v.strength || v.concentration || '';
      }

      // Generate variant ID
      let variantIdBase = toId(`${canonicalName}-${supplierName}`);
      let variantSuffix = `${dosageString}-${v.presentation || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const variantId = `${variantIdBase}-${variantSuffix}`;

      // Construct variant doc
      const presentation = normalizePresentation(v.presentation);
      const eurRate = 1.08; // Base rate for base USD price
      const priceUsd = v.price_eur ? Number((v.price_eur * eurRate).toFixed(2)) : 0;

      const variantData = {
        id: variantId,
        supplier: supplierName,
        supplierName: supplierName,
        supplierId: supplierId,
        presentation: presentation,
        dosage: dosageString,
        dose: dosageString, // Fallback for some queries
        price_eur: v.price_eur,
        unit_price: priceUsd,
        updatedAt: FieldValue.serverTimestamp()
      };

      if (v.volume) variantData.volume = v.volume;
      if (v.pack_size) {
        variantData.pack_size = v.pack_size;
        variantData.pieces_per_kit = v.pack_size;
      }

      // 3. Write to DB
      const vSnap = await variantsRef.doc(variantId).get();
      if (vSnap.exists) {
        await variantsRef.doc(variantId).update(variantData);
        updatedVariants++;
      } else {
        variantData.createdAt = FieldValue.serverTimestamp();
        await variantsRef.doc(variantId).set(variantData);
        newVariants++;
      }
    }
  }

  console.log(`\nImport complete!`);
  console.log(`- Master Products Created: ${newProducts}`);
  console.log(`- Variants Created: ${newVariants}`);
  console.log(`- Variants Updated: ${updatedVariants}`);
  process.exit(0);
}

run().catch(e => {
  console.error("Error during import:", e);
  process.exit(1);
});
