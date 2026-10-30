import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Shopify OAuth Callback Handler
 * Exchanges authorization code for permanent offline access token and saves to Firestore & memory.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shop = searchParams.get('shop') || process.env.SHOPIFY_STORE_DOMAIN || 'mediluxegulf.myshopify.com';

    if (!code) {
      return NextResponse.json({ success: false, error: 'No authorization code provided' }, { status: 400 });
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID || '';
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || '';

    // Exchange code for access token with Shopify
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Shopify OAuth Callback] Failed:', tokenData);
      return NextResponse.json({
        success: false,
        error: tokenData.error_description || tokenData.error || 'Failed to exchange token with Shopify'
      }, { status: 400 });
    }

    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope || '';

    // Persist token in Firestore configuration collection for high durability across serverless instances
    await adminDb.collection('app_settings').doc('shopify_integration').set({
      storeDomain: shop,
      accessToken,
      scopes,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[Shopify OAuth Callback] Successfully acquired and stored token for ${shop}`);

    // Redirect administrator back to Atlas Shopify Admin Hub
    return NextResponse.redirect(new URL('/admin/shopify?connected=true', request.url));
  } catch (err) {
    console.error('[Shopify OAuth Callback] Uncaught error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

