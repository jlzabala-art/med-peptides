import { NextResponse } from 'next/server';
import { generateSignedQuoteToken } from '@/services/dynamicPricingEngine';
import { adminDb } from '@/lib/firebaseAdmin';
import { generatePharmaBatchCode } from '@/utils/pharmaBarcode';

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
      recipientUserId = null,
      recipientName = 'Valued Partner',
      recipientEmail = '',
      recipientPhone = '',
      recipientType = 'clinic', // 'doctor' | 'clinic' | 'wholesaler' | 'patient'
      accountManagerName = 'Atlas Commercial Desk',
      accountManagerEmail = 'orders@atlas-solutions.com',
      validityDays = 30,
      channel = 'whatsapp',
      sentBy = 'admin',
      notes = ''
    } = body;

    const issuedAt = new Date().toISOString();
    const batchCode = generatePharmaBatchCode({
      supplierId,
      catalogueFilter,
      issuedAt,
      priceMarkupPercent: Number(priceMarkupPercent) || 0,
      prefix: 'RP'
    });

    const catalogPayload = {
      catalogId: `CAT-${Date.now().toString(36).toUpperCase()}`,
      batchCode,
      supplierId,
      catalogueFilter,
      productIds,
      variantIds,
      category,
      priceSource,
      priceMarkupPercent: Number(priceMarkupPercent) || 0,
      currency,
      recipientUserId,
      recipientName,
      recipientEmail,
      recipientPhone,
      recipientType,
      accountManagerName,
      accountManagerEmail,
      validityDays,
      notes,
      issuedAt
    };

    const token = generateSignedQuoteToken(catalogPayload, validityDays * 24);
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
    const shortUrl = `${origin}/c/${catalogPayload.catalogId}`;
    const longUrl = `${origin}/shared/catalog/${token}`;
    const shareableUrl = shortUrl; // Short link by default for clean WhatsApp sharing

    const linkId = catalogPayload.catalogId;

    // 1. Persist link record in Firestore collection `shared_catalog_links`
    try {
      await adminDb.collection('shared_catalog_links').doc(linkId).set({
        catalogId: linkId,
        batchCode,
        supplierId,
        catalogueFilter,
        priceSource,
        priceMarkupPercent: Number(priceMarkupPercent) || 0,
        currency,
        recipientUserId: recipientUserId || null,
        recipientName,
        recipientEmail: recipientEmail || null,
        recipientPhone: recipientPhone || null,
        recipientType,
        accountManagerName,
        accountManagerEmail,
        validityDays,
        token,
        shortUrl,
        longUrl,
        channel,
        sentBy,
        status: 'sent', // 'sent' | 'viewed' | 'engaged' | 'converted' | 'revoked'
        visitsCount: 0,
        lastVisitedAt: null,
        expiresAt: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn('[share/route.js] Could not persist link in Firestore:', dbErr.message);
    }

    // 2. Also register in universal `shared_records` for 360 User CRM tracking
    try {
      await adminDb.collection('shared_records').add({
        shareCode: linkId,
        assetType: 'shared_catalog',
        assetTitle: `Catalog • ${catalogueFilter || (supplierId ? supplierId.replace(/^supplier-/, '') : 'General')}`,
        assetMeta: {
          catalogId: linkId,
          supplierId,
          catalogueFilter,
          currency,
          priceSource,
          shortUrl,
          longUrl,
        },
        recipient: {
          id: recipientUserId || null,
          name: recipientName,
          email: recipientEmail || '',
          phone: recipientPhone || '',
          type: recipientType,
        },
        sharedBy: {
          name: accountManagerName,
          email: accountManagerEmail,
        },
        deliveryChannel: channel,
        status: 'sent',
        viewCount: 0,
        lastViewedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (shareRecErr) {
      console.warn('[share/route.js] Could not create shared_records log:', shareRecErr.message);
    }

    return NextResponse.json({
      success: true,
      catalogId: catalogPayload.catalogId,
      shortUrl,
      shareableUrl,
      longUrl,
      token,
      catalog: catalogPayload
    });

  } catch (error) {
    console.error('Catalog share error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate shared catalog link' }, { status: 500 });
  }
}
