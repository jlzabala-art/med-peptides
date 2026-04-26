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
    items = [],
    subtotal = 0,
    shipping = 0,
    total = 0,
    currency = 'EUR',
    paymentMethod = '',
    notes = '',
  } = order;

  const fmt = (amount) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);

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
    ? new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
    : dateObj.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

  const paymentLabel =
    paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
    paymentMethod === 'credit_card'   ? 'Credit / Debit Card' :
    paymentMethod || '—';

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; color:#1e293b;">
          ${item.name || '—'}
          ${item.variant ? `<br><span style="font-size:12px;color:#64748b;">${item.variant}</span>` : ''}
        </td>
        <td style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; color:#475569; text-align:center;">${item.quantity || 1}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; color:#475569; text-align:right;">${fmt(item.price || 0)}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e8edf5; font-size:14px; font-weight:600; color:#003666; text-align:right;">${fmt((item.price || 0) * (item.quantity || 1))}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — Med-Peptides</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#003666 0%,#005a9c 100%);border-radius:14px 14px 0 0;padding:32px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:8px;">Research Inquiry</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Med-Peptides</h1>
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
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:16px;color:#1e293b;line-height:1.6;">
                Dear <strong>${customer.fullName || customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Researcher'}</strong>,<br/><br/>
                Thank you for your research inquiry. We have received your request and a specialist from our team will contact you shortly with formal quotation documentation.
              </p>

              <!-- Meta row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="width:50%;vertical-align:top;padding-right:12px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Date</p>
                    <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${dateStr}</p>
                  </td>
                  <td style="width:50%;vertical-align:top;padding-left:12px;">
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
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left;font-weight:600;">Product</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;font-weight:600;">Qty</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;font-weight:600;">Unit Price</th>
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

              <!-- What's next -->
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">📋 Next Steps</p>
                <ol style="margin:0;padding-left:1.25rem;font-size:13px;color:#0c4a6e;line-height:1.8;">
                  <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
                  <li>You will receive a formal quotation with pricing and documentation.</li>
                  <li>Upon approval, we will provide payment and shipping instructions.</li>
                </ol>
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
                <p style="margin:0;font-size:22px;font-weight:800;color:#003666;letter-spacing:0.05em;font-family:monospace;">${orderId}</p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                This email was automatically generated by Med-Peptides.<br/>
                If you have any questions, please contact us at <a href="mailto:info@med-peptides.com" style="color:#003666;">info@med-peptides.com</a>
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
    subject: `✅ Inquiry confirmed #${orderId} — Med-Peptides`,
    html: buildClientConfirmationHtml(order),
  };
}

module.exports = { buildClientConfirmationHtml, buildClientConfirmationEmail };
