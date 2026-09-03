import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { getProductAvailableTypes } from '../../../../utils/productNormalizer';

const TYPE_LABELS = {
  finished_product:  'Finished Products',
  raw_material:      'Bulk API / Raw Materials',
  clinical_supplies: 'Clinical Supplies',
  diagnostic:        'Diagnostics',
  service:           'Services',
};

export async function POST(request) {
  if (!adminDb) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  
  try {
    const productsSnap = await adminDb.collection('products').get();
    
    const goalsMap = new Map();
    const categoriesMap = new Map();
    const formatsMap = new Map();
    const suppliersMap = new Map();
    const productTypesMap = new Map();    // type → count  (hybrid products counted in each)

    let activeProductsCount = 0;
    let variantsCount = 0;
    let apiRawMaterialsCount = 0;
    let finishedProductsCount = 0;

    for (const doc of productsSnap.docs) {
      const data = doc.data();
      const isInactive = (data.status && ['inactive', 'archived'].includes(data.status)) || data.isActive === false;
      if (isInactive) continue;

      activeProductsCount++;

      // availableTypes[] — array-based, hybrid-aware
      const pTypes = getProductAvailableTypes(data);
      for (const t of pTypes) {
        productTypesMap.set(t, (productTypesMap.get(t) || 0) + 1);
      }

      // Legacy counters (kept for backwards compat with older UI)
      if (pTypes.includes('raw_material')) apiRawMaterialsCount++;
      if (pTypes.includes('finished_product')) finishedProductsCount++;
      
      const cat = data.category || data.categoryId;
      if (cat) {
        categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
      }
      
      const goalIds = Array.isArray(data.goalIds) ? data.goalIds : [];
      for (const g of goalIds) {
        goalsMap.set(g, (goalsMap.get(g) || 0) + 1);
      }

      const variantsSnap = await adminDb.collection('products').doc(doc.id).collection('variants').get();
      for (const vdoc of variantsSnap.docs) {
        const v = vdoc.data();
        if (v.isActive === false || ['inactive', 'archived'].includes(v.status)) continue;
        
        variantsCount++;

        const pres = v.presentation || 'vial';
        if (pres) {
          formatsMap.set(pres, (formatsMap.get(pres) || 0) + 1);
        }

        const sId = v.supplierId || v.supplier;
        if (sId) {
          if (!suppliersMap.has(sId)) {
            suppliersMap.set(sId, v.supplierName || v.supplier || sId);
          }
        }
      }
    }

    const metaFacets = {
      totals: {
        activeProducts: activeProductsCount,
        variants: variantsCount,
        apiRawMaterials: apiRawMaterialsCount,
        finishedProducts: finishedProductsCount
      },
      productTypes: Array.from(productTypesMap.entries())
        .map(([value, count]) => ({
          value,
          label: TYPE_LABELS[value] || value,
          count
        }))
        .sort((a, b) => b.count - a.count),
      goals:      Array.from(goalsMap.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      categories: Array.from(categoriesMap.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      formats:    Array.from(formatsMap.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      suppliers:  Array.from(suppliersMap.entries()).map(([id, name]) => ({ id, name, value: id, label: name })),
      lastUpdated: new Date().toISOString()
    };

    await adminDb.collection('_meta').doc('catalog_facets').set(metaFacets);
    return NextResponse.json({ success: true, metaFacets });
  } catch (error) {
    console.error('Error recalculating facets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

