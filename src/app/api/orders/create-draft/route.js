import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendOrderCreatedNotificationEmail } from '@/lib/orderNotificationMailer';

// Simple in-memory sliding window rate limiter (max 10 requests per IP per hour)
const ipRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(clientIp) {
  if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1') return false;
  const now = Date.now();
  const timestamps = ipRateLimitMap.get(clientIp) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRateLimitMap.set(clientIp, validTimestamps);
    return true;
  }
  validTimestamps.push(now);
  ipRateLimitMap.set(clientIp, validTimestamps);
  return false;
}

/**
 * POST /api/orders/create-draft
 * Creates an incoming draft order from the shared catalog or public referral links.
 * Triggers unclosable notifications for Admin and Account Managers.
 */
export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before submitting another proforma request.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const contact = body.contact || {};

    // ── Anti-Spam Honeypot Verification ──
    // Legitimate users will leave these invisible fields blank. Bots fill everything.
    const honeypot = body.company_fax || body.bot_trap || body.website_url || contact.company_fax || contact.bot_trap || contact.website_url;
    if (honeypot && String(honeypot).trim().length > 0) {
      console.warn(`[create-draft] 🛡️ Honeypot bot trap triggered from IP ${clientIp}. Silently discarding.`);
      return NextResponse.json({
        success: true,
        orderId: `PO-DRAFT-${Date.now().toString().slice(-6)}`,
        status: 'draft',
        message: 'Proforma request received.'
      });
    }

    const rawCartItems = (Array.isArray(body.cartItems) && body.cartItems.length > 0)
      ? body.cartItems
      : (Array.isArray(body.items) && body.items.length > 0 ? body.items : []);

    const {
      cartItems = rawCartItems,
      customerName = contact.name || contact.contactName || contact.clinicName || 'Clinical Client',
      customerEmail = contact.email || contact.workEmail || '',
      customerPhone = contact.phone || '',
      customerAddress = [
        contact.addressLine1,
        contact.addressLine2,
        contact.city,
        contact.state,
        contact.postalCode,
        contact.country
      ].filter(Boolean).join(', ') || '',
      customerVat = contact.vat || '',
      customerNotes = contact.notes || '',
      shippingDestination = contact.country || 'Standard Dispatch',
      shippingCode = contact.countryCode || 'EU',
      shippingCost = 0,
      subtotal = 0,
      grandTotal = Number(body.grandTotal || body.totalAmountUsd || body.totalAmountEur || body.total || 0),
      currency = body.currency || 'USD',
      currencySymbol = body.currencySymbol || (currency === 'EUR' ? '€' : '$'),
      totalUnits = 0,
      catalogId = '',
      catalogCode = '',
      catalogToken = '',
      catalogTitle = '',
      priceTier = 'wholesale',
      priceTierLabel = 'Direct',
      priceTierCode = '',
      priceMarkupPercent = 0,
      priceSource = 'wholesale',
      supplierFilter = '',
      categoryFilter = '',
      collection = 'vials',
      wholesalerId = null,
      referralCode = null,
      wholesalerName = '',
      wholesalerEmail = '',
      paymentMethod = 'payment_link_24h',
      accountManagerName = '',
      accountManagerEmail = '',
      accountManagerId = '',
      source = 'shared_catalog'
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cannot create draft order with an empty cart.' },
        { status: 400 }
      );
    }

    // ── Server-Side Contact Validation ──
    const trimmedEmail = String(customerEmail || '').trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'A valid professional email address is required.' },
        { status: 400 }
      );
    }

    const cleanPhoneDigits = String(customerPhone || '').replace(/\D/g, '');
    if (cleanPhoneDigits.length < 7) {
      return NextResponse.json(
        { error: 'A valid international phone number with country code is required.' },
        { status: 400 }
      );
    }

    if (source === 'public_peptides_price_schedule' && (!customerAddress || customerAddress.trim().length < 5)) {
      return NextResponse.json(
        { error: 'A complete delivery destination address is required for clinical logistics.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const now = new Date();
    const orderCode = `PO-DRAFT-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Auto-resolve wholesaler attribution from shared catalog link if not directly passed
    let effectiveWholesalerId = wholesalerId ? String(wholesalerId).trim() : null;
    let effectiveWholesalerName = wholesalerName ? String(wholesalerName).trim() : null;
    let effectiveWholesalerEmail = wholesalerEmail ? String(wholesalerEmail).trim() : null;
    let effectiveReferralCode = referralCode ? String(referralCode).trim() : (effectiveWholesalerId || null);

    if (!effectiveWholesalerId && catalogId && adminDb) {
      try {
        const linkSnap = await adminDb.collection('shared_catalog_links').doc(String(catalogId).trim()).get();
        if (linkSnap.exists) {
          const lData = linkSnap.data();
          const isWs = lData.recipientType === 'wholesaler' || lData.recipientType === 'wholeseller' || Boolean(lData.wholesalerId);
          if (isWs) {
            effectiveWholesalerId = lData.wholesalerId || lData.recipientUserId || null;
            effectiveWholesalerName = lData.recipientName || lData.wholesalerName || null;
            effectiveWholesalerEmail = lData.recipientEmail || lData.wholesalerEmail || null;
            effectiveReferralCode = effectiveReferralCode || String(catalogId).trim() || effectiveWholesalerId;
          }
        }
      } catch (wsLookupErr) {
        console.warn('[create-draft] Could not auto-resolve wholesaler from catalog link:', wsLookupErr.message);
      }
    }

    const isNikolasOrder =
      ['np-labs-international', 'nikolaos-psathas', 'nplabs', 'nplab', 'cat-rx-7482', 'nikolas', 'partner-7482'].includes(String(effectiveWholesalerId || '').toLowerCase()) ||
      String(catalogId || '').trim().toUpperCase() === 'CAT-RX-7482' ||
      String(effectiveReferralCode || '').trim().toUpperCase() === 'CAT-RX-7482' ||
      (!effectiveWholesalerId && (source === 'public_peptides_price_schedule' || source === 'peptides_schedule'));

    if (isNikolasOrder) {
      effectiveWholesalerId = 'np-labs-international';
      effectiveWholesalerName = effectiveWholesalerName || 'Nikolaos Psathas (NP Labs)';
      effectiveWholesalerEmail = effectiveWholesalerEmail || 'nikpsathas@gmail.com';
      effectiveReferralCode = effectiveReferralCode || 'CAT-RX-7482';
    }

    const attributedTo = isNikolasOrder
      ? 'Por atención de Nikolaos Psathas (NP Labs)'
      : (body.attributedTo || (effectiveWholesalerName ? `Por atención de ${effectiveWholesalerName}` : null));

    const formattedItems = cartItems.map(item => {
      const quantity1x = Number(item.quantity1x || 0);
      const quantity10x = Number(item.quantity10x || 0);
      const computedUnits = Number(item.quantity || item.totalVials || (quantity1x + (quantity10x * 10)) || 1);
      const isBulk = item.isBulk ?? (computedUnits >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0);
      const unitPrice = item.unitPriceUsd ?? item.unitPriceEur ?? (isBulk ? item.tier10UnitPrice : (item.unitPrice || item.price || 0));
      const lineTotal = item.subtotalUsd ?? item.subtotalEur ?? item.subtotal ?? Number((computedUnits * unitPrice).toFixed(2));
      return {
        id: item.id || '',
        name: String(item.productName || item.name || '').trim(),
        productName: String(item.productName || item.name || '').trim(),
        dosage: String(item.dosage || '').trim(),
        presentation: String(item.presentation || 'Lyophilized Vial (10R)').trim(),
        variant: [item.dosage, item.presentation].filter(Boolean).join(' • ') || String(item.dosage || 'Standard'),
        quantity: computedUnits,
        quantity1x,
        quantity10x,
        kits: Math.floor(computedUnits / 10),
        singleUnits: computedUnits % 10,
        baseCost: Number(item.baseCost || item.cost || 0),
        mediluxePrice: Number(item.mediluxePrice || (item.baseCost ? Number((item.baseCost * 1.15).toFixed(2)) : 0)),
        unitPrice: Number(unitPrice) || 0,
        price: Number(unitPrice) || 0,
        totalPrice: lineTotal,
        total: lineTotal,
        lineTotal: lineTotal,
        isBulk,
        apiItems: item.apiItems || item.apis || item.constituents || null,
        posology: item.posology || null
      };
    });

    const clientDisplayName = String(customerName || 'Clinical Client').trim();

    const orderDocData = {
      orderId: orderCode,
      code: orderCode,
      status: 'draft', // Regla #28 Taxonomía Unificada de Estados
      source,
      catalogId: String(catalogId || '').trim(),
      catalogCode: String(catalogCode || '').trim(),
      catalogToken: String(catalogToken || '').trim(),
      catalogTitle: String(catalogTitle || '').trim(),
      priceTier: String(priceTier || '').trim(),
      priceTierLabel: String(priceTierLabel || 'Institutional Direct').trim(),
      priceTierCode: String(priceTierCode || '').trim(),
      priceMarkupPercent: Number(priceMarkupPercent || 0),
      priceSource: String(priceSource || 'wholesale').trim(),
      supplierFilter: String(supplierFilter || '').trim(),
      categoryFilter: String(categoryFilter || '').trim(),
      customerName: clientDisplayName,
      customerEmail: String(customerEmail || '').trim(),
      customerPhone: String(customerPhone || '').trim(),
      customerAddress: String(customerAddress || '').trim(),
      deliveryAddress: String(customerAddress || '').trim(),
      customerVat: String(customerVat || '').trim(),
      customerNotes: String(customerNotes || '').trim(),
      items: formattedItems,
      totalUnits: Number(totalUnits) || formattedItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shippingCost) || 0,
      shippingDestination: String(shippingDestination || 'Standard Dispatch').trim(),
      shippingCode: String(shippingCode || 'EU').trim(),
      grandTotal: Number(grandTotal) || 0,
      total: Number(grandTotal || 0),
      totalAmount: Number(grandTotal || 0),
      paymentMethod: String(paymentMethod || 'payment_link_24h').trim(), // Default: payment link within 24h
      currency: String(currency || 'USD').toUpperCase(),
      currencySymbol: String(currencySymbol || '$'),
      wholesalerId: effectiveWholesalerId,
      referralCode: effectiveReferralCode,
      wholesalerName: effectiveWholesalerName,
      wholesalerEmail: effectiveWholesalerEmail,
      attributedTo,
      collection: String(collection || 'vials').toLowerCase(),
      accountManagerName: String(accountManagerName || '').trim(),
      accountManagerEmail: String(accountManagerEmail || '').trim() || null,
      accountManagerId: String(accountManagerId || '').trim() || null,
      
      // Strict reception & acknowledgment tracking
      requiresAcknowledgment: true,
      acknowledged: false,
      isRead: false,
      readAt: null,
      readBy: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      receptionNotes: '',

      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const orderRef = await adminDb.collection('orders').add(orderDocData);

    // Update Wholesaler Referral analytics in Firestore if attributed
    if (orderDocData.wholesalerId) {
      try {
        const refDocRef = adminDb.collection('wholesaler_referrals').doc(orderDocData.wholesalerId);
        const colKey = orderDocData.collection;
        await refDocRef.set({
          wholesalerId: orderDocData.wholesalerId,
          referralCode: orderDocData.referralCode || orderDocData.wholesalerId,
          ordersCount: FieldValue.increment(1),
          totalRevenue: FieldValue.increment(orderDocData.grandTotal),
          totalUnits: FieldValue.increment(orderDocData.totalUnits),
          [`collections.${colKey}.ordersCount`]: FieldValue.increment(1),
          [`collections.${colKey}.totalRevenue`]: FieldValue.increment(orderDocData.grandTotal),
          lastOrderAt: now.toISOString(),
          updatedAt: now.toISOString()
        }, { merge: true });

        // Also add to subcollection for individual referral order ledger
        await refDocRef.collection('orders').doc(orderRef.id).set({
          orderId: orderRef.id,
          orderCode,
          collection: orderDocData.collection,
          customerName: clientDisplayName,
          customerEmail: orderDocData.customerEmail,
          totalUnits: orderDocData.totalUnits,
          grandTotal: orderDocData.grandTotal,
          currency: orderDocData.currency,
          status: 'draft',
          paymentMethod: orderDocData.paymentMethod,
          createdAt: now.toISOString()
        });
      } catch (refErr) {
        console.warn('[orders/create-draft] Non-blocking referral tracking update warning:', refErr.message);
      }
    }

    // Create high-priority notification for Admin, Wholesaler and Account Manager
    const isWholesalerOrder = Boolean(orderDocData.wholesalerId);
    const notifData = {
      title: isWholesalerOrder
        ? `🚨 Wholesaler Referral Order: ${orderCode} (Send Payment Link <24h)`
        : `🚨 New Order Draft: ${orderCode}`,
      message: isWholesalerOrder
        ? `${clientDisplayName} placed an order via Wholesaler [${orderDocData.wholesalerId}] for ${orderDocData.totalUnits} units (${orderDocData.currency} ${orderDocData.grandTotal.toFixed(2)}). Send secure payment link within 24 hours.`
        : `${clientDisplayName} created a draft order for ${orderDocData.totalUnits} units (${orderDocData.currency} ${orderDocData.grandTotal.toFixed(2)}) via shared catalog. Requires immediate reception acknowledgment.`,
      type: 'order_draft',
      severity: 'critical',
      orderId: orderRef.id,
      orderCode,
      wholesalerId: orderDocData.wholesalerId,
      targetRoles: ['admin', 'account_manager', 'wholesaler'],
      accountManagerEmail: orderDocData.accountManagerEmail,
      requiresAcknowledgment: true,
      acknowledged: false,
      read: false,
      link: `/admin?tab=orders&orderId=${orderRef.id}`,
      createdAt: now.toISOString()
    };

    await adminDb.collection('notifications').add(notifData);

    // Update catalog_generation_logs conversion status if order originated from a catalog link
    const targetCatId = orderDocData.catalogId || (isNikolasOrder ? 'CAT-RX-7482' : null);
    if (targetCatId) {
      adminDb.collection('catalog_generation_logs').doc(targetCatId).set({
        status: 'converted_to_order',
        lastOrderCode: orderCode,
        lastOrderAt: now.toISOString(),
        attributedTo: attributedTo || 'Direct',
        updatedAt: now.toISOString()
      }, { merge: true }).catch(() => {});
    }

    // Send immediate email notification to jose@mediluxeme.com for every order placed
    let emailNotification = null;
    try {
      emailNotification = await sendOrderCreatedNotificationEmail(
        { ...orderDocData, firestoreId: orderRef.id },
        'jose@mediluxeme.com'
      );
    } catch (emailErr) {
      console.warn('[orders/create-draft] Email notification non-blocking warning:', emailErr.message);
    }

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderCode,
      attributedTo,
      emailNotification,
      message: 'Draft order successfully registered in portal.'
    });
  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create draft order.' },
      { status: 500 }
    );
  }
}
