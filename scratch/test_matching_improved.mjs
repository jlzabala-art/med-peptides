import { readFileSync } from 'fs';

const nplab = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));
const mapping = JSON.parse(readFileSync('./scratch/lotusland_mapping.json', 'utf8'));
const lotusKeys = Object.keys(mapping);

function normalizeString(str) {
  return str
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

// Map of normalized lotus keys for fast lookup
const normalizedLotusKeys = lotusKeys.map(k => ({
  original: k,
  norm: normalizeString(k)
}));

function matchPeptide(name) {
  const upper = name.toUpperCase();

  // Check if it's a blend/composite (excluding NAD+ which is a single molecule/peptide)
  const isBlend = upper.includes('+') && !upper.includes('NAD+');

  if (isBlend) {
    // Check specific known blends
    const hasBPC = upper.includes('BPC');
    const hasTB = upper.includes('TB') || upper.includes('THYMOSIN BETA') || upper.includes('THYMOSIN B4');
    const hasGHK = upper.includes('GHK');
    const hasKPV = upper.includes('KPV');
    const hasCJC = upper.includes('CJC');
    const hasIpamorelin = upper.includes('IPAMORELIN');

    if (hasBPC && hasTB && hasGHK && hasKPV) {
      return 'KLOW (BPC-157/TB-500/GHK-CU/KPV)';
    }
    if (hasBPC && hasTB && hasGHK) {
      return 'GLOW (BPC-157/TB-500/GHK-CU)';
    }
    if (hasBPC && hasTB) {
      return 'BPC-157 + TB-500';
    }
    if (hasCJC && hasIpamorelin && !upper.includes('BPC') && !upper.includes('SERMORELIN')) {
      return 'CJC-1295 WITHOUT DAC + IPAMORELIN';
    }
    
    // Other blends do not have a canonical equivalent in Lotusland, return null
    return null;
  }

  // Single peptide mappings
  if (upper.includes('THYMOSIN BETA') || upper.includes('TB-500') || upper.includes('TB 500')) {
    return 'TB-500';
  }
  if (upper.includes('THYMOSIN ALPHA-1') || upper.includes('THYMOSIN ALPHA 1') || upper.includes('TA1')) {
    return 'THYMOSIN ALPHA 1';
  }
  if (upper.includes('THYMAGEN') || upper.includes('THYMOGEN')) {
    return 'THYMAGEN';
  }
  if (upper.includes('THYMALIN')) {
    return 'THYMULIN';
  }
  if (upper.includes('OXYTOCIN')) {
    return 'OXYTOCIN ACETATE';
  }
  if (upper.includes('GHK-CU') || upper.includes('GHK CU')) {
    return 'GHK-CU (COPPER PEPTIDE)';
  }
  if (upper.includes('FOLLISTATIN 344') || upper.includes('FOLLISTATIN-344') || upper.includes('FST-344')) {
    return 'FST-344 (FOLLISTATIN)';
  }
  if (upper.includes('SS-31') || upper.includes('ELAMIPRETIDE')) {
    return 'SS-31';
  }
  if (upper.includes('PT-141') || upper.includes('BREMELANOTIDE')) {
    return 'PT-141 (BREMELANOTIDE)';
  }
  if (upper.includes('5-AMINO-1MQ') || upper.includes('5-AMINO 1MQ') || upper.includes('5AMINO1MQ')) {
    return '5-AMINO 1 MQ';
  }
  if (upper.includes('AOD 9604') || upper.includes('AOD-9604')) {
    return 'AOD-9604';
  }
  if (upper.includes('BPC-157') || upper.includes('BPC 157') || upper.includes('BPC157')) {
    return 'BPC-157';
  }
  if (upper.includes('SLU-PP-332') || upper.includes('SLU PP-332') || upper.includes('SLUPP332')) {
    return 'SLU PP-332';
  }
  if (upper.includes('MELANOTAN II') || upper.includes('MELANOTAN 2') || upper.includes('MELANOTAN-II') || upper.includes('MELANOTAN-2') || upper.includes('MT2') || upper.includes('MT-2')) {
    return 'MT2 (MELANOTAN II)';
  }
  if (upper.includes('MELANOTAN I') || upper.includes('MELANOTAN 1') || upper.includes('MELANOTAN-I') || upper.includes('MELANOTAN-1') || upper.includes('MT1') || upper.includes('MT-1')) {
    return 'MT2 (MELANOTAN II)';
  }
  if (upper.includes('CJC 1295 DAC') || upper.includes('CJC-1295 DAC') || upper.includes('CJC-1295 WITH DAC') || upper.includes('CJC 1295 WITH DAC')) {
    return 'CJC-1295 WITH DAC';
  }
  if (upper.includes('CJC 1295 NO DAC') || upper.includes('CJC-1295 NO DAC') || upper.includes('CJC-1295 WITHOUT DAC') || upper.includes('CJC 1295 WITHOUT DAC')) {
    return 'CJC-1295 WITHOUT DAC (MODIFIED GRF 1-29)';
  }

  // Strip generic suffixes/words to clean name
  let cleanName = upper
    .replace(/[0-9]+\s*(MG|MCG|IU|G|ML|%)/gi, '') // remove dosages
    .replace(/\b(VIAL|TABLET|CAPSULE|CREAM|GEL|PELLET|PUMP|SPRAY|IV|BOTTLE|KIT|AMP|AMPS|SINGLE|PACK|PCS|PIECES|HRT BASE|LIPOSOMAL BASE|NASAL|DROPS|CAPS)\b/gi, '') // remove formats/bases
    .replace(/[^A-Z0-9+\s/()]/g, '') // remove special chars except +, /, (), spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Try normalized search
  const normClean = normalizeString(cleanName);
  let matched = normalizedLotusKeys.find(item => item.norm === normClean);
  if (matched) return matched.original;

  // Try substring checks
  matched = normalizedLotusKeys.find(item => normClean.includes(item.norm) || item.norm.includes(normClean));
  if (matched) return matched.original;

  return null;
}

console.log('Testing refined matching on Peptides...');
const peptides = nplab.filter(p => p.category === 'Peptides');
let matchedCount = 0;

peptides.forEach(p => {
  const origName = p.name;
  const target = matchPeptide(origName);
  
  if (target) {
    matchedCount++;
    console.log(`✅ MATCH: "${origName}" -> Target: "${target}"`);
  } else {
    console.log(`❌ NO MATCH (NEW PRODUCT): "${origName}"`);
  }
});

console.log(`Matched: ${matchedCount} / ${peptides.length}`);
process.exit(0);
