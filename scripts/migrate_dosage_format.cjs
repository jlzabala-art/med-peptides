const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

async function migrateDosageFormat() {
  try {
    const productsSnap = await db.collection('products').get();
    let updatedCount = 0;
    
    for (const doc of productsSnap.docs) {
      const pData = doc.data();
      const pId = doc.id;
      
      // We process lyophilized_peptide (or if it's implicitly a peptide and has variants)
      if (pData.type === 'lyophilized_peptide' || (pData.category && pData.category.toLowerCase().includes('peptide'))) {
        const variantsSnap = await db.collection('products').doc(pId).collection('variants').get();
        
        for (const vDoc of variantsSnap.docs) {
          const vData = vDoc.data();
          const vId = vDoc.id;
          
          let updates = {};
          let needsUpdate = false;
          
          // Original import may have put something like "5 mg" in dosage, or "5mg/vial 5mg" in dosage/format
          // We look for 'vial', 'bottle', 'spray' etc.
          let formatStr = (vData.format || vData.presentation || '').toLowerCase();
          let dosageStr = (vData.dosage || vData.size || '').toLowerCase();
          
          // Some strings might be in "size" or combined.
          // In regenpept_data.js it was: size: "10 mg", format: "vial"
          
          if (!formatStr) {
            if (dosageStr.includes('vial')) {
              formatStr = 'vial';
              dosageStr = dosageStr.replace(/vial/g, '').replace(/\//g, '').trim();
            } else if (dosageStr.includes('bottle')) {
              formatStr = 'bottle';
              dosageStr = dosageStr.replace(/bottle/g, '').replace(/\//g, '').trim();
            } else {
              formatStr = 'vial'; // Default to vial for peptides
            }
          }
          
          // Cleanup dosageStr e.g., "10mg/vial 10mg" -> "10mg"
          if (dosageStr && typeof dosageStr === 'string') {
            const matches = dosageStr.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|iu|g))/i);
            if (matches && matches[1]) {
              dosageStr = matches[1].toLowerCase().replace(' ', ''); // normalize to e.g. "10mg"
            }
          }
          
          if (vData.format !== formatStr || vData.dosage !== dosageStr || vData.presentation !== formatStr) {
            updates.format = formatStr;
            updates.presentation = formatStr;
            updates.dosage = dosageStr;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            await db.collection('products').doc(pId).collection('variants').doc(vId).update(updates);
            updatedCount++;
            console.log(`Updated ${pData.name} variant ${vId}: dosage=${dosageStr}, format=${formatStr}`);
          }
        }
      }
    }
    console.log(`Migration complete. Updated ${updatedCount} variants.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateDosageFormat();
