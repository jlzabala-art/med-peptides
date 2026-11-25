import { adminDb } from '@/lib/firebaseAdmin';
import { protocolRepository } from '../repositories/protocolRepository';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

const STATIC_PUBLIC_ROUTES = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/pricing/pellets', changeFrequency: 'daily', priority: 0.95 },
  { path: '/pricing/peptides', changeFrequency: 'daily', priority: 0.95 },
  { path: '/vials', changeFrequency: 'daily', priority: 0.95 },
  { path: '/pricing/pens', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing/bhrt', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing/hormones', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing/bloodo', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing/24genetics', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing/fillers', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing/colway', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/proto', changeFrequency: 'daily', priority: 0.9 },
  { path: '/protocol-finder', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/guides/hormone-pellets-implantation', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/import-partner', changeFrequency: 'monthly', priority: 0.8 },
];

const BLOCKED_SLUG_RE = /(pharmapolis|nplab|dnlab|bulgaria)/i;

export default async function sitemap() {
  const now = new Date();
  const entries = STATIC_PUBLIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    if (adminDb) {
      const snap = await adminDb.collection('products').limit(500).get().catch(() => null);
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const p = doc.data() || {};
          if (p.status === 'archived' || p.status === 'hidden' || p.isActive === false) return;
          const slug = String(p.slug || doc.id || '').trim();
          if (!slug || BLOCKED_SLUG_RE.test(slug)) return;
          entries.push({
            url: `${BASE_URL}/p/${encodeURIComponent(slug)}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      }
    }
  } catch {
    // Non-blocking fallback to static routes
  }

  try {
    const protocols = await protocolRepository.getAllProtocols();
    (protocols || []).forEach((proto) => {
      const slug = String(proto.protocol_slug || proto.slug || proto.id || '').trim();
      if (!slug || BLOCKED_SLUG_RE.test(slug)) return;
      entries.push({
        url: `${BASE_URL}/proto/${encodeURIComponent(slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch {
    // Non-blocking fallback
  }

  return entries;
}
