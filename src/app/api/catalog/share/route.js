import { NextResponse } from 'next/server';
import { generateSignedQuoteToken } from '@/services/dynamicPricingEngine';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      supplierId = null,
      catalogueFilter = null,
      productIds = [],
      variantIds = [],
      category = 'all',
      priceSource = 'cost', // 'cost' | 'wholeseller' | 'clinic' | 'retail'
      priceMarkupPercent = 20,
      currency = 'USD',
      recipientName = 'Valued Partner',
      recipientType = 'clinic', // 'doctor' | 'clinic' | 'wholesaler' | 'patient'
      accountManagerName = 'Atlas Commercial Desk',
      accountManagerEmail = 'orders@atlas-solutions.com',
      validityDays = 30,
      notes = ''
    } = body;

    const catalogPayload = {
      catalogId: `CAT-${Date.now().toString(36).toUpperCase()}`,
      supplierId,
      catalogueFilter,
      productIds,
      variantIds,
      category,
      priceSource,
      priceMarkupPercent: Number(priceMarkupPercent) || 0,
      currency,
      recipientName,
      recipientType,
      accountManagerName,
      accountManagerEmail,
      validityDays,
      notes,
      issuedAt: new Date().toISOString()
    };

    const token = generateSignedQuoteToken(catalogPayload, validityDays * 24);
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareableUrl = `${origin}/shared/catalog/${token}`;

    // Persist link record in Firestore for analytics and remote revocation
    try {
      const linkId = catalogPayload.catalogId;
      await adminDb.collection('shared_catalog_links').doc(linkId).set({
        catalogId: linkId,
        supplierId,
        catalogueFilter,
        priceSource,
        priceMarkupPercent: Number(priceMarkupPercent) || 0,
        currency,
        recipientName,
        recipientType,
        accountManagerName,
        accountManagerEmail,
        validityDays,
        token,
        status: 'active', // 'active' | 'revoked'
        visitsCount: 0,
        lastVisitedAt: null,
        expiresAt: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn('[share/route.js] Could not persist link in Firestore:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      catalogId: catalogPayload.catalogId,
      shareableUrl,
      token,
      catalog: catalogPayload
    });

  } catch (error) {
    console.error('Catalog share error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate shared catalog link' }, { status: 500 });
  }
}
