/**
 * src/app/api/short-url/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates and stores clean, short URLs for clinical datasheets & monographs.
 * Maps: /d/[code] -> /p/[slug]?format=...&strength=...&supplier=...
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

function generateShortCode(str) {
  return crypto.createHash('sha256').update(str).digest('base64url').slice(0, 7);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { targetUrl, slug, dose, format, supplier, batch, lang } = body || {};

    if (!targetUrl && !slug) {
      return NextResponse.json({ error: 'targetUrl or slug is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
    const cleanTargetUrl = targetUrl || `${appUrl}/p/${slug}`;
    const code = generateShortCode(cleanTargetUrl);

    if (adminDb) {
      const docRef = adminDb.collection('datasheet_short_links').doc(code);
      const existing = await docRef.get();
      if (!existing.exists) {
        await docRef.set({
          code,
          targetUrl: cleanTargetUrl,
          slug: slug || '',
          dose: dose || '',
          format: format || '',
          supplier: supplier || '',
          batch: batch || '',
          lang: lang || 'en',
          createdAt: new Date().toISOString(),
          hits: 0
        });
      }
    }

    const shortUrl = `${appUrl}/d/${code}`;
    return NextResponse.json({
      success: true,
      code,
      shortUrl,
      targetUrl: cleanTargetUrl
    });
  } catch (err) {
    console.error('Failed to generate short URL:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
