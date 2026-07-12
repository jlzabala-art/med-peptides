import { adminDb } from '../src/lib/firebaseAdmin.js';

// We'll reuse the AI Action that already generates content, or we can use the genai library directly.
// Given aiActions has generateCatalogContentAction, we can adapt it or write a direct prompt.
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function enrichProtocols() {
  console.log("Starting Protocol Patient Journey Enrichment...");
  
  const snap = await adminDb.collection('protocols').get();
  console.log(`Found ${snap.size} protocols.`);
  
  for (const doc of snap.docs) {
    const data = doc.data();
    
    // Skip if already enriched (uncomment if we want to skip)
    // if (data.patient_journey_data) {
    //   console.log(`Skipping ${doc.id}, already enriched.`);
    //   continue;
    // }

    console.log(`Enriching Protocol: ${data.protocol_name || data.title || doc.id}`);
    
    const phasesInfo = (data.phases || []).map(p => {
      const items = (p.items || p.medications || []).map(i => i.name || i.productName || 'Unknown Compound').join(', ');
      return `- ${p.label || 'Phase'} (${p.durationWeeks || 4} weeks): ${items}`;
    }).join('\n');

    const prompt = `
      You are a world-class clinical longevity and peptide therapy expert.
      Generate a realistic, clinically accurate "Patient Experience Journey" for the following protocol.
      
      Protocol Name: ${data.protocol_name || data.title}
      Description: ${data.description || 'N/A'}
      Category: ${data.therapeutic_category || 'General Health'}
      Total Duration: ${data.duration_weeks || 12} weeks
      
      Phases and Compounds:
      ${phasesInfo}

      Output MUST be valid JSON only, with no markdown formatting or extra text.
      The JSON should be an array of phase objects, like this:
      [
        {
          "id": "phase-1",
          "phase": "adaptation", 
          "label": "Adaptation Phase",
          "weekStart": 1,
          "weekEnd": 3,
          "description": "...",
          "symptoms": ["symptom 1", "symptom 2"],
          "improvements": ["improvement 1", "improvement 2"],
          "lifestyle": ["recommendation 1"],
          "notifications": ["notification 1"],
          "adherence": 75
        }
      ]
      
      Rules:
      1. Tailor the symptoms (side-effects) accurately to the specific peptides/compounds in the protocol (e.g. BPC-157, Tirzepatide, etc.). Be medically realistic.
      2. Keep weekStart and weekEnd logical and sequential based on the protocol's total duration.
      3. Adherence is a number between 0 and 100 representing expected patient compliance during that phase.
      4. Use phases like 'adaptation', 'improvement', 'maintenance', 'peak'.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      let responseText = response.text || '';
      // clean up any potential markdown
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const journeyData = JSON.parse(responseText);
      
      if (Array.isArray(journeyData)) {
        await doc.ref.update({
          patient_journey_data: journeyData
        });
        console.log(`✅ Successfully updated ${doc.id}`);
      } else {
         console.log(`❌ Failed to parse array for ${doc.id}`);
      }
      
    } catch (err) {
      console.error(`Error enriching ${doc.id}:`, err);
    }
    
    // Slight delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("Enrichment complete.");
}

enrichProtocols().catch(console.error);
