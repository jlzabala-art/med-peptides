import { adminDb } from '../src/lib/firebaseAdmin.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function enrichBiomarkers() {
  console.log("Starting Biomarker Trajectory Enrichment...");
  
  const snap = await adminDb.collection('protocols').get();
  console.log(`Found ${snap.size} protocols.`);
  
  for (const doc of snap.docs) {
    const data = doc.data();
    
    console.log(`Enriching Biomarker for: ${data.protocol_name || data.title || doc.id}`);
    
    const phasesInfo = (data.phases || []).map(p => {
      const items = (p.items || p.medications || []).map(i => i.name || i.productName || 'Unknown Compound').join(', ');
      return `- ${p.label || 'Phase'} (${p.durationWeeks || 4} weeks): ${items}`;
    }).join('\n');

    const prompt = `
      You are a world-class clinical longevity and peptide therapy expert.
      Generate a realistic, clinically accurate "Projected Biomarker Trajectory" for the following protocol.
      
      Protocol Name: ${data.protocol_name || data.title}
      Description: ${data.description || 'N/A'}
      Category: ${data.therapeutic_category || 'General Health'}
      Total Duration: ${data.duration_weeks || 12} weeks
      
      Phases and Compounds:
      ${phasesInfo}

      Output MUST be valid JSON only, with no markdown formatting or extra text.
      The JSON should have this structure:
      {
        "biomarker_name": "Name of the primary biomarker being tracked (e.g., IGF-1 Levels, HbA1c Reduction, Pain Score (VAS))",
        "target_label": "The clinical target (e.g., 80% Target Resolution, Optimal Range Achieved)",
        "progressData": [
          { "week": "W1", "biomarker": 10, "target": 80, "phase": "Adaptation" },
          { "week": "W2", "biomarker": 15, "target": 80, "phase": "Adaptation" },
          { "week": "W3", "biomarker": 30, "target": 80, "phase": "Initial Response" },
          ... up to week 12 or total duration. Provide key week markers (W1, W2, W3, W4, W6, W8, W10, W12).
        ]
      }
      
      Rules:
      1. Choose the MOST relevant clinical biomarker for the specific peptides (e.g., if Semaglutide/Tirzepatide, track HbA1c or Weight Loss %. If BPC-157, track Pain Score (VAS) or Inflammation markers. If CJC-1295, track IGF-1).
      2. The 'biomarker' value in the array should be a normalized progression metric (0 to 100), where 100 is complete resolution or maximum target hit.
      3. Make the curve medically realistic (e.g. peptides take weeks to show results, so week 1-2 should be low, ramping up in weeks 4-8).
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
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const biomarkerData = JSON.parse(responseText);
      
      if (biomarkerData && biomarkerData.biomarker_name && Array.isArray(biomarkerData.progressData)) {
        await doc.ref.update({
          clinical_biomarker_data: biomarkerData
        });
        console.log(`✅ Successfully updated ${doc.id} with biomarker: ${biomarkerData.biomarker_name}`);
      } else {
         console.log(`❌ Failed to parse correct structure for ${doc.id}`);
      }
      
    } catch (err) {
      console.error(`Error enriching ${doc.id}:`, err);
    }
    
    // Slight delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("Enrichment complete.");
}

enrichBiomarkers().catch(console.error);
