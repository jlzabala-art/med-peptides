import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));
const lotusMapping = JSON.parse(readFileSync('./scratch/lotusland_mapping.json', 'utf8'));
const lotusKeys = Object.keys(lotusMapping);

// Canonical goals set
const CANONICAL_GOALS = new Set([
  'cognitive_mood',
  'hormonal_optimization',
  'immune_support',
  'longevity_anti_aging',
  'metabolic_weight',
  'recovery_repair',
  'sleep_circadian'
]);

// Source goals to canonical mapping
const SOURCE_GOAL_MAP = {
  'hormone therapy': 'hormonal_optimization',
  'anti-aging': 'longevity_anti_aging',
  'hair': 'longevity_anti_aging',
  'longevity': 'longevity_anti_aging',
  'healing & recovery': 'recovery_repair',
  'vitamins & antioxidants': 'longevity_anti_aging',
  'cognitive & mood': 'cognitive_mood',
  'antioxidants': 'longevity_anti_aging',
  'supplements': 'longevity_anti_aging',
  'fertility': 'hormonal_optimization',
  'sexual health': 'hormonal_optimization',
  'weight management': 'metabolic_weight'
};

// Category mapping helper
function mapCategory(sourceCategory, matchedLotusProduct) {
  if (matchedLotusProduct && matchedLotusProduct.category) {
    return matchedLotusProduct.category;
  }
  
  switch (sourceCategory) {
    case 'BHRT':
      return 'Hormonal Support';
    case 'Hair Products':
      return 'Anti-Aging & Longevity';
    case 'Hormone Pellets':
      return 'Hormonal Support';
    case 'IV Protocols':
      return 'Healing & Recovery';
    case 'Injectables & IV':
      return 'Anti-Aging & Longevity';
    case 'Ivermectin':
      return 'Other Research Peptides';
    case 'Men\'s TRT':
      return 'Hormonal Support';
    case 'Special Products':
      return 'Other Research Peptides';
    default:
      return 'Other Research Peptides';
  }
}

