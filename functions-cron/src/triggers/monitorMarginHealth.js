const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");

exports.monitorMarginHealth = onDocumentUpdated("products/{productId}", async (event) => {
  const newValue = event.data.after.data();
  const previousValue = event.data.before.data();

  // We are only interested if the supplier cost (COGS) increased by at least $5.
  const oldCogs = previousValue.cogs || previousValue.supplier_cost || previousValue.cost || 0;
  const newCogs = newValue.cogs || newValue.supplier_cost || newValue.cost || 0;
  
  if (newCogs <= oldCogs || newCogs === 0 || (newCogs - oldCogs) < 5) {
    return null; // Margin hasn't worsened significantly due to COGS increase
  }

  const currentPrice = newValue.price || newValue.retail_price || 0;
  if (currentPrice === 0) return null;

  // Calculate current margin
  const currentMargin = (currentPrice - newCogs) / currentPrice;
  const targetMargin = 0.30; // 30% Target EBITDA/Gross margin for pricing

  if (currentMargin >= targetMargin) {
    return null; // Margin is still acceptable despite COGS increase
  }

  console.log(`[MarginAlert] ${newValue.name} COGS increased from $${oldCogs} to $${newCogs}. Current Margin: ${(currentMargin*100).toFixed(1)}%`);

  // Calculate required price to hit target margin
  // Margin = (Price - COGS) / Price => Price = COGS / (1 - Margin)
  const requiredPrice = newCogs / (1 - targetMargin);

  // Generate an alert in the financial_approvals queue for the CFO
  const db = getFirestore();
  const alertData = {
    type: "margin_risk",
    status: "pending",
    created_at: new Date().toISOString(),
    product_id: event.params.productId,
    product_name: newValue.name || "Unknown Product",
    old_cogs: oldCogs,
    new_cogs: newCogs,
    current_price: currentPrice,
    current_margin_percent: (currentMargin * 100).toFixed(2),
    target_margin_percent: (targetMargin * 100).toFixed(2),
    recommended_price: requiredPrice.toFixed(2),
    reason: `Supplier cost increased by $${(newCogs - oldCogs).toFixed(2)}. Adjust price to $${requiredPrice.toFixed(2)} to maintain ${targetMargin * 100}% margin.`,
    requires_cfo_action: true
  };

  await db.collection("financial_approvals").add(alertData);
  console.log(`[MarginAlert] Alert created in financial_approvals queue for CFO review.`);
  
  return null;
});
