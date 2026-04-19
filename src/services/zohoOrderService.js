/**
 * ZOHO BOOKS GATEWAY - ANTIGRAVITY VERSION
 * Optimizado para movilidad y resiliencia de datos.
 */

// Simulación de una cola de sincronización para evitar cuelgues (Offline-First)
const PENDING_SYNC_KEY = 'regen_pending_zoho_orders';

/**
 * Genera una Sales Order en Zoho Books.
 * Utiliza una arquitectura desacoplada para prevenir bloqueos en el UI móvil.
 */
export const generateZohoSalesOrder = async (protocolData, patientContext) => {
  // 1. Validación Pre-flight (Evita llamadas si faltan datos críticos)
  if (!protocolData?.costData || !patientContext) {
    throw new Error('Incomplete protocol data for Sales Order generation.');
  }

  const { costData, version } = protocolData;
  const { primaryCondition, patientType } = patientContext;

  try {
    // 2. Preparación de Payload (Lógica pesada fuera del loop de render)
    const lineItems = costData.aggregateVials.map(vial => ({
      item_name: vial.name.toUpperCase(), // Estándar de inventario
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

    // 3. Simulación de Llamada con Timeout y AbortController (Resiliencia Mobile)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s max wait

    console.log("🚀 Prepared Zoho Payload:", zohoPayload);

    // TODO: Cuando tengas las credenciales, cambia este bloque por:
    // const response = await fetch(ZOHO_CLOUD_FUNCTION_URL, { method: 'POST', body: JSON.stringify(zohoPayload), signal: controller.signal });

    await new Promise(resolve => setTimeout(resolve, 1200)); // Latencia simulada
    clearTimeout(timeout);

    // 4. Respuesta Exitosa
    return {
      success: true,
      salesorder_id: `SO-GEN-${Math.floor(Math.random() * 100000)}`,
      status: "draft_validated",
      total: costData.totalEstimatedCost,
      syncTime: new Date().toISOString(),
      message: "Order queued and validated for Zoho Books."
    };

  } catch (error) {
    // 5. Manejo de Fallos (No se cuelga, se guarda localmente)
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
 * Guarda el pedido en el dispositivo si la red falla.
 */
function saveToOfflineQueue(data) {
  const existing = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]');
  existing.push({ id: Date.now(), data });
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(existing));
}