import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { sanitizeText } from '@/utils/apiValidator';
import { logger } from '@/utils/logger';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// Clinical scribe is the most sensitive endpoint: 10 requests per minute per IP
const RATE_LIMIT_OPTIONS = { limit: 10, windowMs: 60 * 1000, tier: 'ai-clinical-scribe' };

export async function POST(request) {
  // Rate limiting — clinical scribe is high-cost endpoint
  const rateInfo = checkRateLimit(request, RATE_LIMIT_OPTIONS);
  if (!rateInfo.allowed) {
    logger.warn('[AI Clinical Scribe] Rate limit exceeded', { tier: 'ai-clinical-scribe', retryAfter: rateInfo.retryAfter });
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    if (!apiKey) {
      logger.error('[AI Clinical Scribe] Missing GEMINI_API_KEY');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const rawNotes = body?.clinicalNotes;
    const patientProfile = body?.patientProfile || {};

    // Sanitize: strip null bytes, scripts, truncate to 8 000 chars
    const clinicalNotes = sanitizeText(rawNotes, 8000);
    const sanitizedProfile = {
      name: sanitizeText(patientProfile.name, 200),
      age: sanitizeText(String(patientProfile.age || ''), 20),
      gender: sanitizeText(patientProfile.gender, 50),
      medicalHistory: sanitizeText(patientProfile.medicalHistory, 2000),
      allergies: sanitizeText(patientProfile.allergies, 1000),
    };

    if (!clinicalNotes || clinicalNotes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Clinical notes or dictation text is required.' },
        { status: 400 }
      );
    }

    logger.info('[AI Clinical Scribe] Processing request', { notesLength: clinicalNotes.length });
    const ai = new GoogleGenAI({ apiKey });

    // Structured Output Schema for Clinical Scribe
    const schema = {
      type: Type.OBJECT,
      properties: {
        clinicalSummary: {
          type: Type.STRING,
          description: 'Concise physician-grade summary of the clinical intent and diagnosis'
        },
        patientTargetGoal: {
          type: Type.STRING,
          description: 'Primary therapeutic objective (e.g. Tissue Regeneration, Sirtuin Longevity, GH Optimization)'
        },
        medications: {
          type: Type.ARRAY,
          description: 'List of structured peptide and pharmacological compounds extracted from the notes',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Standardized generic molecule/peptide name (e.g. BPC-157, TB-500, NAD+, CJC-1295)' },
              dosage: { type: Type.STRING, description: 'Single administration dosage (e.g. 250 mcg, 500 mcg, 100 mg, 5 mg)' },
              route: { type: Type.STRING, description: 'Route of administration (e.g. Subcutaneous, Oral, Topical, IV, IM)' },
              frequency: { type: Type.STRING, description: 'Administration frequency (e.g. Twice daily, Once daily before sleep, Weekly)' },
              durationWeeks: { type: Type.INTEGER, description: 'Recommended treatment cycle length in weeks (e.g. 4, 6, 8, 12)' },
              recommendedVials: { type: Type.INTEGER, description: 'Total calculated number of commercial vials needed for the full cycle' },
              reconstitutionInstructions: { type: Type.STRING, description: 'Specific reconstitution instructions (e.g. Reconstitute 5mg vial with 2.0ml Bacteriostatic Water)' },
              administrationNotes: { type: Type.STRING, description: 'Patient administration advice (e.g. Inject into abdominal subcutaneous fat. Keep refrigerated at 2-8°C)' }
            },
            required: ['name', 'dosage', 'route', 'frequency', 'durationWeeks', 'recommendedVials']
          }
        },
        accessories: {
          type: Type.ARRAY,
          description: 'Required medical supplies and solvent items for sterile reconstitution and administration',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Supply item name (e.g. Bacteriostatic Water 30ml, Insulin Syringes 31G 1ml Pack of 100, Alcohol Prep Pads)' },
              quantity: { type: Type.INTEGER, description: 'Quantity needed' },
              reason: { type: Type.STRING, description: 'Clinical reason for accessory inclusion' }
            },
            required: ['name', 'quantity']
          }
        },
        safetyAlerts: {
          type: Type.ARRAY,
          description: 'Clinical warnings, contraindications, or drug-drug interaction cautions',
          items: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] },
              title: { type: Type.STRING, description: 'Short alert title' },
              description: { type: Type.STRING, description: 'Clinical rationale and recommended physician action' }
            },
            required: ['severity', 'title', 'description']
          }
        },
        patientAdministrationSchedule: {
          type: Type.STRING,
          description: 'Clear, patient-facing plain language administration schedule for 7 days/week'
        }
      },
      required: ['clinicalSummary', 'patientTargetGoal', 'medications', 'accessories', 'safetyAlerts']
    };

    const systemPrompt = `You are the Lead Clinical Peptide Pharmacologist and AI Scribe for RegenPept.
Your task is to parse freeform clinical notes or doctor dictations into a standardized, institutional medical prescription.

Patient Context:
- Name: ${sanitizedProfile.name || 'Not provided'}
- Age/Gender: ${sanitizedProfile.age || sanitizedProfile.gender || 'Not specified'}
- Medical History/Allergies: ${sanitizedProfile.medicalHistory || sanitizedProfile.allergies || 'None reported'}

Rules:
1. Standardize peptide names into clean international nomenclature (e.g. "bpc" -> "BPC-157", "tb" -> "TB-500", "cjc" -> "CJC-1295 No DAC").
2. Calculate recommended vials accurately based on total dosage needed over the duration:
   - Example: 250 mcg BID for 6 weeks = 500 mcg/day * 42 days = 21,000 mcg (21 mg). Using 5mg vials, requires 5 vials.
3. Automatically determine if Bacteriostatic Water (30ml) and Insulin Syringes (31G, 1ml / 0.5ml) are required.
4. Flag any safety alerts (e.g. GH secretagogues in active neoplasia, insulin interactions with GLP-1/GIP agonists, or excess cumulative volume).
5. Provide a simple patient-facing weekly administration calendar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `Doctor's Clinical Notes:\n"""\n${clinicalNotes}\n"""` }
          ]
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

    const structuredPrescription = JSON.parse(text);
    const jsonResponse = NextResponse.json({ success: true, data: structuredPrescription });
    return applyRateLimitHeaders(jsonResponse, rateInfo);
  } catch (error) {
    logger.error('[AI Clinical Scribe] Unhandled error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process clinical notes.' },
      { status: 500 }
    );
  }
}
