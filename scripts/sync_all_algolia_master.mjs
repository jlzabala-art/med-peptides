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

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error("Missing Algolia credentials in .env.local");
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

function getTimestamp(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

async function syncUsers() {
  console.log('🔄 Syncing atlas_users...');
  const usersSnap = await db.collection('users').get();
  const records = [];

  usersSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.name || `${data.firstName || ''} ${data.lastName || ''}`).trim() || data.email || 'User';
    const roles = Array.isArray(data.roles) ? data.roles : (data.role ? [data.role] : ['user']);

    records.push({
      objectID: doc.id,
      id: doc.id,
      name,
      email: data.email || '',
      phone: data.phone || data.phoneNumber || '',
      role: data.role || roles[0] || 'user',
      roles,
      status: (data.status || 'active').toLowerCase(),
      clinicId: data.clinicId || '',
      clinicIds: data.clinicIds || (data.clinicId ? [data.clinicId] : []),
      createdAt_ts: getTimestamp(data.createdAt)
    });
  });

  if (records.length > 0) {
    await client.saveObjects({ indexName: 'atlas_users', objects: records });
    console.log(`✅ Synced ${records.length} users to atlas_users.`);

    await client.setSettings({
      indexName: 'atlas_users',
      indexSettings: {
        searchableAttributes: ['name', 'email', 'phone', 'role'],
        attributesForFaceting: ['filterOnly(roles)', 'filterOnly(role)', 'filterOnly(status)', 'filterOnly(clinicId)']
      }
    });
    console.log('⚙️ Configured settings for atlas_users.');
  }
}

async function syncPatients() {
  console.log('🔄 Syncing atlas_patients...');
  
  // Fetch from both users(role=patient) and patients collection
  const [patientUsersSnap, patientsCollSnap, prescriptionsSnap] = await Promise.all([
    db.collection('users').where('role', '==', 'patient').get(),
    db.collection('patients').get(),
    db.collection('prescriptions').get()
  ]);

  const patientMap = new Map();

  // Load from users collection
  patientUsersSnap.forEach(doc => {
    const data = doc.data();
    patientMap.set(doc.id, { id: doc.id, ...data });
  });

  // Merge or add from patients collection
  patientsCollSnap.forEach(doc => {
    const data = doc.data();
    const existing = patientMap.get(doc.id) || {};
    patientMap.set(doc.id, { ...existing, ...data, id: doc.id });
  });

  // Build prescription metadata by patient
  const rxByPatient = {};
  prescriptionsSnap.forEach(doc => {
    const d = doc.data();
    if (d.patientId) {
      if (!rxByPatient[d.patientId]) rxByPatient[d.patientId] = [];
      rxByPatient[d.patientId].push(d);
    }
  });

  const records = [];
  for (const [id, patient] of patientMap.entries()) {
    const name = (patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`).trim() || 'Patient';
    const rxList = rxByPatient[id] || [];

    const doctorIds = new Set(patient.doctorIds || []);
    if (patient.physicianId) doctorIds.add(patient.physicianId);
    if (patient.doctorId) doctorIds.add(patient.doctorId);

    const categories = new Set(patient.prescribedProductCategories || []);
    const doctorNames = new Set(patient.prescribingDoctorNames || []);

    rxList.forEach(rx => {
      if (rx.doctorId) doctorIds.add(rx.doctorId);
      if (rx.doctorName) doctorNames.add(rx.doctorName);
      if (Array.isArray(rx.items)) {
        rx.items.forEach(item => {
          if (item.category) categories.add(item.category);
        });
      }
    });

    const docIdsArray = Array.from(doctorIds);
    const primDocId = patient.physicianId || patient.doctorId || (docIdsArray[0] || '');

    records.push({
      objectID: id,
      id,
      name,
      email: patient.email || '',
      phone: patient.phone || patient.phoneNumber || '',
      status: (patient.status || 'active').toLowerCase(),
      country: patient.country || 'AE',
      physicianId: primDocId,
      doctorIds: docIdsArray,
      clinicIds: patient.clinicIds || (patient.clinicId ? [patient.clinicId] : []),
      prescribedProductCategories: Array.from(categories),
      prescribingDoctorNames: Array.from(doctorNames),
      createdAt_ts: getTimestamp(patient.createdAt),
      lastActivityDate: getTimestamp(patient.lastActivityDate || patient.updatedAt || patient.createdAt)
    });
  }

  if (records.length > 0) {
    await client.saveObjects({ indexName: 'atlas_patients', objects: records });
    console.log(`✅ Synced ${records.length} patients to atlas_patients.`);

    await client.setSettings({
      indexName: 'atlas_patients',
      indexSettings: {
        searchableAttributes: ['name', 'email', 'phone', 'prescribingDoctorNames', 'prescribedProductCategories'],
        attributesForFaceting: [
          'filterOnly(status)',
          'filterOnly(physicianId)',
          'filterOnly(doctorIds)',
          'filterOnly(clinicIds)',
          'filterOnly(country)',
          'filterOnly(prescribedProductCategories)',
          'filterOnly(prescribingDoctorNames)'
        ]
      }
    });
    console.log('⚙️ Configured settings for atlas_patients.');
  }
}

async function syncPrescriptions() {
  console.log('🔄 Syncing prescriptions...');
  const rxSnap = await db.collection('prescriptions').get();
  const records = [];

  rxSnap.forEach(doc => {
    const data = doc.data();
    const items = Array.isArray(data.items) ? data.items : [];
    const productNames = items.map(i => i.name || i.productName).filter(Boolean);

    records.push({
      objectID: doc.id,
      id: doc.id,
      code: data.code || `RX-${doc.id.slice(0, 6).toUpperCase()}`,
      patientName: data.patientName || data.patient?.name || '',
      patientId: data.patientId || '',
      doctorName: data.doctorName || data.doctor?.name || '',
      doctorId: data.doctorId || '',
      status: (data.status || 'pending').toLowerCase(),
      items: productNames,
      itemCount: items.length,
      total: Number(data.total || data.amount || 0),
      source: data.source || 'portal',
      createdAt_ts: getTimestamp(data.createdAt)
    });
  });

  if (records.length > 0) {
    await client.saveObjects({ indexName: 'prescriptions', objects: records });
    console.log(`✅ Synced ${records.length} prescriptions to prescriptions index.`);

    await client.setSettings({
      indexName: 'prescriptions',
      indexSettings: {
        searchableAttributes: ['code', 'patientName', 'doctorName', 'items'],
        attributesForFaceting: [
          'filterOnly(status)',
          'filterOnly(doctorId)',
          'filterOnly(patientId)',
          'filterOnly(source)'
        ]
      }
    });
    console.log('⚙️ Configured settings for prescriptions index.');
  }
}

async function runMasterSync() {
  console.log('\n🚀 Starting Algolia Master Index Synchronization...\n');
  try {
    await syncUsers();
    await syncPatients();
    await syncPrescriptions();
    console.log('\n🎉 Master Synchronization Complete!\n');
  } catch (err) {
    console.error('Fatal sync error:', err);
    process.exit(1);
  }
}

runMasterSync();
