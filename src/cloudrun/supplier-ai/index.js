const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
admin.initializeApp();
const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * POST /insights
 * Body: { supplierId: string }
 * Returns a shipping insight suggestion.
 */
app.post('/insights', async (req, res) => {
  const { supplierId, type } = req.body || {};
  if (!supplierId) {
    return res.status(400).json({ error: 'supplierId required' });
  }
    // Generate a shipping insight using Gemini AI
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Provide a concise shipping insight for supplier ${supplierId}. Consider carrier performance, delays >48h, and any recommended routing changes.`;
  const result = await model.generateContent(prompt);
  const suggestion = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No insight generated.';
  const confidence = result.usage?.totalTokenCount ? 0.95 : 0.9; // approximate confidence
  const docRef = db.collection('supplier_ai_suggestions').doc();
  await docRef.set({
    supplierId,
    type: type || 'shipping',
    suggestion,
    confidence,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.json({ suggestion, confidence, id: docRef.id });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Supplier AI service listening on port ${port}`);
});
