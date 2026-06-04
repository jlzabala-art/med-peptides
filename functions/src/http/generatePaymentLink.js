const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
// Initialize stripe (if key is not provided in env, we use a placeholder or test key so it doesn't crash)
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_PLACEHOLDER_KEY";
const stripe = require("stripe")(stripeKey);

/**
 * generatePaymentLink
 * 
 * Callable function for Account Managers or Admins to generate a Stripe Checkout Session
 * URL for a specific order.
 */
exports.generatePaymentLink = onCall(async (request) => {
  const { auth, data } = request;

  // 1. Validate Authentication & Authorization
  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  // Ensure the user has permission (admin or wholesaler manager)
  const callerUid = auth.uid;
  const db = getFirestore();
  const callerDoc = await db.collection("users").doc(callerUid).get();
  const callerData = callerDoc.data() || {};
  
  if (callerData.role !== "admin" && callerData.role !== "wholesaler") {
    throw new HttpsError("permission-denied", "Only Account Managers or Admins can generate payment links.");
  }

  const { orderId, currency = "usd", sendEmail = false } = data;

  if (!orderId) {
    throw new HttpsError("invalid-argument", "The orderId parameter is required.");
  }

  // 2. Fetch Order Details
  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    throw new HttpsError("not-found", "Order not found.");
  }

  const orderData = orderDoc.data();
  const totalAmount = orderData.total || orderData.totalPrice || 0;

  if (totalAmount <= 0) {
    throw new HttpsError("failed-precondition", "Order total is zero or invalid. Cannot generate payment link.");
  }

  // 3. Generate Stripe Checkout Session (Test Mode)
  try {
    // Convert to smallest currency unit (e.g. cents for USD/EUR)
    const unitAmount = Math.round(totalAmount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Order #${orderId.slice(-6).toUpperCase()}`,
              description: "Atlas Health Medical Order",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: orderId,
        buyerId: orderData.buyerId || "unknown",
        generatedBy: callerUid
      },
      // Using a placeholder domain since we don't know the exact production URL here
      success_url: `https://atlas-health.com/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `https://atlas-health.com/checkout/cancel?order_id=${orderId}`,
    });

    // 4. Update Firestore Order
    await orderRef.update({
      paymentLink: session.url,
      paymentStatus: "Awaiting Payment",
      status: "Awaiting Payment", // optionally update main status
      paymentCurrency: currency.toUpperCase(),
      updatedAt: new Date()
    });

    // 5. Optionally handle email sending logic
    if (sendEmail) {
      // Create a notification for the patient or send email via NodeMailer
      const notificationRef = db.collection("notifications").doc();
      await notificationRef.set({
        userId: orderData.buyerId,
        title: "Payment Link Generated",
        message: `Your payment link for Order #${orderId.slice(-6).toUpperCase()} is ready. Amount: $${totalAmount} ${currency.toUpperCase()}`,
        type: "payment",
        actionUrl: session.url,
        read: false,
        createdAt: new Date()
      });
      // (Placeholder for actual email template sending)
    }

    return {
      success: true,
      url: session.url,
      message: "Test Payment Link generated successfully",
      testMode: true
    };
  } catch (error) {
    console.error("Stripe Error:", error);
    throw new HttpsError("internal", `Failed to generate payment link: ${error.message}`);
  }
});
