/**
 * Payment Link Email Template
 * 
 * Generates an HTML email for sending a Stripe Payment Link to a patient/clinic.
 * 
 * @param {string} orderId - The ID of the order.
 * @param {number} totalAmount - The total amount to be paid.
 * @param {string} currency - The currency (e.g. 'USD', 'EUR').
 * @param {string} paymentLink - The Stripe checkout session URL.
 * @returns {string} - HTML email string.
 */
function paymentLinkTemplate(orderId, totalAmount, currency, paymentLink) {
  const shortOrderId = orderId.slice(-6).toUpperCase();
  const formattedAmount = Number(totalAmount).toFixed(2);
  const upperCurrency = currency.toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #003666; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; }
    .content p { font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
    .order-details { background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 24px; }
    .order-details p { margin: 8px 0; font-size: 15px; color: #334155; }
    .order-details strong { color: #0f172a; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Regenpept</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Your payment link for the recent order is now ready. Please review the details below and proceed to our secure checkout gateway.</p>
      
      <div class="order-details">
        <p><strong>Order Reference:</strong> #${shortOrderId}</p>
        <p><strong>Total Amount Due:</strong> $${formattedAmount} ${upperCurrency}</p>
        <p><strong>Status:</strong> Awaiting Payment</p>
      </div>

      <div class="button-container">
        <a href="${paymentLink}" class="button">Pay Now</a>
      </div>

      <p style="font-size: 14px; color: #64748b;">If the button above does not work, you can copy and paste the following link into your browser:</p>
      <p style="font-size: 14px; color: #3b82f6; word-break: break-all;">${paymentLink}</p>
      
      <p>Thank you for choosing Regenpept.</p>
    </div>
    <div class="footer">
      <p>Regenpept Medical Team</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = paymentLinkTemplate;
