import { readFileSync } from 'fs';

const nplab = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));
const mapping = JSON.parse(readFileSync('./scratch/lotusland_mapping.json', 'utf8'));
const lotusKeys = Object.keys(mapping);

function cleanName(name) {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[0-9]+\s*(MG|MCG|IU|G|ML|%)/gi, '') // remove dosages
    .replace(/\b(VIAL|TABLET|CAPSULE|CREAM|GEL|PELLET|PUMP|SPRAY|IV|BOTTLE|KIT|AMP|AMPS|SINGLE|PACK|PCS|PIECES|HRT BASE|LIPOSOMAL BASE)\b/gi, '') // remove formats/bases
    .replace(/[^A-Z0-9+\s/()]/g, '') // remove special chars except +, /, (), spaces
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Testing matching on Peptides...');
const peptides = nplab.filter(p => p.category === 'Peptides');
let matchedCount = 0;

peptides.forEach(p => {
  const origName = p.name;
  const cleaned = cleanName(origName);
  
  // Try exact match on cleaned name
  let matchedKey = lotusKeys.find(k => k === cleaned);
  
  // Try normalized aliases/variations
  if (!matchedKey) {
    // e.g. "CJC 1295 NO DAC" -> "CJC-1295 WITHOUT DAC"
    let modCleaned = cleaned
      .replace(/NO DAC/g, 'WITHOUT DAC')
      .replace(/WITH DAC/g, 'WITH DAC')
      .replace(/CJC 1295/g, 'CJC-1295')
      .replace(/TB 500/g, 'TB-500')
      .replace(/BPC 157/g, 'BPC-157')
      .replace(/\//g, '_')
      .replace(/\s*\+\s*/g, ' + ')
      .trim();
      
    matchedKey = lotusKeys.find(k => {
      const kNorm = k.replace(/[^A-Z0-9]/g, '');
      const mNorm = modCleaned.replace(/[^A-Z0-9]/g, '');
      return kNorm === mNorm || k.includes(modCleaned) || modCleaned.includes(k);
    });
  }
  
  if (matchedKey) {
    matchedCount++;
    console.log(`✅ MATCH: "${origName}" -> Cleaned: "${cleaned}" -> Target: "${matchedKey}"`);
  } else {
    console.log(`❌ NO MATCH: "${origName}" -> Cleaned: "${cleaned}"`);
  }
});

console.log(`Matched: ${matchedCount} / ${peptides.length}`);
process.exit(0);
