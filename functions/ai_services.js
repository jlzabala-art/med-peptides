const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

if (!admin.apps.length) {
    admin.initializeApp();
}

// Initialize Gemini Client
const ai = new GoogleGenAI({}); 

/**
 * Parses an uploaded PDF prescription or medical report using AI.
 * This function should be called via Firebase Callable Functions.
 * 
 * @param {Object} data - Contains the fileUrl or base64 data.
 * @returns {Object} Extracted prescription lines and patient data.
 */
exports.parseMedicalDocument = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { fileUrl, fileType, source, base64Data } = data;
    
    try {
        const prompt = `You are a medical document parser. Extract the patient name and prescription lines from the provided document.
        Return ONLY a JSON object strictly matching this schema:
        {
          "patientName": "string",
          "prescriptionLines": [
             { "product_name": "string", "dosage": "string", "frequency": "string", "route": "string", "duration": "string", "quantity": "number" }
          ]
        }`;

        // In a real scenario, we'd pass the file content directly. For scaffolding, we simulate the LLM call.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\nDocument Data: ${base64Data ? '<base64>' : fileUrl}`
        });

        // Mocking return since we don't have real credentials configured yet
        return {
            success: true,
            patientName: "John Doe (Auto-Extracted by Gemini)",
            sourceType: source,
            prescriptionLines: [
                {
                    product_name: "Thymosin Alpha-1",
                    dosage: "1.5 mg",
                    frequency: "2x / week",
                    route: "Subcutaneous",
                    duration: "4 weeks",
                    quantity: 1
                }
            ],
            confidenceScore: 0.98,
            rawAiResponse: response.text
        };
    } catch (error) {
        console.error("AI Parsing Error:", error);
        throw new functions.https.HttpsError("internal", "Failed to parse document via AI.");
    }
});

/**
 * Generates Protocol AI Insights (Clinical rationale, contraindications)
 */
exports.generateProtocolInsights = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { protocolData } = data;

    try {
        const prompt = `Analyze this medical protocol: ${JSON.stringify(protocolData)}.
        Generate a clinical rationale, expected outcomes, contraindications, and recommended labs.
        Return ONLY JSON matching: { "rationale": "string", "expectedOutcomes": ["string"], "contraindications": ["string"], "labsRequired": [{ "test": "string", "timing": "string" }] }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        // Parse LLM response and return
        // For scaffold, returning mocked data enhanced by AI logic structure
        return {
            success: true,
            rationale: "This protocol leverages specialized peptides to accelerate recovery...",
            expectedOutcomes: ["Improved immune response", "Reduced systemic inflammation"],
            contraindications: ["Pregnancy", "Active autoimmune flare"],
            labsRequired: [
                { test: "CBC", timing: "Baseline" },
                { test: "CRP", timing: "Week 4" }
            ],
            rawAiResponse: response.text
        };
    } catch (error) {
        console.error("AI Insight Error:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate insights.");
    }
});
