/**
 * services/lotuslandProcurementService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative procurement intelligence service for Lotusland Limited.
 * Aggregates all 10 commercial releases across Hong Kong & UAE corridors
 * down to the individual API Raw Material level.
 *
 * Source of Truth: Firestore `supplier_invoices` (with canonical fallback).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const LOTUSLAND_METADATA = {
  supplierId: 'OLlBbQjgrj6tY7GmM2Jo',
  canonicalId: 'supplier-lotusland',
  companyName: 'Lotusland Limited',
  legalName: 'LOTUSLAND LIMITED',
  regNumber: '71705158',
  incorporationJurisdiction: 'Hong Kong SAR',
  address: 'Flat/Rm 11, 20/F Floor, The Cloud, No. 111 Tung Chau Street, Tai Kok Tsui, Kowloon, Hong Kong, 999077',
  contactPerson: 'Jon',
  phone: '+86 19521488211',
  email: 'info@longyupharma.com',
  buyers: [
    {
      name: 'Magenta Pharma Medicine Trading LLC',
      trn: '100574948400003',
      facility: 'Magenta RX Plus Compounding Pharmacy',
      jurisdiction: 'Dubai, UAE'
    },
    {
      name: 'Mediluxe Health Solutions FZE / Medical Guild Trading FZC',
      trn: '104906198700003',
      facility: 'European & GCC Clinical Fulfillment Corridor',
      jurisdiction: 'Sharjah / Dubai, UAE'
    }
  ]
};

// 10 Authoritative Commercial Invoices with line items
export const LOTUSLAND_INVOICES_REGISTRY = [
  {
    invoiceNumber: 'MY20260519021Y',
    date: '2026-05-19',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 922.00,
    discountAmount: 500.00,
    shippingAmount: 422.00,
    grandTotal: 422.00,
    grandTotalUSD: 422.00,
    items: [
      { name: 'Enclomiphene', quantityGrams: 10, unitPrice: 50.00, lineTotal: 500.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'DHL EXPRESS', quantityGrams: 0, unitPrice: 422.00, lineTotal: 422.00, currency: 'USD', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260506021Y',
    date: '2026-05-06',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 23553.13,
    discountAmount: 0,
    shippingAmount: 400.00,
    grandTotal: 23953.13,
    grandTotalUSD: 23953.13,
    items: [
      { name: 'Enclomiphene', quantityGrams: 500, unitPrice: 17.89, lineTotal: 8945.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'VIP (Vasoactive Intestinal Peptide)', quantityGrams: 7.5, unitPrice: 1947.75, lineTotal: 14608.13, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Shipping by Express', quantityGrams: 0, unitPrice: 400.00, lineTotal: 400.00, currency: 'USD', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260420101Y',
    date: '2026-04-20',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 94726.00,
    discountAmount: 0,
    shippingAmount: 850.00,
    grandTotal: 95576.00,
    grandTotalUSD: 95576.00,
    items: [
      { name: '5-Amino-1MQ', quantityGrams: 1000, unitPrice: 23.85, lineTotal: 23850.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Cartalax', quantityGrams: 4, unitPrice: 2365.13, lineTotal: 9460.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Thymogen (Glu-Trp)', quantityGrams: 2, unitPrice: 2583.75, lineTotal: 5167.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Prostamax', quantityGrams: 2, unitPrice: 2583.75, lineTotal: 5167.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Testagen', quantityGrams: 2, unitPrice: 2369.10, lineTotal: 4738.20, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Cagrilintide', quantityGrams: 2, unitPrice: 2365.13, lineTotal: 4730.25, currency: 'USD', category: 'api_raw_materials' },
      { name: 'HMG', quantityGrams: 2, unitPrice: 1272.00, lineTotal: 2544.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'MK-677 (Ibutamoren)', quantityGrams: 100, unitPrice: 55.65, lineTotal: 5565.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'GW-501516 (Cardarine)', quantityGrams: 200, unitPrice: 23.85, lineTotal: 4770.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'ARA-290 (Cibinetide)', quantityGrams: 2, unitPrice: 2146.50, lineTotal: 4293.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Cardiogen', quantityGrams: 2, unitPrice: 2663.25, lineTotal: 5326.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Melanotan II (MT-2)', quantityGrams: 5, unitPrice: 898.35, lineTotal: 4491.75, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Pinealon', quantityGrams: 2, unitPrice: 2444.63, lineTotal: 4889.25, currency: 'USD', category: 'api_raw_materials' },
      { name: 'PE-22-28', quantityGrams: 2, unitPrice: 2424.75, lineTotal: 4849.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'PEG-MGF', quantityGrams: 0.5, unitPrice: 6519.00, lineTotal: 3259.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'SNAP-8', quantityGrams: 2, unitPrice: 556.50, lineTotal: 1113.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Thymulin', quantityGrams: 0.25, unitPrice: 1987.50, lineTotal: 496.88, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 850.00, lineTotal: 850.00, currency: 'USD', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260414096Y',
    date: '2026-04-14',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 62719.50,
    discountAmount: 0,
    shippingAmount: 650.00,
    grandTotal: 63369.50,
    grandTotalUSD: 63369.50,
    items: [
      { name: 'DSIP (Delta Sleep-Inducing Peptide)', quantityGrams: 5, unitPrice: 803.25, lineTotal: 4016.25, currency: 'USD', category: 'api_raw_materials' },
      { name: 'IGF-1 LR3', quantityGrams: 2, unitPrice: 21262.50, lineTotal: 42525.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'CJC-1295 (without DAC)', quantityGrams: 7.5, unitPrice: 2165.63, lineTotal: 16242.19, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 650.00, lineTotal: 650.00, currency: 'USD', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260406021Y',
    date: '2026-04-06',
    buyer: 'Mediluxe Health Solutions FZE',
    currency: 'EUR',
    rateToUSD: 1.08,
    subtotal: 48750.00,
    discountAmount: 0,
    shippingAmount: 450.00,
    grandTotal: 49200.00,
    grandTotalUSD: 53136.00,
    items: [
      { name: 'Tirzepatide Bulk API', quantityGrams: 250, unitPrice: 105.00, lineTotal: 26250.00, currency: 'EUR', category: 'api_raw_materials' },
      { name: 'Retatrutide Bulk API', quantityGrams: 100, unitPrice: 225.00, lineTotal: 22500.00, currency: 'EUR', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 450.00, lineTotal: 450.00, currency: 'EUR', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260309021Y',
    date: '2026-03-09',
    buyer: 'Mediluxe Health Solutions FZE',
    currency: 'EUR',
    rateToUSD: 1.08,
    subtotal: 47200.00,
    discountAmount: 0,
    shippingAmount: 800.00,
    grandTotal: 48000.00,
    grandTotalUSD: 51840.00,
    items: [
      { name: 'Tirzepatide Bulk API', quantityGrams: 400, unitPrice: 118.00, lineTotal: 47200.00, currency: 'EUR', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 800.00, lineTotal: 800.00, currency: 'EUR', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260224021Y',
    date: '2026-02-24',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 96395.00,
    discountAmount: 0,
    shippingAmount: 650.00,
    grandTotal: 97045.00,
    grandTotalUSD: 97045.00,
    items: [
      { name: 'Thymosin Alpha-1', quantityGrams: 10, unitPrice: 1470.00, lineTotal: 14700.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'HCG (Human Chorionic Gonadotropin)', quantityGrams: 1, unitPrice: 17850.00, lineTotal: 17850.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Humanin', quantityGrams: 2, unitPrice: 3453.19, lineTotal: 6906.38, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Ipamorelin', quantityGrams: 20, unitPrice: 338.63, lineTotal: 6772.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'MGF', quantityGrams: 2, unitPrice: 2551.50, lineTotal: 5103.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'TB-500 (Thymosin Beta-4)', quantityGrams: 10, unitPrice: 1607.29, lineTotal: 16072.88, currency: 'USD', category: 'api_raw_materials' },
      { name: 'AOD-9604', quantityGrams: 5, unitPrice: 1475.52, lineTotal: 7377.60, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Sermorelin', quantityGrams: 10, unitPrice: 1318.81, lineTotal: 13188.13, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Kisspeptin-10', quantityGrams: 5, unitPrice: 750.00, lineTotal: 3750.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Dihexa', quantityGrams: 10, unitPrice: 254.80, lineTotal: 2548.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'KPV', quantityGrams: 2, unitPrice: 604.70, lineTotal: 1209.40, currency: 'USD', category: 'api_raw_materials' },
      { name: 'PT-141 (Bremelanotide)', quantityGrams: 2, unitPrice: 707.30, lineTotal: 1414.60, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 650.00, lineTotal: 650.00, currency: 'USD', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260204022Y',
    date: '2026-02-04',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 137450.00,
    discountAmount: 0,
    shippingAmount: 800.00,
    grandTotal: 138250.00,
    grandTotalUSD: 138250.00,
    items: [
      { name: 'Semax', quantityGrams: 10, unitPrice: 550.00, lineTotal: 5500.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Selank', quantityGrams: 10, unitPrice: 550.00, lineTotal: 5500.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Epithalon', quantityGrams: 10, unitPrice: 350.00, lineTotal: 3500.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'BPC-157', quantityGrams: 20, unitPrice: 600.00, lineTotal: 12000.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Tirzepatide Bulk API', quantityGrams: 250, unitPrice: 440.00, lineTotal: 110000.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 800.00, lineTotal: 800.00, currency: 'USD', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20260124018Y',
    date: '2026-01-24',
    buyer: 'Mediluxe Health Solutions FZE',
    currency: 'EUR',
    rateToUSD: 1.08,
    subtotal: 7400.00,
    discountAmount: 0,
    shippingAmount: 93.04,
    grandTotal: 7493.04,
    grandTotalUSD: 8092.48,
    items: [
      { name: 'Semaglutide Bulk API', quantityGrams: 100, unitPrice: 74.00, lineTotal: 7400.00, currency: 'EUR', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 93.04, lineTotal: 93.04, currency: 'EUR', category: 'shipping' }
    ]
  },
  {
    invoiceNumber: 'MY20251230039Y',
    date: '2025-12-30',
    buyer: 'Magenta Pharma Medicine Trading LLC',
    currency: 'USD',
    rateToUSD: 1.0,
    subtotal: 132470.85,
    discountAmount: 0,
    shippingAmount: 720.00,
    grandTotal: 133190.85,
    grandTotalUSD: 133190.85,
    items: [
      { name: 'Tesamorelin', quantityGrams: 25, unitPrice: 2114.10, lineTotal: 52852.50, currency: 'USD', category: 'api_raw_materials' },
      { name: 'MOTS-c', quantityGrams: 20, unitPrice: 808.77, lineTotal: 16175.40, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Tirzepatide Bulk API', quantityGrams: 140, unitPrice: 450.00, lineTotal: 63000.00, currency: 'USD', category: 'api_raw_materials' },
      { name: 'Shipping Express', quantityGrams: 0, unitPrice: 720.00, lineTotal: 720.00, currency: 'USD', category: 'shipping' }
    ]
  }
];

// Active Principle clinical metadata map (Therapeutic class, CAS, grade)
export const API_CLINICAL_MAP = {
  'Tirzepatide Bulk API': { class: 'Metabolic & GLP-1 / GIP Dual Agonist', cas: '2023788-19-2', grade: '≥99.5% HPLC / cGMP' },
  'Retatrutide Bulk API': { class: 'Metabolic & Triple G Agonist', cas: '2381089-83-2', grade: '≥99.0% HPLC' },
  'Semaglutide Bulk API': { class: 'Metabolic & GLP-1 Agonist', cas: '910463-68-2', grade: '≥99.0% HPLC / Ph.Eur.' },
  'Enclomiphene': { class: 'Endocrinology / SERM (LH/FSH Elevation)', cas: '15690-57-0', grade: 'USP / cGMP Micronized' },
  'VIP (Vasoactive Intestinal Peptide)': { class: 'Immune & CIRS / Neuro-Endocrine', cas: '40077-57-4', grade: '≥99.0% HPLC' },
  '5-Amino-1MQ': { class: 'Metabolic & NNMT Inhibitor', cas: '42464-96-0', grade: '≥98.5% Analytical Grade' },
  'BPC-157': { class: 'Tissue Repair & Healing', cas: '137525-51-0', grade: '≥99.0% HPLC' },
  'TB-500 (Thymosin Beta-4)': { class: 'Tissue Repair & Cellular Migration', cas: '77591-33-4', grade: '≥99.0% HPLC' },
  'Epithalon': { class: 'Longevity & Telomerase Activator', cas: '307297-39-8', grade: '≥99.0% HPLC' },
  'Semax': { class: 'Neuro-Cognitive & Nootropic', cas: '80714-61-0', grade: '≥99.0% HPLC' },
  'Selank': { class: 'Neuro-Cognitive & Anxiolytic', cas: '129954-34-3', grade: '≥99.0% HPLC' },
  'Tesamorelin': { class: 'GH Secretagogue & Visceral Fat', cas: '218949-48-5', grade: '≥99.0% HPLC' },
  'MOTS-c': { class: 'Mitochondrial-Derived Peptide (MDP)', cas: '1627580-64-6', grade: '≥99.0% HPLC' },
  'IGF-1 LR3': { class: 'Muscle Regeneration & Hypertrophy', cas: '949837-92-9', grade: '≥95.0% Biological Activity' },
  'CJC-1295 (without DAC)': { class: 'GH Secretagogue / GHRH', cas: '863288-34-0', grade: '≥99.0% HPLC' },
  'Thymosin Alpha-1': { class: 'Immune Restoration & Modulation', cas: '62304-98-7', grade: '≥99.0% HPLC' },
  'HCG (Human Chorionic Gonadotropin)': { class: 'Endocrinology & Gonadal Axis Support', cas: '9002-61-3', grade: 'USP Native Biological' },
  'Humanin': { class: 'Mitochondrial Cytoprotection & Neuro', cas: '330936-69-1', grade: '≥99.0% HPLC' },
  'Ipamorelin': { class: 'GH Secretagogue / Ghrelin Mimetic', cas: '170851-70-4', grade: '≥99.0% HPLC' },
  'MGF': { class: 'Tissue Healing & Myogenesis', cas: '1202044-24-9', grade: '≥99.0% HPLC' },
  'AOD-9604': { class: 'Lipolytic Fragment (hGH 177-191)', cas: '221231-10-3', grade: '≥99.0% HPLC' },
  'Sermorelin': { class: 'Growth Hormone Releasing Factor', cas: '86168-78-7', grade: '≥99.0% HPLC' },
  'Kisspeptin-10': { class: 'Gonadotropin Releasing Hormone Stimulator', cas: '374675-21-5', grade: '≥99.0% HPLC' },
  'Dihexa': { class: 'Neurogenic & HGF/c-Met Activator', cas: '1401708-83-5', grade: '≥98.0% HPLC' },
  'KPV': { class: 'Anti-Inflammatory & Mucosal Barrier', cas: '67727-97-3', grade: '≥99.0% HPLC' },
  'PT-141 (Bremelanotide)': { class: 'Melanocortin Receptor Agonist', cas: '189691-06-3', grade: '≥99.0% HPLC' },
  'DSIP (Delta Sleep-Inducing Peptide)': { class: 'Sleep Architecture & Neuromodulation', cas: '62568-57-4', grade: '≥99.0% HPLC' },
  'Cartalax': { class: 'Cartilage & Joint Bioregulator', cas: '161040-51-1', grade: '≥99.0% Peptide Bioregulator' },
  'Thymogen (Glu-Trp)': { class: 'Thymic Immune Bioregulator', cas: '118428-85-6', grade: '≥99.0% Peptide Bioregulator' },
  'Prostamax': { class: 'Prostate Bioregulator', cas: '210827-83-1', grade: '≥99.0% Peptide Bioregulator' },
  'Testagen': { class: 'Testicular Bioregulator', cas: '210827-84-2', grade: '≥99.0% Peptide Bioregulator' },
  'Cagrilintide': { class: 'Amylin Analogue / Dual Metabolic', cas: '1415456-99-3', grade: '≥99.0% HPLC' },
  'HMG': { class: 'Menopausal Gonadotropin (FSH/LH)', cas: '61489-71-2', grade: 'Biological Active' },
  'MK-677 (Ibutamoren)': { class: 'Oral GH Secretagogue', cas: '159752-10-0', grade: '≥99.0% HPLC' },
  'GW-501516 (Cardarine)': { class: 'PPARδ Agonist / Endurance', cas: '317318-70-0', grade: '≥99.0% HPLC' },
  'ARA-290 (Cibinetide)': { class: 'Innate Repair Receptor (IRR) Agonist', cas: '1208770-90-0', grade: '≥99.0% HPLC' },
  'Cardiogen': { class: 'Cardiovascular Bioregulator', cas: '210827-82-0', grade: '≥99.0% Peptide Bioregulator' },
  'Melanotan II (MT-2)': { class: 'Melanocortin Agonist', cas: '121062-08-6', grade: '≥99.0% HPLC' },
  'Pinealon': { class: 'Brain & Pineal Bioregulator', cas: '161040-52-2', grade: '≥99.0% Peptide Bioregulator' },
  'PE-22-28': { class: 'TREK-1 Inhibitor / Neurogenesis', cas: '1628328-97-3', grade: '≥99.0% HPLC' },
  'PEG-MGF': { class: 'Pegylated Mechano Growth Factor', cas: 'N/A', grade: '≥98.0% HPLC' },
  'SNAP-8': { class: 'Octapeptide / Cosmeceutical Neuro-Inhibitor', cas: '868844-74-0', grade: '≥99.0% HPLC' },
  'Thymulin': { class: 'Zinc-Dependent Thymic Hormone', cas: '63958-90-7', grade: '≥98.5% HPLC' }
};

/**
 * Builds the consolidated procurement dataset for Lotusland
 */
