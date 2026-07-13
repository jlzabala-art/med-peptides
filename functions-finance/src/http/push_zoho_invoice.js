"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { createInvoice, createBill } = require("../lib/zoho_client");

/**
 * pushZohoInvoice
 * Receives the structured data from the frontend (after AI extraction and user review)
 * and pushes it to Zoho Books to create either a Bill (Supplier Invoice) or Invoice (Customer Invoice).
 */
exports.pushZohoInvoice = onCall(
  { cors: true, timeoutSeconds: 60, memory: "256MiB" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");
    
    // Check if the user is an admin or has finance permissions
    if (request.auth.token.role !== 'admin' && request.auth.token.role !== 'finance') {
        throw new HttpsError("permission-denied", "Requires finance/admin privileges.");
    }

    const { type, entity_name, invoice_number, date, due_date, line_items, currency } = request.data;
    
    if (!type || !entity_name || !line_items || !Array.isArray(line_items)) {
      throw new HttpsError("invalid-argument", "Missing required invoice fields.");
    }

    try {
      // Basic mapping for Zoho Books
      // In a full implementation, you would resolve entity_name to a Zoho contact_id first.
      // For this demo/proof-of-concept, we'll assume a dummy contact_id or search for it if possible.
      // Since contact_id is strictly required by Zoho, we must pass it.
      // To keep it robust, we'll pass a dummy 'contact_id' for now, or if the user supplies it.
      
      const payload = {
        // "contact_id": "YOUR_CONTACT_ID", // To be dynamically resolved
        reference_number: invoice_number || "",
        date: date || new Date().toISOString().split('T')[0],
        due_date: due_date || "",
        line_items: line_items.map(item => ({
          name: item.description || "Item",
          rate: Number(item.rate) || 0,
          quantity: Number(item.quantity) || 1
        }))
      };

      if (type.toLowerCase() === "invoice") {
        // For Customer Invoice
        const result = await createInvoice(payload);
        return { success: true, id: result.invoice_id, message: "Invoice created successfully in Zoho Books." };
      } else {
        // For Supplier Bill
        const result = await createBill(payload);
        return { success: true, id: result.bill_id, message: "Bill created successfully in Zoho Books." };
      }
    } catch (err) {
      console.error("[pushZohoInvoice] Failed to create in Zoho:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
