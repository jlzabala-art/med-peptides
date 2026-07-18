import { GoogleGenAI, Type } from '@google/genai';

// Use the environment variable API key (not the old hardcoded one that was blocked)
const apiKey = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY) : '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const AtlasImportAgent = {
  /**
   * Analyzes raw CSV/Excel rows to identify mappings, new products, and price changes.
   * @param {Array} rows Raw JSON rows from the spreadsheet
   * @param {Array} existingProducts Currently existing products in the database
   * @returns {Object} JSON object with mapping, summary, newProducts, and priceChanges
   */
  async analyzeImportData(rows, existingProducts) {
    if (!ai) {
      throw new Error("No VITE_GEMINI_API_KEY configured for AI Import.");
    }

    try {
      // 1. Prepare data (take sample if too large to avoid token limits)
      // Usually, Gemini 2.5 Flash can handle large context, but let's be safe.
      const sampleRows = rows.slice(0, 100);
      const sampleExisting = existingProducts.map(p => ({ id: p.id, name: p.name, sku: p.sku, price: p.price }));

      const prompt = `
You are Atlas Health AI, a medical supply catalog data mapping expert.
I am providing you with two datasets:
1. RAW IMPORT ROWS: Raw data parsed from a supplier's CSV/Excel.
2. EXISTING PRODUCTS: A list of products currently in our database.

Your task is to analyze the RAW IMPORT ROWS and:
1. Identify the semantic columns for Product Name, Price, and SKU in the raw data, even if they have weird names (e.g. "Desc", "Costo", "Cod.").
2. Compare the raw rows against the EXISTING PRODUCTS.
3. Identify which raw rows represent completely NEW products that don't exist in our DB. Match them based on name similarity or SKU.
4. Identify which raw rows represent an EXISTING product, but the price in the raw row is different from our DB price.

RAW IMPORT ROWS (First 100 max):
${JSON.stringify(sampleRows, null, 2)}

EXISTING PRODUCTS (Sample):
${JSON.stringify(sampleExisting, null, 2)}

Return a JSON object strictly matching this schema:
{
  "mapping": {
    "nameCol": "exact name of the column containing the product name",
    "priceCol": "exact name of the column containing the price",
    "skuCol": "exact name of the column containing the sku/code (or null if none)"
  },
  "newProducts": [
    {
      "name": "Extracted name",
      "price": 12.99,
      "sku": "Extracted sku or generated one"
    }
  ],
  "priceChanges": [
    {
      "id": "existing product id",
      "productName": "existing product name",
      "oldPrice": 10.0,
      "newPrice": 12.99
    }
  ]
}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mapping: {
                type: Type.OBJECT,
                properties: {
                  nameCol: { type: Type.STRING },
                  priceCol: { type: Type.STRING },
                  skuCol: { type: Type.STRING, nullable: true }
                }
              },
              newProducts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    sku: { type: Type.STRING }
                  }
                }
              },
              priceChanges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    productName: { type: Type.STRING },
                    oldPrice: { type: Type.NUMBER },
                    newPrice: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ["mapping", "newProducts", "priceChanges"]
          }
        }
      });

      const parsedResponse = JSON.parse(response.text);

      // Construct the final object expected by the UI
      return {
        mapping: parsedResponse.mapping,
        summary: {
          totalRows: rows.length,
          newProducts: parsedResponse.newProducts.length,
          priceChanges: parsedResponse.priceChanges.length
        },
        newProducts: parsedResponse.newProducts,
        priceChanges: parsedResponse.priceChanges
      };
    } catch (error) {
      console.error("AtlasImportAgent Error:", error);
      throw new Error("Failed to process data with Atlas AI. Ensure your API key is valid and you have quota.");
    }
  }
};
