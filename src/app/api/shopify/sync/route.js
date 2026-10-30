import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { simulateDryRun, syncProductToShopify } from '@/services/shopify/shopifySyncEngine';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { productIds = [], dryRun = true, adminUser = { uid: 'admin' } } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ success: false, error: 'productIds array is required' }, { status: 400 });
    }

    // Fetch products from Firestore
    const products = [];
    for (const pid of productIds) {
      const doc = await adminDb.collection('products').doc(pid).get();
      if (doc.exists) {
        products.push({ id: doc.id, ...doc.data() });
      }
    }

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching products found in Atlas' }, { status: 404 });
    }

    // 1. Dry Run Mode
    if (dryRun) {
      const dryRunReport = await simulateDryRun(products);
      return NextResponse.json({
        success: true,
        dryRun: true,
        report: dryRunReport
      });
    }

    // 2. Real Synchronization Mode
    const results = [];
    for (const product of products) {
      try {
        const syncResult = await syncProductToShopify(product, adminUser);
        results.push({
          id: product.id,
          name: product.name || product.title,
          success: syncResult.success,
          operation: syncResult.operation,
          shopifyProduct: syncResult.shopifyProduct,
          userErrors: syncResult.userErrors
        });
      } catch (err) {
        results.push({
          id: product.id,
          name: product.name || product.title,
          success: false,
          error: err.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      dryRun: false,
      totalProcessed: results.length,
      successCount,
      failedCount: results.length - successCount,
      results
    });
  } catch (err) {
    console.error('[API /api/shopify/sync] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

