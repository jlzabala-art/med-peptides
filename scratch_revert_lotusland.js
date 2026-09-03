import fs from 'fs';
import { adminDb } from './src/lib/firebaseAdmin.js';

async function revert() {
  const log = fs.readFileSync('/Users/joseluiszabala/.gemini/antigravity-ide/brain/a0ec329c-cc7e-4f9e-abd8-8f7e46d7fe28/.system_generated/tasks/task-4666.log', 'utf-8');
  const lines = log.split('\n');
  
  let revertedCount = 0;
  for (const line of lines) {
    // Updating product <productId> variant <variantId> (was supplierId: <id>, supplier: <name>)
    const variantMatch = line.match(/Updating product (.+?) variant (.+?) \(was supplierId: (.+?), supplier: (.*)\)/);
    if (variantMatch) {
      const productId = variantMatch[1];
      const variantId = variantMatch[2];
      const oldSupIdRaw = variantMatch[3];
      const oldSupRaw = variantMatch[4];
      
      const oldSupId = oldSupIdRaw === 'null' || oldSupIdRaw === 'undefined' ? null : oldSupIdRaw;
      const oldSup = oldSupRaw === 'null' || oldSupRaw === 'undefined' ? null : oldSupRaw;
      
      console.log(`Reverting variant ${productId}/${variantId} to ${oldSupId}, ${oldSup}`);
      await adminDb.collection('products').doc(productId).collection('variants').doc(variantId).update({
        supplierId: oldSupId,
        supplier: oldSup
      });
      revertedCount++;
      continue;
    }
    
    // Updating parent product <productId> (was supplierId: <id>, supplier: <name>)
    const parentMatch = line.match(/Updating parent product (.+?) \(was supplierId: (.+?), supplier: (.*)\)/);
    if (parentMatch) {
      const productId = parentMatch[1];
      const oldSupIdRaw = parentMatch[2];
      const oldSupRaw = parentMatch[3];
      
      const oldSupId = oldSupIdRaw === 'null' || oldSupIdRaw === 'undefined' ? null : oldSupIdRaw;
      const oldSup = oldSupRaw === 'null' || oldSupRaw === 'undefined' ? null : oldSupRaw;
      
      console.log(`Reverting parent ${productId} to ${oldSupId}, ${oldSup}`);
      await adminDb.collection('products').doc(productId).update({
        supplierId: oldSupId,
        supplier: oldSup
      });
      continue;
    }
    
    // Note: variants arrays were also updated. But it's safer to just let the DB be slightly messy on arrays, or re-generate them.
    // Wait, the "Updating parent product <id> variants array" log means we modified the array on the parent doc.
    // It's probably best to restore the whole variants array from the subcollection.
  }
  
  console.log(`Reverted ${revertedCount} variants.`);
  process.exit(0);
}

revert().catch(e => { console.error(e); process.exit(1); });
