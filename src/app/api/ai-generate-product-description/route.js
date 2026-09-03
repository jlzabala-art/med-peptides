import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, category, product_type, tags } = body;

    const schema = {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: 'A highly professional, medical-grade product description suitable for a clinical catalog (1-2 paragraphs).' },
        mechanism: { type: Type.STRING, description: 'Detailed pharmacological mechanism of action of the compound.' },
        clinicalSummary: { type: Type.STRING, description: 'Indications, typical dosage protocols (for reference only), and potential adverse effects.' },
        seoTitle: { type: Type.STRING, description: 'SEO optimized title for e-commerce.' },
        salesSheet: { type: Type.STRING, description: 'Bullet points with key selling points for clinics and doctors.' },
        compatibleProducts: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: 'List of generic product names that synergize well with this product.'
        }
      },
      required: ['description', 'mechanism', 'clinicalSummary', 'seoTitle', 'salesSheet']
    };

    const prompt = `You are the "Atlas Medical AI", an expert clinical pharmacologist.
    Generate a complete clinical monograph and marketing data for the following product:
    Product Name: "${name}"
    Category: ${category}
    Type: ${product_type}
    Tags: ${tags}
    
    Ensure all text uses a strictly scientific and professional tone appropriate for doctors and medical distributors.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.2
      }
    });

    const structuredData = JSON.parse(response.text());
    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Error generating AI clinical data:', error);
    return NextResponse.json({ error: 'Failed to generate clinical data' }, { status: 500 });
  }
}
