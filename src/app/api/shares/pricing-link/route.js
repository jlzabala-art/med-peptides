import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { normalizeRole, normalizePricingMarket } from '@/constants/roles';

const ALLOWED_SHARE_ROLES = new Set(['distributor', 'wholesaler', 'clinic', 'doctor', 'patient', 'guest']);
const COLLECTION = 'shared_pricing_links';

function makeToken() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 10);
}

const createShareSchema = z.object({
  route: z.string().optional().default('/pricing/peptides'),
  role: z.string().optional().default('wholesaler'),
  market: z.string().optional().default('global'),
  currency: z.string().nullable().optional(),
  recipientName: z.string().optional().default(''),
  ttlDays: z.coerce.number().optional().default(14),
});

const patchShareSchema = z.object({
  token: z.string().min(1).max(32),
  action: z.enum(['revoke', 'restore', 'extend']),
  ttlDays: z.coerce.number().optional(),
});

/**
 * GET /api/shares/pricing-link?token=XXXX | ?list=1
 */
export const GET = withApiHandler(
  async ({ searchParams, isAdmin, db }) => {
    if (searchParams.get('list') === '1') {
      if (!isAdmin) {
        return NextResponse.json({ ok: false, error: 'Admin authorization required' }, { status: 403 });
      }
      const snap = await db
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
      return { links };
    }

    const token = String(searchParams.get('token') || '').trim();
    if (!token || token.length > 32) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }

    const snap = await db.collection(COLLECTION).doc(token).get();
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

    return {
      grant: {
        token,
        route: data.route || '/pricing/peptides',
        role: ALLOWED_SHARE_ROLES.has(data.role) ? data.role : 'wholesaler',
        market: normalizePricingMarket(data.market || 'global'),
        currency: data.currency || null,
        recipientName: data.recipientName || '',
        expiresAt: data.expiresAt || null,
      },
    };
  },
  { auth: 'public', requireDb: true }
);

/**
 * POST /api/shares/pricing-link
 */
export const POST = withApiHandler(
  async ({ body, db }) => {
    const rawRoute = String(body.route || '/pricing/peptides').trim();
    const route = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`;
    const normalizedRole = normalizeRole(body.role || 'wholesaler');
    const safeRole = ALLOWED_SHARE_ROLES.has(normalizedRole) ? normalizedRole : 'wholesaler';
    const safeMarket = normalizePricingMarket(body.market || 'global');
    const safeCurrency = body.currency ? String(body.currency).toUpperCase().slice(0, 4) : null;
    const recipientName = String(body.recipientName || '').trim().slice(0, 120);
    const ttlDays = Math.min(Math.max(Number(body.ttlDays) || 14, 1), 90);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
    const token = makeToken();

    await db.collection(COLLECTION).doc(token).set({
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
    return {
      token,
      url: `${origin}/s/${token}`,
      grant: { route, role: safeRole, market: safeMarket, currency: safeCurrency, expiresAt },
    };
  },
  { auth: 'admin', requireDb: true, bodySchema: createShareSchema }
);

/**
 * PATCH /api/shares/pricing-link
 */
export const PATCH = withApiHandler(
  async ({ body, db }) => {
    const token = body.token.trim();
    const action = body.action;
    const ref = db.collection(COLLECTION).doc(token);
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
    return {
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
    };
  },
  { auth: 'admin', requireDb: true, bodySchema: patchShareSchema }
);
