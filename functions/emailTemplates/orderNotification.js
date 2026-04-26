/**
 * orderNotification.js
 * HTML email template for admin order notifications.
 * Called by the Cloud Function whenever a new order document is created.
 */

/**
 * Generates the full HTML email for a new order.
 * @param {Object} order - The order document from Firestore.
 * @returns {string} Full HTML string ready to send.
 */
function buildOrderNotificationHtml(order) {
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
    shippingAddress = {},
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

  const addressLine = [
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zip,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(', ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo Pedido — Med-Peptides</title>
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
              <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:8px;">Notificación de Pedido</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Med-Peptides</h1>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Panel de Administración</p>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#00a3e0;padding:14px 36px;text-align:center;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">
                🛒 Nuevo pedido recibido — <span style="font-family:monospace;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;">#${orderId}</span>
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Meta row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="width:50%;vertical-align:top;padding-right:12px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Fecha</p>
                    <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${dateStr}</p>
                  </td>
                  <td style="width:50%;vertical-align:top;padding-left:12px;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Estado</p>
                    <span style="display:inline-block;background:#dcfce7;color:#166534;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">Pendiente confirmación</span>
                  </td>
                </tr>
              </table>

              <!-- Customer info -->
              <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;margin-bottom:28px;border:1px solid #e2e8f0;">
                <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#003666;text-transform:uppercase;letter-spacing:1px;">👤 Cliente</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:8px;">
                      <p style="margin:0;font-size:14px;color:#1e293b;"><strong>${customer.fullName || customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—'}</strong></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:6px;">
                      <p style="margin:0;font-size:13px;color:#475569;">📧 ${customer.email || '—'}</p>
                    </td>
                  </tr>
                  ${customer.phone ? `<tr><td style="padding-bottom:6px;"><p style="margin:0;font-size:13px;color:#475569;">📞 ${customer.phone}</p></td></tr>` : ''}
                  ${customer.institution ? `<tr><td><p style="margin:0;font-size:13px;color:#475569;">🏥 ${customer.institution}</p></td></tr>` : ''}
                  ${addressLine ? `<tr><td style="padding-top:10px;"><p style="margin:0;font-size:13px;color:#475569;">📍 ${addressLine}</p></td></tr>` : ''}
                </table>
              </div>

              <!-- Products table -->
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#003666;text-transform:uppercase;letter-spacing:1px;">📦 Productos</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f1f5f9;">
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left;font-weight:600;">Producto</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;font-weight:600;">Cant.</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;font-weight:600;">P. Unit.</th>
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
                  <td style="padding:6px 0;"><p style="margin:0;font-size:14px;color:#64748b;">Envío</p></td>
                  <td style="padding:6px 0;text-align:right;"><p style="margin:0;font-size:14px;color:#1e293b;">${shipping === 0 ? 'Gratis' : fmt(shipping)}</p></td>
                </tr>
                <tr>
                  <td style="padding:14px 0 6px;border-top:2px solid #003666;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#003666;">TOTAL</p>
                  </td>
                  <td style="padding:14px 0 6px;border-top:2px solid #003666;text-align:right;">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#003666;">${fmt(total)}</p>
                  </td>
                </tr>
              </table>

              ${notes ? `
              <!-- Notes -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Notas del cliente</p>
                <p style="margin:0;font-size:13px;color:#78350f;">${notes}</p>
              </div>` : ''}

              <!-- CTA button -->
              <div style="text-align:center;margin-top:8px;">
                <a href="https://med-peptides-app-27a3a.web.app/admin"
                   style="display:inline-block;background:linear-gradient(135deg,#003666 0%,#005a9c 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                  Ver en el Panel de Admin →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Este email fue generado automáticamente por Med-Peptides.<br/>
                No respondas a este correo — accede al panel para gestionar el pedido.
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

/**
 * Returns { subject, html } ready to pass to nodemailer.sendMail().
 * @param {Object} order - The Firestore order document data.
 */
function buildOrderEmail(order) {
  const orderId = order.id || order.orderId || '—';
  return {
    subject: `🛒 Nuevo pedido #${orderId} — Med-Peptides`,
    html: buildOrderNotificationHtml(order),
  };
}

module.exports = { buildOrderNotificationHtml, buildOrderEmail };

