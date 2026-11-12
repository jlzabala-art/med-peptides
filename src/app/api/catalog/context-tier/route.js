import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog/context-tier?cat=CAT-XXX&uid=USER_ID&email=EMAIL
 * Resolves the latest role, pricingChannel, and companyName from Firestore
 * so that if a user registers or an admin updates their conditions in Firebase,
 * the product detail page dynamically reflects the updated role price.
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const catId = searchParams.get('cat') || '';
    const uid = searchParams.get('uid') || '';
    const email = searchParams.get('email') || '';

    let resolvedTier = null;
    let resolvedRole = null;
    let companyName = '';
    let markupPercent = 0;
    let targetUid = uid;
    let targetEmail = email;

    if (catId) {
      const catSnap = await adminDb.collection('shared_catalog_links').doc(catId).get();
      if (catSnap.exists) {
        const catData = catSnap.data() || {};
        resolvedTier = catData.priceSource || catData.priceTier || null;
        resolvedRole = catData.recipientType || null;
        companyName = catData.companyName || catData.recipientName || '';
        markupPercent = Number(catData.priceMarkupPercent || 0);
        if (!targetUid && catData.recipientUserId) targetUid = String(catData.recipientUserId);
        if (!targetEmail && catData.recipientEmail) targetEmail = String(catData.recipientEmail);
        if (!targetUid && String(catData.recipientName || '').toLowerCase() === 'lorenzo') {
          targetUid = 'EFQ1QoRxhZOyFotVwgTd2DlVwME2';
        }
      }
    }

    // Live check against Firebase users collection in case the user registered or changed role/conditions
    let liveUser = null;
    if (targetUid) {
      const uSnap = await adminDb.collection('users').doc(targetUid).get();
      if (uSnap.exists) liveUser = uSnap.data();
    }
    if (!liveUser && targetEmail) {
      const uQuery = await adminDb.collection('users').where('email', '==', targetEmail.toLowerCase().trim()).limit(1).get();
      if (!uQuery.empty) liveUser = uQuery.docs[0].data();
    }

    if (liveUser) {
      if (liveUser.role) resolvedRole = liveUser.role;
      const userChannel = liveUser.pricingChannel || liveUser.priceTier;
      if (userChannel) {
        resolvedTier = userChannel === 'wholesale' || userChannel === 'wholeseller' ? 'wholesaler' : userChannel;
      } else if (liveUser.role === 'wholesaler' || liveUser.role === 'wholeseller') {
        resolvedTier = 'wholesaler';
      } else if (liveUser.role === 'doctor' || liveUser.role === 'clinic') {
        resolvedTier = 'clinic';
      } else if (liveUser.role === 'patient') {
        resolvedTier = 'retail';
      }
      if (liveUser.companyName || liveUser.institution) {
        companyName = liveUser.companyName || liveUser.institution;
      }
    }

    // Normalize tier key for TieredPriceShield ('wholesaler' | 'clinic' | 'retail' | 'cost')
    let canonicalTier = 'retail';
    const raw = String(resolvedTier || resolvedRole || '').toLowerCase();
    if (raw.includes('whole') || raw === 'supplier' || raw === 'distributor') {
      canonicalTier = 'wholesaler';
    } else if (raw.includes('clinic') || raw.includes('doctor') || raw === 'b2b') {
      canonicalTier = 'clinic';
    } else if (raw === 'cost' || raw === 'b2b-dir') {
      canonicalTier = 'cost';
    } else if (raw.includes('retail') || raw.includes('patient')) {
      canonicalTier = 'retail';
    } else if (resolvedTier) {
      canonicalTier = resolvedTier;
    }

    return NextResponse.json({
      ok: true,
      tier: canonicalTier,
      role: resolvedRole || canonicalTier,
      companyName,
      markupPercent
    });
  } catch (err) {
    console.warn('[/api/catalog/context-tier] Error:', err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

