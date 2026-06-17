const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

/**
 * Endpoint para recibir Webhooks desde Zoho Books
 * Zoho Books enviará un POST request cuando ocurran eventos como:
 * - Invoice Created/Updated/Deleted
 * - Bill Created/Updated/Deleted
 * - Customer Payment
 */
exports.zohoWebhooks = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const payload = req.body;
    console.info("zoho_webhook_received", payload);

    const db = getFirestore();

    // The structure of the payload depends on how the webhook is configured in Zoho.
    // Assuming standard JSON payload with a module and action identifier.
    const module = payload.module; // e.g., 'invoice', 'bill', 'customerpayment'
    const action = payload.action; // e.g., 'created', 'edited', 'status_changed'
    
    // Si no viene estructura estándar, intentamos inferir.
    const entity = payload.invoice || payload.bill || payload.customerpayment;
    
    if (entity) {
      if (payload.invoice) {
        // Find internal Sales Order by Zoho Invoice ID (or linked document number)
        const q = db.collection('b2b_sales_orders').where('zohoInvoiceId', '==', entity.invoice_id);
        const snap = await q.get();
        if (!snap.empty) {
          const docRef = snap.docs[0].ref;
          await docRef.update({
            paymentStatus: entity.status, // e.g., 'paid', 'partially_paid'
            updatedAt: new Date()
          });
          console.info("zoho_invoice_synced", { id: docRef.id, status: entity.status });
        }
      } else if (payload.bill) {
        // Find internal Purchase Order by Zoho Bill ID
        const q = db.collection('purchaseOrders').where('zohoBillId', '==', entity.bill_id);
        const snap = await q.get();
        if (!snap.empty) {
          const docRef = snap.docs[0].ref;
          await docRef.update({
            paymentStatus: entity.status,
            updatedAt: new Date()
          });
          console.info("zoho_bill_synced", { id: docRef.id, status: entity.status });
        }
      }
    }

    // Always return 200 OK to Zoho to acknowledge receipt
    res.status(200).send({ success: true, message: "Webhook processed successfully." });

  } catch (error) {
    console.error("zoho_webhook_error", { error: error.message, stack: error.stack });
    // Still return 200 so Zoho doesn't retry infinitely on non-recoverable errors
    res.status(200).send({ success: false, message: error.message });
  }
});
