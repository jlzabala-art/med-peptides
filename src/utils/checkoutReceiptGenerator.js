/**
 * checkoutReceiptGenerator.js
 * Generates standalone print-ready HTML receipts for Atlas Health / Med Peptides orders.
 */

export function generateReceiptHtml({
  targetOrderId,
  targetFormData,
  targetItems,
  targetTotals,
  targetShipping,
}) {
  const { subtotal = 0, shippingCost = 0 } = targetTotals || {};
  const total = subtotal + shippingCost;
  const shippingLabel = (targetShipping || 'standard').charAt(0).toUpperCase() + (targetShipping || 'standard').slice(1);
  const paymentLabel = targetFormData?.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit / Debit Card';
  const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmt = (n) => `$${(n || 0).toFixed(2)}`;

  const itemRows = (targetItems || [])
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#1e293b;">
          ${i.namePart || i.name || 'Product'}${i.dosagePart ? `<br><span style="font-size:12px;color:#64748b;">${i.dosagePart}</span>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:center;">${i.qty || 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:right;">${fmt(i.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;font-weight:600;color:#003666;text-align:right;">${fmt(i.lineTotal)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Receipt — ${targetOrderId} — Atlas Health</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    body { margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Helvetica,Arial,sans-serif; }
    .print-btn {
      position:fixed; top:16px; right:16px; z-index:999;
      background:#003666; color:#fff; border:none; border-radius:8px;
      padding:10px 20px; font-size:14px; font-weight:700; cursor:pointer;
      box-shadow:0 4px 16px rgba(0,54,102,0.3);
    }
    .print-btn:hover { background:#005a9c; }
  </style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#003666 0%,#005a9c 100%);border-radius:14px 14px 0 0;padding:32px 36px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:8px;">Sample Order</p>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Atlas Health</h1>
          <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Advanced Research Solutions</p>
        </td></tr>

        <!-- Banner -->
        <tr><td style="background:#10b981;padding:14px 36px;text-align:center;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">
            ✅ Order Confirmed — <span style="font-family:monospace;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;">#${targetOrderId}</span>
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

          <!-- Greeting -->
          <p style="margin:0 0 24px;font-size:16px;color:#1e293b;line-height:1.6;">
            Dear <strong>${targetFormData?.firstName || 'Client'} ${targetFormData?.lastName || ''}</strong>,<br/><br/>
            Thank you for your order. We have received your request and our team is preparing the research materials.
          </p>

          <!-- Order meta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:28px;border:1px solid #e2e8f0;">
            <tr>
              <td style="font-size:13px;color:#64748b;padding:4px 0;">Order Reference:</td>
              <td style="font-size:13px;font-weight:700;color:#003666;font-family:monospace;text-align:right;padding:4px 0;">${targetOrderId}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:4px 0;">Date:</td>
              <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${dateStr}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:4px 0;">Payment Method:</td>
              <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${paymentLabel}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;padding:4px 0;">Shipping Method:</td>
              <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${shippingLabel}</td>
            </tr>
          </table>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:10px 12px;font-size:12px;text-align:left;color:#64748b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Item</th>
                <th style="padding:10px 12px;font-size:12px;text-align:center;color:#64748b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Qty</th>
                <th style="padding:10px 12px;font-size:12px;text-align:right;color:#64748b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Unit</th>
                <th style="padding:10px 12px;font-size:12px;text-align:right;color:#64748b;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:10px 12px;text-align:right;font-size:14px;color:#64748b;border-top:2px solid #e2e8f0;">Subtotal:</td>
                <td style="padding:10px 12px;text-align:right;font-size:14px;font-weight:600;color:#1e293b;border-top:2px solid #e2e8f0;">${fmt(subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding:6px 12px;text-align:right;font-size:14px;color:#64748b;">Shipping (${shippingLabel}):</td>
                <td style="padding:6px 12px;text-align:right;font-size:14px;color:#1e293b;">${shippingCost === 0 ? 'Free' : fmt(shippingCost)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding:12px;text-align:right;font-size:16px;font-weight:700;color:#003666;border-top:2px solid #003666;">Total:</td>
                <td style="padding:12px;text-align:right;font-size:18px;font-weight:700;color:#003666;border-top:2px solid #003666;">${fmt(total)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Shipping address -->
          <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;border:1px solid #e2e8f0;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Shipping Address</p>
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;">
              ${targetFormData?.address || ''}<br/>
              ${targetFormData?.city ? `${targetFormData.city}, ` : ''}${targetFormData?.postalCode || ''}<br/>
              ${targetFormData?.country || ''}
            </p>
          </div>

          <!-- Notice -->
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.5;">
            For research use only. Not for human therapeutic or diagnostic applications.<br/>
            Questions? Contact support at <a href="mailto:info@Atlas Health.com" style="color:#003666;">info@Atlas Health.com</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-radius:0 0 14px 14px;border:1px solid #e2e8f0;border-top:none;padding:16px 36px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Atlas Health. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
