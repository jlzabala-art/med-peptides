const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();

async function migrate() {
    console.log("Fetching products to find tests...");
    const snapshot = await db.collection('products').get();
    
    let migratedCount = 0;
    
    for (const doc of snapshot.docs) {
        const product = doc.data();
        
        const isTest = product?.category?.toLowerCase().includes('test') || 
                       product?.product_type?.toLowerCase().includes('test') || 
                       product?.product_type === 'dna_testing_kit' || 
                       product?.product_type === 'biomarker_testing_kit';
        
        if (!isTest) continue;
        
        console.log(`Checking variants for Test Product: ${product.name || doc.id}`);
        
        const variantsSnap = await db.collection('products').doc(doc.id).collection('variants').get();
        const batch = db.batch();
        let variantsModified = false;
        
        for (const vDoc of variantsSnap.docs) {
            const variant = vDoc.data();
            let updatePayload = {};
            let modified = false;
            
            if (variant.sampleType === undefined) {
                // Read from dosage, extractionMethod, or default to Saliva
                updatePayload.sampleType = variant.extractionMethod || variant.dosage || 'Saliva';
                modified = true;
                
                if (variant.dosage !== undefined) {
                    updatePayload.dosage = admin.firestore.FieldValue.delete();
                }
            }
            
            if (modified) {
                batch.update(vDoc.ref, updatePayload);
                variantsModified = true;
            }
        }
        
        if (variantsModified) {
            await batch.commit();
            console.log(`   -> Migrated variants for ${product.name || doc.id}`);
            migratedCount++;
        }
    }
    
    console.log(`Successfully migrated variants for ${migratedCount} test products.`);
}

migrate().then(() => process.exit(0)).catch(console.error);
