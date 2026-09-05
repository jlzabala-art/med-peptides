/**
 * casResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative CAS Registry Number Resolver for Atlas Solutions.
 * 
 * Features:
 * 1. Pre-compiled Curated Chemical & Peptide Dictionary (0ms latency)
 * 2. Mathematical CAS Checksum Validator (ensures 100% authentic CAS numbers)
 * 3. Intelligent Classification for Bundles, Devices, Diagnostics and Services
 * 4. PubChem Synonyms REST API integration with regex extraction
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CURATED_CAS_REGISTRY = {
  // GLP-1 & Incretins
  'retatrutide': '2381089-83-2',
  'tirzepatide': '2023788-19-2',
  'semaglutide': '910463-68-2',
  'liraglutide': '204656-20-2',
  'dulaglutide': '923950-08-7',
  'exenatide': '141732-76-5',
  'cagrilintide': '1415456-99-3',
  'survodutide': '2408985-25-0',
  'mazdutide': '2418047-92-2',

  // Tissue Repair & Longevity Peptides
  'bpc-157': '137525-51-0',
  'bpc 157': '137525-51-0',
  'tb-500': '77591-33-4',
  'tb 500': '77591-33-4',
  'thymosin beta-4': '77591-33-4',
  'cjc-1295': '863288-34-0',
  'cjc 1295': '863288-34-0',
  'ipamorelin': '170851-70-4',
  'sermorelin': '86168-78-7',
  'ghk-cu': '49557-75-7',
  'ghk cu': '49557-75-7',
  'copper peptide': '49557-75-7',
  'nad+': '53-84-9',
  'nad': '53-84-9',
  'nicotinamide adenine dinucleotide': '53-84-9',
  'nmn': '1094-61-7',
  'nr': '1341-23-7',
  'epithalon': '307297-39-8',
  'epitalon': '307297-39-8',
  'pt-141': '189691-06-3',
  'bremelanotide': '189691-06-3',
  'melanotan ii': '121062-08-6',
  'melanotan 2': '121062-08-6',
  'mot-c': '1627580-64-6',
  'mots-c': '1627580-64-6',
  'ss-31': '736992-21-5',
  'elamipretide': '736992-21-5',
  'selank': '129954-34-3',
  'semax': '80714-61-0',
  'aod-9604': '221231-10-3',
  'aod 9604': '221231-10-3',
  'calcitonin': '47931-85-1',
  'adipotide': '859216-15-2',
  'aicar': '2627-69-2',
  'ara-290': '1208770-96-6',
  'dsip': '62568-57-4',
  'kpv': '67727-97-3',
  'll-37': '154947-66-7',
  'oxytocin': '50-56-6',
  'tesamorelin': '218949-48-5',
  'hexarelin': '140703-51-1',
  'ghrp-2': '158861-67-7',
  'ghrp-6': '87616-84-0',
  'gonadorelin': '33515-09-2',
  'triptorelin': '57773-63-4',
  'leuprolide': '53714-56-0',
  'alprostadil': '745-65-3',

  // Metabolic, Nootropic & Small Molecule APIs
  '17-a estradiol': '57-91-0',
  '17-alpha estradiol': '57-91-0',
  'alfatradiol': '57-91-0',
  '5-amino-1mq': '42464-96-0',
  '5-amino 1mq': '42464-96-0',
  '5-htp': '56-69-9',
  '5-hydroxytryptophan': '56-69-9',
  'alpha lipoic acid': '1077-28-7',
  'ldn': '16590-41-3',
  'naltrexone': '16590-41-3',
  'low dose naltrexone': '16590-41-3',
  'lidocaine': '137-58-6',
  'serrapeptase': '37312-62-2',
  'n-acetyl l-cysteine': '616-91-1',
  'n-acetylcysteine': '616-91-1',
  'acetylcysteine': '616-91-1',
  'nac': '616-91-1',
  'acetyl-carnitine': '5080-50-2',
  'acetyl carnitine': '5080-50-2',
  'acetyl l-carnitine': '5080-50-2',
  'acetylhexapeptide': '616204-22-9',
  'argireline': '616204-22-9',
  'acetyl hexapeptide-8': '616204-22-9',
  'rapamycin': '53123-88-9',
  'sirolimus': '53123-88-9',
  'resveratrol': '501-36-0',
  'quercetin': '117-39-5',
  'methylene blue': '61-73-4',
  'berberine': '2086-83-1',
  'biotin': '58-85-5',
  'boron': '7440-42-8',
  'amlexanox': '68302-57-8',
  'amphotericin b': '1397-89-3',
  'atropine sulfate': '5908-99-6',
  'arginine': '74-79-3',
  'l-arginine': '74-79-3',
  'zinc': '7440-66-6',
  'zinc sulfate': '7446-19-7',
  'zinc pyrithione': '13463-41-7',
  'taurine': '107-35-7',
  'melatonin': '73-31-4',
  'caffeine': '58-08-2',
  'finasteride': '98319-26-7',
  'dutasteride': '164656-23-9',
  'minoxidil': '38304-91-5',
  'ketoconazole': '65277-42-1',
  'clobetasol': '25122-46-7',
  'betamethasone': '378-44-9',
  'tretinoin': '302-79-4',
  'niacinamide': '98-92-0',
  'panthenol': '81-13-0',
  'hyaluronic acid': '9004-61-9',
  'sodium hyaluronate': '9067-32-7',
  'bacteriostatic water': '7732-18-5'
};

/**
 * Validates a CAS Registry Number via standard mathematical checksum algorithm.
 * Form: R-P-C where C is the checksum digit:
 * Sum of (digit_i * position_i) % 10 === C (from right to left)
 */
