import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// To run this script, ensure you have FIREBASE_SERVICE_ACCOUNT defined in your environment
// or use the application default credentials.
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.warn("No FIREBASE_SERVICE_ACCOUNT in env. Assuming default credentials or emulator.");
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : undefined;

if (serviceAccount) {
  initializeApp({ credential: cert(serviceAccount) });
} else {
  initializeApp(); // Use application default credentials
}

const db = getFirestore();

import { PatientSchema } from '../src/schemas/patientSchema.zod.js';

const pharmaPolisClients = [
  { name: 'Saud Salim Almazrouei', country: 'UAE' },
  { name: 'Salauat Khissimov', country: 'UAE' },
  { name: 'Michele Carraturo', country: 'UAE' },
  { name: 'Latifa Mohamed Khadem Butti Al-hamed', country: 'UAE' },
  { name: 'Ameera Mohammed Alyafei', country: 'QATAR' },
  { name: 'Noof Salem Al-meraikhi', country: 'QATAR' },
  { name: 'Alykhan Shamji', country: 'UAE' },
  { name: 'Noura Majed Mohamed Alfuttaim', country: 'UAE' },
  { name: 'Moutaz Nezar Sleiman', country: 'UAE' },
  { name: 'Wassim Arnaout', country: 'UAE' },
  { name: 'Arshdip Singh', country: 'UAE' },
  { name: 'Lucas De Morais Arruda', country: 'UAE' },
  { name: 'Aisha Ahmad Al Derham', country: 'QATAR' },
  { name: 'Fahad Jassim Al-Theyab', country: 'QATAR' },
  { name: 'Srinivas Teelucksingh', country: 'UAE' },
  { name: 'Mark Doherty', country: 'UAE' },
  { name: 'Reem F M Alghanim', country: 'FRANCE' },
  { name: 'May Ali Khamis Almazrouei', country: 'UAE' },
  { name: 'Roukiya M M AlMurja', country: 'KUWAIT' },
  { name: 'Sara Meqbil Al Qahtani', country: 'UAE' },
  { name: 'Dara Abdul Rehman Abdullah', country: 'UAE' },
  { name: 'Hanaa Obaid Buti Almulla', country: 'UAE' },
  { name: 'Puranjay Dham Rakesh Dham', country: 'UAE' },
  { name: 'Jennifer Solo', country: 'UAE' },
  { name: 'Maryam A M Ali', country: 'KUWAIT' },
  { name: 'Waqas Bashir', country: 'UAE' },
  { name: 'Maria Cecilia Reinaldo Santos Correa', country: 'UAE' },
  { name: 'Ohood Khalfan Mohamed Khalfan Alnumai', country: 'UAE' },
  { name: 'Fatema Abdulaheed Ali Ahmed Alawadhi', country: 'UK' },
  { name: 'Ranim Habib', country: 'Spain' },
  { name: 'Saeed Habib', country: 'Spain' },
  { name: 'Shaikha Aldhaheri', country: 'UAE' },
  { name: 'Karim Fayed', country: 'UAE' },
  { name: 'Ali Ahmad Al Mawlawi', country: 'QATAR' },
  { name: 'Fatima Yousef Al-mohannadi', country: 'QATAR' },
  { name: 'Hala Falah Naser Alwasmi', country: 'SPAIN' },
  { name: 'Noor Almutawa', country: 'SPAIN' },
  { name: 'Sultan Al Maktoum', country: 'UAE' },
  { name: 'Mousa Mohammad Reza Anvar', country: 'UAE' },
  { name: 'Saeed Musallam Mefleh Khamis Almazrouei', country: 'UAE' },
  { name: 'Archana Sangaran', country: 'UAE' }
];

async function importClients() {
  console.log(`Starting strict import of ${pharmaPolisClients.length} clients...`);
  
  const batch = db.batch();
  let validCount = 0;
  let invalidCount = 0;

  for (const client of pharmaPolisClients) {
    const userId = uuidv4();
    const userRef = db.collection('users').doc(userId);
    
    const cleanName = client.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dummyEmail = `${cleanName}@pharmapolis.example.com`;

    const [firstName, ...lastNames] = client.name.split(' ');
    
    // We construct the unvalidated data
    const rawData = {
      id: userId,
      firstName: firstName || client.name,
      lastName: lastNames.join(' ') || '',
      email: dummyEmail,
      role: 'patient',
      country: client.country.toUpperCase(),
      assignedManagerId: 'tfxtg7eJKHap88NSIod2rdid5Uv2', // Kasia's ID
      defaultSupplierId: 'ddcb54e2-c002-4a45-98e1-21533ce69679', // PharmaPolis's ID
      status: 'active',
      tags: ['PharmaPolis', 'Imported'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Apply ZOD GUARDS!
    const result = PatientSchema.safeParse(rawData);

    if (result.success) {
      batch.set(userRef, result.data);
      console.log(`✅ [VALID] Prepared user: ${client.name} (${client.country})`);
      validCount++;
    } else {
      console.error(`❌ [INVALID] Skipping ${client.name}. Reason:`, result.error.issues);
      invalidCount++;
    }
  }

  if (validCount > 0) {
    await batch.commit();
    console.log(`✅ Import completed! Inserted: ${validCount}. Failed: ${invalidCount}.`);
  } else {
    console.log(`⚠️ No valid users to import. Failed: ${invalidCount}`);
  }
}

importClients().catch(console.error);
