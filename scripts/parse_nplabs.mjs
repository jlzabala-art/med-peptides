import fs from 'fs';
const text = fs.readFileSync('/tmp/nplabs.txt', 'utf8');

const lines = text.split('\n').map(l => l.trim()).filter(l => l);

const products = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip headers and section titles
    if (line.includes('International Compounding Pharmacy')) continue;
    if (line.includes('Peptides Catalogue')) continue;
    if (line.includes('Vials · Nasal Sprays · Drops · Capsules')) continue;
    if (line.includes('NP LABS')) continue;
    if (line.includes('Prices subject to change')) continue;
    if (line.startsWith('Page ')) continue;
    if (line.startsWith('VIALS — ') || line.startsWith('NASAL SPRAYS — ') || line.startsWith('CAPSULES — ') || line.startsWith('DROPS — ') || line.startsWith('COSMETIC PEPTIDES — ')) continue;
    
    // If it looks like a price, the previous line was the product name
    if (line.startsWith('€')) {
        const nameLine = lines[i - 1];
        products.push({
            name: nameLine,
            price: parseFloat(line.replace('€', '').replace(',', ''))
        });
    }
}

console.log(`Found ${products.length} products in PDF`);

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
const db = getFirestore(app);

async function run() {
    const productsSnap = await db.collection('products').get();
    const existing = productsSnap.docs
        .map(d => ({id: d.id, ...d.data()}))
        .filter(p => {
            let isNp = false;
            if ((p.supplier || '').toLowerCase().includes('np lab')) isNp = true;
            if ((p.supplierId || '').toLowerCase().includes('np lab')) isNp = true;
            return isNp;
        });
        
    console.log(`Found ${existing.length} NP Labs products in DB`);
    
    // Find missing
    const missing = [];
    for (const p of products) {
        // Try to find a match in existing
        // PDF name has dosage and presentation like "Semaglutide 2mg vial"
        // DB name might be "Semaglutide" and dosage "2mg" and presentation "vial"
        // Let's just check if ANY existing product has a variantId or name that matches closely
        
        let found = false;
        for (const e of existing) {
            // Reconstruct DB full name
            const doseStr = e.dosage || e.dose || '';
            const presStr = e.presentation || '';
            const dbFullName = `${e.name} ${doseStr} ${presStr}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            const pdfName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Or check if e.variantId contains the parts
            const vId = (e.variantId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            
            if (dbFullName === pdfName || pdfName.includes(dbFullName) || dbFullName.includes(pdfName)) {
                found = true;
                break;
            }
            if (vId && pdfName.includes(vId.replace('nplabs', ''))) {
                found = true;
                break;
            }
        }
        
        if (!found) {
            missing.push(p);
        }
    }
    
    console.log(`Missing ${missing.length} products:`);
    missing.forEach(m => console.log(m));
}

run().catch(console.error);
