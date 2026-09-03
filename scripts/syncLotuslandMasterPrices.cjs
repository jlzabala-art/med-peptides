const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const saPath = path.join(__dirname, 'serviceAccountKey.json');
let credential;
if (fs.existsSync(saPath)) {
  credential = admin.credential.cert(require(saPath));
} else {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential });
}

const db = admin.firestore();

function normalise(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normaliseDose(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/\s*\/\s*/g, '/').trim();
}

async function fixLotuslandPrices() {
  const masterPath = path.join(__dirname, '../AI Prompts/LotusLand Master Price List.json');
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  console.log('📋 Loaded Master Lotusland list with', master.length, 'items');

  const masterMap = new Map();
  master.forEach(row => {
    const key = `${normalise(row.product)}|${normaliseDose(row.dosage)}`;
    masterMap.set(key, row);
  });

  const vSnap = await db.collectionGroup('variants').get();
  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of vSnap.docs) {
    const d = doc.data();
    const isLotus = (d.supplierId === 'supplier-lotusland' || d.supplier === 'LOTUSLAND' || (d.id && String(d.id).includes('lotusland')));
    if (!isLotus) continue;

    // Get parent product doc to get product name
    const parentDoc = await doc.ref.parent.parent.get();
    const prodData = parentDoc.exists ? parentDoc.data() : {};
    const prodName = prodData.canonicalName || prodData.name || d.canonicalName || d.name || '';
    const dosage = d.dosage || d.dose || '';

    const key = `${normalise(prodName)}|${normaliseDose(dosage)}`;
    let match = masterMap.get(key);

    // Fallback search by product name partial
    if (!match) {
      for (const [mKey, mRow] of masterMap.entries()) {
        const [mProd, mDose] = mKey.split('|');
        if (normalise(prodName).includes(mProd) && normaliseDose(dosage).includes(mDose)) {
          match = mRow;
          break;
        }
      }
    }

    if (match) {
      const perVial = Number(match.perVialPriceUSD);
      const perKit = Number(match.perKitPriceUSD);

      const updates = {
        unit_price: perVial,
        cost_10: perKit,
        cost_tiers: {
          cost_1: perVial,
          cost_10: perKit
        },
        updatedAt: new Date().toISOString()
      };

      await doc.ref.update(updates);
      updatedCount++;

      console.log(`✅ [${doc.id}] ${prodName} (${dosage}) → Unit (x1)=$${perVial}, Tier x10=$${perKit}`);
    } else {
      console.log(`⚠️ No master match for variant [${doc.id}]: ${prodName} (${dosage})`);
      skippedCount++;
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} Lotusland variants in Firestore with true master prices! (Skipped: ${skippedCount})`);
  process.exit(0);
}

fixLotuslandPrices().catch(err => {
  console.error('Error syncing Lotusland prices:', err);
  process.exit(1);
});
