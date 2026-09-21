import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { logger } from '@/utils/logger';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const RATE_LIMIT_OPTIONS = { limit: 20, windowMs: 60 * 1000, tier: 'ai-workspace-email' };

function resolveProductSlug(item) {
  if (item?.slug && typeof item.slug === 'string' && item.slug.trim()) {
    return item.slug.trim().toLowerCase();
  }
  const raw = item?.canonicalName || item?.name || item?.productName || item?.id || 'peptide';
  return String(raw)
    .toLowerCase()
    .replace(/^prod[-_]/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req) {
  const rateInfo = checkRateLimit(req, RATE_LIMIT_OPTIONS);
  if (!rateInfo.allowed) {
    logger.warn('[Workspace Datasheet Email] Rate limit exceeded', { tier: 'ai-workspace-email', retryAfter: rateInfo.retryAfter });
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const recipientName = sanitizeText(body?.recipientName, 150) || 'Healthcare Practitioner';
    const recipientEmail = sanitizeText(body?.recipientEmail, 150) || '';
    const workspaceName = sanitizeText(body?.workspaceName, 150) || 'Clinical Requisition Dossier';
    const customNotes = sanitizeText(body?.customNotes, 500) || '';
    const audience = sanitizeText(body?.audience, 50) || 'doctor';

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one compound is required in the workspace to generate documentation.' }, { status: 400 });
    }

    // Build compound manifest with verified URLs
    const compoundManifest = items.map((it) => {
      const slug = resolveProductSlug(it);
      const name = it.canonicalName || it.name || 'Clinical Compound';
      const dosage = it.dosage || 'Standard';
      const format = it.format || 'Lyophilized Vial';
      const category = it.category || 'Therapeutic Peptides';
      const monographUrl = `https://med-peptides.com/p/${slug}`;
      const pdfUrl = `https://med-peptides.com/api/product-sheet/${it.productId || slug}`;

      return {
        name,
        dosage,
        format,
        category,
        slug,
        monographUrl,
        pdfUrl,
      };
    });

    if (!apiKey) {
      // Fallback deterministic Pharma English template if Gemini key is missing
      const fallbackSubject = `Clinical Product Documentation & Analytical Specifications — Med-Peptides [Ref: ${workspaceName}]`;
      const compoundListText = compoundManifest.map(c => (
        `• ${c.name} (${c.dosage} ${c.format})\n` +
        `  Therapeutic Area: ${c.category}\n` +
        `  Clinical Monograph: ${c.monographUrl}\n` +
        `  Analytical Spec Sheet (PDF): ${c.pdfUrl}`
      )).join('\n\n');

      const fallbackBody = `Dear ${recipientName},

Following your inquiry, please find below the official clinical monographs and analytical specifications for the pharmaceutical compounds staged in your dossier (${workspaceName}).

All compounds supplied by Med-Peptides adhere to rigorous European Pharmacopoeia (Ph. Eur.) and USP standards, with dual-stage RP-HPLC purity verification (≥ 99.0%), ESI-MS molecular identity confirmation, and strict SAL 10⁻⁶ sterility.

SUMMARY OF ATTACHED PRODUCT DOCUMENTATION:
─────────────────────────────────────────────────────────────────────────────
${compoundListText}

ADDITIONAL REGULATORY & SUPPLY ASSURANCES:
• Analytical Integrity: Validated CoA and monoisotopic mass spectrometry data included with each batch release.
• Cold-Chain Logistics: Temperature-monitored distribution (-20°C / 2°C–8°C validated transport).
• Institutional Compliance: Complete traceability from GMP-grade synthesis to accredited laboratory release.

Should you require customized protocol consultation, stability data, or volume batch allocations, please do not hesitate to contact our medical desk directly.

Respectfully,

Medical Affairs & Institutional Supply Division
Med-Peptides Laboratory & Research Network
business@med-peptides.com | https://med-peptides.com`;

      return NextResponse.json({
        subject: fallbackSubject,
        executiveSummary: `Official pharmaceutical documentation package for ${compoundManifest.length} compound(s) staged in ${workspaceName}. All formulations are manufactured under strict aseptic conditions with validated RP-HPLC purity (≥ 99.0%) and ESI-MS molecular identity verification.`,
        compounds: compoundManifest.map(c => ({
          compoundName: c.name,
          dosageFormat: `${c.dosage} ${c.format}`,
          pharmacologicalProfile: `High-affinity therapeutic peptide formulation targeted for ${c.category}. Validated monoisotopic peak identity and sterile filtration.`,
          analyticalSpecs: 'RP-HPLC Purity ≥ 99.0% · Endotoxins < 0.05 EU/mg · ESI-MS Concordant',
          monographUrl: c.monographUrl,
          pdfUrl: c.pdfUrl,
        })),
        fullEmailBody: fallbackBody,
        senderEmail: 'business@med-peptides.com',
        recipientEmail,
        recipientName,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const schema = {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          description: 'Formal pharmaceutical email subject line referencing Med-Peptides and the compound names or workspace reference.',
        },
        executiveSummary: {
          type: Type.STRING,
          description: 'High-level pharmaceutical executive summary (1 concise paragraph in Pharma English) outlining therapeutic scope, purity benchmarks (RP-HPLC ≥ 99.0%), and analytical rigor.',
        },
        compounds: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              compoundName: { type: Type.STRING },
              dosageFormat: { type: Type.STRING },
              pharmacologicalProfile: {
                type: Type.STRING,
                description: '2 sentences in formal medical/pharma English describing the primary mechanism of action, cellular pathway/target receptor axis, and clinical indications.',
              },
              analyticalSpecs: {
                type: Type.STRING,
                description: 'Brief quality benchmark (e.g. "RP-HPLC Purity ≥ 99.4% · ESI-MS Validated · Endotoxins < 0.05 EU/mg").',
              },
              monographUrl: { type: Type.STRING },
              pdfUrl: { type: Type.STRING },
            },
            required: ['compoundName', 'dosageFormat', 'pharmacologicalProfile', 'analyticalSpecs', 'monographUrl', 'pdfUrl'],
          },
        },
        fullEmailBody: {
          type: Type.STRING,
          description: 'The complete, formal, beautifully formatted plain-text/markdown email written in Pharma English, ready to send from business@med-peptides.com to the recipient.',
        },
      },
      required: ['subject', 'executiveSummary', 'compounds', 'fullEmailBody'],
    };

    const prompt = `You are the Chief Medical Affairs Officer & Institutional Supply Director at Med-Peptides Analytical Laboratory & Research Network (business@med-peptides.com).

Draft a formal, highly authoritative pharmaceutical email in professional "Pharma English" to provide the requested clinical datasheets and analytical documentation.

Recipient Information:
- Recipient Name: ${recipientName}
- Recipient Email: ${recipientEmail || 'Colleague / Prescribing Physician'}
- Dossier Reference: ${workspaceName}
- Target Audience Profile: ${audience === 'wholesaler' ? 'B2B Pharmacy Wholesaler / Medical Distributor' : audience === 'patient' ? 'Patient / Private Wellness Client' : 'Prescribing Physician / Medical Director'}
${customNotes ? `- Clinical Notes from Provider: ${customNotes}` : ''}

Audience Profile Instructions:
${audience === 'wholesaler' 
  ? 'Focus heavily on commercial reliability, batch-to-batch CoA consistency, European Pharmacopoeia (Ph. Eur.) compliance, cold-chain logistics stability, and dual-stage HPLC purity benchmarks (≥ 99.0%).'
  : audience === 'patient'
  ? 'Maintain high clinical accuracy but adopt an educational, reassuring, and completely safe tone emphasizing sterility (SAL 10⁻⁶), lack of endotoxins, and clear pharmacological purpose without confusing jargon.'
  : 'Deepen focus on pharmacodynamics, receptor affinity axes (e.g. GLP-1/GIP co-agonism, GH secretagogue axis, cellular repair pathways), and clinical trial endpoints.'
}

Staged Compounds in this Requisition:
${JSON.stringify(compoundManifest, null, 2)}

Mandatory Email Content & Tone Requirements:
1. Sender Identity: Med-Peptides Medical Affairs & Supply Division (business@med-peptides.com).
2. Salutation: Formal ("Dear ${recipientName},").
3. Acknowledgment: Express that following their request, the official clinical monographs and analytical dossiers for the requested pharmaceutical compounds are detailed below.
4. Executive Summary: Written in strict medical/pharma terminology (cellular pathways, receptor affinity, tissue regeneration, endocrine axes, pharmacodynamics).
5. Compound Detail Section: For each compound, detail:
   - Compound name, dosage, and format.
   - Pharmacological mechanism and clinical indication summary.
   - Analytical specifications (RP-HPLC purity, ESI-MS identity, endotoxins < 0.05 EU/mg, sterility assurance level SAL 10⁻⁶).
   - EXACT clickable URLs:
     * Live Clinical Monograph: [monographUrl]
     * Analytical Spec Sheet (PDF): [pdfUrl]
6. Quality Assurance Statement: Reference European Pharmacopoeia (Ph. Eur.) and USP guidelines, ISO 15189 accredited central testing, validated cold-chain shipping (-20°C / 2°C–8°C).
7. Sign-off:
   Respectfully,
   Medical Affairs & Institutional Supply Division
   Med-Peptides Laboratory & Research Network
   business@med-peptides.com | https://med-peptides.com

Ensure all medical language is sophisticated, clinically accurate, reassuring, and strictly in English.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini returned an empty response.');
    const data = JSON.parse(text);

    // Guarantee that URLs are matched exactly from compoundManifest
    if (Array.isArray(data.compounds)) {
      data.compounds = data.compounds.map((c, idx) => {
        const source = compoundManifest[idx] || compoundManifest[0];
        return {
          ...c,
          monographUrl: source.monographUrl,
          pdfUrl: source.pdfUrl,
        };
      });
    }

    const res = NextResponse.json({
      ...data,
      senderEmail: 'business@med-peptides.com',
      recipientEmail,
      recipientName,
    });
    return applyRateLimitHeaders(res, rateInfo);
  } catch (error) {
    logger.error('[Workspace Datasheet Email] Error generating email', error);
    return NextResponse.json({ error: 'Failed to generate datasheet email documentation: ' + error.message }, { status: 500 });
  }
}
