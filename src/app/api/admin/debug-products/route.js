import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function GET() {
  try {
    const snap = await adminDb.collection('products').get();
    let totalProducts = 0;
    let variantsWithoutSupplierId = 0;
    let variantsWithoutDosage = 0;
    let productsWithAnomalies = [];

    snap.docs.forEach(doc => {
      const data = doc.data();
      totalProducts++;
      let hasAnomaly = false;
      const anomalies = [];

      if (data.variants && Array.isArray(data.variants)) {
        data.variants.forEach(v => {
          if (!v.supplierId) {
            variantsWithoutSupplierId++;
            hasAnomaly = true;
            if (!anomalies.includes('missing_supplierId')) anomalies.push('missing_supplierId');
          }
          if (!v.dosage || v.dosage.trim() === '') {
            variantsWithoutDosage++;
            hasAnomaly = true;
            if (!anomalies.includes('missing_dosage')) anomalies.push('missing_dosage');
          }
        });
      } else {
        // Product has no variants array
        hasAnomaly = true;
        anomalies.push('no_variants_array');
      }

      if (hasAnomaly) {
        productsWithAnomalies.push({
          id: doc.id,
          name: data.canonicalName || data.name,
          anomalies
        });
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        variantsWithoutSupplierId,
        variantsWithoutDosage,
        productsWithAnomaliesCount: productsWithAnomalies.length
      },
      anomalousProducts: productsWithAnomalies
    });
  } catch (error) {
    console.error('Audit Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
