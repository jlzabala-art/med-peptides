import admin from 'firebase-admin';
import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function syncAdvancedPatients() {
  console.log('Fetching patients, prescriptions, and products...');
  
  const [patientsSnap, prescriptionsSnap, productsSnap] = await Promise.all([
    db.collection('users').where('role', '==', 'patient').get(),
    db.collection('prescriptions').get(),
    db.collection('products').get()
  ]);

  const patients = [];
  patientsSnap.forEach(doc => {
    patients.push({ id: doc.id, ...doc.data() });
  });

  const prescriptionsByPatient = {};
  prescriptionsSnap.forEach(doc => {
    const data = doc.data();
    if (!data.patientId) return;
    if (!prescriptionsByPatient[data.patientId]) prescriptionsByPatient[data.patientId] = [];
    prescriptionsByPatient[data.patientId].push({ id: doc.id, ...data });
  });

  const productsCache = {};
  productsSnap.forEach(doc => {
    const data = doc.data();
    productsCache[doc.id] = data;
    // Also index by name in case prescription only has name
    if (data.name) productsCache[data.name.toLowerCase()] = data;
  });

  console.log(`Found ${patients.length} patients and ${prescriptionsSnap.size} prescriptions.`);

  const algoliaRecords = patients.map(patient => {
    const patPrescriptions = prescriptionsByPatient[patient.id] || [];
    
    const productNames = new Set();
    const productCategories = new Set();
    const doctorNames = new Set();
    let lastActivity = null;

    patPrescriptions.forEach(rx => {
      // Track latest activity
      const rxDate = rx.createdAt ? (rx.createdAt.toDate ? rx.createdAt.toDate() : new Date(rx.createdAt)) : null;
      if (rxDate && (!lastActivity || rxDate > lastActivity)) {
        lastActivity = rxDate;
      }

      // Track doctors
      if (rx.doctorName) doctorNames.add(rx.doctorName);

      // Track products and categories
      if (Array.isArray(rx.items)) {
        rx.items.forEach(item => {
          if (item.productName) productNames.add(item.productName);
          
          let prod = item.productId ? productsCache[item.productId] : null;
          if (!prod && item.productName) prod = productsCache[item.productName.toLowerCase()];
          
          if (prod && prod.category) {
            productCategories.add(prod.category);
          }
        });
      }
    });

    return {
      objectID: patient.id,
      name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
      email: patient.email || '',
      country: patient.country || '',
      status: patient.status || 'Active',
      
      // Advanced Search Fields
      prescribedProductNames: Array.from(productNames),
      prescribedProductCategories: Array.from(productCategories),
      prescribingDoctorNames: Array.from(doctorNames),
      lastActivityDate: lastActivity ? lastActivity.getTime() : null,
      
      // Legacy arrays
      clinicIds: patient.clinicIds || [],
      doctorIds: patient.doctorIds || []
    };
  });

  console.log(`Saving ${algoliaRecords.length} updated patients to Algolia...`);
  
  if (algoliaRecords.length > 0) {
    try {
      await client.saveObjects({ indexName: 'atlas_patients', objects: algoliaRecords });
      console.log('Successfully updated Algolia atlas_patients index.');
      
      // Configure faceting
      await client.setSettings({
        indexName: 'atlas_patients',
        indexSettings: {
          attributesForFaceting: [
            'status',
            'country',
            'prescribedProductCategories',
            'prescribingDoctorNames'
          ]
        }
      });
      console.log('Updated index settings for faceting.');
    } catch (err) {
      console.error('Algolia save error:', err);
    }
  }
}

syncAdvancedPatients().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
