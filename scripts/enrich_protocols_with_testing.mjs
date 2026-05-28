import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROTO_DIR = join(ROOT, 'export', 'protocols');

const files = readdirSync(PROTO_DIR).filter(
  f => f.endsWith('.json') && !f.includes('bundle')
);

console.log(`Enriching ${files.length} protocols...`);

let modified = 0;

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const protocol = JSON.parse(readFileSync(filePath, 'utf8'));
  const id = protocol.protocol_id || protocol.id;

  if (!id) {
    console.warn(`Skipping ${file}: no ID`);
    continue;
  }

  let tests = [];
  if (id.startsWith('lon_')) {
    tests = ['eterna-epigenetic-test', 'progen-longevity-test', 'fagron-telotest', 'nad-blood-test'];
  } else if (id.startsWith('horm_')) {
    tests = ['testosterone-blood-test', 'fagron-trichotest'];
  } else if (id.startsWith('wm_') || id.startsWith('met_')) {
    tests = ['fagron-nutrigen', '24-genomics-nutrigen', 'nad-blood-test'];
  } else if (id.startsWith('skin_') || id.startsWith('sa_')) {
    tests = ['fagron-acnetest'];
  } else if (id.startsWith('sleep_') || id.startsWith('cog_')) {
    tests = ['cortisol-blood-test'];
  } else if (id.startsWith('rec_')) {
    tests = ['fagron-trichotest', 'fagron-acnetest'];
  }

  if (tests.length > 0) {
    protocol.recommended_tests = tests;
    writeFileSync(filePath, JSON.stringify(protocol, null, 2), 'utf8');
    console.log(`  Enriched ${id} with ${tests.join(', ')}`);
    modified++;
  }
}

console.log(`Enriched ${modified} files successfully.`);
