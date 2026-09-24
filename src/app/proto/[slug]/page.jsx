import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '../../../lib/firebaseAdmin';
import { sanitizePublicProtocol } from '../../../repositories/publicDataSanitizer';
import { generateProtocolJsonLd } from '../../../utils/seoStructuredData';
import PublicProtocolPage from './PublicProtocolPage';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

// ⚡ Layer 1 In-Memory Server RAM Cache (Golden Rule #2)
const PUBLIC_PROTOCOL_RAM_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function invalidatePublicProtocolCache(slug) {
  if (!slug) {
    PUBLIC_PROTOCOL_RAM_CACHE.clear();
  } else {
    const s = decodeURIComponent(slug).toLowerCase().trim();
    for (const key of PUBLIC_PROTOCOL_RAM_CACHE.keys()) {
      if (key.startsWith(s)) PUBLIC_PROTOCOL_RAM_CACHE.delete(key);
    }
  }
}

const KNOWN_PROTOCOL_ALIASES = {
  // Weight & Incretin Metabolism
  'weight-management-structured-12w': 'wm_001',
  'structured-weight-management': 'wm_001',
  'glp-1-gip-receptor-dual-agonist-titration-protocol': 'wm_001',
  'personalized-metabolic-weight-loss-12w': 'wm_001',
  'metabolic-optimization-10w': 'met_001',
  // Cognitive & Neuro
  'cognitive-support-structured': 'cog_001',
  'cognitive-support-6w': 'cog_001',
  'focus-resilience-8w': 'cog_002',
  'lxv-neuro-restoration-12w': '3GocJWVon5tKgOASM3it',
  // Longevity & Bioenergetics
  'longevity-foundation-structured': 'lon_001',
  'longevity-foundation-12w': 'lon_001',
  'mitochondrial-energy-10w': 'energy_001',
  'mitochondrial-metabolic-support': 'energy_001',
  'nad-cellular-restoration-protocol': 'Ks2ThxuWoPmWzc3UW06R',
  'nad-cellular-restoration': 'Ks2ThxuWoPmWzc3UW06R',
  // Recovery & Tissue Repair
  'recovery-foundation-bpc-tb': 'rec_001',
  'injury-recovery-8w': 'rec_001',
  'bpc-157-tb-500-protocol': '1QR69jq0QQpu2NjCzpxg',
  // Hormonal & Endocrine Axis
  'hormonal-support-12w': 'horm_001',
  'kisspeptin-hpta-restart': 'horm_001',
  'gh-axis-support-12w': 'horm_002',
  'growth-hormone-optimization': 'horm_002',
  // Sleep & Circadian
  'sleep-restoration-8w': 'qmzQ9qVRiMGKwUS1x4LQ',
  'sleep-circadian-6w': 'LaK9aKR8CDhVLnBfxZYK',
  // Immune & Defense
  'immune-modulation-8w': 'immune_001',
  'immune-modulation-cellular': 'immune_001',
  'immune-defense-8w': 'immune_001',
  'thymosin-alpha-1-immune-resilience': '1k0p4FgSekpmUyAJhbsT',
};

async function getPublicProtocol(slug) {
  if (!adminDb || !slug) return null;
  const rawTarget = decodeURIComponent(slug).trim();
  const target = rawTarget.toLowerCase();

  // 1. Layer 1 Check: Instant RAM Cache (< 0.1ms)
  const cached = PUBLIC_PROTOCOL_RAM_CACHE.get(target);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let doc = null;

  // 0. Instant known alias resolution (O(1) doc ID lookup)
  if (KNOWN_PROTOCOL_ALIASES[target]) {
    const byAliasDoc = await adminDb.collection('protocols').doc(KNOWN_PROTOCOL_ALIASES[target]).get().catch(() => null);
    if (byAliasDoc?.exists) doc = byAliasDoc;
  }

  // 1. Try by exact raw doc ID (Firestore doc IDs are case-sensitive!)
  if (!doc) {
    const byExactId = await adminDb.collection('protocols').doc(rawTarget).get().catch(() => null);
    if (byExactId?.exists) doc = byExactId;
  }

  // 1b. Try by lowercased doc ID if different
  if (!doc && rawTarget !== target) {
    const byLowerId = await adminDb.collection('protocols').doc(target).get().catch(() => null);
    if (byLowerId?.exists) doc = byLowerId;
  }

  // 2. Try by slug field
  if (!doc) {
    const bySlug = await adminDb.collection('protocols').where('slug', '==', target).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  // 2b. Try by protocol_slug
  if (!doc) {
    const byProtoSlug = await adminDb.collection('protocols').where('protocol_slug', '==', target).limit(1).get().catch(() => null);
    if (byProtoSlug && !byProtoSlug.empty) doc = byProtoSlug.docs[0];
  }

  // 2c. Try by protocol_id
  if (!doc) {
    const byProtoId = await adminDb.collection('protocols').where('protocol_id', '==', target).limit(1).get().catch(() => null);
    if (byProtoId && !byProtoId.empty) doc = byProtoId.docs[0];
  }

  // 2d. Try by aliases array-contains
  if (!doc) {
    const byAlias = await adminDb.collection('protocols').where('aliases', 'array-contains', target).limit(1).get().catch(() => null);
    if (byAlias && !byAlias.empty) doc = byAlias.docs[0];
  }

  // 2e. Try by legacy_slug
  if (!doc) {
    const byLegacy = await adminDb.collection('protocols').where('legacy_slug', '==', target).limit(1).get().catch(() => null);
    if (byLegacy && !byLegacy.empty) doc = byLegacy.docs[0];
  }

  // 3. Fallback: Search all active/published protocols by slugified name, title, or stored aliases
  if (!doc) {
    const allActive = await adminDb.collection('protocols')
      .where('status', 'in', ['active', 'published'])
      .limit(100)
      .get()
      .catch(() => null);
    if (allActive && !allActive.empty) {
      for (const d of allActive.docs) {
        const data = d.data();
        const slugName = String(data.name || data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (
          slugName === target ||
          data.legacy_slug === target ||
          (Array.isArray(data.aliases) && data.aliases.includes(target)) ||
          slugName.includes(target) ||
          target.includes(slugName)
        ) {
          doc = d;
          break;
        }
      }
    }
  }

  if (!doc) return null;

  const raw = { id: doc.id, slug: doc.data()?.slug || doc.data()?.protocol_slug || doc.id, ...doc.data() };
  if (raw.status === 'archived' || raw.status === 'hidden') return null;

  // 🛡️ Zero-Trust Sanitization
  const result = sanitizePublicProtocol(raw);

  // Populate Layer 1 RAM Cache
  PUBLIC_PROTOCOL_RAM_CACHE.set(target, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return result;
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
