import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

const app = initializeApp({ credential });
const adminDb = getFirestore(app);

async function run() {
    const productsSnap = await adminDb.collection('products').get();
    let nplabsProducts = productsSnap.docs
        .map(d => ({id: d.id, ...d.data()}))
        .filter(p => {
            let isNp = false;
            if ((p.supplier || '').toLowerCase().includes('np lab')) isNp = true;
            if ((p.supplierId || '').toLowerCase().includes('np lab')) isNp = true;
            return isNp;
        });

    console.log(`NP Labs total documents: ${nplabsProducts.length}`);
    
    // Group by Canonical ID and Variant ID to find duplicates
    const byVariant = {};
    const toDelete = [];
    
    nplabsProducts.forEach(p => {
        // Build a unique key based on name, dosage, presentation
        const doseStr = p.dosage || p.dose || '';
        const presStr = p.presentation || '';
        const uniqueKey = `${p.name} ${doseStr} ${presStr}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!byVariant[uniqueKey]) {
            byVariant[uniqueKey] = [];
        }
        byVariant[uniqueKey].push(p);
    });
    
    for (const key of Object.keys(byVariant)) {
        if (byVariant[key].length > 1) {
            console.log(`Duplicate found for key: ${key}`);
            const items = byVariant[key];
            // Keep the one with highest price or most recent
            items.sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));
            // Keep items[0], delete the rest
            for (let i = 1; i < items.length; i++) {
                toDelete.push(items[i].id);
                console.log(`  Deleting duplicate: ${items[i].name} (ID: ${items[i].id})`);
            }
        }
    }
    
    console.log(`Total duplicates to delete: ${toDelete.length}`);
    if (toDelete.length > 0) {
        const batch = adminDb.batch();
        toDelete.forEach(id => {
            batch.delete(adminDb.collection('products').doc(id));
        });
        await batch.commit();
        console.log('Deleted duplicates.');
    }
    
    // Check canonicals
    const canonicals = new Set();
    nplabsProducts.filter(p => !toDelete.includes(p.id)).forEach(p => {
        canonicals.add(p.canonicalId || p.name.toLowerCase());
    });
    console.log(`Final NP Labs Variants: ${nplabsProducts.length - toDelete.length}`);
    console.log(`Final NP Labs Canonicals: ${canonicals.size}`);
}

run().catch(console.error);
