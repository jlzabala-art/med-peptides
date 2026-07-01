import { initializeApp as initClient } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initClient(firebaseConfig);
const db = getClientFirestore(app);

async function migrateProtocolNames() {
  console.log('Starting migration of protocol names...');
  let updatedCount = 0;
  
  try {
    const querySnapshot = await getDocs(collection(db, 'protocols'));
    console.log(`Found ${querySnapshot.size} total protocols.`);
    
    for (const document of querySnapshot.docs) {
      const data = document.data();
      
      // Determine the correct name based on available fields
      let correctName = data.protocol_name;
      
      if (!correctName || correctName.trim() === '') {
        correctName = data.title || data.name || data.protocol_title || 'Unnamed Protocol';
        
        console.log(`Updating protocol ${document.id}: Setting protocol_name to "${correctName}"`);
        
        await updateDoc(doc(db, 'protocols', document.id), {
          protocol_name: correctName
        });
        
        updatedCount++;
      }
    }
    
    console.log(`Migration complete! Successfully updated ${updatedCount} protocols.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateProtocolNames();
