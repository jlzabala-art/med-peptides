const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').replace(/^['"]|['"]$/g, '');
    }
  });
}

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function consolidate() {
  console.log("Reading all products...");
  const snapshot = await db.collection('products').get();
  
  const productsByName = {};
  
  // 1. Group all products by their exact Name
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.name) continue;
    
    if (!productsByName[data.name]) {
      productsByName[data.name] = [];
    }
    productsByName[data.name].push({
      id: doc.id,
      ref: doc.ref,
      data: data
    });
  }

  let totalConsolidated = 0;

  // 2. Consolidate each group
  for (const [name, items] of Object.entries(productsByName)) {
    if (items.length <= 1) {
      // Already a single product, but let's check if its ID is messy
      // We will skip for now to focus on the duplicates
      continue; 
    }

    console.log(`\nConsolidating "${name}" (${items.length} items)...`);

    // Find the best "Base Product" (shortest ID usually means it's the base slug without -2mg-vial)
    items.sort((a, b) => a.id.length - b.id.length);
    const baseProduct = items[0];
    console.log(`  Base Product ID will be: ${baseProduct.id}`);

    // We will collect all variants from all items and put them in the Base Product
    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      console.log(`  Merging ${item.id} into base...`);

      // 1. Read variants of this item
      const vSnap = await item.ref.collection('variants').get();
      
      if (!vSnap.empty) {
        for (const vDoc of vSnap.docs) {
          const vData = vDoc.data();
          // Use the item.id or the variant size as the new variant ID
          let newVariantId = vData.sku || slugify(vData.size || item.id);
          newVariantId = newVariantId.replace(/[\/\\]/g, '-'); // Replace slashes with hyphens
          
          await baseProduct.ref.collection('variants').doc(newVariantId).set({
            ...vData,
            productId: baseProduct.id, // Update parent pointer
            name: vData.name || baseProduct.data.name // Ensure variant has a name
          });
          console.log(`    -> Moved variant: ${newVariantId} (Size: ${vData.size})`);
          
          // Delete old variant
          await vDoc.ref.delete();
        }
      } else {
        // If the item had no variants, maybe the item ITSELF is a variant
        // Let's create a variant using its top-level data
        const newVariantId = item.id;
        await baseProduct.ref.collection('variants').doc(newVariantId).set({
          productId: baseProduct.id,
          name: item.data.name,
          sku: item.data.sku || '',
          price: item.data.price || 0,
          cost: item.data.cost || 0,
          stock: item.data.stock || 0,
          size: item.data.size || '',
          category: item.data.category || '',
        });
        console.log(`    -> Converted item to variant: ${newVariantId}`);
      }

      // Delete the duplicate product document
      await item.ref.delete();
      console.log(`    -> Deleted duplicate product: ${item.id}`);
      totalConsolidated++;
    }
  }

  console.log(`\n✅ Done! Consolidated ${totalConsolidated} duplicate products.`);
}

consolidate().then(() => process.exit(0)).catch(console.error);
