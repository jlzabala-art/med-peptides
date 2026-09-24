import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { adminDb } from '@/lib/firebaseAdmin';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { logger } from '@/utils/logger';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const RATE_LIMIT_OPTIONS = { limit: 20, windowMs: 60 * 1000, tier: 'ai-enrich-fda' };

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rateInfo = checkRateLimit(request, RATE_LIMIT_OPTIONS);
  if (!rateInfo.allowed) {
    logger.warn('[Enrich FDA Status] Rate limit exceeded', { tier: 'ai-enrich-fda', retryAfter: rateInfo.retryAfter });
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const body = await request.json();
    const productName = sanitizeText(body?.productName || body?.canonicalName || '', 200);
    const slug = sanitizeText(body?.slug || '', 100);
    const casNumber = sanitizeText(body?.casNumber || '', 50);
    const productId = sanitizeText(body?.productId || '', 100);

    if (!productName && !slug) {
      return NextResponse.json({ error: 'Product name or slug is required.' }, { status: 400 });
    }

    if (!apiKey) {
      logger.error('[Enrich FDA Status] Missing GEMINI_API_KEY');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    logger.info('[Enrich FDA Status] Querying Gemini for latest FDA standing', { productName, slug, casNumber });

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a Senior US FDA Regulatory Affairs and Clinical Compounding Counsel for an accredited medical research and clinical peptide repository.
Your task is to determine the authoritative, up-to-date US FDA regulatory classification and clinical status for:
- Compound Name: ${productName}
- CAS Number: ${casNumber || 'Not specified'}
- Identifier / Slug: ${slug}

Analyze the compound against official US regulatory frameworks:
1. 'fda_approved': Fully approved by the FDA under an approved New Drug Application (NDA) or Biologics License Application (BLA) for commercial prescription marketing (e.g., Semaglutide, Tirzepatide, Tesamorelin, Sermorelin).
2. 'fda_pcac_503a_recommended': Formally evaluated and voted favorably by the FDA Pharmacy Compounding Advisory Committee (PCAC) for inclusion on the Section 503A Bulks Compounding List (e.g., BPC-157, TB-500, KPV, MOTS-c, Semax, Epitalon, Emideltide).
3. 'clinical_investigational': Currently undergoing active Investigational New Drug (IND) clinical development and clinical trials (Phase 1, 2, or 3), not yet commercially approved by FDA (e.g., Retatrutide, Cagrilintide, Mazdutide, Survodutide).
4. 'fda_category_2_restricted': Classified on FDA Category 2 with specific safety alerts or restrictions against compounding.
5. 'research_analytical_standard': Research-grade analytical standard without human therapeutic approval.

Be factually accurate, clinical, and precise. Format review date in English (e.g., "September 2026").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Provide the current FDA regulatory classification and advisory standing for "${productName}" (CAS: ${casNumber || 'N/A'}).`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              enum: [
                'fda_approved',
                'fda_pcac_503a_recommended',
                'clinical_investigational',
                'fda_category_2_restricted',
                'research_analytical_standard'
              ],
              description: 'Strict FDA status category'
            },
            badgeLabel: {
              type: Type.STRING,
              description: 'Human-readable badge label (e.g., "Under Active IND Evaluation" or "FDA PCAC 503A Recommended")'
            },
            shortBadge: {
              type: Type.STRING,
              description: 'Compact badge text (e.g., "Active IND" or "503A PCAC ✓" or "FDA Approved")'
            },
            voteResult: {
              type: Type.STRING,
              description: 'Official advisory finding or clinical summary headline'
            },
            advisoryBody: {
              type: Type.STRING,
              description: 'Relevant regulatory body (e.g., "Clinical Trial Investigation / FDA CDER" or "FDA Pharmacy Compounding Advisory Committee (PCAC)")'
            },
            rulingDate: {
              type: Type.STRING,
              description: 'Date or month of latest ruling/status (e.g., "September 2026" or "July 2026")'
            },
            phase: {
              type: Type.STRING,
              description: 'Clinical trial phase or regulatory standing (e.g., "Active Phase 3 Clinical Trials" or "NDA Approved" or "PCAC 503A Review")'
            },
            summary: {
              type: Type.STRING,
              description: 'Detailed 2-3 sentence clinical-regulatory summary of FDA standing'
            },
            legalNotice: {
              type: Type.STRING,
              description: 'Specific compliance and Section 503A / 503B compounding disclosure statement'
            }
          },
          required: ['status', 'badgeLabel', 'shortBadge', 'voteResult', 'advisoryBody', 'rulingDate', 'summary', 'legalNotice']
        }
      }
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new Error('Empty response from AI regulatory engine.');
    }

    const parsed = JSON.parse(rawText);
    const nowIso = new Date().toISOString();

    // Map color scheme based on status
    const colorScheme = parsed.status === 'fda_approved'
      ? { bg: '#f0fdf4', border: '#86efac', text: '#15803d', icon: '✓', accent: '#16a34a' }
      : parsed.status === 'fda_pcac_503a_recommended'
      ? { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', icon: '🛡️', accent: '#2563eb' }
      : parsed.status === 'clinical_investigational'
      ? { bg: '#faf5ff', border: '#d8b4fe', text: '#7e22ce', icon: '🔬', accent: '#9333ea' }
      : parsed.status === 'fda_category_2_restricted'
      ? { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '⚠️', accent: '#b91c1c' }
      : { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', icon: '⚗️', accent: '#64748b' };

    const fdaRegulatoryData = {
      ...parsed,
      canonicalName: productName,
      casNumber: casNumber || '',
      colorScheme,
      updatedAt: nowIso,
      source: 'gemini_verified_fda'
    };

    // ── Persist in Firestore ──
    if (adminDb) {
      try {
        if (productId) {
          await adminDb.collection('products').doc(productId).set(
            { fdaRegulatory: fdaRegulatoryData },
            { merge: true }
          );
          logger.info('[Enrich FDA Status] Persisted to product doc by ID', { productId });
        } else if (slug) {
          const snap = await adminDb.collection('products').where('slug', '==', slug).limit(1).get();
          if (!snap.empty) {
            await snap.docs[0].ref.set(
              { fdaRegulatory: fdaRegulatoryData },
              { merge: true }
            );
            logger.info('[Enrich FDA Status] Persisted to product doc by slug', { slug, docId: snap.docs[0].id });
          }
        }
      } catch (dbErr) {
        logger.warn('[Enrich FDA Status] Failed to write to Firestore:', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: fdaRegulatoryData
    });
  } catch (err) {
    logger.error('[Enrich FDA Status] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
