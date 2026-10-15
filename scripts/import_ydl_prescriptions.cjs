const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (projectId + '.firebasestorage.app') || (projectId + '.appspot.com');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket: bucketName
  });
}
const db = admin.firestore();
const bucket = admin.storage().bucket();

async function uploadPdf(localPath, destStoragePath) {
  console.log(`Uploading ${localPath} to ${destStoragePath}...`);
  const downloadToken = uuidv4();
  await bucket.upload(localPath, {
    destination: destStoragePath,
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });

  const encodedPath = encodeURIComponent(destStoragePath);
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
  console.log(`Uploaded! Public URL: ${publicUrl}`);
  return { publicUrl, storagePath: destStoragePath };
}

async function run() {
  console.log('=== STEP 1: UPSERT CLINICS & SET WHOLESELLER YDL ===');
  
  const clinicsToUpsert = [
    {
      id: 'clinic-ydl-dubai',
      name: 'York Diagnostic Laboratories DMCC (YDL)',
      legalName: 'York Diagnostic Laboratories DMCC',
      code: 'YDL',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      bigin_id: '7006116000000713027',
      website: 'https://www.ydl-me.com',
      email: 'info@ydl-me.com',
      phone: '+971 4 422 6672',
      streetAddress: 'Office No. 501 - 509 - 510, Indigo Tower, Cluster D, JLT',
      city: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      type: 'diagnostic_center',
      supervisingDoctor: 'Dr. M Jay Alkhatib',
      supervisingDoctorId: 'dr-jay-alkhatib',
      status: 'active'
    },
    {
      id: 'the-nova-clinic',
      name: 'The Nova Clinic',
      legalName: 'Bossa Nova Medical Centre L.L.C',
      code: 'NOVA',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      bigin_id: '7006116000000701185',
      website: 'https://thenovaclinic.com',
      phone: '+971 4 384 5600',
      streetAddress: 'Villa 353, Al Wasl Road, Al Safa 2',
      city: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      type: 'aesthetic_clinic',
      supervisingDoctor: 'Dr. Marina Cordeiro Fernandes',
      supervisingDoctorId: 'GdM2DcUqQNUVNJD3kGl4',
      status: 'active'
    },
    {
      id: 'shamma-clinic-novomed',
      name: 'Shamma Clinic by Novomed LLC',
      legalName: 'Shamma Clinic by Novomed LLC',
      code: 'NOVOMED',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      bigin_id: '7006116000001826002',
      website: 'https://novomed.com/',
      phone: '+971 4 349 8800',
      streetAddress: 'Street 10C, Villa 41, Jumeirah 1',
      city: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      type: 'longevity_clinic',
      supervisingDoctor: 'Dr. Çağatay Sezgin',
      supervisingDoctorId: 'z3aUIMaYsPViG1JgM95r',
      status: 'active'
    },
    {
      id: 'khalid-shukri-clinic',
      name: 'Dr. Khalid Shukri Clinic',
      code: 'SHUKRI',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      bigin_id: '7006116000001210463',
      city: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      type: 'longevity_clinic',
      supervisingDoctor: 'Dr. Khalid Shukri',
      supervisingDoctorId: 'dr-khalid-shukri',
      status: 'active'
    },
    {
      id: 'the-kairon-polyclinic',
      name: 'The Kairon Polyclinic',
      code: 'KAIRON',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      streetAddress: 'The Sustainable City / Wadi Al Safa 7',
      city: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      type: 'polyclinic',
      supervisingDoctor: 'Dr. Reem Daoud',
      supervisingDoctorId: 'dr-reem-daoud',
      status: 'active'
    },
    {
      id: 'my-skin-clinic-kuwait',
      name: 'My Skin Clinic',
      code: 'MYSKIN',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      bigin_id: '7006116000001067109',
      phone: '+965-22280804',
      city: 'Kuwait City',
      country: 'Kuwait',
      countryCode: 'KW',
      type: 'dermatology_clinic',
      supervisingDoctor: 'Dr. Fahed Abdulaziz Al Mutawah',
      supervisingDoctorId: 'dr-fahed-al-mutawah',
      status: 'active'
    }
  ];

  for (const c of clinicsToUpsert) {
    await db.collection('clinics').doc(c.id).set({
      ...c,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`Upserted clinic ${c.id} (${c.name}) with wholeseller YDL`);
  }

  // Update existing clinics to set wholeseller YDL
  const existingClinicsSnap = await db.collection('clinics').get();
  for (const doc of existingClinicsSnap.docs) {
    const data = doc.data();
    if (!data.wholeseller || data.wholeseller !== 'YDL') {
      await doc.ref.update({
        wholeseller: 'YDL',
        wholesalerId: 'clinic-ydl-dubai',
        wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated wholeseller YDL on existing clinic ${doc.id}`);
    }
  }

  console.log('=== STEP 2: UPSERT DOCTORS & SET WHOLESELLER YDL ===');
  
  // 1. Dr. M Jay Alkhatib
  await db.collection('users').doc('dr-jay-alkhatib').set({
    id: 'dr-jay-alkhatib',
    displayName: 'Dr. M Jay Alkhatib',
    name: 'Dr. M Jay Alkhatib',
    firstName: 'M Jay',
    lastName: 'Alkhatib',
    email: 'mj.alkhatib@ydl-me.com',
    secondaryEmail: 'info@ydl-me.com',
    phone: '+971 4 422 6672',
    role: 'doctor',
    specialty: 'Laboratory Medicine & Molecular Diagnostics',
    clinicId: 'clinic-ydl-dubai',
    clinicName: 'York Diagnostic Laboratories DMCC (YDL)',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
    biginContactId: '7006116000000620284',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('Upserted Dr. M Jay Alkhatib (dr-jay-alkhatib)');

  // 2. Fix Dr. Cagatay Sezgin
  await db.collection('users').doc('z3aUIMaYsPViG1JgM95r').set({
    displayName: 'Dr. Çağatay Sezgin',
    name: 'Dr. Çağatay Sezgin',
    firstName: 'Çağatay',
    lastName: 'Sezgin',
    email: 'sezgin@novomed.com',
    phone: '+97145662615',
    specialty: 'Hair Restoration Surgeon',
    clinicId: 'shamma-clinic-novomed',
    clinicName: 'Shamma Clinic by Novomed LLC',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
    role: 'doctor',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('Enriched Dr. Çağatay Sezgin (z3aUIMaYsPViG1JgM95r)');

  // 3. Dr. Marina Cordeiro Fernandes
  await db.collection('users').doc('GdM2DcUqQNUVNJD3kGl4').set({
    displayName: 'Dr. Marina Cordeiro Fernandes',
    name: 'Dr. Marina Cordeiro Fernandes',
    firstName: 'Marina',
    lastName: 'Cordeiro Fernandes',
    email: 'drmarinacordeiro@gmail.com',
    phone: '+971 50 337 3103',
    specialty: 'Aesthetic & Anti-Aging Medicine',
    clinicId: 'the-nova-clinic',
    clinicName: 'The Nova Clinic',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
    biginContactId: '7006116000000580864',
    role: 'doctor',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('Updated Dr. Marina Cordeiro Fernandes (GdM2DcUqQNUVNJD3kGl4)');

  // Delete duplicate dr_marina_generic
  const drMarinaGen = await db.collection('users').doc('dr_marina_generic').get();
  if (drMarinaGen.exists) {
    await db.collection('users').doc('dr_marina_generic').delete();
    console.log('Deleted duplicate doctor dr_marina_generic');
  }

  // 4. Dr. Khalid Shukri
  await db.collection('users').doc('dr-khalid-shukri').set({
    id: 'dr-khalid-shukri',
    displayName: 'Dr. Khalid Shukri',
    name: 'Dr. Khalid Shukri',
    firstName: 'Khalid',
    lastName: 'Shukri',
    email: 'dr.khalidshukri@example.com',
    specialty: 'Functional & Longevity Medicine',
    clinicId: 'khalid-shukri-clinic',
    clinicName: 'Dr. Khalid Shukri Clinic',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    role: 'doctor',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('Upserted Dr. Khalid Shukri (dr-khalid-shukri)');

  // 5. Dr. Reem Daoud
  await db.collection('users').doc('dr-reem-daoud').set({
    id: 'dr-reem-daoud',
    displayName: 'Dr. Reem Daoud',
    name: 'Dr. Reem Daoud',
    firstName: 'Reem',
    lastName: 'Daoud',
    email: 'reem.daoud@kairon.ae',
    specialty: 'Aesthetic Dermatology',
    clinicId: 'the-kairon-polyclinic',
    clinicName: 'The Kairon Polyclinic',
    wholeseller: 'YDL',
    wholesalerId: 'clinic-ydl-dubai',
    role: 'doctor',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('Upserted Dr. Reem Daoud (dr-reem-daoud)');

  // 6. Set wholeseller YDL on all other doctors in users collection
  const doctorsSnap = await db.collection('users').where('role', '==', 'doctor').get();
  for (const doc of doctorsSnap.docs) {
    const data = doc.data();
    if (!data.wholeseller || data.wholeseller !== 'YDL') {
      await doc.ref.update({
        wholeseller: 'YDL',
        wholesalerId: 'clinic-ydl-dubai',
        wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)'
      });
      console.log(`Set wholeseller YDL on doctor ${doc.id} (${data.displayName || data.name})`);
    }
  }

  console.log('=== STEP 3: UPLOAD 4 TRICHOTEST PDFS TO FIREBASE STORAGE ===');

  const pdfUploads = [
    {
      patientName: 'Saadat Valiyeva',
      rxId: 'RX-FAG-YDL-001',
      patientId: 'pt_saadat_valiyeva',
      localPath: '/Users/joseluiszabala/.gemini/antigravity-ide/brain/e20def65-6794-466c-9d13-20b90655beee/.user_uploaded/media_1791983406178.pdf',
      destPath: 'prescriptions/RX-FAG-YDL-001/docs/Fagron_TrichoTest_Saadat_Valiyeva.pdf',
      fileName: 'Fagron_TrichoTest_Saadat_Valiyeva.pdf',
      dob: '09-07-1986',
      gender: 'female',
      sampleCode: 'BOX02831AATRI',
      sampleId: '20621289',
      receivedDate: '30-10-2025',
      resultsDate: '17-11-2025',
      treatmentTitle: 'Minoxidil & 17-α Estradiol Scalp Regimen',
      regimenShortTitle: 'Minoxidil & 17-α Estradiol Regimen',
      parts: [
        {
          partNumber: 1,
          title: 'Topical Treatment Solution (TrichoSol™ 100 mL)',
          volume: '100 mL',
          format: 'TOPICAL SOLUTION',
          vehicle: 'TrichoSol™ Liposomal Hydrophilic Base (q.s. 100 mL)',
          posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
          apis: [
            { name: 'Minoxidil', dose: '5%', productId: 'minoxidil' },
            { name: '17-α Estradiol', dose: '0.05%' },
            { name: 'Arginine', dose: '1.5%' }
          ]
        },
        {
          partNumber: 2,
          title: 'Oral Antioxidant & Micronutrient Compound (90 Capsules)',
          volume: '90 Capsules',
          format: 'ORAL CAPSULES',
          vehicle: 'Vegetarian HPMC Capsules (90 Caps)',
          posology: '1 capsule per day, 90 capsules for 3 months',
          apis: [
            { name: 'Zinc sulfate', dose: '50 mg' },
            { name: 'Astaxanthin', dose: '10 mg' },
            { name: 'Oral Finasteride (woman)', dose: '3.5 mg' },
            { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' },
            { name: 'Zinc gluconate', dose: '150 mg' }
          ]
        },
        {
          partNumber: 3,
          title: 'Scalp Care & Lipidic Protective Oil (TrichoOil™ 30 mL)',
          volume: '30 mL',
          format: 'SCALP CARE & LIPIDIC OIL',
          vehicle: 'TrichoOil™ Natural Lipidic Carrier (q.s. 30 mL)',
          posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
          apis: [
            { name: 'Topical Saw Palmetto', dose: '1%' },
            { name: 'Ginkgo biloba', dose: '2%' },
            { name: 'Vitamin E (Tocoferol)', dose: '5%' }
          ]
        },
        {
          partNumber: 4,
          title: 'Scalp Hygiene & Conditioning Shampoo (TrichoWash™ 250 mL)',
          volume: '250 mL',
          format: 'SCALP WASH',
          vehicle: 'TrichoWash™ Non-Irritating Base (q.s. 250 mL)',
          posology: 'Massage for 2 minutes and rinse.',
          apis: [
            { name: 'Retinol palmitate', dose: '1%' }
          ]
        }
      ]
    },
    {
      patientName: 'Rouba Aref Akiki',
      rxId: 'RX-FAG-YDL-002',
      patientId: 'pt_rouba_aref_akiki',
      localPath: '/Users/joseluiszabala/.gemini/antigravity-ide/brain/e20def65-6794-466c-9d13-20b90655beee/.user_uploaded/media_1791983406238.pdf',
      destPath: 'prescriptions/RX-FAG-YDL-002/docs/Fagron_TrichoTest_Rouba_Aref_Akiki.pdf',
      fileName: 'Fagron_TrichoTest_Rouba_Aref_Akiki.pdf',
      dob: '28-08-1977',
      gender: 'female',
      sampleCode: 'BOX02598AATRI',
      sampleId: '20592249',
      receivedDate: '27-01-2025',
      resultsDate: '03-02-2025',
      treatmentTitle: 'Latanoprost & Spironolactone Scalp Regimen',
      regimenShortTitle: 'Latanoprost & Spironolactone Regimen',
      parts: [
        {
          partNumber: 1,
          title: 'Topical Treatment Solution (TrichoSol™ 100 mL)',
          volume: '100 mL',
          format: 'TOPICAL SOLUTION',
          vehicle: 'TrichoSol™ Liposomal Hydrophilic Base (q.s. 100 mL)',
          posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
          apis: [
            { name: 'Latanoprost Fagron', dose: '0.005%', productId: 'latanoprost-fagron' },
            { name: 'Spironolactone', dose: '1%' },
            { name: 'Arginine', dose: '1.5%' }
          ]
        },
        {
          partNumber: 2,
          title: 'Oral Micronutrient Complex (90 Capsules)',
          volume: '90 Capsules',
          format: 'ORAL CAPSULES',
          vehicle: 'Vegetarian HPMC Capsules (90 Caps)',
          posology: '1 capsule per day, 90 capsules for 3 months',
          apis: [
            { name: 'Zinc sulfate', dose: '50 mg' },
            { name: 'Astaxanthin', dose: '10 mg' },
            { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' },
            { name: 'Zinc gluconate', dose: '150 mg' },
            { name: 'Vitamin B9 (Folate)', dose: '4 mg' }
          ]
        },
        {
          partNumber: 3,
          title: 'Scalp Care & Lipidic Protective Oil (TrichoOil™ 30 mL)',
          volume: '30 mL',
          format: 'SCALP CARE & LIPIDIC OIL',
          vehicle: 'TrichoOil™ Natural Lipidic Carrier (q.s. 30 mL)',
          posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
          apis: [
            { name: 'Ginkgo biloba', dose: '2%' },
            { name: 'Vitamin E (Tocoferol)', dose: '5%' }
          ]
        },
        {
          partNumber: 4,
          title: 'Scalp Hygiene & Conditioning Shampoo (TrichoWash™ 250 mL)',
          volume: '250 mL',
          format: 'SCALP WASH',
          vehicle: 'TrichoWash™ Non-Irritating Base (q.s. 250 mL)',
          posology: 'Massage for 2 minutes and rinse.',
          apis: [
            { name: 'Retinol palmitate', dose: '1%' }
          ]
        }
      ]
    },
    {
      patientName: 'Menelaos Panagiotakis',
      rxId: 'RX-FAG-YDL-003',
      patientId: 'pt_menelaos_panagiotakis',
      localPath: '/Users/joseluiszabala/.gemini/antigravity-ide/brain/e20def65-6794-466c-9d13-20b90655beee/.user_uploaded/media_1791983406271.pdf',
      destPath: 'prescriptions/RX-FAG-YDL-003/docs/Fagron_TrichoTest_Menelaos_Panagiotakis.pdf',
      fileName: 'Fagron_TrichoTest_Menelaos_Panagiotakis.pdf',
      dob: '02-07-1981',
      gender: 'male',
      sampleCode: 'BOX02979AATRI',
      sampleId: '20613387',
      receivedDate: '28-07-2025',
      resultsDate: '06-08-2025',
      treatmentTitle: 'Ketoconazole & Prostaquinon™ Scalp Regimen',
      regimenShortTitle: 'Ketoconazole & Prostaquinon™ Regimen',
      parts: [
        {
          partNumber: 1,
          title: 'Topical Treatment Solution (TrichoSol™ 100 mL)',
          volume: '100 mL',
          format: 'TOPICAL SOLUTION',
          vehicle: 'TrichoSol™ Liposomal Hydrophilic Base (q.s. 100 mL)',
          posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
          apis: [
            { name: 'Ketoconazole', dose: '2%' },
            { name: 'Prostaquinon TM', dose: '3%' },
            { name: 'Spironolactone', dose: '1%' }
          ]
        },
        {
          partNumber: 2,
          title: 'Oral Hair Nutrient Matrix (90 Capsules)',
          volume: '90 Capsules',
          format: 'ORAL CAPSULES',
          vehicle: 'Vegetarian HPMC Capsules (90 Caps)',
          posology: '1 capsule per day, 90 capsules for 3 months',
          apis: [
            { name: 'Zinc sulfate', dose: '50 mg' },
            { name: 'Oral SiliciuMax TM', dose: '250 mg' },
            { name: 'Vitamin B9 (Folate)', dose: '5 mg' },
            { name: 'Zinc gluconate', dose: '150 mg' },
            { name: 'Cystine', dose: '125 mg' }
          ]
        },
        {
          partNumber: 3,
          title: 'Scalp Care & Antifungal Oil (TrichoOil™ 30 mL)',
          volume: '30 mL',
          format: 'SCALP CARE & LIPIDIC OIL',
          vehicle: 'TrichoOil™ Natural Lipidic Carrier (q.s. 30 mL)',
          posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
          apis: [
            { name: 'Clotrimazole', dose: '1%' },
            { name: 'Retinol palmitate', dose: '1%' }
          ]
        },
        {
          partNumber: 4,
          title: 'Therapeutic Scalp Cleanser (TrichoWash™ 250 mL)',
          volume: '250 mL',
          format: 'SCALP WASH',
          vehicle: 'TrichoWash™ Non-Irritating Base (q.s. 250 mL)',
          posology: 'Massage for 2 minutes and rinse.',
          apis: [
            { name: 'Cyclopirox olamine', dose: '1.5%' },
            { name: 'Vitamin E (Tocoferol)', dose: '3.5%' }
          ]
        }
      ]
    },
    {
      patientName: 'Artur Gerasimenko',
      rxId: 'RX-FAG-YDL-004',
      patientId: 'pt_artur_gerasimenko',
      localPath: '/Users/joseluiszabala/.gemini/antigravity-ide/brain/e20def65-6794-466c-9d13-20b90655beee/.user_uploaded/media_1791983406289.pdf',
      destPath: 'prescriptions/RX-FAG-YDL-004/docs/Fagron_TrichoTest_Artur_Gerasimenko.pdf',
      fileName: 'Fagron_TrichoTest_Artur_Gerasimenko.pdf',
      dob: '12-11-2000',
      gender: 'male',
      sampleCode: 'BOX00418AATRI',
      sampleId: '20536736',
      receivedDate: '29-01-2024',
      resultsDate: '07-02-2024',
      treatmentTitle: 'Latanoprost & Dutasteride Scalp Regimen',
      regimenShortTitle: 'Latanoprost & Dutasteride Regimen',
      parts: [
        {
          partNumber: 1,
          title: 'Topical Treatment Solution (TrichoSol™ 100 mL)',
          volume: '100 mL',
          format: 'TOPICAL SOLUTION',
          vehicle: 'TrichoSol™ Liposomal Hydrophilic Base (q.s. 100 mL)',
          posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
          apis: [
            { name: 'Latanoprost Fagron', dose: '0.005%', productId: 'latanoprost-fagron' },
            { name: 'Dutasteride', dose: '0.25%' }
          ]
        },
        {
          partNumber: 2,
          title: 'Oral Zinc & Selenium Antioxidant Formula (90 Capsules)',
          volume: '90 Capsules',
          format: 'ORAL CAPSULES',
          vehicle: 'Vegetarian HPMC Capsules (90 Caps)',
          posology: '1 capsule per day, 90 capsules for 3 months',
          apis: [
            { name: 'Zinc sulfate', dose: '50 mg' },
            { name: 'Selenium yeast', dose: '90 mg' },
            { name: 'Vitamin B12 (Cyanocobalamin)', dose: '1000 mcg' },
            { name: 'Zinc gluconate', dose: '150 mg' },
            { name: 'Vitamin B9 (Folate)', dose: '4 mg' }
          ]
        },
        {
          partNumber: 3,
          title: 'Scalp Care & Lipidic Conditioning Oil (TrichoOil™ 30 mL)',
          volume: '30 mL',
          format: 'SCALP CARE & LIPIDIC OIL',
          vehicle: 'TrichoOil™ Natural Lipidic Carrier (q.s. 30 mL)',
          posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
          apis: [
            { name: 'Vitamin E (Tocoferol)', dose: '5%' }
          ]
        }
      ]
    }
  ];

  console.log('=== STEP 4: CREATE PATIENTS & PRESCRIPTIONS IN FIRESTORE ===');

  for (const item of pdfUploads) {
    const uploadResult = await uploadPdf(item.localPath, item.destPath);

    // 1. Patient Document
    const patientDoc = {
      id: item.patientId,
      name: item.patientName,
      fullName: item.patientName,
      dob: item.dob,
      gender: item.gender,
      sampleCode: item.sampleCode,
      sampleId: item.sampleId,
      clinicId: 'clinic-ydl-dubai',
      clinicName: 'York Diagnostic Laboratories DMCC (YDL)',
      doctorId: 'dr-jay-alkhatib',
      doctorName: 'Dr. M Jay Alkhatib',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('patients').doc(item.patientId).set(patientDoc, { merge: true });
    console.log(`Created Patient: ${item.patientName} (${item.patientId})`);

    // 2. Prescription Document
    // Flatten all items across parts for items array
    const allItems = [];
    for (const p of item.parts) {
      for (const api of p.apis) {
        allItems.push({
          name: api.name,
          dose: api.dose,
          dosage: api.dose,
          productId: api.productId || null,
          type: 'formula_component',
          quantity: 1,
          partTitle: p.title
        });
      }
      allItems.push({
        name: p.vehicle,
        dose: p.volume,
        type: 'base_solution',
        quantity: 1,
        partTitle: p.title
      });
    }

    const rxDoc = {
      id: item.rxId,
      prescriptionNumber: item.rxId,
      patientId: item.patientId,
      patientName: item.patientName,
      patient: {
        id: item.patientId,
        name: item.patientName,
        dob: item.dob,
        gender: item.gender,
        sampleCode: item.sampleCode
      },
      doctorName: 'Dr. M Jay Alkhatib',
      doctorId: 'dr-jay-alkhatib',
      doctorEmail: 'mj.alkhatib@ydl-me.com',
      doctor: {
        id: 'dr-jay-alkhatib',
        name: 'Dr. M Jay Alkhatib',
        email: 'mj.alkhatib@ydl-me.com'
      },
      clinicId: 'clinic-ydl-dubai',
      clinicName: 'York Diagnostic Laboratories DMCC (YDL)',
      clinic: 'York Diagnostic Laboratories DMCC (YDL)',
      wholeseller: 'YDL',
      wholesalerId: 'clinic-ydl-dubai',
      wholesellerName: 'York Diagnostic Laboratories DMCC (YDL)',
      status: 'approved',
      treatmentTitle: item.treatmentTitle,
      regimenShortTitle: item.regimenShortTitle,
      regimenCategory: 'Follicular & Hair Restoration',
      regimenCategoryShort: 'Follicular',
      regimenCategoryId: 'follicular_hair',
      regimenCategoryCode: 'HAIR-RX',
      source: 'fagron_trichotest',
      sampleCode: item.sampleCode,
      totalParts: item.parts.length,
      parts: item.parts,
      items: allItems,
      dateIssued: item.resultsDate,
      dateFormatted: item.resultsDate,
      requiresColdChain: false,
      documents: [
        {
          name: item.fileName,
          url: uploadResult.publicUrl,
          storagePath: uploadResult.storagePath,
          type: 'PDF',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Dr. M Jay Alkhatib',
          analyzedByAI: true,
          appliedFields: []
        }
      ],
      timeline: [
        {
          user: 'Dr. M Jay Alkhatib / YDL Lab',
          id: `evt_init_${Date.now()}`,
          event: 'Fagron TrichoTest Clinical Report Authorized',
          description: `Pharmacogenetic report analyzed and imported for ${item.patientName}. 4 personalized formulas authorized under YDL Wholeseller.`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('prescriptions').doc(item.rxId).set(rxDoc, { merge: true });
    console.log(`Created Prescription: ${item.rxId} for ${item.patientName}`);
  }

  console.log('=== STEP 5: VERIFY COUNTS ===');
  const finalClinics = await db.collection('clinics').get();
  const finalUsers = await db.collection('users').get();
  const finalPatients = await db.collection('patients').get();
  const finalRxs = await db.collection('prescriptions').get();
  console.log(`Summary:
    Total Clinics: ${finalClinics.size}
    Total Users: ${finalUsers.size}
    Total Patients: ${finalPatients.size}
    Total Prescriptions: ${finalRxs.size}
  `);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
