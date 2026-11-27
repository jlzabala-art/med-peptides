import React from 'react';
import { redirect } from 'next/navigation';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { normalizePricingMarket } from '@/constants/roles';

export const dynamic = 'force-dynamic';

export default async function SharedPricingLinkRedirectPage({ params }) {
  const { token } = await params;
  const cleanToken = String(token || '').trim();

  if (!cleanToken || !adminDb) {
    return <ExpiredLinkView reason="This private schedule link is invalid or unavailable." />;
  }

  let data = null;
  try {
    const ref = adminDb.collection('shared_pricing_links').doc(cleanToken);
    const snap = await ref.get();
    if (!snap.exists) {
      return <ExpiredLinkView reason="This private schedule link does not exist or has been removed." />;
    }
    data = snap.data() || {};
    if (data.revoked) {
      return <ExpiredLinkView reason="This private schedule link has been revoked by Atlas Health Services." />;
    }
    if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
      return <ExpiredLinkView reason="This private schedule link has expired. Please request a fresh link from your Atlas representative." />;
    }

    // Track view asynchronously (non-blocking)
    ref.set(
      {
        views: FieldValue.increment(1),
        lastViewedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  } catch (err) {
    console.error('[s/[token]] lookup error:', err);
    return <ExpiredLinkView reason="Unable to verify this schedule link right now." />;
  }

  const baseRoute = String(data.route || '/pricing/peptides').startsWith('/')
    ? String(data.route || '/pricing/peptides')
    : '/pricing/peptides';
  const market = normalizePricingMarket(data.market || 'global');
  const sep = baseRoute.includes('?') ? '&' : '?';
  const qp = new URLSearchParams({ share_token: cleanToken });
  if (market && market !== 'global') qp.set('market', market);
  if (data.currency) qp.set('currency', String(data.currency).toUpperCase());

  redirect(`${baseRoute}${sep}${qp.toString()}`);
}

function ExpiredLinkView({ reason }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '12px',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Atlas Health Services
        </div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#202124', margin: '10px 0 8px' }}>
          Schedule Link Unavailable
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#5f6368', lineHeight: 1.5, margin: 0 }}>
          {reason}
        </p>
      </div>
    </main>
  );
}
