import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { normalizeRole, normalizePricingMarket } from '@/constants/roles';

const ALLOWED_SHARE_ROLES = new Set(['distributor', 'wholesaler', 'clinic', 'doctor', 'patient', 'guest']);
const COLLECTION = 'shared_pricing_links';

function makeToken() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 10);
}

/**
 * GET /api/shares/pricing-link?token=XXXX
 * Resolves an active, non-expired Role + Market share grant.
 * GET /api/shares/pricing-link?list=1
 * Admin-only: lists recent signed share links for the Admin Share Manager.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('list') === '1') {
    const isAdmin = await isAdminServerSession();
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Admin authorization required' }, { status: 403 });
    }
    if (!adminDb) {
      return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
    }
    try {
      const snap = await adminDb
        .collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
      const links = snap.docs.map((doc) => {
        const d = doc.data() || {};
        return {
          token: doc.id,
          route: d.route || '/pricing/peptides',
          role: d.role || 'wholesaler',
          market: normalizePricingMarket(d.market || 'global'),
          currency: d.currency || null,
          recipientName: d.recipientName || '',
          expiresAt: d.expiresAt || null,
          createdAt: d.createdAt || null,
          views: Number(d.views || 0),
          revoked: Boolean(d.revoked),
        };
      });
      return NextResponse.json({ ok: true, links });
    } catch (err) {
      console.error('[api/shares/pricing-link GET list]', err);
      return NextResponse.json({ ok: false, error: 'Failed to list share links' }, { status: 500 });
    }
  }

  const token = String(searchParams.get('token') || '').trim();
  if (!token || token.length > 32) {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
  }
  if (!adminDb) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const snap = await adminDb.collection(COLLECTION).doc(token).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: 'Link not found' }, { status: 404 });
    }
    const data = snap.data() || {};
    if (data.revoked) {
      return NextResponse.json({ ok: false, error: 'Link revoked' }, { status: 410 });
    }
    if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: 'Link expired' }, { status: 410 });
    }

    return NextResponse.json({
      ok: true,
      grant: {
        token,
        route: data.route || '/pricing/peptides',
        role: ALLOWED_SHARE_ROLES.has(data.role) ? data.role : 'wholesaler',
        market: normalizePricingMarket(data.market || 'global'),
        currency: data.currency || null,
        recipientName: data.recipientName || '',
        expiresAt: data.expiresAt || null,
      },
    });
  } catch (err) {
    console.error('[api/shares/pricing-link GET]', err);
    return NextResponse.json({ ok: false, error: 'Failed to resolve share link' }, { status: 500 });
  }
}

/**
 * POST /api/shares/pricing-link
 * Admin-only: creates a signed Role + Market + Expiry share link.
 */
export async function POST(req) {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'Admin authorization required' }, { status: 403 });
  }
  if (!adminDb) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const rawRoute = String(body.route || '/pricing/peptides').trim();
  const route = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`;
  const normalizedRole = normalizeRole(body.role || 'wholesaler');
  // Security invariant: a share link can NEVER grant admin privileges
  const safeRole = ALLOWED_SHARE_ROLES.has(normalizedRole) ? normalizedRole : 'wholesaler';
  const safeMarket = normalizePricingMarket(body.market || 'global');
  const safeCurrency = body.currency ? String(body.currency).toUpperCase().slice(0, 4) : null;
  const recipientName = String(body.recipientName || '').trim().slice(0, 120);
  const ttlDays = Math.min(Math.max(Number(body.ttlDays) || 14, 1), 90);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  const token = makeToken();

  try {
    await adminDb.collection(COLLECTION).doc(token).set({
      token,
      route,
      role: safeRole,
      market: safeMarket,
      currency: safeCurrency,
      recipientName,
      expiresAt,
      views: 0,
      revoked: false,
      createdAt: new Date().toISOString(),
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.atlashealth-services.com';
    return NextResponse.json({
      ok: true,
      token,
      url: `${origin}/s/${token}`,
      grant: { route, role: safeRole, market: safeMarket, currency: safeCurrency, expiresAt },
    });
  } catch (err) {
    console.error('[api/shares/pricing-link POST]', err);
    return NextResponse.json({ ok: false, error: 'Failed to create share link' }, { status: 500 });
  }
}

/**
 * PATCH /api/shares/pricing-link
 * Admin-only: revokes, restores, or extends an existing share link.
 */
export async function PATCH(req) {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'Admin authorization required' }, { status: 403 });
  }
  if (!adminDb) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const token = String(body.token || '').trim();
  const action = String(body.action || '').trim().toLowerCase();
  if (!token || token.length > 32) {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
  }
  if (!['revoke', 'restore', 'extend'].includes(action)) {
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  }

  try {
    const ref = adminDb.collection(COLLECTION).doc(token);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: 'Link not found' }, { status: 404 });
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (action === 'revoke') {
      updates.revoked = true;
    } else if (action === 'restore') {
      updates.revoked = false;
    } else if (action === 'extend') {
      const addDays = Math.min(Math.max(Number(body.ttlDays) || 7, 1), 90);
      const currentExpiry = snap.data()?.expiresAt ? new Date(snap.data().expiresAt).getTime() : 0;
      const baseMs = Math.max(Date.now(), Number.isFinite(currentExpiry) ? currentExpiry : 0);
      updates.expiresAt = new Date(baseMs + addDays * 24 * 60 * 60 * 1000).toISOString();
      updates.revoked = false;
    }

    await ref.update(updates);
    const updatedSnap = await ref.get();
    const d = updatedSnap.data() || {};
    return NextResponse.json({
      ok: true,
      link: {
        token: updatedSnap.id,
        route: d.route || '/pricing/peptides',
        role: d.role || 'wholesaler',
        market: normalizePricingMarket(d.market || 'global'),
        currency: d.currency || null,
        recipientName: d.recipientName || '',
        expiresAt: d.expiresAt || null,
        createdAt: d.createdAt || null,
        views: Number(d.views || 0),
        revoked: Boolean(d.revoked),
      },
    });
  } catch (err) {
    console.error('[api/shares/pricing-link PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Failed to update share link' }, { status: 500 });
  }
}
