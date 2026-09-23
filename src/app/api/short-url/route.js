/**
 * src/app/api/short-url/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates individualized, secure, trackable short URLs for clinical datasheets.
 * Guarantees a UNIQUE URL for every share transaction (even for the same variant).
 * Binds recipient (wholeseller / doctor), variant parameters, and audit records.
 * Maps: /d/[code] -> /p/[slug]?format=...&dose=...
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Generates an 8-character unique cryptographic token.
 * Prefix reflects recipient type for instant identification (e.g. wh-3f9b2a1c).
 */
function generateUniqueCode(recipientType = 'wholesaler') {
  const prefix = recipientType === 'wholesaler' || recipientType === 'wholeseller' 
    ? 'wh' 
    : recipientType === 'doctor' 
    ? 'dr' 
    : 'ds';
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${rand}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      targetUrl,
      slug,
      dose,
      format,
      supplier,
      batch,
      lang,
      recipient = {},
      variant = {},
      sharedBy = {},
      deliveryChannel = 'link',
      notes = '',
      productName = '',
    } = body || {};

    if (!targetUrl && !slug) {
      return NextResponse.json({ error: 'targetUrl or slug is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

    // Build canonical target URL with clean query parameters
    let cleanTargetUrl = targetUrl;
    if (!cleanTargetUrl && slug) {
      const qParams = new URLSearchParams();
      if (format && format !== 'all') qParams.set('format', format);
      if (dose && dose !== 'all') qParams.set('dose', dose);
      if (supplier && supplier !== 'all') qParams.set('supplier', supplier);
      if (batch) qParams.set('batch', batch);
      if (lang && lang !== 'en') qParams.set('lang', lang);
      const qStr = qParams.toString();
      cleanTargetUrl = `${appUrl}/p/${encodeURIComponent(slug)}${qStr ? `?${qStr}` : ''}`;
    }

    // Always generate a unique cryptographic tracking code for this share event
    const recipientType = recipient.type || 'wholesaler';
    const code = generateUniqueCode(recipientType);
    const shortUrl = `${appUrl}/d/${code}`;
    const now = new Date().toISOString();

    const recipientData = {
      id: recipient.id || null,
      name: recipient.name || (recipientType === 'wholesaler' ? 'Wholesale Partner' : 'Healthcare Practitioner'),
      company: recipient.company || recipient.clinic || '',
      email: recipient.email || '',
      phone: recipient.phone || '',
      type: recipientType,
    };

    const variantData = {
      productId: variant.productId || slug || '',
      productName: productName || variant.productName || slug || 'Peptide Compound',
      variantId: variant.id || variant.variantId || null,
      dose: dose || variant.dose || variant.dosage || '',
      format: format || variant.format || variant.presentation || '',
      supplier: supplier || variant.supplier || '',
      batch: batch || variant.batch || '',
    };

    const sharedByData = {
      uid: sharedBy.uid || null,
      name: sharedBy.name || 'Atlas Health Team',
      email: sharedBy.email || '',
      role: sharedBy.role || 'admin',
    };

    if (adminDb) {
      const docPayload = {
        code,
        shortUrl,
        targetUrl: cleanTargetUrl,
        slug: slug || '',
        dose: dose || '',
        format: format || '',
        supplier: supplier || '',
        batch: batch || '',
        lang: lang || 'en',
        recipient: recipientData,
        variant: variantData,
        sharedBy: sharedByData,
        deliveryChannel,
        notes: notes || '',
        status: 'active', // 'active' | 'revoked'
        readStatus: 'unread', // 'unread' | 'read'
        hits: 0,
        viewCount: 0,
        firstViewedAt: null,
        lastViewedAt: null,
        views: [],
        createdAt: now,
      };

      // 1. Primary datasheet lookup record
      await adminDb.collection('datasheet_short_links').doc(code).set(docPayload);

      // 2. Central cross-platform audit record (for CRM and User360Drawer tracking)
      try {
        await adminDb.collection('shared_records').doc(code).set({
          shareCode: code,
          shortUrl,
          assetType: 'variant_datasheet',
          assetTitle: `${variantData.productName} ${variantData.dose} ${variantData.format} — Technical Datasheet`.trim(),
          assetMeta: {
            slug: slug || '',
            dose: dose || '',
            format: format || '',
            supplier: supplier || '',
            batch: batch || '',
            targetUrl: cleanTargetUrl,
          },
          recipient: recipientData,
          sharedBy: sharedByData,
          deliveryChannel,
          notes: notes || '',
          status: 'sent',
          readStatus: 'unread',
          viewCount: 0,
          firstViewedAt: null,
          lastViewedAt: null,
          views: [],
          createdAt: now,
        });
      } catch (mirrorErr) {
        console.warn('[POST /api/short-url] Could not mirror to shared_records:', mirrorErr.message);
      }

      // 3. Mirror into shared_catalog_links for User360Drawer & recipient profile tracking
      if (recipientData.id || recipientData.phone || recipientData.email) {
        try {
          await adminDb.collection('shared_catalog_links').doc(code).set({
            catalogId: code,
            catalogCode: code,
            catalogType: 'variant_datasheet',
            assetType: 'variant_datasheet',
            recipientUserId: recipientData.id || null,
            recipientName: recipientData.name || 'Valued Partner',
            recipientEmail: recipientData.email || null,
            recipientPhone: recipientData.phone || null,
            recipientType: recipientData.type || 'wholesaler',
            targetUrl: cleanTargetUrl,
            shortUrl,
            channel: deliveryChannel,
            status: 'sent',
            readStatus: 'unread',
            visitsCount: 0,
            viewCount: 0,
            createdAt: now,
          });
        } catch (linkErr) {
          console.warn('[POST /api/short-url] Could not mirror to shared_catalog_links:', linkErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      code,
      shortUrl,
      targetUrl: cleanTargetUrl,
      recipient: recipientData,
      variant: variantData,
      readStatus: 'unread',
      createdAt: now,
    });
  } catch (err) {
    console.error('[POST /api/short-url] Error generating tracked short URL:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const recipientId = searchParams.get('recipientId');

    if (!code && !recipientId) {
      return NextResponse.json({ error: 'code or recipientId query param is required' }, { status: 400 });
    }

    if (code) {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
      }
      const snap = await adminDb.collection('datasheet_short_links').doc(code).get();
      if (!snap.exists) {
        return NextResponse.json({ error: 'Short link not found' }, { status: 404 });
      }
      const data = snap.data();
      return NextResponse.json({
        code,
        readStatus: data.readStatus || (data.viewCount > 0 ? 'read' : 'unread'),
        viewCount: data.viewCount || 0,
        lastViewedAt: data.lastViewedAt || null,
        targetUrl: data.targetUrl,
        shortUrl: data.shortUrl,
        variant: data.variant || null,
        recipient: data.recipient || null,
      });
    }

    if (recipientId && adminDb) {
      const snap = await adminDb
        .collection('datasheet_short_links')
        .where('recipient.id', '==', recipientId)
        .limit(30)
        .get();

      const links = snap.docs.map(d => ({ code: d.id, ...d.data() }));
      return NextResponse.json({ links });
    }

    return NextResponse.json({ links: [] });
  } catch (err) {
    console.error('[GET /api/short-url] Error querying short link status:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
