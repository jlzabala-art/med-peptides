"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.reconcileSupplierInvoice = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { rfqId, storagePath } = request.data;
    if (!rfqId || !storagePath) {
      throw new HttpsError("invalid-argument", "Missing rfqId or storagePath.");
    }

    const db = getFirestore();
    const bucket = getStorage().bucket();

    try {
      // 1. Fetch original RFQ to know what we are matching against
      const rfqDoc = await db.collection("agency_rfqs").doc(rfqId).get();
      if (!rfqDoc.exists) throw new HttpsError("not-found", "RFQ not found.");
      const rfqData = rfqDoc.data();

      // 2. Download Invoice PDF
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      if (!exists) throw new HttpsError("not-found", "Invoice PDF not found in storage.");
      const [buffer] = await file.download();
      const base64Data = buffer.toString("base64");

      // 3. Setup Gemini
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY missing");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const rfqItemsString = JSON.stringify(rfqData.items.map(i => ({
        name: i.peptide_name,
        expected_qty: i.quantity,
        expected_unit_cost: i.supplierUnitCost
      })));

      const systemInstruction = `You are an expert financial auditor performing a 3-way match.
You are given a Supplier Invoice (PDF) and the original Request For Quote (JSON) data.
Extract the line items from the invoice. Compare them STRICTLY to the expected RFQ items.

Expected RFQ Items:
${rfqItemsString}

Task:
1. Extract every line item from the invoice PDF (Name, Quantity, Unit Price).
2. Match it against the expected RFQ items.
3. Flag discrepancies if the invoice quantity or unit price differs from the expected values.
4. Flag missing items (in RFQ but not in invoice) or extra items (in invoice but not in RFQ).

Return a strict JSON object with this exact structure:
{
  "total_invoice_amount": number,
  "discrepancies_found": boolean,
  "items": [
    {
      "invoice_name": "Name on invoice",
      "rfq_name": "Matched name from RFQ (or null if extra)",
      "invoice_qty": number,
      "rfq_qty": number,
      "invoice_unit_cost": number,
      "rfq_unit_cost": number,
      "qty_match": boolean,
      "price_match": boolean
    }
  ],
  "missing_from_invoice": ["Item name 1"]
}
Do NOT wrap the JSON in markdown code blocks.`;

      const payload = {
        contents: [{ role: "user", parts: [{ inlineData: { mimeType: "application/pdf", data: base64Data } }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new HttpsError("internal", "Gemini API Error: " + errText);
      }

      const responseData = await response.json();
      const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanText);
      }

      // 4. Determine final status
      const status = parsed.discrepancies_found ? "DISCREPANCY_FLAGGED" : "RECONCILED";

      // 5. Save reconciliation result to RFQ document
      await db.collection("agency_rfqs").doc(rfqId).update({
        status: status,
        invoiceReconciliation: parsed,
        invoicePdfUrl: storagePath,
        updatedAt: FieldValue.serverTimestamp()
      });

      return { success: true, status, reconciliation: parsed };

    } catch (err) {
      console.error(err);
      throw new HttpsError("internal", err.message);
    }
  }
);
