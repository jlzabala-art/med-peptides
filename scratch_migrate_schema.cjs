const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve('/Users/joseluiszabala/regenpept-web.nosync', '.env.local') });

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
    console.log("Fetching protocols...");
    const snapshot = await db.collection('protocols').get();
    
    const batch = db.batch();
    let migratedCount = 0;
    
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.phases || !Array.isArray(data.phases)) continue;
        
        let modified = false;
        const newPhases = data.phases.map(phase => {
            let newPhase = { ...phase };
            
            // 1. Rename phase_title to name
            if (newPhase.phase_title !== undefined && newPhase.name === undefined) {
                newPhase.name = newPhase.phase_title;
                delete newPhase.phase_title;
                modified = true;
            } else if (newPhase.phase_title !== undefined && newPhase.name !== undefined) {
                delete newPhase.phase_title;
                modified = true;
            }
            
            // 2. Rename drugs_used to items and standardize product properties
            if (newPhase.drugs_used && Array.isArray(newPhase.drugs_used)) {
                newPhase.items = newPhase.drugs_used.map(drug => {
                    const mappedItem = { ...drug };
                    
                    if (mappedItem.product_title && !mappedItem.name) {
                        mappedItem.name = mappedItem.product_title;
                    }
                    if (mappedItem.product_slug && !mappedItem.product_id) {
                        mappedItem.product_id = mappedItem.product_slug;
                    }
                    
                    // Cleanup old legacy properties if they clash or are redundant, but keeping them might be safer
                    delete mappedItem.product_title;
                    delete mappedItem.product_slug;
                    
                    return mappedItem;
                });
                delete newPhase.drugs_used;
                modified = true;
            }

            // Fallback for empty array if it has nothing
            if (!newPhase.items) {
                newPhase.items = [];
            }
            
            return newPhase;
        });
        
        if (modified) {
            console.log(`Migrating protocol: ${doc.id}`);
            batch.update(doc.ref, { phases: newPhases });
            migratedCount++;
        }
    }
    
    if (migratedCount > 0) {
        await batch.commit();
        console.log(`Successfully migrated ${migratedCount} protocols.`);
    } else {
        console.log("No protocols needed migration.");
    }
}

migrate().then(() => process.exit(0)).catch(console.error);
