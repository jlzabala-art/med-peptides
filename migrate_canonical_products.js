import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function migrate() {
  console.log('Starting migration...');
  const snapshot = await db.collection('products').get();
  
  const groups = new Map();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.name) continue;
    
    if (data._isCanonical) {
      continue;
    }

    const canonicalName = data.name.trim();
    if (!groups.has(canonicalName)) {
      groups.set(canonicalName, []);
    }
    
    const variantsSnap = await doc.ref.collection('variants').get();
    const variants = variantsSnap.docs.map(v => ({ id: v.id, ...v.data() }));
    
    groups.get(canonicalName).push({
      id: doc.id,
      ref: doc.ref,
      data,
      variants
    });
  }
  
  console.log(`Found ${groups.size} canonical product groups to migrate.`);
  if (groups.size === 0) {
    console.log('No migration needed.');
    return;
  }
  
  let batch = db.batch();
  let batchCount = 0;
  
  const commitBatch = async () => {
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed batch of ${batchCount} operations.`);
      batch = db.batch();
      batchCount = 0;
    }
  };

  const idMap = {};
  
  for (const [canonicalName, products] of groups.entries()) {
    const canonicalId = slugify(canonicalName);
    const canonicalRef = db.collection('products').doc(canonicalId);
    
    const baseData = { ...products[0].data };
    
    delete baseData.price;
    delete baseData.cost;
    delete baseData.stock;
    delete baseData.dosage;
    delete baseData.strength;
    delete baseData.supplier;
    delete baseData.sku;
    
    baseData._isCanonical = true;
    baseData.id = canonicalId;
    baseData.slug = canonicalId;
    
    batch.set(canonicalRef, baseData);
    batchCount++;
    
    for (const prod of products) {
      const pData = prod.data;
      
      if (prod.variants.length > 0) {
        for (const variant of prod.variants) {
          const varRef = canonicalRef.collection('variants').doc(variant.id);
          const varData = { ...variant };
          if (!varData.dosage && !varData.strength) {
            varData.dosage = pData.dosage || pData.strength || '';
          }
          batch.set(varRef, varData);
          batchCount++;
          
          idMap[variant.id] = { canonicalId, variantId: variant.id };
        }
      } else {
        const variantId = `var_${prod.id}`;
        const varRef = canonicalRef.collection('variants').doc(variantId);
        const fallbackVariant = {
          id: variantId,
          name: pData.dosage || pData.strength || 'Standard',
          dosage: pData.dosage || pData.strength || '',
          price: pData.price || 0,
          cost: pData.cost || 0,
          stock: pData.stock || 0,
          supplier: pData.supplier || null,
          sku: pData.sku || null,
          status: pData.status || 'Active',
          isActive: pData.isActive !== false,
          isProfessional: pData.isProfessional || false,
          pricing: pData.pricing || null
        };
        batch.set(varRef, fallbackVariant);
        batchCount++;
        
        idMap[prod.id] = { canonicalId, variantId };
      }
      
      if (prod.id !== canonicalId) {
        batch.delete(prod.ref);
        batchCount++;
        for (const variant of prod.variants) {
          batch.delete(prod.ref.collection('variants').doc(variant.id));
          batchCount++;
        }
      }
      
      if (batchCount >= 400) {
        await commitBatch();
      }
    }
  }
  
  await commitBatch();
  console.log('Product migration completed successfully.');
  
  fs.writeFileSync('./migration_id_map.json', JSON.stringify(idMap, null, 2));
  console.log('Saved ID mapping to migration_id_map.json');
}

migrate().catch(console.error);
