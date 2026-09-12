import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { logger } from '@/utils/logger';

const RATE_LIMIT_OPTIONS = { limit: 40, windowMs: 60 * 1000, tier: 'ai-translate-clinical' };
// Only allow alphanumeric IDs — prevents Firestore path injection
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const ALLOWED_TARGET_TYPES = new Set(['product', 'protocol']);
const ALLOWED_LANGS = new Set(['es', 'en', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ar']);

/**
 * POST /api/ai-translate-clinical
 *
 * Translates clinical descriptions and instructions on-demand and caches them
 * directly in Firestore under `aiContent.translations.{lang}` for subsequent instant visits.
 */
export async function POST(request) {
  const rateInfo = checkRateLimit(request, RATE_LIMIT_OPTIONS);
  if (!rateInfo.allowed) {
    logger.warn('[AI Translate Clinical] Rate limit exceeded', { tier: 'ai-translate-clinical', retryAfter: rateInfo.retryAfter });
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { targetId, targetType = 'product', targetLang = 'es', fields = {} } = body;

    // Guard against Firestore path injection and invalid values
    if (!targetId || !SAFE_ID_PATTERN.test(targetId)) {
      return NextResponse.json({ ok: false, message: 'Invalid or missing targetId' }, { status: 400 });
    }
    if (!ALLOWED_TARGET_TYPES.has(targetType)) {
      return NextResponse.json({ ok: false, message: 'Invalid targetType' }, { status: 400 });
    }
    if (!ALLOWED_LANGS.has(targetLang)) {
      return NextResponse.json({ ok: false, message: 'Unsupported target language' }, { status: 400 });
    }
    if (!adminDb) {
      return NextResponse.json({ ok: false, message: 'Database unavailable' }, { status: 503 });
    }

    const collectionName = targetType === 'protocol' ? 'protocols' : 'products';
    const docRef = adminDb.collection(collectionName).doc(targetId);
    const docSnap = await docRef.get().catch(() => null);

    if (!docSnap || !docSnap.exists) {
      return NextResponse.json({ ok: false, message: 'Document not found' }, { status: 404 });
    }

    const docData = docSnap.data() || {};
    const existingTranslations = docData.aiContent?.translations?.[targetLang] || docData.translations?.[targetLang];

    if (existingTranslations && Object.keys(existingTranslations).length > 0) {
      return NextResponse.json({ ok: true, cached: true, translations: existingTranslations });
    }

    // Call Gemini translation if API key is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    let translatedFields = {};

    if (apiKey && (fields.description || fields.summary || fields.instructions)) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a medical & peptide translation expert. Translate the following clinical content into language code "${targetLang}". Return ONLY valid JSON with the exact same keys:
${JSON.stringify(fields, null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          translatedFields = JSON.parse(response.text);
        }
      } catch (aiErr) {
        console.warn('Gemini on-demand translation fallback notice:', aiErr.message);
      }
    }

    // Persist translation in Firestore if generated
    if (Object.keys(translatedFields).length > 0) {
      await docRef.set({
        aiContent: {
          translations: {
            [targetLang]: translatedFields,
          },
        },
      }, { merge: true }).catch(err => console.error('Error saving translation to Firestore:', err));
    }

    const jsonResponse = NextResponse.json({ ok: true, cached: false, translations: translatedFields });
    return applyRateLimitHeaders(jsonResponse, rateInfo);
  } catch (error) {
    logger.error('[AI Translate Clinical] Unhandled error', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
