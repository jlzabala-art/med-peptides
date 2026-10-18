import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebaseAdmin';
import { getDoctorPortalData, invalidateDoctorCache } from '@/lib/doctorCache';
import {
  resolveDoctorSpecialtyIntelligence,
  SPECIALTY_BLUEPRINTS_CATALOG,
  SPECIALTY_VERTICALS
} from '@/services/specialtyBlueprintsEngine';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = decodeURIComponent(resolvedParams?.slug || '');
    const body = await request.json().catch(() => ({}));

    const portalData = await getDoctorPortalData(slug, { forceRefresh: false }).catch(() => null);
    const doctor = {
      ...(portalData?.doctor || {}),
      ...(body?.doctor || {})
    };
    const prescriptions = portalData?.prescriptions || [];

    const baselineIntel = resolveDoctorSpecialtyIntelligence(doctor, prescriptions);
    let enrichedProfile = baselineIntel.webPracticeProfile;
    let specialtyCategory = baselineIntel.specialtyCategory;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && doctor?.name) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a medical practice intelligence analyst for Atlas Health Services.
Research and synthesize the clinical specialty, key procedures, and practice focus for this physician:
- Name: ${doctor.name}
- Reported Specialty: ${doctor.specialty || 'Medical Specialist'}
- Clinic / Hospital: ${doctor.clinic || 'Private Practice'}
- City / Country: ${doctor.city || ''} ${doctor.country || ''}
- Website: ${doctor.website || ''}

Classify the physician into one of these exact specialtyCategory keys:
"trichology" | "dermatology" | "plastic_surgery" | "regenerative_orthopedics" | "longevity_bhrt"

Return ONLY valid JSON with this exact structure (in English):
{
  "specialtyCategory": "trichology | dermatology | plastic_surgery | regenerative_orthopedics | longevity_bhrt",
  "clinicalFocusSummary": "2-sentence professional summary of the physician's clinical practice, surgical/medical focus, and clinic reputation.",
  "detectedProcedures": [
    "Procedure 1 performed by this specialist",
    "Procedure 2 performed by this specialist",
    "Procedure 3 performed by this specialist",
    "Procedure 4 performed by this specialist"
  ],
  "signatureApproach": "1-sentence description of how custom compounding, bioactive peptides, and molecular diagnostics complement their clinical procedures.",
  "verifiedSources": ["Clinic Profile", "Medical Specialist Registry"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });

        const rawText = response?.text ? response.text.trim() : '';
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.clinicalFocusSummary && Array.isArray(parsed.detectedProcedures)) {
            const validCat = SPECIALTY_BLUEPRINTS_CATALOG[parsed.specialtyCategory]
              ? parsed.specialtyCategory
              : baselineIntel.specialtyCategory;
            const verticalMeta =
              SPECIALTY_VERTICALS.find((v) => v.key === validCat) || baselineIntel.verticalMeta;

            specialtyCategory = validCat;
            enrichedProfile = {
              specialtyCategory: validCat,
              specialtyLabel: verticalMeta.label,
              lastResearchedAt: new Date().toISOString().slice(0, 10),
              verifiedSources:
                Array.isArray(parsed.verifiedSources) && parsed.verifiedSources.length > 0
                  ? parsed.verifiedSources
                  : baselineIntel.webPracticeProfile.verifiedSources,
              clinicalFocusSummary: parsed.clinicalFocusSummary,
              detectedProcedures: parsed.detectedProcedures.slice(0, 5),
              signatureApproach:
                parsed.signatureApproach || baselineIntel.webPracticeProfile.signatureApproach
            };
          }
        }
      } catch (aiErr) {
        console.warn('[DoctorEnrichProfile] AI synthesis fallback to deterministic profile:', aiErr?.message);
      }
    }

    // Persist to Firestore if doctor record exists in users or doctors collection
    if (adminDb && doctor?.id) {
      try {
        const userRef = adminDb.collection('users').doc(String(doctor.id));
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          await userRef.set(
            {
              specialtyCategory,
              webPracticeProfile: enrichedProfile,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
        invalidateDoctorCache(slug);
      } catch (dbErr) {
        console.warn('[DoctorEnrichProfile] Non-blocking Firestore persistence notice:', dbErr?.message);
      }
    }

    const primaryBlueprints =
      SPECIALTY_BLUEPRINTS_CATALOG[specialtyCategory] || SPECIALTY_BLUEPRINTS_CATALOG.trichology;

    return NextResponse.json({
      success: true,
      specialtyCategory,
      webPracticeProfile: enrichedProfile,
      specialtyBlueprints: primaryBlueprints
    });
  } catch (err) {
    console.error('[DoctorEnrichProfile] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to enrich doctor profile' },
      { status: 500 }
    );
  }
}
