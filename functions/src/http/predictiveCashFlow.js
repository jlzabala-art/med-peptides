const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleGenAI } = require("@google/genai");

exports.predictiveCashFlow = onCall({ cors: true, maxInstances: 5 }, async (request) => {
  if (!request.auth || request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only CFO/admin can access predictive models.");
  }

  const db = getFirestore();
  const dbConfig = {
    projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
  };
  
  // 1. Gather historical data from Firestore (simulating BigQuery logic for now)
  const approvalsSnap = await db.collection("financial_approvals")
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const ordersSnap = await db.collection("orders")
    .where("status", "in", ["completed", "delivered"])
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const recentApprovals = approvalsSnap.docs.map(d => d.data());
  const recentOrders = ordersSnap.docs.map(d => d.data());

  // Aggregate current state
  const currentCash = 245600; // From Zoho or global state
  const mrr = 42000;
  
  // 2. Use Gemini AI to forecast next 6 months
  try {
    const ai = new GoogleGenAI({});
    const prompt = `
    You are an expert CFO AI Analyst.
    Current Cash: $${currentCash}
    Current MRR: $${mrr}
    Recent significant outflows (approvals): ${JSON.stringify(recentApprovals.map(a => ({ amount: a.amount, type: a.type })))}
    Recent inflows (orders): ${JSON.stringify(recentOrders.map(o => ({ total: o.total, date: o.createdAt })))}
    
    Based on this data, forecast the cash flow and runway for the next 6 months. 
    Return ONLY a valid JSON object with the following structure:
    {
      "forecast": [
        {"month": "Month 1", "projected_revenue": 0, "projected_expenses": 0, "ending_cash": 0},
        ...
      ],
      "runway_months": 0,
      "risk_factors": ["risk1", "risk2"],
      "recommendations": ["rec1"]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text();
    const resultJson = JSON.parse(resultText);

    return resultJson;

  } catch (error) {
    console.error("AI Forecasting Error:", error);
    throw new HttpsError("internal", "Failed to generate cash flow prediction.");
  }
});
