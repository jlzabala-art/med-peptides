const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const saPath = path.join(__dirname, 'serviceAccountKey.json');
let credential;
if (fs.existsSync(saPath)) {
  credential = admin.credential.cert(require(saPath));
} else {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
    rawPk = rawPk.slice(1, -1);
  }
  const formattedPk = rawPk.replace(/\\n/g, '\n');
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formattedPk,
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential });
}

const db = admin.firestore();

async function auditSupplierCurrencies() {
  console.log('🔍 Starting comprehensive audit of Supplier Native Currencies...\n');

  // 1. Fetch all suppliers
  const suppliersSnap = await db.collection('suppliers').get();
  const suppliersMap = new Map();

  suppliersSnap.docs.forEach(doc => {
    const data = doc.data();
    suppliersMap.set(doc.id, {
      id: doc.id,
      name: data.name || data.supplierName || doc.id,
      currency: data.currency || data.defaultCurrency || null,
      docData: data,
      variantsFound: []
    });
  });

  // 2. Fetch all variant sub-documents
  const variantGroup = await db.collectionGroup('variants').get();
  variantGroup.docs.forEach(doc => {
    const v = doc.data();
    const suppId = v.supplierId || v.supplier_id || v.supplier || 'unknown';
    const suppName = v.supplierName || v.supplier || 'unknown';
    
    // Find matching supplier entry
    let matchKey = null;
    for (const [key, val] of suppliersMap.entries()) {
      if (key === suppId || val.name.toLowerCase() === suppName.toLowerCase() || (suppId && suppId.includes(key.replace('supplier-', '')))) {
        matchKey = key;
        break;
      }
    }

    if (!matchKey) {
      matchKey = suppId;
      if (!suppliersMap.has(matchKey)) {
        suppliersMap.set(matchKey, {
          id: matchKey,
          name: suppName,
          currency: null,
          variantsFound: []
        });
      }
    }

    suppliersMap.get(matchKey).variantsFound.push({
      id: doc.id,
      currency: v.currency || v.origCurrency || null,
      price_eur: v.price_eur,
      price_aed: v.price_aed,
      price_usd: v.unit_price || v.price
    });
  });

  // 3. Summarize findings per supplier
  const auditReport = [];

  for (const [id, entry] of suppliersMap.entries()) {
    const currencySet = new Set();
    entry.variantsFound.forEach(v => {
      if (v.currency) currencySet.add(v.currency.toUpperCase());
    });

    const distinctCurrencies = Array.from(currencySet);
    const totalVariants = entry.variantsFound.length;

    let status = 'OK';
    let issueDescription = 'Clean native currency';

    if (distinctCurrencies.length === 0) {
      status = 'WARNING';
      issueDescription = 'No variants found or no currency defined';
    } else if (distinctCurrencies.length > 1) {
      status = 'UNCERTAIN / MIXED';
      issueDescription = `Mixed currencies found across variants: [${distinctCurrencies.join(', ')}]`;
    } else if (entry.currency && distinctCurrencies[0] && entry.currency.toUpperCase() !== distinctCurrencies[0]) {
      status = 'MISMATCH';
      issueDescription = `Supplier doc says '${entry.currency}', but variants say '${distinctCurrencies[0]}'`;
    }

    auditReport.push({
      supplierId: id,
      supplierName: entry.name,
      declaredCurrency: entry.currency || 'NOT SET',
      variantCurrencies: distinctCurrencies,
      totalVariants,
      status,
      issueDescription
    });
  }

  console.log('=== SUPPLIER CURRENCY AUDIT RESULTS ===');
  console.table(auditReport);
  console.log('\nAudit complete.');
}

auditSupplierCurrencies().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
