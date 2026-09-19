import { NextResponse } from 'next/server';
import { checkRateLimit, peekRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { adminDb } from '@/lib/firebaseAdmin';
import { getPublicPlatformKnowledgeContext } from '@/services/publicKnowledgeService';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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
      if (screenScope === 'protocol_guide' || contextAnchor?.phases) {
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
          `- Release Certification: Verified Authentic Lotusland Limited Dual-Stage RP-HPLC & LC-MS Release.\n` +
          (contextAnchor.details ? `- Additional Monograph Data: ${JSON.stringify(contextAnchor.details)}\n` : '') +
          pubmedContextText;
      } else {
        activeEntityContext = `CATALOG RESEARCH PORTFOLIO SPECIFICATIONS:\n` +
          `- Total Available Formulations: ${catalogInventory?.length || 'Multiple'}\n` +
          `- Formulations in this Catalog: ${(catalogInventory || []).slice(0, 50).map(p => `${p.name} (${p.category || 'Peptide'}, Purity: ${p.purity || '≥99%'})`).join('; ')}\n` +
          `- Grade: Lyophilized analytical grade vials certified by Lotusland Limited.\n`;
      }

      systemPrompt = `You are Atlas Research Copilot, a strictly specialized AI clinical research assistant for Lotusland Limited analytical monographs, clinical protocols, and public compounding resources.

CRITICAL OPERATING BOUNDARIES (ZERO TOLERANCE FOR DEVIATION):
1. STRICTLY ENGLISH ONLY: You MUST communicate and respond EXCLUSIVELY in English. Under NO circumstances reply in Spanish or any other language, even if the user asks in another language.
2. RIGID SCIENTIFIC SCOPE: You ONLY answer questions directly related to peptides, clinical protocols, chemical parameters, reconstitution, or biomedical literature. Refuse any unrelated requests (politics, general coding, casual chat, diagnosis/prescribing for specific individuals).
3. ACTIVE PUBLIC CROSS-REFERENCING & RECOMMENDATIONS:
- You have complete access to the public catalog of compounds, protocols, and interactive tools provided below in the PUBLIC PLATFORM KNOWLEDGE BASE.
- Whenever answering questions about a goal, peptide synergy, titration phase, or compounding, actively cross-reference related public protocols or companion monographs using standard markdown links:
  e.g.:
  * "[Explore all 77 Clinical Protocols](/proto)"
  * "[GLP-1/GIP Receptor Dual-Agonist Titration Protocol](/proto/weight-management-structured-12w)"
  * "[Tirzepatide Datasheet](/p/tirzepatide)"
  * "[BPC-157 Datasheet](/p/bpc-157)"
  * "[Interactive Reconstitution Calculator](/calculator)"
  * "[Peptides Science Primer](/what-are-peptides)"
4. STRICT ROUTE CONFINEMENT (NEVER LEAK PRIVATE OR ADMIN ROUTES):
- You may ONLY link to public routes: \`/proto\`, \`/proto/[slug]\`, \`/p/[slug]\`, \`/catalog\`, \`/calculator\`, \`/what-are-peptides\`.
- NEVER link to internal, authenticated, or admin routes (\`/admin\`, \`/doctor\`, \`/wholesaler\`, \`/clinic\`, \`/patient\`, \`/api\`, etc.).
- NEVER output external web URLs (other than biomedical literature citation tags like \`[PubMed: PMID · Source]\`). Keep users safely within the platform's public ecosystem.
5. STRICT COMMERCIAL CONFIDENTIALITY:
- NEVER disclose or discuss commercial distributor prices, dollar amounts, wholesale markups, or client margins. Focus purely on clinical pharmacology, vial counts, active dosages, reconstitution, and receptor targets.
6. TECHNICAL PRECISION & STRUCTURE:
- Format answers with clean clinical structure:
  - Start with a clear section header (e.g. "**Clinical Protocol Overview:**", "**Receptor Signaling & Kinetics:**", or "**Titration Guidance:**").
  - Use clean bullet points with bold parameters (e.g. "• **Target Receptor**: ...", "• **Dilution Architecture**: ...", "• **Companion Protocol**: ...").
  - Conclude with a helpful follow-up inquiry.

${activeEntityContext}

${publicPlatformKnowledge}`;
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
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history.slice(-4).map(h => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
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
              contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                ...history.slice(-4).map(h => ({
                  role: h.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text }]
                })),
                { role: 'user', parts: [{ text: message }] }
              ],
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

    // Intelligent context-aware fallback response
    let fallbackReply = isPublicSandbox
      ? `**Analytical Specifications Overview**:\n\n` +
        `• **Synthesis Standard**: Certified ≥99.0% analytical purity via Dual-Stage RP-HPLC & LC-MS release testing (Lotusland Limited).\n` +
        `• **Dilution Guidance**: Reconstitute lyophilized cake with 1.0mL – 2.0mL sterile bacteriostatic water (0.9% benzyl alcohol). Inject gently along vial glass wall and swirl; do not agitate.\n` +
        `• **Thermal Stability**: Store lyophilized cakes at 2–8°C for short term (up to 90 days) or -20°C for extended research. Store reconstituted solution at 2–8°C shielded from light.\n\n` +
        `Which specific compounding or analytical parameter do you need clarified?`
      : `Here is what you should know about **${goal || 'peptide research'}**:\n\n` +
        `• **Target Mechanism**: Research indicates targeted peptide signaling supports receptor binding with high specificity.\n` +
        `• **Key Compounds**: For your profile, explore [BPC-157](/product/bpc-157), [GHK-Cu](/product/ghk-cu), or [Epithalon](/product/epithalon).\n` +
        `• **Reconstitution Guide**: Vials typically reconstitute with 1.0mL – 2.0mL of bacteriostatic water. You can check the [Dose Calculator](/calculator) for exact units.\n\n` +
        `How else can I assist your protocol today?`;

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
