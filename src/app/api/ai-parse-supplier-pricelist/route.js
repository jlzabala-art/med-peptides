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

    const formData = await request.formData();
    const file = formData.get('file');
    const supplierName = formData.get('supplierName') || 'Unknown Supplier';

    if (!file) {
      return NextResponse.json({ error: 'No supplier pricelist file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    const ai = new GoogleGenAI({ apiKey });

    const schema = {
      type: Type.OBJECT,
      properties: {
        supplierIdentified: { type: Type.STRING, description: 'Detected supplier brand or laboratory name' },
        currency: { type: Type.STRING, description: 'Currency code (e.g. USD, EUR, AED, GBP)' },
        effectiveDate: { type: Type.STRING, description: 'Effective date or version of the pricelist if noted' },
        totalProductsExtracted: { type: Type.INTEGER, description: 'Total number of items extracted' },
        items: {
          type: Type.ARRAY,
          description: 'List of extracted product items and price tiers',
          items: {
            type: Type.OBJECT,
            properties: {
              rawName: { type: Type.STRING, description: 'Product name as printed on supplier sheet' },
              standardizedName: { type: Type.STRING, description: 'Standardized INN / Peptide name (e.g. BPC-157, TB-500, NAD+)' },
              format: { type: Type.STRING, enum: ['vial', 'raw_powder_api', 'capsule', 'nasal_spray', 'cartridge', 'supplies'] },
              dosageOrStrength: { type: Type.STRING, description: 'Dosage or container size (e.g. 5mg, 10mg, 1g, 10g, 100g, 50ml)' },
              purityHplc: { type: Type.STRING, description: 'Purity percentage if stated (e.g. >=99.2%, 98.5%)' },
              costPrice: { type: Type.NUMBER, description: 'Supplier acquisition cost price per unit or per gram' },
              moq: { type: Type.INTEGER, description: 'Minimum order quantity (e.g. 1, 5, 10, 100)' },
              leadTimeDays: { type: Type.STRING, description: 'Lead time if noted (e.g. 24h, 3-5 days, 7-10 days)' },
              recommendedPrices: {
                type: Type.OBJECT,
                properties: {
                  wholesale: { type: Type.NUMBER, description: 'Recommended B2B Wholesale price (+30-35% margin)' },
                  clinic: { type: Type.NUMBER, description: 'Recommended Clinic / Doctor price (+50-60% margin)' },
                  retail: { type: Type.NUMBER, description: 'Recommended Retail / Patient price (+80-100% margin)' }
                },
                required: ['wholesale', 'clinic', 'retail']
              }
            },
            required: ['standardizedName', 'format', 'costPrice', 'recommendedPrices']
          }
        }
      },
      required: ['supplierIdentified', 'currency', 'totalProductsExtracted', 'items']
    };

    const systemPrompt = `You are an institutional procurement analyst and peptide market specialist for RegenPept.
Your task is to parse a supplier price sheet (PDF or image) from "${supplierName}".

Extraction Guidelines:
1. Identify all products, distinguish between Finished Vials (e.g., 5mg vial) and Raw API Powder (e.g., 10g bulk powder).
2. Extract the exact unit/gram cost price and MOQ.
3. Compute intelligent, competitive multi-channel prices:
   - Wholesale: Cost * 1.35
   - Clinic: Cost * 1.55
   - Retail: Cost * 1.90
4. Standardize peptide names to match international nomenclature.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType,
                data: buffer.toString('base64'),
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsedData = JSON.parse(text);
    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('[AI Parse Supplier Pricelist] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse supplier pricelist.' },
      { status: 500 }
    );
  }
}
