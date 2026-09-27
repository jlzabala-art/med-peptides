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

    // Build compound manifest with verified URLs and category awareness
    const compoundManifest = items.map((it) => {
      const slug = resolveProductSlug(it);
      const name = it.canonicalName || it.name || 'Clinical Compound';
      const dosage = it.dosage || 'Standard';
      const catCheck = `${it.category || ''} ${it.subcategory || ''} ${it.canonicalName || ''} ${it.name || ''} ${slug}`.toLowerCase();
      const isCosmetic = /cosmetic|dermocosmetic|shampoo|conditioner|colway|serum|cream|topical|hair|scalp/i.test(catCheck);
      const isDiagnostic = !isCosmetic && /diagnostic|test|blood|dna|panel|bloodo/i.test(catCheck);
      const isDevice = !isCosmetic && !isDiagnostic && /pen|device|needle|syringe|injector|accessory|consumable|bac water|supplies/i.test(catCheck);

      const productType = isCosmetic
        ? 'Cosmeceutical / Topical Trichology'
        : isDiagnostic
          ? 'CE-IVDR Diagnostic Test Kit'
          : isDevice
            ? 'Medical Device / Delivery Hardware'
            : 'Therapeutic Peptide / Biological';

      const format = it.format || (isCosmetic ? 'Topical Care' : isDiagnostic ? 'DBS Test Kit' : 'Lyophilized Vial');
      const category = it.category || (isCosmetic ? 'Hair & Scalp Cosmeceuticals' : isDiagnostic ? 'Diagnostics & Biomarkers' : 'Therapeutic Peptides');
      const monographUrl = `https://med-peptides.com/p/${slug}`;
      const pdfUrl = `https://med-peptides.com/api/product-sheet/${it.productId || slug}`;

      return {
        name,
        dosage,
        format,
        category,
        productType,
        isCosmetic,
        isDiagnostic,
        isDevice,
        slug,
        monographUrl,
        pdfUrl,
      };
    });

    const hasCosmetics = compoundManifest.some(c => c.isCosmetic);
    const hasPeptides = compoundManifest.some(c => !c.isCosmetic && !c.isDiagnostic && !c.isDevice);

    if (!apiKey) {
      // Fallback deterministic Pharma English template if Gemini key is missing
      const fallbackSubject = hasCosmetics && !hasPeptides
        ? `Clinical Cosmeceutical Monograph & Trichological Dossier — Med-Peptides [Ref: ${workspaceName}]`
        : `Clinical Product Documentation & Analytical Specifications — Med-Peptides [Ref: ${workspaceName}]`;

      const compoundListText = compoundManifest.map(c => (
        `• ${c.name} (${c.dosage} ${c.format})\n` +
        `  Classification: ${c.productType}\n` +
        `  Clinical Monograph: ${c.monographUrl}\n` +
        `  Analytical Spec Sheet (PDF): ${c.pdfUrl}`
      )).join('\n\n');

      const qualityAssuranceText = hasCosmetics && !hasPeptides
        ? `• European Regulation Compliance: Formulated and registered in full accordance with EU Cosmetics Regulation (EC) No 1223/2009 (CPNP notified).
• Dermatological Safety: Clinically tested on sensitive scalp with proven hypoallergenic profile.
• Manufacturing Excellence: Produced under ISO 22716 Good Manufacturing Practice (GMP) for cosmetics.`
        : `• Analytical Integrity: Validated CoA and monoisotopic mass spectrometry data included with each batch release.
• Cold-Chain Logistics: Temperature-monitored distribution (-20°C / 2°C–8°C validated transport).
• Institutional Compliance: Complete traceability from GMP-grade synthesis to accredited laboratory release.`;

      const fallbackBody = `Dear ${recipientName},

Following your inquiry, please find below the official clinical monographs and analytical specifications for the products staged in your dossier (${workspaceName}).

${hasCosmetics && !hasPeptides 
  ? 'All dermocosmetic formulations supplied through Med-Peptides adhere to EU Cosmetics Regulation (EC) No 1223/2009, with CPNP notification, verified batch traceability, and dermatological tolerance testing.' 
  : 'All compounds supplied by Med-Peptides adhere to rigorous European Pharmacopoeia (Ph. Eur.) and USP standards, with dual-stage RP-HPLC purity verification (≥ 99.0%), ESI-MS molecular identity confirmation, and strict SAL 10⁻⁶ sterility.'}

SUMMARY OF ATTACHED PRODUCT DOCUMENTATION:
─────────────────────────────────────────────────────────────────────────────
${compoundListText}

REGULATORY & QUALITY ASSURANCES:
${qualityAssuranceText}

Should you require customized protocol consultation, stability data, or volume batch allocations, please do not hesitate to contact our medical desk directly.

Respectfully,

Medical Affairs & Institutional Supply Division
Med-Peptides Laboratory & Research Network
business@med-peptides.com | https://med-peptides.com`;

      return NextResponse.json({
        subject: fallbackSubject,
        executiveSummary: hasCosmetics && !hasPeptides
          ? `Official clinical documentation and trichological cosmeceutical dossiers for ${compoundManifest.length} formulation(s) staged in ${workspaceName}. Formulated with biologically active complexes under EU Regulation 1223/2009 with dermatologically tested tolerance and verified batch traceability.`
          : `Official pharmaceutical documentation package for ${compoundManifest.length} compound(s) staged in ${workspaceName}. All formulations are manufactured under strict aseptic conditions with validated RP-HPLC purity (≥ 99.0%) and ESI-MS molecular identity verification.`,
        compounds: compoundManifest.map(c => {
          if (c.isCosmetic) {
            return {
              compoundName: c.name,
              dosageFormat: `${c.dosage} ${c.format}`,
              pharmacologicalProfile: 'Advanced topical trichology cosmeceutical engineered for follicular microenvironment support, DHT modulation, and cuticular keratin matrix protection.',
              analyticalSpecs: 'EU Reg. 1223/2009 (CPNP) · Dermatologically Tested · ISO 22716 GMP',
              monographUrl: c.monographUrl,
              pdfUrl: c.pdfUrl,
            };
          }
          if (c.isDiagnostic) {
            return {
              compoundName: c.name,
              dosageFormat: `${c.dosage} ${c.format}`,
              pharmacologicalProfile: 'CE-IVDR certified quantitative dried blood spot (DBS) diagnostic assay processed via LC-MS/MS central laboratory methodology.',
              analyticalSpecs: 'CE-IVDR Certified · ISO 15189 Accredited Lab · Whatman® 903',
              monographUrl: c.monographUrl,
              pdfUrl: c.pdfUrl,
            };
          }
          return {
            compoundName: c.name,
            dosageFormat: `${c.dosage} ${c.format}`,
            pharmacologicalProfile: `High-affinity therapeutic peptide formulation targeted for ${c.category}. Validated monoisotopic peak identity and sterile filtration.`,
            analyticalSpecs: 'RP-HPLC Purity ≥ 99.0% · Endotoxins < 0.05 EU/mg · ESI-MS Concordant',
            monographUrl: c.monographUrl,
            pdfUrl: c.pdfUrl,
          };
        }),
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
          description: 'High-level executive summary (1 concise paragraph) outlining therapeutic scope and quality standards matched to the product types.',
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
                description: '2 sentences in formal medical/pharma English describing the primary mechanism of action and clinical/topical indications.',
              },
              analyticalSpecs: {
                type: Type.STRING,
                description: 'Quality benchmark tailored to the product type (e.g. "EU Reg. 1223/2009 · Dermatologically Tested" for cosmetics; "RP-HPLC Purity ≥ 99.0% · ESI-MS" for peptides).',
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

Draft a formal, highly authoritative professional email in professional "Pharma English" to provide the requested clinical datasheets and analytical documentation.

Recipient Information:
- Recipient Name: ${recipientName}
- Recipient Email: ${recipientEmail || 'Colleague / Prescribing Physician'}
- Dossier Reference: ${workspaceName}
- Target Audience Profile: ${audience === 'wholesaler' ? 'B2B Pharmacy Wholesaler / Medical Distributor' : audience === 'patient' ? 'Patient / Private Wellness Client' : 'Prescribing Physician / Medical Director'}
${customNotes ? `- Clinical Notes from Provider: ${customNotes}` : ''}

Audience Profile Instructions:
${audience === 'wholesaler' 
  ? 'Focus heavily on commercial reliability, batch-to-batch CoA consistency, regulatory compliance, cold-chain logistics stability, and analytical benchmarks.'
  : audience === 'patient'
  ? 'Maintain high clinical accuracy but adopt an educational, reassuring, and completely safe tone emphasizing safety, lack of irritants/endotoxins, and clear purpose without confusing jargon.'
  : 'Deepen focus on cellular pathways, receptor affinity or cuticular mechanics, and verified trial endpoints.'
}

Staged Items in this Requisition:
${JSON.stringify(compoundManifest, null, 2)}

Mandatory Email Content & Category Tone Requirements:
1. Sender Identity: Med-Peptides Medical Affairs & Supply Division (business@med-peptides.com).
2. Salutation: Formal ("Dear ${recipientName},").
3. Acknowledgment: Express that following their request, the official clinical monographs and analytical dossiers for the requested products are detailed below.
4. Executive Summary:
   CRITICAL PRODUCT CATEGORY DISTINCTIONS:
   - For Cosmeceuticals / Topical Hair Care (e.g. Colway Shampoo, Conditioner, hair/scalp formulas): Reference EU Cosmetics Regulation (EC) No 1223/2009 compliance, CPNP notification, ISO 22716 GMP, and dermatological tolerance on scalp. NEVER mention RP-HPLC vial purity, endotoxins, or subcutaneous needles for hair shampoos or conditioners!
   - For Diagnostic Blood Tests: Reference CE-IVDR certification, ISO 15189 central laboratory LC-MS/MS, and dried blood spot stability.
   - For Peptides & Biologicals: Reference European Pharmacopoeia / USP guidelines, RP-HPLC purity (≥ 99.0%), ESI-MS identity, and endotoxins < 0.05 EU/mg.
5. Compound Detail Section: For each item:
   - Name, dosage, and format.
   - Mechanism summary (for cosmetics: describe cuticular sealing, follicular microenvironment, caffeine/zinc PCA DHT modulation; for peptides: receptor agonism; for diagnostics: biomarker quantification).
   - Analytical specifications matched strictly to product type (e.g. "EU Reg. 1223/2009 (CPNP) · Dermatologically Tested" for cosmetics; "RP-HPLC Purity ≥ 99.2%" for peptides).
   - EXACT clickable URLs:
     * Live Clinical Monograph: [monographUrl]
     * Analytical Spec Sheet (PDF): [pdfUrl]
6. Sign-off:
   Respectfully,
   Medical Affairs & Institutional Supply Division
   Med-Peptides Laboratory & Research Network
   business@med-peptides.com | https://med-peptides.com

Ensure all medical and cosmetic language is sophisticated, clinically accurate, reassuring, and strictly in English.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
