import { adminDb } from '../src/lib/firebaseAdmin.js';

async function retryWithBackoff(fn, retries = 5, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`[Retry] Error de red (${err.message}), esperando ${delay}ms...`);
    await new Promise(res => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 1.5);
  }
}

async function sanitizeSuppliersAndVariants() {
  console.log('=== FASE 1: Saneamiento y Normalización de Proveedores y Variantes (con Auto-Retry) ===');

  const productsSnap = await retryWithBackoff(() => adminDb.collection('products').get());
  console.log(`Total productos en catálogo: ${productsSnap.size}`);

  let updatedVariants = 0;
  let updatedParentProducts = 0;

  for (const doc of productsSnap.docs) {
    const pData = doc.data();
    const vSnap = await retryWithBackoff(() => doc.ref.collection('variants').get());

    if (vSnap.empty) continue;

    let parentNeedsUpdate = false;
    const currentSupplierIds = new Set(Array.isArray(pData.supplierIds) ? pData.supplierIds : []);
    if (pData.supplierId) currentSupplierIds.add(pData.supplierId);

    const fullActiveVariants = [];

    for (const vDoc of vSnap.docs) {
      const vData = vDoc.data();
      let vNeedsUpdate = false;
      const vUpdate = {};

      // Normalizar proveedor Lotusland
      if (
        vData.catalogBrand === 'RegenPept' ||
        vData.supplierId === 'OLlBbQjgrj6tY7GmM2Jo' ||
        String(vData.supplier || '').toLowerCase().includes('lotus') ||
        String(vData.supplierName || '').toLowerCase().includes('lotus')
      ) {
        if (vData.supplierId !== 'supplier-lotusland') {
          vUpdate.supplierId = 'supplier-lotusland';
          vNeedsUpdate = true;
        }
        if (vData.supplierName !== 'Lotusland Limited') {
          vUpdate.supplierName = 'Lotusland Limited';
          vNeedsUpdate = true;
        }
        if (vData.supplier !== 'LotusLand') {
          vUpdate.supplier = 'LotusLand';
          vNeedsUpdate = true;
        }

        if (!currentSupplierIds.has('supplier-lotusland')) {
          currentSupplierIds.add('supplier-lotusland');
          parentNeedsUpdate = true;
        }
      }

      if (vNeedsUpdate) {
        await retryWithBackoff(() => vDoc.ref.set(vUpdate, { merge: true }));
        updatedVariants++;
      }

      const mergedVariant = { id: vDoc.id, ...vData, ...vUpdate };
      if (mergedVariant.isActive !== false && mergedVariant.status !== 'archived') {
        fullActiveVariants.push(mergedVariant);
      }
    }

    // Comprobar si el array embebido del padre difiere
    const existingVariantsArray = Array.isArray(pData.variants) ? pData.variants : [];
    const existingIds = new Set(existingVariantsArray.map(v => v.id));
    const missingInParent = fullActiveVariants.some(v => !existingIds.has(v.id));

    if (missingInParent || parentNeedsUpdate) {
      const pUpdate = {
        supplierIds: Array.from(currentSupplierIds),
        variants: fullActiveVariants,
        variantsCount: fullActiveVariants.length,
        updatedAt: new Date().toISOString()
      };
      await retryWithBackoff(() => doc.ref.set(pUpdate, { merge: true }));
      updatedParentProducts++;
    }
  }

  console.log(`\n=== Resumen Fase 1 Completado ===`);
  console.log(`Variantes corregidas con supplierId canónico: ${updatedVariants}`);
  console.log(`Productos padre sincronizados con sus variantes: ${updatedParentProducts}`);
  process.exit(0);
}

sanitizeSuppliersAndVariants().catch(err => {
  console.error('Error definitivo en Fase 1:', err);
  process.exit(1);
});