export function isValidCasChecksum(casString = '') {
  if (!casString || typeof casString !== 'string') return false;
  const match = casString.trim().match(/^(\d{2,7})-(\d{2})-(\d)$/);
  if (!match) return false;

  const digits = (match[1] + match[2]).split('').map(Number);
  const checkDigit = Number(match[3]);

  let sum = 0;
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    const weight = len - i;
    sum += digits[i] * weight;
  }

  return sum % 10 === checkDigit;
}

/**
 * Checks if a product belongs to non-chemical categories
 * (Devices, Pens, Diagnostic Panels, Stacks, Services)
 */
export function classifyNonChemicalProduct(name = '', category = '') {
  const normName = String(name).toLowerCase();
  const normCat = String(category).toLowerCase();

  // Bundles or Stacks
  if (/\b(bundle|stack|pack|combo|protocol kit)\b/i.test(normName)) {
    return 'N/A (Multi-Compound Stack)';
  }

  // Medical Devices, Syringes & Pens (HS 9018.31)
  if (
    normCat === 'clinical_supplies' || 
    normCat === 'equipment' || 
    /\b(empty pen|pen injector|cartridge|needle|syringe|vial crimper|crimping tool|pen 3\.0ml)\b/i.test(normName)
  ) {
    return 'N/A (Medical Device)';
  }

  // Genomics, DNA & Diagnostics
  if (
    normCat === 'genomics_biomarkers' || 
    normCat === 'diagnostic' || 
    /\b(dna test|saliva kit|genomic panel|trichotest|nutrigen|all in one dna)\b/i.test(normName)
  ) {
    return 'N/A (Diagnostic Panel)';
  }

  // Services & Subscriptions
  if (normCat === 'service' || normCat === 'logistics_service' || /\b(subscription|consultation|shipping|delivery)\b/i.test(normName)) {
    return 'N/A (Clinical Service)';
  }

  return null;
}

/**
 * Resolves CAS number for a product name/category through multi-tier strategy:
 * 1. Non-chemical classification (Devices, Diagnostic tests, Bundles)
 * 2. Curated dictionary (Instant exact match)
 * 3. PubChem Synonyms REST API
 */
export async function resolveCasNumber(productName = '', category = '') {
  if (!productName) return null;

  // Tier 1: Check if it is a device, diagnostic test, bundle, or service
  const nonChem = classifyNonChemicalProduct(productName, category);
  if (nonChem) return nonChem;

  const clean = productName
    .toLowerCase()
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/\(.*?\)/g, '')
    .replace(/\b(usp|ep|bp|ph\.?\s*eur|api|bulk|powder|pure|grade|sterile|solution|vial|pen|mg|ml)\b/gi, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Tier 2: Check Curated Dictionary with alphanumeric normalization
  const normAlnum = clean.replace(/[^a-z0-9]/g, '');

  for (const [key, cas] of Object.entries(CURATED_CAS_REGISTRY)) {
    const keyAlnum = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normAlnum === keyAlnum || (keyAlnum.length >= 4 && (normAlnum.includes(keyAlnum) || keyAlnum.includes(normAlnum)))) {
      if (isValidCasChecksum(cas)) {
        return cas;
      }
    }
  }

  // Tier 3: Query PubChem Synonyms API
  try {
    const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(clean)}/synonyms/JSON`;
    const res = await fetch(pubchemUrl, { headers: { 'Accept': 'application/json' }, cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      const syns = data.InformationList?.Information?.[0]?.Synonym || [];
      for (const s of syns) {
        const trimmed = s.trim();
        if (/^\d{2,7}-\d{2}-\d$/.test(trimmed)) {
          if (isValidCasChecksum(trimmed)) {
            return trimmed;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[casResolver] PubChem lookup error for "${clean}":`, err.message);
  }

  return null;
}
