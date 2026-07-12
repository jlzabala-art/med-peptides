const { execSync } = require('child_process');
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { callGemini } = require('../functions/src/http/ai_utils');

// Initialize admin
const serviceAccount = require("./serviceAccountKey.json");
const app = initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore(app);

async function run() {
  const pdfFiles = [
    "./AI Prompts/Prescriptions/Rx peptides-Gyn - Alice Shamoon - 7th July 26.pdf",
    "./AI Prompts/Prescriptions/Rx peptides-Gyn - Alice Shamoon - 11th July 26.pdf"
  ];

  // Populate catalog manually for prompt
  const productsSnap = await db.collection("products").get();
  const allPeptides = [];
  productsSnap.forEach(doc => allPeptides.push({ id: doc.id, ...doc.data() }));
  const activePeptides = allPeptides.filter(p => p.isActive === true);
  
  const catalogContext = activePeptides.map(p =>
    `- Name: "${p.displayName || p.name}"\n  ID: "${p.slug || p.id}"\n  Strengths/Dosages: "${p.standard_dosage || "N/A"}"\n  Category: "${p.category || "Peptides"}"`
  ).join("\n");

  const systemInstruction = `
You are the Atlas Health Prescription Ingestion Agent.
Your job is to analyze the medical prescription text provided by the user, match items against the available catalog of commercial products, and classify the remaining items as custom compounded formulations.

The available catalog products are:
${catalogContext}

For each line or compound in the prescription:
1. Try to find a match in the available catalog of commercial products.
   - If you find an exact or very close match, list it under "catalog".
   - You MUST include: "name", "product" (with "id"), "strength", "quantity", "dosage_instructions", "duration", "vials_needed", "category".

2. If the item is NOT found in the catalog (e.g., custom combination):
   - Classify it as a custom compounded formulation, and list it under "quotation".
   - You MUST extract or structure: "name", "actives", "vehicle", "volume", "duration", "vials_needed", "specialInstructions".

3. Generate warnings under "warnings".

You must output ONLY a valid JSON object matching this schema:
{
  "catalog": [
    {
      "name": "BPC-157 5mg Vial",
      "product": { "id": "bpc-157-5mg-vial" },
      "strength": "5mg",
      "dosage_instructions": "Inject 0.1 mL daily",
      "duration": "8 weeks",
      "vials_needed": 3,
      "quantity": "5 vials",
      "category": "Category A (Direct Match)"
    }
  ],
  "quotation": [
    {
      "name": "Custom CJC/Ipamorelin Blend",
      "actives": [{"active": "CJC-1295", "concentration": "5mg"}, {"active": "Ipamorelin", "concentration": "5mg"}],
      "vehicle": "Injectable Vial",
      "volume": "10mg total",
      "duration": "12 weeks",
      "vials_needed": 4,
      "specialInstructions": "Inject once daily at bedtime"
    }
  ],
  "warnings": [
    "Check interactions with existing medications."
  ]
}

CRITICAL: For peptide prescriptions, it is fundamental to identify the total number of vials needed for the entire treatment duration based on the daily dose, vial size, and reconstitution instructions. Calculate "vials_needed" explicitly as an integer. Extract "duration" as well.
`;

  for (const pdf of pdfFiles) {
    console.log(`\n--- Importing: ${pdf} ---`);
    const text = execSync(`python3 parse_pdf.py "${pdf}"`).toString();
    const contents = [{ role: "user", parts: [{ text: `Prescription Text to analyze:\n"${text}"` }] }];

    try {
      console.log("Calling Gemini...");
      const resultText = await callGemini(contents, systemInstruction, "gemini-2.5-flash", "application/json");
      const data = JSON.parse(resultText);
      console.log("AI Parsed Result:");
      console.log(JSON.stringify(data, null, 2));

      // Import to Firestore
      const rxDoc = {
        patientName: "Alice Shamoon",
        patientId: "shamoon_alice_1961",
        source: "PDF Import",
        status: "draft",
        createdAt: new Date().toISOString(),
        items: [],
        warnings: data.warnings || [],
        rawText: text.substring(0, 500) + "..."
      };

      if (data.catalog) {
        data.catalog.forEach(cat => {
          rxDoc.items.push({
            type: "product",
            productName: cat.name,
            productId: cat.product?.id,
            dosage: cat.dosage_instructions,
            duration: cat.duration,
            vials: cat.vials_needed,
            quantity: cat.vials_needed || 1,
          });
        });
      }
      if (data.quotation) {
        data.quotation.forEach(quote => {
          rxDoc.items.push({
            type: "custom",
            productName: quote.name,
            actives: quote.actives,
            dosage: quote.specialInstructions,
            duration: quote.duration,
            vials: quote.vials_needed,
            quantity: quote.vials_needed || 1,
            vehicle: quote.vehicle,
            volume: quote.volume
          });
        });
      }

      const res = await db.collection('prescriptions').add(rxDoc);
      console.log(`✅ Imported prescription with ID: ${res.id}`);
      
    } catch (e) {
      console.error("Error calling Gemini or saving:", e);
    }
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
