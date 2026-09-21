import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { logger } from '@/utils/logger';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const RATE_LIMIT_OPTIONS = { limit: 30, windowMs: 60 * 1000, tier: 'ai-enrich-product' };

export async function POST(request) {
  const rateInfo = checkRateLimit(request, RATE_LIMIT_OPTIONS);
  if (!rateInfo.allowed) {
    logger.warn('[AI Enrich Product] Rate limit exceeded', { tier: 'ai-enrich-product', retryAfter: rateInfo.retryAfter });
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    if (!apiKey) {
      logger.error('[AI Enrich Product] Missing GEMINI_API_KEY');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const productName = sanitizeText(body?.productName, 200);
    const category = sanitizeText(body?.category || '', 100);
    const strength = sanitizeText(body?.strength || '', 50);
    const presentation = sanitizeText(body?.presentation || 'vial', 50);

    if (!productName || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }
    logger.info('[AI Enrich Product] Processing request', { productName });

    const ai = new GoogleGenAI({ apiKey });

    // ─── Category-Specific Prompt & Schema Resolver ───────────────────────────
    const cat = (category || '').toLowerCase().trim();

    let systemPrompt = '';
    let schema = null;

    if (cat === 'supplement' || cat === 'nutricosmetics' || cat === 'nutraceutical' || cat === 'weight_loss') {
      systemPrompt = `You are a Senior Clinical Nutritionist and Dietary Supplement Formulator for Atlas Solutions Master Catalog.
Generate comprehensive, verified nutraceutical and regulatory data for:
- Product: ${productName}
- Category: Dietary Supplement / Nutraceutical
- Strength/Serving: ${strength || 'Standard clinical serving size'}
- Presentation: ${presentation || 'Oral capsule or powder'}

Rules:
1. Provide accurate standardized ingredient specifications (e.g., Standardized 95% Curcuminoids Curcuma longa extract).
2. Detail dietary serving size, administration guidelines, and daily intake.
3. List evidence-backed clinical benefits and molecular mechanisms of action.
4. Detail safety contraindications, drug interactions, and allergen warnings (e.g., pregnancy, biliary obstruction, blood thinners).
5. Specify regulatory compliance (GMP, FDA registered facility) and synergistic nutrient pairings.`;

      schema = {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING, description: 'Standardized botanical / nutrient INN or chemical name' },
          ingredients: { type: Type.STRING, description: 'Standardized active ingredient and extract specification' },
          dosage: { type: Type.STRING, description: 'Recommended serving size and daily frequency' },
          form: { type: Type.STRING, description: 'Delivery format (Capsule, Bulk Powder, Softgel, Sublingual Liquid)' },
          mechanismOfAction: { type: Type.STRING, description: 'Cellular and physiological mechanisms of action' },
          therapeuticIndications: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Primary health and clinical goals' },
          allergens: { type: Type.STRING, description: 'Allergen warnings, interactions and contraindications' },
          regulatoryLabel: { type: Type.STRING, description: 'Regulatory standards (e.g. cGMP Compliant / FDA Registered Facility)' },
          knownSynergies: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Synergistic companion nutrients' },
          categoryTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Health tags' }
        },
        required: ['scientificName', 'ingredients', 'dosage', 'form', 'mechanismOfAction', 'therapeuticIndications', 'allergens', 'regulatoryLabel']
      };
    } else if (
      cat === 'diagnostic_test' ||
      cat === 'genetic_test' ||
      cat === 'biomarker_test' ||
      cat === 'genomics_biomarkers' ||
      cat === 'genomics'
    ) {
      systemPrompt = `You are the Medical Laboratory Director and Clinical Geneticist for Atlas Solutions Master Catalog.
Generate comprehensive diagnostic assay and laboratory specifications for:
- Test: ${productName}
- Category: Clinical Diagnostic / Biomarker / Genetic Test
- Specimen/Sample: ${presentation || 'Blood DBS or Saliva'}

Rules:
1. Provide accurate clinical utility and diagnostic overview.
2. Specify biological sample type (e.g. Capillary Blood DBS, Venous Serum, Saliva DNA Buffer).
3. Detail turnaround time (TAT) and laboratory methodology (e.g., High-Density Microarray +700K SNPs, Enzymatic assay, LC-MS/MS).
4. List key biomarkers or genetic loci evaluated.
5. Detail laboratory accreditation standards (e.g., CLIA, CAP, ISO 15189, CE-IVD) and report delivery format.`;

      schema = {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING, description: 'Clinical test title and methodology classification' },
          sampleType: { type: Type.STRING, description: 'Biological specimen required (e.g. Capillary Blood DBS, Saliva DNA Buffer)' },
          turnaroundTime: { type: Type.STRING, description: 'Estimated turnaround time (e.g. 3-5 business days, 2-3 weeks)' },
          methodology: { type: Type.STRING, description: 'Analytical technology/platform' },
          mechanismOfAction: { type: Type.STRING, description: 'Clinical diagnostic utility and biological significance' },
          therapeuticIndications: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Actionable clinical health areas' },
          biomarkers: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Key biomarkers or gene pathways measured' },
          labAccreditation: { type: Type.STRING, description: 'Laboratory quality accreditation (e.g. ISO 15189 / CLIA / CE-IVD)' },
          reportFormat: { type: Type.STRING, description: 'Diagnostic reporting format (e.g. Interactive Digital Health Portal & PDF)' },
          categoryTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Diagnostic category tags' }
        },
        required: ['scientificName', 'sampleType', 'turnaroundTime', 'methodology', 'mechanismOfAction', 'therapeuticIndications', 'labAccreditation', 'reportFormat']
      };
    } else if (cat === 'raw_material' || cat === 'api_raw_material' || cat === 'api') {
      systemPrompt = `You are the Chief Compounding Chemist and Pharmaceutical API Specialist for Atlas Solutions Master Catalog.
Generate comprehensive pharmacopeial and master compounding specifications for:
- API Name: ${productName}
- Category: Active Pharmaceutical Ingredient (API) / Raw Material
- Grade: ${strength || 'USP / Ph. Eur. Compounding Grade'}
- Presentation: ${presentation || 'Bulk Powder'}

Rules:
1. Provide accurate chemical and molecular data (CAS Number, Molecular Formula, Molecular Weight).
2. Detail pharmacopeial grade (USP, Ph. Eur., BP) and HPLC purity standards (≥99.0%).
3. Detail master compounding guidelines: recommended concentrations (%), dosing range, vehicle compatibility, and solubility.
4. Detail optimal pH stability range and storage conditions (e.g., Controlled Room Temperature 15°C to 25°C).`;

      schema = {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING, description: 'Standardized chemical / INN name' },
          casNumber: { type: Type.STRING, description: 'Official CAS Registry Number' },
          pubchemCid: { type: Type.STRING, description: 'PubChem CID' },
          molecularFormula: { type: Type.STRING, description: 'Chemical formula (e.g. C21H20O6)' },
          molecularWeight: { type: Type.STRING, description: 'Molecular weight with unit (e.g. 368.38 g/mol)' },
          mechanismOfAction: { type: Type.STRING, description: 'Pharmacological mechanism of action' },
          compoundingRules: {
            type: Type.OBJECT,
            properties: {
              recommendedConcentration: { type: Type.STRING, description: 'Compounding concentration range' },
              dosageRange: { type: Type.STRING, description: 'Clinical dosing range according to prescription' },
              optimalPh: { type: Type.STRING, description: 'Optimal stability pH range' },
              compatibleVehicles: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Compatible compounding vehicles' },
              solubility: { type: Type.STRING, description: 'Solubility profile' }
            },
            required: ['recommendedConcentration', 'dosageRange', 'optimalPh', 'compatibleVehicles', 'solubility']
          },
          storageConditions: { type: Type.STRING, description: 'Storage conditions (e.g. Controlled Room Temperature 15°C to 25°C)' },
          grade: { type: Type.STRING, description: 'Pharmacopeial standard (e.g. USP / Ph. Eur.)' },
          purity: { type: Type.STRING, description: 'Purity specification (e.g. ≥ 99.0% by HPLC)' },
          therapeuticIndications: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Compounding clinical goals' }
        },
        required: ['scientificName', 'casNumber', 'mechanismOfAction', 'compoundingRules', 'storageConditions', 'grade', 'purity']
      };
    } else {
      // Default: Peptide & Hormone Chemist
      systemPrompt = `You are the Chief Medicinal Chemist and Peptide Pharmacologist for Atlas Solutions Master Catalog.
Generate comprehensive, verified scientific data for the specified product.

Product Input:
- Name: ${productName}
- Category: ${category || 'Peptides & Research Compounds'}
- Strength/Dosage: ${strength || 'Standard clinical strength'}
- Presentation: ${presentation}

Rules:
1. Provide accurate chemical and pharmacological details (MOA, receptors, sequence).
2. Look up and supply official CAS Registry Number (e.g. 137525-51-0 for BPC-157, 910463-68-2 for Semaglutide, 2023788-19-2 for Tirzepatide). For non-chemical items, return "N/A".
3. Detail exact reconstitution protocol: solvent, recommended volume in mL, resulting mg/mL concentration, and temperature stability.
4. Identify evidence-backed clinical indications and synergistic companion peptides.`;

      schema = {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING, description: 'Standardized scientific chemical / INN / peptide name' },
          casNumber: { type: Type.STRING, description: 'Official CAS Registry Number formatted as digits-digits-digit' },
          pubchemCid: { type: Type.STRING, description: 'PubChem Compound Identification number (CID) if found, or empty string' },
          molecularFormula: { type: Type.STRING, description: 'Chemical or peptide formula if known' },
          sequence: { type: Type.STRING, description: 'Amino acid sequence if a peptide' },
          mechanismOfAction: { type: Type.STRING, description: 'Detailed physiological and cellular mechanism of action' },
          targetReceptors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Receptors and cellular targets'
          },
          therapeuticIndications: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Primary clinical/research therapeutic indications'
          },
          reconstitution: {
            type: Type.OBJECT,
            properties: {
              recommendedSolvent: { type: Type.STRING, description: 'Recommended solvent (e.g. Bacteriostatic Water 0.9% Benzyl Alcohol)' },
              recommendedVolumeMl: { type: Type.NUMBER, description: 'Standard volume of solvent in milliliters' },
              resultingConcentration: { type: Type.STRING, description: 'Resulting solution concentration' },
              reconstitutionMethod: { type: Type.STRING, description: 'Step-by-step gentle reconstitution technique' },
              storageRefrigerated: { type: Type.STRING, description: 'Stability when reconstituted at 2°C to 8°C' },
              storageLyophilized: { type: Type.STRING, description: 'Stability of dry powder at -20°C' }
            },
            required: ['recommendedSolvent', 'recommendedVolumeMl', 'resultingConcentration', 'storageRefrigerated', 'storageLyophilized']
          },
          knownSynergies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Compounds that act synergistically with this molecule'
          },
          categoryTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Categorization tags'
          }
        },
        required: ['scientificName', 'casNumber', 'mechanismOfAction', 'targetReceptors', 'therapeuticIndications', 'reconstitution', 'knownSynergies']
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1
      }
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const productEnrichment = JSON.parse(text);
    const jsonResponse = NextResponse.json({ success: true, data: productEnrichment });
    return applyRateLimitHeaders(jsonResponse, rateInfo);
  } catch (error) {
    logger.error('[AI Enrich Product] Unhandled error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enrich product data.' },
      { status: 500 }
    );
  }
}