// Clean name for matching lotusland
function cleanNameForLotus(name) {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[0-9]+(\.[0-9]+)?\s*(MG|MCG|IU|G|ML|%)/gi, '')
    .replace(/\b(VIAL|TABLET|CAPSULE|CREAM|GEL|PELLET|PUMP|SPRAY|IV|BOTTLE|KIT|AMP|AMPS|SINGLE|PACK|PCS|PIECES|HRT BASE|LIPOSOMAL BASE)\b/gi, '')
    .replace(/[^A-Z0-9+\s/()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findLotusMatch(name) {
  const cleaned = cleanNameForLotus(name);
  // Try exact match on cleaned name
  let matchedKey = lotusKeys.find(k => k.toUpperCase() === cleaned);
  
  if (!matchedKey) {
    let modCleaned = cleaned
      .replace(/NO DAC/g, 'WITHOUT DAC')
      .replace(/CJC 1295/g, 'CJC-1295')
      .replace(/TB 500/g, 'TB-500')
      .replace(/BPC 157/g, 'BPC-157')
      .replace(/\//g, '_')
      .replace(/\s*\+\s*/g, ' + ')
      .trim();
      
    matchedKey = lotusKeys.find(k => {
      const kNorm = k.replace(/[^A-Z0-9]/g, '').toUpperCase();
      const mNorm = modCleaned.replace(/[^A-Z0-9]/g, '').toUpperCase();
      return kNorm === mNorm || kNorm.includes(mNorm) || mNorm.includes(kNorm);
    });
  }
  
  return matchedKey ? lotusMapping[matchedKey] : null;
}

// Helper to normalize strings to slugs (lowercase, replacing spaces/special chars with underscores)
function toSlugPart(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Extract base name, strength, format, size from source item
function parseItemDetails(item) {
  const name = item.name.trim();
  const quantityStr = (item.quantity || '').trim();
  
  // Parse quantity e.g. "1 50g", "1 10ml", "1 30caps"
  let packSize = 1;
  let sizeVal = '';
  if (quantityStr) {
    const qParts = quantityStr.split(/\s+/);
    if (qParts.length >= 2) {
      packSize = parseInt(qParts[0], 10) || 1;
      sizeVal = qParts.slice(1).join(' ').trim();
    } else {
      sizeVal = qParts[0];
    }
  }

  // Parse format/route from subcategory or variants
  let format = 'vial'; // fallback
  let route = 'injectable_vial'; // fallback
  
  const subcat = (item.subcategory || '').toLowerCase();
  const variant = item.variants?.[0] || {};
  const attrFormat = (variant.attributes?.format || '').toLowerCase();
  const attrAdmin = (variant.attributes?.administration || '').toLowerCase();
  
  // Map format
  if (subcat.includes('cream') || subcat.includes('gel') || attrFormat.includes('cream') || attrFormat.includes('gel')) {
    format = 'cream';
    route = 'topical';
  } else if (subcat.includes('tablet') || attrFormat.includes('tablet')) {
    format = 'tablet';
    route = 'oral_tablet';
  } else if (subcat.includes('capsule') || attrFormat.includes('capsule')) {
    format = 'capsule';
    route = 'oral_capsule';
  } else if (subcat.includes('pellet') || attrFormat.includes('pellet')) {
    format = 'pellet';
    route = 'topical'; // subcutaneous / pellet is usually a type of implant, let's map to topical/subcutaneous route if needed
  } else if (subcat.includes('nasal') || attrFormat.includes('nasal') || name.toLowerCase().includes('nasal')) {
    format = 'nasal';
    route = 'nasal';
  } else if (subcat.includes('drops') || attrFormat.includes('drops') || name.toLowerCase().includes('drops')) {
    format = 'drops';
    route = 'oral_tablet'; // or oral/sublingual drops, let's check standard routes
  } else if (subcat.includes('vial') || attrFormat.includes('vial')) {
    format = 'vial';
    route = 'injectable_vial';
  } else if (subcat.includes('iv') || attrFormat.includes('iv') || name.toLowerCase().includes(' iv')) {
    format = 'iv';
    route = 'injectable_vial';
  }
  
  if (attrAdmin === 'topical') route = 'topical';
  if (attrAdmin === 'oral') {
    route = format === 'tablet' ? 'oral_tablet' : 'oral_capsule';
  }
  if (attrAdmin === 'nasal') route = 'nasal';
  if (attrAdmin === 'injectable' || attrAdmin === 'subcutaneous') route = 'injectable_vial';
  if (attrAdmin === 'intravenous') route = 'injectable_vial';

  // Parse base name and strength from name
  // Standard peptide names: e.g. "Sermorelin 5mg vial" -> base: "Sermorelin", strength: "5mg", format: "vial"
  // E.g. "Vitamin C 1gr — 5ml vial" -> base: "Vitamin C", strength: "1gr", size: "5ml", format: "vial"
  // E.g. "7-KETO DHEA 20MG" -> base: "7-KETO DHEA", strength: "20mg", size: "50g" (from quantity)
  
  let baseName = name;
  let strength = '';

  // Extract strength pattern like: 20MG, 0.25mg, 17.5%, 3.5gr, 1gr, 1000mcg/ml, 50iu/ml, 75IU, etc.
  const strengthRegex = /([0-9]+(?:\.[0-9]+)?\s*(?:mg\/ml|mcg\/ml|iu\/ml|%|mg|mcg|iu|gr|g|ml|iu|IU))\b/gi;
  const matches = [...name.matchAll(strengthRegex)];
  
  if (matches.length > 0) {
    // Collect all matched strengths
    strength = matches.map(m => m[1].replace(/\s+/g, '').toLowerCase()).join('_');
    
    // Remove the strengths and any trailing junk (like vial, capsule, etc. if it's at the end) from the name to get baseName
    baseName = name
      .replace(strengthRegex, '')
      .replace(/\s*[—·-]\s*.*vial/gi, '')
      .replace(/\b(vial|tablet|capsule|cream|gel|pellet|spray|nasal|drops|iv)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    // If no strength found in name, use size/quantity as strength/size
    baseName = name
      .replace(/\s*[—·-]\s*.*vial/gi, '')
      .replace(/\b(vial|tablet|capsule|cream|gel|pellet|spray|nasal|drops|iv)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Clean base name trailing hyphens, brackets
  baseName = baseName.replace(/^[-\s·()]+|[-\s·()]+$/g, '').trim();

  // If baseName is empty (rare), fallback to name
  if (!baseName) baseName = name;

  // Format strength part of ID
  let strengthPart = strength || 'default';
  
  // If we have sizeVal (like 50g, 100g) and it's different from strength (e.g. 7-KETO DHEA 20MG, size 50g),
  // include sizeVal in strengthPart to prevent ID collision.
  const normSizeVal = sizeVal.replace(/\s+/g, '').toLowerCase();
  const normStrength = strength.toLowerCase();
  if (normSizeVal && normSizeVal !== normStrength) {
    strengthPart = `${strengthPart}_${normSizeVal}`;
  }

  // Create Root ID / Slug: {SLUG_WITH_UNDERSCORES}-{STRENGTH_WITH_UNIT}-{FORMAT}
  const baseSlug = toSlugPart(baseName);
  const strengthSlug = toSlugPart(strengthPart);
  const formatSlug = toSlugPart(format);
  
  const id = `${baseSlug}-${strengthSlug}-${formatSlug}`;

  return {
    id,
    baseName,
    strength: strength || sizeVal || 'default',
    size: sizeVal || strength || 'default',
    packSize,
    format,
    route
  };
}

// Test parsing and collision checking
console.log('--- TESTING PARSER ON ALL PRODUCTS ---');
const idCollisions = {};
const results = [];

data.forEach((item, index) => {
  const parsed = parseItemDetails(item);
  results.push({ item, parsed });
  
  if (!idCollisions[parsed.id]) {
    idCollisions[parsed.id] = [];
  }
  idCollisions[parsed.id].push({ index, name: item.name, quantity: item.quantity, id: item.id });
});

console.log(`Total source products parsed: ${data.length}`);
console.log(`Total unique IDs generated: ${Object.keys(idCollisions).length}`);

const collisions = Object.entries(idCollisions).filter(([id, list]) => list.length > 1);
console.log(`\nCollisions found: ${collisions.length}`);

if (collisions.length > 0) {
  console.log('\n--- COLLISION DETAILS (First 5) ---');
  collisions.slice(0, 5).forEach(([id, list]) => {
    console.log(`Collision ID: "${id}" - matches ${list.length} source items:`);
    list.forEach(li => {
      console.log(`  - [Index: ${li.index}] ID: ${li.id} | Name: "${li.name}" | Quantity: "${li.quantity}"`);
    });
  });
}

console.log('\n--- SAMPLE EXTRACTED DETAILS (First 15) ---');
results.slice(0, 15).forEach((res, i) => {
  console.log(`\nSource Name: "${res.item.name}" | Quantity: "${res.item.quantity}"`);
  console.log(`Generated ID: "${res.parsed.id}"`);
  console.log(`Extracted  : BaseName: "${res.parsed.baseName}" | Strength: "${res.parsed.strength}" | Size: "${res.parsed.size}" | PackSize: ${res.parsed.packSize} | Format: "${res.parsed.format}" | Route: "${res.parsed.route}"`);
});

process.exit(0);
