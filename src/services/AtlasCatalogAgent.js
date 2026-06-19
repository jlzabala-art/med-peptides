/**
 * AtlasCatalogAgent.js
 *
 * NOTE: Both Gemini API keys in this project have been reported as leaked
 * by Google Cloud and are blocked (PERMISSION_DENIED).
 * 
 * ACTION REQUIRED: Generate a new Gemini API key at:
 * https://aistudio.google.com/app/apikey
 * Then set it in .env.local as VITE_GEMINI_API_KEY=<your-new-key>
 * 
 * Until then, this agent returns a static fallback gracefully.
 */

import { GoogleGenAI, Type } from '@google/genai';

// Use the environment variable API key (not the old hardcoded one that was blocked)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const AtlasCatalogAgent = {
  /**
   * Generates a smart catalog draft from a list of products
   * @param {Array} products List of product objects
   * @returns {Object} JSON object with name, description, clinicalGoals, and categories
   */
  async generateCatalogDraft(products) {
    // Fallback if no API key configured
    if (!ai) {
      console.warn('[AtlasCatalogAgent] No VITE_GEMINI_API_KEY configured. Using fallback.');
      return {
        name: "Custom Medical Catalog",
        description: "Curated selection of medical products and supplies.",
        clinicalGoals: ["General Health"],
        categories: ["Medical Supplies"]
      };
    }

    try {
      // Summarize products to save tokens
      const productSummary = products.map(p => ({
        name: p.name,
        category: p.category,
        goals: p.clinicalGoals || []
      }));

      const prompt = `
You are Atlas Health AI, a medical supply catalog assistant. 
Based on the following list of medical products, generate a professional, commercial catalog configuration.

Products:
${JSON.stringify(productSummary, null, 2)}

Return a JSON object containing:
- name: A professional name for this catalog (e.g. "Metabolic Health Portfolio", "Advanced Longevity Collection"). Do not use "Catalog 001".
- description: A professional commercial description highlighting the main therapeutic areas (max 2 sentences).
- clinicalGoals: An array of strings representing the primary clinical goals detected (e.g., "Weight Loss", "Longevity"). Max 3.
- categories: An array of strings representing the main product categories detected. Max 4.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              clinicalGoals: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              categories: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["name", "description", "clinicalGoals", "categories"]
          }
        }
      });

      const text = response.text;
      return JSON.parse(text);
    } catch (error) {
      console.error("AtlasCatalogAgent Error:", error);
      // Fallback in case of AI failure
      return {
        name: "Custom Medical Catalog",
        description: "Curated selection of medical products and supplies.",
        clinicalGoals: ["General Health"],
        categories: ["Medical Supplies"]
      };
    }
  }
};
