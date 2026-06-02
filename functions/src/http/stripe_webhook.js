const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      // Fallback for testing without signature verification if no secret is set
      event = req.body;
    }
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getFirestore();

  try {
    // Phase 4: Bank Feed Reconciliation Logic
    if (event.type === "payout.paid") {
      const payout = event.data.object;
      
      // Look up expected payout in our financial_approvals or orders
      // For this example, we compare the payout amount to the expected amount
      // If there is a mismatch, we create an anomaly in the approvals queue
      
      // Assume we check Zoho Books or a 'pending_payouts' collection
      // Mocking exception detection:
      const isMismatch = payout.amount > 500000; // E.g., over $5000 triggers an anomaly for demo

      if (isMismatch) {
        await db.collection("financial_approvals").add({
          type: "reconciliation_anomaly",
          status: "pending",
          requestor: "System API (Stripe)",
          amount: payout.amount / 100, // Convert from cents
          currency: payout.currency,
          reason: `Stripe payout ${payout.id} exceeded expected bounds or mismatched Zoho Books invoice. Please review.`,
          metadata: {
            stripePayoutId: payout.id,
            destination: payout.destination
          },
          createdAt: new Date().toISOString()
        });
        console.log(`Anomaly flagged for payout ${payout.id}`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});
