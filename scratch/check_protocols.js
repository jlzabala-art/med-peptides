import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const protocolsPath = join(__dirname, '../src/data/protocolBlueprintsV2.json');
const protocols = JSON.parse(readFileSync(protocolsPath, 'utf-8'));

console.log("=== Matching Protocols ===");
let matched = 0;
let unmatched = [];

protocols.forEach(p => {
  const protocolId = p.protocol_id;
  if (!protocolId) return;

  const exportPath = join(__dirname, `../export/protocols/${protocolId}.json`);
  if (existsSync(exportPath)) {
    console.log(`✅ MATCH: "${protocolId}" matches exported file`);
    matched++;
  } else {
    console.log(`❌ NO MATCH: "${protocolId}"`);
    unmatched.push(protocolId);
  }
});

console.log(`\nMatched: ${matched}, Unmatched: ${unmatched.length}`);
console.log("Unmatched list:", unmatched);
