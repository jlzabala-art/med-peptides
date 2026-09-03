/**
 * atlasProtocolEnricher.js
 *
 * Real AI service that uses Gemini 2.5 Flash to auto-complete missing
 * sections of a clinical protocol. Called when the user clicks an
 * incomplete chip in ProtocolClinicalTab.
 *
 * Pattern: same as AtlasCatalogAgent – direct Gemini call from browser
 * using NEXT_PUBLIC_GEMINI_API_KEY (set in .env.local).
 */

import { GoogleGenAI, Type } from '@google/genai';
import { updateProtocolFull } from './protocolStorage';
import logger from '../utils/logger.js';

const apiKey =
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
    : '') || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ── Section-level prompt templates ───────────────────────────────────────────

const SECTION_PROMPTS = {
  overview: (p) => `
You are Atlas Health AI, an expert medical protocol designer.
Context:
- Protocol name: ${p.name || 'Unknown'}
- Category: ${p.therapeutic_category || 'Unknown'}

INSTRUCTION: You must be extremely concise. Summarize all medical information into strict, short sentences before returning the values. Do not hallucinate extra details.

Return JSON with:
- name: string
- therapeutic_category: string
- overview_summary: string (Strictly 1-2 sentences summarizing purpose)
- clinical_rationale: string (Strictly 1-2 sentences explaining why this works)
- expected_outcomes: object { qualitative (string, 1 sentence), time_to_onset_weeks (string), responder_rate_pct (string), notes (string, max 1 sentence) }
- contraindications: array of strings (Short bullet points)
`,

  treatment: (p) => `
You are Atlas Health AI.
Context: ${p.name || 'Unknown'} (${p.therapeutic_category || 'Unknown'})

INSTRUCTION: Be extremely concise. Summarize phase descriptions.
Return JSON with:
- duration_weeks: number
- phases: array of objects { label, durationWeeks, description (Strictly 1 sentence summary), items: [{productId, productName}] }
`,

  dosage: (p) => `
You are Atlas Health AI.
Context: ${p.name || 'Unknown'}

INSTRUCTION: Be extremely concise and strict.
Return JSON with:
- weekly_doses: number
- dosage_schedule: array of strings (Short instructions, e.g., "BPC-157: 250mcg SQ AM")
- administration_notes: string (Strictly 1 sentence summary of best practices)
`,

  monitoring: (p) => `
You are Atlas Health AI.
Context: ${p.name || 'Unknown'}

INSTRUCTION: Be extremely concise.
Return JSON with:
- check_in_weeks: number
- monitoring_cadence: string (Strictly 1 sentence summary)
- monitoring_parameters: array of strings (Short bullet points)
`,

  labs: (p) => `
You are Atlas Health AI.
Context: ${p.name || 'Unknown'}

INSTRUCTION: Be extremely concise.
Return JSON with:
- lab_schedule: array of objects { timing, type, tests }
- biomarkers: array of strings (Max 5 items)
- labs_frequency: string (Strictly 1 sentence)
`,

  progress: (p) => `
You are Atlas Health AI.
Context: ${p.name || 'Unknown'}

INSTRUCTION: Be extremely concise.
Return JSON with:
- clinical_biomarker_data: object { biomarker_name (short name), target_label, progressData: [{week, value}] }
`,
};

// ── Schema per section ────────────────────────────────────────────────────────

const SECTION_SCHEMAS = {
  overview: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      therapeutic_category: { type: Type.STRING },
      overview_summary: { type: Type.STRING },
      clinical_rationale: { type: Type.STRING },
      expected_outcomes: {
        type: Type.OBJECT,
        properties: {
          qualitative: { type: Type.STRING },
          time_to_onset_weeks: { type: Type.STRING },
          responder_rate_pct: { type: Type.STRING },
          notes: { type: Type.STRING }
        }
      },
      contraindications: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['name', 'therapeutic_category', 'overview_summary', 'clinical_rationale', 'expected_outcomes', 'contraindications'],
  },
  treatment: {
    type: Type.OBJECT,
    properties: {
      duration_weeks: { type: Type.NUMBER },
      phases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            durationWeeks: { type: Type.NUMBER },
            description: { type: Type.STRING },
            items: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  productName: { type: Type.STRING }
                }
              } 
            },
          },
        },
      },
    },
    required: ['duration_weeks', 'phases'],
  },
  dosage: {
    type: Type.OBJECT,
    properties: {
      weekly_doses: { type: Type.NUMBER },
      dosage_schedule: { type: Type.ARRAY, items: { type: Type.STRING } },
      administration_notes: { type: Type.STRING },
    },
    required: ['weekly_doses', 'dosage_schedule'],
  },
  monitoring: {
    type: Type.OBJECT,
    properties: {
      check_in_weeks: { type: Type.NUMBER },
      monitoring_cadence: { type: Type.STRING },
      monitoring_parameters: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['check_in_weeks', 'monitoring_cadence'],
  },
  labs: {
    type: Type.OBJECT,
    properties: {
      lab_schedule: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT,
          properties: {
            timing: { type: Type.STRING },
            type: { type: Type.STRING },
            tests: { type: Type.STRING }
          }
        } 
      },
      biomarkers: { type: Type.ARRAY, items: { type: Type.STRING } },
      labs_frequency: { type: Type.STRING },
    },
    required: ['lab_schedule', 'biomarkers'],
  },
  progress: {
    type: Type.OBJECT,
    properties: {
      clinical_biomarker_data: {
        type: Type.OBJECT,
        properties: {
          biomarker_name: { type: Type.STRING },
          target_label: { type: Type.STRING },
          progressData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.NUMBER },
                value: { type: Type.NUMBER }
              },
            }
          }
        },
      }
    },
    required: ['clinical_biomarker_data'],
  },
};

