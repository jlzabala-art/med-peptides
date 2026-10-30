import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { evaluateProductCompliance } from '@/services/shopify/shopifySafetyGate';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'retail' | 'synced' | 'restricted'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const snapshot = await adminDb.collection('products').limit(limit).get();
    const items = [];

    snapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      const compliance = evaluateProductCompliance(data);
      const shopifyMeta = data.shopify || {
        syncStatus: 'unlinked',
        status: null,
        productId: null,
        shopifyPriceAed: null
      };

      // Apply filter
      if (filter === 'retail' && !compliance.isAllowedOnShopify) return;
      if (filter === 'synced' && shopifyMeta.syncStatus !== 'synced') return;
      if (filter === 'restricted' && compliance.isAllowedOnShopify) return;

      items.push({
        id: data.id,
        name: data.name || data.title || 'Untitled Product',
        sku: data.sku || `MLX-${data.id.slice(0, 6).toUpperCase()}`,
        category: data.category || 'Nutraceutical',
        form: data.form || data.deliveryMethod || 'Oral',
        priceEur: data.price || 0,
        shopifyPriceAed: shopifyMeta.shopifyPriceAed || (data.price ? Number((data.price * 4.0).toFixed(2)) : 195.0),
        compliance,
        shopify: shopifyMeta,
        updatedAt: data.updatedAt || null
      });
    });

    return NextResponse.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('[API /api/shopify/products] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

