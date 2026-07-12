export const generateInvoicePDF = async (options) => {
  const { targetItems, targetTotals, targetOrderId, targetFormData, targetShipping, protocolGroups } = options;

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(0, 54, 102); doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(20);
  doc.text('Atlas Health', W/2, 16, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Sample Order Confirmation', W/2, 24, { align: 'center' });
  doc.text(`Order ID: ${targetOrderId}`, W/2, 31, { align: 'center' });

  // Customer info
  doc.setTextColor(30,41,59); doc.setFontSize(11); doc.setFont('helvetica','bold');
  doc.text('Customer Information', 15, 50);
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  doc.text(`Name: ${targetFormData.firstName} ${targetFormData.lastName}`, 15, 58);
  doc.text(`Email: ${targetFormData.email}`, 15, 64);
  doc.text(`Phone: ${targetFormData.phone || '—'}`, 15, 70);
  if (targetFormData.clinic) doc.text(`Institution: ${targetFormData.clinic}`, 15, 76);
  doc.text(`Country: ${targetFormData.country?.value || '—'}`, 15, targetFormData.clinic ? 82 : 76);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' })}`, W-15, 58, { align: 'right' });
  doc.text(`Payment: ${targetFormData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit Card'}`, W-15, 64, { align: 'right' });

  // Products table
  autoTable(doc, {
    startY: 92,
    head: [['Product','Qty.','Unit Price','Total']],
    body: targetItems.map(i => [i.namePart + (i.dosagePart ? `\n(${i.dosagePart})` : ''), i.qty, `$${i.unitPrice.toFixed(2)}`, `$${i.lineTotal.toFixed(2)}`]),
    theme: 'striped',
    headStyles: { fillColor: [0,54,102], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [30,41,59] },
    columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 15, right: 15 },
  });

  let fy = doc.lastAutoTable.finalY + 8;
  const sub = targetItems.reduce((a, i) => a + i.lineTotal, 0);
  const shipping = targetTotals.shippingCost;
  const total = sub + shipping;

  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  doc.text('Subtotal:', W-45, fy, { align: 'right' }); doc.text(`$${sub.toFixed(2)}`, W-15, fy, { align: 'right' });
  fy += 6;
  doc.text(`Shipping (${targetShipping}):`, W-45, fy, { align: 'right' }); doc.text(`$${shipping.toFixed(2)}`, W-15, fy, { align: 'right' });
  fy += 8;
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text('Total:', W-45, fy, { align: 'right' }); doc.text(`$${total.toFixed(2)}`, W-15, fy, { align: 'right' });
  fy += 12;
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(100,116,139);
  doc.text('*Final price subject to professional review and approval.', W-15, fy, { align: 'right' });

  // Weekly Dose Calendar
  const pGroups = Object.entries(protocolGroups || {});
  if (pGroups.length > 0) {
    fy += 20;
    if (fy > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); fy = 20; }
    doc.setTextColor(0,54,102); doc.setFont('helvetica','bold'); doc.setFontSize(14);
    doc.text('Protocol Clinical Framework', 15, fy);
    fy += 8;

    pGroups.forEach(([id, group]) => {
      const { name, items, patientGuide } = group;
      const totalUnits = items.reduce((a, i) => a + i.qty, 0);
      const weeks = Math.max(1, Math.round(totalUnits / Math.max(1, items.length)));
      
      doc.setFillColor(248, 250, 252); doc.rect(15, fy, W-30, 10, 'F');
      doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text(`${name} — ${weeks} Week Research Program`, 20, fy + 6.5);
      fy += 14;

      const rows = Array.from({ length: weeks }, (_, wi) =>
        [String(wi + 1), ...items.map(({ itemKey, qty }) => `${(qty / weeks).toFixed(1)} unit/w`)]
      );
      autoTable(doc, {
        startY: fy,
        head: [['Week', ...items.map(i => i.itemKey.length > 20 ? i.itemKey.slice(0,18)+'…' : i.itemKey)]],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [0,112,192], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [30,41,59] },
        columnStyles: { 0: { halign: 'center', cellWidth: 15 } },
        margin: { left: 15, right: 15 },
        didDrawPage: (d) => { fy = d.cursor.y; },
      });
      fy = doc.lastAutoTable.finalY + 12;

      if (patientGuide?.expectedResults) {
        if (fy > doc.internal.pageSize.getHeight() - 70) { doc.addPage(); fy = 20; }
        doc.setTextColor(0, 54, 102); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
        doc.text(`Expected Clinical Outcomes: ${patientGuide.expectedResults.metric}`, 15, fy);
        fy += 6;

        const obs = patientGuide.expectedResults.observations || [];
        const chartW = W - 30;
        const barH = 5;
        const gap = 8;

        obs.forEach((o, idx) => {
          const valMatch = o.match(/([\d.]+)\s*(%|cm|kg|lb)/i);
          const val = valMatch ? parseFloat(valMatch[1]) : 50;
          const label = o.split(':')[0].trim();
          const valueStr = o.split(':').pop().trim();
          const pct = Math.min((val / 100) * chartW, chartW); 

          doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
          doc.text(label, 15, fy + 4);
          doc.text(valueStr, W - 15, fy + 4, { align: 'right' });
          fy += 6;
          doc.setFillColor(224, 242, 254); doc.rect(15, fy, chartW, barH, 'F');
          doc.setFillColor(0, 112, 192); doc.rect(15, fy, pct, barH, 'F');
          fy += gap;
        });
        fy += 6;
      }

      if (patientGuide?.safetyNotes) {
        if (fy > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); fy = 20; }
        doc.setFillColor(240, 253, 244); doc.setDrawColor(220, 252, 231);
        doc.rect(15, fy, W-30, 18, 'FD');
        doc.setTextColor(22, 101, 52); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text('Clinical Safety & Monitoring', 20, fy + 6);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        const safetyText = `• Side Effects: Monitor for ${patientGuide.safetyNotes.sideEffects?.join(', ') || 'standard markers'}.\n• Labs: ${patientGuide.safetyNotes.recommendedTests?.join(', ') || 'Routine panel'}.`;
        doc.text(safetyText, 20, fy + 11);
        fy += 24;
      }
      fy += 10;
    });
  }

  const footY = doc.internal.pageSize.getHeight()-15;
  doc.setDrawColor(226,232,240); doc.line(15, footY-4, W-15, footY-4);
  doc.setFontSize(8); doc.setTextColor(148,163,184);
  doc.text('Atlas Health — Advanced Research Solutions | info@Atlas Health.com', W/2, footY, { align: 'center' });
  doc.save(`Atlas Health-Order-${targetOrderId}.pdf`);
};

