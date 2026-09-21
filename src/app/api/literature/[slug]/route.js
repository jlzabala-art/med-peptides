import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { getCuratedPeptideLiterature } from '@/data/peptideLiteratureRegistry';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Server-side in-memory micro-cache
const SERVER_CACHE = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const cleanPharmaName = (name) => {
  if (!name) return '';
  let clean = name.replace(/\s*\([^)]*\)/g, '');
  if (clean.includes('+')) clean = clean.split('+')[0].trim();
  if (clean.includes('/')) clean = clean.split('/')[0].trim();
  clean = clean.replace(/\s+with\s+DAC\b/gi, '');
  clean = clean.replace(/\s+without\s+DAC\b/gi, '');
  clean = clean.replace(/\s+DAC\b/gi, '');
  clean = clean.replace(/\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|ui|spu)\b/gi, '');
  clean = clean.replace(/\/?\s?vial\b/gi, '');
  clean = clean.replace(/\b(pure|grade|research|lyophilized|acetate)\b/gi, '');
  return clean.trim();
};

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || slug;
    const cacheKey = slug.toLowerCase();

    // 1. Check in-memory server cache (0ms)
    const cachedEntry = SERVER_CACHE.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          'X-Cache': 'HIT-MEMORY',
        }
      });
    }

    // 2. Check Curated Local Registry (0ms, highest academic quality)
    const productMock = { slug, name };
    const curated = getCuratedPeptideLiterature(productMock);
    if (curated && curated.length > 0) {
      SERVER_CACHE.set(cacheKey, { data: curated, timestamp: Date.now() });
      return NextResponse.json(curated, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          'X-Cache': 'HIT-CURATED',
        }
      });
    }

    // 3. Check Firestore pubmed_cache via adminDb
    if (adminDb) {
      try {
        const snap = await adminDb.collection('pubmed_cache').doc(slug).get();
        if (snap.exists) {
          const docData = snap.data();
          if (docData?.articles && docData.articles.length > 0) {
            SERVER_CACHE.set(cacheKey, { data: docData.articles, timestamp: Date.now() });
            return NextResponse.json(docData.articles, {
              headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                'X-Cache': 'HIT-FIRESTORE',
              }
            });
          }
        }
      } catch (err) {
        console.warn('[API Literature] Firestore cache read warning:', err.message);
      }
    }

    // 4. Fetch from NCBI PubMed API (Server-side)
    const searchQuery = cleanPharmaName(name) || slug;
    const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    const searchData = await searchRes.json().catch(() => ({}));
    const ids = searchData.esearchresult?.idlist || [];

    let articles = [];
    if (ids.length > 0) {
      const summaryUrl = `${API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
      const summaryRes = await fetch(summaryUrl, { next: { revalidate: 86400 } });
      const summaryData = await summaryRes.json().catch(() => ({}));

      articles = ids.map(id => {
        const info = summaryData.result?.[id];
        if (!info) return null;
        return {
          pmid: id,
          title: (info.title || 'Scientific Publication').replace(/<\/?[^>]+(>|$)/g, ""),
          journal: (info.fulljournalname || info.source || 'Medical Journal').toUpperCase(),
          year: info.pubdate ? parseInt(info.pubdate.substring(0, 4)) : 'N/D',
          pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        };
      }).filter(Boolean);
    }

    // Save to Firestore adminDb in background
    if (adminDb) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 14);
      adminDb.collection('pubmed_cache').doc(slug).set({
        productSlug: slug,
        queryUsed: searchQuery,
        articles,
        expiresAt: expires,
        lastUpdated: new Date()
      }, { merge: true }).catch(() => {});
    }

    SERVER_CACHE.set(cacheKey, { data: articles, timestamp: Date.now() });

    return NextResponse.json(articles, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'MISS-FETCHED',
      }
    });
  } catch (error) {
    console.error('[API Literature] Fatal error in literature endpoint:', error);
    return NextResponse.json([], { status: 200 });
  }
}
