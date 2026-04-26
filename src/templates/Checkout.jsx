import { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Landmark, Send, CheckCircle2, FileDown, ChevronRight, ChevronDown, ChevronUp, Check, Activity, Truck, BookOpen, MessageCircle } from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { resolveVariantPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';
// jsPDF and autoTable are loaded dynamically on demand (see downloadPDF)
import { ALL_COUNTRIES } from '../data/countries';

const selectStyles = {
  control: (b, s) => ({
    ...b,
    padding: '0.2rem 0.25rem',
    borderRadius: '10px',
    borderColor: s.isFocused ? 'var(--primary)' : '#e2e8f0',
    borderWidth: '1px',
    boxShadow: s.isFocused ? '0 0 0 3px rgba(0,75,135,0.08)' : 'none',
    fontSize: '0.95rem',
    '&:hover': { borderColor: '#94a3b8' },
  }),
  option: (b, s) => ({
    ...b,
    fontSize: '0.9rem',
    backgroundColor: s.isSelected ? 'var(--primary)' : s.isFocused ? '#f0f9ff' : '#fff',
  }),
};

export default function Checkout({ cart, cartMetadata = {}, region, isProfessional, EXCHANGE_RATES, detectedCountry, onBack, onComplete, products, shippingCosts = { standard: 40, express: 80, courier: 60 } }) {
  const { user, userProfile, updateProfileData } = useAuth();
  const { tier: pricingTier, role: pricingRole } = usePricingTier();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('co-overlay')?.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    clinic: '', address: '', country: null, paymentMethod: 'credit_card'
  });

  const set = useCallback(patch => setFormData(p => ({ ...p, ...patch })), []);

  const countryOptions = useMemo(() =>
    ALL_COUNTRIES.map(c => ({ value: c.name, label: `${c.flag} ${c.name}` }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  []);

  useEffect(() => {
    if (!userProfile || prefillApplied || !countryOptions.length) return;
    // Back-compat: if old profile still has fullName, split it; new profiles have firstName/lastName directly
    const firstName = userProfile.firstName || (userProfile.fullName || user?.displayName || '').split(' ')[0] || '';
    const lastName = userProfile.lastName || (userProfile.fullName || user?.displayName || '').split(' ').slice(1).join(' ') || '';
    const addr = [userProfile.shippingStreet, userProfile.shippingCity, userProfile.shippingZip].filter(Boolean).join(', ');
    const countryOpt = countryOptions.find(c => c.value === userProfile.shippingCountry) || null;
    set({
      firstName,
      lastName,
      email: userProfile.email || user?.email || '',
      phone: userProfile.phone || '',
      clinic: userProfile.institution || '',
      address: addr,
      country: countryOpt,
    });
    setPrefillApplied(true);
  }, [userProfile, countryOptions, prefillApplied, user, set]);

  useEffect(() => {
    if (prefillApplied) return;
    const name = detectedCountry || EXCHANGE_RATES[region]?.name || 'United Arab Emirates';
    const found = countryOptions.find(c => c.value === name || c.value === detectedCountry);
    if (found) set({ country: found });
  }, [region, detectedCountry, countryOptions, prefillApplied, set]);

  const activeRegion = useMemo(() => {
    if (!formData.country) return region;
    const m = Object.entries(EXCHANGE_RATES).find(([, v]) => v.name === formData.country.value);
    return m ? m[0] : 'row';
  }, [formData.country, EXCHANGE_RATES, region]);

  const cartItems = Object.entries(cart);
  const totalItems = cartItems.reduce((a, [, q]) => a + q, 0);

  const resolveItem = useCallback((itemKey, qty) => {
    let namePart = itemKey, dosagePart = null;
    if (itemKey.includes('(')) {
      const m = itemKey.match(/(.+) \((.+)\)/);
      if (m) { namePart = m[1]; dosagePart = m[2]; }
    }
    const product = products.find(p => p.name === namePart);
    let unitPrice = 0, lineTotal = 0;
    if (product) {
      const variant = dosagePart ? product.variants?.find(v => v.dosage === dosagePart || v.strength === dosagePart) : null;
      const src = variant ?? product.defaultVariant ?? product.variants?.[0] ?? product;
      const resolved = resolveVariantPrice(src, { tier: pricingTier });
      unitPrice = resolved.perUnit ?? 0;
      const kitPrice = resolved.kit ?? 0;
      if (isProfessional && product.category !== 'Research Supplies' && kitPrice > 0 && qty >= 10) {
        const kits = Math.floor(qty / 10);
        lineTotal = (kits * kitPrice) + ((qty % 10) * unitPrice);
      } else {
        lineTotal = unitPrice * qty;
      }
    }
    return { itemKey, qty, namePart, dosagePart, unitPrice, lineTotal };
  }, [products, pricingTier, isProfessional]);

  const enrichedCartItems = useMemo(() => cartItems.map(([k, q]) => resolveItem(k, q)), [cartItems, resolveItem]);

  const checkoutTotals = useMemo(() => {
    const subtotal = enrichedCartItems.reduce((a, i) => a + i.lineTotal, 0);
    const shippingCost = shippingCosts[selectedShipping] ?? 40;
    const total = subtotal + shippingCost;
    const fmt = v => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return { display: `$${fmt(total.toFixed(0))}`, subtotal, shippingCost, subtext: `Includes $${shippingCost} ${selectedShipping} shipping` };
  }, [enrichedCartItems, shippingCosts, selectedShipping]);

  // ── Protocol groups (for Protocol Review in Step 3) ──────────────────
  const protocolGroups = useMemo(() => {
    const groups = {};
    cartItems.forEach(([itemKey, qty]) => {
      const meta = cartMetadata[itemKey];
      if (meta?.protocolRequest) {
        const key = meta.protocolName || 'Protocol';
        if (!groups[key]) groups[key] = [];
        groups[key].push({ itemKey, qty });
      }
    });
    return groups;
  }, [cartItems, cartMetadata]);
  const hasProtocols = Object.keys(protocolGroups).length > 0;

  const step1Valid = formData.firstName && formData.lastName && formData.email && formData.phone && (!isProfessional || formData.clinic);
  const step2Valid = formData.country && formData.address;

  const scrollReset = () => {
    window.scrollTo(0, 0);
    document.getElementById('co-overlay')?.scrollTo(0, 0);
  };

  const goNext = () => {
    if (step === 1 && !step1Valid) { alert('Please fill in all required fields.'); return; }
    if (step === 2 && !step2Valid) { alert('Please fill in all required fields.'); return; }
    setStep(s => Math.min(s + 1, 3)); scrollReset();
  };
  const goBack = () => { setStep(s => Math.max(s - 1, 1)); scrollReset(); };

  const generateOrderId = () => {
    const n = new Date();
    return `ORD-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const newId = generateOrderId();
    setOrderId(newId);
    const shippingCost = shippingCosts[selectedShipping] ?? 40;
    try {
      const items = enrichedCartItems.map(i => ({ name: i.itemKey, variant: i.dosagePart, quantity: i.qty, unitPrice: i.unitPrice, lineTotal: i.lineTotal }));
      const subtotal = enrichedCartItems.reduce((a, i) => a + i.lineTotal, 0);
      const total = subtotal + shippingCost;
      await addDoc(collection(db, 'orders'), {
        uid: user?.uid || null, orderId: newId,
        customer: { fullName: `${formData.firstName} ${formData.lastName}`, firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, institution: formData.clinic || null },
        shippingAddress: { street: formData.address, country: formData.country?.value || null },
        items, subtotal, shipping: shippingCost, shippingMethod: selectedShipping, total,
        totalDisplay: `$${total.toFixed(0)}`,
        currency: EXCHANGE_RATES[activeRegion]?.currency || 'USD',
        region: activeRegion, paymentMethod: formData.paymentMethod,
        isProfessional, pricingTier, pricingRole, status: 'pending', createdAt: serverTimestamp(),
      });
      // ── Write back to the unified users/{uid} profile ──
      if (user?.uid) {
        await updateProfileData({
          firstName:       formData.firstName,
          lastName:        formData.lastName,
          phone:           formData.phone,
          institution:     formData.clinic || userProfile?.institution || '',
          shippingStreet:  formData.address,
          shippingCountry: formData.country?.value || '',
          // Keep city/zip intact if they already existed; address field is free-text here
          shippingCity:    userProfile?.shippingCity || '',
          shippingZip:     userProfile?.shippingZip  || '',
        });
      }
    } catch (err) { console.error(err); }
    setIsSubmitting(false);
    setIsDone(true);
    if (onComplete) onComplete();
  };

  const downloadPDF = useCallback(async () => {
    // ── Lazy-load PDF libraries only when needed ──
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    // ── Header band ──
    doc.setFillColor(0, 54, 102); doc.rect(0, 0, W, 36, 'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(20);
    doc.text('Med-Peptides', W/2, 16, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Research Inquiry Confirmation', W/2, 24, { align: 'center' });
    doc.text(`Order ID: ${orderId}`, W/2, 31, { align: 'center' });

    // ── Customer info ──
    doc.setTextColor(30,41,59); doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('Customer Information', 15, 50);
    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    doc.text(`Name: ${formData.firstName} ${formData.lastName}`, 15, 58);
    doc.text(`Email: ${formData.email}`, 15, 64);
    doc.text(`Phone: ${formData.phone || '—'}`, 15, 70);
    if (formData.clinic) doc.text(`Institution: ${formData.clinic}`, 15, 76);
    doc.text(`Country: ${formData.country?.value || '—'}`, 15, formData.clinic ? 82 : 76);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}`, W-15, 58, { align: 'right' });
    doc.text(`Payment: ${formData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit Card'}`, W-15, 64, { align: 'right' });

    // ── Products table ──
    autoTable(doc, {
      startY: 92,
      head: [['Product','Qty','Unit Price','Total']],
      body: enrichedCartItems.map(i => [i.namePart + (i.dosagePart ? `\n(${i.dosagePart})` : ''), i.qty, `$${i.unitPrice.toFixed(2)}`, `$${i.lineTotal.toFixed(2)}`]),
      theme: 'striped',
      headStyles: { fillColor: [0,54,102], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [30,41,59] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 15, right: 15 },
    });

    let fy = doc.lastAutoTable.finalY + 8;
    const sub = enrichedCartItems.reduce((a, i) => a + i.lineTotal, 0);
    const shipping = checkoutTotals.shippingCost;
    const total = sub + shipping;

    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    doc.text('Subtotal:', W-45, fy, { align: 'right' }); doc.text(`$${sub.toFixed(2)}`, W-15, fy, { align: 'right' });
    fy += 6;
    doc.text(`Shipping (${selectedShipping}):`, W-45, fy, { align: 'right' }); doc.text(`$${shipping.toFixed(2)}`, W-15, fy, { align: 'right' });
    fy += 8;
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.text('Total:', W-45, fy, { align: 'right' }); doc.text(`$${total.toFixed(2)}`, W-15, fy, { align: 'right' });
    
    fy += 12;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(100,116,139);
    doc.text('*Final price subject to professional review and approval.', W-15, fy, { align: 'right' });

    // ── Weekly Dose Calendar (per protocol group) ──
    const pGroups = Object.entries(protocolGroups);
    if (pGroups.length > 0) {
      fy += 20;
      if (fy > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); fy = 20; }
      doc.setTextColor(0,54,102); doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text('Weekly Dose Calendar', 15, fy);
      fy += 6;
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(100,116,139);
      doc.text('Dose schedule estimated from cart quantities. Confirm with prescribing physician.', 15, fy);
      fy += 4;

      pGroups.forEach(([protocolName, items]) => {
        const totalUnits = items.reduce((a, i) => a + i.qty, 0);
        const weeks = Math.max(1, Math.round(totalUnits / Math.max(1, items.length)));
        const rows = Array.from({ length: weeks }, (_, wi) =>
          [String(wi + 1), ...items.map(({ itemKey, qty }) => `${(qty / weeks).toFixed(1)} vial/w`)]
        );
        autoTable(doc, {
          startY: fy + 4,
          head: [['Week', ...items.map(i => i.itemKey.length > 20 ? i.itemKey.slice(0,18)+'…' : i.itemKey)]],
          body: rows,
          theme: 'grid',
          headStyles: { fillColor: [0,112,192], textColor: 255, fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8, textColor: [30,41,59] },
          columnStyles: { 0: { halign: 'center', cellWidth: 18 } },
          margin: { left: 15, right: 15 },
          didDrawPage: (d) => { fy = d.cursor.y; },
        });
        fy = doc.lastAutoTable.finalY + 6;
        doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(0,54,102);
        doc.text(`↑ ${protocolName} — ${weeks}-week cycle, ${totalUnits} total units`, 15, fy);
        fy += 8;
      });
    }

    // ── Footer ──
    const footY = doc.internal.pageSize.getHeight()-15;
    doc.setDrawColor(226,232,240); doc.line(15, footY-4, W-15, footY-4);
    doc.setFontSize(8); doc.setTextColor(148,163,184);
    doc.text('Med-Peptides — Advanced Research Solutions | info@med-peptides.com', W/2, footY, { align: 'center' });
    doc.save(`MedPeptides-Order-${orderId}.pdf`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, formData, enrichedCartItems, protocolGroups, checkoutTotals, selectedShipping]);

  // ── Preview Receipt (HTML popup — same format as email) ──────────────
  const previewReceipt = useCallback(() => {
    const { subtotal, shippingCost } = checkoutTotals;
    const total = subtotal + shippingCost;
    const shippingLabel = selectedShipping.charAt(0).toUpperCase() + selectedShipping.slice(1);
    const paymentLabel = formData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit / Debit Card';
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmt = (n) => `$${n.toFixed(2)}`;

    const itemRows = enrichedCartItems.map(i => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#1e293b;">
          ${i.namePart}${i.dosagePart ? `<br><span style="font-size:12px;color:#64748b;">${i.dosagePart}</span>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:center;">${i.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:right;">${fmt(i.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;font-weight:600;color:#003666;text-align:right;">${fmt(i.lineTotal)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Receipt — ${orderId} — Med-Peptides</title>
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
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:8px;">Research Inquiry</p>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Med-Peptides</h1>
          <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Advanced Research Solutions</p>
        </td></tr>

        <!-- Banner -->
        <tr><td style="background:#10b981;padding:14px 36px;text-align:center;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">
            ✅ Order Confirmed — <span style="font-family:monospace;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;">#${orderId}</span>
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

          <!-- Greeting -->
          <p style="margin:0 0 24px;font-size:16px;color:#1e293b;line-height:1.6;">
            Dear <strong>${formData.firstName} ${formData.lastName}</strong>,<br/><br/>
            Thank you for your research inquiry. We have received your request and a specialist from our team will contact you shortly with formal quotation documentation.
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
                <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${formData.email}</p>
              </td>
            </tr>
          </table>

          ${formData.clinic || formData.country?.value ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              ${formData.clinic ? `<td style="width:50%;vertical-align:top;padding-right:8px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Institution</p><p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${formData.clinic}</p></td>` : ''}
              ${formData.country?.value ? `<td style="width:50%;vertical-align:top;padding-left:8px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Country</p><p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${formData.country.value}</p></td>` : ''}
            </tr>
          </table>` : ''}

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
          <p style="margin:-18px 0 24px;font-size:11px;color:#94a3b8;text-align:right;">*Final price subject to professional review and approval.</p>

          <!-- Next steps -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">📋 Next Steps</p>
            <ol style="margin:0;padding-left:1.25rem;font-size:13px;color:#0c4a6e;line-height:1.8;">
              <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
              <li>You will receive a formal quotation with pricing and documentation.</li>
              <li>Upon approval, we will provide payment and shipping instructions.</li>
            </ol>
          </div>

          <!-- Tracking ID -->
          <div style="text-align:center;background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:8px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Your Order ID</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#003666;letter-spacing:0.05em;font-family:monospace;">${orderId}</p>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            Med-Peptides — Advanced Research Solutions<br/>
            Questions? <a href="mailto:info@med-peptides.com" style="color:#003666;">info@med-peptides.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, formData, enrichedCartItems, checkoutTotals, selectedShipping]);

  // ── Order Summary panel (reused in sidebar + sheet) ──────────────────
  const SummaryItems = () => (
    <>
      {enrichedCartItems.map(({ itemKey, qty, namePart, dosagePart, unitPrice, lineTotal }) => (
        <div key={itemKey} className="co-item-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="co-item-name">{namePart}</div>
            {dosagePart && <div className="co-item-variant">{dosagePart}</div>}
            <div className="co-item-qty">{qty} × ${unitPrice.toFixed(2)}</div>
          </div>
          <div className="co-item-price">${lineTotal.toFixed(2)}</div>
        </div>
      ))}
      <div className="co-total-row">
        <div>
          <div className="co-total-label">Estimated Total</div>
          <div className="co-total-sub">*{checkoutTotals.subtext}</div>
        </div>
        <div className="co-total-amount">{checkoutTotals.display}</div>
      </div>
    </>
  );

  // ── Protocol Activation Page ──────────────────────────────────────────
  if (isDone) {
    const suppliesItems = enrichedCartItems.filter(i => !cartMetadata[i.itemKey]?.protocolRequest);
    const planGroups = Object.entries(protocolGroups);

    const NEXT_STEPS = [
      { icon: Truck,    label: 'Logistics in progress',    sub: 'Your order is being prepared. Track your shipment via email.' },
      { icon: FileDown, label: 'Download your data sheet',  sub: 'Clinical summary, dose schedule, and order receipt.' },
      { icon: BookOpen, label: 'Lab Setup Guide',           sub: 'Consult Page 4 of the PDF for preparation instructions.' },
    ];

    return (
      <>
        {/* Keyframe injection */}
        <style>{`
          @keyframes pa-pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(0,113,189,0.18); }
            50%      { box-shadow: 0 0 0 12px rgba(0,113,189,0.0); }
          }
          @keyframes pa-ring {
            0%   { transform: scale(0.75); opacity:0; }
            60%  { transform: scale(1.06); opacity:1; }
            100% { transform: scale(1);   opacity:1; }
          }
          @keyframes pa-fade-up {
            from { opacity:0; transform: translateY(14px); }
            to   { opacity:1; transform: translateY(0); }
          }
          .pa-section { animation: pa-fade-up 0.5s ease both; }
          .pa-section:nth-child(2) { animation-delay: 0.07s; }
          .pa-section:nth-child(3) { animation-delay: 0.14s; }
          .pa-section:nth-child(4) { animation-delay: 0.21s; }
          .pa-section:nth-child(5) { animation-delay: 0.28s; }
          .pa-step-item:hover .pa-step-icon { background: var(--primary); color: #fff; transition: background 0.25s, color 0.25s; }

          /* ── Responsive layout ── */
          .pa-content-grid {
            display: flex;
            flex-direction: column;
            gap: 1.75rem;
            width: 100%;
          }
          .pa-col-left, .pa-col-right {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .pa-card {
            background: #ffffff;
            border: 0.5px solid rgba(0,0,0,0.09);
            border-radius: 16px;
            overflow: hidden;
          }
          .pa-card-blue {
            background: #ffffff;
            border: 0.5px solid rgba(0,113,189,0.18);
            border-radius: 16px;
            overflow: hidden;
          }
          .pa-card-green {
            background: #ffffff;
            border: 0.5px solid rgba(37,211,102,0.28);
            border-radius: 16px;
            overflow: hidden;
          }
          /* Desktop: 2-column grid */
          @media (min-width: 960px) {
            .pa-content-grid {
              display: grid;
              grid-template-columns: 1fr 340px;
              grid-template-rows: auto;
              align-items: start;
              gap: 1.75rem;
              max-width: 980px;
            }
            .pa-col-right {
              position: sticky;
              top: 2rem;
            }
          }
          /* Mobile: single card feel */
          @media (max-width: 640px) {
            .pa-content-grid { padding: 0; }
            .pa-card, .pa-card-blue, .pa-card-green {
              border-radius: 12px;
            }
          }
        `}</style>

        <div id="co-overlay" style={{
          position: 'fixed', inset: 0, background: '#ffffff',
          zIndex: 3000, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 'clamp(3rem,8vh,6rem) clamp(1rem,4vw,2.5rem) 4rem',
        }}>
          {/* Hero header — always full width */}
          <div className="pa-section" style={{ textAlign: 'center', width: '100%', maxWidth: 980, marginBottom: '0.5rem' }}>
              {/* Animated check ring */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 84, height: 84, borderRadius: '50%',
                border: '0.5px solid rgba(0,113,189,0.2)',
                animation: 'pa-ring 0.5s cubic-bezier(0.34,1.56,0.64,1) both, pa-pulse 2.6s ease-in-out 0.8s infinite',
                marginBottom: '1.25rem',
              }}>
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={30} color="#fff" strokeWidth={2.5} />
                </div>
              </div>

              <div style={{
                display: 'inline-block',
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em',
                color: hasProtocols ? 'var(--primary)' : '#10b981',
                textTransform: 'uppercase',
                border: hasProtocols ? '1px solid rgba(0,113,189,0.25)' : '1px solid rgba(16,185,129,0.3)',
                borderRadius: '20px', padding: '0.25rem 0.85rem',
                marginBottom: '1rem',
                background: hasProtocols ? 'rgba(0,113,189,0.04)' : 'rgba(16,185,129,0.05)',
              }}>
                {hasProtocols ? 'Protocol Status: ACTIVATED' : 'Order Status: CONFIRMED'}
              </div>

              {/* ── Protocol banner ── */}
              {hasProtocols && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.06) 100%)',
                  border: '0.5px solid rgba(245,158,11,0.4)',
                  borderRadius: '10px', padding: '0.45rem 1rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: '#92400e', letterSpacing: '0.03em',
                }}>
                  <Activity size={13} strokeWidth={2} color="#d97706" />
                  Protocolo de Investigación Activado
                </div>
              )}

              <h1 style={{
                fontSize: 'clamp(1.7rem,4.5vw,2.6rem)', fontWeight: 800,
                color: '#0f172a', lineHeight: 1.15, marginBottom: '0.6rem',
              }}>
                {hasProtocols ? 'Protocol Activated' : 'Order Confirmed'}
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                Thank you, <strong style={{ color: '#0f172a' }}>{formData.firstName}</strong>. Your research inquiry has been registered.
                A specialist will contact you at <strong style={{ color: '#0f172a' }}>{formData.email}</strong> or via <strong style={{ color: '#0f172a' }}>WhatsApp</strong>.
              </p>
            </div>

          {/* ── 2-column responsive grid ── */}
          <div className="pa-content-grid">

            {/* ── LEFT COLUMN: Steps + CTAs + WhatsApp + Footer ── */}
            <div className="pa-col-left">

            {/* ── 4. Next Steps Stepper ── */}
            <div className="pa-section" style={{
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.65rem 1.25rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: '0.62rem', fontWeight: 700, color: '#64748b',
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>Next Steps for Researchers</div>
              <div style={{ padding: '0.5rem 1.25rem 0.85rem' }}>
                {NEXT_STEPS.map(({ icon: Icon, label, sub }, idx) => (
                  <div key={idx} className="pa-step-item" style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '0.85rem 0',
                    borderBottom: idx < NEXT_STEPS.length - 1 ? '0.5px solid #f1f5f9' : 'none',
                  }}>
                    {/* Step line + icon */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', paddingTop: '2px' }}>
                      <div className="pa-step-icon" style={{
                        width: 34, height: 34, borderRadius: '50%',
                        border: '1px solid rgba(0,113,189,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', flexShrink: 0,
                        transition: 'background 0.25s, color 0.25s',
                      }}>
                        <Icon size={15} strokeWidth={1.8} />
                      </div>
                      {idx < NEXT_STEPS.length - 1 && (
                        <div style={{ width: 1, height: 18, background: 'rgba(0,113,189,0.12)' }} />
                      )}
                    </div>
                    <div style={{ paddingTop: '0.35rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--primary)', marginRight: '0.4rem', fontSize: '0.72rem' }}>0{idx + 1}</span>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5. CTAs ── */}
            <div className="pa-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Primary: Download PDF — more prominent when protocol present */}
              <button
                onClick={downloadPDF}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  padding: hasProtocols ? '1.2rem 1.5rem' : '1.1rem 1.5rem',
                  background: hasProtocols
                    ? 'linear-gradient(135deg, #1e40af 0%, var(--primary) 50%, #0ea5e9 100%)'
                    : 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontWeight: 700, fontSize: hasProtocols ? '1rem' : '0.95rem', cursor: 'pointer',
                  letterSpacing: '0.01em',
                  boxShadow: hasProtocols ? '0 4px 20px rgba(0,113,189,0.35)' : 'none',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <FileDown size={hasProtocols ? 20 : 18} strokeWidth={1.8} />
                {hasProtocols ? 'Descargar Manual de Protocolo (PDF)' : 'Download Receipt (PDF)'}
              </button>

              {/* Preview & Print Receipt */}
              {!hasProtocols && (
                <button
                  onClick={previewReceipt}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    padding: '1rem 1.5rem',
                    background: 'rgba(0,54,102,0.06)',
                    border: '1px solid rgba(0,54,102,0.18)',
                    borderRadius: 12, fontWeight: 600,
                    fontSize: '0.9rem', color: 'var(--primary)', cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(0,54,102,0.12)'; e.currentTarget.style.borderColor='var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(0,54,102,0.06)'; e.currentTarget.style.borderColor='rgba(0,54,102,0.18)'; }}
                >
                  🖨️ Preview &amp; Print Receipt
                </button>
              )}

              {/* Secondary: Continue Shopping */}
              <button
                onClick={() => { onBack(); }}
                style={{
                  padding: '0.95rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 12, fontWeight: 600,
                  fontSize: hasProtocols ? '0.85rem' : '0.9rem',
                  color: hasProtocols ? '#94a3b8' : '#334155', cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor='rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = hasProtocols ? '#94a3b8' : '#334155';
                }}
              >
                Continue Shopping
              </button>
            </div>

            {/* ── 6. WhatsApp Contact Section ── */}
            <div className="pa-section" style={{
              border: '0.5px solid rgba(37,211,102,0.25)',
              borderRadius: 16,
              background: 'rgba(37,211,102,0.03)',
              padding: '1.25rem 1.5rem',
            }}>
              <p style={{
                fontSize: '0.82rem', color: '#334155', lineHeight: 1.7,
                margin: '0 0 1rem',
              }}>
                Nuestro equipo técnico está disponible para guiarle. También podemos contactar con usted vía
                {' '}<strong style={{ color: '#0f172a' }}>WhatsApp</strong> para cualquier duda sobre la administración de su protocolo.
              </p>
              <button
                onClick={() => {
                  const WA_NUMBER = '971564179256';
                  const msg = encodeURIComponent(`Hola, acabo de realizar el pedido ${orderId} y necesito orientación sobre mi protocolo.`);
                  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  width: '100%', padding: '0.9rem 1.5rem',
                  background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <MessageCircle size={18} strokeWidth={1.8} />
                Contactar por WhatsApp
              </button>
            </div>

            {/* ── 7. Footer disclaimer ── */}
            <div className="pa-section" style={{
              textAlign: 'center',
              fontSize: '0.68rem', color: '#cbd5e1',
              letterSpacing: '0.08em', paddingTop: '0.5rem',
            }}>
              FOR RESEARCH USE ONLY — Not for human therapeutic use &nbsp;·&nbsp; med-peptides.com
            </div>

            </div>{/* end pa-col-left */}

            {/* ── RIGHT COLUMN: Order Card + Supplies ── */}
            <div className="pa-col-right">

              {/* Order ID card */}
              <div className="pa-section" style={{
                border: '0.5px solid rgba(0,113,189,0.14)',
                borderRadius: 16,
                background: 'rgba(248,252,255,0.85)',
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Tracking Reference</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>{orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Status</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', letterSpacing: '0.08em' }}>● Processing</div>
                </div>
              </div>

              {/* Research Supplies Inventory */}
              {(suppliesItems.length > 0 || planGroups.length > 0) && (
                <div className="pa-section" style={{
                  border: '0.5px solid rgba(0,0,0,0.07)',
                  borderRadius: 16, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '0.65rem 1.25rem',
                    borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                    fontSize: '0.62rem', fontWeight: 700, color: '#64748b',
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <Activity size={12} /> Research Supplies Inventory
                  </div>
                  <div style={{ padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {suppliesItems.map(i => (
                      <div key={i.itemKey} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.4rem 0', borderBottom: '0.5px solid #f1f5f9',
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f172a' }}>{i.namePart}{i.dosagePart ? ` — ${i.dosagePart}` : ''}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8' }}>{i.qty} unit{i.qty > 1 ? 's' : ''}</span>
                      </div>
                    ))}
                    {planGroups.map(([pName, items]) => {
                      const totalUnits = items.reduce((a, i) => a + i.qty, 0);
                      const weeks = Math.max(1, Math.round(totalUnits / Math.max(1, items.length)));
                      return (
                        <div key={pName} style={{ paddingTop: suppliesItems.length > 0 ? '0.5rem' : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <Activity size={11} color="var(--primary)" />
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{pName}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: 'auto' }}>~{weeks}w · {totalUnits} vials</span>
                          </div>
                          {items.map(({ itemKey, qty }) => (
                            <div key={itemKey} style={{
                              display: 'flex', justifyContent: 'space-between',
                              fontSize: '0.78rem', padding: '0.25rem 0 0.25rem 1rem',
                              borderBottom: '0.5px solid #f8fafc',
                            }}>
                              <span style={{ fontFamily: 'monospace', color: '#334155' }}>{itemKey}</span>
                              <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{(qty / weeks).toFixed(1)} vial/w</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>{/* end pa-col-right */}

          </div>{/* end pa-content-grid */}
        </div>
      </>
    );
  }

  // ── Step indicator ────────────────────────────────────────────────────
  const STEPS = ['Identity', 'Logistics', 'Review'];
  const stepDotClass = s => step === s ? 'active' : step > s ? 'done' : 'pending';

  // ── Payment card helper ───────────────────────────────────────────────
  const PayCard = ({ method, icon: Icon, label }) => (
    <div className={`co-pay-card${formData.paymentMethod === method ? ' selected' : ''}`}
      role="button" onClick={() => set({ paymentMethod: method })}>
      <Icon size={26} color={formData.paymentMethod === method ? 'var(--primary)' : '#94a3b8'} strokeWidth={1.5} />
      <span className="co-pay-card-label">{label}</span>
      {formData.paymentMethod === method && <span className="co-pay-badge">✓ Selected</span>}
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────
  return (
    <div id="co-overlay" className="co-wrap">
      <div className="co-inner">

        {/* Back link */}
        <div style={{ marginBottom:'2.5rem' }}>
          <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontWeight:600, fontSize:'0.9rem' }}>
            <ArrowLeft size={16} /> Return to Catalog
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:800, color:'#0f172a', marginBottom:'0.5rem' }}>Research Inquiry</h1>
          <p style={{ color:'#64748b', fontSize:'0.95rem', marginBottom:'2rem' }}>Complete the form below to receive a professional quotation.</p>

          {/* Step track */}
          <div className="co-step-track">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    {i > 0 && <div className={`co-dot-line ${step > s-1 ? 'done' : 'pending'}`} />}
                    <div className={`co-dot ${stepDotClass(s)}`}>
                      {step > s ? <Check size={14} strokeWidth={3} /> : s}
                    </div>
                    {i < STEPS.length - 1 && <div className={`co-dot-line ${step > s ? 'done' : 'pending'}`} />}
                  </div>
                  <span className="co-dot-label" style={{ color: step === s ? 'var(--primary)' : '#94a3b8' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 60/40 grid */}
        <div className="co-grid">

          {/* ── LEFT: Form ──────────────────────────────────────────── */}
          <form id="checkout-form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {prefillApplied && (
                  <div className="co-section-valid"><Check size={13} /> Pre-filled from your profile — review if needed</div>
                )}

                <div className="co-name-grid">
                  <div className="co-field">
                    <label className="co-label">First Name *</label>
                    <input required className={`co-input${formData.firstName ? ' valid' : ''}`} value={formData.firstName}
                      onChange={e => set({ firstName: e.target.value })} placeholder="Alexander" autoComplete="given-name" />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Surname *</label>
                    <input required className={`co-input${formData.lastName ? ' valid' : ''}`} value={formData.lastName}
                      onChange={e => set({ lastName: e.target.value })} placeholder="Sterling" autoComplete="family-name" />
                  </div>
                </div>

                <div className="co-field">
                  <label className="co-label">Institutional Email *</label>
                  <input required type="email" className={`co-input${formData.email ? ' valid' : ''}`} value={formData.email}
                    onChange={e => set({ email: e.target.value })} placeholder="email@institution.edu" autoComplete="email" />
                </div>

                <div className="co-field">
                  <label className="co-label">Phone (WhatsApp Preferred) *</label>
                  <input required type="tel" className={`co-input${formData.phone ? ' valid' : ''}`} value={formData.phone}
                    onChange={e => set({ phone: e.target.value })} placeholder="+00 123 456 789" autoComplete="tel" />
                </div>

                {isProfessional && (
                  <div className="co-field">
                    <label className="co-label">Organization / Clinic *</label>
                    <input required className={`co-input${formData.clinic ? ' valid' : ''}`} value={formData.clinic}
                      onChange={e => set({ clinic: e.target.value })} placeholder="Medical Center / Research Lab" autoComplete="organization" />
                  </div>
                )}

                <div className="co-cta-row">
                  <button type="button" className="co-btn-back" onClick={onBack}>← Catalog</button>
                  <button type="button" className="co-btn-next" onClick={goNext}>Continue <ChevronRight size={16} /></button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {step1Valid && <div className="co-section-valid"><Check size={13} /> Identity verified</div>}

                <div className="co-field">
                  <label className="co-label">Country *</label>
                  <Select options={countryOptions} value={formData.country} styles={selectStyles}
                    onChange={opt => set({ country: opt })} placeholder="Search for your country..." />
                </div>

                <div className="co-field">
                  <label className="co-label">Delivery Address *</label>
                  <textarea required rows={3} className={`co-input${formData.address ? ' valid' : ''}`} value={formData.address}
                    onChange={e => set({ address: e.target.value })}
                    placeholder="Street Name, Unit/Bldg Number, City, Postal Code" autoComplete="street-address"
                    style={{ resize:'vertical', lineHeight:1.5 }} />
                </div>

                <div className="co-cta-row">
                  <button type="button" className="co-btn-back" onClick={goBack}>← Back</button>
                  <button type="button" className="co-btn-next" onClick={goNext}>Continue <ChevronRight size={16} /></button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                {step2Valid && <div className="co-section-valid"><Check size={13} /> Logistics confirmed</div>}

                {/* ── Protocol Review ── */}
                {hasProtocols && (
                  <div style={{
                    border: '0.5px solid rgba(0,163,224,0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: 'white'
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0,163,224,0.06)',
                      borderBottom: '0.5px solid rgba(0,163,224,0.15)'
                    }}>
                      <Activity size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary)' }}>Protocol Review</span>
                      <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'#94a3b8' }}>Estimated cycle timeline</span>
                    </div>
                    <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {Object.entries(protocolGroups).map(([name, items]) => {
                        const totalUnits = items.reduce((a, i) => a + i.qty, 0);
                        const weeks = Math.max(1, Math.round(totalUnits / Math.max(1, items.length)));
                        return (
                          <div key={name}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.45rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', fontFamily: 'monospace' }}>{name}</span>
                              <span style={{ fontSize:'0.72rem', backgroundColor:'rgba(0,163,224,0.1)', color:'var(--primary)', padding:'0.15rem 0.5rem', borderRadius:'20px', fontWeight:600 }}>
                                ~{weeks} week{weeks !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {/* Simplified timeline bar */}
                            <div style={{ display:'flex', gap:'3px', height:'6px', borderRadius:'3px', overflow:'hidden' }}>
                              {Array.from({ length: weeks }).map((_, wi) => (
                                <div key={wi} style={{
                                  flex: 1,
                                  backgroundColor: wi < Math.ceil(weeks * 0.5) ? 'var(--primary)' : 'rgba(0,163,224,0.25)',
                                  borderRadius: '2px'
                                }} />
                              ))}
                            </div>
                            <div style={{ marginTop:'0.4rem', fontSize:'0.75rem', color:'#64748b' }}>
                              {items.map(i => i.itemKey).join(' · ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="co-label">Payment Method *</label>
                  <p style={{ fontSize:'0.82rem', color:'#94a3b8', margin:'0.25rem 0 0.75rem' }}>
                    Select how you prefer to complete the transaction once approved.
                  </p>
                  <div className="co-pay-grid">
                    <PayCard method="credit_card" icon={CreditCard} label="Credit Card" />
                    <PayCard method="bank_transfer" icon={Landmark} label="Bank Transfer" />
                  </div>
                </div>

                <div className="co-cta-row">
                  <button type="button" className="co-btn-back" onClick={goBack}>← Back</button>
                  <button type="submit" className="co-btn-next" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing…' : <><span>Confirm Request</span><Send size={15} /></>}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* ── RIGHT: Sticky sidebar (desktop) ─────────────────────── */}
          <div className="co-sidebar">
            <div className="co-summary-secure">
              <ShieldCheck size={16} strokeWidth={2} /> Secure &amp; Encrypted Process
            </div>
            <div className="co-summary-card">
              <div className="co-summary-title">Order Summary — {totalItems} item{totalItems !== 1 ? 's' : ''}</div>
              <SummaryItems />
            </div>
          </div>

        </div>{/* end co-grid */}
      </div>{/* end co-inner */}

      {/* ── Mobile: Bottom-sheet summary ──────────────────────────────── */}
      {!isDone && (
        <div className="co-mobile-sheet">
          <button type="button" className="co-sheet-toggle" onClick={() => setMobileSummaryOpen(o => !o)}>
            <span>Order Summary — {checkoutTotals.display}</span>
            {mobileSummaryOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          {mobileSummaryOpen && (
            <div className="co-sheet-body">
              <SummaryItems />
            </div>
          )}
        </div>
      )}

      {/* ── Mobile: Floating Action Bar (glassmorphism) ───────────────── */}
      {!isDone && (
        <div className="co-fab">
          {step < 3 ? (
            <button type="button" className="co-fab-btn" onClick={goNext}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" form="checkout-form" className="co-fab-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing…' : <><span>Confirm Request</span><Send size={15} /></>}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
