import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function run() {
  console.log('====================================================');
  console.log('AUDIT: TELETEST ANALYTIKA IN ATLAS / FIRESTORE');
  console.log('====================================================\n');

  // 1. Check Supplier
  console.log('--- 1. SUPPLIER RECORD ---');
  const supplierSnap = await db.collection('suppliers').doc('supplier-teletest').get();
  if (supplierSnap.exists) {
    console.log('FOUND supplier-teletest:', JSON.stringify(supplierSnap.data(), null, 2));
  } else {
    console.log('supplier-teletest NOT FOUND in suppliers collection!');
  }

  // Also search all suppliers for teletest
  const allSuppliers = await db.collection('suppliers').get();
  allSuppliers.forEach(doc => {
    const d = doc.data();
    const str = (doc.id + ' ' + (d.name || '') + ' ' + (d.displayName || '')).toLowerCase();
    if (str.includes('teletest') && doc.id !== 'supplier-teletest') {
      console.log('OTHER matching supplier doc:', doc.id, d.name);
    }
  });

  // 2. Check Products
  console.log('\n--- 2. PRODUCTS IN FIRESTORE ---');
  const allProducts = await db.collection('products').get();
  const teletestProducts = [];
  const candidateProducts = [];

  const targetCodes = ['18267609', '18267615', '18267691', '18267598', '18264926'];
  const targetKeywords = ['celiaquia', 'celiac', 'autoinmunidad', 'autoimmunity', 'mineralograma', 'hair mineral', 'htma', 'omega', 'metabolizer', 'detox'];

  allProducts.forEach(doc => {
    const d = doc.data();
    const str = (doc.id + ' ' + (d.name || '') + ' ' + (d.displayName || '') + ' ' + (d.supplierId || '') + ' ' + (d.supplier || '') + ' ' + (d.testCode || '')).toLowerCase();
    
    if (d.supplierId === 'supplier-teletest' || doc.id.includes('teletest') || str.includes('teletest')) {
      teletestProducts.push({ id: doc.id, ...d });
    } else {
      // Check if it matches any target code or keyword
      for (const code of targetCodes) {
        if (str.includes(code)) {
          candidateProducts.push({ matchReason: `code ${code}`, id: doc.id, name: d.name, supplier: d.supplier || d.supplierId });
        }
      }
      for (const kw of targetKeywords) {
        if (str.includes(kw) && (d.category?.toLowerCase().includes('diag') || d.type?.toLowerCase().includes('diag') || d.subCategory)) {
          candidateProducts.push({ matchReason: `keyword ${kw}`, id: doc.id, name: d.name, supplier: d.supplier || d.supplierId });
        }
      }
    }
  });

  console.log(`Found ${teletestProducts.length} products explicitly assigned to TeleTest:`);
  teletestProducts.forEach((p, idx) => {
    console.log(`\n[Product ${idx + 1}] ID: ${p.id}`);
    console.log(`  Name: ${p.name}`);
    console.log(`  Display Name: ${p.displayName}`);
    console.log(`  Canonical Name: ${p.canonicalName}`);
    console.log(`  Test Code: ${p.testCode}`);
    console.log(`  Category: ${p.category} | Subcategory: ${p.subCategory}`);
    console.log(`  Sample Type: ${p.sampleType}`);
    console.log(`  Methodology: ${p.methodology}`);
    console.log(`  Status: ${p.status}`);
    console.log(`  Price: ${p.basePrice} ${p.currency}`);
    console.log(`  CloudStoragePath: ${p.cloudStoragePath}`);
    console.log(`  PDF URL: ${p.pdfUrl}`);
    console.log(`  Biomarkers count: ${p.biomarkers?.length || 0}`);
    console.log(`  Biomarkers:`, p.biomarkers);
    console.log(`  Variants:`, JSON.stringify(p.variants, null, 2));
    console.log(`  Has raw biomarkers details / ref ranges?:`, Boolean(p.biomarkerRanges || p.ranges || p.referenceIntervals));
  });

  console.log('\n--- 3. CANDIDATE MATCHES IN OTHER PRODUCTS ---');
  console.log(`Found ${candidateProducts.length} candidate products in catalog:`);
  candidateProducts.forEach(c => console.log(`  - [${c.matchReason}] ${c.id}: ${c.name} (${c.supplier})`));

  // 4. Check Lab Results collection
  console.log('\n--- 4. LAB RESULTS / REPORTS IN FIRESTORE ---');
  const labSnap = await db.collection('lab_results').get();
  console.log(`Total lab_results docs: ${labSnap.size}`);
  let teletestLabDocs = 0;
  labSnap.forEach(doc => {
    const d = doc.data();
    const str = JSON.stringify(d).toLowerCase();
    if (str.includes('teletest') || targetCodes.some(c => str.includes(c))) {
      teletestLabDocs++;
      console.log(`  - Lab result doc ${doc.id}: ${d.testName || d.title || d.code} (patient: ${d.patientName || d.patientId})`);
    }
  });
  console.log(`Total TeleTest lab_results: ${teletestLabDocs}`);

  // 5. Check uploaded_documents
  console.log('\n--- 5. UPLOADED DOCUMENTS IN FIRESTORE ---');
  const docsSnap = await db.collection('uploaded_documents').get();
  console.log(`Total uploaded_documents: ${docsSnap.size}`);
  docsSnap.forEach(doc => {
    const d = doc.data();
    const str = JSON.stringify(d).toLowerCase();
    if (str.includes('teletest') || targetCodes.some(c => str.includes(c))) {
      console.log(`  - Doc ${doc.id}: ${d.fileName || d.name} (type: ${d.type})`);
    }
  });

  // 6. Check demo PDF files on disk
  console.log('\n--- 6. DEMO PDF FILES ON DISK ---');
  const docsDir = path.resolve(__dirname, '../public/docs');
  function findPdfs(dir, list = []) {
    if (!fs.existsSync(dir)) return list;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        findPdfs(full, list);
      } else if (f.endsWith('.pdf')) {
        list.push(full);
      }
    }
    return list;
  }
  const allPdfs = findPdfs(docsDir);
  console.log(`Total PDFs under public/docs: ${allPdfs.length}`);
  allPdfs.forEach(p => {
    const base = path.basename(p);
    if (base.toLowerCase().includes('teletest') || targetCodes.some(c => base.includes(c))) {
      console.log(`  - ${path.relative(path.resolve(__dirname, '..'), p)} (${(fs.statSync(p).size / 1024).toFixed(1)} KB)`);
    }
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
