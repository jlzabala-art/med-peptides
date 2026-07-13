const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
// Ensure admin is initialized elsewhere or safely here
if (!admin.apps.length) admin.initializeApp();

/**
 * Simple AI placeholder for supplier module.
 * In a real implementation you would call Gemini / Vertex AI here.
 */
exports.supplierAiAssistant = onRequest(async (req, res) => {
  // Allow only POST for safety
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  const { type, supplierId } = req.body || {};
  let suggestion = '';
  if (type === 'inventory') {
    suggestion = `Based on recent sales data, consider restocking high‑demand SKUs for supplier ${supplierId}.`;
  } else if (type === 'shipping') {
    suggestion = `Shipment delays detected for supplier ${supplierId}. Review carrier performance and consider alternative routes.`;
  } else {
    suggestion = 'Welcome to the Supplier AI Assistant. Choose a feature to get suggestions.';
  }
  // Return a simple JSON response
  res.json({ suggestion, confidence: 0.95 });
});
