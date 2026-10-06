import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    ''
  );
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

export async function POST(request) {
  const rateInfo = checkRateLimit(request, { limit: 15, windowMs: 60 * 1000, tier: 'extract-prescription' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File exceeds maximum allowed size of 15MB' },
        { status: 413 }
      );
    }

    const mimeType = file.type || (file.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: PDF, JPEG, PNG, WEBP.' },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // JSON Schema for structured multimodal Gemini response
    const schema = {
      type: Type.OBJECT,
      properties: {
        documentType: {
          type: Type.STRING,
          enum: ['StandardPrescription', 'FagronGenomics', 'CompoundingFormula', 'ClinicalReport', 'Unknown'],
          description: 'Classification of the uploaded document'
        },
        clinicalCategory: {
          type: Type.STRING,
          enum: ['trichotest', 'nutrigen', 'hormone', 'peptide', 'compounding', 'standard'],
          description: 'Clinical archetype: trichotest (scalp/hair), nutrigen (oral metabolic/capsules), hormone (BHRT/transdermal steroids), peptide (injectables), compounding (galenic pomades/ointments/creams), standard (general clinical medicine)'
        },
        confidenceScore: {
          type: Type.INTEGER,
          description: 'Confidence score from 0 to 100 on the extraction accuracy'
        },
        patient: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Full name of the patient' },
            dob: { type: Type.STRING, description: 'Date of birth in YYYY-MM-DD format if available' },
            gender: { type: Type.STRING, description: 'Gender: Male, Female, Other, or null' },
            idNumber: { type: Type.STRING, description: 'ID / Passport / Emirates ID number if available' },
            phone: { type: Type.STRING, description: 'Patient phone number if visible' },
            email: { type: Type.STRING, description: 'Patient email address if visible' },
            address: { type: Type.STRING, description: 'Patient address if visible' }
          }
        },
        doctor: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Full name of the prescribing physician' },
            licenseNumber: { type: Type.STRING, description: 'Medical license / DHA / DEA / Colegiado registration number' },
            clinicName: { type: Type.STRING, description: 'Clinic, practice, or hospital name' },
            clinicAddress: { type: Type.STRING, description: 'Clinic address or city' },
            specialty: { type: Type.STRING, description: 'Medical specialty (e.g. Dermatology, Endocrinology, General)' },
            phone: { type: Type.STRING, description: 'Doctor/clinic phone number' },
            email: { type: Type.STRING, description: 'Doctor/clinic email' }
          }
        },
        prescriptionDate: {
          type: Type.STRING,
          description: 'Date of the prescription in YYYY-MM-DD format'
        },
        diagnosis: {
          type: Type.STRING,
          description: 'Primary clinical diagnosis, indication, or reason for prescription'
        },
        clinicalNotes: {
          type: Type.STRING,
          description: 'Clinical summary, genetic findings, biomarkers, or precautions noted'
        },
        fagronDetails: {
          type: Type.OBJECT,
          description: 'Specific details if this is a Fagron Genomics report or compounding prescription',
          properties: {
            isFagron: { type: Type.BOOLEAN, description: 'True if Fagron Genomics or Fagron Compounding' },
            boxId: { type: Type.STRING, description: 'Fagron BOX ID, Sample reference, or Barcode' },
            testName: { type: Type.STRING, description: 'Name of genetic test (e.g. TrichoTest, NutriGen, TeloTest, AcneTest)' },
            reportDate: { type: Type.STRING, description: 'Report date in YYYY-MM-DD format' },
            geneticBiomarkers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gene: { type: Type.STRING, description: 'Gene symbol (e.g. SULT1A1, AR, CYP19A1, MTHFR)' },
                  variant: { type: Type.STRING, description: 'Variant or polymorphism description' },
                  interpretation: { type: Type.STRING, description: 'Clinical summary for this variant' }
                }
              }
            },
            summary: { type: Type.STRING, description: 'Overall summary of the genetic report' }
          }
        },
        formulationBlocks: {
          type: Type.ARRAY,
          description: 'List of formulations or prescription lines in the document. For standard Rx, this is the medication list. For Fagron, each recommended formulation (e.g. TrichoSol solution, TrichoOil, oral capsules) must be its own block.',
          items: {
            type: Type.OBJECT,
            properties: {
              treatmentProgram: { type: Type.STRING, description: 'Program or protocol name (e.g. TrichoTest, Longevity Protocol, Weight Management, BHRT, Galenic Compounding)' },
              treatmentType: { type: Type.STRING, description: 'Specific formulation name or category (e.g. TrichoSol Solution, TrichoOil, Oral Capsules, Transdermal Cream, Topical Pomade, Subcutaneous Peptides)' },
              blockType: {
                type: Type.STRING,
                enum: ['pomade', 'hormone', 'trichosol', 'trichooil', 'oral', 'injectable', 'cream', 'other'],
                description: 'Galenic archetype of this formulation block'
              },
              dispensingForm: { type: Type.STRING, description: 'Pharmaceutical form (e.g. Topical Solution, Transdermal Cream, Topical Pomade / Ointment, Oral Capsules, Subcutaneous Injection)' },
              volume: { type: Type.STRING, description: 'Total volume or container size (e.g. 30g, 60ml, 90ml, 100ml, 30 capsules, 90 capsules, 10 vials)' },
              duration: { type: Type.STRING, description: 'Duration of treatment (e.g. 30 days, 60 days, 90 days, 3 months)' },
              treatmentDays: { type: Type.INTEGER, description: 'Total duration expressed in numeric days (e.g. 30, 60, 90, 180)' },
              posology: { type: Type.STRING, description: 'Detailed posology and instructions for use for this specific formulation block' },
              items: {
                type: Type.ARRAY,
                description: 'Ingredients, peptides, or active pharmaceutical ingredients (APIs) in this formulation block',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Name of the drug, peptide, API, or excipient (e.g. Latanoprost, Minoxidil, Testosterone, Diltiazem, Nattokinase, TrichoSol, Pentravan)' },
                    activeIngredient: { type: Type.STRING, description: 'Active pharmaceutical ingredient molecule name' },
                    itemType: {
                      type: Type.STRING,
                      enum: ['active_ingredient', 'vehicle_base', 'excipient'],
                      description: 'Classification: active_ingredient (API) or vehicle_base (carrier/solvent/pomade base)'
                    },
                    isVehicleOrBase: { type: Type.BOOLEAN, description: 'True if it is a vehicle, base, or solvent (e.g. TrichoSol, TrichoOil, Pentravan, Pomade Base, Saline, Water)' },
                    dose: { type: Type.STRING, description: 'Concentration or dose per unit (e.g. 2%, 0.005%, 5%, 2 mg, 250mcg, 30g)' },
                    strength: { type: Type.STRING, description: 'Concentration/strength string' },
                    dosage: { type: Type.STRING, description: 'Dose per administration (e.g. 1 ml once daily, 1 pump daily, Apply twice daily)' },
                    route: { type: Type.STRING, description: 'Route of administration (e.g. Topical, Topical / Perianal, Transdermal, Oral, Subcutaneous)' },
                    frequency: { type: Type.STRING, description: 'Frequency of use (e.g. Once daily at night, Twice daily, Once daily in morning)' },
                    duration: { type: Type.STRING, description: 'Duration of this specific item if stated' },
                    quantity: { type: Type.INTEGER, description: 'Quantity (e.g. number of vials, boxes, or 1)' },
                    instructions: { type: Type.STRING, description: 'Specific administration instructions' }
                  },
                  required: ['name', 'dose']
                }
              }
            },
            required: ['treatmentType', 'items']
          }
        },
        missing: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of important clinical or administrative fields missing from the document'
        },
        completeness: {
          type: Type.INTEGER,
          description: 'Score from 0 to 100 indicating document legibility and completeness'
        }
      },
      required: ['documentType', 'clinicalCategory', 'confidenceScore', 'formulationBlocks', 'completeness', 'missing']
    };

    const systemPrompt = `You are Atlas Clinical AI, an elite medical and compounding pharmacy document analyzer.
Your task is to thoroughly analyze the provided medical prescription document (PDF or Image) and extract all clinical, administrative, and pharmacological data into a strictly structured JSON format.

CRITICAL CLINICAL CATEGORIZATION RULES:
1. CLINICAL CATEGORY & ARCHETYPES:
   - "trichotest": Alopecia, hair loss, TrichoSol, TrichoOil, TrichoFoam, Minoxidil, Latanoprost, Finasteride, Prostaquinon.
   - "hormone": BHRT, bioidentical hormones, Testosterone, 17β-Estradiol, Progesterone, DHEA in Pentravan or Lipoderm transdermal cream base.
   - "compounding": Galenic compounding pomades/ointments, Diltiazem, Lidocaine, Nitroglycerin, Hydrocortisone in hypoallergenic pomade base for perianal or dermatological application.
   - "nutrigen": Oral nutrigenomics, metabolic cofactors, Nattokinase, Serrapeptase, Alpha Lipoic Acid, Ubiquinol, PQQ in enteric/vegetable capsules.
   - "peptide": Subcutaneous injectable peptides (BPC-157, Semaglutide, Tirzepatide, CJC-1295, Ipamorelin, Epithalon).
   - "standard": General medical prescriptions (oral tablets, commercial pharmaceuticals).

2. FOR COMPOUNDED POMADES / OINTMENTS:
   - Set clinicalCategory to "compounding".
   - In formulationBlocks[0]: set blockType to "pomade", dispensingForm to "Topical Pomade / Ointment", route to "Topical / Perianal".
   - Mark APIs as active_ingredient and bases (Hypoallergenic Pomade Base, Ointment Base) as vehicle_base (isVehicleOrBase: true).

3. FOR BHRT / HORMONE TRANSDERMAL CREAMS:
   - Set clinicalCategory to "hormone".
   - In formulationBlocks: set blockType to "hormone", dispensingForm to "Transdermal Liposomal Cream", route to "Transdermal".
   - Mark Pentravan / Lipoderm as vehicle_base (isVehicleOrBase: true).

4. FOR FAGRON GENOMICS REPORTS (TrichoTest, NutriGen, etc.):
   - Set documentType to "FagronGenomics".
   - Extract the Fagron "BOX ID" or sample reference number.
   - Extract any genetic biomarkers, polymorphisms, or genes tested.
   - CRITICAL MULTI-FORMULATION HANDLING: If the Fagron report recommends multiple distinct formulations (for example: Formulation 1: TrichoSol solution with Minoxidil + Latanoprost, and Formulation 2: TrichoOil, and Formulation 3: Oral Capsules), YOU MUST CREATE SEPARATE OBJECTS IN 'formulationBlocks' for each formulation!
   - Clearly mark active APIs (Minoxidil, Latanoprost, Prostaquinon) as active_ingredient and vehicles (TrichoSol, TrichoOil) as vehicle_base with isVehicleOrBase: true.

5. SEPARATION OF CLINICAL FIELDS:
   - Strictly separate:
     * 'dose' / 'strength' (e.g., "2%", "0.005%", "5 mg", "2 mg")
     * 'route' (e.g., "Topical / Perianal", "Transdermal", "Topical", "Oral", "Subcutaneous")
     * 'frequency' (e.g., "Apply twice daily", "Once daily at night", "1 pump daily")
     * 'posology' / 'instructions' (the complete clinical instruction sentence)
   - Do NOT cram the entire instruction paragraph into the dose field.`;

    // Modern Gemini Engines with automated resilience & fallback cascade
    const CANDIDATE_MODELS = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest'
    ];
    let response = null;
    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType,
                    data: buffer.toString('base64'),
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.1,
          },
        });

        if (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[ai-extract-prescription] Model ${modelName} failed, falling back:`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    const text = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw lastError || new Error('All Atlas AI models were temporarily unable to process this document.');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseErr) {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Attach raw file metadata
    parsedData._fileName = file.name;
    parsedData._fileSize = file.size;
    parsedData._mimeType = mimeType;

    return applyRateLimitHeaders(NextResponse.json(parsedData), rateInfo);
  } catch (error) {
    console.error('[ai-extract-prescription] Extraction error:', error);
    const rawMsg = String(error?.message || '');
    const isCapacityIssue = /503|UNAVAILABLE|high demand|overloaded|ResourceExhausted|429|spikes in demand/i.test(rawMsg);

    const friendlyError = isCapacityIssue
      ? 'Atlas Clinical AI is experiencing temporary peak demand. Please try again in a few moments.'
      : 'Atlas Clinical AI was unable to parse the document. Please verify the document is clear and retry.';

    return NextResponse.json(
      { error: friendlyError },
      { status: isCapacityIssue ? 503 : 500 }
    );
  }
}