export const getReceiptHTML = (options) => {
  const { targetTotals, targetItems, targetOrderId, targetFormData, targetShipping } = options;
  const { subtotal, shippingCost } = targetTotals;
  const total = subtotal + shippingCost;
  const shippingLabel = targetShipping.charAt(0).toUpperCase() + targetShipping.slice(1);
  const paymentLabel = targetFormData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit / Debit Card';
  const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmt = (n) => `$${n.toFixed(2)}`;

  const itemRows = targetItems.map(i => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#1e293b;">
        ${i.namePart}${i.dosagePart ? `<br><span style="font-size:12px;color:#64748b;">${i.dosagePart}</span>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:center;">${i.qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:right;">${fmt(i.unitPrice)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;font-weight:600;color:#003666;text-align:right;">${fmt(i.lineTotal)}</td>
    </tr>`).join('');

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
            Dear <strong>${targetFormData.firstName} ${targetFormData.lastName}</strong>,<br/><br/>
            Thank you for your research inquiry. We have received your request and a specialist from our team will contact you shortly with the formal quotation documentation.
          </p>
          <!-- Meta row -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="width:33%;vertical-align:top;padding-right:8px;">
                <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Date</p>
                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${dateStr}</p>
              </td>
              <td style="width:33%;vertical-align:top;padding:0 8px;">
                <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Payment</p>
                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${paymentLabel}</p>
              </td>
              <td style="width:33%;vertical-align:top;padding-left:8px;">
                <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Email</p>
                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${targetFormData.email}</p>
              </td>
            </tr>
          </table>
          <!-- Products table -->
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#003666;text-transform:uppercase;letter-spacing:1px;">📦 Your Order</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:24px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left;font-weight:600;">Product</th>
                <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;font-weight:600;">Qty.</th>
                <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;font-weight:600;">Unit Price</th>
                <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;font-weight:600;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:6px 0;"><p style="margin:0;font-size:14px;color:#64748b;">Subtotal</p></td>
              <td style="padding:6px 0;text-align:right;"><p style="margin:0;font-size:14px;color:#1e293b;">${fmt(subtotal)}</p></td>
            </tr>
            <tr>
              <td style="padding:6px 0;"><p style="margin:0;font-size:14px;color:#64748b;">Shipping (${shippingLabel})</p></td>
              <td style="padding:6px 0;text-align:right;"><p style="margin:0;font-size:14px;color:#1e293b;">${fmt(shippingCost)}</p></td>
            </tr>
            <tr>
              <td style="padding:14px 0 6px;border-top:2px solid #003666;"><p style="margin:0;font-size:16px;font-weight:700;color:#003666;">ESTIMATED TOTAL</p></td>
              <td style="padding:14px 0 6px;border-top:2px solid #003666;text-align:right;"><p style="margin:0;font-size:20px;font-weight:700;color:#003666;">${fmt(total)}</p></td>
            </tr>
          </table>
          <!-- Next steps -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">📋 Next Steps</p>
            <ol style="margin:0;padding-left:1.25rem;font-size:13px;color:#0c4a6e;line-height:1.8;">
              <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
              <li>You will receive a formal quotation with pricing and documentation.</li>
              <li>Following approval, we will provide payment and shipping instructions.</li>
            </ol>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            Atlas Health — Advanced Research Solutions<br/>
            Questions? <a href="mailto:info@Atlas Health.com" style="color:#003666;">info@Atlas Health.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export const previewReceipt = (options) => {
  const html = getReceiptHTML(options);
  const win = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};
