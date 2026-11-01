/**
 * orderNotification.js
 * HTML email template for admin order notifications.
 * Called by Cloud Functions whenever a new order document is created.
 *
 * Modeled after Shopify B2B order confirmations:
 * - Clean typographical hierarchy and institutional branding
 * - 2-Column responsive customer and delivery address cards
 * - Pharmaceutical formulation breakdown with dosage and presentation specs
 * - Exact financial reconciliation with Express Medical Logistics (€60.00 base / $65.22 USD)
 * - 100% responsive for mobile and desktop email clients
 * - Strictly zero mentions of "cold chain"
 */

/**
 * Generates the full HTML email for a new order.
 * @param {Object} order - The order document from Firestore.
 * @returns {string} Full HTML string ready to send.
 */
function buildOrderNotificationHtml(order = {}) {
  const orderId = order.id || order.orderId || order.code || '—';

  const {
    createdAt,
    customer = {},
    items = [],
    subtotal = 0,
    shipping = 0,
    total = 0,
    currency = 'USD',
    shippingAddress = {},
    notes = '',
    paymentMethod = '',
    status = 'draft',
  } = order;

  const s = (status || order.shippingStatus || order.finalStatus || 'draft').toLowerCase();
  let statusBg = '#fffbeb';
  let statusColor = '#d97706';

  if (['active', 'approved', 'reconciled', 'published', 'delivered', 'completed', 'shipped'].includes(s)) {
    statusBg = '#f0fdf4';
    statusColor = '#16a34a';
  } else if (['error', 'rejected', 'disputed', 'failed', 'cancelled'].includes(s)) {
    statusBg = '#fef2f2';
    statusColor = '#dc2626';
  } else if (['inactive', 'archived', 'disabled'].includes(s)) {
    statusBg = '#f1f5f9';
    statusColor = '#64748b';
  } else if (['po_created', 'synced', 'converted', 'en tránsito', 'in_transit'].includes(s)) {
    statusBg = '#eff6ff';
    statusColor = '#2563eb';
  }

  const statusLabelMap = {
    'en tránsito': 'In Transit',
    'in_transit': 'In Transit',
    'awaiting payment': 'Awaiting Payment',
    'awaiting_payment': 'Awaiting Payment',
    'po_created': 'PO Created',
    'delivered': 'Delivered',
    'disputed': 'Disputed',
    'processing': 'Processing',
    'draft': 'Draft',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'active': 'Active',
    'approved': 'Approved'
  };
  const statusLabel = statusLabelMap[s] || (s.charAt(0).toUpperCase() + s.slice(1));

  const currCode = String(currency || order.currency || 'USD').toUpperCase();
  const fmt = (amount) => {
    if (typeof amount === 'string' && (amount.includes('$') || amount.includes('€') || amount.includes('£'))) {
      return amount;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currCode }).format(Number(amount) || 0);
  };

  // Robust calculation of subtotal, shipping freight and grand total
  const numTotal = Number(order.grandTotal || order.totalAmount || order.total || order.price || total || 0);
  const resolvedSubtotal = Number(order.subtotal || subtotal || (items.length > 0 ? items.reduce((acc, i) => acc + (Number(i.lineTotal || i.total || (i.price * i.quantity)) || 0), 0) : 0));

  let resolvedShipping = Number(
    order.shippingCost ??
    order.shippingCostEur ??
    order.shippingFee ??
    order.shipping ??
    shipping ??
    0
  );

  // If shipping is 0 but grand total exceeds subtotal, the difference is the logistics cost
  if (resolvedShipping <= 0 && numTotal > 0 && resolvedSubtotal > 0 && numTotal > resolvedSubtotal) {
    resolvedShipping = Number((numTotal - resolvedSubtotal).toFixed(2));
  }

  // For clinical peptide orders, ensure default €60.00 ($65.22) base rate is reflected if omitted
  if (resolvedShipping <= 0 && (order.collection === 'vials' || String(order.source || '').includes('peptide') || items.length > 0)) {
    resolvedShipping = currCode === 'EUR' ? 60.00 : 65.22;
  }

  const resolvedTotal = numTotal > 0 ? numTotal : Number((resolvedSubtotal + resolvedShipping).toFixed(2));

  // Customer Data Resolution
  const custName = customer.fullName || customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || order.customerName || order.patientName || 'Clinical Client';
  const custEmail = customer.email || order.customerEmail || order.patientEmail || '—';
  const custPhone = customer.phone || order.customerPhone || shippingAddress.phone || '—';
  const custInst = customer.institution || order.customerInstitution || order.clinicName || '';

  // Delivery Address Resolution
  const streetAddr = shippingAddress.street || shippingAddress.address || order.customerAddress || order.deliveryAddress || '';
  const city = shippingAddress.city || order.city || '';
  const state = shippingAddress.state || order.state || '';
  const zip = shippingAddress.zip || shippingAddress.postalCode || order.postalCode || '';
  const country = shippingAddress.country || order.country || '';

  const fullDestinationAddress = [streetAddr, city, [state, zip].filter(Boolean).join(' '), country]
    .filter(Boolean)
    .join(', ') || order.customerAddress || order.deliveryAddress || 'Standard Clinical Courier Dispatch';

  // Payment method human-readable label
  const effPaymentMethod = (paymentMethod || order.paymentMethod || order.paymentTerms || '').toLowerCase();
  const paymentLabel =
    effPaymentMethod === 'bank_transfer' || effPaymentMethod === 'institutional_invoice' ? 'Bank Transfer / Pro-Forma Invoice'
    : effPaymentMethod === 'credit_card' ? 'Credit / Debit Card'
    : effPaymentMethod === 'payment_link_24h' ? 'Official Payment Link (Net 24h Pro-Forma Invoice)'
    : effPaymentMethod ? effPaymentMethod.replace(/_/g, ' ').toUpperCase()
    : 'Official Payment Link (Net 24h Pro-Forma Invoice)';

  // CreatedAt formatting
  let dateObj;
  if (createdAt && typeof createdAt.toDate === 'function') {
    dateObj = createdAt.toDate();
  } else if (createdAt) {
    dateObj = new Date(createdAt);
  } else {
    dateObj = new Date();
  }
  const dateStr = isNaN(dateObj.getTime())
    ? new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
    : dateObj.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  // Resolve API constituents for magistral formulations
  function resolveConstituents(item, orderDoc) {
    if (Array.isArray(item.apiItems) && item.apiItems.length > 0) return item.apiItems;
    if (Array.isArray(item.apis) && item.apis.length > 0) return item.apis;
    if (Array.isArray(item.constituents) && item.constituents.length > 0) return item.constituents;
    if (Array.isArray(orderDoc.apiItems) && orderDoc.apiItems.length > 0) return orderDoc.apiItems;

    const fullStr = `${item.productName || ''} ${item.name || ''} ${item.title || ''} ${item.description || ''} ${item.variant || ''}`.toLowerCase();
    const isCompounded = /magistral|formula|compounding|latanoprost|estradiol|alfatradiol|igrantine|trichosol|minoxidil|finasteride|dutasteride|spironolactone/i.test(fullStr);
    if (!isCompounded) return null;

    const list = [];
    const qty = Number(item.quantity || 1);
    const isMultiPack = /3x|n3|3-month|3 bottles/i.test(fullStr);
    const packFactor = isMultiPack ? 3 : 1;

    if (/latanoprost/i.test(fullStr)) {
      list.push({
        name: 'Latanoprost Fagron',
        genericName: 'Latanoprost Pure API',
        concentration: '0.005% (50 mcg/ml)',
        role: 'Prostaglandin F2α Analogue (Anagen Induction)',
        unitMass: '5 mg/bottle',
        totalBatchMass: `${5 * packFactor * qty} mg`,
        grade: 'Ph.Eur / USP Micronized',
        category: 'Active Pharmaceutical Ingredient (API)'
      });
    }

    if (/estradiol|alfatradiol/i.test(fullStr)) {
      list.push({
        name: '17-α-Estradiol',
        genericName: 'Alfatradiol (Fagron)',
        concentration: '0.05% (500 mcg/ml)',
        role: 'Estrogen Receptor Modulator (Aromatase Activator & 5AR Inhibition)',
        unitMass: '50 mg/bottle',
        totalBatchMass: `${50 * packFactor * qty} mg`,
        grade: 'Ph.Eur Micronized',
        category: 'Active Pharmaceutical Ingredient (API)'
      });
    }

    if (/trichosol/i.test(fullStr)) {
      list.push({
        name: 'TrichoSol™ Base Vehicle',
        genericName: 'TrichoSol Compounding Solution',
        concentration: 'q.s. 100 ml',
        role: 'Patented Phyto-Lipidic Scalp Vehicle (Ethanol & PPG-free)',
        unitMass: '100 ml/bottle',
        totalBatchMass: `${100 * packFactor * qty} ml (${packFactor * qty}x 100ml)`,
        grade: 'Fagron TrichoTech Standard',
        category: 'Compounding Vehicle Base'
      });
    }

    return list.length > 0 ? list : null;
  }

  const itemsRows = items.map((item, idx) => {
    const prodName = item.productName || item.name || item.title || `Item #${idx + 1}`;
    const dosage = item.dosage || (item.variant && item.variant.includes('•') ? item.variant.split('•')[0].trim() : item.variant) || 'Standard';
    const presentation = item.presentation || (item.variant && item.variant.includes('•') ? item.variant.split('•')[1].trim() : 'Lyophilized Vial (10R)') || 'Lyophilized Vial (10R)';
    const itemQty = Number(item.quantity || item.totalVials || 1);
    const itemUnitPrice = Number(item.unitPrice || item.price || 0);
    const itemTotal = Number(item.totalPrice ?? item.total ?? item.lineTotal ?? (itemUnitPrice * itemQty));
    const constituents = resolveConstituents(item, order);

    return `
      <tr>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;vertical-align:top;">
          <div style="font-weight:750;color:#003666;font-size:14px;margin-bottom:4px;">
            ${prodName}
          </div>
          <div style="font-size:11.5px;color:#475569;">
            <span style="display:inline-block;padding:2px 6px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;font-weight:700;color:#0369a1;margin-right:4px;">
              ${dosage}
            </span>
            <span style="display:inline-block;padding:2px 6px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;font-weight:600;color:#334155;">
              ${presentation}
            </span>
          </div>

          ${constituents && constituents.length > 0 ? `
          <div style="margin-top:10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 10px;">
            <div style="font-size:10.5px;font-weight:800;color:#003666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
              🧪 Active Ingredients & Formulation Breakdown (${constituents.length} Components)
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:11px;line-height:1.45;border-collapse:collapse;">
              <tbody>
                ${constituents.map(c => `
                <tr style="border-bottom:1px dashed #e2e8f0;">
                  <td style="padding:4px 0;color:#0f172a;"><strong>• ${c.name}</strong> <span style="color:#64748b;">(${c.concentration})</span></td>
                  <td align="right" style="padding:4px 0;color:#0369a1;font-weight:700;">${c.totalBatchMass || c.unitMass}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
        </td>
        <td style="padding:14px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:center;font-weight:700;vertical-align:top;">
          ${itemQty}
        </td>
        <td class="hide-mobile" style="padding:14px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-family:monospace;vertical-align:top;">
          ${fmt(itemUnitPrice)}
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#003666;text-align:right;font-weight:800;font-family:monospace;vertical-align:top;">
          ${fmt(itemTotal)}
        </td>
      </tr>
    `;
  }).join('');

  const isNikolas =
    order.wholesalerId === 'np-labs-international' ||
    order.referralCode === 'CAT-RX-7482' ||
    order.catalogId === 'CAT-RX-7482' ||
    String(order.wholesalerName || '').toLowerCase().includes('nikol');

  const partnerText = isNikolas
    ? 'Referred by: Nikolaos Psathas · NP Labs International (Wholesaler · Code: CAT-RX-7482)'
    : (order.attributedTo || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New B2B Order #${orderId} — Atlas Health Admin</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 8px 4px !important; }
      .email-container { width: 100% !important; border-radius: 8px !important; }
      .content-box { padding: 18px 14px !important; }
      .stack-cell { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .hide-mobile { display: none !important; }
      .header-title { font-size: 19px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">

  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background:#f1f5f9;padding:28px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,0.06);">

          <!-- Brand Header (Shopify Style) -->
          <tr>
            <td style="background:linear-gradient(135deg,#003666 0%,#0284c7 100%);padding:24px 26px;color:#ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#bae6fd;margin-bottom:4px;">
                      Atlas Health Services · Admin Control Desk
                    </div>
                    <h1 class="header-title" style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">
                      New B2B Order Received
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="font-family:monospace;background:rgba(255,255,255,0.18);color:#ffffff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.3);white-space:nowrap;">
                      #${orderId}
                    </span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:10px;font-size:12.5px;color:#e0f2fe;">
                Placed on <strong>${dateStr}</strong> · Status: <span style="background:${statusBg};color:${statusColor};font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;margin-left:4px;">${statusLabel}</span>
              </div>
            </td>
          </tr>

          <!-- Main Content Box -->
          <tr>
            <td class="content-box" style="padding:24px 26px;">

              <!-- Wholesaler / Partner Attribution (if applicable) -->
              ${partnerText ? `
              <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:12px 14px;margin-bottom:20px;">
                <div style="font-size:10.5px;font-weight:800;text-transform:uppercase;color:#15803d;letter-spacing:0.05em;margin-bottom:3px;">
                  🤝 Commercial Referral & Partner Attribution
                </div>
                <div style="font-size:13px;font-weight:800;color:#14532d;">
                  ${partnerText}
                </div>
                <div style="font-size:11.5px;color:#166534;margin-top:3px;">
                  Pricing Schedule: Base Laboratory Cost + 15% Mediluxe + 15% Wholesaler (+32.25%)
                </div>
              </div>` : ''}

              <!-- Customer & Delivery 2-Column Grid (Shopify Style) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
                <tr>
                  <td class="stack-cell" style="width:50%;vertical-align:top;padding-right:8px;padding-bottom:10px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;box-sizing:border-box;">
                      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#003666;margin-bottom:8px;">
                        👤 Customer Details
                      </div>
                      <div style="font-size:13.5px;font-weight:750;color:#0f172a;margin-bottom:2px;">
                        ${custName}
                      </div>
                      ${custInst ? `<div style="font-size:12px;color:#475569;font-weight:600;margin-bottom:4px;">🏥 ${custInst}</div>` : ''}
                      <div style="font-size:12px;color:#0284c7;margin-bottom:3px;">
                        ✉️ <a href="mailto:${custEmail}" style="color:#0284c7;text-decoration:none;">${custEmail}</a>
                      </div>
                      ${custPhone && custPhone !== '—' ? `<div style="font-size:12px;color:#475569;">📞 ${custPhone}</div>` : ''}
                    </div>
                  </td>
                  <td class="stack-cell" style="width:50%;vertical-align:top;padding-left:8px;padding-bottom:10px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;box-sizing:border-box;">
                      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#003666;margin-bottom:8px;">
                        📍 Delivery Destination
                      </div>
                      <div style="font-size:13.5px;font-weight:750;color:#0f172a;margin-bottom:4px;">
                        ${custInst || custName}
                      </div>
                      <div style="font-size:12px;color:#334155;line-height:1.45;margin-bottom:8px;">
                        ${fullDestinationAddress}
                      </div>
                      <div style="font-size:11px;font-weight:700;color:#0369a1;background:#e0f2fe;padding:2px 8px;border-radius:4px;display:inline-block;border:1px solid #bae6fd;">
                        ✈️ Express Medical Courier
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Ordered Products Table (Shopify Style) -->
              <div style="font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#475569;margin-bottom:8px;">
                📦 Ordered Formulations (${items.length} items · ${items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)} vials)
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                <thead>
                  <tr style="background:#f1f5f9;">
                    <th style="padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;font-weight:700;">Product</th>
                    <th style="padding:9px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;font-weight:700;">Qty</th>
                    <th class="hide-mobile" style="padding:9px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;font-weight:700;">Unit Price</th>
                    <th style="padding:9px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;font-weight:700;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows || `<tr><td colspan="4" style="padding:14px;text-align:center;color:#64748b;font-size:12px;">No line items recorded</td></tr>`}
                </tbody>
              </table>

              <!-- Order Totals & Breakdown (Shopify Style) -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px;margin-bottom:20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748b;">Subtotal (Formulations):</td>
                    <td style="padding:5px 0;font-size:13px;color:#0f172a;text-align:right;font-family:monospace;font-weight:600;">
                      ${fmt(resolvedSubtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#64748b;">
                      Express Medical Logistics & Handling:
                    </td>
                    <td style="padding:5px 0;font-size:13px;color:#0284c7;text-align:right;font-family:monospace;font-weight:700;">
                      +${fmt(resolvedShipping)}
                    </td>
                  </tr>
                  <tr style="border-top:1.5px solid #cbd5e1;">
                    <td style="padding:10px 0 2px;font-size:14px;font-weight:800;color:#003666;">
                      TOTAL DUE (${currCode}):
                    </td>
                    <td style="padding:10px 0 2px;font-size:18px;font-weight:900;color:#003666;text-align:right;font-family:monospace;">
                      ${fmt(resolvedTotal)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Payment Method & Delivery Terms -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;margin-bottom:22px;">
                <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#1e40af;margin-bottom:4px;">
                  💳 Payment Method & Invoicing Terms
                </div>
                <div style="font-size:13px;font-weight:700;color:#1e3a8a;">
                  ${paymentLabel}
                </div>
                <div style="font-size:11.5px;color:#3b82f6;margin-top:3px;line-height:1.4;">
                  Pro-forma invoice and verified payment gateway link are issued within 24 hours prior to laboratory batch preparation.
                </div>
              </div>

              ${(order.customerNotes || order.deliveryNotes || notes) ? `
              <!-- Delivery / Customer Notes -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:22px;">
                <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#92400e;margin-bottom:3px;">
                  📝 Special Delivery Instructions / Notes
                </div>
                <div style="font-size:12.5px;color:#78350f;">
                  ${order.customerNotes || order.deliveryNotes || notes}
                </div>
              </div>` : ''}

              <!-- Primary Action CTA (Shopify Button) -->
              <div style="text-align:center;margin-top:10px;">
                <a href="https://www.atlashealth-services.com/admin/orders"
                   style="display:inline-block;background:#003666;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;border-radius:6px;min-height:44px;line-height:18px;box-sizing:border-box;">
                  Manage Order in Admin →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:11.5px;color:#64748b;line-height:1.5;">
                Atlas Health Services · Mediluxe B2B Clinical Operations<br/>
                For support inquiries, contact <a href="mailto:jose@mediluxeme.com" style="color:#003666;font-weight:600;">jose@mediluxeme.com</a>
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
  const orderId = order.orderId || order.code || order.id || '—';
  const isNikolas =
    order.wholesalerId === 'np-labs-international' ||
    order.wholesalerId === 'nikolaos-psathas' ||
    order.referralCode === 'CAT-RX-7482' ||
    order.catalogId === 'CAT-RX-7482';
  const custName = order.customerName || order.customer?.fullName || order.customer?.name || 'Clinical Client';
  return {
    subject: `🚨 [Atlas B2B Order] #${orderId} · ${custName}${isNikolas ? ' · Ref: Nikolaos Psathas (NP Labs)' : ''}`,
    html: buildOrderNotificationHtml(order),
  };
}

module.exports = { buildOrderNotificationHtml, buildOrderEmail };
