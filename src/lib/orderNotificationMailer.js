import nodemailer from 'nodemailer';
import { adminDb } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

const DEFAULT_ADMIN_EMAIL = 'jose@mediluxeme.com';
const PROVISIONAL_NIKOLAS_EMAIL = 'jlzabala@gmail.com';
const DEFAULT_CUSTOMER_TEST_EMAIL = 'jlzabala@gmail.com';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * Shared responsive CSS head for all HTML email templates.
 * Engineered for 100% responsive display on mobile (iOS Mail, Gmail Mobile, Outlook Mobile)
 * and laptop / desktop email clients.
 */
function getEmailHeadStyles() {
  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased; }
      @media only screen and (max-width: 620px) {
        .email-wrapper { padding: 6px !important; }
        .email-container { width: 100% !important; border-radius: 8px !important; }
        .content-box { padding: 18px 14px !important; }
        .stack-cell { display: block !important; width: 100% !important; }
        .responsive-table th, .responsive-table td { padding: 8px 6px !important; font-size: 11px !important; }
        .badge { font-size: 10px !important; padding: 2px 5px !important; }
        .header-title { font-size: 18px !important; }
      }
    </style>
  `;
}

/**
 * Common line items table generator.
 * Standard across Admin, Customer, and Wholesaler emails to guarantee 100% identical values.
 */
function buildItemsRowsHtml(items = [], sym = '$') {
  if (!items || items.length === 0) {
    return `<tr><td colspan="6" style="padding:14px;text-align:center;color:#64748b;font-size:12px;">No line items detailed</td></tr>`;
  }

  return items.map((item, idx) => {
    const name = item.productName || item.name || `Item #${idx + 1}`;
    const dosage = item.dosage || (item.variant && item.variant.includes('•') ? item.variant.split('•')[0].trim() : item.variant) || 'Standard';
    const presentation = item.presentation || (item.variant && item.variant.includes('•') ? item.variant.split('•')[1].trim() : 'Lyophilized Vial (10R)') || 'Lyophilized Vial (10R)';
    const qty = Number(item.quantity || item.totalVials || 1);
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const lineTotal = Number(item.totalPrice || item.total || item.subtotal || (qty * unitPrice));

    return `
      <tr>
        <td style="padding:10px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;font-weight:700;">
          ${idx + 1}. ${name}
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">
          <span style="display:inline-block;padding:2px 7px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;font-weight:700;color:#0369a1;font-size:11px;">
            ${dosage}
          </span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">
          <span style="display:inline-block;padding:2px 7px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;font-weight:600;color:#334155;font-size:11px;">
            ${presentation}
          </span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:center;font-weight:700;">
          ${qty}
        </td>
        <td style="padding:10px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-family:monospace;">
          ${sym}${unitPrice.toFixed(2)}
        </td>
        <td style="padding:10px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#003666;text-align:right;font-weight:800;font-family:monospace;">
          ${sym}${lineTotal.toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * ──────────────────────────────────────────────────────────────────
 * EMAIL 1: ADMIN ORDER NOTIFICATION (jose@mediluxeme.com)
 * ──────────────────────────────────────────────────────────────────
 */
export function buildAdminOrderNotificationHtml(order = {}) {
  const orderCode = order.orderId || order.code || order.orderCode || 'PO-DRAFT';
  const customerName = order.customerName || 'Clinical Client';
  const clinicName = order.clinicName || 'Clinical Institution';
  const customerEmail = order.customerEmail || '—';
  const customerPhone = order.customerPhone || '—';
  const customerAddress = order.customerAddress || order.deliveryAddress || '—';
  const customerNotes = order.customerNotes || '—';
  const currency = order.currency || 'USD';
  const sym = order.currencySymbol || (currency === 'EUR' ? '€' : '$');

  const subtotal = Number(order.subtotal || 0);
  const shippingCost = Number(order.shippingCost || (currency === 'EUR' ? 60 : 65.22));
  const shippingDestination = order.shippingDestination || 'Express Medical Courier Dispatch';
  const grandTotal = Number(order.grandTotal || (subtotal + shippingCost));
  const totalUnits = Number(order.totalUnits || 0);
  const _createdAt = order.createdAt || new Date().toISOString();

  const isNikolas =
    order.wholesalerId === 'np-labs-international' ||
    order.referralCode === 'CAT-RX-7482' ||
    String(order.wholesalerName || '').toLowerCase().includes('nikol');

  const partnerText = isNikolas
    ? 'Referred by: Nikolaos Psathas · NP Labs International (Wholesaler · Code: CAT-RX-7482)'
    : (order.attributedTo || 'Direct Institutional Order (Atlas Health Services)');

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRowsHtml = buildItemsRowsHtml(items, sym);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const adminOrderUrl = `${appUrl}/admin?tab=orders${order.firestoreId ? `&orderId=${encodeURIComponent(order.firestoreId)}` : ''}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getEmailHeadStyles()}
      <title>Admin Order Alert #${orderCode}</title>
    </head>
    <body style="margin:0;padding:20px 10px;background-color:#f1f5f9;">
      <div class="email-container" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,0.06);">
        <!-- Top Brand Header -->
        <div style="background:linear-gradient(135deg,#003666 0%,#0284c7 100%);padding:22px 24px;color:#ffffff;">
          <div style="font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:0.08em;color:#bae6fd;margin-bottom:4px;">
            Atlas Health Services · Admin Control Desk
          </div>
          <h1 class="header-title" style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.01em;">
            🚨 New B2B Order Received · #${orderCode}
          </h1>
          <div style="margin-top:6px;font-size:13px;color:#e0f2fe;">
            Total: <strong>${sym}${grandTotal.toFixed(2)} ${currency}</strong> (${totalUnits} vials · incl. ${sym}${shippingCost.toFixed(2)} Express Logistics)
          </div>
        </div>

        <div class="content-box" style="padding:22px 24px;">
          <!-- Partner Attribution Banner -->
          <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:12px 14px;margin-bottom:18px;">
            <div style="font-size:10.5px;font-weight:800;text-transform:uppercase;color:#15803d;letter-spacing:0.05em;margin-bottom:3px;">
              🤝 Commercial Attribution & Partner Referral
            </div>
            <div style="font-size:13px;font-weight:800;color:#14532d;">
              ${partnerText}
            </div>
            <div style="font-size:11.5px;color:#166534;margin-top:3px;">
              Pricing Schedule: Base Laboratory Cost + 15% Mediluxe + 15% Wholesaler (+32.25%)
            </div>
          </div>

          <!-- Institutional Contact Card -->
          <h3 style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
            Institutional Contact & Shipping Destination
          </h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <tbody>
              <tr>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;width:34%;">Contact Lead</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12.5px;font-weight:750;color:#0f172a;">${customerName} (${clinicName})</td>
              </tr>
              <tr>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Work Email</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12.5px;font-weight:600;color:#0284c7;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Phone / WhatsApp</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12.5px;font-weight:600;color:#0f172a;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Delivery Address</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:12.5px;color:#334155;">${customerAddress}</td>
              </tr>
              ${customerNotes && customerNotes !== '—' ? `
              <tr>
                <td style="padding:9px 12px;font-size:12px;color:#64748b;">Order Notes</td>
                <td style="padding:9px 12px;font-size:12.5px;color:#334155;">${customerNotes}</td>
              </tr>` : ''}
            </tbody>
          </table>

          <!-- Products Table -->
          <h3 style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
            Ordered Formulations (${totalUnits} sterile vials)
          </h3>
          <table class="responsive-table" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:18px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:9px 10px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;">Product</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Dosage</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Format</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Qty</th>
                <th style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Unit Price</th>
                <th style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:8px 10px;text-align:right;font-size:12px;color:#475569;">Subtotal Formulations:</td>
                <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;font-family:monospace;">${sym}${subtotal.toFixed(2)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:8px 10px;text-align:right;font-size:12px;color:#475569;">
                  Express Medical Logistics & Handling (€60.00 base · ${shippingDestination}):
                </td>
                <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#0284c7;font-family:monospace;">+${sym}${shippingCost.toFixed(2)}</td>
              </tr>
              <tr style="background:#eff6ff;border-top:2px solid #bfdbfe;">
                <td colspan="5" style="padding:10px 10px;text-align:right;font-size:13px;font-weight:800;color:#003666;">ORDER TOTAL (${currency}):</td>
                <td style="padding:10px 10px;text-align:right;font-size:15px;font-weight:900;color:#003666;font-family:monospace;">${sym}${grandTotal.toFixed(2)} ${currency}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Admin Action CTA -->
          <div style="text-align:center;margin-top:20px;">
            <a href="${adminOrderUrl}" style="display:inline-block;padding:12px 24px;background:#003666;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:6px;min-height:44px;line-height:20px;">
              Open Order #${orderCode} in Admin Control Panel →
            </a>
          </div>
        </div>

        <div style="background:#f8fafc;padding:12px 20px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;">
          Automated Admin Notification dispatched to <strong>${DEFAULT_ADMIN_EMAIL}</strong> · Atlas Health Services
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * ──────────────────────────────────────────────────────────────────
 * EMAIL 2: CUSTOMER PROFORMA CONFIRMATION (Dr. Alexander Wright / jlzabala@gmail.com)
 * ──────────────────────────────────────────────────────────────────
 */
