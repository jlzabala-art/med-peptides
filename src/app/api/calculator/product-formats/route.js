import { NextResponse } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { deriveCanonicalIdentity } from '@/utils/canonicalProductRegistry';
import { normalizeCanonicalStrength } from '@/utils/productVariantProcessing';
import { LOTUSLAND_PEPTIDES } from '@/data/lotuslandPeptidesRegistry';

export const dynamic = 'force-dynamic';

// Layer 1 Server RAM Cache (Golden Rule #2: 10-minute TTL)
const FORMATS_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const CANONICAL_FORMAT_ORDER = ['vial', 'pen', 'cartridge', 'spray', 'capsule', 'topical'];

const RAW_API_EXCLUDE_RE = /\b(bulk\s*api|bulk\s*powder|bulk\s*liquid|raw\s*material|raw\s*api|api\s*powder|raw\s*powder|active\s*pharmaceutical\s*ingredient|empty\s*capsule)\b/i;
const NON_PEPTIDE_EXCLUDE_RE = /\b(trocar|pellet|dna\s*test|blood\s*test|saliva|digital\s*service|subscription|genomics)\b/i;

/**
 * Classifies a raw Firestore variant/product presentation string into 0..2 calculator formats.
 * Strictly returns [] for Bulk APIs, pellets, diagnostics, or non-peptide formats.
 */
function classifyVariantFormats(rawText = '') {
  const t = String(rawText || '').toLowerCase().trim();
  if (!t) return [];
  if (RAW_API_EXCLUDE_RE.test(t) || NON_PEPTIDE_EXCLUDE_RE.test(t)) return [];

  const found = new Set();

  // Nasal / mucosal spray
  if (/\b(nasal|intranasal|mucosal\s*spray|spray)\b/i.test(t)) {
    found.add('spray');
  }

  // Oral capsules / tablets / troches / sublingual
  if (/\b(capsule|capsules|tablet|tablets|troche|troches|sublingual|oral\s*cap|oral\s*tab|lozenge)\b/i.test(t)) {
    found.add('capsule');
  }

  // Topical cream / serum / gel / oil / shampoo
  if (/\b(topical|cream|serum|ointment|lotion|shampoo|foam|scalp)\b/i.test(t) && !/blood\s*serum/i.test(t)) {
    found.add('topical');
  }

  // Pens & Cartridges — distinguish pre-filled pens, refill cartridges, and cartridge-pen systems
  const hasCartridge = /\b(cartridge|refill_cartridge|pen\s*cartridge|refill\s*cartridge)\b/i.test(t);
  const hasPen = /\b(pen|epipen|prefilled_pen|pre-filled|auto-injector|injector\s*pen|single_cartridge_pen|double_cartridge_pen)\b/i.test(t);

  if (/\b(single_cartridge_pen|double_cartridge_pen|single\s*cartridge\s*pen|double\s*cartridge\s*pen)\b/i.test(t)) {
    found.add('pen');
    found.add('cartridge');
  } else {
    if (hasCartridge) found.add('cartridge');
    if (hasPen && !/\brefill\s*cartridge\b/i.test(t)) found.add('pen');
  }

  // Lyophilized vial / injectable vial / ampoule
  if (/\b(vial|lyophili[sz]ed|ampoule|injectable\s*vial|powder\s*vial|10r|2r|iv_drip|iv\s*drip)\b/i.test(t)) {
    found.add('vial');
  }

  return Array.from(found);
}

/**
 * Extracts a clean display strength token like "5 mg", "15 mg", "500 mcg", "50 IU" from a string.
 */
function extractStrengthTokens(raw = '') {
  const str = String(raw || '').trim();
  if (!str) return [];
  const matches = str.match(/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|iu)\b/gi);
  if (!matches) return [];
  return matches.map((m) => {
    const cleaned = normalizeCanonicalStrength(m).name;
    return cleaned.replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i, (_, n, u) => `${n} ${u.toLowerCase() === 'iu' ? 'IU' : u.toLowerCase()}`);
  });
}

function parseDoseNumericMcg(token = '') {
  const m = String(token).match(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i);
  if (!m) return 999999;
  const val = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === 'mg') return val * 1000;
  return val;
}

function sortStrengths(list = []) {
  return [...new Set(list)].sort((a, b) => parseDoseNumericMcg(a) - parseDoseNumericMcg(b));
}

function isDocExcluded(data, docId = '') {
  if (!data) return true;
  const status = String(data.status || '').toLowerCase();
  if (status === 'draft' || status === 'archived' || status === 'hidden' || status === 'disabled') return true;
  const idLower = String(docId || '').toLowerCase();
  const nameLower = String(data.name || data.title || '').toLowerCase();
  const catLower = String(data.category || data.productType || data.type || '').toLowerCase();
  if (idLower.startsWith('api-') || idLower.startsWith('raw-') || idLower.includes('bulk-api')) return true;
  if (RAW_API_EXCLUDE_RE.test(nameLower) || RAW_API_EXCLUDE_RE.test(catLower)) return true;
  if (NON_PEPTIDE_EXCLUDE_RE.test(nameLower) || NON_PEPTIDE_EXCLUDE_RE.test(catLower)) return true;
  return false;
}

