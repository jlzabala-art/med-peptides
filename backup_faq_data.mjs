import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ⚠️ CANONICAL PROJECT: med-peptides-app — NEVER change to regenpept-web-app
const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupDir = join(__dirname, 'faq_backups');
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

async function backup() {
  console.log("Starting backup and audit...");
  
  // 1. Fetch FAQs
  const faqSnap = await getDocs(collection(db, 'peptide_faq'));
  const faqs = faqSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
  writeFileSync(join(backupDir, 'faq_backup.json'), JSON.stringify(faqs, null, 2));
  console.log(`Saved ${faqs.length} FAQs to backup.`);

  // 2. Fetch FAQ mappings
  const mappingSnap = await getDocs(collection(db, 'faq_peptide_mapping'));
  const mappings = mappingSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
  writeFileSync(join(backupDir, 'faq_peptide_mapping_backup.json'), JSON.stringify(mappings, null, 2));
  console.log(`Saved ${mappings.length} FAQ Mappings to backup.`);
  
  // 3. Fetch products
  const productsSnap = await getDocs(collection(db, 'products'));
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
