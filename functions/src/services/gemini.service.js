const { GoogleGenAI } = require("@google/genai");

/**
 * Uses Google Gemini to extract product and pricing information from raw text.
 * 
 * @param {string} apiKey - The Gemini API Key.
 * @param {string} textContent - The raw text content of a store page.
 * @param {string} trackPromptExtension - Optional extra instructions for Gemini.
 * @returns {Promise<Array>} - An array of parsed product objects.
 */
async function parsePricingData(apiKey, textContent, trackPromptExtension = "") {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing or empty");
  
  const ai = new GoogleGenAI({ apiKey });
  const truncatedText = textContent.slice(0, 50000); 

  const prompt = `
    You are a data extraction assistant.
    I will provide you with the raw text from a peptide/supplement e-commerce store.
    Extract a list of products with their names, dosage (in mg, if available), and price (in USD).
    If in stock status is visible, note it.
    
    Respond strictly in JSON format matching this schema:
    {
      "products": [
        { "product_name": "Tirzepatide", "dosage_mg": 10, "price_usd": 120.00, "in_stock": true }
      ]
    }
    
    Store Text:
    ${truncatedText}
    
    ${trackPromptExtension}
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const parsed = JSON.parse(result.text);
  return parsed.products || [];
}

module.exports = {
  parsePricingData
};
