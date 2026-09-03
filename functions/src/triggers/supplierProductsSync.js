const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Trigger que se ejecuta cada vez que hay una escritura en la colección `products`.
 * Mantiene sincronizado el contador `productsSupplied` del proveedor.
 */
exports.syncProductsSupplied = onDocumentWritten(
  {
    document: "products/{productId}",
    region: "europe-west1",
    secrets: [] // If no secrets required
  },
  async (event) => {
    const db = getFirestore();
    const batch = db.batch();
    
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    const getSupplierId = (data) => data?.supplierId;

    const oldSupplierId = getSupplierId(beforeData);
    const newSupplierId = getSupplierId(afterData);

    // Evaluamos si cuenta como "supplied" o "out of stock"
    const isOutOfStock = (data) => data?.stock_status === 'out_of_stock';
    const oldOutOfStock = isOutOfStock(beforeData);
    const newOutOfStock = isOutOfStock(afterData);

    const applyCount = async (supplierId, countDelta, oosDelta) => {
      const docRef = db.collection("wholesellers").doc(supplierId);
      const updates = {};
      if (countDelta !== 0) updates.productsSupplied = FieldValue.increment(countDelta);
      if (oosDelta !== 0) updates.outOfStockProducts = FieldValue.increment(oosDelta);
      if (Object.keys(updates).length > 0) {
        batch.set(docRef, updates, { merge: true });
      }
    };

    // Caso 1: Se eliminó un producto
    if (!event.data.after.exists && oldSupplierId) {
      await applyCount(oldSupplierId, oldOutOfStock ? 0 : -1, oldOutOfStock ? -1 : 0);
    }
    
    // Caso 2: Se creó un nuevo producto
    else if (!event.data.before.exists && newSupplierId) {
      await applyCount(newSupplierId, newOutOfStock ? 0 : 1, newOutOfStock ? 1 : 0);
    }
    
    // Caso 3: El producto fue actualizado (puede cambiar de proveedor o de estado de stock)
    else if (event.data.before.exists && event.data.after.exists) {
      if (oldSupplierId !== newSupplierId) {
        if (oldSupplierId) {
          await applyCount(oldSupplierId, oldOutOfStock ? 0 : -1, oldOutOfStock ? -1 : 0);
        }
        if (newSupplierId) {
          await applyCount(newSupplierId, newOutOfStock ? 0 : 1, newOutOfStock ? 1 : 0);
        }
      } else if (oldSupplierId && oldOutOfStock !== newOutOfStock) {
        // Mismo proveedor, cambió el stock_status
        if (newOutOfStock) {
          // Se quedó sin stock
          await applyCount(oldSupplierId, -1, 1);
        } else {
          // Volvió a tener stock
          await applyCount(oldSupplierId, 1, -1);
        }
      }
    }

    // Ejecutar todas las operaciones atómicamente si hay algo en el batch
    if (batch._mutations && batch._mutations.length > 0) {
        await batch.commit();
    }
    
    return null;
  }
);

