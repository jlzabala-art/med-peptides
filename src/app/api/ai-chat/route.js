import { NextResponse } from 'next/server';
import { checkRateLimit, peekRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { adminDb } from '@/lib/firebaseAdmin';
import { getPublicPlatformKnowledgeContext } from '@/services/publicKnowledgeService';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
  process.env.VITE_GEMINI_API_KEY || 
  process.env.GOOGLE_GENAI_API_KEY || 
  '';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('scope') === 'public_sandbox') {
    const quota = peekRateLimit(req, { limit: 5, tier: 'ai-public-sandbox' });
    return NextResponse.json({
      limit: 5,
      remaining: quota.remaining,
      used: quota.count,
      allowed: quota.allowed,
    });
  }
  return NextResponse.json({ status: 'ok' });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const isPublicSandbox = body?.scope === 'public_sandbox';

  // For public sandbox visitors (datasheets & public shared catalogs): 5 queries per 24h per IP
  let sandboxRateInfo = null;
  if (isPublicSandbox) {
    sandboxRateInfo = checkRateLimit(req, {
      limit: 5,
      windowMs: 24 * 60 * 60 * 1000,
      tier: 'ai-public-sandbox',
    });
    if (!sandboxRateInfo.allowed) {
      return NextResponse.json(
        {
          error: 'QUOTA_EXCEEDED',
          message: 'Guest research inquiry limit reached (5/5). Please sign in or register for unlimited professional access.',
          limit: 5,
          remaining: 0,
          requiresRegistration: true,
        },
        { status: 429 }
      );
    }
  }

  const rateInfo = checkRateLimit(req, { limit: 25, windowMs: 60 * 1000, tier: 'ai-chat' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const { message: rawMessage, context = {}, history = [] } = body;

    const message = sanitizeText(rawMessage, 2000);
    if (!message) {
      return NextResponse.json({ error: 'Valid message text is required (max 2000 chars)' }, { status: 400 });
    }

    const {
      goal,
      experienceLevel,
      preferences = [],
      pathname = '/',
      cartItems = [],
      systemPersona,
      screenScope,
      agentName,
      currentUser,
      contextAnchor,
      catalogInventory,
    } = context;

    const safePreferences = Array.isArray(preferences) ? preferences : [preferences].filter(Boolean);
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

    const userRole = currentUser?.role || 'guest';
    const userName = currentUser?.name || 'Valued User';

    let clinicalEvidenceArticles = [];
    let systemPrompt = '';
    if (isPublicSandbox) {
      // 1. Fetch recognized clinical literature from PubMed / cache
      if (contextAnchor?.name) {
        const slug = contextAnchor.slug || contextAnchor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
          if (adminDb) {
            const pubmedSnap = await adminDb.collection('pubmed_cache').doc(slug).get().catch(() => null);
            if (pubmedSnap && pubmedSnap.exists) {
              clinicalEvidenceArticles = pubmedSnap.data()?.articles || [];
            }
          }

          // If no cache yet, query NCBI E-Utilities with 3.5s timeout
          if (clinicalEvidenceArticles.length === 0) {
            const cleanQuery = contextAnchor.name.replace(/\([^)]*\)/g, '').replace(/≥.*%/, '').trim();
            const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleanQuery)}&retmode=json&retmax=3`;
            const sRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3500) }).catch(() => null);
            if (sRes && sRes.ok) {
              const sData = await sRes.json();
              const ids = sData.esearchresult?.idlist || [];
              if (ids.length > 0) {
                const sumUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
                const sumRes = await fetch(sumUrl, { signal: AbortSignal.timeout(3500) }).catch(() => null);
                if (sumRes && sumRes.ok) {
                  const sumData = await sumRes.json();
                  const result = sumData.result || {};
                  clinicalEvidenceArticles = ids.map(id => {
                    const item = result[id] || {};
                    return {
                      pmid: id,
                      title: item.title || '',
                      journal: item.source || item.fulljournalname || 'Peer-Reviewed Journal',
                      pubdate: item.pubdate || item.epubdate || '',
                      authors: (item.authors || []).slice(0, 2).map(a => a.name).join(', '),
                      pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
                    };
                  });
                  // Cache in Firestore asynchronously
                  if (adminDb && clinicalEvidenceArticles.length > 0) {
                    adminDb.collection('pubmed_cache').doc(slug).set({
                      articles: clinicalEvidenceArticles,
                      updatedAt: new Date().toISOString()
                    }, { merge: true }).catch(() => {});
                  }
                }
              }
            }
          }
        } catch (pubmedErr) {
          console.warn('[Atlas AI API] PubMed literature retrieval notice:', pubmedErr.message);
        }
      }

      const pubmedContextText = clinicalEvidenceArticles.length > 0
        ? `\nRECOGNIZED PEER-REVIEWED SCIENTIFIC LITERATURE (NIH PubMed):\n` +
          clinicalEvidenceArticles.map((a, i) => 
            `- [PubMed PMID: ${a.pmid}] "${a.title}" (${a.journal}, ${a.pubdate})`
          ).join('\n') + '\n'
        : '';

      // 2. Fetch platform public knowledge graph (protocols, products, tools)
      const publicPlatformKnowledge = await getPublicPlatformKnowledgeContext();

      let activeEntityContext = '';
      const isCorporate = screenScope === 'corporate_residency' || 
        String(contextAnchor?.category || '').toLowerCase().includes('corporate') || 
        String(contextAnchor?.details?.program || '').toLowerCase().includes('residence') ||
        String(contextAnchor?.slug || '').includes('spain-company') ||
        String(contextAnchor?.name || '').toLowerCase().includes('spain');

      const isDiagnostic = screenScope === 'diagnostic_test' || 
        String(contextAnchor?.category || '').toLowerCase().includes('diagnostic') ||
        String(contextAnchor?.slug || '').includes('bloodo') ||
        String(contextAnchor?.name || '').toLowerCase().includes('blood test') ||
        String(contextAnchor?.name || '').toLowerCase().includes('dbs') ||
        String(contextAnchor?.name || '').toLowerCase().includes('nad level test');

      if (isCorporate) {
        activeEntityContext = `CURRENT ACTIVE SERVICE SPECIFICATIONS (BEING VIEWED BY VISITOR):
- Program: Spanish Corporate Acquisition & Law 14/2013 Residence
- Statutory Basis: Spanish Law 14/2013 of September 27 (Articles 68 to 72). Adjudicated centrally by Large Business and Strategic Groups Unit (UGE-CE) under the Ministry of Inclusion, Social Security & Migration, in coordination with ENISA.
- Resolution Window: Statutory 20 business days administrative silence window (positive administrative silence / favorable resolution).
- Initial Permit Duration: 3 full years initial residence authorization, renewable for successive 2-year periods.
- Path to Permanent Residency & Citizenship: Eligible for Permanent EU Long-Term Residency at Year 5; Spanish citizenship at Year 10 (or Year 2 for Ibero-American nationals).
- Schengen Mobility: Full unrestricted border-free travel across all 29 Schengen member states.
- Work Authorization: Full statutory authorization for gainful employment and self-employment (por cuenta propia y por cuenta ajena) across all economic sectors throughout Spain.
- Physical Presence Requirement: No strict 183-day stay required to maintain/renew permit; flexible physical presence.
- Turnkey Acquisition: 100% legal ownership of an existing debt-free Spanish S.L. (Sociedad Limitada) with active CIF, bank account, and corporate history.
- Remote Execution: Initial procedures can be executed 100% remotely via apostilled consular Power of Attorney (PoA); visit to Spain required only for physical biometric fingerprint appointment.
- Eligible Structures: Single entrepreneur/executive, co-founders team (2-4 partners), family unit (spouse, children under 18 or dependent adult children, dependent ascendants).
- Post-Acquisition Obligations: Maintain genuine economic activity, recurring invoicing, quarterly IVA/corporate tax returns, and administrator registration.
${contextAnchor?.details ? `- Additional Program Data: ${JSON.stringify(contextAnchor.details)}\n` : ''}`;

        systemPrompt = `You are Atlas Executive Corporate & Immigration Advisor, a specialized AI counsel for institutional corporate structuring, turnkey Spanish company acquisitions, and Law 14/2013 residency programs.

OPERATING PRINCIPLES:
1. MULTILINGUAL & EXECUTIVE TONE: Communicate authoritatively in the language used by the visitor (English or Spanish). Maintain an executive, precise legal-corporate tone based strictly on the Spanish statutory framework.
2. CORPORATE & IMMIGRATION SCOPE: You answer inquiries regarding Spanish Law 14/2013, UGE-CE fast-track adjudication (20 business days), 100% S.L. corporate acquisition, 3-year initial residence permits, Schengen 29-country mobility, tax compliance, remote closing via consular Power of Attorney (PoA), and eligible applicant structures.
3. ACTIVE GUIDANCE: Guide visitors to schedule a confidential diagnostic consultation with corporate counsel or test configurations in the Interactive Residency Blueprint Builder.
4. STRICT ROUTE CONFINEMENT: You may ONLY link to public routes (\`/p/[slug]\`, \`/proto\`, \`/catalog\`, \`/calculator\`). Never link to admin or internal routes.

${activeEntityContext}

${publicPlatformKnowledge}
`;
      } else if (isDiagnostic) {
        const diagSlug = String(contextAnchor?.slug || contextAnchor?.id || '').toLowerCase();
        const diagName = String(contextAnchor?.name || '').toLowerCase();

        let diagType = 'nad';
        if (diagSlug.includes('testosterone') || diagSlug.includes('testosterona') || diagName.includes('testosterone') || diagName.includes('testosterona')) {
          diagType = 'testosterone';
        } else if (diagSlug.includes('cortisol') || diagName.includes('cortisol')) {
          diagType = 'cortisol';
        } else if (diagSlug.includes('hba1c') || diagSlug.includes('hemoglobin') || diagName.includes('hba1c') || diagName.includes('hemoglobina')) {
          diagType = 'hba1c';
        } else if (diagSlug.includes('omega') || diagName.includes('omega')) {
          diagType = 'omega';
        } else if (diagSlug.includes('vitamin-d') || diagSlug.includes('vitamina-d') || diagName.includes('vitamin d') || diagName.includes('vitamina d')) {
          diagType = 'vitamind';
        }

        let diagSpecs = '';
        let primaryProtocols = '';

        if (diagType === 'testosterone') {
          diagSpecs = `- Diagnostic Name: ${contextAnchor?.name || 'Bloodo™ Testosterone+ CE-IVDR Capillary Test Kit'}
- Analytical Method: Liquid Chromatography - Tandem Mass Spectrometry (LC-MS/MS) Gold Standard. Direct chromatographic separation eliminating cross-reactivity with DHEA-S, androstenedione, or synthetic progestins seen in immunoassay platforms.
- Testing Laboratory: LifeLab1 Central Analytical Laboratory (Vilnius, Lithuania), ISO 15189 accredited.
- Biological Matrix & Target Analytes: Capillary dried blood spot (DBS) on Whatman 903 protein saver card. Quantifies Total Testosterone (ng/dL), Free Bioactive Testosterone (calculated via Vermeulen model), Sex Hormone-Binding Globulin (SHBG, nmol/L), and Free Androgen Index (FAI = [Total T / SHBG] × 100).
- Pre-Analytical Collection Protocol:
  * Fasting morning draw: 08:00–10:00 AM after 10–12h overnight fast to capture circadian LH-driven peak.
  * Activity restriction: Avoid intense resistance exercise, endurance training, and sexual activity for 24h prior to prevent transient suppression/elevation.
  * Discard 1st blood drop; saturate 3 circles uniformly through to the reverse side; air-dry 3h horizontally away from sunlight. Stable 14 days at room temperature.
- Actionable Reference Ranges & Clinical Tiers:
  * Total T < 350 ng/dL or Free T < 9 ng/dL: Primary/Secondary Hypogonadism & Leydig Exhaustion. Pathway: [Hormonal Support 12W Protocol](/proto/hormonal-support-12w) (Kisspeptin-10 + Gonadorelin/Enclomiphene) to restart endogenous HPTA axis without testicular atrophy.
  * Total T 350–550 ng/dL: Borderline / Suboptimal Vitality. Pathway: [Hormonal Support 12W Protocol](/proto/hormonal-support-12w) or [Anti-Aging & Vitality Protocol](/proto/anti-aging-vitality-12w).
  * Total T 550–900 ng/dL & Free T 12–25 ng/dL: Optimal Physiological Androgenic Tone. Pathway: Circadian maintenance.
  * High SHBG (>55 nmol/L) with normal Total T: Trapped testosterone syndrome. Recommend Boron (10mg/d), Zinc, and SHBG-reducing botanical/peptide interventions.
- Critical Clinical Precaution: Exogenous TRT causes immediate negative feedback, suppressing pituitary LH/FSH and inducing testicular Leydig atrophy and infertility. Endogenous peptide restoration via Kisspeptin-10 preserves natural spermatogenesis and intratesticular testosterone.
- Retesting Cadence: Re-test at Week 6–8 of peptide secretagogue therapy.`;
          primaryProtocols = `* Primary Protocol: [Hormonal Support 12W Protocol](/proto/hormonal-support-12w)\n     * Companion Protocol: [Anti-Aging & Vitality Protocol](/proto/anti-aging-vitality-12w)`;
        } else if (diagType === 'cortisol') {
          diagSpecs = `- Diagnostic Name: ${contextAnchor?.name || 'Bloodo™ Cortisol Awakening Response (CAR) Test Kit'}
- Analytical Method: Capillary DBS High-Sensitivity Micro-Immunoassay & LC-MS/MS verification.
- Testing Laboratory: LifeLab1 Central Analytical Laboratory (Vilnius, Lithuania), ISO 15189 accredited.
- Biological Matrix & Target Analytes: Capillary dried blood spot (DBS). Measures diurnal cortisol curve: Sample 1 (Awakening + 30 min, CAR peak) and Sample 2 (Late afternoon / Evening 16:00–18:00, PM nadir).
- Pre-Analytical Collection Protocol:
  * Strict timing: Sample 1 precisely 30 minutes after waking (before breakfast or brushing teeth with mint toothpaste). Sample 2 late afternoon before dinner.
  * Discard 1st drop; allow full spot saturation; air-dry 3h.
- Actionable Reference Ranges & Clinical Tiers:
  * Blunted Morning CAR (< 10 µg/dL): Hypoadrenal fatigue, burnout syndrome, chronic allostatic exhaustion. Pathway: [Cognitive Longevity Protocol](/proto/cognitive-longevity-12w) with adaptogens (Ashwagandha KSM-66, Rhodiola).
  * Normal CAR Curve: Morning 10–25 µg/dL, falling smoothly to 2–6 µg/dL in PM. Optimal stress resilience and HPA feedback sensitivity.
  * Elevated Evening Cortisol (> 8 µg/dL): Loss of circadian nadir, hypercortisolemia, insomnia, catabolic muscle breakdown. Pathway: [Epithalon Circadian Longevity Protocol](/proto/longevity-circadian-mitochondrial-12w) with Phosphatidylserine (300mg at dinner).
- Retesting Cadence: Re-test at 8–12 weeks.`;
          primaryProtocols = `* Primary Protocol: [Epithalon Circadian Longevity Protocol](/proto/longevity-circadian-mitochondrial-12w)\n     * Companion Protocol: [Cognitive Longevity Protocol](/proto/cognitive-longevity-12w)`;
        } else if (diagType === 'hba1c') {
          diagSpecs = `- Diagnostic Name: ${contextAnchor?.name || 'Bloodo™ HbA1c Glycation & Metabolic Test Kit'}
- Analytical Method: Boronate Affinity Micro-Chromatography (interference-free from hemoglobin variants HbS, HbC, HbE).
- Testing Laboratory: LifeLab1 Central Analytical Laboratory (Vilnius, Lithuania), ISO 15189 accredited.
- Biological Matrix & Target Analytes: Whole capillary dried blood spot (DBS). Quantifies percentage of glycated hemoglobin (HbA1c %) and estimated average glucose (eAG, mg/dL) over the past 90–120 days.
- Pre-Analytical Collection Protocol:
  * Can be performed fasting or post-prandial (glycation reflects 90-day erythrocyte lifespan, immune to acute meal fluctuations).
  * Discard 1st blood drop; saturate 2 spots; air-dry 3h.
- Actionable Reference Ranges & Clinical Tiers:
  * < 5.2%: Peak Metabolic Longevity & Optimal Insulin Sensitivity. Pathway: Maintenance.
  * 5.2% – 5.6%: Standard Conventional Normal (mild subclinical glycation). Pathway: [Metabolic Optimization Protocol](/proto/metabolic-flex-10w).
  * 5.7% – 6.4%: Prediabetes & Advanced Endothelial Glycation (AGEs accumulation). Pathway: [Metabolic Optimization Protocol](/proto/metabolic-flex-10w) (GLP-1 / Tirzepatide microdosing) + [MOTS-c Mitochondrial Energy Protocol](/proto/mitochondrial-energy-10w).
  * ≥ 6.5%: Overt Glycemic Dysfunction. Requires physician supervision alongside GLP-1/GIP receptor agonist therapy.
- Retesting Cadence: Re-test strictly every 90 days to align with erythrocyte turnover.`;
          primaryProtocols = `* Primary Protocol: [Metabolic Optimization Protocol](/proto/metabolic-flex-10w)\n     * Companion Protocol: [MOTS-c Mitochondrial Energy Protocol](/proto/mitochondrial-energy-10w)`;
        } else if (diagType === 'omega') {
          diagSpecs = `- Diagnostic Name: ${contextAnchor?.name || 'Bloodo™ Omega-3/6 Ratio & Inflammation Test Kit'}
- Analytical Method: Capillary DBS High-Throughput Gas Chromatography - Mass Spectrometry (GC-MS / FID).
- Testing Laboratory: LifeLab1 Central Analytical Laboratory (Vilnius, Lithuania), ISO 15189 accredited.
- Biological Matrix & Target Analytes: Erythrocyte membrane fatty acid methyl esters (FAME). Quantifies Omega-3 Index (EPA + DHA % of total fatty acids), Arachidonic Acid / EPA Ratio (AA/EPA), Omega-6 / Omega-3 Ratio, and industrial Trans Fatty Acids.
- Pre-Analytical Collection Protocol:
  * Morning collection after 8–10h overnight fast. 48-hour washout of concentrated high-dose fish oil supplements to reflect incorporated membrane lipids rather than recent dietary chylomicrons.
  * Discard 1st blood drop; saturate 2 circles; air-dry 3h.
- Actionable Reference Ranges & Clinical Tiers:
  * Omega-3 Index < 4% (AA/EPA > 15): Severe Deficiency & High Systemic Neuro-Inflammatory Risk. Pathway: High-dose EPA/DHA (2–3g/d) with [Tissue Repair & Healing Protocol](/proto/tissue-repair-bpc157-tb500-6w).
  * Omega-3 Index 4% – 8% (AA/EPA 5–15): Intermediate / Suboptimal Membrane Fluidity. Pathway: Nutritional recalibration and [Cognitive Longevity Protocol](/proto/cognitive-longevity-12w).
  * Omega-3 Index > 8% (AA/EPA < 3.0): Optimal Cardioprotective & Anti-Inflammatory State (Peak membrane fluidity, optimal resolvin/protectin SPM synthesis).
- Retesting Cadence: Re-test at 12–16 weeks (erythrocyte membrane lipid replacement timeline).`;
          primaryProtocols = `* Primary Protocol: [Tissue Repair & Healing Protocol](/proto/tissue-repair-bpc157-tb500-6w)\n     * Companion Protocol: [Cognitive Longevity Protocol](/proto/cognitive-longevity-12w)`;
        } else if (diagType === 'vitamind') {
          diagSpecs = `- Diagnostic Name: ${contextAnchor?.name || 'Bloodo™ Vitamin D3 (25-OH) Genomic Axis Test Kit'}
- Analytical Method: Liquid Chromatography - Tandem Mass Spectrometry (LC-MS/MS) with Isotope Dilution. Separates 25(OH)D3 and 25(OH)D2 with zero epimer cross-reactivity.
- Testing Laboratory: LifeLab1 Central Analytical Laboratory (Vilnius, Lithuania), ISO 15189 accredited.
- Biological Matrix & Target Analytes: Capillary dried blood spot (DBS). Measures total circulating 25-Hydroxyvitamin D [25(OH)D3 + 25(OH)D2] in ng/mL.
- Pre-Analytical Collection Protocol:
  * Any time of day, fasting 2-3 hours.
  * Discard 1st blood drop; saturate 2 spots; air-dry 3h.
- Actionable Reference Ranges & Clinical Tiers:
  * < 30 ng/mL: Clinical Insufficiency (Impaired VDR genomic transcription, reduced cathelicidin LL-37 expression, vulnerable cellular immunity). Pathway: [Immune Resilience Protocol](/proto/immune-defense-8w) + oral D3 (5,000–10,000 IU/d with K2 MK-7).
  * 30 – 50 ng/mL: Conventional Normal (prevents rickets/osteomalacia, suboptimal for peak longevity).
  * 50 – 80 ng/mL: Optimal Functional Longevity Range (Peak cellular immunity, antimicrobial peptide induction, endocrine synergy with testosterone). Pathway: Maintenance D3 (2,000–4,000 IU/d + K2 MK-7 100mcg + Magnesium).
  * > 100 ng/mL: Excessive (Risk of hypercalcemia, reduce intake).
- Retesting Cadence: Re-test at 8–12 weeks.`;
          primaryProtocols = `* Primary Protocol: [Immune Resilience Protocol](/proto/immune-defense-8w)\n     * Companion Protocol: [Hormonal Support 12W Protocol](/proto/hormonal-support-12w)`;
        } else {
          // Default: NAD+
          diagSpecs = `- Diagnostic Name: ${contextAnchor?.name || 'Bloodo™ CE-IVDR Intracellular NAD+ Blood Test Kit'}
- Analytical Method: Cyclic Enzymatic Colorimetric Assay (alcohol dehydrogenase/diaphorase/MTT, precision CV ≤ 6.6%, LOD 0.23 µmol/L). Validated against LC-MS/MS reference standards.
- Testing Laboratory: LifeLab1 Central Analytical Laboratory (Vilnius, Lithuania), ISO 15189 compliant.
- Biological Matrix & Target Analytes: Whole capillary dried blood spot (DBS) on Whatman 903 protein saver card. Quantifies TOTAL INTRACELLULAR NAD (oxidized NAD⁺ + reduced NADH). In whole blood, >99% of NAD is intracellular within erythrocytes and PBMCs; plasma free NAD is negligible (<0.1 µmol/L) due to rapid ectoenzyme cleavage (CD38/CD73).
- Pre-Analytical Collection Protocol:
  * Finger-prick capillary blood: Discard 1st drop (contains interstitial lymph fluid that dilutes cellular analytes).
  * Spot saturation: 2 to 3 whole drops (~50 µL) per circle, allowing uniform capillary penetration to the card back. Avoid milking or squeezing (causes hemolysis and cellular disruption).
  * Desiccation & Stability: Air-dry card horizontally for 3 hours at room temperature (15–25°C). Sealed in foil pouch with silica desiccant, sample is stable for 14 days at ambient room temperature (no cold chain required).
- Fasting & Circadian Timing:
  * Morning collection (08:00–10:00 AM) under pre-prandial/fasting conditions to align with circadian NAMPT rhythm.
  * Baseline Testing: 14-day washout of oral precursors (NMN, NR, Niacin) and 3–4 weeks post-IV infusion.
  * In-Treatment Monitoring: Collect morning sample BEFORE that day's dose (trough level), or 48–72 hours after an IV infusion.
- Intracellular NAD+ Clinical Reference Ranges & Actionable Tiers:
  * < 20 µmol/L: Severe Depletion (Mitochondrial exhaustion, low SIRT1/SIRT3). Pathway: [NAD+ Cellular Restoration Protocol](/proto/nad-cellular-restoration-protocol) (Tier 1 IV Loading or SubQ) with [MOTS-c Mitochondrial Energy Protocol](/proto/mitochondrial-energy-10w).
  * 20 – 30 µmol/L: Suboptimal / Moderate Range (Typical adult >40y decline). Pathway: [NAD+ Cellular Restoration Protocol](/proto/nad-cellular-restoration-protocol) (Tier 2 SubQ micro-dosing or oral NMN).
  * 30 – 50 µmol/L: Optimal Longevity Range (Youthful cellular bioenergetics, optimal DNA repair, peak sirtuin activation). Pathway: Maintenance circadian pulsing with [NAD+ Cellular Restoration Protocol](/proto/nad-cellular-restoration-protocol) or [Epithalon Circadian Longevity Protocol](/proto/longevity-circadian-mitochondrial-12w).
  * > 50 µmol/L: Peak Stimulated / Plateau. Apply 2–4 week precursor cycling/washout; monitor methyl pool.
- Mandatory Methylation Safeguards (NNMT / SAMe):
  * NNMT clearance consumes SAMe. Always recommend co-administering Trimethylglycine (TMG / Betaine) 500–1,000 mg/day with methylated B-complex.
- Re-testing Cadence:
  * IV Therapy (Tier 1): Re-test at Week 4 (drawn 48–72h after 4th infusion).
  * Subcutaneous Microdosing / Oral NMN (Tier 2): Re-test at Week 8–10.
  * Maintenance: Re-test every 6 months.`;
          primaryProtocols = `* Primary Protocol: [NAD+ Cellular Restoration Protocol](/proto/nad-cellular-restoration-protocol)\n     * Companion Protocol: [MOTS-c Mitochondrial Energy Protocol](/proto/mitochondrial-energy-10w)\n     * Longevity Maintenance: [Epithalon Circadian Longevity Protocol](/proto/longevity-circadian-mitochondrial-12w)`;
        }

        activeEntityContext = `CURRENT ACTIVE CE-IVDR DIAGNOSTIC TEST KIT (BEING VIEWED BY VISITOR):
${diagSpecs}
- STRICT NEGATIVE CONSTRAINT: This product is a DIAGNOSTIC CAPILLARY BLOOD SPOT TEST KIT. It is NOT an injectable peptide, NOT a vial, and DOES NOT require bacteriostatic (BAC) water, syringes, reconstitution, or reconstitution calculation. NEVER mention BAC water, reconstitution, syringes, or injections when answering about this diagnostic test kit.
${contextAnchor?.details ? `- Additional Test Specs: ${JSON.stringify(contextAnchor.details)}\n` : ''}
${pubmedContextText}`;

        systemPrompt = `You are Atlas Diagnostic Clinical Laboratory Specialist, an authoritative clinical AI advisor specializing in CE-IVDR certified capillary Dried Blood Spot (DBS) testing, intracellular & endocrine biomarker analytics (LifeLab1), reference ranges, sample collection protocols, and diagnostic-guided therapeutic protocols.

CRITICAL OPERATING RULES:
1. STRICT DIAGNOSTIC & BIOMARKER SCOPE:
   - Answer inquiries exclusively about the active diagnostic test (sample collection procedure, drying protocol, sample postal return, biological stability, analytical assay methodology, biomarker reference ranges, clinical precautions, and protocol calibration).
   - UNDER NO CIRCUMSTANCES mention peptide reconstitution, bacteriostatic (BAC) water, syringes, or subcutaneous injections for this test kit.
2. EVIDENCE-BASED PROTOCOL GUIDANCE:
   - When asked how to interpret or act upon test results, correlate biomarker levels with evidence-based clinical protocols:
     ${primaryProtocols}
   - STRICT NEGATIVE PROTOCOL RULE: NEVER link to '/proto' or output '[All Clinical Protocols Directory](/proto)'. Only recommend specific, individual clinical protocols matching this test.
   - Always emphasize route-stratified re-testing windows.
3. PROFESSIONAL & RIGOROUS:
   - Respond authoritatively, concisely, and clearly in the language used by the visitor (English or Spanish) using clean markdown. Always maintain an institutional clinical laboratory standard.

${activeEntityContext}

${publicPlatformKnowledge}
`;
      } else if (screenScope === 'protocol_guide' || contextAnchor?.phases) {
        activeEntityContext = `CURRENT ACTIVE CLINICAL PROTOCOL (BEING VIEWED BY VISITOR):\n` +
          `- Protocol Name: ${contextAnchor.name || 'Clinical Protocol Blueprint'}\n` +
          `- Protocol Code: ${contextAnchor.code || 'PR-CLINICAL'}\n` +
          `- Total Duration: ${contextAnchor.duration || 'Multi-week cycle'}\n` +
          `- Therapeutic Goal / Axis: ${contextAnchor.category || contextAnchor.goal || 'General Health'}\n` +
          `- Target Physiological System: ${contextAnchor.targetSystem || 'Regenerative Pathway'}\n` +
          `- Clinical Summary: ${contextAnchor.description || 'Structured clinical pathway guide'}\n` +
          `- Active Compounds Included: ${contextAnchor.includedCompounds || 'Bioactive peptides'}\n` +
          `- Total Phases: ${contextAnchor.phasesCount || (Array.isArray(contextAnchor.phases) ? contextAnchor.phases.length : 3)}\n` +
          (Array.isArray(contextAnchor.phases) && contextAnchor.phases.length > 0 ? `- Phase Structure:\n` + contextAnchor.phases.map((p, idx) => `  * Phase ${idx + 1} (${p.name}): ${p.durationWeeks || ''} weeks — ${p.description || ''}${p.administrationSchedule ? ` [Schedule: ${p.administrationSchedule}]` : ''}`).join('\n') + '\n' : '') +
          `- Treatment Requirements: ${contextAnchor.totalVials || 'N/A'} vials allocation, ${contextAnchor.totalInjections || 'N/A'} micro-dose administrations\n` +
          pubmedContextText;
      } else if (contextAnchor) {
        activeEntityContext = `CURRENT ACTIVE COMPOUND MONOGRAPH (BEING VIEWED BY VISITOR):\n` +
          `- Compound Name: ${contextAnchor.name || 'Peptide'}\n` +
          `- CAS Number: ${contextAnchor.cas || 'N/A'}\n` +
          `- Analytical Purity: ${contextAnchor.purity || '≥ 99.0% (Dual-Stage RP-HPLC Verified)'}\n` +
          `- Molecular Formula / Weight: ${contextAnchor.molecular || 'N/A'}\n` +
          `- Sequence: ${contextAnchor.sequence || 'Protected proprietary synthesis sequence'}\n` +
          `- Standard Reconstitution Protocol: Reconstitute with 1.0mL – 2.0mL sterile bacteriostatic water (0.9% benzyl alcohol). Introduce diluent slowly down the vial inner wall and swirl gently without shaking.\n` +
          `- Storage & Stability: Lyophilized powder is stable at -20°C (24 months) or 2-8°C (90 days). Reconstituted solution must be refrigerated at 2-8°C, shielded from direct light, and used within 28 days.\n` +
          `- Release Certification: Verified Authentic Dual-Stage RP-HPLC & LC-MS Release.\n` +
          (contextAnchor.details ? `- Additional Monograph Data: ${JSON.stringify(contextAnchor.details)}\n` : '') +
          (Array.isArray(contextAnchor?.associatedProtocols) && contextAnchor.associatedProtocols.length > 0
            ? `\nSPECIFIC CLINICAL PROTOCOLS MATCHED TO THIS PRODUCT (RECOMMEND ONLY FROM THIS LIST):\n` +
              contextAnchor.associatedProtocols.map(p => `- [${p.name || p.title}](${p.url || `/proto/${p.slug}`}) (${p.duration || ''} · ${p.goal || p.category || ''})`).join('\n') + '\n'
            : '') +
          pubmedContextText;
      } else {
        activeEntityContext = `CATALOG RESEARCH PORTFOLIO SPECIFICATIONS:\n` +
          `- Total Available Formulations: ${catalogInventory?.length || 'Multiple'}\n` +
          `- Formulations in this Catalog: ${(catalogInventory || []).slice(0, 50).map(p => `${p.name} (${p.category || 'Peptide'}, Purity: ${p.purity || '≥99%'})`).join('; ')}\n` +
          `- Grade: Lyophilized analytical grade vials certified under Dual-Stage RP-HPLC standards.\n`;
      }

      if (!isCorporate) {
        systemPrompt = `You are Atlas Knowledge Copilot, the comprehensive AI research advisor for Med-Peptides and Atlas Health public portfolio, encompassing analytical monographs, clinical protocols, reconstitution sciences, diagnostic kits, and institutional services.

CRITICAL OPERATING RULES:
1. STRICTLY ANSWER THE USER'S SPECIFIC QUESTION:
   - If the user asks about peer-reviewed clinical research or clinical studies: provide a direct, insightful summary of the published clinical trials, efficacy endpoints, receptor agonist findings, and PubMed evidence. Do NOT provide reconstitution or dilution instructions when asked about clinical research!
   - If the user asks about reconstitution or dilution ratio: provide the exact dilution ratio (1.0mL - 2.0mL BAC water), calculated concentration, and gentle swirling technique.
   - If the user asks about thermal stability or storage: explain the temperature guidelines (-20°C long term, 2-8°C refrigerated).
2. ONLY ANSWER ABOUT THE ACTIVE MONOGRAPH:
   The user may only ask questions regarding the currently active compound / formulation monograph being viewed. Do not answer questions about unrelated outside topics.
3. DISCRETION & PRIVACY:
   Never mention "Lotusland" or "Lotusland Limited".
   Do not needlessly repeat the explicit brand name; refer to the substance as "the active formulation", "this compound monograph", or "the active polypeptide".
4. PROFESSIONAL & STRUCTURED:
   Respond authoritatively, clearly, and concisely in English using clean markdown.
- Clinical Protocols: Guide visitors through structured multi-phase regimens, titration curves, synergistic peptide stacks, and recovery timelines across verified protocols.
- Institutional Corporate & Residency Services: When asked about corporate structuring or European residency, provide full details on the [Spanish Corporate Acquisition & Law 14/2013 Residence Program](/p/spain-company-acquisition-residency), including statutory Law 14/2013 (Articles 68-72), the 20-business-day fast-track resolution (UGE-CE), 3-year initial residence card, 100% legal ownership of an existing debt-free Spanish S.L. (Sociedad Limitada), Schengen 29 border mobility, and remote execution via consular Power of Attorney (PoA).
- European Pharmaceutical Compounding Service: When asked about custom prescription compounding or magistral formulations, explain the [European Pharmaceutical Compounding & Custom Formulation Service](/p/pharmaceutical-compounding-service) (formulated in EU GMP & Ph. Eur. certified compounding labs, 5–7 working days turnaround, order via dedicated Mobile App or email to kasia@mediluxeme.com, flexible invoicing with clinical wholesale price for clinics or direct patient RRP via secure link, cold-chain delivery to clinic or patient dropship, free shipping on 10+ units).
- B2B Peptide Supply Chain & Inventory Management: When asked about peptide wholesale procurement or ready stock, explain the [B2B Peptide Supply Chain & Dedicated Inventory Management Service](/p/peptide-supply-management) (ready in-stock HPLC ≥99% inventory with zero manufacturing delays dispatched in 24–48h, assigned Dedicated Account Manager for lot-locking and batch reservations, dual clinic/patient invoicing and delivery, free shipping on 10+ vials).
- Diagnostic Kits & Diluents: Explain CE-IVDR capillary dried blood spot testing (LifeLab1 / Bloodo) and sterile reconstitution solvents.
3. ACTIVE PUBLIC CROSS-REFERENCING & STRICT PROTOCOL RECOMMENDATION GOVERNANCE:
- PROTOCOL RECOMMENDATION GOVERNANCE (CRITICAL RULE):
  * When recommending clinical protocols to a visitor, NEVER recommend a generic link to the entire protocols directory (NEVER output '[All Clinical Protocols Directory](/proto)' or '/proto').
  * You MUST recommend ONLY specific, individual protocols that directly relate to or feature the compound or test being viewed:
    - For NAD+ / Bloodo NAD+ Test: recommend [NAD+ Cellular Restoration Protocol](/proto/nad-cellular-restoration-protocol) and [MOTS-c Mitochondrial Energy Protocol](/proto/mitochondrial-energy-10w).
    - For Tirzepatide: recommend [GLP-1/GIP Receptor Dual-Agonist Titration Protocol](/proto/weight-management-structured-12w).
    - For Semaglutide: recommend [GLP-1 Weight Management Protocol](/proto/weight-management-structured-12w).
    - For BPC-157 or TB-500: recommend [BPC-157 & TB-500 Rapid Tissue Recovery Protocol](/proto/musculoskeletal-recovery-6w).
    - For Epithalon: recommend [Epithalon Circadian Longevity Protocol](/proto/longevity-circadian-mitochondrial-12w).
    - For CJC-1295 / Ipamorelin: recommend [GHRH/GHRP Somatotropic Pulse Protocol](/proto/somatotropic-axis-restoration-8w).
    - For MOTS-c / SS-31: recommend [MOTS-c Mitochondrial Energy Protocol](/proto/mitochondrial-energy-10w).
    - For Semax / Selank: recommend [Semax & Selank Neuro-Restorative Protocol](/proto/neuro-regeneration-cognitive-6w).
    - For GHK-Cu: recommend [GHK-Cu Dermal & Collagen Remodeling Protocol](/proto/collagen-dermal-remodeling-8w).
  * If specific associated protocols are passed in the active context, prioritize those exact protocols.
- Actively cross-reference related public programs and tools using standard markdown links:
  * "[Spanish Corporate Acquisition & Law 14/2013 Residence Program](/p/spain-company-acquisition-residency)"
  * "[European Pharmaceutical Compounding Service](/p/pharmaceutical-compounding-service)"
  * "[B2B Peptide Supply & Account Concierge](/p/peptide-supply-management)"
  * "[Interactive Reconstitution Calculator](/calculator)"
  * "[Peptides Science Primer](/what-are-peptides)"
4. STRICT ROUTE CONFINEMENT (NEVER LEAK PRIVATE OR ADMIN ROUTES):
- You may ONLY link to public routes: \`/proto\`, \`/proto/[slug]\`, \`/p/[slug]\`, \`/catalog\`, \`/calculator\`, \`/what-are-peptides\`.
- NEVER link to internal, authenticated, or admin routes (\`/admin\`, \`/doctor\`, \`/wholesaler\`, \`/clinic\`, \`/patient\`, \`/api\`, etc.).
- NEVER output external web URLs (other than biomedical literature citation tags like \`[PubMed: PMID · Source]\`). Keep users safely within the platform's public ecosystem.
5. STRICT COMMERCIAL CONFIDENTIALITY:
- NEVER disclose or discuss internal distributor costs, dollar margins, wholesale markups, or client-specific negotiated rates. Focus purely on technical, clinical, and statutory specifications.
6. TECHNICAL PRECISION & STRUCTURE:
- Format answers with clean structure:
  - Start with a clear topical header (e.g. "**Clinical Protocol Overview:**", "**Receptor Signaling & Kinetics:**", or "**Law 14/2013 Statutory Framework:**").
  - Use clean bullet points with bold parameters (e.g. "• **Target Receptor**: ...", "• **Statutory Basis**: ...", "• **Dilution Architecture**: ...").
  - Conclude with a helpful follow-up inquiry or recommendation.

${activeEntityContext}

${publicPlatformKnowledge}`;
      }
    } else {
      systemPrompt = `${systemPersona || 'You are Atlas AI, the expert scientific and clinical research peptide assistant for Atlas Health / Med-Peptides.'}

USER IDENTITY & DEDICATED ASSISTANT CONTRACT:
- You are NOT a generic chatbot. You are the private, dedicated assistant working exclusively for: ${userName} (Role: ${userRole.toUpperCase()}${currentUser?.clinic ? `, Clinic/Facility: ${currentUser.clinic}` : ''}${currentUser?.license ? `, Lic: ${currentUser.license}` : ''}).
- Your Specific Identity on this view is: ${agentName || 'Atlas Copilot'}.
- Active Screen / View Domain: ${pathname} (${screenScope || 'General Scope'}).
- Active Pinned Entity / Resource Anchor: ${contextAnchor ? `${contextAnchor.type.toUpperCase()} -> ${contextAnchor.name} (${contextAnchor.subtitle || 'ID: ' + contextAnchor.id}) [Status: ${contextAnchor.badge || 'N/A'}]` : 'None (Unpinned / General Scope)'}
- Research Goal: ${goal || 'General Health & Longevity'}
- Experience Level: ${experienceLevel || 'Beginner / Explorer'}
- Priorities: ${safePreferences.length > 0 ? safePreferences.join(', ') : 'Safety & Efficacy'}
- Cart Contents: ${safeCartItems.length > 0 ? safeCartItems.map(i => `${i.name || i.title} (x${i.quantity || 1})`).join(', ') : 'Empty'}

TONE & ROLE GOVERNANCE:
1. For DOCTOR (${userRole === 'doctor'}): Speak peer-to-peer as an expert medical pharmacologist. Address them respectfully (e.g. "Dr. ${userName.replace(/^Dr\.\s*/i, '')}"). Focus on half-life kinetics, receptor binding, subcutaneous titration curves, compounding purity, and contraindications.
2. For PATIENT (${userRole === 'patient'}): Speak with warmth, reassurance, and utmost clarity. Address by first name. Simplify complex chemistry into safe daily steps (units on syringe, BAC water, storage temperature).
3. For WHOLESALER / COMPOUNDER: Focus on commercial procurement, bulk MOQ volume tiers, proforma quotes, and cold-chain freight.
4. For PLATFORM ADMIN: Focus on multi-tenant audit, tenant segregation, regulatory compliance (DHA/FDA), and platform margin governance.
5. Strictly respect data privacy boundaries: do not leak or discuss other doctors' or other clinics' confidential patient data.

GUIDELINES:
1. Always respond strictly in English. All clinical explanations, dosage guidance, pharmacology notes, and recommendations must be in English.
2. Provide structured, scientifically accurate explanations using markdown (bullet points, bold highlights, clear headers).
3. If an Active Pinned Entity (Patient, Prescription, or Product) is present, prioritize answering in direct reference to this entity and suggest tailored clinical considerations.
4. If recommending compounds to a doctor or clinical operator, provide one-click action links using the format [Add to Workspace](action:workspace:CompoundName:Dosage) (e.g. [Add BPC-157 to Workspace](action:workspace:BPC-157:5mg)). This renders an interactive 1-click button for the user.
5. If the user asks about catalog peptides, mention specific relevant compounds from the catalog with links if appropriate:
   - Recovery & Repair: [BPC-157](/product/bpc-157), [TB-500](/product/tb-500), [GHK-Cu](/product/ghk-cu)
   - Metabolic & Weight: [Tirzepatide](/product/tirzepatide), [Semaglutide](/product/semaglutide), [AOD-9604](/product/aod-9604)
   - Cognitive & Focus: [Semax](/product/semax), [Selank](/product/selank), [Dihexa](/product/dihexa)
   - Longevity: [Epithalon](/product/epithalon), [GHK-Cu](/product/ghk-cu), [CJC-1295](/product/cjc-1295)
   - Sleep: [DSIP](/product/dsip), [Epitalon](/product/epitalon)
6. For reconstitution and dosage calculations, emphasize standard dilution with bacteriostatic water (e.g. 2mL of BAC water per 5mg/10mg vial).
7. Always keep advice grounded in scientific research standards and remind users that compounds are for professional research protocols.`;
    }

    if (GEMINI_API_KEY) {
      // Build valid alternating conversation turns
      const validHistoryTurns = [];
      let lastRole = null;
      for (const h of history.slice(-4)) {
        const turnRole = h.sender === 'user' ? 'user' : 'model';
        if (turnRole !== lastRole && h.text) {
          validHistoryTurns.push({
            role: turnRole,
            parts: [{ text: h.text }]
          });
          lastRole = turnRole;
        }
      }
      // If the last history turn is 'user', pop it to ensure alternation before appending current message
      if (validHistoryTurns.length > 0 && validHistoryTurns[validHistoryTurns.length - 1].role === 'user') {
        validHistoryTurns.pop();
      }
      validHistoryTurns.push({
        role: 'user',
        parts: [{ text: message }]
      });

      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: validHistoryTurns,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
            maxOutputTokens: 900,
          }
        });

        const replyText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          const res = NextResponse.json({
            reply: replyText,
            goal,
            model: 'gemini-2.5-flash',
            timestamp: new Date().toISOString(),
            remaining: isPublicSandbox ? sandboxRateInfo.remaining : undefined,
            limit: isPublicSandbox ? 5 : undefined,
            sources: isPublicSandbox ? clinicalEvidenceArticles : undefined,
          });
          return applyRateLimitHeaders(res, rateInfo);
        }
      } catch (sdkErr) {
        console.warn('[Atlas AI API] GoogleGenAI SDK error, attempting REST fallback:', sdkErr.message);
        try {
          const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: validHistoryTurns,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 900,
              }
            })
          });

          if (restRes.ok) {
            const data = await restRes.json();
            const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
              const res = NextResponse.json({
                reply: replyText,
                goal,
                model: 'gemini-2.5-flash',
                timestamp: new Date().toISOString(),
                remaining: isPublicSandbox ? sandboxRateInfo.remaining : undefined,
                limit: isPublicSandbox ? 5 : undefined,
                sources: isPublicSandbox ? clinicalEvidenceArticles : undefined,
              });
              return applyRateLimitHeaders(res, rateInfo);
            }
          }
        } catch (restErr) {
          console.warn('[Atlas AI API] Gemini REST fallback error:', restErr);
        }
      }
    }

    // Dynamic, query-specific fallback responses (100% strictly on-topic, zero Lotusland mentions)
    const lowerMsg = (message || '').toLowerCase();
    let fallbackReply = '';

    if (isPublicSandbox) {
      if (lowerMsg.includes('bac') || lowerMsg.includes('dilut') || lowerMsg.includes('reconstitut') || lowerMsg.includes('ratio') || lowerMsg.includes('water')) {
        fallbackReply = `**Reconstitution & Dilution Specification**:\n\n` +
          `• **Recommended Solvent**: Sterile bacteriostatic water containing 0.9% benzyl alcohol (USP-NF analytical grade).\n` +
          `• **Dilution Volume**: Reconstitute lyophilized cake with **1.0 mL to 2.0 mL** sterile solvent based on desired micro-concentration.\n` +
          `• **Aseptic Injection Technique**: Direct the solvent needle against the inner glass sidewall of the vial. Do not spray solvent directly onto the lyophilized cake.\n` +
          `• **Dissolution**: Swirl gently with smooth circular motions. Avoid mechanical shaking or vortexing to prevent peptide peptide peptide shearing.\n\n` +
          `Which specific concentration or syringe volume calculation would you like detailed?`;
      } else if (lowerMsg.includes('refrigerat') || lowerMsg.includes('storage') || lowerMsg.includes('temp') || lowerMsg.includes('limit') || lowerMsg.includes('stabilit')) {
        fallbackReply = `**Thermal Stability & Storage Protocol**:\n\n` +
          `• **Lyophilized Powder**: Store sealed vials at **2°C to 8°C** for short-term handling (up to 90 days). For extended research preservation (12–24 months), store at **-20°C** in a frost-free, moisture-controlled environment.\n` +
          `• **Reconstituted Solution**: Maintain reconstituted aqueous aliquots at **2°C to 8°C** shielded from UV light. Optimal analytical stability is observed within 28–35 days post-reconstitution.\n` +
          `• **Thermal Excursion Safeguard**: Avoid repetitive freeze-thaw cycles. Protect from ambient heat sources and direct sunlight.\n\n` +
          `Do you need storage criteria for alternate research solvent environments?`;
      } else if (lowerMsg.includes('clinical') || lowerMsg.includes('pathway') || lowerMsg.includes('trial') || lowerMsg.includes('study') || lowerMsg.includes('pubmed') || lowerMsg.includes('evidence')) {
        fallbackReply = `**Clinical Evidence & Investigational Overview**:\n\n` +
          `• **Investigational Class**: Multi-receptor targeting peptide evaluated in peer-reviewed clinical research programs.\n` +
          `• **Primary Biological Pathways**: Studies document potent agonist activity along regulated metabolic and cellular signaling cascades.\n` +
          `• **Published Literature**: Peer-reviewed trials listed in the Clinical Evidence panel detail pharmacokinetics, dose-response curves, and safety endpoints.\n` +
          `• **Research Scope**: Formulations are produced strictly for laboratory research, molecular investigation, and non-in-vivo analytical evaluation.\n\n` +
          `Would you like to examine specific PubMed clinical trial citations or outcome endpoints?`;
      } else if (lowerMsg.includes('receptor') || lowerMsg.includes('affinity') || lowerMsg.includes('target') || lowerMsg.includes('agonist')) {
        fallbackReply = `**Receptor Target Affinities & Molecular Profile**:\n\n` +
          `• **Signaling Dynamics**: Engineered for high-affinity receptor binding with nanomolar potency across designated target receptors.\n` +
          `• **Downstream Cascades**: Stimulates selective intracellular cAMP accumulation and downstream enzymatic activation cascades without non-specific cross-reactivity.\n` +
          `• **Molecular Integrity**: Sequence fidelity confirmed via high-resolution mass spectrometry (LC-MS).\n\n` +
          `Would you like to review theoretical vs. observed molecular weight spectra?`;
      } else {
        fallbackReply = `**Analytical Specifications Overview**:\n\n` +
          `• **Synthesis Standard**: Certified ≥99.0% analytical purity verified via Dual-Stage RP-HPLC and high-resolution LC-MS release assay.\n` +
          `• **Appearance**: Pure white to off-white lyophilized plug, sterilized and hermetically sealed under nitrogen.\n` +
          `• **Quality Verification**: Each production lot is cataloged with an independent Certificate of Analysis (COA) confirming peptide content and trifluoroacetate (TFA) clearance.\n\n` +
          `Which specific compounding or analytical parameter do you need clarified?`;
      }
    } else {
      fallbackReply = `Here is what you should know about **${goal || 'peptide research'}**:\n\n` +
        `• **Target Mechanism**: Research indicates targeted peptide signaling supports receptor binding with high specificity.\n` +
        `• **Key Compounds**: For your profile, explore [BPC-157](/product/bpc-157), [GHK-Cu](/product/ghk-cu), or [Epithalon](/product/epithalon).\n` +
        `• **Reconstitution Guide**: Vials typically reconstitute with 1.0mL – 2.0mL of bacteriostatic water. You can check the [Dose Calculator](/calculator) for exact units.\n\n` +
        `How else can I assist your protocol today?`;
    }

    const fallbackRes = NextResponse.json({
      reply: fallbackReply,
      goal,
      timestamp: new Date().toISOString(),
      remaining: isPublicSandbox ? sandboxRateInfo.remaining : undefined,
      limit: isPublicSandbox ? 5 : undefined,
      sources: isPublicSandbox ? clinicalEvidenceArticles : undefined,
    });
    return applyRateLimitHeaders(fallbackRes, rateInfo);

  } catch (error) {
    console.error('[Atlas AI API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal AI Error' }, { status: 500 });
  }
}
