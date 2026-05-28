import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

// Copy of parser to find collisions
function toSlugPart(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function parseItemDetails(item) {
  const name = item.name.trim();
  const quantityStr = (item.quantity || '').trim();
  
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

  let format = 'vial';
  let route = 'injectable_vial';
  const subcat = (item.subcategory || '').toLowerCase();
  const variant = item.variants?.[0] || {};
  const attrFormat = (variant.attributes?.format || '').toLowerCase();
  const attrAdmin = (variant.attributes?.administration || '').toLowerCase();
  
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
    route = 'topical';
  } else if (subcat.includes('nasal') || attrFormat.includes('nasal') || name.toLowerCase().includes('nasal')) {
    format = 'nasal';
    route = 'nasal';
  } else if (subcat.includes('drops') || attrFormat.includes('drops') || name.toLowerCase().includes('drops')) {
    format = 'drops';
    route = 'oral_tablet';
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

  let baseName = name;
  let strength = '';
  const strengthRegex = /([0-9]+(?:\.[0-9]+)?\s*(?:mg\/ml|mcg\/ml|iu\/ml|%|mg|mcg|iu|gr|g|ml|iu|IU))\b/gi;
  const matches = [...name.matchAll(strengthRegex)];
  
  if (matches.length > 0) {
    strength = matches.map(m => m[1].replace(/\s+/g, '').toLowerCase()).join('_');
    baseName = name
      .replace(strengthRegex, '')
      .replace(/\s*[—·-]\s*.*vial/gi, '')
      .replace(/\b(vial|tablet|capsule|cream|gel|pellet|spray|nasal|drops|iv)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    baseName = name
      .replace(/\s*[—·-]\s*.*vial/gi, '')
      .replace(/\b(vial|tablet|capsule|cream|gel|pellet|spray|nasal|drops|iv)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  baseName = baseName.replace(/^[-\s·()]+|[-\s·()]+$/g, '').trim();
  if (!baseName) baseName = name;

  let strengthPart = strength || 'default';
  const normSizeVal = sizeVal.replace(/\s+/g, '').toLowerCase();
  const normStrength = strength.toLowerCase();
  if (normSizeVal && normSizeVal !== normStrength) {
    strengthPart = `${strengthPart}_${normSizeVal}`;
  }

  const baseSlug = toSlugPart(baseName);
  const strengthSlug = toSlugPart(strengthPart);
  const formatSlug = toSlugPart(format);
  const id = `${baseSlug}-${strengthSlug}-${formatSlug}`;

  return { id, baseName, strength, size: sizeVal, packSize, format, route };
}

const idCollisions = {};
data.forEach((item, index) => {
  const parsed = parseItemDetails(item);
  if (!idCollisions[parsed.id]) {
    idCollisions[parsed.id] = [];
  }
  idCollisions[parsed.id].push({ index, item, parsed });
});

const collisions = Object.entries(idCollisions).filter(([id, list]) => list.length > 1);
console.log(`Found ${collisions.length} collisions:`);

collisions.forEach(([id, list]) => {
  console.log(`\nCollision ID: "${id}"`);
  list.forEach(c => {
    const retailPrice = c.item.variants?.[0]?.pricing?.retail?.perUnit;
    const format = c.item.variants?.[0]?.attributes?.format;
    const admin = c.item.variants?.[0]?.attributes?.administration;
    console.log(`  Index ${c.index} | ID: ${c.item.id} | Name: "${c.item.name}" | Subcat: "${c.item.subcategory}" | Quantity: "${c.item.quantity}" | Price: ${retailPrice} EUR | format: "${format}" | admin: "${admin}"`);
  });
});
