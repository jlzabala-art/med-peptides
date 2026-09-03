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

    const { 
      targetGoal, 
      durationWeeks = 8, 
      patientType = 'General Clinical', 
      experienceLevel = 'Intermediate',
      budgetTier = 'standard'
    } = await request.json();

    if (!targetGoal || typeof targetGoal !== 'string' || targetGoal.trim().length === 0) {
      return NextResponse.json(
        { error: 'Target health goal or therapeutic outcome is required.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const schema = {
      type: Type.OBJECT,
      properties: {
        protocolName: { type: Type.STRING, description: 'Institutional protocol title (e.g. Wolverine Advanced Tissue Regeneration Protocol)' },
        subtitle: { type: Type.STRING, description: 'Short medical summary descriptor' },
        therapeuticCategory: { type: Type.STRING, description: 'Category (e.g. Tissue Healing, Neurogenesis, Metabolic Optimization, Longevity)' },
        totalDurationWeeks: { type: Type.INTEGER, description: 'Total weeks for the full multi-phase protocol' },
        overview: { type: Type.STRING, description: 'Comprehensive clinical rationale and expected outcomes' },
        phases: {
          type: Type.ARRAY,
          description: 'Sequential phases of the protocol (Phase 1: Loading/Sensitization, Phase 2: Therapeutic Synergy, Phase 3: Maintenance)',
          items: {
            type: Type.OBJECT,
            properties: {
              phaseNumber: { type: Type.INTEGER },
              phaseName: { type: Type.STRING, description: 'Phase title (e.g. Phase 1: Priming & Angiogenesis)' },
              durationWeeks: { type: Type.INTEGER, description: 'Duration of this phase in weeks' },
              phaseObjective: { type: Type.STRING, description: 'Specific biological goal of this phase' },
              compounds: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    peptideName: { type: Type.STRING, description: 'Standardized peptide name (e.g. BPC-157, TB-500, GHK-Cu, CJC-1295)' },
                    dosage: { type: Type.STRING, description: 'Dosage per administration (e.g. 250 mcg, 500 mcg, 2.5 mg)' },
                    frequency: { type: Type.STRING, description: 'Administration frequency (e.g. Twice daily, Once daily before bed, 2x per week)' },
                    route: { type: Type.STRING, description: 'Route (Subcutaneous, Topical, Nasal)' },
                    timing: { type: Type.STRING, description: 'Best time of day (e.g. Fasted morning, 30 min before sleep)' },
                    estimatedVials: { type: Type.INTEGER, description: 'Calculated commercial vials required for this phase' },
                    rationale: { type: Type.STRING, description: 'Mechanism why this compound is active in this phase' }
                  },
                  required: ['peptideName', 'dosage', 'frequency', 'route', 'estimatedVials']
                }
              }
            },
            required: ['phaseNumber', 'phaseName', 'durationWeeks', 'phaseObjective', 'compounds']
          }
        },
        accessoriesNeeded: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.INTEGER },
              reason: { type: Type.STRING }
            },
            required: ['name', 'quantity']
          }
        },
        monitoringBiomarkers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Recommended lab blood panels to track (e.g. IGF-1, hs-CRP, Fasting Insulin, Liver Panel, CBC)'
        },
        refillTriggerWeek: {
          type: Type.INTEGER,
          description: 'Week at which the automated re-order/refill notification should dispatch'
        }
      },
      required: ['protocolName', 'subtitle', 'therapeuticCategory', 'totalDurationWeeks', 'overview', 'phases', 'accessoriesNeeded', 'monitoringBiomarkers']
    };

    const systemPrompt = `You are the Lead Medical Protocol Architect for RegenPept.
Your task is to design an evidence-based, multi-phase clinical peptide protocol for the objective: "${targetGoal}".

Parameters:
- Target Duration: ${durationWeeks} weeks
- Patient Profile: ${patientType}
- Experience: ${experienceLevel}
- Budget Tier: ${budgetTier}

Architecture Rules:
1. Divide into 2 to 3 logical phases:
   - Phase 1: Priming & Cellular Sensitization
   - Phase 2: Core Synergistic Consolidation
   - Phase 3: Tapering / Sustained Maintenance
2. Select compounds with proven biochemical synergies (e.g. BPC-157 + TB-500 for connective tissue, CJC-1295 + Ipamorelin for GH, NAD+ + NMN/Resveratrol for sirtuins).
3. Compute exact vial counts per phase to enable direct supply fulfillment.
4. Include reconstitution solvent and injection supplies in accessoriesNeeded.
5. Provide relevant clinical blood biomarkers for monitoring.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
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

    const designedProtocol = JSON.parse(text);
    return NextResponse.json({
      success: true,
      data: designedProtocol
    });
  } catch (error) {
    console.error('[AI Design Protocol] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to design protocol.' },
      { status: 500 }
    );
  }
}
