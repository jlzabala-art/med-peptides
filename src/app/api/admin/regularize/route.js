import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST() {
  try {
    console.log('Fetching official suppliers...');
    const suppliersSnap = await adminDb.collection('suppliers').get();
    
    // Create mapping from possible names to supplier ID
    const supplierMap = new Map();
    suppliersSnap.forEach(doc => {
      const data = doc.data();
      const id = doc.id;
      supplierMap.set(id.toLowerCase(), { id, name: data.companyName || data.name || id });
      if (data.companyName) supplierMap.set(data.companyName.toLowerCase(), { id, name: data.companyName });
      if (data.name) supplierMap.set(data.name.toLowerCase(), { id, name: data.name });
      
      // Custom fuzzy mappings just in case
      const fuzzyName = (data.companyName || data.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (fuzzyName) supplierMap.set(fuzzyName, { id, name: data.companyName || data.name });
    });

    console.log(`Loaded ${suppliersSnap.size} official suppliers. Map has ${supplierMap.size} keys.`);

    console.log('Fetching products...');
    const productsSnap = await adminDb.collection('products').get();
    let updatedCount = 0;
    
    const batchArray = [];
    let currentBatch = adminDb.batch();
    let operationCount = 0;

    for (const doc of productsSnap.docs) {
      const data = doc.data();
      let needsUpdate = false;
      let updates = {};

      const rawId = data.supplierId;
      const rawName1 = data.supplierName;
      const rawName2 = data.supplier;

      let resolvedSupplier = null;

      // Extract dosage from name if missing
      const extractDosage = (str) => {
        if (!str) return null;
        const match = str.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml))/i);
        return match ? match[1].trim() : null;
      };

      const globalDosage = data.dosage || extractDosage(data.canonicalName || data.name);
      if (!data.dosage && globalDosage) {
        updates.dosage = globalDosage;
        needsUpdate = true;
      }

      // Try finding by ID first
      if (rawId && supplierMap.has(rawId.toLowerCase())) {
        resolvedSupplier = supplierMap.get(rawId.toLowerCase());
      } 
      // Try finding by supplierName
      else if (rawName1 && supplierMap.has(rawName1.toLowerCase())) {
        resolvedSupplier = supplierMap.get(rawName1.toLowerCase());
      }
      // Try finding by supplier
      else if (rawName2 && supplierMap.has(rawName2.toLowerCase())) {
        resolvedSupplier = supplierMap.get(rawName2.toLowerCase());
      }
      else {
        // Fuzzy match fallback
        const matchCandidates = [rawId, rawName1, rawName2].filter(Boolean);
        for (const cand of matchCandidates) {
          const fuzzyCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (supplierMap.has(fuzzyCand)) {
            resolvedSupplier = supplierMap.get(fuzzyCand);
            break;
          }
        }
      }

      if (resolvedSupplier) {
        if (data.supplierId !== resolvedSupplier.id || data.supplierName !== resolvedSupplier.name) {
          updates.supplierId = resolvedSupplier.id;
          updates.supplierName = resolvedSupplier.name;
          needsUpdate = true;
        }
        
        // Clean up legacy field if it exists
        if (data.supplier !== undefined) {
          updates.supplier = FieldValue.delete();
          needsUpdate = true;
        }
      }

      // Fix variants
      if (data.variants && Array.isArray(data.variants)) {
        let variantsChanged = false;
        const newVariants = data.variants.map(v => {
          const nv = { ...v };
          
          // Fix supplierId in variant
          if (!nv.supplierId || supplierMap.has((nv.supplier || '').toLowerCase())) {
             let vSupplier = null;
             if (nv.supplierId && supplierMap.has(nv.supplierId.toLowerCase())) vSupplier = supplierMap.get(nv.supplierId.toLowerCase());
             else if (nv.supplier && supplierMap.has(nv.supplier.toLowerCase())) vSupplier = supplierMap.get(nv.supplier.toLowerCase());
             
             if (vSupplier) {
               nv.supplierId = vSupplier.id;
               nv.supplier = vSupplier.name;
               variantsChanged = true;
             } else if (!nv.supplierId && resolvedSupplier) {
               // Fallback: inherit from parent product
               nv.supplierId = resolvedSupplier.id;
               nv.supplier = resolvedSupplier.name;
               variantsChanged = true;
             }
          }

          // Fix dosage in variant
          if (!nv.dosage || nv.dosage.trim() === '') {
             nv.dosage = globalDosage || 'Unknown';
             variantsChanged = true;
          }

          return nv;
        });

        if (variantsChanged) {
          updates.variants = newVariants;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        currentBatch.update(doc.ref, updates);
        updatedCount++;
        operationCount++;

        if (operationCount === 450) {
          batchArray.push(currentBatch);
          currentBatch = adminDb.batch();
          operationCount = 0;
        }
      }
    }

    if (operationCount > 0) {
      batchArray.push(currentBatch);
    }
    
    for (let i = 0; i < batchArray.length; i++) {
      await batchArray[i].commit();
    }

    return NextResponse.json({ success: true, updatedCount, batches: batchArray.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
