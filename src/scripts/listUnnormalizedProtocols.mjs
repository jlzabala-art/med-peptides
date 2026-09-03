import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
  );
} catch (err) {
  console.error("❌ Failed to load serviceAccountKey.json");
  console.error(err.message);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const snap = await db.collection('protocols').get();
  const unnormalized = [];
  
  snap.forEach(docSnap => {
    const data = docSnap.data();
    
    // It is unnormalized if it lacks a BOM
    const hasValidBom = data.bom && Array.isArray(data.bom) && data.bom.length > 0 && data.bom.every(i => i.productId);
    
    if (!hasValidBom) {
      unnormalized.push({
        id: docSnap.id,
        name: data.name || data.title || 'Unnamed',
        category: data.therapeutic_category || data.category || 'N/A',
        legacyItems: data.peptides || [],
        phasesCount: (data.phases || []).length
      });
    }
  });

  const mdFile = resolve(ROOT, 'unnormalized_protocols.md');
  let mdContent = `# Protocolos No Normalizados\n\n`;
  mdContent += `Se encontraron **${unnormalized.length}** protocolos que no tienen items \`bom\` (debido a que estaban vacíos o usaban nombres de fármacos basura/inventados que no están en el catálogo).\n\n`;
  
  mdContent += `| ID | Nombre | Categoría | Items Legacy / Péptidos | Fases |\n`;
  mdContent += `|---|---|---|---|---|\n`;
  
  for (const p of unnormalized) {
    const items = p.legacyItems.length > 0 ? p.legacyItems.map(i => typeof i === 'string' ? i : JSON.stringify(i)).join(', ') : 'Ninguno';
    mdContent += `| \`${p.id}\` | ${p.name} | ${p.category} | ${items} | ${p.phasesCount} |\n`;
  }
  
  writeFileSync(mdFile, mdContent);
  console.log(`Saved report to ${mdFile}`);
  process.exit(0);
}

run().catch(console.error);
