/**
 * submitBulkOrder.js
 * Cloud Function (v2 HTTP) — Wholesaler Bulk Order Submission
 *
 * Called when a wholesaler submits their bulk order draft.
 * This function:
 *   1. Reads all referenced orders + prescriptions from Firestore
 *   2. Aggregates items (deduplicates by productId/protocolId, sums quantities)
 *   3. Marks aggregated_items in the bulk_order doc
 *   4. Updates status → 'submitted' with a timeline event
 *   5. Marks referenced prescriptions as 'added_to_bulk'
 *   6. Marks referenced orders with bulkOrderId reference
 *   7. Writes to admin_notifications so admin dashboard picks it up
 *
 * Auth: Bearer token required. Must be role = 'wholesaler'.
 */

"use strict";

const { onRequest }       = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth }         = require("firebase-admin/auth");

// ── Helper: verify Firebase auth token ───────────────────────────────────────
async function verifyToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) throw new Error("Missing auth token");
  const token = authHeader.split("Bearer ")[1];
  return getAuth().verifyIdToken(token);
}

// ── Aggregate items from multiple sources ─────────────────────────────────────
function aggregateItems(orders, prescriptions, ownItems) {
  const map = new Map(); // key: `${type}__${id}`

  const addItems = (items, source) => {
    for (const item of items || []) {
      const key = `${item.type || "product"}__${item.productId || item.id}`;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += Number(item.quantity) || 0;
        existing.sources.push({ ...source, quantity: Number(item.quantity) || 0 });
      } else {
        map.set(key, {
          type:     item.type || "product",
          id:       item.productId || item.id,
          name:     item.name || item.productName || "",
          sku:      item.sku || item.variantSku || "",
          unit:     item.unit || "vials",
          quantity: Number(item.quantity) || 0,
          sources:  [{ ...source, quantity: Number(item.quantity) || 0 }],
        });
      }
    }
  };

  // From patient B2C orders
  for (const order of orders) {
    addItems(order.items || order.lineItems || [], {
      type:        "order",
      sourceId:    order.id,
      patientName: order.customerName || order.userName || "",
      doctorName:  null,
    });
  }

  // From doctor prescriptions
  for (const rx of prescriptions) {
    addItems(rx.items || [], {
      type:        "prescription",
      sourceId:    rx.id,
      patientName: rx.patient?.name || "",
      doctorName:  rx.doctorName || "",
    });
  }

  // Wholesaler's own items
  for (const item of ownItems || []) {
    const key = `${item.type || "product"}__${item.id}`;
    if (map.has(key)) {
      const existing = map.get(key);
      existing.quantity += Number(item.quantity) || 0;
      existing.sources.push({ type: "own", sourceId: null, patientName: null, doctorName: null, quantity: Number(item.quantity) || 0 });
    } else {
      map.set(key, {
        type:     item.type || "product",
        id:       item.id,
        name:     item.name || "",
        sku:      item.sku || "",
        unit:     item.unit || "vials",
        quantity: Number(item.quantity) || 0,
        sources:  [{ type: "own", sourceId: null, patientName: null, doctorName: null, quantity: Number(item.quantity) || 0 }],
      });
    }
  }

  return Array.from(map.values());
}

