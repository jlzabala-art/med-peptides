const { GoogleGenAI } = require("@google/genai");

async function threeWayMatch(apiKey, poData, billData) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing or empty");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an AI financial auditor. Compare the following Purchase Order (PO) and Supplier Bill.
    Identify any discrepancies in item names, quantities, unit prices, or total amounts.
    Return a strict JSON response matching this schema:
    {
      "confidenceScore": 95, 
      "discrepancies": ["list of strings detailing discrepancies, or empty if perfect match"],
      "recommendation": "Approve / Flag for Review / Reject"
    }

    Purchase Order:
    ${JSON.stringify(poData, null, 2)}

    Supplier Bill:
    ${JSON.stringify(billData, null, 2)}
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(result.text);
}

async function analyzeRFQ(apiKey, rfqText) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing or empty");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an AI sales assistant. Analyze the following RFQ (Request for Quotation) email/text from a potential client.
    Extract the requested items, quantities, and customer details.
    Return a strict JSON response matching this schema:
    {
      "customerName": "Extracted Name",
      "customerEmail": "Extracted Email",
      "items": [
        { "name": "Item Name", "quantity": 10, "notes": "Any specifics" }
      ],
      "notes": "Any other context from the email"
    }

    RFQ Text:
    ${rfqText}
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(result.text);
}

module.exports = {
  threeWayMatch,
  analyzeRFQ
};
