/**
 * Utility for generating payment links for prescriptions and orders.
 * This can be integrated with Stripe or Zoho Payments.
 */
export async function generatePaymentLink(rxOrOrderData) {
  // Mock logic - to be replaced with actual Stripe/Zoho API call via Cloud Function
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = rxOrOrderData.id || Math.random().toString(36).slice(2, 9);
      resolve(`https://regenpept.checkout.demo/pay/${id}`);
    }, 800);
  });
}