/**
 * GET /api/calculator/product-formats?slug=bpc-157&name=BPC-157
 *
 * Authoritative Firestore lookup returning ONLY the ready-to-use formats & strengths
 * genuinely available in the Atlas Health catalog for a specific peptide.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = String(searchParams.get('slug') || '').trim().toLowerCase();
    const rawName = String(searchParams.get('name') || '').trim();

    if (!rawSlug && !rawName) {
      return NextResponse.json({ error: 'Missing slug or name parameter' }, { status: 400 });
    }

    const identity = deriveCanonicalIdentity({ id: rawSlug, slug: rawSlug, name: rawName || rawSlug });
    const canonicalKey = (identity.canonicalKey || rawSlug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
    const cacheKey = `${rawSlug || canonicalKey}::${canonicalKey}`;

    // Layer 1 RAM Cache check
    const cached = FORMATS_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.payload, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      });
    }

    const formatStrengthMap = new Map(); // formatId -> Set<string>
    const allStrengths = new Set();
    let resolvedName = rawName || identity.canonicalName || rawSlug;
    let matchedDocsCount = 0;

    const registerFormatStrength = (fmt, tokens = []) => {
      if (!CANONICAL_FORMAT_ORDER.includes(fmt)) return;
      if (!formatStrengthMap.has(fmt)) formatStrengthMap.set(fmt, new Set());
      const bucket = formatStrengthMap.get(fmt);
      tokens.forEach((tok) => {
        if (tok) {
          bucket.add(tok);
          allStrengths.add(tok);
        }
      });
    };

    const ingestProductDoc = async (docSnap) => {
      if (!docSnap?.exists) return;
      const data = docSnap.data();
      if (isDocExcluded(data, docSnap.id)) return;
      matchedDocsCount += 1;

      if (!rawName && (data.canonicalName || data.name)) {
        resolvedName = data.canonicalName || data.name;
      }

      // Check embedded variants first, else fetch variants subcollection (bounded limit 60)
      let variants = Array.isArray(data.variants) && data.variants.length > 0 ? data.variants : null;
      if (!variants && docSnap.ref) {
        const subSnap = await docSnap.ref.collection('variants').limit(60).get().catch(() => null);
        if (subSnap && !subSnap.empty) {
          variants = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      }

      if (variants && variants.length > 0) {
        for (const v of variants) {
          const vStatus = String(v.status || '').toLowerCase();
          if (vStatus === 'archived' || vStatus === 'hidden' || vStatus === 'disabled') continue;
          if (v.isActive === false) continue;

          const vFormatCorpus = [
            v.formatId,
            v.format,
            v.presentation,
            v.dosageForm,
            v.form,
            v.name,
            v.label,
            v.sku,
          ]
            .filter(Boolean)
            .join(' ');

          if (RAW_API_EXCLUDE_RE.test(vFormatCorpus) || NON_PEPTIDE_EXCLUDE_RE.test(vFormatCorpus)) continue;

          let fmts = classifyVariantFormats(vFormatCorpus);
          if (fmts.length === 0) {
            // Inherit doc-level format if variant didn't specify presentation explicitly
            const docCorpus = [data.format, data.presentation, data.dosageForm, data.name, ...(Array.isArray(data.tags) ? data.tags : [])]
              .filter(Boolean)
              .join(' ');
            fmts = classifyVariantFormats(docCorpus);
          }
          if (fmts.length === 0) {
            // Active peptide variant without explicit non-vial presentation defaults to vial
            fmts = ['vial'];
          }

          const strengthTokens = extractStrengthTokens(
            [v.dosage, v.dose, v.strength, v.strengthId, v.name, v.label].filter(Boolean).join(' ')
          );
          fmts.forEach((f) => registerFormatStrength(f, strengthTokens));
        }
      } else {
        // Single-SKU document (e.g. pepcura-bpc-157-pen-15mg, pepcura-bpc-157-spray-50mg)
        const docCorpus = [
          data.format,
          data.presentation,
          data.dosageForm,
          data.form,
          data.name,
          data.title,
          docSnap.id,
          ...(Array.isArray(data.tags) ? data.tags : []),
        ]
          .filter(Boolean)
          .join(' ');

        let fmts = classifyVariantFormats(docCorpus);
        if (fmts.length === 0) fmts = ['vial'];

        const strengthTokens = extractStrengthTokens(
          [data.dosage, data.strength, data.name, data.title, docSnap.id].filter(Boolean).join(' ')
        );
        fmts.forEach((f) => registerFormatStrength(f, strengthTokens));
      }
    };

    if (adminDb) {
      const seenDocIds = new Set();
      const candidateSnaps = [];
      const addSnap = (snap) => {
        if (snap?.exists && !seenDocIds.has(snap.id)) {
          seenDocIds.add(snap.id);
          candidateSnaps.push(snap);
        }
      };

      // 1. Exact doc IDs (rawSlug & canonicalKey)
      const directLookups = [rawSlug, canonicalKey].filter(Boolean);
      const uniqueLookups = [...new Set(directLookups)];
      await Promise.all(
        uniqueLookups.map(async (id) => {
          const snap = await adminDb.collection('products').doc(id).get().catch(() => null);
          addSnap(snap);
        })
      );

      // 2. Query by slug / canonicalKey + sibling supplier docs (e.g. pepcura-bpc-157-*)
      const queries = [];
      if (rawSlug) {
        queries.push(adminDb.collection('products').where('slug', '==', rawSlug).limit(10).get().catch(() => null));
      }
      if (canonicalKey) {
        queries.push(adminDb.collection('products').where('canonicalKey', '==', canonicalKey).limit(20).get().catch(() => null));
        // Prefix match for supplier-prefixed finished SKUs (e.g. pepcura-bpc-157-pen-15mg, pepcura-bpc-157-spray-50mg)
        const pepcuraPrefix = `pepcura-${canonicalKey}-`;
        queries.push(
          adminDb
            .collection('products')
            .orderBy(FieldPath.documentId())
            .startAt(pepcuraPrefix)
            .endAt(`${pepcuraPrefix}\uf8ff`)
            .limit(15)
            .get()
            .catch(() => null)
        );
        // Prefix match for strength-suffixed vials (e.g. bpc-157-5mg, bpc-157-10mg)
        const strengthPrefix = `${canonicalKey}-`;
        queries.push(
          adminDb
            .collection('products')
            .orderBy(FieldPath.documentId())
            .startAt(strengthPrefix)
            .endAt(`${strengthPrefix}\uf8ff`)
            .limit(15)
            .get()
            .catch(() => null)
        );
      }

      const querySnaps = await Promise.all(queries);
      for (const qs of querySnaps) {
        if (!qs || qs.empty) continue;
        for (const d of qs.docs) {
          // Guard prefix match against combo peptides (e.g. "bpc-157-tb-500" must NOT pollute single "bpc-157")
          const idTail = d.id.toLowerCase();
          const isExactKey = idTail === canonicalKey || idTail === rawSlug;
          const isSinglePeptideVariant =
            new RegExp(`^(?:pepcura-)?${canonicalKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(?:vial|pen|cartridge|spray|capsule|oral|topical|\\d+(?:\\.\\d+)?(?:mg|mcg|iu))`, 'i').test(idTail);
          const docCanonical = String(d.data()?.canonicalKey || '').toLowerCase();

          if (isExactKey || docCanonical === canonicalKey || isSinglePeptideVariant) {
            addSnap(d);
          }
        }
      }

      // Ingest all matched Firestore product documents
      for (const snap of candidateSnaps) {
        await ingestProductDoc(snap);
      }
    }

    // Also include Lotusland lyophilized vial registry entries if matching canonicalKey (in case not yet mirrored in variants)
    if (Array.isArray(LOTUSLAND_PEPTIDES)) {
      const normalizedTarget = canonicalKey.replace(/[^a-z0-9+]+/g, '');
      for (const lp of LOTUSLAND_PEPTIDES) {
        const lpCanonical = String(lp.canonicalName || '').toLowerCase().replace(/[^a-z0-9+]+/g, '');
        const lpSlug = String(lp.slug || '').toLowerCase();
        if (lpCanonical === normalizedTarget || lpSlug === rawSlug || lpSlug.startsWith(`${canonicalKey}-`)) {
          const toks = extractStrengthTokens(lp.dosage || lp.title || '');
          registerFormatStrength('vial', toks);
        }
      }
    }

    const orderedFormats = CANONICAL_FORMAT_ORDER.filter((f) => formatStrengthMap.has(f));
    const formatStrengths = {};
    for (const f of orderedFormats) {
      formatStrengths[f] = sortStrengths(Array.from(formatStrengthMap.get(f) || []));
    }

    const payload = {
      success: true,
      slug: rawSlug || canonicalKey,
      canonicalKey,
      name: resolvedName,
      formats: orderedFormats,
      formatStrengths,
      strengths: sortStrengths(Array.from(allStrengths)),
      matchedDocs: matchedDocsCount,
      source: matchedDocsCount > 0 ? 'firestore' : orderedFormats.length > 0 ? 'registry' : 'empty',
    };

    FORMATS_CACHE.set(cacheKey, { payload, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Calculator product-formats API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resolve product formats', formats: [], formatStrengths: {}, strengths: [] },
      { status: 500 }
    );
  }
}
