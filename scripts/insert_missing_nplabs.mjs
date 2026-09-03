import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

const app = initializeApp({ credential });
const db = getFirestore(app);

const missing = [
{ name: 'CJC 1295 DAC 10mg vial', price: 120 },
{ name: 'Thymosin Alpha 1 — 5mg vial', price: 80 },
{ name: 'Thymosin Alpha 1 — 10mg vial', price: 120 },
{ name: 'Sermorelin 15mg — 15ml nasal spray', price: 50 },
{ name: 'Ipamorelin 15mg — 15ml nasal spray', price: 50 },
{ name: 'Tesamorelin 15mg — 15ml nasal spray', price: 50 },
{ name: 'Selank 7500mcg/ml — 15ml nasal spray', price: 55 },
{ name: 'Semax 7500mcg/ml — 15ml nasal spray', price: 50 },
{ name: 'KPV 250mcg/ml — 15ml nasal spray', price: 60 },
{ name: 'Thymosin Alpha 1 5mg — 15ml nasal spray', price: 50 },
{ name: 'PT-141 20mg — 15ml nasal spray', price: 80 },
{ name: 'Melanotan II 2000mcg/ml — 15ml nasal spray', price: 88 },
{ name: 'Oxytocin 50iu/ml — 15ml nasal spray', price: 40 },
{ name: 'Thymosin Beta (TB-500) 2mg — 15ml nasal spray', price: 60 },
{ name: 'Sermorelin 30mg — 30ml drops', price: 93.5 },
{ name: 'Ipamorelin 30mg — 30ml drops', price: 90 },
{ name: 'Tesamorelin 30mg — 30ml drops', price: 90 },
{ name: 'Selank 7500mcg/ml — 30ml drops', price: 88 },
{ name: 'DSIP 1000mcg/ml — 30ml drops', price: 66 },
{ name: 'Thymosin Alpha 1 1.5mg/ml — 30ml drops', price: 132 },
{ name: 'Thymosin Alpha 1 600mcg/ml — 30ml drops', price: 88 }
];

function generateCanonicalId(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function run() {
    const batch = db.batch();
    const npLabsId = 'np-labs'; // We need to verify if NP Labs has a supplierId, let's look at existing ones

    // Let's get one existing NPLab product to copy the supplierId and supplier Name
    const productsSnap = await db.collection('products').get();
    let existingNp = productsSnap.docs.map(d => d.data()).find(p => (p.supplier || '').toLowerCase().includes('np lab'));
    const supplierId = existingNp.supplierId || 'np-labs';
    const supplierName = existingNp.supplierName || existingNp.supplier || 'NP Labs';

    console.log(`Using supplierId: ${supplierId}, supplierName: ${supplierName}`);

    let count = 0;
    for (const m of missing) {
        // Parse name, dose, presentation
        let cleanName = m.name.replace(' — ', ' ').replace(' - ', ' ');
        // E.g. "CJC 1295 DAC 10mg vial"
        let presentation = 'vial';
        if (cleanName.includes('nasal spray')) presentation = 'nasal spray';
        if (cleanName.includes('drops')) presentation = 'drops';
        
        let doseMatch = cleanName.match(/(\d+(\.\d+)?[a-zA-Z\/]+( \+ \d+(\.\d+)?[a-zA-Z\/]+)*)/);
        let dose = doseMatch ? doseMatch[0] : '';
        
        let baseName = cleanName.split(dose)[0].trim();
        if (!baseName) baseName = cleanName.replace(presentation, '').trim();
        
        const canonicalName = baseName;
        const canonicalId = generateCanonicalId(canonicalName);
        const variantId = `nplabs_${canonicalId}_${dose.replace(/[^a-z0-9]/gi, '_')}_${presentation.replace(/[^a-z0-9]/gi, '_')}`;

        const docRef = db.collection('products').doc();
        
        batch.set(docRef, {
            canonicalName: canonicalName,
            name: canonicalName,
            dosage: dose,
            presentation: presentation,
            category: 'Peptides',
            type: 'peptide',
            status: 'published',
            isActive: true,
            supplierId: supplierId,
            supplierName: supplierName,
            supplier: supplierName,
            price: m.price,
            currency: 'EUR',
            source: 'pdf_import',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            canonicalId: canonicalId,
            peptideIds: [canonicalId],
            peptideId: canonicalId,
            variantId: variantId,
            variants: [{
                variantId: variantId,
                label: 'Default Variant',
                supplierId: supplierId,
                supplier: supplierName,
                strength: dose,
                presentation: presentation,
                unit_price: m.price,
                cost_tiers: [
                    { quantity: 1, unit_price: m.price },
                    { quantity: 10, unit_price: m.price * 0.9 }
                ]
            }]
        });
        count++;
    }

    await batch.commit();
    console.log(`Inserted ${count} missing NP Labs products`);
}

run().catch(console.error);
