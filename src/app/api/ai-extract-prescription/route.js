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
        prescriptionNumber: {
          type: Type.STRING,
          description: 'Official prescription number, file reference, or code if present in the document (e.g. 51861, FILE #51861, RX-50957, Order #...)'
        },
        fileNumber: {
          type: Type.STRING,
          description: 'Patient file number or registry code (e.g. 51861)'
        },
        clinicReference: {
          type: Type.STRING,
          description: 'Clinic reference, accession number, or external identifier'
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
            licenseNumber: { type: Type.STRING, description: 'Medical license / DHA / DEA / Colegiado registration number (e.g. DHA-P-03...)' },
            clinicName: { type: Type.STRING, description: 'Clinic, practice, or hospital name (e.g. Nova Plastic Surgery Clinic)' },
            clinicAddress: { type: Type.STRING, description: 'Clinic address or city (e.g. Dubai, UAE)' },
            specialty: { type: Type.STRING, description: 'Medical specialty (e.g. Dermatology, Endocrinology, Regenerative Medicine)' },
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
          description: 'List of formulations or prescription phases in the document. If the document has multiple phases (Phase 1: Morning, Phase 2: Evening, etc.), EACH PHASE MUST BE A SEPARATE OBJECT IN THIS ARRAY.',
          items: {
            type: Type.OBJECT,
            properties: {
              phaseNumber: {
                type: Type.INTEGER,
                description: 'Sequential phase number (1, 2, 3...) if multi-phase regimen, or 1 if single formulation'
              },
              phaseName: {
                type: Type.STRING,
                description: 'Full descriptive title of this phase (e.g. Phase 1: Morning Testosterone Transdermal Cream, Phase 2: Evening Estradiol Transdermal Cream, Phase 1: Morning Methylation Formula)'
              },
              timeOfDay: {
                type: Type.STRING,
                enum: ['morning', 'midday', 'evening', 'bedtime', 'twice_daily', 'as_needed', 'unspecified'],
                description: 'Clinical timing: morning, evening, bedtime, etc.'
              },
              treatmentProgram: { type: Type.STRING, description: 'Program or protocol name (e.g. TrichoTest, BHRT Protocol, NutriGen Metabolic Support, Galenic Compounding)' },
              treatmentType: { type: Type.STRING, description: 'Specific formulation name or category (e.g. Transdermal Cream, Oral Capsules, Topical Solution)' },
              blockType: {
                type: Type.STRING,
                enum: ['pomade', 'hormone', 'trichosol', 'trichooil', 'oral', 'injectable', 'cream', 'other'],
                description: 'Galenic archetype of this formulation block'
              },
              dispensingForm: { type: Type.STRING, description: 'Pharmaceutical form (e.g. Transdermal Liposomal Cream, Oral Capsules, Topical Pomade / Ointment, Topical Solution)' },
              volume: { type: Type.STRING, description: 'Total volume or container size (e.g. 90ml, 90 capsules, 30g, 60ml, 100ml)' },
              duration: { type: Type.STRING, description: 'Duration of treatment (e.g. 90 days, 3 months, 30 days)' },
              treatmentDays: { type: Type.INTEGER, description: 'Total duration in numeric days (e.g. 90, 60, 30)' },
              vehicleBase: {
                type: Type.OBJECT,
                description: 'Compounding vehicle, solvent, or pharmaceutical base',
                properties: {
                  name: { type: Type.STRING, description: 'Vehicle name (e.g. Pentravan Liposomal Transdermal Cream Base, Vegetarian HPMC Enteric Capsules, TrichoSol)' },
                  type: { type: Type.STRING, description: 'Class: liposomal_cream, oral_capsule, hydrophilic_solution, lipidic_oil, ointment_base' },
                  specifications: { type: Type.STRING, description: 'Pharmaceutical specs of the vehicle' }
                }
              },
              packaging: {
                type: Type.OBJECT,
                description: 'Packaging container specs',
                properties: {
                  containerType: { type: Type.STRING, description: 'Container type (e.g. Topi-Pump Metered Airless Dispenser, Safety-Sealed Amber Bottle, Precision Dropper Bottle)' },
                  volume: { type: Type.STRING, description: 'Volume/Quantity (e.g. 90 mL, 90 Capsules, 30 g)' },
                  supplyDays: { type: Type.INTEGER, description: 'Days of supply (e.g. 90)' }
                }
              },
              posology: { type: Type.STRING, description: 'Detailed posology and instructions for use for this specific phase' },
              posologySteps: {
                type: Type.ARRAY,
                description: 'Sequential clinical steps for patient administration',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    timing: { type: Type.STRING },
                    instruction: { type: Type.STRING }
                  }
                }
              },
              safetyWarnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Clinical safety warnings, precautions, and hygiene instructions'
              },
              items: {
                type: Type.ARRAY,
                description: 'Active Pharmaceutical Ingredients (APIs) in this formulation block',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Name of the drug, peptide, API, or excipient' },
                    activeIngredient: { type: Type.STRING, description: 'Active pharmaceutical ingredient molecule name' },
                    itemType: {
                      type: Type.STRING,
                      enum: ['active_ingredient', 'vehicle_base', 'excipient'],
                      description: 'Classification: active_ingredient (API) or vehicle_base'
                    },
                    isVehicleOrBase: { type: Type.BOOLEAN, description: 'True if it is a vehicle, base, or solvent (e.g. Pentravan, TrichoSol, HPMC Capsules)' },
                    dose: { type: Type.STRING, description: 'Concentration or dose per unit (e.g. 2 mg / mL, 1 mg / mL, 5%, 0.005%, 250 mcg)' },
                    strength: { type: Type.STRING, description: 'Concentration/strength string' },
                    dosage: { type: Type.STRING, description: 'Dose per administration (e.g. 1 pump daily, 1 capsule daily)' },
                    route: { type: Type.STRING, description: 'Route of administration (e.g. Transdermal, Oral, Topical)' },
                    frequency: { type: Type.STRING, description: 'Frequency of use (e.g. Once daily in morning, Once daily in evening)' },
                    duration: { type: Type.STRING, description: 'Duration of this specific item if stated' },
                    quantity: { type: Type.INTEGER, description: 'Quantity' },
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

CRITICAL CLINICAL EXTRACTION RULES LEARNED FROM REAL-WORLD CLINICAL AUDITS:

1. PRESCRIPTION & FILE NUMBERS (CRITICAL):
   - ALWAYS look for "FILE #XXXXX", "Prescription #", "Rx #", "Ref:", "Order No." in the document header, patient box, or margins (for example: "FILE #51861" or "FILE #51859").
   - Extract the numeric code (e.g. "51861") into both 'prescriptionNumber' and 'fileNumber'. Do NOT leave it empty or replace it with random numbers.

2. MULTI-PHASE CLINICAL PROTOCOLS:
   - When a prescription document contains multiple phases, formulas, or administration times (e.g. "Phase 1: Morning Testosterone...", "Phase 2: Evening Estradiol...", or "Morning Formula" + "Bedtime Formula", or "TrichoSol Solution" + "TrichoOil"):
     * YOU MUST CREATE A SEPARATE OBJECT IN 'formulationBlocks' FOR EACH PHASE!
     * Assign 'phaseNumber' (1, 2, 3...) sequentially.
     * Assign 'phaseName' matching the complete clinical phase title (e.g. "Phase 1: Morning Testosterone Transdermal Cream (BHRT)").
     * Set 'timeOfDay' accurately ("morning", "evening", "bedtime", "midday").
     * Set 'packaging' and 'volume' accurately for each phase (e.g. 90 mL Topi-Pump for Phase 1, 90 mL Topi-Pump for Phase 2, or 90 Capsules).

3. COMPOUNDING VEHICLES VS ACTIVE DRUGS (APIS):
   - Strictly separate true Active Pharmaceutical Ingredients (APIs) from compounding vehicles/bases:
     * In Transdermal BHRT creams: APIs are Testosterone, 17β-Estradiol, Progesterone. The vehicle is Pentravan® Liposomal Transdermal Cream Base (set in vehicleBase, or mark isVehicleOrBase: true).
     * In Scalp lotions: APIs are Minoxidil, Latanoprost, Finasteride. The vehicle is TrichoSol™ or TrichoOil™.
     * In Oral Nutrigenomics: APIs are Nattokinase, Serrapeptase, Alpha Lipoic Acid. The vehicle is Vegetarian HPMC Enteric Capsules.
     * In Perianal/Topical Pomades: APIs are Diltiazem, Lidocaine. The vehicle is Hypoallergenic Pomade Base.

4. STEP-BY-STEP POSOLOGY PROTOCOL:
   - For each formulation block, construct structured 'posologySteps':
     * Step 1 (Preparation/Cleansing): Clean, dry target skin/scalp, or take with a full glass of water.
     * Step 2 (Dosing/Application): Exact measured dose (e.g. 1 pump = 1 mL, 1 capsule, 1 mL dropper) and exact anatomical site (e.g. inner forearm, lower abdomen, inner thigh, upper arm).
     * Step 3 (Absorption/Diffusion): Massage gently until absorbed, leave on overnight, or wait 10 minutes.
     * Step 4 (Maintenance & Hygiene): Wash hands thoroughly with soap and water immediately; storage instructions.

5. CLINICIAN & CLINIC ATTRIBUTION:
   - Extract the prescribing physician name (e.g. "Dr. Marina Cordeiro Fernandes"), medical license (e.g. "DHA-P-03..."), clinic name (e.g. "Nova Plastic Surgery Clinic", "NOVA Clinic"), and address/city (e.g. "Dubai, UAE").`;

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
