const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Trigger: Update inventory when an order status changes to 'completed'
 */
module.exports = onDocumentUpdated(
  {
    document: "orders/{orderId}",
    region: "us-central1",
  },
  async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();

    // Only proceed if status changed to 'completed'
    if (newValue.status === 'completed' && previousValue.status !== 'completed') {
      const db = getFirestore();
      const items = newValue.items || [];
      const batch = db.batch();

      for (const item of items) {
        if (item.productId && item.variantId && item.quantity) {
          const variantRef = db.collection('products').doc(item.productId).collection('variants').doc(item.variantId);
          batch.update(variantRef, {
            stock: FieldValue.increment(-item.quantity)
          });
        }
      }

      await batch.commit();
      console.log(`[INVENTORY] Deducted stock for completed order: ${event.params.orderId}`);
    }
  }
);
