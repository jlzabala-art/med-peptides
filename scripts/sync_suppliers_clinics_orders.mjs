import admin from 'firebase-admin';
import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

function getTimestamp(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

async function syncOthers() {
  // Suppliers
  console.log('Syncing suppliers...');
  const suppSnap = await db.collection('suppliers').get();
  const suppliers = [];
  suppSnap.forEach(d => {
    const data = d.data();
    suppliers.push({
      objectID: d.id,
      id: d.id,
      name: data.name || 'Supplier',
      country: data.country || '',
      status: (data.status || 'active').toLowerCase(),
      type: data.type || 'manufacturer',
      currency: data.currency || 'USD',
      itemCount: data.itemCount || 0
    });
  });
  if (suppliers.length > 0) {
    await client.saveObjects({ indexName: 'atlas_suppliers', objects: suppliers });
    console.log(`✅ Synced ${suppliers.length} suppliers.`);
  }

  // Clinics
  console.log('Syncing clinics...');
  const clinicSnap = await db.collection('clinics').get();
  const clinics = [];
  clinicSnap.forEach(d => {
    const data = d.data();
    clinics.push({
      objectID: d.id,
      id: d.id,
      name: data.name || 'Clinic',
      city: data.city || '',
      country: data.country || '',
      status: (data.status || 'active').toLowerCase()
    });
  });
  if (clinics.length > 0) {
    await client.saveObjects({ indexName: 'atlas_clinics', objects: clinics });
    console.log(`✅ Synced ${clinics.length} clinics.`);
  }

  // Orders
  console.log('Syncing orders...');
  const ordersSnap = await db.collection('orders').get();
  const orders = [];
  ordersSnap.forEach(d => {
    const data = d.data();
    orders.push({
      objectID: d.id,
      id: d.id,
      orderNumber: data.orderNumber || data.code || d.id,
      patientName: data.patientName || '',
      total: Number(data.total || data.amount || 0),
      status: (data.status || 'pending').toLowerCase(),
      createdAt_ts: getTimestamp(data.createdAt)
    });
  });
  if (orders.length > 0) {
    await client.saveObjects({ indexName: 'orders', objects: orders });
    console.log(`✅ Synced ${orders.length} orders.`);
  }
}

syncOthers();
