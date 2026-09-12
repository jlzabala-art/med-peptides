import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req) {
  const rateInfo = checkRateLimit(req, { limit: 25, windowMs: 60 * 1000, tier: 'ai-chat' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const body = await req.json();
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
    } = context;

    const safePreferences = Array.isArray(preferences) ? preferences : [preferences].filter(Boolean);
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

    // Build rich clinical context prompt tailored to screen scope
    const systemPrompt = `${systemPersona || 'You are Atlas AI, the expert scientific and clinical research peptide assistant for Atlas Health / Med-Peptides.'}

USER CONTEXT:
- Active Role / Screen Scope: ${screenScope || 'General Research'} (${agentName || 'Atlas AI'})
- Research Goal: ${goal || 'General Health & Longevity'}
- Experience Level: ${experienceLevel || 'Beginner / Explorer'}
- Priorities: ${safePreferences.length > 0 ? safePreferences.join(', ') : 'Safety & Efficacy'}
- Current Active Page: ${pathname}
- Cart Contents: ${safeCartItems.length > 0 ? safeCartItems.map(i => `${i.name || i.title} (x${i.quantity || 1})`).join(', ') : 'Empty'}

GUIDELINES:
1. Always respond in English unless the user writes in another language.
2. Provide structured, scientifically accurate explanations using markdown (bullet points, bold highlights, clear headers).
3. If the user asks about peptides, mention specific relevant compounds from the catalog with links if appropriate:
   - Recovery & Repair: [BPC-157](/product/bpc-157), [TB-500](/product/tb-500), [GHK-Cu](/product/ghk-cu)
   - Metabolic & Weight: [Tirzepatide](/product/tirzepatide), [Semaglutide](/product/semaglutide), [AOD-9604](/product/aod-9604)
   - Cognitive & Focus: [Semax](/product/semax), [Selank](/product/selank), [Dihexa](/product/dihexa)
   - Longevity: [Epithalon](/product/epithalon), [GHK-Cu](/product/ghk-cu), [CJC-1295](/product/cjc-1295)
   - Sleep: [DSIP](/product/dsip), [Epitalon](/product/epitalon)
4. For reconstitution and dosage calculations, emphasize standard dilution with bacteriostatic water (e.g. 2mL of BAC water per 5mg/10mg vial).
5. Always keep advice grounded in scientific research standards and remind users that compounds are for professional research protocols.`;

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
            timestamp: new Date().toISOString()
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
                timestamp: new Date().toISOString()
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
    let fallbackReply = `Here is what you should know about **${goal || 'peptide research'}**:\n\n` +
      `• **Target Mechanism**: Research indicates targeted peptide signaling supports receptor binding with high specificity.\n` +
      `• **Key Compounds**: For your profile, explore [BPC-157](/product/bpc-157), [GHK-Cu](/product/ghk-cu), or [Epithalon](/product/epithalon).\n` +
      `• **Reconstitution Guide**: Vials typically reconstitute with 1.0mL – 2.0mL of bacteriostatic water. You can check the [Dose Calculator](/calculator) for exact units.\n\n` +
      `How else can I assist your protocol today?`;

    const fallbackRes = NextResponse.json({
      reply: fallbackReply,
      goal,
      timestamp: new Date().toISOString()
    });
    return applyRateLimitHeaders(fallbackRes, rateInfo);

  } catch (error) {
    console.error('[Atlas AI API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal AI Error' }, { status: 500 });
  }
}
