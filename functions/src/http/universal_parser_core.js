const { GoogleGenAI } = require('@google/genai');

async function executeUniversalParse(filePath, mimeType, context, aiInstructions, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = "";
  if (context === "RFQ") {
    systemInstruction = `You are a highly advanced Clinical Supply Chain AI expert. Your task is to rigorously extract requested items, dosages, quantities, and units from the provided Request for Quote (RFQ) or purchase order document.
Rules:
1. Identify all peptides, medical supplies, and biological products.
2. Extract the exact 'dosage' (e.g., 5mg, 10mg, 30ml) if specified. If not, return null.
3. Extract the 'quantity' as an integer.
4. Extract the 'units' precisely (e.g., vials, kits, boxes, pcs, mg). If not specified, infer based on context or return "units".
5. 'original_text' MUST contain the exact raw string line from the document where you found this item, to allow for human auditing.
6. Provide a 'confidence_score' (integer 0-100) reflecting how certain you are of the extracted values based on the original document's clarity and formatting.
Output a JSON array of objects: { "original_text": "str", "peptide_name": "str", "dosage": "str|null", "quantity": number, "units": "str", "confidence_score": number }. Return ONLY a valid JSON array.`;
  } else if (context === "PriceList") {
    systemInstruction = `You are a B2B Catalog and Pricing AI expert. Your task is to meticulously extract the price list catalog from the provided document (PDF, Image, or Excel).
Rules:
1. Identify every unique product/peptide being sold.
2. Extract the 'dosage' or 'specification' (e.g., 5mg, 10 IU, 100g). If none, return null.
3. Extract the 'unit_cost' as a precise floating-point number. Strip currency symbols. If there are volume tiers, extract the lowest/base tier.
4. Extract the 'moq' (Minimum Order Quantity) as an integer. If not stated, assume 1.
5. 'original_text' MUST contain the exact raw text line to allow humans to audit the extraction.
6. Provide a 'confidence_score' (integer 0-100) reflecting how certain you are of the extracted values based on the original document's clarity and formatting.
Output a JSON array of objects: { "original_text": "str", "peptide_name": "str", "dosage": "str|null", "unit_cost": number, "moq": number, "confidence_score": number }. Return ONLY a valid JSON array.`;
  } else if (context === "COA") {
    systemInstruction = `You are an elite Quality Assurance AI. Your task is to rigorously extract batch validation details from the provided Certificate of Analysis (COA).
Rules:
1. Locate the precise 'batch_number' or 'lot_number'. This is critical for compliance.
2. Identify the 'peptide_name' or product name.
3. Extract the 'purity_percentage' as a floating-point number (e.g., 99.8). Strip the % sign.
4. Extract 'manufacture_date' and 'expiration_date' strictly in "YYYY-MM-DD" format. If day is missing, use "YYYY-MM-01".
5. Summarize 'test_results' briefly (e.g., "Pass - HPLC > 99%, MS conforms").
6. Provide a 'confidence_score' (integer 0-100) reflecting how certain you are of the extracted values based on the original document's clarity and formatting.
Output a JSON array of objects: { "batch_number": "str", "peptide_name": "str", "purity_percentage": number, "manufacture_date": "YYYY-MM-DD|null", "expiration_date": "YYYY-MM-DD|null", "test_results": "str", "confidence_score": number }. Return ONLY a valid JSON array.`;
  } else if (context === "Invoice") {
    systemInstruction = `You are a specialized Financial Data Extraction AI. Your task is to extract invoice or bill details from the provided document to integrate with Zoho Books.
Rules:
1. Identify if it is a Supplier Bill (money you owe) or Customer Invoice (money owed to you). Return 'type' as "Bill" or "Invoice".
2. Extract 'vendor_name' or 'customer_name' (the other party).
3. Extract 'invoice_number' or 'bill_number'.
4. Extract 'date' and 'due_date' in "YYYY-MM-DD".
5. Extract 'total_amount' as a number (strip currencies).
6. Extract 'currency' (e.g. USD, EUR, AED).
7. Extract 'line_items' as an array of objects: { "description": "str", "quantity": number, "rate": number, "amount": number }.
8. Provide a 'confidence_score' (integer 0-100).
Output a JSON array containing a SINGLE object representing the invoice: { "type": "str", "entity_name": "str", "invoice_number": "str", "date": "YYYY-MM-DD", "due_date": "YYYY-MM-DD", "total_amount": number, "currency": "str", "line_items": [...], "confidence_score": number }. Return ONLY a valid JSON array.`;
  } else if (context === "Auto") {
    systemInstruction = `You are a highly advanced Medical & B2B Supply Chain AI expert. Your task is to FIRST classify the provided document into one of the following types: 'PriceList', 'COA' (Certificate of Analysis), 'Invoice', 'RFQ' (Request for Quote), or 'ProductLabel'.
If you are unsure, classify it as 'Unknown'.

Once classified, extract the data according to these rules:

1. For 'PriceList': Identify products, dosages, and prices. Return an array of objects: { "peptide_name": "str", "dosage": "str|null", "unit_cost": number, "moq": number }
2. For 'COA': Identify batch validation details. Return an array of objects: { "batch_number": "str", "peptide_name": "str", "purity_percentage": number, "test_results": "str" }
3. For 'Invoice': Identify the invoice details. Return an array containing ONE object: { "type": "str", "entity_name": "str", "total_amount": number, "line_items": [{description, quantity, rate, amount}] }
4. For 'RFQ': Identify requested items. Return an array of objects: { "peptide_name": "str", "dosage": "str|null", "quantity": number, "units": "str" }

You MUST output ONLY a valid JSON object matching this exact schema:
{
  "detectedType": "PriceList" | "COA" | "Invoice" | "RFQ" | "ProductLabel" | "Unknown",
  "confidence": number,
  "data": [ ... extracted data objects based on the rules above ... ]
}`;
  } else {
    throw new Error("Invalid context. Allowed: RFQ, PriceList, COA, Invoice, Auto");
  }

  if (aiInstructions && aiInstructions.trim() !== '') {
    systemInstruction += `\n\nUSER CUSTOM INSTRUCTIONS:\n${aiInstructions}`;
  }

  let uploadedFile;
  try {
    uploadedFile = await ai.files.upload({
      file: filePath,
      config: { mimeType }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          fileData: {
            fileUri: uploadedFile.uri,
            mimeType: uploadedFile.mimeType
          }
        },
        { text: "Extract the data according to the system instructions." }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    let parsed = [];
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    }

    return parsed;
  } finally {
    if (uploadedFile && uploadedFile.name) {
      await ai.files.delete({ name: uploadedFile.name }).catch(err => console.error("Failed to delete file:", err));
    }
  }
}

module.exports = { executeUniversalParse };
