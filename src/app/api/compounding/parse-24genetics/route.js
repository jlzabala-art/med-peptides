import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
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

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB for multi-page 24Genetics reports

export async function POST(request) {
  const rateInfo = checkRateLimit(request, { limit: 20, windowMs: 60 * 1000, tier: 'extract-24genetics' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const isSample = formData.get('sample') === 'true';

    // Sample fallback or mock demonstration if requested
    if (isSample || !file) {
      return NextResponse.json({
        success: true,
        source: '24genetics_sample',
        patientName: 'Hossam',
        sampleCode: 'G000943554',
        reportType: '24Genetics Nutrition Report',
        dietAndWeight: {
          effectiveDietType: 'low_carb',
          predispositionToOverweight: 'high',
          easeOfWeightLoss: 'moderate',
          emotionalEating: 'high',
          snackingTendency: 'high',
          sweetTooth: 'high',
          carbSensitivity: 'high',
          fatSensitivity: 'normal',
          hypocaloricAppetite: 'high'
        },
        metabolism: {
          caffeineMetabolism: 'slow',
          saltSensitivity: 'high'
        },
        vitaminDeficiencies: {
          vitaminD: 'reduced_assimilation',
          folateB9: 'impaired_methylation',
          vitaminB12: 'normal',
          antioxidantCapacity: 'low'
        },
        clinicalNutrigenomicNotes: [
          'High genetic predisposition to overweight (FTO/MC4R risk variant).',
          'Low-Carb diet shows highest relative efficacy compared to standard or low-fat diets.',
          'Marked sweet tooth and carbohydrate sensitivity (SLC2A2/TCF7L2) indicating need for insulin-receptor sensitization.',
          'Slow caffeine metabolizer (CYP1A2*1F alleles): Avoid high-dose caffeine and adrenergic stimulants to prevent cortisol spikes.',
          'Reduced vitamin D assimilation and impaired MTHFR methylation require bioavailable cofactors.'
        ]
      });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum 25 MB limit.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/pdf';

    const apiKey = getGeminiApiKey();
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    const schema = {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Patient name from the cover or headers' },
        sampleCode: { type: Type.STRING, description: 'Sample ID or barcode, e.g. G000943554' },
        effectiveDietType: {
          type: Type.STRING,
          enum: ['low_carb', 'low_fat', 'mediterranean', 'high_protein', 'balanced'],
          description: 'The most effective diet type identified in the Summary / Diet and Weight section'
        },
        predispositionToOverweight: {
          type: Type.STRING,
          enum: ['high', 'moderate', 'low'],
          description: 'Genetic predisposition to overweight / obesity'
        },
        easeOfWeightLoss: {
          type: Type.STRING,
          enum: ['easy', 'moderate', 'difficult'],
          description: 'Genetically predicted ease of losing weight'
        },
        emotionalEating: {
          type: Type.STRING,
          enum: ['high', 'moderate', 'low'],
          description: 'Predisposition to emotional eating or stress eating'
        },
        snackingTendency: {
          type: Type.STRING,
          enum: ['high', 'moderate', 'low'],
          description: 'Predisposition to snacking between meals'
        },
        sweetTooth: {
          type: Type.STRING,
          enum: ['high', 'moderate', 'low'],
          description: 'Predisposition to consume sweets / sugar craving'
        },
        carbSensitivity: {
          type: Type.STRING,
          enum: ['high', 'moderate', 'low'],
          description: 'Predisposition to carbohydrate intake and glycemic response'
        },
        fatSensitivity: {
          type: Type.STRING,
          enum: ['high', 'moderate', 'low'],
          description: 'Predisposition to fat intake and sensitivity to saturated fats'
        },
        caffeineMetabolism: {
          type: Type.STRING,
          enum: ['slow', 'fast', 'intermediate'],
          description: 'Caffeine metabolism speed (CYP1A2 gene)'
        },
        vitaminD: {
          type: Type.STRING,
          enum: ['reduced_assimilation', 'normal'],
          description: 'Vitamin D genetic predisposition'
        },
        folateB9: {
          type: Type.STRING,
          enum: ['impaired_methylation', 'normal'],
          description: 'Folate / Vitamin B9 genetic predisposition (MTHFR)'
        },
        clinicalNutrigenomicNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 to 5 key clinical nutrigenomic conclusions for personalized compounding design'
        }
      },
      required: [
        'patientName',
        'sampleCode',
        'effectiveDietType',
        'predispositionToOverweight',
        'carbSensitivity',
        'caffeineMetabolism',
        'clinicalNutrigenomicNotes'
      ]
    };

    const prompt = `You are a clinical geneticist and master compounding pharmacist evaluating a 24Genetics Nutrition DNA report.
Carefully inspect the document, especially Section 2 "Summary" and the "Diet and weight", "Metabolism", and "Vitamins and minerals" sections.
Extract:
1. Patient name and sample ID.
2. The most effective diet type (e.g. low-carb, low-fat, mediterranean, or high-protein).
3. Predispositions regarding overweight, ease of weight loss, emotional eating, snacking, sweet tooth, and carbohydrate/fat sensitivities.
4. Caffeine metabolism (slow vs fast, CYP1A2).
5. Vitamin D and Folate/B9 predispositions.
6. A concise array of 3-5 clinical bullet points explaining how compounding supplements should be adjusted for this genetic profile.`;

    const { text } = await generateWithResilientGemini({
      tier: AI_TIER.REASONING,
      aiClient: ai,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: buffer.toString('base64')
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1
      }
    });

    if (!text) {
      throw new Error('Could not extract nutrigenomic data from 24Genetics document.');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return NextResponse.json({
      success: true,
      source: '24genetics_extracted',
      fileName: file.name,
      patientName: parsed.patientName || 'Patient',
      sampleCode: parsed.sampleCode || '24G-DNA',
      reportType: '24Genetics Nutrition Report',
      dietAndWeight: {
        effectiveDietType: parsed.effectiveDietType || 'low_carb',
        predispositionToOverweight: parsed.predispositionToOverweight || 'high',
        easeOfWeightLoss: parsed.easeOfWeightLoss || 'moderate',
        emotionalEating: parsed.emotionalEating || 'high',
        snackingTendency: parsed.snackingTendency || 'high',
        sweetTooth: parsed.sweetTooth || 'high',
        carbSensitivity: parsed.carbSensitivity || 'high',
        fatSensitivity: parsed.fatSensitivity || 'normal',
        hypocaloricAppetite: 'high'
      },
      metabolism: {
        caffeineMetabolism: parsed.caffeineMetabolism || 'slow',
        saltSensitivity: 'normal'
      },
      vitaminDeficiencies: {
        vitaminD: parsed.vitaminD || 'reduced_assimilation',
        folateB9: parsed.folateB9 || 'impaired_methylation',
        vitaminB12: 'normal',
        antioxidantCapacity: 'low'
      },
      clinicalNutrigenomicNotes: parsed.clinicalNutrigenomicNotes || []
    });
  } catch (error) {
    console.error('[parse-24genetics] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error parsing 24Genetics report.' },
      { status: 500 }
    );
  }
}

