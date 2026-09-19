import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const SECTION_PROMPTS = {
  overview: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}
- Category: ${p.therapeutic_category || p.category || 'General Clinical'}

INSTRUCTION: Summarize all medical information into strict, short sentences. Return JSON with:
- name: string
- therapeutic_category: string
- overview_summary: string (1-2 sentences)
- clinical_rationale: string (1-2 sentences)
- expected_outcomes: object { qualitative (string), time_to_onset_weeks (string), responder_rate_pct (string), notes (string) }
- contraindications: array of strings
`,
  treatment: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}
- Peptides: ${(p.peptides || p.items || []).map(x => x.name || x.title || x).join(', ') || 'Target Peptides'}

INSTRUCTION: Build a structured treatment plan with duration in weeks and sequential phases (e.g. Phase 1 Induction, Phase 2 Escalation, Phase 3 Maintenance). Return JSON.
`,
  dosage: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}
- Peptides: ${(p.peptides || p.items || []).map(x => x.name || x.title || x).join(', ') || 'Target Peptides'}

INSTRUCTION: Generate a comprehensive, clinically accurate weekly dosage schedule.
Return JSON with:
- dosage_schedule: array of objects { compound, phase, week, dose, unit, frequency, route, administration_timing, notes }
- weekly_doses: object mapping week numbers to dosage descriptions
- dosing_instructions: string summarizing overall administration guidelines
`,
  monitoring: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}

INSTRUCTION: Generate safety monitoring protocols and clinical check-in milestones.
Return JSON with:
- monitoring_cadence: string (e.g. "Bi-weekly clinical check-ins with resting HR tracking")
- check_in_weeks: array of numbers (e.g. [2, 4, 8, 12])
- check_in_questions: array of strings
- adverse_event_screening: array of strings
- vital_signs_monitoring: array of strings
`,
  labs: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}

INSTRUCTION: Specify required laboratory testing checkpoints.
Return JSON with:
- required_labs: array of objects { phase, timing, tests, clinical_purpose }
- baseline_labs: array of strings
- mid_cycle_labs: array of strings
- post_cycle_labs: array of strings
`,
  progress: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}

INSTRUCTION: Define measurable clinical biomarker targets and KPI trajectory over time.
Return JSON with:
- clinical_biomarker_data: array of objects { biomarker, target_improvement, unit, baseline_range, post_cycle_target }
- progress_tracker: array of objects { week, milestone_description, expected_metric }
`
};

export async function POST(request) {
  try {
    const { protocolId, protocol, sectionId } = await request.json();

    if (!sectionId || !SECTION_PROMPTS[sectionId]) {
      return NextResponse.json({ error: `Invalid or unsupported section: ${sectionId}` }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = SECTION_PROMPTS[sectionId](protocol || {});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8192
      }
    });

    const rawText = response.text ? response.text.trim() : '{}';
    let patch = {};
    try {
      patch = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      patch = JSON.parse(match ? match[1] : rawText);
    }

    // Add updated timestamp
    patch.updatedAt = new Date().toISOString();
    patch.lastReviewedAt = new Date().toISOString();

    return NextResponse.json({ success: true, patch });
  } catch (error) {
    console.error('[Enrich Protocol API] Error:', error);
    return NextResponse.json({ error: error.message || 'AI enrichment failed.' }, { status: 500 });
  }
}
