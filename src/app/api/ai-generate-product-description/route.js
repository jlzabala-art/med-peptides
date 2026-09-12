import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { logger } from '@/utils/logger';

// NOTE: Do NOT instantiate GoogleGenAI at module scope — Next.js imports the module
// during static analysis without environment variables being available.
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const RATE_LIMIT_OPTIONS = { limit: 30, windowMs: 60 * 1000, tier: 'ai-generate-product-desc' };

export async function POST(req) {
  const rateInfo = checkRateLimit(req, RATE_LIMIT_OPTIONS);
  if (!rateInfo.allowed) {
    logger.warn('[AI Generate Description] Rate limit exceeded', { tier: 'ai-generate-product-desc', retryAfter: rateInfo.retryAfter });
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    if (!apiKey) {
      logger.error('[AI Generate Description] Missing GEMINI_API_KEY');
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const body = await req.json();
    const name = sanitizeText(body?.name, 200);
    const category = sanitizeText(body?.category, 100);
    const product_type = sanitizeText(body?.product_type, 100);
    const tags = sanitizeText(body?.tags, 500);

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    logger.info('[AI Generate Description] Processing request', { name });

    const ai = new GoogleGenAI({ apiKey });

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
          description: 'List of generic product names that synergize well with this product.',
        },
      },
      required: ['description', 'mechanism', 'clinicalSummary', 'seoTitle', 'salesSheet'],
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
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini returned an empty response.');
    const structuredData = JSON.parse(text);
    const res = NextResponse.json(structuredData);
    return applyRateLimitHeaders(res, rateInfo);
  } catch (error) {
    logger.error('[AI Generate Description] Unhandled error', error);
    return NextResponse.json({ error: 'Failed to generate clinical data' }, { status: 500 });
  }
}
