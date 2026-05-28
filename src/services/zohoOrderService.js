 
/**
 * ZOHO BOOKS GATEWAY - ANTIGRAVITY VERSION
 * Optimized for mobility and data resilience.
 */

// Simulation of a synchronization queue to prevent freezes (Offline-First)
const PENDING_SYNC_KEY = 'regen_pending_zoho_orders';

/**
 * Generates a Sales Order in Zoho Books.
 * Uses a decoupled architecture to prevent UI blocking on mobile.
 */
export const generateZohoSalesOrder = async (protocolData, patientContext) => {
  // 1. Pre-flight Validation (Prevents calls if critical data is missing)
  if (!protocolData?.costData || !patientContext) {
    throw new Error('Incomplete protocol data for Sales Order generation.');
  }

  const { costData, version } = protocolData;
  const { primaryCondition, patientType } = patientContext;

  try {
    // 2. Payload Preparation (Heavy logic outside the render loop)
    const lineItems = costData.aggregateVials.map(vial => ({
      item_name: vial.name.toUpperCase(), // Inventory standard
      description: `[RESEARCH ONLY] ${vial.mgPerVial}mg Vial - Protocol v${version}`,
      rate: Number(vial.pricePerVial.toFixed(2)),
      quantity: vial.totalVials,
      item_custom_fields: [
        { label: "Clinical_Condition", value: primaryCondition }
      ]
    }));

    const zohoPayload = {
      customer_id: "ZC_CUST_PENDING",
      date: new Date().toISOString().split('T')[0],
      reference_number: `REF-${Date.now().toString().slice(-6)}`,
      notes: `Generated via Protocol Engine. Type: ${patientType}. Research Use Only.`,
      line_items: lineItems,
    };

    // 3. Call Simulation with Timeout and AbortController (Mobile Resilience)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s max wait

    console.log("🚀 Prepared Zoho Payload:", zohoPayload);

    // TODO: When credentials are available, replace this block with:
    // const response = await fetch(ZOHO_CLOUD_FUNCTION_URL, { method: 'POST', body: JSON.stringify(zohoPayload), signal: controller.signal });

    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulated latency
    clearTimeout(timeout);

    // 4. Successful Response
    return {
      success: true,
      salesorder_id: `SO-GEN-${Math.floor(Math.random() * 100000)}`,
      status: "draft_validated",
      total: costData.totalEstimatedCost,
      syncTime: new Date().toISOString(),
      message: "Order queued and validated for Zoho Books."
    };

  } catch (error) {
    // 5. Failure Handling (Prevents hanging, saves locally)
    console.error("⚠️ Zoho Service Error:", error.name === 'AbortError' ? 'Timeout' : error.message);

    saveToOfflineQueue(protocolData);

    return {
      success: false,
      status: "offline_queued",
      message: "Sync pending. Order saved locally to prevent data loss."
    };
  }
};

/**
 * Saves the order on the device if network fails.
 */
function saveToOfflineQueue(data) {
  const existing = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]');
  existing.push({ id: Date.now(), data });
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(existing));
}