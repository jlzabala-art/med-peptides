import { adminDb } from '../src/lib/firebaseAdmin.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_TEMPLATE = `
You are a medical protocol data enrichment expert.
I will provide you with the name and details of a peptide/longevity protocol.
Your task is to generate realistic, medically sound values for three missing clinical fields.

Protocol Name: {{PROTOCOL_NAME}}
Category: {{CATEGORY}}
Phases: {{PHASES}}

Please return ONLY a valid JSON object with the following structure and nothing else (no markdown wrapping, just JSON).
Ensure it follows general best practices for peptide and longevity therapies.

{
  "dosage_schedule": [
    "e.g. 5 days on, 2 days off",
    "e.g. Subcutaneous injection every morning before breakfast"
  ],
  "monitoring_cadence": "e.g. Check-in at Week 2, Full review at Week 6",
  "required_labs": [
    "e.g. Comprehensive Metabolic Panel (CMP)",
    "e.g. Complete Blood Count (CBC)",
    "e.g. IGF-1"
  ]
}
`;

async function enrichClinicalFields() {
  const snapshot = await adminDb.collection('protocols').get();
  const protocols = snapshot.docs;

  console.log(`Found ${protocols.length} protocols to check for completeness...`);

  for (const doc of protocols) {
    const data = doc.data();
    
    // Check if it's missing the required fields
    const hasDosage = data.dosage_schedule && data.dosage_schedule.length > 0;
    const hasMonitoring = !!data.monitoring_cadence;
    const hasLabs = data.required_labs && data.required_labs.length > 0;

    if (hasDosage && hasMonitoring && hasLabs) {
      console.log(`Skipping ${data.protocol_name || doc.id}, already complete.`);
      continue;
    }

    console.log(`Enriching Clinical Fields for: ${data.protocol_name || doc.id}`);

    try {
      const prompt = PROMPT_TEMPLATE
        .replace('{{PROTOCOL_NAME}}', data.protocol_name || 'Unknown')
        .replace('{{CATEGORY}}', data.therapeutic_category || 'Unknown')
        .replace('{{PHASES}}', JSON.stringify(data.phases || []));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text().trim();
      let enrichmentData;
      try {
        enrichmentData = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));
      } catch (err) {
        console.error(`Failed to parse JSON for ${doc.id}: ${responseText}`);
        continue;
      }

      await doc.ref.update({
        dosage_schedule: hasDosage ? data.dosage_schedule : enrichmentData.dosage_schedule,
        monitoring_cadence: hasMonitoring ? data.monitoring_cadence : enrichmentData.monitoring_cadence,
        required_labs: hasLabs ? data.required_labs : enrichmentData.required_labs,
      });

      console.log(`Successfully enriched ${doc.id}`);

      // Sleep to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));

    } catch (error) {
      console.error(`Error enriching ${doc.id}:`, error);
    }
  }

  console.log('Enrichment complete.');
}

enrichClinicalFields().catch(console.error);