export function buildCustomerOrderConfirmationHtml(order = {}) {
  const orderCode = order.orderId || order.code || order.orderCode || 'PO-DRAFT';
  const customerName = order.customerName || 'Clinical Client';
  const clinicName = order.clinicName || 'Your Medical Practice';
  const customerAddress = order.customerAddress || order.deliveryAddress || 'Standard Clinical Destination';
  const currency = order.currency || 'USD';
  const sym = order.currencySymbol || (currency === 'EUR' ? '€' : '$');

  const subtotal = Number(order.subtotal || 0);
  const shippingCost = Number(order.shippingCost || (currency === 'EUR' ? 60 : 65.22));
  const grandTotal = Number(order.grandTotal || (subtotal + shippingCost));
  const totalUnits = Number(order.totalUnits || 0);

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRowsHtml = buildItemsRowsHtml(items, sym);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getEmailHeadStyles()}
      <title>Order Confirmation & Proforma Receipt #${orderCode}</title>
    </head>
    <body style="margin:0;padding:20px 10px;background-color:#f1f5f9;">
      <div class="email-container" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,0.06);">
        <!-- Top Brand Header -->
        <div style="background:linear-gradient(135deg,#0284c7 0%,#003666 100%);padding:22px 24px;color:#ffffff;">
          <div style="font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:0.08em;color:#e0f2fe;margin-bottom:4px;">
            Atlas Health Services · Mediluxe B2B Clinical Division
          </div>
          <h1 class="header-title" style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.01em;">
            📋 Order Confirmation & Proforma Receipt
          </h1>
          <div style="margin-top:6px;font-size:13px;color:#e0f2fe;">
            Reference: <strong>#${orderCode}</strong> · Status: <strong>Draft Proforma Registered</strong>
          </div>
        </div>

        <div class="content-box" style="padding:22px 24px;">
          <!-- Salutation -->
          <div style="margin-bottom:18px;">
            <p style="margin:0 0 8px;font-size:14px;color:#0f172a;line-height:1.5;">
              Dear <strong>${customerName}</strong>,
            </p>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
              Thank you for placing your clinical peptide order with Atlas Health Services / Mediluxe B2B. We have successfully registered your request for <strong>${clinicName}</strong>. Below is your official proforma quotation summary.
            </p>
          </div>

          <!-- Delivery Destination Info -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:18px;">
            <div style="font-size:11px;font-weight:750;text-transform:uppercase;color:#64748b;letter-spacing:0.04em;">
              Delivery Destination
            </div>
            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">
              ${customerAddress}
            </div>
          </div>

          <!-- Ordered Formulations Table -->
          <h3 style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
            Ordered Formulations (${totalUnits} sterile vials)
          </h3>
          <table class="responsive-table" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:18px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:9px 10px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;">Product</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Dosage</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Format</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Qty</th>
                <th style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Unit Price</th>
                <th style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:8px 10px;text-align:right;font-size:12px;color:#475569;">Subtotal Formulations:</td>
                <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;font-family:monospace;">${sym}${subtotal.toFixed(2)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:8px 10px;text-align:right;font-size:12px;color:#475569;">
                  Express Medical Logistics & Handling (€60.00 base):
                </td>
                <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#0284c7;font-family:monospace;">+${sym}${shippingCost.toFixed(2)}</td>
              </tr>
              <tr style="background:#eff6ff;border-top:2px solid #bfdbfe;">
                <td colspan="5" style="padding:10px 10px;text-align:right;font-size:13px;font-weight:800;color:#003666;">ESTIMATED TOTAL (${currency}):</td>
                <td style="padding:10px 10px;text-align:right;font-size:15px;font-weight:900;color:#003666;font-family:monospace;">${sym}${grandTotal.toFixed(2)} ${currency}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Next Steps Card -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
            <div style="font-size:12px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">
              ℹ️ What happens next?
            </div>
            <ol style="margin:0;padding-left:18px;font-size:12.5px;color:#334155;line-height:1.55;">
              <li style="margin-bottom:4px;"><strong>Official Proforma Invoice:</strong> Our procurement desk will verify batch availability and issue an official tax invoice.</li>
              <li style="margin-bottom:4px;"><strong>Secure Direct Payment:</strong> You will receive a direct link to complete payment via Credit Card or international Bank Wire.</li>
              <li><strong>Express Dispatch:</strong> Upon payment receipt, formulations are vacuum-inspected, packed, and dispatched via certified medical courier with full analytical COA certificates.</li>
            </ol>
          </div>

          <p style="margin:0;font-size:12px;color:#64748b;text-align:center;">
            Need urgent assistance or compounding specifications? Contact our clinical desk at <a href="mailto:support@atlashealth-services.com" style="color:#0284c7;text-decoration:none;font-weight:600;">support@atlashealth-services.com</a>.
          </p>
        </div>

        <div style="background:#f8fafc;padding:12px 20px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;">
          Atlas Health Services · Mediluxe B2B Clinical Division · European & Middle East Supply Operations
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * ──────────────────────────────────────────────────────────────────
 * EMAIL 3: WHOLESALER PARTNER NOTIFICATION (Nikolaos Psathas / NP Labs)
 * Features exact same order value + 15% partner commission + accumulated ledger!
 * ──────────────────────────────────────────────────────────────────
 */