// ── Main CF ───────────────────────────────────────────────────────────────────
exports.submitBulkOrder = onRequest(
  { cors: true, region: "europe-west1" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const db = getFirestore();

    try {
      // ── 1. Auth verification ──────────────────────────────────────────────
      const decoded = await verifyToken(req);
      const uid     = decoded.uid;

      // Verify wholesaler role in Firestore
      const userSnap = await db.collection("users").doc(uid).get();
      if (!userSnap.exists || userSnap.data().role !== "wholesaler") {
        return res.status(403).json({ error: "Access denied: wholesaler role required" });
      }

      const { bulkOrderId, notes } = req.body || {};
      if (!bulkOrderId) return res.status(400).json({ error: "bulkOrderId is required" });

      // ── 2. Load the bulk order doc ────────────────────────────────────────
      const bulkRef  = db.collection("bulk_orders").doc(bulkOrderId);
      const bulkSnap = await bulkRef.get();

      if (!bulkSnap.exists) return res.status(404).json({ error: "Bulk order not found" });
      const bulk = { id: bulkOrderId, ...bulkSnap.data() };

      if (bulk.wholesalerId !== uid) return res.status(403).json({ error: "Not your bulk order" });
      if (bulk.status !== "draft") return res.status(409).json({ error: `Cannot submit: status is '${bulk.status}'` });

      // ── 3. Load referenced orders ─────────────────────────────────────────
      const orderIds = bulk.source_order_ids || [];
      const rxIds    = bulk.source_prescription_ids || [];

      const [ordersData, rxData] = await Promise.all([
        Promise.all(orderIds.map(id => db.collection("orders").doc(id).get())),
        Promise.all(rxIds.map(id => db.collection("prescriptions").doc(id).get())),
      ]);

      const orders       = ordersData.filter(s => s.exists).map(s => ({ id: s.id, ...s.data() }));
      const prescriptions = rxData.filter(s => s.exists).map(s => ({ id: s.id, ...s.data() }));

      // ── 4. Compute aggregated items ───────────────────────────────────────
      const aggregated_items = aggregateItems(orders, prescriptions, bulk.own_items || []);

      const totalQuantity = aggregated_items.reduce((sum, i) => sum + i.quantity, 0);

      // ── 5. Build timeline event ───────────────────────────────────────────
      const event = {
        event:     "submitted",
        actorId:   uid,
        actorRole: "wholesaler",
        note:      notes || "",
        timestamp: new Date().toISOString(),
      };

      // ── 6. Batch write ────────────────────────────────────────────────────
      const batch = db.batch();

      // Update the bulk order
      batch.update(bulkRef, {
        status:           "submitted",
        aggregated_items,
        totalItems:       totalQuantity,
        submittedAt:      FieldValue.serverTimestamp(),
        updatedAt:        FieldValue.serverTimestamp(),
        notes:            notes || bulk.notes || "",
        timeline:         FieldValue.arrayUnion(event),
      });

      // Mark referenced prescriptions as added_to_bulk
      for (const rx of prescriptions) {
        const rxRef = db.collection("prescriptions").doc(rx.id);
        batch.update(rxRef, {
          status:      "added_to_bulk",
          bulkOrderId: bulkOrderId,
          updatedAt:   FieldValue.serverTimestamp(),
          timeline:    FieldValue.arrayUnion({
            event: "added_to_bulk", actorId: uid, actorRole: "wholesaler",
            note: `Incluida en bulk order ${bulkOrderId}`, timestamp: new Date().toISOString(),
          }),
        });
      }

      // Mark referenced patient orders with bulkOrderId
      for (const order of orders) {
        const orderRef = db.collection("orders").doc(order.id);
        batch.update(orderRef, {
          bulkOrderId: bulkOrderId,
          updatedAt:   FieldValue.serverTimestamp(),
        });
      }

      // ── 7. Admin notification ─────────────────────────────────────────────
      const notifRef = db.collection("admin_notifications").doc();
      batch.set(notifRef, {
        type:          "bulk_order_submitted",
        title:         "Nuevo Bulk Order B2B",
        body:          `${userSnap.data().firstName || "Wholesaler"} ha enviado un pedido bulk con ${aggregated_items.length} líneas (${totalQuantity} unidades totales).`,
        bulkOrderId,
        wholesalerId:  uid,
        wholesalerName: `${userSnap.data().firstName || ""} ${userSnap.data().lastName || ""}`.trim(),
        status:        "unread",
        createdAt:     FieldValue.serverTimestamp(),
      });

      await batch.commit();

      // ── 8. Collect doctor IDs to notify (future: send email) ─────────────
      const doctorIds = [...new Set(prescriptions.map(rx => rx.doctorId).filter(Boolean))];
      // TODO: Send push/email notification to each doctor

      return res.json({
        success:          true,
        bulkOrderId,
        aggregated_items,
        totalItems:       totalQuantity,
        prescriptionsIncluded: prescriptions.length,
        ordersIncluded:   orders.length,
        doctorIds,
        message:          "Bulk order submitted successfully. Admin has been notified.",
      });

    } catch (err) {
      console.error("[submitBulkOrder]", err);
      return res.status(err.code === "auth/argument-error" ? 401 : 500).json({ error: err.message });
    }
  }
);
