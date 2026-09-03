import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '../../../lib/firebaseAdmin';
import { sanitizePublicProtocol } from '../../../repositories/publicDataSanitizer';
import PublicProtocolPage from './PublicProtocolPage';

export const revalidate = 3600; // ⚡ Multi-Tier ISR (1 hour Edge Cache)
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://regenpept.com';

async function getPublicProtocol(slug) {
  if (!adminDb || !slug) return null;
  const target = decodeURIComponent(slug).toLowerCase().trim();

  let doc = null;

  // 1. Try by doc ID
  const byId = await adminDb.collection('protocols').doc(target).get().catch(() => null);
  if (byId?.exists) doc = byId;

  // 2. Try by slug field
  if (!doc) {
    const bySlug = await adminDb.collection('protocols').where('slug', '==', target).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  // 3. Try prefix match
  if (!doc) {
    const byPrefix = await adminDb.collection('protocols')
      .where('slug', '>=', target).where('slug', '<=', target + '\uf8ff')
      .limit(1).get().catch(() => null);
    if (byPrefix && !byPrefix.empty) doc = byPrefix.docs[0];
  }

  if (!doc) return null;

  const raw = { id: doc.id, ...doc.data() };
  if (raw.status === 'archived' || raw.status === 'hidden') return null;

  // 🛡️ Zero-Trust Sanitization
  return sanitizePublicProtocol(raw);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const protocol = await getPublicProtocol(slug);

  if (!protocol) {
    return {
      title: 'Clinical Protocol Not Found | Atlas App',
      description: 'The requested clinical protocol does not exist or is unavailable.',
    };
  }

  const name = protocol.name || protocol.title || 'Clinical Protocol';
  const category = protocol.category || protocol.goal || protocol.therapeutic_category || 'Clinical Protocol';
  const desc = (protocol.summary || protocol.description || protocol.clinicalRationale || 'Detailed clinical protocol schedule and administration guidance.').substring(0, 160);

  // 🎨 Dynamic OpenGraph preview card
  const ogImageUrl = `${BASE_URL}/api/og-card?type=protocol&title=${encodeURIComponent(name)}&badge=${encodeURIComponent(category)}&subtitle=${encodeURIComponent(`${protocol.durationWeeks || 8} Weeks · Clinical Protocol Guide`)}`;

  return {
    title: `${name} — Protocol Guide | Atlas App`,
    description: desc,
    openGraph: {
      title: `${name} — Protocol Guide | Atlas App`,
      description: desc,
      url: `${BASE_URL}/proto/${slug}`,
      siteName: 'Atlas Health Clinical',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${name} Clinical Protocol Guide`,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Protocol Guide`,
      description: desc,
      images: [ogImageUrl],
    },
    robots: { index: true, follow: true },
  };
}

import { generateProtocolJsonLd } from '../../../utils/seoStructuredData';

export default async function PublicProtocolRoute({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const protocol = await getPublicProtocol(slug);

  if (!protocol) {
    notFound();
  }

  const jsonLd = generateProtocolJsonLd(protocol, BASE_URL);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicProtocolPage protocol={protocol} slug={slug} baseUrl={BASE_URL} />
    </>
  );
}
