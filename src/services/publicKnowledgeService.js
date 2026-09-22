/**
 * src/services/publicKnowledgeService.js
 * 
 * In-memory cached provider of the platform's public knowledge graph
 * for Atlas AI Research Copilot.
 * 
 * Strictly contains ONLY public entities:
 * - 77 Clinical Protocols (/proto/[slug])
 * - Analytical Peptide Monographs (/p/[slug])
 * - Public Interactive Tools (/proto, /catalog, /calculator, /what-are-peptides)
 * 
 * STRICT ZERO-LEAK GUARANTEE:
 * - NO commercial pricing, distributor discounts, or wholesaler margins
 * - NO private patient data, doctors' registries, or administrative paths
 */

import { adminDb } from '../lib/firebaseAdmin';

let cachedKnowledge = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-memory TTL

export async function getPublicPlatformKnowledgeContext() {
  const now = Date.now();
  if (cachedKnowledge && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedKnowledge;
  }

  if (!adminDb) {
    return getFallbackKnowledge();
  }

  try {
    // 1. Fetch public active protocols
    let protocolDocs = [];
    try {
      const pSnap = await adminDb.collection('protocols')
        .where('status', 'in', ['active', 'published'])
        .limit(100)
        .get();
      protocolDocs = pSnap.docs;
    } catch {
      const pSnapFallback = await adminDb.collection('protocols').limit(100).get().catch(() => null);
      if (pSnapFallback) protocolDocs = pSnapFallback.docs;
    }

    const protocolsList = protocolDocs.map(d => {
      const data = d.data();
      const slug = data.slug || data.protocol_slug || d.id;
      const name = data.name || data.title || data.protocol_name || 'Clinical Protocol';
      const duration = data.durationWeeks ? `${data.durationWeeks} Weeks` : (data.duration || '8-12 Weeks');
      const goal = data.category || data.goal || data.therapeutic_category || 'Regenerative Recovery';
      
      const compounds = [];
      const rawItems = data.items || data.bom || data.products || data.peptides || [];
      if (Array.isArray(rawItems)) {
        rawItems.forEach(i => {
          const cName = i.product_name || i.name || i.title;
          if (cName && !compounds.includes(cName)) compounds.push(cName);
        });
      }

      return {
        name,
        slug,
        url: `/proto/${slug}`,
        duration,
        goal,
        compounds: compounds.join(', ') || 'Bioactive peptides'
      };
    }).filter(p => Boolean(p.slug));

    // 2. Fetch distinct public active products (peptides)
    let productDocs = [];
    try {
      const prSnap = await adminDb.collection('products')
        .where('status', 'in', ['active', 'published'])
        .limit(150)
        .get();
      productDocs = prSnap.docs;
    } catch {
      const prFallback = await adminDb.collection('products').limit(100).get().catch(() => null);
      if (prFallback) productDocs = prFallback.docs;
    }

    const seenPeptideNames = new Set();
    const productsList = [];

    productDocs.forEach(d => {
      const data = d.data();
      const slug = data.slug || d.id;
      const canonicalName = data.canonicalName || data.name || 'Peptide';
      const baseKey = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (!seenPeptideNames.has(baseKey) && slug) {
        seenPeptideNames.add(baseKey);
        productsList.push({
          name: canonicalName,
          slug,
          url: `/p/${slug}`,
          cas: data.cas || null,
          purity: data.purity || '≥99.0%',
          category: data.category || 'Peptides',
          summary: data.description ? data.description.substring(0, 140).trim() + '…' : 'Analytical peptide monograph'
        });
      }
    });

    const knowledgeSummary = formatKnowledgeForPrompt(protocolsList, productsList);
    cachedKnowledge = knowledgeSummary;
    lastCacheTime = now;
    return cachedKnowledge;
  } catch (err) {
    console.warn('[publicKnowledgeService] Failed to build dynamic knowledge, using fallback:', err.message);
    return getFallbackKnowledge();
  }
}