// ── Main enrichment function ──────────────────────────────────────────────────

/**
 * Enriches a specific section of a protocol using Gemini AI.
 * Saves the generated data directly to Firestore.
 *
 * @param {string} protocolId - Firestore document ID
 * @param {Object} protocol - Current protocol data
 * @param {string} sectionId - One of: 'overview', 'treatment', 'dosage', 'monitoring', 'labs'
 * @returns {Promise<Object>} - The generated patch that was saved
 */
export async function enrichProtocolSection(protocolId, protocol, sectionId) {
  if (!ai) {
    throw new Error(
      'Atlas AI is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.'
    );
  }

  const promptFn = SECTION_PROMPTS[sectionId];
  const schema = SECTION_SCHEMAS[sectionId];

  if (!promptFn || !schema) {
    throw new Error(`Unknown section: ${sectionId}`);
  }

  const prompt = promptFn(protocol);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      maxOutputTokens: 8192,
    },
  });

  let patch;
  try {
    let rawText = response.text.trim();
    
    // First attempt: raw parse. The Gemini API with application/json and responseSchema 
    // usually returns pristine JSON without markdown.
    try {
      patch = JSON.parse(rawText);
    } catch (firstError) {
      // Second attempt: clean markdown blocks
      let cleanText = rawText;
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        cleanText = match[1];
      } else {
        if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
        else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
        if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      
      try {
        patch = JSON.parse(cleanText.trim());
      } catch (secondError) {
        // Third attempt: manual character fixing
        let isInsideString = false;
        let isEscaped = false;
        let fixedText = '';
        for (let i = 0; i < cleanText.length; i++) {
          const char = cleanText[i];
          if (char === '"' && !isEscaped) {
            isInsideString = !isInsideString;
            fixedText += char;
          } else if (char === '\\') {
            isEscaped = !isEscaped;
            fixedText += char;
          } else {
            isEscaped = false;
            if (isInsideString) {
              if (char === '\n') fixedText += '\\n';
              else if (char === '\r') fixedText += '\\r';
              else if (char === '\t') fixedText += '\\t';
              else fixedText += char;
            } else {
              fixedText += char;
            }
          }
        }
        patch = JSON.parse(fixedText.trim());
      }
    }
  } catch (error) {
    logger.error('[atlasProtocolEnricher] AI JSON Parse Error:', error);
    logger.error('[atlasProtocolEnricher] Raw Response:', response.text);
    throw new Error(`El modelo de IA generó una respuesta incompleta o inválida. Error: ${error.message}`);
  }

  // Increment version and record timeline audit event
  const currentVersion = Number(protocol.version_number || protocol.version || 1);
  const nextVersion = currentVersion + 1;
  const enrichedSections = Array.from(new Set([...(protocol.ai_enriched_sections || []), sectionId]));

  const auditEntry = {
    id: `enrich-${sectionId}-${Date.now()}`,
    type: 'version_bump',
    actor: 'AI Genesis',
    ts: new Date().toISOString(),
    summary: `AI auto-enriched "${sectionId}" section (v${nextVersion}.0)`,
    details: { section: sectionId, version: `${nextVersion}.0`, model: 'Gemini 2.5 Flash' },
  };

  const audit_log = Array.isArray(protocol.audit_log) ? [auditEntry, ...protocol.audit_log] : [auditEntry];

  const updatePayload = {
    ...patch,
    version_number: nextVersion,
    version: nextVersion,
    updated_at: new Date(),
    updatedAt: new Date().toISOString(),
    ai_enriched_sections: enrichedSections,
    audit_log,
  };

  // Persist to Firestore immediately
  await updateProtocolFull(protocolId, updatePayload);

  return {
    ...patch,
    version_number: nextVersion,
    version: nextVersion,
    ai_enriched_sections: enrichedSections,
    audit_log,
  };
}
