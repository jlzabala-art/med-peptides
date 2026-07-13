/**
 * clientConfirmation.js
 * HTML email template for the customer who placed the order.
 * Sent automatically when a new order document is created in Firestore.
 */

function buildClientConfirmationHtml(order) {
  // orderId — support both id (from Firestore doc) and explicit orderId field
  const orderId = order.id || order.orderId || '—';

  const {
    createdAt,
    customer = {},
    shippingAddress = {},
    items = [],
    subtotal = 0,
    shipping = 0,
    total = 0,
    currency = 'EUR',
    paymentMethod = '',
    notes = '',
    isGuest = false,
  } = order;

  const fmt = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // createdAt can be a Firestore Timestamp, a JS Date, or an ISO string
  let dateObj;
  if (createdAt && typeof createdAt.toDate === 'function') {
    dateObj = createdAt.toDate(); // Firestore Timestamp
  } else if (createdAt) {
    dateObj = new Date(createdAt);
  } else {
    dateObj = new Date();
  }
  const dateStr = isNaN(dateObj.getTime())
    ? new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
    : dateObj.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const paymentLabel =
    paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
    paymentMethod === 'credit_card'   ? 'Credit / Debit Card' :
    paymentMethod || '—';

  // Payment-specific dynamic content
  const isCard         = paymentMethod === 'credit_card';
  const isBankTransfer = paymentMethod === 'bank_transfer';

  const greetingExtra = isCard
    ? 'We will send you a <strong>secure payment link</strong> by email within 1–2 business days so you can complete your purchase safely online.'
    : isBankTransfer
    ? 'Our team will send you our <strong>bank transfer details</strong> by email within 1–2 business days so you can complete the payment.'
    : 'A specialist from our team will contact you shortly with formal quotation documentation.';

  const nextStepsHtml = isCard ? `
    <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
    <li>You will receive a <strong>secure payment link</strong> via email — no card details are shared over email.</li>
    <li>Once payment is confirmed, we will process your shipment and send tracking information.</li>
  ` : isBankTransfer ? `
    <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
    <li>You will receive an email with our <strong>bank account details</strong> and the reference number to use.</li>
    <li>Once the transfer is confirmed, we will process your shipment and send tracking information.</li>
  ` : `
    <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
    <li>You will receive a formal quotation with pricing and documentation.</li>
    <li>Upon approval, we will provide payment and shipping instructions.</li>
  `;

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; color:#1e293b;">
          ${item.name || '—'}
          ${item.variant ? `<br><span style="font-size:12px;color:#64748b;">${item.variant}</span>` : ''}
        </td>
        <td class="hide-mobile" style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; color:#475569; text-align:center;">${item.quantity || 1}</td>
        <td class="hide-mobile" style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; color:#475569; text-align:right;">${fmt(item.unitPrice || item.price || 0)}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; font-weight:600; color:#003666; text-align:right;">${fmt(item.lineTotal || (item.unitPrice || item.price || 0) * (item.quantity || 1))}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — Atlas Health</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper  { padding: 16px 8px !important; }
      .email-card     { padding: 24px 18px !important; }
      .email-header   { padding: 24px 18px !important; }
      .email-header h1 { font-size: 22px !important; }
      .meta-row td    { display: block !important; width: 100% !important; padding: 4px 0 !important; }
      .hide-mobile    { display: none !important; }
      .col-product    { width: auto !important; }
      .tracking-id    { font-size: 17px !important; letter-spacing: 0.02em !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background:linear-gradient(135deg,#003666 0%,#005a9c 100%);border-radius:14px 14px 0 0;padding:32px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:8px;">Research Inquiry</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Atlas Health</h1>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Advanced Research Solutions</p>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#10b981;padding:14px 36px;text-align:center;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">
                ✅ Your inquiry has been received — <span style="font-family:monospace;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;">#${orderId}</span>
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td class="email-card" style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:16px;color:#1e293b;line-height:1.6;">
                Dear <strong>${customer.fullName || customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Researcher'}</strong>,<br/><br/>
                Thank you for your order. We have received your request and are already processing it. ${greetingExtra}
              </p>

              <!-- Meta row -->
              <table width="100%" cellpadding="0" cellspacing="0" class="meta-row" style="margin-bottom:28px;">
                <tr>
                  <td style="width:50%;vertical-align:top;padding-right:12px;padding-bottom:8px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Date</p>
                    <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${dateStr}</p>
                  </td>
                  <td style="width:50%;vertical-align:top;padding-left:12px;padding-bottom:8px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Payment Method</p>
                    <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${paymentLabel}</p>
                  </td>
                </tr>
              </table>

              <!-- Products table -->
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#003666;text-transform:uppercase;letter-spacing:1px;">📦 Your Order</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f1f5f9;">
                    <th class="col-product" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left;font-weight:600;">Product</th>
                     <th class="hide-mobile" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;font-weight:600;">Qty</th>
                     <th class="hide-mobile" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;font-weight:600;">Unit Price</th>
                     <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;font-weight:600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;"><p style="margin:0;font-size:14px;color:#64748b;">Subtotal</p></td>
                  <td style="padding:6px 0;text-align:right;"><p style="margin:0;font-size:14px;color:#1e293b;">${fmt(subtotal)}</p></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><p style="margin:0;font-size:14px;color:#64748b;">Shipping</p></td>
                  <td style="padding:6px 0;text-align:right;"><p style="margin:0;font-size:14px;color:#1e293b;">${shipping === 0 ? 'Free' : fmt(shipping)}</p></td>
                </tr>
                <tr>
                  <td style="padding:14px 0 6px;border-top:2px solid #003666;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#003666;">ESTIMATED TOTAL</p>
                  </td>
                  <td style="padding:14px 0 6px;border-top:2px solid #003666;text-align:right;">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#003666;">${fmt(total)}</p>
                  </td>
                </tr>
              </table>

              <!-- Shipping address -->
              ${(shippingAddress.address || shippingAddress.city || shippingAddress.country) ? `
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 22px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#003666;text-transform:uppercase;letter-spacing:1px;">📍 Shipping Address</p>
                <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;">
                  ${[shippingAddress.address, shippingAddress.address2, shippingAddress.city, shippingAddress.state, shippingAddress.postalCode || shippingAddress.zip, shippingAddress.country].filter(Boolean).join('<br/>')}
                </p>
              </div>` : ''}

              <!-- What's next -->
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">📋 Next Steps</p>
                <ol style="margin:0;padding-left:1.25rem;font-size:13px;color:#0c4a6e;line-height:1.8;">
                  ${nextStepsHtml}
                </ol>
              </div>

              <!-- Dashboard CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:13px;color:#475569;">
                  ${isGuest
                    ? 'You checked out as a guest. <strong>Create a free account</strong> to track your order, manage details, and access professional pricing.'
                    : 'Need to update any order details? Visit your dashboard at any time.'}
                </p>
                <a
                  href="https://atlas-health.com/dashboard"
                  style="display:inline-block;padding:10px 24px;background:#003666;color:#ffffff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.02em;"
                >
                  ${isGuest ? 'Create Account &amp; Track Order' : 'Go to My Dashboard'}
                </a>
              </div>

              ${notes ? `
              <!-- Notes -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Your notes</p>
                <p style="margin:0;font-size:13px;color:#78350f;">${notes}</p>
              </div>` : ''}

              <!-- Tracking ID -->
              <div style="text-align:center;background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:8px;border:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Your Tracking ID</p>
                <p class="tracking-id" style="margin:0;font-size:22px;font-weight:800;color:#003666;letter-spacing:0.05em;font-family:monospace;word-break:break-all;">${orderId}</p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                This email was automatically generated by Atlas Health.<br/>
                If you have any questions, please contact us at <a href="mailto:business@atlas-health.com" style="color:#003666;">business@atlas-health.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildClientConfirmationEmail(order) {
  const orderId = order.id || order.orderId || '—';
  return {
    subject: `✅ Order confirmed #${orderId} — Atlas Health`,
    html: buildClientConfirmationHtml(order),
  };
}

module.exports = { buildClientConfirmationHtml, buildClientConfirmationEmail };
