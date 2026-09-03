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
    projectId: process.env.FIREBASE_PROJECT_ID || 'med-peptides-app',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formattedPk,
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential });
}

const db = admin.firestore();

function generateCanonicalId(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function syncAllUsage() {
  console.log('🚀 [Server Auto-Sync] Starting global synchronization across Products, Protocols, Prescriptions & Orders...');

  // 1. Fetch all products
  const productsSnap = await db.collection('products').get();
  console.log(`Loaded ${productsSnap.size} master products from Firestore.`);

  const usageMap = new Map(); // canonicalId -> { protocols: Set, prescriptions: Set, orders: Set }

  productsSnap.forEach(doc => {
    const data = doc.data();
    const cId = generateCanonicalId(data.canonicalName || data.name || doc.id);
    if (cId) {
      usageMap.set(cId, {
        productId: doc.id,
        canonicalName: data.canonicalName || data.name || doc.id,
        protocols: new Set(),
        prescriptions: new Set(),
        orders: new Set()
      });
    }
  });

  // 2. Scan Protocols
  console.log('Scanning active protocols...');
  const protocolsSnap = await db.collection('protocols').get();
  protocolsSnap.forEach(pDoc => {
    const pData = pDoc.data();
    if (pData.status && ['archived', 'draft', 'inactive'].includes(pData.status)) return;

    const protocolId = pDoc.id;
    // Extract compound names from phases/items/peptides
    const items = [];
    if (Array.isArray(pData.phases)) {
      pData.phases.forEach(ph => {
        if (Array.isArray(ph.items)) items.push(...ph.items);
      });
    }
    if (Array.isArray(pData.phase_blueprints)) {
      pData.phase_blueprints.forEach(pb => {
        const drugs = pb.drugs || pb.drugs_used || pb.items || [];
        if (Array.isArray(drugs)) items.push(...drugs);
      });
    }
    if (Array.isArray(pData.peptides)) items.push(...pData.peptides);
    if (Array.isArray(pData.peptideIds)) items.push(...pData.peptideIds);

    items.forEach(item => {
      const name = typeof item === 'string' ? item : (item.productName || item.name || item.productId || '');
      const cId = generateCanonicalId(name);
      if (cId && usageMap.has(cId)) {
        usageMap.get(cId).protocols.add(protocolId);
      } else if (cId) {
        // Fuzzy match against existing canonical keys
        for (const [key, record] of usageMap.entries()) {
          if (key.includes(cId) || cId.includes(key)) {
            record.protocols.add(protocolId);
          }
        }
      }
    });
  });

  // 3. Scan Prescriptions
  console.log('Scanning patient prescriptions...');
  const rxSnap = await db.collection('prescriptions').get();
  rxSnap.forEach(rxDoc => {
    const rxData = rxDoc.data();
    if (rxData.status && ['archived', 'draft', 'cancelled'].includes(rxData.status)) return;

    const rxId = rxDoc.id;
    const items = Array.isArray(rxData.items) ? rxData.items : (Array.isArray(rxData.products) ? rxData.products : []);

    items.forEach(item => {
      const name = typeof item === 'string' ? item : (item.productName || item.name || item.productId || '');
      const cId = generateCanonicalId(name);
      if (cId && usageMap.has(cId)) {
        usageMap.get(cId).prescriptions.add(rxId);
      } else if (cId) {
        for (const [key, record] of usageMap.entries()) {
          if (key.includes(cId) || cId.includes(key)) {
            record.prescriptions.add(rxId);
          }
        }
      }
    });
  });

  // 4. Scan Orders
  console.log('Scanning customer & clinic orders...');
  const ordersSnap = await db.collection('orders').get();
  ordersSnap.forEach(orderDoc => {
    const oData = orderDoc.data();
    const orderId = orderDoc.id;
    const items = Array.isArray(oData.items) ? oData.items : (Array.isArray(oData.line_items) ? oData.line_items : []);

    items.forEach(item => {
      const name = typeof item === 'string' ? item : (item.name || item.product_name || item.title || '');
      const cId = generateCanonicalId(name);
      if (cId && usageMap.has(cId)) {
        usageMap.get(cId).orders.add(orderId);
      } else if (cId) {
        for (const [key, record] of usageMap.entries()) {
          if (key.includes(cId) || cId.includes(key)) {
            record.orders.add(orderId);
          }
        }
      }
    });
  });

  // 5. Commit Batch Updates to Firestore product_usage collection & products collection
  console.log('Committing materialized usage views to Firestore...');
  let updatedCount = 0;
  const batch = db.batch();

  for (const [canonicalId, record] of usageMap.entries()) {
    const protocolList = Array.from(record.protocols);
    const rxList = Array.from(record.prescriptions);
    const orderList = Array.from(record.orders);

    const usageRef = db.collection('product_usage').doc(canonicalId);
    batch.set(usageRef, {
      canonicalId,
      productId: record.productId,
      canonicalName: record.canonicalName,
      protocols: protocolList,
      prescriptions: rxList,
      orders: orderList,
      protocolCount: protocolList.length,
      prescriptionCount: rxList.length,
      orderCount: orderList.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Update master product document
    const productRef = db.collection('products').doc(record.productId);
    batch.update(productRef, {
      protocolCount: protocolList.length,
      prescriptionCount: rxList.length,
      orderCount: orderList.length
    });

    updatedCount++;
  }

  await batch.commit();
  console.log(`✅ [Server Auto-Sync] Successfully synchronized ${updatedCount} products with materialized usage indexes!`);
}

syncAllUsage().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
