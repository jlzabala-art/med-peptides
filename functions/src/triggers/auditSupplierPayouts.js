const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");

exports.auditSupplierPayouts = onDocumentCreated("payouts/{payoutId}", async (event) => {
  const payout = event.data.data();
  const payoutId = event.params.payoutId;

  // We are looking for an attached invoice, receipt, or tax document
  const hasInvoice = !!payout.invoice_url || !!payout.receipt_url || !!payout.document_id;

  if (hasInvoice) {
    console.log(`[AuditSupplierPayouts] Payout ${payoutId} has attached documentation. Compliant.`);
    return null;
  }

  console.warn(`[AuditSupplierPayouts] Payout ${payoutId} is missing an invoice. Flagging for compliance.`);

  const db = getFirestore();

  // Update payout status to blocked
  await db.collection("payouts").doc(payoutId).update({
    status: "blocked_compliance",
    compliance_audit_at: new Date().toISOString()
  });

  // Create an alert for the CFO
  const alertData = {
    type: "compliance_audit",
    status: "pending",
    created_at: new Date().toISOString(),
    payout_id: payoutId,
    payee_name: payout.payee_name || "Unknown Payee",
    amount: payout.amount || 0,
    reason: `Missing invoice/receipt for payout of $${payout.amount || 0}. Payment blocked pending documentation upload.`,
    requires_cfo_action: true
  };

  await db.collection("financial_approvals").add(alertData);

  return null;
});
