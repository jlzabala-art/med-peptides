import { NextResponse } from 'next/server';
import { adminDb, admin } from '../../../../lib/firebaseAdmin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suppliers: [] });
    }

    const searchTerm = query.toLowerCase().trim();

    // 1. Fetch products from Firestore directly (Fast in-memory scan)
    // This is architecturally robust because we don't depend on Algolia syncing.
    // For catalogues < 5000 products this takes <100ms.
    const productsRef = adminDb.collection('products');
    const snapshot = await productsRef.limit(2000).get(); // Safety limit
    
    const supplierIds = new Set();
    
    snapshot.forEach(doc => {
      const product = doc.data();
      const canonicalName = (product.canonicalName || product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      // Match if canonical name or category includes the search term
      if (canonicalName.includes(searchTerm) || category.includes(searchTerm)) {
        const suppName = product.supplierName || product.supplier || '';
        const resolvedSupplierId = product.supplierId || suppName.toLowerCase().replace(/\s+/g, '-');
        if (resolvedSupplierId && resolvedSupplierId !== '') {
          supplierIds.add(resolvedSupplierId);
        }
      }
    });

    if (supplierIds.size === 0) {
      return NextResponse.json({ suppliers: [] });
    }

    // 2. Fetch ALL supplier documents from Firestore (only ~160 docs, very fast)
    const suppliers = [];
    const suppliersRef = adminDb.collection('wholesellers');
    const suppSnapshot = await suppliersRef.get();
    
    suppSnapshot.forEach(doc => {
      const data = doc.data();
      
      if (supplierIds.has(doc.id)) {
        suppliers.push({
          id: doc.id,
          ...data
        });
      }
    });

    return NextResponse.json({ suppliers });
    
  } catch (error) {
    console.error('API /suppliers/search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
