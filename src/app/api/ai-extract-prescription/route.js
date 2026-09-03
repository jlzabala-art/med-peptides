import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export async function POST(request) {
  try {
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    // JSON Schema for structured multimodal Gemini response
    const schema = {
      type: Type.OBJECT,
      properties: {
        documentType: {
          type: Type.STRING,
          enum: ['StandardPrescription', 'FagronGenomics', 'CompoundingFormula', 'ClinicalReport', 'Unknown'],
          description: 'Classification of the uploaded document'
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
              treatmentProgram: { type: Type.STRING, description: 'Program or protocol name (e.g. TrichoTest, Longevity Protocol, Weight Management)' },
              treatmentType: { type: Type.STRING, description: 'Specific formulation name or category (e.g. TrichoSol Solution, TrichoOil, Oral Capsules, Subcutaneous Peptides)' },
              dispensingForm: { type: Type.STRING, description: 'Pharmaceutical form (e.g. Topical Solution, Foam, Capsule, Subcutaneous Injection, Oral Suspension)' },
              volume: { type: Type.STRING, description: 'Total volume or container size (e.g. 60ml, 100ml, 30 capsules, 10 vials)' },
              duration: { type: Type.STRING, description: 'Duration of treatment (e.g. 30 days, 90 days, 3 months)' },
              treatmentDays: { type: Type.INTEGER, description: 'Total duration expressed in numeric days (e.g. 30, 90, 180)' },
              posology: { type: Type.STRING, description: 'Detailed posology and instructions for use for this specific formulation block' },
              items: {
                type: Type.ARRAY,
                description: 'Ingredients, peptides, or active pharmaceutical ingredients (APIs) in this formulation block',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Name of the drug, peptide, API, or excipient (e.g. Latanoprost, Minoxidil, TrichoSol, BPC-157, Semaglutide)' },
                    activeIngredient: { type: Type.STRING, description: 'Active pharmaceutical ingredient molecule name' },
                    isVehicleOrBase: { type: Type.BOOLEAN, description: 'True if it is a vehicle, base, or solvent (e.g. TrichoSol, TrichoOil, Pentravan, Saline, Water)' },
                    dose: { type: Type.STRING, description: 'Concentration or dose per unit (e.g. 0.005%, 5%, 5mg, 250mcg, 100ml)' },
                    strength: { type: Type.STRING, description: 'Concentration/strength string' },
                    dosage: { type: Type.STRING, description: 'Dose per administration (e.g. 1 ml once daily, 250 mcg)' },
                    route: { type: Type.STRING, description: 'Route of administration (e.g. Topical, Subcutaneous, Oral, Intramuscular, IV, Nasal)' },
                    frequency: { type: Type.STRING, description: 'Frequency of use (e.g. Once daily at night, Twice weekly, Every 8 hours)' },
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
      required: ['documentType', 'confidenceScore', 'formulationBlocks', 'completeness', 'missing']
    };

    const systemPrompt = `You are Atlas Clinical AI, an elite medical and compounding pharmacy document analyzer.
Your task is to thoroughly analyze the provided medical prescription document (PDF or Image) and extract all clinical, administrative, and pharmacological data into a strictly structured JSON format.

CRITICAL PARSING RULES:
1. DOCUMENT CLASSIFICATION:
   - Identify whether this is a Standard Medical Prescription, a Fagron Genomics Report (TrichoTest, NutriGen, TeloTest, AcneTest), a Compounding Magistral Prescription, or a Clinical Note.

2. FOR FAGRON GENOMICS REPORTS (TrichoTest, NutriGen, etc.):
   - Set documentType to "FagronGenomics".
   - Extract the Fagron "BOX ID" or sample reference number (e.g. "BOX-123456").
   - Extract any genetic biomarkers, polymorphisms, or genes tested (e.g. SULT1A1, AR, CYP19A1, SRD5A2, CRABP2, MTHFR).
   - CRITICAL MULTI-FORMULATION HANDLING: If the Fagron report recommends multiple distinct formulations (for example: Formulation 1: TrichoSol solution with Minoxidil + Latanoprost, and Formulation 2: TrichoOil, and Formulation 3: Oral Capsules), YOU MUST CREATE SEPARATE OBJECTS IN 'formulationBlocks' for each formulation!
   - Clearly separate active APIs (e.g., Minoxidil 5%, Latanoprost 0.005%, Spironolactone 1%) from vehicles/bases (e.g., TrichoSol, TrichoOil, Pentravan) with isVehicleOrBase.
   - Extract the formulation volume (e.g., 60 ml, 100 ml) and specific posology for each formulation block.

3. FOR STANDARD MEDICAL / CLINICAL PRESCRIPTIONS:
   - Extract the prescribing Doctor's Name, Medical License / Registration Number (DHA license, DEA, Colegiado #), Clinic Name, and Clinic Address.
   - Extract the Patient's Full Name, DOB, Gender, ID/Passport number, Phone, and Email.
   - Extract each prescribed medication or peptide in 'formulationBlocks[0].items' with its exact name, active ingredient, strength/concentration, route (Subcutaneous, Oral, Topical, IM, IV), frequency, duration, total quantity, and administration instructions.

4. SEPARATION OF CLINICAL FIELDS:
   - Strictly separate:
     * 'dose' / 'strength' (e.g., "5 mg", "0.005%", "10 mg/mL")
     * 'route' (e.g., "Subcutaneous", "Topical", "Oral")
     * 'frequency' (e.g., "Once daily at night", "Twice a week")
     * 'posology' / 'instructions' (the complete clinical instruction sentence)
   - Do NOT cram the entire instruction paragraph into the dose field.

5. ACCURACY & COMPLETENESS:
   - Calculate an overall legibility/completeness score (0-100).
   - List any critical missing fields in 'missing' (e.g., "Doctor License", "Patient DOB", "Quantity").`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned an empty response.');
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

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('[ai-extract-prescription] Extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract prescription with AI' },
      { status: 500 }
    );
  }
}
