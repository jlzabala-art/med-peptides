import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function fixProtocolNames() {
  console.log('Fetching protocols...');
  const snapshot = await db.collection('protocols').get();
  
  let updatedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // We previously set it to "Unnamed Protocol" accidentally because we missed protocol_title.
    // If it's "Unnamed Protocol" or missing, and we have a valid name in protocol_title, update it.
    if (!data.protocol_name || data.protocol_name === 'Unnamed Protocol') {
      const possibleName = data.protocol_title || data.title || data.name || data.protocolName || data.label || 'Unnamed Protocol';
      
      if (possibleName !== 'Unnamed Protocol') {
        console.log(`Document ${doc.id} missing protocol_name. Setting to: ${possibleName}`);
        await doc.ref.update({
          protocol_name: possibleName
        });
        updatedCount++;
      }
    }
  }
  
  console.log(`Finished. Updated ${updatedCount} protocols.`);
}

fixProtocolNames().catch(console.error);
