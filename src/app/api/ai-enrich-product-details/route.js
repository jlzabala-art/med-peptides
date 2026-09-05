import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export async function POST(request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const { productName, category = '', strength = '', presentation = 'vial' } = await request.json();

    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Structured Schema for Product Clinical, CAS & Reconstitution Enrichment
    const schema = {
      type: Type.OBJECT,
      properties: {
        scientificName: { type: Type.STRING, description: 'Standardized scientific chemical / INN / peptide name' },
        casNumber: { type: Type.STRING, description: 'Official CAS Registry Number formatted as digits-digits-digit (e.g. 137525-51-0, 910463-68-2, 57-91-0). If a medical device, injection pen, or diagnostic test, return "N/A"' },
        pubchemCid: { type: Type.STRING, description: 'PubChem Compound Identification number (CID) if found, or empty string' },
        molecularFormula: { type: Type.STRING, description: 'Chemical or peptide formula if known (e.g. C62H98N16O22)' },
        sequence: { type: Type.STRING, description: 'Amino acid sequence if a peptide (e.g. Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val)' },
        mechanismOfAction: { type: Type.STRING, description: 'Detailed physiological and cellular mechanism of action' },
        targetReceptors: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Receptors and cellular targets (e.g. VEGFR-2, GHRH-R, GLP-1R)'
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
            recommendedVolumeMl: { type: Type.NUMBER, description: 'Standard volume of solvent in milliliters (e.g. 2.0, 3.0, 5.0)' },
            resultingConcentration: { type: Type.STRING, description: 'Resulting solution concentration (e.g. 2.5 mg/ml, 5 mg/ml)' },
            reconstitutionMethod: { type: Type.STRING, description: 'Step-by-step gentle reconstitution technique avoiding foaming' },
            storageRefrigerated: { type: Type.STRING, description: 'Stability when reconstituted at 2°C to 8°C (e.g. 28-30 days)' },
            storageLyophilized: { type: Type.STRING, description: 'Stability of dry powder at -20°C (e.g. 24-36 months)' }
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
          description: 'Categorization tags (e.g. Longevity, Tissue Repair, GH Secretagogue, Nootropic, Incretin)'
        }
      },
      required: ['scientificName', 'casNumber', 'mechanismOfAction', 'targetReceptors', 'therapeuticIndications', 'reconstitution', 'knownSynergies']
    };

    const systemPrompt = `You are the Chief Medicinal Chemist and Peptide Pharmacologist for Atlas Solutions Master Catalog.
Generate comprehensive, verified scientific data for the specified product.

Product Input:
- Name: ${productName}
- Category: ${category || 'Peptides & Research Compounds'}
- Strength/Dosage: ${strength || 'Standard clinical strength'}
- Presentation: ${presentation}

Rules:
1. Provide accurate chemical and pharmacological details (MOA, receptors, sequence).
2. Look up and supply the official CAS Registry Number (e.g. 137525-51-0 for BPC-157, 910463-68-2 for Semaglutide, 2023788-19-2 for Tirzepatide, 57-91-0 for 17-a-Estradiol). For non-chemical items (devices, injection pens, diagnostic panels, supplies), return "N/A".
3. Detail the exact reconstitution protocol: solvent, recommended volume in mL, resulting mg/mL concentration, and temperature stability.
4. Identify evidence-backed clinical indications and synergistic companion peptides.`;

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
    return NextResponse.json({
      success: true,
      data: productEnrichment
    });
  } catch (error) {
    console.error('[AI Product Enrichment] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enrich product data.' },
      { status: 500 }
    );
  }
}
