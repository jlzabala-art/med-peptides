const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const crypto = require('crypto');

// Inicializar Firebase
let serviceAccount;
try {
  const accountPath = path.join(__dirname, 'serviceAccount.json');
  if (fs.existsSync(accountPath)) {
    serviceAccount = require(accountPath);
  }
} catch (e) {
  console.warn('No serviceAccount.json found. Using default ADC.');
}

if (!global.firebaseApp) {
  const config = serviceAccount ? { credential: cert(serviceAccount) } : {};
  global.firebaseApp = initializeApp(config);
}

const db = getFirestore();

function generatePatientId(name) {
  // Hash short and deterministic based on name
  return 'pt_' + crypto.createHash('md5').update(name.toLowerCase().trim()).digest('hex').substring(0, 12);
}

function cleanPatientName(rawName) {
  if (!rawName) return '';
  return rawName.replace(/PRES #\d+/g, '').trim();
}

async function runImport() {
  const csvPath = path.join(__dirname, '../AI Prompts/PharmaPolis - PharmaPolis.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  const parsed = Papa.parse(csvContent, {
    skipEmptyLines: true,
  });

  // Saltar las primeras 2 filas de headers (índices 0 y 1)
  const rows = parsed.data.slice(2);
  
  const batch = db.batch();
  const patientsMap = new Map();
  let orderCount = 0;

  for (const row of rows) {
    if (row.length < 10) continue; // Saltar filas vacías
    
    const rawPatientName = row[1];
    if (!rawPatientName || rawPatientName.trim() === '') continue;

    const patientName = cleanPatientName(rawPatientName);
    const country = row[2] || '';
    
    const pId = generatePatientId(patientName);
    
    // Preparar el paciente
    if (!patientsMap.has(pId)) {
      patientsMap.set(pId, {
        name: patientName,
        country: country,
        role: 'patient',
        status: 'active',
        assignedManagerName: 'Kasia',
        defaultSupplier: 'PharmaPolis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Preparar la orden / prescripción
    // 5: SIGNED PRESCRIPTION, 6: NOTES, 7: ITEMS, 8: PROD STATUS, 9: SHIP STATUS, 10: PRICE, 11: INV, 12: BILL STATUS, 13: FINAL STATUS
    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, {
      patientId: pId,
      patientName: patientName,
      supplier: 'PharmaPolis',
      prescriptionDocLink: row[5] || '',
      notes: row[6] || '',
      itemCount: row[7] || '',
      shippingStatus: row[9] || '',
      price: row[10] || '',
      billingStatus: row[12] || '',
      finalStatus: row[13] || '',
      importedFrom: 'Pharmapolis_CSV',
      createdAt: new Date().toISOString(),
    });
    orderCount++;
  }

  // Añadir pacientes al batch
  for (const [id, data] of patientsMap.entries()) {
    const docRef = db.collection('users').doc(id);
    batch.set(docRef, data, { merge: true }); // Merge para no machacar si ya existe
  }

  console.log(`Guardando ${patientsMap.size} pacientes únicos y ${orderCount} registros históricos...`);
  await batch.commit();
  console.log('Importación completada.');
}

runImport().catch(console.error);
