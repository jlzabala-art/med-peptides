import { GoogleGenAI } from '@google/genai';

/**
 * Atlas AI Service for data extraction
 */

// We will expect the API key to be injected via environment variables in Vite.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiClient = null;

if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
}

/**
 * Converts a JS File object (e.g. from an <input type="file" />) into the inlineData
 * format required by the Google Gen AI SDK.
 * @param {File} file 
 * @returns {Promise<Object>}
 */
const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Extracts API Peptides (Name and Price/g) from an image table.
 * @param {File} imageFile 
 * @returns {Promise<Array>} Array of { peptideName, pricePerGram }
 */
export const extractApiPeptidesFromImage = async (imageFile) => {
    if (!aiClient) {
        throw new Error("Atlas AI is not configured. Missing VITE_GEMINI_API_KEY in environment variables.");
    }

    try {
        const imagePart = await fileToGenerativePart(imageFile);

        const prompt = `You are a highly accurate OCR and data extraction AI named Atlas AI.
The user has provided an image of a price list for API Peptides.
Extract the tabular data from the image. 
Return ONLY a valid JSON array of objects. Do not include markdown formatting or backticks around the JSON.
Each object must strictly match this schema:
{
  "peptideName": "string (the name of the peptide/product)",
  "pricePerGram": "number (the price per gram in USD, without symbols. Convert 1.280,91 to 1280.91 etc. Handle commas/dots correctly based on standard European or US formatting depending on context. If it says 2.750,00 that is 2750.00)"
}

CRITICAL: Ignore the "Quantity (g)" and "Total (USD)" columns entirely. We only want the base price per gram.
Ensure the JSON is perfectly valid.`;

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                imagePart
            ],
            config: {
                temperature: 0.1,
                // Using responseMimeType to enforce JSON output
                responseMimeType: "application/json",
            }
        });

        const textResponse = response.text;
        
        // Ensure it's parsed correctly
        const parsedData = JSON.parse(textResponse);
        return parsedData;

    } catch (error) {
        console.error("Atlas AI Extraction failed:", error);
        throw new Error("Failed to process image with Atlas AI. Ensure the image is clear and the API key is valid.");
    }
};
