const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { threeWayMatch, analyzeRFQ } = require("../services/ai.service");

// CORS Configuration
const cors = require("cors")({ origin: true });

exports.threeWayMatching = onRequest({ cors: true }, async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { poId, billId } = req.body;
      if (!poId || !billId) {
        return res.status(400).json({ error: 'Missing poId or billId' });
      }

      const db = getFirestore();
      
      const poDoc = await db.collection("purchaseOrders").doc(poId).get();
      const billDoc = await db.collection("purchaseBills").doc(billId).get();
      
      if (!poDoc.exists) return res.status(404).json({ error: 'PO not found' });
      if (!billDoc.exists) return res.status(404).json({ error: 'Bill not found' });

      const poData = poDoc.data();
      const billData = billDoc.data();
      
      // Perform 3-way match logic using AI
      const apiKey = process.env.GEMINI_API_KEY;
      const result = await threeWayMatch(apiKey, poData, billData);

      // Save AI result to the bill document
      await billDoc.ref.update({
        aiMatchScore: result.confidenceScore,
        aiMatchDiscrepancies: result.discrepancies || [],
        aiMatchRecommendation: result.recommendation || 'Unknown'
      });

      return res.status(200).json({ success: true, result });
    } catch (error) {
      console.error("[3-Way Match Error]", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

exports.analyzeRFQEndpoint = onRequest({ cors: true }, async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { rfqText } = req.body;
      if (!rfqText) {
        return res.status(400).json({ error: 'Missing rfqText' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const result = await analyzeRFQ(apiKey, rfqText);

      return res.status(200).json({ success: true, result });
    } catch (error) {
      console.error("[Analyze RFQ Error]", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
