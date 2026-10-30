import { NextResponse } from 'next/server';
import { shopifyClient } from '@/services/shopify/ShopifyClient';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ping = await shopifyClient.ping();

    // Query stats from Firestore
    const productsSnap = await adminDb.collection('products').limit(300).get();
    let totalAtlasProducts = 0;
    let retailEligible = 0;
    let syncedOnShopify = 0;
    let syncErrors = 0;

    productsSnap.forEach(doc => {
      totalAtlasProducts++;
      const data = doc.data();
      const shopifyData = data.shopify;

      if (shopifyData?.syncStatus === 'synced') {
        syncedOnShopify++;
      } else if (shopifyData?.syncStatus === 'error') {
        syncErrors++;
      }

      const cat = String(data.category || '').toLowerCase();
      const isSupplement = cat.includes('supplement') || cat.includes('nutra') || cat.includes('topical');
      if (isSupplement) retailEligible++;
    });

    return NextResponse.json({
      success: true,
      ping,
      kpis: {
        totalAtlasProducts,
        retailEligible,
        syncedOnShopify,
        syncErrors,
        storeDomain: ping.storeDomain,
        publicDomain: ping.publicDomain,
        currency: ping.currency
      }
    });
  } catch (err) {
    console.error('[API /api/shopify/status] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

