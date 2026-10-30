import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { generateProductDiff } from '@/services/shopify/shopifySyncEngine';
import { shopifyClient } from '@/services/shopify/ShopifyClient';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 });
    }

    const doc = await adminDb.collection('products').doc(productId).get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: 'Product not found in Atlas' }, { status: 404 });
    }

    const atlasProduct = { id: doc.id, ...doc.data() };

    // Query Shopify for existing record if any
    let existingShopifyProduct = null;
    if (atlasProduct.shopify?.productId && shopifyClient.isConfigured()) {
      const res = await shopifyClient.getProducts({ queryStr: `id:${atlasProduct.shopify.productId}` });
      existingShopifyProduct = res.products?.[0] || null;
    }

    const diff = generateProductDiff(atlasProduct, existingShopifyProduct);

    return NextResponse.json({
      success: true,
      diff
    });
  } catch (err) {
    console.error('[API /api/shopify/diff] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

