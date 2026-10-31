import nodemailer from 'nodemailer';
import { adminDb } from './firebaseAdmin.js';

const DEFAULT_RECIPIENT = 'jose@mediluxeme.com';

/**
 * Builds the HTML email for any order placed on Atlas Health Services.
 * Explicitly highlights Wholeseller attribution (e.g. Nikolaos Psathas / NP Labs · CAT-RX-7482)
 * and dual +15% margin breakdown when applicable.
 */
export function buildOrderNotificationHtml(order = {}) {
  const orderCode = order.orderId || order.code || order.orderCode || 'PO-DRAFT';
  const customerName = order.customerName || 'Clinical Client';
  const customerEmail = order.customerEmail || '—';
  const customerPhone = order.customerPhone || '—';
  const customerAddress = order.customerAddress || order.deliveryAddress || '—';
  const customerVat = order.customerVat || '—';
  const customerNotes = order.customerNotes || '—';
  const currency = order.currency || 'EUR';
  const sym = order.currencySymbol || (currency === 'EUR' ? '€' : '$');
  const subtotal = Number(order.subtotal || 0);
  const shippingCost = Number(order.shippingCost || 0);
  const shippingDestination = order.shippingDestination || 'Standard Dispatch';
  const grandTotal = Number(order.grandTotal || order.total || 0);
  const totalUnits = Number(order.totalUnits || 0);
  const createdAt = order.createdAt || new Date().toISOString();

  const isNikolas =
    order.wholesalerId === 'np-labs-international' ||
    order.wholesalerId === 'nikolaos-psathas' ||
    order.referralCode === 'CAT-RX-7482' ||
    order.catalogId === 'CAT-RX-7482' ||
    String(order.wholesalerName || '').toLowerCase().includes('nikol') ||
    String(order.wholesalerName || '').toLowerCase().includes('np lab');

  const attributedToText = isNikolas
    ? 'Referred by: Nikolaos Psathas · NP Labs International (Wholeseller · Referral #CAT-RX-7482)'
    : order.attributedTo || (order.wholesalerName ? `Referred by: ${order.wholesalerName} (${order.wholesalerId || order.referralCode || ''})` : 'Direct Institutional Order (Atlas Health Services)');

  const pricingRuleText = isNikolas
    ? 'Wholeseller Schedule: Base Cost + 15% Mediluxe Margin + 15% Partner Margin (×1.15 ×1.15 = +32.25%)'
    : `${order.priceTierLabel || order.priceTier || 'Institutional Schedule'}${order.priceMarkupPercent ? ` (+${order.priceMarkupPercent}%)` : ''}`;

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRowsHtml = items.length > 0
    ? items.map((item, idx) => {
        const name = item.productName || item.name || `Item #${idx + 1}`;
        const variant = item.variant || [item.dosage, item.presentation].filter(Boolean).join(' • ') || 'Standard';
        const qty = Number(item.quantity || 1);
        const unitPrice = Number(item.unitPrice || item.price || 0);
        const lineTotal = Number(item.totalPrice || item.total || (qty * unitPrice));
        const baseCost = Number(item.baseCost || 0);
        const mediluxePrice = Number(item.mediluxePrice || (baseCost > 0 ? (baseCost * 1.15) : 0));

        const breakdownBadge = baseCost > 0
          ? `<div style="font-size:11px;color:#0369a1;margin-top:3px;">Cost: ${sym}${baseCost.toFixed(2)} → +15% Mediluxe: ${sym}${mediluxePrice.toFixed(2)} → +15% Wholeseller: ${sym}${unitPrice.toFixed(2)}</div>`
          : '';

        return `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;font-weight:700;">
              ${idx + 1}. ${name}
              <div style="font-size:11px;color:#64748b;font-weight:500;">${variant}</div>
              ${breakdownBadge}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:center;font-weight:700;">${qty}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;">${sym}${unitPrice.toFixed(2)}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#003666;text-align:right;font-weight:800;">${sym}${lineTotal.toFixed(2)}</td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#64748b;">No line items detailed</td></tr>`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const adminOrderUrl = `${appUrl}/admin?tab=orders${order.firestoreId ? `&orderId=${encodeURIComponent(order.firestoreId)}` : ''}`;

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.05);">
        <div style="background:linear-gradient(135deg,#003666 0%,#0284c7 100%);padding:22px 26px;color:#ffffff;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#bae6fd;margin-bottom:4px;">
            Atlas Health Services · Automated Order Notification
          </div>
          <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.01em;">
            🚨 New Order Received · #${orderCode}
          </h1>
          <div style="margin-top:6px;font-size:13px;color:#e0f2fe;">
            Total: <strong>${sym}${grandTotal.toFixed(2)} ${currency}</strong> (${totalUnits} units) · Date: ${new Date(createdAt).toLocaleString('en-US', { timeZone: 'UTC' })} UTC
          </div>
        </div>

        <div style="padding:24px 26px;">
          <!-- Attribution Banner -->
          <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#15803d;letter-spacing:0.05em;margin-bottom:4px;">
              🤝 Commercial Attribution & Partner Traceability
            </div>
            <div style="font-size:14px;font-weight:800;color:#14532d;">
              ${attributedToText}
            </div>
            <div style="font-size:12px;color:#166534;margin-top:4px;">
              <strong>Applied Pricing Schedule:</strong> ${pricingRuleText}
            </div>
            ${order.catalogId || order.referralCode ? `
              <div style="font-size:11px;color:#15803d;margin-top:4px;">
                Catalog / Referral Code: <strong>${order.catalogId || order.referralCode}</strong> · Origin Source: <code>${order.source || 'shared_catalog'}</code>
              </div>
            ` : ''}
          </div>

          <h3 style="margin:0 0 10px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
            Client & Clinic Information
          </h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:22px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
            <tbody>
              <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;width:34%;">Client / Practice</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:800;color:#0f172a;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Email Address</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#0284c7;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Phone / WhatsApp</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#0f172a;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Delivery Address</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${customerAddress}</td>
              </tr>
              ${customerVat && customerVat !== '—' ? `
              <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">VAT / Tax ID</td>
                <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${customerVat}</td>
              </tr>` : ''}
              ${customerNotes && customerNotes !== '—' ? `
              <tr>
                <td style="padding:10px 14px;font-size:12px;color:#64748b;">Delivery Notes</td>
                <td style="padding:10px 14px;font-size:13px;color:#334155;">${customerNotes}</td>
              </tr>` : ''}
            </tbody>
          </table>

          <h3 style="margin:0 0 10px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
            Ordered Formulations & Tests (${totalUnits} units)
          </h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;">Product / Presentation</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Unit Price</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f8fafc;">
                <td colspan="3" style="padding:8px 12px;text-align:right;font-size:12px;color:#475569;">Subtotal Formulations:</td>
                <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;">${sym}${subtotal.toFixed(2)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="3" style="padding:8px 12px;text-align:right;font-size:12px;color:#475569;">Dispatch / Shipping (${shippingDestination}):</td>
                <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;">+${sym}${shippingCost.toFixed(2)}</td>
              </tr>
              <tr style="background:#eff6ff;border-top:2px solid #bfdbfe;">
                <td colspan="3" style="padding:12px;text-align:right;font-size:14px;font-weight:800;color:#003666;">ORDER TOTAL (${currency}):</td>
                <td style="padding:12px;text-align:right;font-size:16px;font-weight:900;color:#003666;">${sym}${grandTotal.toFixed(2)} ${currency}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align:center;margin-top:24px;">
            <a href="${adminOrderUrl}" style="display:inline-block;padding:12px 24px;background:#003666;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:8px;">
              Open Order #${orderCode} in Admin Control Panel
            </a>
          </div>
        </div>

        <div style="background:#f8fafc;padding:14px 26px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;">
          Automated notification dispatched to <strong>${DEFAULT_RECIPIENT}</strong> · Atlas Health Services
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends an email notification to jose@mediluxeme.com whenever an order is created.
 * Uses Gmail SMTP (GMAIL_USER / GMAIL_APP_PASS) with Resend fallback and logs to `mail_logs`.
 */
export async function sendOrderCreatedNotificationEmail(order = {}, recipientEmail = DEFAULT_RECIPIENT) {
  const toEmail = recipientEmail || process.env.ORDER_NOTIFICATION_EMAIL || DEFAULT_RECIPIENT;
  const orderCode = order.orderId || order.code || order.orderCode || 'PO-DRAFT';
  const customerName = order.customerName || 'Clinical Client';
  const currency = order.currency || 'EUR';
  const sym = order.currencySymbol || (currency === 'EUR' ? '€' : '$');
  const grandTotal = Number(order.grandTotal || order.total || 0);

  const isNikolas =
    order.wholesalerId === 'np-labs-international' ||
    order.wholesalerId === 'nikolaos-psathas' ||
    order.referralCode === 'CAT-RX-7482' ||
    order.catalogId === 'CAT-RX-7482' ||
    String(order.wholesalerName || '').toLowerCase().includes('nikol') ||
    String(order.wholesalerName || '').toLowerCase().includes('np lab');

  const subject = `🚨 [New Atlas Order] #${orderCode} · ${customerName} (${sym}${grandTotal.toFixed(2)} ${currency})${isNikolas ? ' · Referred by Nikolaos Psathas (NPLAB)' : ''}`;
  const html = buildOrderNotificationHtml(order);

  let sentVia = null;
  let messageId = null;
  let lastError = null;

  // 1. Primary: Gmail SMTP
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass }
      });
      const info = await transporter.sendMail({
        from: `"Atlas Health Orders Desk" <${gmailUser}>`,
        to: toEmail,
        subject,
        html
      });
      sentVia = 'gmail_smtp';
      messageId = info.messageId;
    } catch (smtpErr) {
      console.warn('[OrderNotificationMailer] Gmail SMTP failed, trying Resend fallback:', smtpErr.message);
      lastError = smtpErr.message;
    }
  }

  // 2. Fallback: Resend HTTP API
  if (!sentVia && process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'Atlas Health Services <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject,
          html
        })
      });
      const data = await res.json();
      if (!res.ok) {
        lastError = data?.message || JSON.stringify(data);
      } else {
        sentVia = 'resend_api';
        messageId = data?.id || null;
      }
    } catch (resendErr) {
      lastError = resendErr.message;
    }
  }

  // 3. Log in Firestore `mail_logs` and stamp `orders/{firestoreId}`
  if (adminDb) {
    try {
      await adminDb.collection('mail_logs').add({
        type: 'order_created_notification',
        to: toEmail,
        subject,
        orderCode,
        orderId: order.firestoreId || null,
        customerName,
        grandTotal,
        currency,
        wholesalerId: order.wholesalerId || null,
        attributedTo: isNikolas ? 'Por atención de Nikolaos Psathas (NP Labs)' : (order.attributedTo || null),
        sentVia: sentVia || 'queued_firestore',
        messageId: messageId || null,
        status: sentVia ? 'sent' : 'queued',
        error: sentVia ? null : (lastError || 'No SMTP/Resend credentials configured'),
        createdAt: new Date().toISOString()
      });

      if (sentVia && order.firestoreId) {
        await adminDb.collection('orders').doc(String(order.firestoreId)).set({
          adminEmailNotifiedAt: new Date().toISOString(),
          adminEmailNotifiedTo: toEmail,
          adminEmailNotifiedVia: sentVia
        }, { merge: true });
      }
    } catch (logErr) {
      console.warn('[OrderNotificationMailer] Could not write mail_logs:', logErr.message);
    }
  }

  return {
    success: Boolean(sentVia),
    sentVia,
    messageId,
    to: toEmail,
    error: lastError
  };
}

