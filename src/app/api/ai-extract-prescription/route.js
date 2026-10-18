import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse, applyRateLimitHeaders } from '@/utils/rateLimiter';
import { generateWithResilientGemini, AI_TIER } from '@/lib/ai/geminiModelRouter';

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
          enum: ['StandardPrescription', 'FagronGenomics', 'CompoundingFormula', 'ClinicalReport', 'LabResult', 'Unknown'],
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
          description: 'Clinical archetype: trichotest (Fagron TrichoTest hair DNA test), nutrigen (Fagron Genomics NutriGen DNA test ONLY - NEVER use for general compounded oral capsules or supplements), hormone (BHRT/transdermal steroids), peptide (injectables), compounding (galenic oral capsules, pomades, ointments, creams, or custom clinic formulations), standard (general clinical medicine)'
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
              volume: { type: Type.STRING, description: 'Total volume or container size calculated mathematically (e.g. 60 capsules, 120 capsules, 90 ml, 30g)' },
              duration: { type: Type.STRING, description: 'Duration of treatment (e.g. 2 months, 60 days, 3 months, 90 days)' },
              treatmentDays: { type: Type.INTEGER, description: 'Total duration in numeric days (e.g. 60, 90, 30)' },
              dailyDoses: { type: Type.INTEGER, description: 'Number of doses or administrations per day (e.g. 1 for morning only, 2 for lunch + dinner, 3 for tid)' },
              formulationRequirements: { type: Type.STRING, description: 'Special formulation requirements or excipient constraints verbatim from the prescription (e.g. Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives)' },
              vehicleBase: {
                type: Type.OBJECT,
                description: 'Compounding vehicle, solvent, or pharmaceutical base',
                properties: {
                  name: { type: Type.STRING, description: 'Vehicle name (e.g. Vegetable capsules. Gluten-free, lactose-free, colorant-free; Pentravan; TrichoSol)' },
                  type: { type: Type.STRING, description: 'Class: oral_capsule, liposomal_cream, hydrophilic_solution, lipidic_oil, ointment_base' },
                  specifications: { type: Type.STRING, description: 'Pharmaceutical specs and excipient constraints' }
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
        labResult: {
          type: Type.OBJECT,
          description: 'Extraction fields when documentType is LabResult (e.g. Bloodo, LifeLab1, DBS capillary blood tests)',
          properties: {
            testName: { type: Type.STRING, description: 'Test name (e.g. Nicotinamide adenine dinucleotide (NAD))' },
            biomarker: { type: Type.STRING, description: 'Biomarker name (e.g. NAD+ (Total Intracellular))' },
            value: { type: Type.NUMBER, description: 'Numeric result value (e.g. 11.6, 16.7, 24.5)' },
            unit: { type: Type.STRING, description: 'Measurement units (e.g. µmol/L)' },
            zone: { type: Type.STRING, description: 'Zone code: green, light_green, yellow, red, dark_red' },
            zoneLabel: { type: Type.STRING, description: 'Zone label (e.g. Optimal, Near-Optimal, Insufficient, Deficient)' },
            protocolNumber: { type: Type.STRING, description: 'Protocol / report order number (e.g. 260513001, 260325002)' },
            sampleType: { type: Type.STRING, description: 'Sample type (e.g. dried blood spot (DBS))' },
            collectionDate: { type: Type.STRING, description: 'Sample collected date (YYYY-MM-DD)' },
            receiptDate: { type: Type.STRING, description: 'Sample received date (YYYY-MM-DD)' },
            analysisDate: { type: Type.STRING, description: 'Analysis date (YYYY-MM-DD)' },
            protocolDate: { type: Type.STRING, description: 'Protocol generation date (YYYY-MM-DD)' },
            patientCode: { type: Type.STRING, description: 'Patient code from protocol (e.g. DBUQEQ842449)' },
            patientAge: { type: Type.INTEGER, description: 'Patient age' },
            patientGender: { type: Type.STRING, description: 'Patient gender: Male or Female' },
            laboratory: { type: Type.STRING, description: 'Laboratory name (e.g. LifeLab1 / Bloodo)' },
            interpretation: { type: Type.STRING, description: 'Clinical interpretation text from report' }
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
     * In Compounded Oral Capsules: APIs such as Ubiquinol, Saw Palmetto, Red Yeast Rice, Berberine, Citrus Bergamot, Chromium, CoQ10. The vehicle is Vegetarian / Gelatin Capsules. NOTE: Custom oral capsules from clinic doctors are 'compounding' (CompoundingFormula), NOT 'nutrigen'.
     * In Perianal/Topical Pomades: APIs are Diltiazem, Lidocaine. The vehicle is Hypoallergenic Non-Irritating Pomade/Ointment Base (Fragrance & Alcohol Free).

4. STEP-BY-STEP POSOLOGY PROTOCOL:
   - For each formulation block, construct structured 'posologySteps':
     * Step 1 (Preparation/Cleansing): Clean, dry target skin/scalp, or take with a full glass of water.
     * Step 2 (Dosing/Application): Exact measured dose (e.g. 1 pump = 1 mL, 1 capsule, 1 mL dropper) and exact anatomical site (e.g. inner forearm, lower abdomen, inner thigh, upper arm).
     * Step 3 (Absorption/Diffusion): Massage gently until absorbed, leave on overnight, or wait 10 minutes.
     * Step 4 (Maintenance & Hygiene): Wash hands thoroughly with soap and water immediately; storage instructions.

5. CLINICIAN & CLINIC ATTRIBUTION (CRITICAL FOR ALL DOCUMENTS):
   - ALWAYS search for and extract the prescribing physician name and clinic/center name across all pages, headers, footers, stamps, and signatures.
   - On Fagron Genomics reports (TrichoTest, NutriGen, TeloTest, AcneTest), the clinician and clinic are often labeled as:
     'Healthcare Professional:', 'Professional:', 'Prescriber:', 'Solicitado por:', 'Doctor:', 'Dr.', 'Physician:', 'Customer:', 'Client:', 'Center:', 'Centro:', 'Clinic:', 'Practice:'.
   - On laboratory reports (Bloodo, LifeLab1, etc.), look for 'Requesting Doctor', 'Ordering Physician', 'Referring Clinic', 'Center', 'Healthcare Professional'.
   - NEVER leave 'doctor.name' or 'doctor.clinicName' empty if a doctor or clinic is mentioned anywhere in the document.
   - Extract the full name (e.g. "Dr. Marina Cordeiro Fernandes", "Dr. Çağatay Sezgin, MD, FISHRS") into 'doctor.name' and clinic (e.g. "Nova Plastic Surgery Clinic", "Shamma Clinic by Novomed LLC") into 'doctor.clinicName'.

6. FAGRON TELOTEST & TELOMERE REPORTS:
   - If the document contains "THE TELOTEST FORMULA™", "TeloTest", "Telomeres", or BOX ID with "...AATEL" (e.g. "BOX03049AATEL"):
     * Set 'documentType' to "FagronGenomics" and 'clinicalCategory' to "compounding" or "standard".
     * Set 'fagronDetails.testName' to "TeloTest" and extract the Box ID.
     * Extract Part 1 (Transdermal Pentravan formula, e.g. Metformin, Testosterone, Astaxanthin) and Part 2 (Oral Capsules formula, e.g. Turmeric dry extract, Coenzyme Q10, N-Acetyl-L-Cysteine) as distinct sequential formulationBlocks!

7. FAGRON GENOMICS VS GENERAL CLINICAL COMPOUNDING (CRITICAL RULE):
   - ONLY classify as 'documentType': "FagronGenomics" or 'clinicalCategory': "nutrigen" / "trichotest" if the uploaded document is an official Fagron Genomics report/test containing explicit titles ("NutriGen", "TrichoTest", "TeloTest") or an official Fagron Box ID / Barcode (...AANUT..., ...AATRI..., ...AATEL...).
   - Standard medical clinic prescriptions, doctor Rx pads, and compounded oral capsules (e.g. Ubiquinol, Saw Palmetto, Berberine, Red Yeast Rice from Nova Plastic Surgery Clinic, Dr. Marina Cordeiro Fernandes, Dra. Haydee Camacho, etc.) MUST be classified as 'documentType': "CompoundingFormula" (or "StandardPrescription") and 'clinicalCategory': "compounding" (or "standard"). NEVER associate standard clinical compounding prescriptions with NutriGen!

8. ZERO CROSS-CONTAMINATION IN MULTI-PHASE PRESCRIPTIONS (GOLDEN RULE):
   - In multi-part or multi-phase prescriptions (e.g. "1. Morning Formula | With Breakfast" and "2. Metabolic & Lipid Formula | With Lunch and Dinner"):
     * EACH formulation block MUST have its OWN completely isolated 'posology', 'duration', and 'timeOfDay'.
     * NEVER bleed or copy instructions from Phase 1 into Phase 2! If Phase 2 states "Take 1 dose with lunch and 1 dose with dinner", its posology MUST say exactly that. NEVER output "morning with breakfast" for Phase 2.

9. EXACT POSOLOGY ARITHMETIC & UNIT / CAPSULE COUNT CALCULATION (GOLDEN RULE):
   - NEVER assume a default of "90 capsules (3 months)" or "1 capsule daily" when not explicitly stated!
   - You MUST calculate total pharmaceutical units mathematically:
     * Formula: Total Units = (Daily Doses) × (Duration in Days).
     * Example A: "Take 1 dose once daily with breakfast", Duration: 2 months (60 days) -> Exactly 60 capsules (2 Months).
     * Example B: "Take 1 dose with lunch and 1 dose with dinner" (2 doses/day), Duration: 2 months (60 days) -> Exactly 120 capsules (2 Months).
     * Example C: "1 capsule 3 times daily", Duration: 90 days -> 270 capsules (3 Months).
     * In 'volume' and 'packaging.volume', state the exact count and duration: e.g. "60 Capsules (2 Months)" or "120 Capsules (2 Months)".

10. EXPLICIT FORMULATION REQUIREMENTS & EXCIPIENTS (VEHICLE BINDING):
    - When the prescription specifies "Formulation requirements:" or excipient constraints (such as "Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives"):
      * You MUST extract this exact requirement verbatim into 'vehicleBase.specifications' and 'vehicleBase.name'.
      * Do NOT replace it with generic terms like "Micronized Compounded Hard Capsules Base" or "Gelatin Capsules".

11. TEMPORAL DATE VALIDITY (EU GMP COMPLIANCE):
    - Extract 'prescriptionDate' accurately from the doctor's signature or document date.
    - In an EU GMP licensed compounding dispensary, manufacturing/compounding cannot precede the prescription date. All compounding dates must be on or after 'prescriptionDate'.

12. LABORATORY TEST PROTOCOLS & BIOMARKER BLOOD REPORTS (BLOODO, LIFELAB1, ETC.):
    - If the document is a laboratory test protocol (such as Bloodo / LifeLab1 DBS capillary blood test for NAD, HbA1c, Testosterone, Omega Ratio, Vitamin D, Cortisol):
      * Set 'documentType' to "LabResult".
      * Set 'clinicalCategory' to "standard" (or "peptide").
      * Extract all laboratory fields into 'labResult': testName (e.g. 'Nicotinamide adenine dinucleotide (NAD)'), biomarker ('NAD+ (Total Intracellular)'), numeric value (e.g. 11.6, 16.7, 24.5), unit ('µmol/L'), zone ('green', 'light_green', 'yellow', 'red', 'dark_red'), zoneLabel ('Optimal', 'Near-Optimal', 'Insufficient', 'Deficient'), protocolNumber (e.g. '260513001'), sampleType ('dried blood spot (DBS)'), collectionDate, receiptDate, analysisDate, protocolDate, and laboratory ('LifeLab1 / Bloodo').
      * In 'formulationBlocks', return an empty array [].

13. REAL UNENCODED PATIENT NAME EXTRACTION (MANDATORY):
    - ALWAYS extract the patient's full, real human name (e.g. "Sandhya Patel", "Basma Haitham", "Eldose Babu") into 'patient.name'.
    - NEVER put an anonymized barcode or sample code (like "DBUQEWDT2449" or "Patient #DBUQEWDT2449") into 'patient.name' if a real human name is visible anywhere on the document.
    - Store barcodes, sample codes, accession IDs, and protocol numbers into 'labResult.patientCode', 'fileNumber', or 'fagronDetails.boxId'.`;

    // Resilient multi-model extraction via Atlas AI Model Router
    const { text } = await generateWithResilientGemini({
      tier: AI_TIER.REASONING,
      aiClient: ai,
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
    if (!text) {
      throw new Error('All Atlas AI models were temporarily unable to process this document.');
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
