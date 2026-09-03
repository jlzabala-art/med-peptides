/**
 * @file medicalSynonyms.js
 * @description Centralized Medical & Peptide Synonyms Dictionary for Algolia search and query expansion.
 * 
 * Provides:
 * 1. Bidirectional synonym mappings for peptide names, active APIs, and indications.
 * 2. Query expansion helper to enrich user search terms when searching the catalog or protocols.
 */

export const MEDICAL_SYNONYMS = [
  // ── Peptides & Regenerative Compounds ─────────────────────────────────────
  ['BPC-157', 'Bepermin', 'Body Protection Compound', 'PL-14736', 'Pentadecapeptide', 'BPC157'],
  ['TB-500', 'Thymosin Beta-4', 'TB4', 'Thymosin Beta 4', 'TB500', 'T-Beta-4'],
  ['GHK-Cu', 'Copper Peptide', 'Tripeptide-1 Copper', 'GHK Copper', 'Copper Tripeptide'],
  ['Semaglutide', 'Ozempic', 'Wegovy', 'Rybelsus', 'GLP-1', 'GLP1'],
  ['Tirzepatide', 'Mounjaro', 'Zepbound', 'GIP/GLP-1', 'Twincretin'],
  ['Retatrutide', 'Triple G', 'GLP-1/GIP/Glucagon', 'LY3437943'],
  ['CJC-1295', 'DAC:GRF', 'Mod GRF 1-29', 'CJC-1295 with DAC', 'CJC-1295 no DAC'],
  ['Ipamorelin', 'GHS', 'Growth Hormone Secretagogue'],
  ['Sermorelin', 'GHRH 1-29', 'Geref'],
  ['Tesamorelin', 'Egrifta', 'TH9507'],
  ['Epithalon', 'Epitalon', 'Epithalone', 'Pineal Peptide', 'Telomerase Activator'],
  ['MOTS-c', 'Mitochondrial Peptide', 'MOTSc'],
  ['Selank', 'TP-7', 'Heptapeptide Selank'],
  ['Semax', 'ACTH 4-7 PGP', 'Heptapeptide Semax'],
  ['AOD-9604', 'AOD9604', 'hGH 177-191', 'Anti-Obesity Peptide'],
  ['KPV', 'alpha-MSH 11-13', 'Tripeptide KPV', 'Anti-inflammatory Peptide'],
  ['PT-141', 'Bremelanotide', 'PT141', 'Vyleesi'],
  ['Melanotan II', 'MT-2', 'MT2', 'Melanotan 2'],
  ['DSIP', 'Delta Sleep-Inducing Peptide', 'Sleep Peptide'],
  ['NAD+', 'NAD Plus', 'Nicotinamide Adenine Dinucleotide', 'NMN'],
  ['Glutathione', 'GSH', 'Reduced Glutathione', 'L-Glutathione'],
  ['L-Carnitine', 'Injectable Carnitine', 'ALCAR', 'Acetyl-L-Carnitine'],

  // ── Fagron Formulations & Compounding APIs ────────────────────────────────
  ['TrichoSol', 'Fagron TrichoSol', 'Topical Vehicle TrichoSol'],
  ['TrichoOil', 'Fagron TrichoOil', 'Hair Complex TrichoOil'],
  ['TrichoFoam', 'Fagron TrichoFoam', 'Foam Vehicle'],
  ['Minoxidil', 'Rogaine', 'Loniten'],
  ['Latanoprost', 'Xalatan'],
  ['Finasteride', 'Propecia', 'Proscar'],
  ['Dutasteride', 'Avodart'],
  ['Spironolactone', 'Aldactone'],
  ['Biotin', 'Vitamin B7', 'Vitamin H'],
  ['Melatonin', 'Circadin'],
  ['Ketoconazole', 'Nizoral'],
  ['Caffeine', 'Anhydrous Caffeine'],

  // ── Therapeutic Indications & Clinical Goals ──────────────────────────────
  ['Weight Loss', 'Obesity', 'Fat Loss', 'Metabolic', 'Body Composition'],
  ['Longevity', 'Anti-Aging', 'Antiaging', 'Cellular Health', 'Telomere'],
  ['Recovery', 'Tissue Repair', 'Wound Healing', 'Injury Repair', 'Joint Health'],
  ['Alopecia', 'Hair Loss', 'TrichoTest', 'Hair Growth', 'Follicle'],
  ['Cognitive', 'Nootropic', 'Brain Fog', 'Neuroprotection', 'Focus'],
  ['Immunity', 'Immune Support', 'Immune Optimization', 'Thymic'],
];

/**
 * Expands a search query with associated synonyms.
 * @param {string} rawQuery 
 * @returns {string[]} List of related synonym terms
 */
export function getRelatedTerms(rawQuery = '') {
  if (!rawQuery || rawQuery.trim().length < 2) return [];
  const qLower = rawQuery.toLowerCase().trim();
  const matchedSynonyms = new Set();

  for (const group of MEDICAL_SYNONYMS) {
    const isMatch = group.some(term => term.toLowerCase().includes(qLower) || qLower.includes(term.toLowerCase()));
    if (isMatch) {
      group.forEach(term => {
        if (term.toLowerCase() !== qLower) {
          matchedSynonyms.add(term);
        }
      });
    }
  }

  return Array.from(matchedSynonyms);
}
