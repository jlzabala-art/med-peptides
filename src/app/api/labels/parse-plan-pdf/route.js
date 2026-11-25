import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { generateWithResilientGemini, AI_TIER } from '@/lib/ai/geminiModelRouter';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { isAdminServerSession } from '@/lib/serverAdminAuth';

export async function POST(request) {
  if (!(await isAdminServerSession())) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  const rl = checkRateLimit(request, 'ai_extract');
  if (!rl.allowed) return rateLimitExceededResponse(rl);

  try {
    const contentType = request.headers.get('content-type') || '';
    let base64Data = '';
    let mimeType = 'application/pdf';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file.arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'PDF or image file is required.' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.byteLength > 12 * 1024 * 1024) {
        return NextResponse.json({ error: 'File exceeds 12 MB limit.' }, { status: 400 });
      }
      base64Data = buffer.toString('base64');
      mimeType = file.type || 'application/pdf';
    } else {
      const body = await request.json();
      base64Data = String(body?.base64 || '').replace(/^data:[^;]+;base64,/, '');
      mimeType = String(body?.mimeType || 'application/pdf');
    }

    if (!base64Data) {
      return NextResponse.json({ error: 'Empty file payload.' }, { status: 400 });
    }

    const prompt = `Extract clinical prescription and treatment plan details from this clinic document (PDF or image) for pharmacy label preparation.
Return strictly JSON matching the schema:
- patientName: full name of the patient
- fileNumber: patient file/MRN number if present
- doctorName: prescribing physician full name (with Dr. prefix if applicable)
- doctorLicense: physician license number from stamp/signature if present
- clinicName: clinic name
- prescriptionDate: ISO YYYY-MM-DD if present
- parts: array of pharmacy/compounded/injectable/topical items to prepare labels for (prioritize compounded pens, vials, creams, nasal sprays, capsules). For each item:
  - formulaQuery: clean product title (e.g. "Glutathione Pen (600 mg / 3 mL)")
  - volume: net volume or pack quantity including multi-unit count if duration is stated (e.g. "3 mL Pen (×5)" if 3-month plan needs 5 pens)
  - ingredientChips: array of "Ingredient: Strength" strings (e.g. ["Glutathione: 600 mg / 3 mL"])
  - directions: concise patient directions for the label
- notes: summary of co-prescribed OTC supplements or lifestyle notes if any.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING },
        fileNumber: { type: Type.STRING },
        doctorName: { type: Type.STRING },
        doctorLicense: { type: Type.STRING },
        clinicName: { type: Type.STRING },
        prescriptionDate: { type: Type.STRING },
        notes: { type: Type.STRING },
        parts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              formulaQuery: { type: Type.STRING },
              volume: { type: Type.STRING },
              ingredientChips: { type: Type.ARRAY, items: { type: Type.STRING } },
              directions: { type: Type.STRING },
            },
          },
        },
      },
    };

    const result = await generateWithResilientGemini({
      tier: AI_TIER.FLASH,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(result.text || '{}');
    const clean = {
      patientName: sanitizeText(parsed.patientName || '', 120),
      fileNumber: sanitizeText(parsed.fileNumber || '', 40),
      doctorName: sanitizeText(parsed.doctorName || '', 120),
      doctorLicense: sanitizeText(parsed.doctorLicense || '', 60),
      clinicName: sanitizeText(parsed.clinicName || '', 140),
      prescriptionDate: sanitizeText(parsed.prescriptionDate || '', 20),
      notes: sanitizeText(parsed.notes || '', 800),
      parts: Array.isArray(parsed.parts)
        ? parsed.parts.slice(0, 6).map((p) => ({
            formulaQuery: sanitizeText(p?.formulaQuery || '', 140),
            volume: sanitizeText(p?.volume || '3 mL', 40),
            ingredientChips: Array.isArray(p?.ingredientChips)
              ? p.ingredientChips.map((c) => sanitizeText(String(c), 80)).filter(Boolean)
              : [],
            directions: sanitizeText(p?.directions || '', 300),
          }))
        : [],
    };

    return applyRateLimitHeaders(NextResponse.json({ success: true, data: clean }), rl);
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Failed to extract treatment plan PDF.' },
      { status: 500 }
    );
  }
}