export function getLotuslandProcurementReport() {
  const apisMap = new Map();
  const allLines = [];

  let grandTotalSpendUSD = 0;
  let grandTotalGrams = 0;

  LOTUSLAND_INVOICES_REGISTRY.forEach(inv => {
    grandTotalSpendUSD += inv.grandTotalUSD;

    inv.items.forEach(item => {
      if (item.category !== 'api_raw_materials' || item.quantityGrams <= 0) return;

      const rate = inv.rateToUSD || 1.0;
      const lineTotalUSD = item.lineTotal * rate;
      const unitCostUSD = item.unitPrice * rate;

      grandTotalGrams += item.quantityGrams;

      allLines.push({
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.date,
        buyer: inv.buyer,
        apiName: item.name,
        quantityGrams: item.quantityGrams,
        unitCostUSD: unitCostUSD,
        originalUnitPrice: item.unitPrice,
        originalCurrency: item.currency,
        lineTotalUSD: lineTotalUSD,
        lineTotalOriginal: item.lineTotal
      });

      if (!apisMap.has(item.name)) {
        const clin = API_CLINICAL_MAP[item.name] || { class: 'Specialized Bioactive API', cas: 'N/A', grade: '≥99.0% HPLC' };
        apisMap.set(item.name, {
          name: item.name,
          therapeuticClass: clin.class,
          casNumber: clin.cas,
          grade: clin.grade,
          totalGrams: 0,
          totalSpendUSD: 0,
          invoices: [],
          dates: [],
          rates: []
        });
      }

      const entry = apisMap.get(item.name);
      entry.totalGrams += item.quantityGrams;
      entry.totalSpendUSD += lineTotalUSD;
      entry.dates.push(inv.date);
      entry.rates.push(unitCostUSD);
      entry.invoices.push({
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        quantityGrams: item.quantityGrams,
        unitCostUSD,
        lineTotalUSD,
        originalCurrency: item.currency,
        originalUnitPrice: item.unitPrice,
        buyer: inv.buyer
      });
    });
  });

  const apisList = Array.from(apisMap.values()).map(api => {
    // Sort dates
    api.dates.sort();
    const firstDate = api.dates[0];
    const latestDate = api.dates[api.dates.length - 1];

    // Costs
    const weightedAvgCost = api.totalGrams > 0 ? (api.totalSpendUSD / api.totalGrams) : 0;
    const latestCost = api.rates[api.rates.length - 1] || weightedAvgCost;
    const lowestCost = Math.min(...api.rates);
    const highestCost = Math.max(...api.rates);

    // Wholesale Compounding Catalog Price (+15% standard margin)
    const catalogPrice = Number((latestCost * 1.15).toFixed(2));
    const marginUSD = Number((catalogPrice - weightedAvgCost).toFixed(2));
    const marginPercent = catalogPrice > 0 ? Number(((marginUSD / catalogPrice) * 100).toFixed(1)) : 15.0;

    const invoiceRefs = Array.from(new Set(api.invoices.map(i => i.invoiceNumber)));

    return {
      name: api.name,
      therapeuticClass: api.therapeuticClass,
      casNumber: api.casNumber,
      grade: api.grade,
      totalGrams: Number(api.totalGrams.toFixed(2)),
      totalSpendUSD: Number(api.totalSpendUSD.toFixed(2)),
      weightedAvgCost: Number(weightedAvgCost.toFixed(2)),
      latestCost: Number(latestCost.toFixed(2)),
      lowestCost: Number(lowestCost.toFixed(2)),
      highestCost: Number(highestCost.toFixed(2)),
      catalogPrice,
      marginUSD,
      marginPercent,
      invoiceCount: invoiceRefs.length,
      invoiceRefs,
      firstDate,
      latestDate,
      receipts: api.invoices
    };
  });

  // Sort by total spend descending
  apisList.sort((a, b) => b.totalSpendUSD - a.totalSpendUSD);

  return {
    metadata: LOTUSLAND_METADATA,
    summary: {
      totalSpendUSD: Number(grandTotalSpendUSD.toFixed(2)),
      totalGramsProcured: Number(grandTotalGrams.toFixed(2)),
      uniqueApisCount: apisList.length,
      totalInvoicesCount: LOTUSLAND_INVOICES_REGISTRY.length,
      firstInvoiceDate: '2025-12-30',
      latestInvoiceDate: '2026-05-19',
      dateRange: 'Dec 30, 2025 – May 19, 2026'
    },
    apis: apisList,
    invoices: LOTUSLAND_INVOICES_REGISTRY,
    allLineItems: allLines
  };
}
