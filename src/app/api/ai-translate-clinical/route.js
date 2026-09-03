import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

/**
 * POST /api/ai-translate-clinical
 *
 * Translates clinical descriptions and instructions on-demand and caches them
 * directly in Firestore under `aiContent.translations.{lang}` for subsequent instant visits.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { targetId, targetType = 'product', targetLang = 'es', fields = {} } = body;

    if (!targetId || !targetLang || !adminDb) {
      return NextResponse.json({ ok: false, message: 'Missing parameters' }, { status: 400 });
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

    return NextResponse.json({ ok: true, cached: false, translations: translatedFields });
  } catch (error) {
    console.error('Error in ai-translate-clinical route:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
