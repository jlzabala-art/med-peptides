import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supplementsPath = join(__dirname, '../src/data/supplements.js');
const raw = readFileSync(supplementsPath, 'utf-8');

// Extract JSON array for supplements
const supplementsStartMarker = 'export const supplements =';
const startIdx = raw.indexOf(supplementsStartMarker);
if (startIdx === -1) {
  throw new Error("Could not find 'export const supplements =' in supplements.js");
}
const jsonStart = raw.indexOf('[', startIdx);
const jsonEnd = raw.lastIndexOf(']') + 1;
const supplements = JSON.parse(raw.substring(jsonStart, jsonEnd));

const supplementsV2Path = join(__dirname, '../src/data/v2/supplements.v2.json');
const supplementsV2 = JSON.parse(readFileSync(supplementsV2Path, 'utf-8'));

// Normalize helper
const normalize = (name) => name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

const v2Keys = supplementsV2.map(s => ({ original: s.name, normalized: normalize(s.name), data: s }));

console.log("=== Matching Supplements ===");
let matched = 0;
let unmatched = [];

supplements.forEach((s, idx) => {
  const normalizedName = normalize(s.name);
  
  // Prioritize exact match
  let found = v2Keys.find(vk => vk.normalized === normalizedName);
  if (!found) {
    found = v2Keys.find(vk => normalizedName.startsWith(vk.normalized) || vk.normalized.startsWith(normalizedName));
  }
  if (!found) {
    found = v2Keys.find(vk => normalizedName.includes(vk.normalized) || vk.normalized.includes(normalizedName));
  }

  if (found) {
    matched++;
  } else {
    console.log(`❌ NO MATCH: "${s.name}" (Index ${idx})`);
    unmatched.push(s.name);
  }
});

console.log(`\nMatched: ${matched}, Unmatched: ${unmatched.length}`);