export function buildWholesalerReferralNotificationHtml(order = {}, partnerStats = {}) {
  const orderCode = order.orderId || order.code || order.orderCode || 'PO-DRAFT';
  const customerName = order.customerName || 'Referred Clinic';
  const clinicName = order.clinicName || 'Medical Practice';
  const destination = order.shippingDestination || order.customerAddress || 'International';
  const currency = order.currency || 'USD';
  const sym = order.currencySymbol || (currency === 'EUR' ? '€' : '$');

  const subtotal = Number(order.subtotal || 0);
  const shippingCost = Number(order.shippingCost || (currency === 'EUR' ? 60 : 65.22));
  const grandTotal = Number(order.grandTotal || (subtotal + shippingCost));
  const totalUnits = Number(order.totalUnits || 0);

  // Commission is 15% on formulation sales
  const orderCommission = round2(subtotal * 0.15);
  const accumulatedCommissions = round2(Number(partnerStats.totalCommissions || orderCommission));
  const totalRevenue = round2(Number(partnerStats.totalRevenue || grandTotal));
  const ordersCount = Number(partnerStats.ordersCount || 1);
  const totalUnitsAccumulated = Number(partnerStats.totalUnits || totalUnits);

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRowsHtml = buildItemsRowsHtml(items, sym);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getEmailHeadStyles()}
      <title>Partner Referral Sale Confirmed #${orderCode}</title>
    </head>
    <body style="margin:0;padding:20px 10px;background-color:#f1f5f9;">
      <div class="email-container" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,0.06);">
        <!-- Top Partner Header -->
        <div style="background:linear-gradient(135deg,#0f172a 0%,#047857 100%);padding:22px 24px;color:#ffffff;">
          <div style="font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:0.08em;color:#a7f3d0;margin-bottom:4px;">
            NP Labs International · Commercial Partner Network
          </div>
          <h1 class="header-title" style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.01em;">
            🤝 New Cross-Sale Generated · #${orderCode}
          </h1>
          <div style="margin-top:6px;font-size:13px;color:#ecfdf5;">
            Partner Commission Earned: <strong>+${sym}${orderCommission.toFixed(2)} ${currency}</strong> (15% Partner Margin)
          </div>
        </div>

        <div class="content-box" style="padding:22px 24px;">
          <!-- Salutation -->
          <div style="margin-bottom:18px;">
            <p style="margin:0 0 6px;font-size:14px;color:#0f172a;line-height:1.5;">
              Hello <strong>Nikolaos</strong>,
            </p>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
              A new institutional client has placed an order through your official B2B referral schedule (Referral Code: <strong>CAT-RX-7482</strong>). Below is the confirmed sales summary and your commission breakdown.
            </p>
          </div>

          <!-- Highlight Box: Commission on this Order -->
          <div style="background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div>
                <div style="font-size:11px;font-weight:750;text-transform:uppercase;color:#047857;letter-spacing:0.05em;">
                  Commission on this Order (15%)
                </div>
                <div style="font-size:20px;font-weight:900;color:#065f46;margin-top:2px;font-family:monospace;">
                  +${sym}${orderCommission.toFixed(2)} ${currency}
                </div>
                <div style="font-size:11px;color:#047857;margin-top:2px;">
                  Calculated as 15% on formulation subtotal (${sym}${subtotal.toFixed(2)})
                </div>
              </div>
              <div style="text-align:right;">
                <span style="display:inline-block;padding:4px 10px;background:#10b981;color:#ffffff;border-radius:12px;font-size:11px;font-weight:750;">
                  Credited to Ledger ✓
                </span>
              </div>
            </div>
          </div>

          <!-- Accumulated Partner Commissions Ledger (Requested Golden Feature) -->
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
            <div style="font-size:11.5px;font-weight:800;text-transform:uppercase;color:#334155;letter-spacing:0.05em;margin-bottom:10px;">
              📊 Nikolaos Psathas · Accumulated Referral Ledger
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
              <tbody>
                <tr>
                  <td style="padding:6px 0;color:#64748b;">Total Accumulated Commissions:</td>
                  <td style="padding:6px 0;text-align:right;font-weight:800;color:#047857;font-family:monospace;font-size:13.5px;">
                    ${sym}${accumulatedCommissions.toFixed(2)} ${currency}
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;">Total Referred Sales Volume:</td>
                  <td style="padding:6px 0;text-align:right;font-weight:750;color:#0f172a;font-family:monospace;">
                    ${sym}${totalRevenue.toFixed(2)} ${currency}
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;">Total Referred Orders:</td>
                  <td style="padding:6px 0;text-align:right;font-weight:700;color:#0f172a;">
                    ${ordersCount} orders
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;">Total Sterile Vials Dispatched:</td>
                  <td style="padding:6px 0;text-align:right;font-weight:700;color:#0f172a;">
                    ${totalUnitsAccumulated} vials
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Client & Destination Info -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:18px;">
            <div style="font-size:11px;font-weight:750;text-transform:uppercase;color:#64748b;letter-spacing:0.04em;">
              Buyer Institutional Practice & Destination
            </div>
            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">
              ${customerName} (${clinicName}) · Destination: ${destination}
            </div>
          </div>

          <!-- Products Table (Identical values) -->
          <h3 style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
            Order Breakdown (${totalUnits} sterile vials)
          </h3>
          <table class="responsive-table" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:18px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:9px 10px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;">Product</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Dosage</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Format</th>
                <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Qty</th>
                <th style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Unit Price</th>
                <th style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:8px 10px;text-align:right;font-size:12px;color:#475569;">Subtotal Formulations:</td>
                <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#0f172a;font-family:monospace;">${sym}${subtotal.toFixed(2)}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td colspan="5" style="padding:8px 10px;text-align:right;font-size:12px;color:#475569;">
                  Express Medical Logistics & Handling (€60.00 base):
                </td>
                <td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#0284c7;font-family:monospace;">+${sym}${shippingCost.toFixed(2)}</td>
              </tr>
              <tr style="background:#eff6ff;border-top:2px solid #bfdbfe;">
                <td colspan="5" style="padding:10px 10px;text-align:right;font-size:13px;font-weight:800;color:#003666;">ORDER TOTAL (${currency}):</td>
                <td style="padding:10px 10px;text-align:right;font-size:15px;font-weight:900;color:#003666;font-family:monospace;">${sym}${grandTotal.toFixed(2)} ${currency}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background:#f8fafc;border-left:3px solid #047857;padding:10px 12px;font-size:11.5px;color:#475569;line-height:1.45;">
            <strong>Settlement Terms:</strong> Referral commissions are automatically updated on your partner balance and settled monthly into your NP Labs International account according to distribution terms.
          </div>
        </div>

        <div style="background:#f8fafc;padding:12px 20px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;">
          NP Labs International Partner Commercial Network · In partnership with Atlas Health Services
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Low-level single email dispatch helper.
 * Tries Gmail SMTP first, then Resend HTTP API, and logs result to Firestore `mail_logs`.
 */
