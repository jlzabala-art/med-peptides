const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Intentar cargar la cuenta de servicio (serviceAccount.json) si existe
let serviceAccount;
try {
  const accountPath = path.join(__dirname, 'serviceAccount.json');
  if (fs.existsSync(accountPath)) {
    serviceAccount = require(accountPath);
  }
} catch (e) {
  console.warn('No serviceAccount.json found. Make sure you are authenticated with GOOGLE_APPLICATION_CREDENTIALS or Firebase CLI.');
}

if (!global.firebaseApp) {
  const config = serviceAccount ? { credential: cert(serviceAccount) } : {};
  global.firebaseApp = initializeApp(config);
}

const db = getFirestore();

async function migratePatients() {
  console.log('Iniciando migración de pacientes (users col)...');
  const snapshot = await db.collection('users').where('role', 'in', ['patient', 'paciente']).get();
  
  if (snapshot.empty) {
    console.log('No se encontraron pacientes para migrar.');
    return;
  }
  
  console.log(`Encontrados ${snapshot.size} pacientes. Evaluando...`);
  
  let migratedCount = 0;
  const batch = db.batch();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    let needsUpdate = false;
    const updates = {};
    
    // Migrar clínica
    if (data.clinicId && (!data.clinicIds || data.clinicIds.length === 0)) {
       updates.clinicIds = [data.clinicId];
       needsUpdate = true;
    }
    
    // Migrar doctor
    if (data.doctorId && (!data.doctorIds || data.doctorIds.length === 0)) {
       updates.doctorIds = [data.doctorId];
       needsUpdate = true;
    }
    
    // Opcional: limpiar los campos viejos (comentado por seguridad, se pueden dejar como deprecated)
    // if (needsUpdate) {
    //   updates.clinicId = require('firebase-admin/firestore').FieldValue.delete();
    //   updates.doctorId = require('firebase-admin/firestore').FieldValue.delete();
    //   updates.clinic = require('firebase-admin/firestore').FieldValue.delete();
    //   updates.physician = require('firebase-admin/firestore').FieldValue.delete();
    // }
    
    if (needsUpdate) {
      console.log(`Migrando paciente ${doc.id}`);
      batch.update(doc.ref, updates);
      migratedCount++;
    }
  });
  
  if (migratedCount > 0) {
    console.log(`Ejecutando batch update para ${migratedCount} pacientes...`);
    await batch.commit();
    console.log('Migración completada con éxito.');
  } else {
    console.log('No se requirieron migraciones. Todos los pacientes están actualizados.');
  }
}

migratePatients().catch(console.error);
