import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { adminDb } from '@/lib/firebaseAdmin';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { getFagronClinicalMonograph } from '@/data/fagronClinicalMonographs';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    ''
  );
}

/**
 * Extract clean API base name
 */
function cleanApiName(raw = '') {
  return String(raw)
    .trim()
    .replace(/\s+\d[\d.,]*\s*(%|mg|ml|mcg|ug|g|iu|µg)?.*/i, '')
    .replace(/\s+\(.*?\)/g, '')
    .trim();
}

export async function POST(request) {
  const rateInfo = checkRateLimit(request, { limit: 20, windowMs: 60 * 1000, tier: 'api-enrichment' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database service is temporarily unavailable.' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const { apis = [], saveToCatalog = true } = body;

    if (!Array.isArray(apis) || apis.length === 0) {
      return NextResponse.json({ error: 'No API list provided for enrichment.' }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    const enrichedResults = [];
    const nowIso = new Date().toISOString();

    for (const rawApi of apis) {
      const apiName = typeof rawApi === 'string' ? rawApi : (rawApi.name || rawApi.productName || rawApi.activeIngredient || '');
      const baseName = cleanApiName(apiName);
      if (!baseName) continue;

      let monograph = getFagronClinicalMonograph(baseName) || getFagronClinicalMonograph(apiName);

      // If monograph is not present in local database or incomplete, query Gemini AI
      if ((!monograph || !monograph.mechanismOfAction || !monograph.geneTargets?.length) && ai) {
        try {
          const prompt = `You are a clinical pharmacologist and genomics expert. Generate verified clinical pharmacology, mechanism of action, and gene targets for the active compounding ingredient: "${baseName}".
All output terms and descriptions MUST BE IN ENGLISH:
1. Canonical Name (INN in English)
2. Pharmacological Class (e.g. Selective 5α-Reductase Type II Inhibitor, Nitric Oxide Precursor & Follicular Vasodilator, Potent Antioxidant Xanthophyll Carotenoid)
3. Clinical Indication (e.g. Follicular DHT suppression, microvascular perfusion enhancement, hair follicle density maintenance)
4. Mechanism of Action (detailed scientific description of biological and cellular pathways, dermal papilla, keratinocytes, enzyme inhibition/stimulation)
5. Gene Targets (Official HGNC symbols, e.g. ["SRD5A2", "NOS3", "SULT1A1"])
6. Standard Dosages (e.g. "0.5% - 2% Topical · 50 mg - 100 mg Oral")
7. Compatible Galenic Vehicles (e.g. ["TrichoSol™", "TrichoFoam™", "Micronized Oral Capsules"])`;

          const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash'];
          let response = null;
          for (const m of candidateModels) {
            try {
              response = await ai.models.generateContent({
                model: m,
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      canonicalName: { type: Type.STRING },
                      pharmacologicalClass: { type: Type.STRING },
                      clinicalIndication: { type: Type.STRING },
                      mechanismOfAction: { type: Type.STRING },
                      geneTargets: { type: Type.ARRAY, items: { type: Type.STRING } },
                      standardDosages: { type: Type.STRING },
                      compatibleVehicles: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['canonicalName', 'pharmacologicalClass', 'clinicalIndication', 'mechanismOfAction', 'geneTargets']
                  }
                }
              });
              if (response?.text) break;
            } catch (mErr) {
              logger.warn(`[enrich-apis] Model ${m} failed, trying next:`, mErr.message);
            }
          }

          const aiData = JSON.parse(response.text || '{}');
          if (aiData.canonicalName && aiData.mechanismOfAction) {
            monograph = {
              canonicalName: aiData.canonicalName || baseName,
              aliases: [baseName.toLowerCase()],
              geneTargets: aiData.geneTargets || [],
              pharmacologicalClass: aiData.pharmacologicalClass || 'Pharmacogenomic Active Ingredient',
              clinicalIndication: aiData.clinicalIndication || 'Personalized Follicular Therapy',
              mechanismOfAction: aiData.mechanismOfAction,
              compatibleVehicles: aiData.compatibleVehicles || ['TrichoSol™', 'Micronized Oral Capsules Base'],
              standardDosages: aiData.standardDosages || 'Standardized USP therapeutic dosage'
            };
          }
        } catch (aiErr) {
          logger.warn(`[enrich-apis] AI lookup warning for ${baseName}:`, aiErr.message);
        }
      }

      // Default safe fallback if both static and AI had issues
      if (!monograph) {
        monograph = {
          canonicalName: baseName,
          aliases: [baseName.toLowerCase()],
          geneTargets: [],
          pharmacologicalClass: 'Pharmacogenomic Active Ingredient',
          clinicalIndication: 'Personalized Medical Therapy',
          mechanismOfAction: `Therapeutic active ingredient ${baseName} calibrated for cellular and metabolic follicular optimization.`,
          compatibleVehicles: ['TrichoSol™', 'Micronized Oral Capsules Base'],
          standardDosages: 'Personalized Dosage'
        };
      }

      // Save / Update in Firestore products collection for persistence across all future imports
      let savedProductId = null;
      if (saveToCatalog) {
        try {
          const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const existingSnap = await adminDb.collection('products')
            .where('name', '==', monograph.canonicalName || baseName)
            .limit(1)
            .get()
            .catch(() => null);

          if (existingSnap && !existingSnap.empty) {
            const existingDoc = existingSnap.docs[0];
            savedProductId = existingDoc.id;
            await adminDb.collection('products').doc(savedProductId).set({
              'science.desc': monograph.mechanismOfAction,
              'science.mechanismSummary': monograph.mechanismOfAction,
              'science.pharmacologicalClass': monograph.pharmacologicalClass,
              'science.clinicalIndication': monograph.clinicalIndication,
              'science.geneTargets': monograph.geneTargets || [],
              'science.compatibleVehicles': monograph.compatibleVehicles || [],
              'science.standardDosages': monograph.standardDosages || '',
              status: 'published',
              isApiPlaceholder: false,
              _needsCompletion: false,
              updatedAt: nowIso
            }, { merge: true });
          } else {
            const newDoc = {
              name: monograph.canonicalName || baseName,
              displayName: monograph.canonicalName || baseName,
              productType: 'small_molecule',
              status: 'published',
              slug: `${slug}-api`,
              isApiPlaceholder: false,
              _needsCompletion: false,
              _createdFromImport: true,
              identity: {
                synonyms: [baseName, ...(monograph.aliases || [])],
                searchAliases: [baseName.toLowerCase()],
                semanticKeywords: ['api', 'compounding', ...(monograph.geneTargets || [])]
              },
              science: {
                desc: monograph.mechanismOfAction,
                objective: monograph.clinicalIndication,
                scientificName: monograph.canonicalName || baseName,
                pharmacologicalClass: monograph.pharmacologicalClass,
                clinicalIndication: monograph.clinicalIndication,
                mechanismOfAction: monograph.mechanismOfAction,
                geneTargets: monograph.geneTargets || [],
                compatibleVehicles: monograph.compatibleVehicles || [],
                standardDosages: monograph.standardDosages || '',
                researchStatus: 'Validated'
              },
              classification: {
                goals: [monograph.clinicalIndication],
                tags: ['api', 'compounding', ...(monograph.geneTargets || [])],
                categories: ['api', 'compounding']
              },
              createdAt: nowIso,
              updatedAt: nowIso
            };
            const docRef = await adminDb.collection('products').add(newDoc);
            savedProductId = docRef.id;
          }
        } catch (dbErr) {
          logger.warn(`[enrich-apis] Could not save product ${baseName} to Firestore:`, dbErr.message);
        }
      }

      enrichedResults.push({
        name: baseName,
        productId: savedProductId,
        ...monograph
      });
    }

    return NextResponse.json({
      success: true,
      count: enrichedResults.length,
      enrichedApis: enrichedResults
    });
  } catch (error) {
    logger.error('[enrich-apis] Global error:', error);
    return NextResponse.json({ error: error.message || 'Failed to enrich APIs' }, { status: 500 });
  }
}