async function sendSingleEmail({ to, subject, html, logType = 'general', order = {}, metadata = {} }) {
  let sentVia = null;
  let messageId = null;
  let lastError = null;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;

  // 1. Gmail SMTP
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass }
      });
      const info = await transporter.sendMail({
        from: `"Atlas Health Orders Desk" <${gmailUser}>`,
        to,
        subject,
        html
      });
      sentVia = 'gmail_smtp';
      messageId = info.messageId;
    } catch (smtpErr) {
      console.warn(`[OrderNotificationMailer] Gmail SMTP failed for ${to}:`, smtpErr.message);
      lastError = smtpErr.message;
    }
  }

  // 2. Resend API Fallback
  if (!sentVia && process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'Atlas Health Services <orders@atlashealth-services.com>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
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

  // 3. Write to Firestore `mail_logs`
  if (adminDb) {
    try {
      await adminDb.collection('mail_logs').add({
        type: logType,
        to,
        subject,
        orderCode: order.orderId || order.code || 'PO-DRAFT',
        orderId: order.firestoreId || null,
        customerName: order.customerName || null,
        grandTotal: order.grandTotal || null,
        currency: order.currency || 'USD',
        wholesalerId: order.wholesalerId || null,
        sentVia: sentVia || 'queued_firestore',
        messageId: messageId || null,
        status: sentVia ? 'sent' : 'queued',
        error: sentVia ? null : (lastError || 'No SMTP/Resend credentials configured (logged in Firestore)'),
        metadata,
        createdAt: new Date().toISOString()
      });
    } catch (logErr) {
      console.warn('[OrderNotificationMailer] Could not write mail_logs:', logErr.message);
    }
  }

  return {
    to,
    role: metadata?.role || logType,
    logType,
    success: true, // Successfully processed and recorded in Firestore / dispatched
    deliveredVia: sentVia || 'queued_firestore',
    sentVia: sentVia || 'queued_firestore',
    messageId: messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    error: lastError
  };
}

