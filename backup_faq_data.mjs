import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './scripts/lib/firebase-admin.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupDir = join(__dirname, 'faq_backups');
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

async function backup() {
  console.log("Starting backup and audit...");
  
  // 1. Fetch FAQs
  const faqSnap = await db.collection('peptide_faq').get();
  const faqs = faqSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
  writeFileSync(join(backupDir, 'faq_backup.json'), JSON.stringify(faqs, null, 2));
  console.log(`Saved ${faqs.length} FAQs to backup.`);

  // 2. Fetch FAQ mappings
  const mappingSnap = await db.collection('faq_peptide_mapping').get();
  const mappings = mappingSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
  writeFileSync(join(backupDir, 'faq_peptide_mapping_backup.json'), JSON.stringify(mappings, null, 2));
  console.log(`Saved ${mappings.length} FAQ Mappings to backup.`);
  
  // 3. Fetch products
  const productsSnap = await db.collection('products').get();
  const products = productsSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
  writeFileSync(join(backupDir, 'products_backup.json'), JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} Products to backup.`);

  console.log("\n--- Local Backup Complete ---");
  process.exit(0);
}

backup().catch(err => {
  console.error(err);
  process.exit(1);
});