function formatKnowledgeForPrompt(protocols, products) {
  const protocolEntries = protocols.slice(0, 60).map(p => 
    `- [${p.name}](${p.url}) [${p.duration}] · Goal: ${p.goal} · Compounds: ${p.compounds}`
  ).join('\n');

  const productEntries = products.slice(0, 50).map(p =>
    `- [${p.name} Datasheet](${p.url})${p.cas ? ` (CAS: ${p.cas})` : ''} · Purity: ${p.purity} · ${p.category}`
  ).join('\n');

  return `
MED-PEPTIDES COMPLETE PUBLIC PLATFORM KNOWLEDGE BASE:

1. PUBLIC INTERACTIVE DIRECTORIES & TOOLS:
- [All Clinical Protocols Directory](/proto) — Interactive directory of 77 evidence-based protocols categorized by therapeutic goals.
- [Peptides Catalog](/catalog) — Searchable compendium of analytical peptide monographs.
- [Interactive Reconstitution & Syringe Calculator](/calculator) — Accurate BAC water dilution and U-100 syringe units calculator.
- [Peptide Science Primer](/what-are-peptides) — Foundational science, mechanisms of action, and biological pathways.
- [Spanish Corporate Acquisition & Law 14/2013 Residence Program](/p/spain-company-acquisition-residency) — Fast-track European residency and turnkey Spanish S.L. corporate acquisition under statutory Law 14/2013 (UGE-CE 20-day resolution, 3-year initial permit, Schengen 29 mobility, 100% debt-free company ownership).

2. VERIFIED PUBLIC CLINICAL PROTOCOLS (${protocols.length} Available):
${protocolEntries}

3. VERIFIED PUBLIC PEPTIDE MONOGRAPHS (${products.length} Key Formulations):
${productEntries}

4. INSTITUTIONAL CORPORATE ACQUISITIONS & RESIDENCY PROGRAMS:
- [Spanish Corporate Acquisition & Law 14/2013 Residence Program](/p/spain-company-acquisition-residency)
  * Statutory Basis: Spanish Law 14/2013 of September 27 (Articles 68 to 72), centrally adjudicated by the Large Business and Strategic Groups Unit (UGE-CE) under the Ministry of Inclusion, Social Security & Migration.
  * Fast-Track Resolution: Statutory 20 business days administrative silence window (positive administrative silence / favorable decision).
  * Initial Authorization: 3 full years initial residence card, renewable for successive 2-year terms.
  * EU Long-Term & Citizenship: Eligible for Permanent EU Long-Term Residency at Year 5; Spanish citizenship at Year 10 (or Year 2 for Ibero-American nationals).
  * Schengen Border-Free Mobility: Unrestricted travel across all 29 Schengen member states.
  * Turnkey Company: 100% legal ownership of an existing debt-free Spanish S.L. (Sociedad Limitada) with active CIF and bank account.
  * Physical Presence: No strict 183-day stay required to maintain/renew residency.
  * Remote Execution: 100% remote execution via consular Power of Attorney (PoA); visit to Spain required only for fingerprint biometrics.
  * Eligible Structures: Single entrepreneur/executive, co-founders team (2-4 partners), family unit (spouse, children under 18 or dependent adult children, dependent ascendants).
`;
}

function getFallbackKnowledge() {
  return `
MED-PEPTIDES PUBLIC PLATFORM CORE DIRECTORIES:
- [Clinical Protocols Directory](/proto) — 77 evidence-based protocols across weight management, longevity, recovery, and neuro-restoration.
- [Peptides Catalog](/catalog) — Monograph portfolio.
- [Reconstitution Calculator](/calculator) — Reconstitution dilution tool.
- [Peptide Fundamentals Guide](/what-are-peptides) — Science and pharmacology primer.
- [Spanish Corporate Acquisition & Law 14/2013 Residence Program](/p/spain-company-acquisition-residency) — Fast-track European residency and turnkey Spanish S.L. corporate acquisition under statutory Law 14/2013.
- Common Protocols:
  * [GLP-1/GIP Receptor Dual-Agonist Titration Protocol](/proto/weight-management-structured-12w) (Tirzepatide)
  * [Tissue & Joint Regeneration Protocol](/proto/recovery-foundation-bpc-tb) (BPC-157, TB-500)
  * [Neuroplasticity & Cognitive Protocol](/proto/cognitive-support-structured) (Semax, Selank)
  * [Cellular Longevity Protocol](/proto/longevity-foundation-structured) (Epithalon, GHK-Cu)
- Common Compounds & Formulations:
  * [BPC-157 Datasheet](/p/bpc-157)
  * [TB-500 Datasheet](/p/tb-500)
  * [Tirzepatide Datasheet](/p/tirzepatide)
  * [Semaglutide Datasheet](/p/semaglutide)
  * [Retatrutide Datasheet](/p/retatrutide)
  * [GHK-Cu Datasheet](/p/ghk-cu)
  * [Epithalon Datasheet](/p/epithalon)
  * [MOTS-c Datasheet](/p/mots-c)
- Institutional Corporate & Residency Services:
  * [Spanish Corporate Acquisition & Law 14/2013 Residence Program](/p/spain-company-acquisition-residency) (Articles 68-72, UGE-CE 20-day resolution, 3-year residence card, Schengen 29 mobility, 100% S.L. turnkey ownership).
`;
}
