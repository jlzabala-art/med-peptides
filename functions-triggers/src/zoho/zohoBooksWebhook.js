/**
 * zohoBooksWebhook.js
 * Cloud Function (v2 HTTP) — Zoho Books Webhook Receiver
 *
 * Listens for new contact creation events from Zoho Books (contacts.create).
 * Logs contact, classifies type, checks alreadyRegistered status, and caches in pending_zoho_assignments.
 */

"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

exports.zohoBooksWebhook = onRequest(
  { cors: true, region: "europe-west1" },
  async (req, res) => {
    // Zoho Books sometimes sends GET to verify the URL or POST for payloads
    if (req.method === "GET") {
      return res.status(200).send("Webhook endpoint is active and verified.");
    }
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const db = getFirestore();

    try {
      console.log("[Zoho Webhook] Received webhook call:", JSON.stringify(req.body));

      // Parse payload (Zoho Books can send JSONString parameter or direct JSON body)
      let payload = req.body;
      if (req.body && req.body.JSONString) {
        try {
          payload = JSON.parse(req.body.JSONString);
        } catch (e) {
          console.warn("[Zoho Webhook] Failed to parse JSONString parameter:", e.message);
        }
      }

      // Check if this is an Invoice Event
      if (payload?.invoice) {
        const invoice = payload.invoice;
        const invoiceNumber = invoice.invoice_number;
        const status = invoice.status; // e.g., "paid"
        
        console.log(`[Zoho Webhook] Invoice Event received: ${invoiceNumber} is ${status}`);
        
        if (invoiceNumber) {
          const invQuery = await db.collection("b2b_invoices")
            .where("documentNumber", "==", invoiceNumber)
            .limit(1)
            .get();
            
          if (!invQuery.empty) {
            let newStatus = status;
            if (status.toLowerCase() === 'paid') newStatus = 'Paid';
            await invQuery.docs[0].ref.update({
              status: newStatus,
              updatedAt: FieldValue.serverTimestamp()
            });
            console.log(`[Zoho Webhook] Invoice ${invoiceNumber} updated to ${newStatus} in Firestore`);
          }
        }
        
        return res.status(200).json({ success: true, type: "invoice" });
      }

      // Extract contact object (could be nested under contact or top-level)
      const contact = payload?.contact || payload?.contacts?.[0] || payload;

      const contactId = contact?.contact_id || contact?.contactId;
      const email = contact?.email;

      if (!contactId || !email) {
        console.warn("[Zoho Webhook] Payload missing contact_id or email:", JSON.stringify(contact));
        return res.status(400).json({ error: "Missing contact_id or email in payload" });
      }

      const trimmedEmail = email.trim().toLowerCase();
      const contactName = contact.contact_name || contact.display_name || contact.name || "";
      const companyName = contact.company_name || contact.company || "";
      const phone = contact.mobile || contact.phone || "";

      // Classify Corporate vs Private
      const hasCompany = companyName &&
        companyName.trim() !== "" &&
        companyName.toLowerCase() !== contactName.toLowerCase();
      const type = hasCompany ? "corporate" : "private";

      // Check if user already exists in Firebase users collection
      const userQuery = await db.collection("users")
        .where("email", "==", trimmedEmail)
        .limit(1)
        .get();

      const alreadyRegistered = !userQuery.empty;
      let registeredUser = null;
      if (alreadyRegistered) {
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        registeredUser = {
          uid: userDoc.id,
          role: userData.role || null,
          status: userData.status || null,
          name: userData.fullName || userData.displayName || ""
        };
      }

      const zohoLink = `https://books.zoho.me/app#/contacts/${contactId}`;

      const assignmentData = {
        contact_id: contactId,
        name: contactName,
        email: trimmedEmail,
        phone: phone,
        company: companyName,
        type: type,
        address: [
          contact.billing_address?.address || "",
          contact.billing_address?.city || "",
          contact.billing_address?.country || ""
        ].filter(Boolean).join(", "),
        zohoLink: zohoLink,
        status: "pending",
        alreadyRegistered: alreadyRegistered,
        registeredUser: registeredUser,
        createdAt: FieldValue.serverTimestamp()
      };

      // Write to pending_zoho_assignments using contactId as doc ID (idempotent)
      await db.collection("pending_zoho_assignments")
        .doc(contactId)
        .set(assignmentData);

      // Log webhook event for audit trail
      await db.collection("zoho_webhook_events").add({
        contactId,
        email: trimmedEmail,
        action: "create",
        receivedAt: FieldValue.serverTimestamp(),
        payload: payload
      });

      console.log(`[Zoho Webhook] Contact ${contactId} (${trimmedEmail}) queued in pending assignments.`);
      return res.status(200).json({ success: true, contactId: contactId });

    } catch (err) {
      console.error("[Zoho Webhook] Error processing request:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);