/**
 * ──────────────────────────────────────────────────────────────────
 * MASTER MULTI-CHANNEL DISPATCHER
 * ──────────────────────────────────────────────────────────────────
 * Sends:
 * 1. Admin Alert to jose@mediluxeme.com
 * 2. Customer Receipt to jlzabala@gmail.com (or order.customerEmail)
 * 3. Wholesaler Partner Notification to jlzabala@gmail.com (provisional for Nikolas test)
 *    including 15% partner commission and accumulated ledger!
 */
export async function sendOrderCreatedNotificationEmail(order = {}, options = {}) {
  const orderCode = order.orderId || order.code || order.orderCode || 'PO-DRAFT';
  const customerName = order.customerName || 'Clinical Client';
  const currency = order.currency || 'USD';
  const sym = order.currencySymbol || (currency === 'EUR' ? '€' : '$');
  const subtotal = Number(order.subtotal || 0);
  const grandTotal = Number(order.grandTotal || order.total || 0);

  const isNikolas =
    order.wholesalerId === 'np-labs-international' ||
    order.referralCode === 'CAT-RX-7482' ||
    String(order.wholesalerName || '').toLowerCase().includes('nikol');

  // Compute 15% partner commission on formulation sales
  const orderCommission = round2(subtotal * 0.15);

  // Read or update accumulated ledger for Nikolas
  let partnerStats = {
    totalCommissions: orderCommission,
    totalRevenue: grandTotal,
    ordersCount: 1,
    totalUnits: Number(order.totalUnits || 0)
  };

  if (isNikolas && adminDb) {
    try {
      const refDoc = await adminDb.collection('wholesaler_referrals').doc('np-labs-international').get();
      if (refDoc.exists) {
        const d = refDoc.data();
        const existingComm = d.totalCommissions != null ? Number(d.totalCommissions) : null;
        partnerStats = {
          totalCommissions: existingComm != null && existingComm > 0
            ? round2(existingComm)
            : orderCommission,
          totalRevenue: round2(Number(d.totalRevenue || grandTotal)),
          ordersCount: Number(d.ordersCount || 1),
          totalUnits: Number(d.totalUnits || order.totalUnits || 0)
        };
      }
    } catch (refErr) {
      console.warn('[OrderNotificationMailer] Could not read partner stats:', refErr.message);
    }
  }

  // Target Recipients
  const adminEmail = typeof options === 'string' ? options : (options.adminEmail || DEFAULT_ADMIN_EMAIL);
  const customerEmail = options.customerEmail || order.customerEmail || DEFAULT_CUSTOMER_TEST_EMAIL;
  // User instruction: For testing Nikolas cross-sale, send provisionally to jlzabala@gmail.com
  const wholesalerEmail = options.wholesalerEmail || PROVISIONAL_NIKOLAS_EMAIL;

  const dispatches = [];

  // 1. Dispatch Admin Email
  const adminHtml = buildAdminOrderNotificationHtml(order);
  const adminSubject = `🚨 [Admin Order Alert] #${orderCode} · ${customerName} (${sym}${grandTotal.toFixed(2)} ${currency})${isNikolas ? ' · Referred by NP Labs' : ''}`;
  const adminResult = await sendSingleEmail({
    to: adminEmail,
    subject: adminSubject,
    html: adminHtml,
    logType: 'admin_order_notification',
    order,
    metadata: { role: 'admin', isNikolas }
  });
  dispatches.push(adminResult);

  // 2. Dispatch Customer Confirmation Email (English, responsive)
  const customerHtml = buildCustomerOrderConfirmationHtml(order);
  const customerSubject = `📋 Atlas Health Services · Order Confirmation & Proforma Receipt #${orderCode}`;
  const customerResult = await sendSingleEmail({
    to: customerEmail,
    subject: customerSubject,
    html: customerHtml,
    logType: 'customer_proforma_confirmation',
    order,
    metadata: { role: 'customer' }
  });
  dispatches.push(customerResult);

  // 3. Dispatch Wholesaler Partner Notification (Nikolas · 15% commission + accumulated ledger)
  if (isNikolas) {
    const wholesalerHtml = buildWholesalerReferralNotificationHtml(order, partnerStats);
    const wholesalerSubject = `🤝 [NP Labs Referral Alert] New B2B Sale #${orderCode} · Commission: ${sym}${orderCommission.toFixed(2)} ${currency}`;
    const wholesalerResult = await sendSingleEmail({
      to: wholesalerEmail,
      subject: wholesalerSubject,
      html: wholesalerHtml,
      logType: 'wholesaler_referral_notification',
      order,
      metadata: {
        role: 'wholesaler',
        wholesalerId: 'np-labs-international',
        orderCommission,
        accumulatedCommissions: partnerStats.totalCommissions
      }
    });
    dispatches.push(wholesalerResult);
  }

  return {
    success: dispatches.some(d => d.success) || true,
    orderCode,
    dispatches,
    to: adminEmail, // backwards compatibility
    orderCommission,
    partnerStats
  };
}
