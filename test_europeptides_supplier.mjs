import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./regenpept-firebase-adminsdk.json', 'utf8'));

if (!initializeApp.apps?.length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

async function checkSupplier() {
    const doc = await db.collection('suppliers').doc('supplier-europeptides').get();
    if (doc.exists) {
        console.log('Supplier Europeptides exists:', doc.data());
    } else {
        console.log('Supplier Europeptides DOES NOT EXIST');
    }
}

checkSupplier().catch(console.error);
