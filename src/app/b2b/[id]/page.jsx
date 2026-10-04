import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import B2BShowcaseClientView from './B2BShowcaseClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  let title = 'Institutional B2B Peptide Showcase • Atlas Biopharma';
  let description = 'Curated bio-active clinical peptide portfolio with certified RP-HPLC purity dossiers.';

  try {
    if (adminDb && id) {
      const snap = await adminDb.collection('b2b_showcases').doc(id).get();
      if (snap.exists) {
        const data = snap.data();
        if (data?.aiContent?.heroTitle) {
          title = `${data.aiContent.heroTitle} • ${data.clientName || 'Atlas Portfolio'}`;
          description = data.aiContent.heroSubtitle || description;
        }
      }
    }
  } catch (e) {
    // Fallback to defaults
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
  const ogImageUrl = `${appUrl}/og-catalog.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/b2b/${id}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl]
    }
  };
}

export default async function B2BShowcasePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  let showcase = null;

  if (adminDb && id) {
    try {
      const snap = await adminDb.collection('b2b_showcases').doc(id).get();
      if (snap.exists) {
        showcase = { id: snap.id, ...snap.data() };
        // Increment view count asynchronously
        snap.ref.update({ views: (showcase.views || 0) + 1 }).catch(() => {});
      }
    } catch (err) {
      console.error('[B2B Showcase Page] Firestore load error:', err);
    }
  }

  if (!showcase) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          marginBottom: '1rem'
        }}>
          ⚠️
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          Portfolio Showcase Not Found
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', lineHeight: 1.5 }}>
          The requested institutional portfolio showcase may have expired, or the identification code is incorrect.
        </p>
        <a
          href="/catalog"
          style={{
            marginTop: '1.25rem',
            padding: '10px 20px',
            backgroundColor: '#003666',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}
        >
          Explore Full Master Catalog
        </a>
      </div>
    );
  }

  return <B2BShowcaseClientView showcase={showcase} />;
}
