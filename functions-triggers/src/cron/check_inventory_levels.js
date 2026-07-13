"use strict";

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");

exports.checkInventoryLevels = onSchedule("every day 08:00", async (event) => {
  const db = getFirestore();
  
  // 1. Check if the workflow is enabled in the Automation Engine
  const configDoc = await db.collection("system_config").doc("workflows").get();
  if (!configDoc.exists) return;
  
  const workflows = configDoc.data();
  const replenishmentConfig = workflows.replenishment;
  
  if (!replenishmentConfig || !replenishmentConfig.enabled) {
    console.log("Replenishment workflow is disabled. Exiting.");
    return;
  }
  
  const daysToStockoutThreshold = replenishmentConfig.params?.days_to_stockout || 15;
  const autoApprove = replenishmentConfig.params?.auto_approve || false;

  console.log(`Running Replenishment Check. Threshold: ${daysToStockoutThreshold} days.`);

  // 2. Fetch all products to evaluate their inventory levels
  const productsSnap = await db.collection("products").get();
  
  const productsToOrder = [];

  productsSnap.forEach((doc) => {
    const product = doc.data();
    
    // Simplistic burn rate logic (In reality, we'd calculate this from historical orders)
    // For this simulation, let's assume average_daily_sales is tracked on the product
    const currentStock = product.stock || 0;
    const dailyBurnRate = product.average_daily_sales || 1; // Default to 1 if unknown
    
    const estimatedDaysToStockout = currentStock / dailyBurnRate;
    
    if (estimatedDaysToStockout <= daysToStockoutThreshold) {
      productsToOrder.push({
        productId: doc.id,
        name: product.name || 'Unknown Product',
        currentStock,
        dailyBurnRate,
        estimatedDaysToStockout: Math.round(estimatedDaysToStockout),
        suggestedOrderQty: dailyBurnRate * 30 // Suggest ordering 30 days worth of stock
      });
    }
  });

  if (productsToOrder.length === 0) {
    console.log("Inventory levels are healthy. No POs needed.");
    return;
  }

  console.log(`Found ${productsToOrder.length} products needing replenishment.`);

  // 3. Generate Draft PO
  const draftPO = {
    status: autoApprove ? 'APPROVED' : 'DRAFT',
    createdAt: new Date(),
    type: 'AI_REPLENISHMENT',
    items: productsToOrder,
    totalItems: productsToOrder.length
  };

  const poRef = await db.collection("agency_rfqs").add(draftPO);
  
  // 4. Send Alert (Write to system notifications)
  await db.collection("notifications").add({
    type: "AI_ALERT",
    title: "Inventory Alert: Draft PO Generated",
    message: `The Predictive Replenishment agent detected ${productsToOrder.length} items running low. A draft PO has been generated.`,
    link: `/admin/rfq/${poRef.id}`,
    createdAt: new Date(),
    read: false
  });

  console.log("Draft PO generated successfully.");
});
