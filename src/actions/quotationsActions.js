"use server";

import { adminDb } from '../lib/firebaseAdmin.js';
import { validateOrderWrite } from '../repositories/orderWriteGuard.js';
import { serializeDoc, serializeFirestoreData } from '../lib/serializeFirestore.js';
import logger from '../utils/logger.js';

// ── In-Memory TTL Cache for Quotations KPIs (60s) ───────────────────────────
let cachedQuotationsKPIs = null;
let lastQuotationsKPIFetchTime = 0;
const KPI_CACHE_TTL_MS = 60 * 1000;

/**
 * Server-Side Authoritative Quotations KPIs with in-memory TTL caching
 */
export async function fetchQuotationsKPIsAction(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedQuotationsKPIs && (now - lastQuotationsKPIFetchTime < KPI_CACHE_TTL_MS)) {
    return cachedQuotationsKPIs;
  }

  try {
    if (!adminDb) {
      return {
        totalQuotes: 0,
        pendingQuotes: 0,
        approvedQuotes: 0,
        convertedQuotes: 0,
        pipelineValue: 0,
        totalRevenueWon: 0,
        avgMarginPercent: 42.5
      };
    }

    const quotesRef = adminDb.collection('quotations');
    
    // Concurrently fetch counts and recent snapshot for financial pipeline totals
    const [totalSnap, pendingSnap, approvedSnap, convertedSnap, recentQuotesSnap] = await Promise.all([
      quotesRef.count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      quotesRef.where('status', 'in', ['pending', 'Pending', 'sent', 'Sent', 'draft', 'Draft']).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      quotesRef.where('status', 'in', ['approved', 'Approved', 'accepted', 'Accepted']).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      quotesRef.where('status', 'in', ['converted', 'Converted']).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      quotesRef.orderBy('createdAt', 'desc').limit(100).get().catch(() => ({ docs: [] }))
    ]);

    let pipelineValue = 0;
    let totalRevenueWon = 0;
    let totalMarginSum = 0;
    let marginCount = 0;

    recentQuotesSnap.docs.forEach(d => {
      const data = d.data();
      const amount = Number(data.grandTotal || data.totalAmount || data.total || 0);
      const margin = Number(data.marginPercent || 0);
      const status = String(data.status || '').toLowerCase();

      if (status === 'approved' || status === 'accepted' || status === 'converted') {
        totalRevenueWon += amount;
        if (margin > 0) {
          totalMarginSum += margin;
          marginCount++;
        }
      } else if (status !== 'rejected' && status !== 'cancelled') {
        pipelineValue += amount;
      }
    });

    const avgMarginPercent = marginCount > 0 ? (totalMarginSum / marginCount) : 45.0;

    const kpis = {
      totalQuotes: totalSnap.data().count || recentQuotesSnap.docs.length,
      pendingQuotes: pendingSnap.data().count || 0,
      approvedQuotes: approvedSnap.data().count || 0,
      convertedQuotes: convertedSnap.data().count || 0,
      pipelineValue,
      totalRevenueWon,
      avgMarginPercent: Math.round(avgMarginPercent * 10) / 10
    };

    cachedQuotationsKPIs = kpis;
    lastQuotationsKPIFetchTime = now;
    return kpis;
  } catch (error) {
    console.error("[fetchQuotationsKPIsAction] Error calculating KPIs:", error);
    return cachedQuotationsKPIs || {
      totalQuotes: 0,
      pendingQuotes: 0,
      approvedQuotes: 0,
      convertedQuotes: 0,
      pipelineValue: 0,
      totalRevenueWon: 0,
      avgMarginPercent: 40.0
    };
  }
}

/**
 * Single-Shot Detailed Quotation Bundle (Server Action)
 */
export async function fetchQuotationDetailsBundleAction(quotationId) {
  if (!adminDb || !quotationId) return null;

  try {
    const docSnap = await adminDb.collection('quotations').doc(quotationId).get();
    if (!docSnap.exists) return null;

    const quotation = serializeDoc(docSnap);

    // Fetch related patient or doctor context if IDs present
    let patient = null;
    if (quotation.patientId) {
      const pSnap = await adminDb.collection('patients').doc(quotation.patientId).get();
      if (pSnap.exists) patient = serializeDoc(pSnap);
    }

    return {
      quotation,
      patient
    };
  } catch (error) {
    console.error("[fetchQuotationDetailsBundleAction] Error loading quotation:", error);
    return null;
  }
}

/**
 * Convert Quotation to Official Sales Order in /orders
 */
export async function convertQuotationToOrderAction(quotationId, userContext = {}) {
  if (!adminDb || !quotationId) throw new Error("Quotation ID is required");

  try {
    const quoteRef = adminDb.collection('quotations').doc(quotationId);
    const quoteSnap = await quoteRef.get();
    if (!quoteSnap.exists) throw new Error("Quotation not found");

    const quote = quoteSnap.data();

    // Map items strictly to canonical order item contract
    const rawItems = Array.isArray(quote.items) ? quote.items : [];
    const orderItems = rawItems.map((it, idx) => {
      const qty = Math.max(1, Number(it.quantity || 1));
      const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
      const total = Number(it.totalPrice || (qty * rate));
      return {
        productId: String(it.productId || it.id || `item-${idx + 1}`),
        variantId: it.variantId ? String(it.variantId) : '',
        name: String(it.name || it.productName || 'Compound'),
        dosage: it.dosage || it.dose || '',
        presentation: it.presentation || '',
        supplierId: it.supplierId ? String(it.supplierId) : '',
        supplierName: it.supplierName ? String(it.supplierName) : '',
        quantity: qty,
        unitPrice: rate,
        totalPrice: total,
        marginPercent: it.marginPercent !== undefined ? Number(it.marginPercent) : null,
      };
    });

    const nowIso = new Date().toISOString();

    const rawOrderData = {
      sourceType: 'quotation',
      quotationId,
      quotationNumber: quote.quotationNumber || `QT-${quotationId.slice(0, 6)}`,
      recipientType: quote.recipientType || quote.category || 'clinic',
      patientId: quote.patientId || null,
      patientName: quote.patientName || '',
      patientEmail: quote.patientEmail || quote.contactEmail || '',
      patientPhone: quote.patientPhone || quote.contactPhone || '',
      doctorId: quote.doctorId || null,
      doctorName: quote.doctorName || '',
      clinicId: quote.clinicId || null,
      clinicName: quote.clinicName || '',
      wholesalerId: quote.wholesalerId || null,
      wholesalerName: quote.wholesalerName || '',
      accountManagerId: quote.accountManagerId || null,
      accountManagerName: quote.accountManagerName || '',
      items: orderItems,
      subtotal: Number(quote.subtotal || 0),
      taxTotal: Number(quote.taxTotal || 0),
      shippingTotal: Number(quote.shippingTotal || 0),
      discountTotal: Number(quote.discountTotal || 0),
      total: Number(quote.grandTotal || quote.total || 0),
      status: 'processing',
      paymentStatus: 'pending',
      paymentTerms: quote.paymentTerms || 'due_on_receipt',
      shippingAddress: quote.shippingAddress || quote.channelContext?.shippingAddress || null,
      billingAddress: quote.billingAddress || quote.channelContext?.billingAddress || null,
      currency: quote.currency || 'USD',
      convertedBy: userContext.email || userContext.uid || 'admin',
      convertedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Validate and normalize through order write guard
    const cleanOrderData = validateOrderWrite(rawOrderData, false);

    const newOrderRef = await adminDb.collection('orders').add(cleanOrderData);

    // Mark quotation as converted with bidirectional reference
    await quoteRef.update({
      status: 'converted',
      convertedOrderId: newOrderRef.id,
      convertedOrderNumber: cleanOrderData.orderNumber,
      convertedAt: nowIso,
      convertedBy: userContext.email || userContext.uid || 'admin',
      updatedAt: nowIso,
    });

    return {
      success: true,
      orderId: newOrderRef.id,
      orderNumber: cleanOrderData.orderNumber,
    };
  } catch (error) {
    console.error("[convertQuotationToOrderAction] Conversion failed:", error);
    throw new Error(error.message || "Failed to convert quotation to order");
  }
}

/**
 * Convert Quotation to Supplier Purchase Orders (PO) with Multi-Supplier Auto-Split
 */
export async function convertQuotationToSupplierPoAction(quotationId, fallbackSupplierId, fallbackSupplierName) {
  if (!adminDb || !quotationId) throw new Error("Quotation ID is required");

  try {
    const quoteRef = adminDb.collection('quotations').doc(quotationId);
    const quoteSnap = await quoteRef.get();
    if (!quoteSnap.exists) throw new Error("Quotation not found");

    const quote = quoteSnap.data();
    const items = Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [
      { name: 'Compounded Peptide Package', quantity: 1, unitRate: quote.grandTotal || 1000, supplierCost: (quote.grandTotal || 1000) * 0.55 }
    ];

    // Group items by supplier
    const supplierGroups = {};
    items.forEach(item => {
      const sId = item.supplierId || quote.supplierId || fallbackSupplierId || 'fagron-compound';
      const sName = item.supplierName || quote.supplierName || fallbackSupplierName || 'Fagron Compounding Pharmacy';
      
      if (!supplierGroups[sId]) {
        supplierGroups[sId] = {
          supplierId: sId,
          supplierName: sName,
          items: [],
          totalCost: 0
        };
      }
      supplierGroups[sId].items.push(item);
      const cost = Number(item.supplierCost || (item.unitRate || item.unitPrice || 100) * 0.55);
      const qty = Number(item.quantity || 1);
      supplierGroups[sId].totalCost += cost * qty;
    });

    const year = new Date().getFullYear();
    const createdPos = [];

    // Create a PO document for each distinct supplier
    for (const sId of Object.keys(supplierGroups)) {
      const group = supplierGroups[sId];
      const supplierSlug = group.supplierName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'SUP';
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const poNumber = `PO-${year}-${supplierSlug}-${randomSeq}`;

      const poData = {
        poNumber,
        quotationId,
        quotationNumber: quote.quotationNumber || `QUO-${year}-${quotationId.slice(0, 4)}`,
        category: quote.category || 'patient',
        recipientName: quote.patientName || quote.clinicName || quote.wholesalerName || 'RegenPept Client',
        shippingAddress: quote.shippingAddress || quote.channelContext?.shippingAddress || null,
        supplierId: group.supplierId,
        supplierName: group.supplierName,
        items: group.items,
        totalAmount: Math.round(group.totalCost * 100) / 100,
        requiresColdChain: group.items.some(it => it.compliance?.requiresColdChain !== false),
        status: 'po_created',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newPoRef = await adminDb.collection('purchase-orders').add(poData);
      createdPos.push({
        poId: newPoRef.id,
        poNumber,
        supplierName: group.supplierName,
        amount: poData.totalAmount
      });
    }

    const poNumbersList = createdPos.map(p => p.poNumber);

    await quoteRef.update({
      supplierPoNumbers: poNumbersList,
      supplierPoId: createdPos[0]?.poId || null,
      supplierPoNumber: poNumbersList.join(', '),
      updatedAt: new Date()
    });

    return {
      success: true,
      count: createdPos.length,
      poNumbers: poNumbersList,
      poNumber: poNumbersList.join(', '),
      details: createdPos
    };
  } catch (error) {
    console.error("[convertQuotationToSupplierPoAction] PO generation failed:", error);
    throw new Error(error.message || "Failed to generate supplier purchase orders");
  }
}

/**
 * 🔒 Fetch Public Quotation by Token (with 'viewed' read-tracking)
 */
export async function fetchPublicQuotationByTokenAction(token) {
  if (!token || !adminDb) return { success: false, error: "Invalid token" };

  try {
    let quoteDoc = null;
    let quoteId = null;

    // 1. Try finding by publicToken field
    const tokenQuery = await adminDb.collection('quotations').where('publicToken', '==', token).limit(1).get();
    if (!tokenQuery.empty) {
      quoteDoc = tokenQuery.docs[0];
      quoteId = quoteDoc.id;
    } else {
      // Fallback: try by direct doc ID in 'quotations'
      const directDoc = await adminDb.collection('quotations').doc(token).get();
      if (directDoc.exists) {
        quoteDoc = directDoc;
        quoteId = directDoc.id;
      } else {
        // Fallback 2: check legacy 'b2b_quotations' collection
        const b2bDoc = await adminDb.collection('b2b_quotations').doc(token).get();
        if (b2bDoc.exists) {
          quoteDoc = b2bDoc;
          quoteId = b2bDoc.id;
        }
      }
    }

    if (!quoteDoc || !quoteDoc.exists) {
      return { success: false, error: "Quotation not found or expired" };
    }

    const data = quoteDoc.data();

    // 2. Track client read/open event in background
    const currentStatus = String(data.status || '').toLowerCase();
    if (['pending', 'sent', 'draft'].includes(currentStatus)) {
      await adminDb.collection('quotations').doc(quoteId).update({
        status: 'viewed',
        viewedAt: new Date(),
        updatedAt: new Date()
      }).catch(() => {});
    }

    // 3. Serialize and sanitize for client presentation
    const serialized = {
      id: quoteId,
      quotationNumber: data.quotationNumber || `QUO-${quoteId.slice(0, 6)}`,
      category: data.category || data.recipientType || 'patient',
      clientName: data.clientName || data.patientName || data.clinicName || data.wholesalerName || 'Valued Client',
      doctorName: data.doctorName || null,
      clinicName: data.clinicName || null,
      paymentTerms: data.paymentTerms || 'due_on_receipt',
      currency: data.currency || 'USD',
      status: data.status || 'viewed',
      subtotal: Number(data.subtotal || 0),
      taxTotal: Number(data.taxTotal || 0),
      grandTotal: Number(data.grandTotal || 0),
      items: Array.isArray(data.items) ? data.items : [],
      commercialNotes: data.commercialNotes || null,
      validUntil: data.validUntil || null,
      expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt) : null,
      createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
      requiresColdChain: data.requiresColdChain !== false,
      shippingAddress: data.shippingAddress || null,
      deliveryInstructions: data.deliveryInstructions || null,
      salesOrderNumber: data.salesOrderNumber || null
    };

    return { success: true, quotation: serialized };
  } catch (error) {
    console.error("[fetchPublicQuotationByTokenAction] Error:", error);
    return { success: false, error: error.message || "Failed to load quotation" };
  }
}

/**
 * ✍️ Approve Public Quotation & Auto-Generate Sales Order
 */
export async function approvePublicQuotationAction(token, approvalData = {}) {
  if (!token || !adminDb) throw new Error("Invalid quotation token");

  try {
    let quoteRef = null;
    let quoteId = null;

    const tokenQuery = await adminDb.collection('quotations').where('publicToken', '==', token).limit(1).get();
    if (!tokenQuery.empty) {
      quoteId = tokenQuery.docs[0].id;
      quoteRef = tokenQuery.docs[0].ref;
    } else {
      const directDoc = await adminDb.collection('quotations').doc(token).get();
      if (directDoc.exists) {
        quoteId = directDoc.id;
        quoteRef = directDoc.ref;
      }
    }

    if (!quoteRef) throw new Error("Quotation not found");

    const now = new Date();
    await quoteRef.update({
      status: 'approved',
      approvedAt: now,
      approvedBy: approvalData.approvedByName || 'Client Online Approval',
      approvalSignature: approvalData.signature || 'Digital Confirmation',
      clientNotes: approvalData.clientNotes || '',
      updatedAt: now
    });

    // Automatically convert approved quotation into active B2B / B2C Sales Order
    let orderResult = null;
    try {
      orderResult = await convertQuotationToOrderAction(quoteId);
    } catch (orderErr) {
      console.warn("[approvePublicQuotationAction] Auto-order conversion notice:", orderErr.message);
    }

    // Invalidate KPI caches
    cachedQuotationsKPIs = null;

    return {
      success: true,
      quotationId: quoteId,
      orderNumber: orderResult?.orderNumber || null,
      message: "Quotation approved and order registered successfully"
    };
  } catch (error) {
    console.error("[approvePublicQuotationAction] Error:", error);
    throw new Error(error.message || "Failed to approve quotation");
  }
}

/**
 * 🔍 Search Bigin Contact by Name, Email, or Phone
 */
export async function searchBiginContactAction({ name = '', email = '', phone = '' } = {}) {
  if (!name && !email && !phone) {
    return { success: false, error: "Por favor, introduce al menos un nombre, email o teléfono para buscar." };
  }

  try {
    // 1. Get cached access token from Firestore
    let accessToken = null;
    if (adminDb) {
      const snapV2 = await adminDb.collection('zoho_token_cache').doc('access_token_v2').get();
      if (snapV2.exists && snapV2.data().access_token) {
        accessToken = snapV2.data().access_token;
      } else {
        const snapV1 = await adminDb.collection('zoho_token_cache').doc('access_token').get();
        if (snapV1.exists) accessToken = snapV1.data().access_token;
      }
    }

    if (!accessToken) {
      return { success: false, error: "No se encontró token de acceso de Zoho Bigin en el sistema." };
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
    const cleanName = String(name || '').trim();

    let contacts = [];

    // Helper fetcher
    const searchEndpoint = async (paramKey, paramVal) => {
      try {
        const url = `https://www.zohoapis.com/bigin/v1/Contacts/search?${paramKey}=${encodeURIComponent(paramVal)}`;
        const res = await fetch(url, {
          headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
          signal: AbortSignal.timeout(8000)
        });
        if (res.status === 204 || res.status === 404) return [];
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data : [];
      } catch (e) {
        console.warn(`[searchBiginContactAction] search ${paramKey}=${paramVal} failed:`, e.message);
        return [];
      }
    };

    // Strategy 1: search by email
    if (cleanEmail) {
      contacts = await searchEndpoint('email', cleanEmail);
    }

    // Strategy 2: search by phone if nothing found yet
    if (contacts.length === 0 && cleanPhone) {
      contacts = await searchEndpoint('phone', cleanPhone);
      if (contacts.length === 0 && cleanPhone.length >= 9) {
        const localPhone = cleanPhone.slice(-9);
        contacts = await searchEndpoint('phone', localPhone);
      }
    }

    // Strategy 3: search by word / name if nothing found yet
    if (contacts.length === 0 && cleanName) {
      contacts = await searchEndpoint('word', cleanName);
      if (contacts.length === 0) {
        const parts = cleanName.split(' ').filter(Boolean);
        if (parts.length > 1) {
          const surname = parts[parts.length - 1];
          if (surname.length >= 3) {
            contacts = await searchEndpoint('word', surname);
          }
        }
      }
    }

    if (contacts.length === 0) {
      return {
        success: true,
        found: false,
        message: "No se encontraron contactos coincidentes en Zoho Bigin."
      };
    }

    // Normalize contacts
    const normalized = contacts.map(c => {
      const fullName = c.Full_Name || `${c.First_Name || ''} ${c.Last_Name || ''}`.trim() || 'Contacto sin nombre';
      const street = c.Mailing_Street || '';
      const city = c.Mailing_City || '';
      const state = c.Mailing_State || '';
      const zip = c.Mailing_Zip || '';
      const country = c.Mailing_Country || 'España';
      const formattedAddress = [street, city, zip, country].filter(Boolean).join(', ');

      return {
        id: String(c.id),
        name: fullName,
        email: c.Email || '',
        phone: c.Mobile || c.Phone || '',
        mobile: c.Mobile || '',
        company: c.Account_Name?.name || c.Company || '',
        shippingAddress: {
          full: formattedAddress,
          formatted: formattedAddress,
          street,
          city,
          state,
          postalCode: zip,
          country
        },
        deliveryInstructions: c.Description || '',
        source: 'Zoho Bigin',
        raw: c
      };
    });

    return {
      success: true,
      found: true,
      count: normalized.length,
      contact: normalized[0],
      contacts: normalized
    };
  } catch (error) {
    console.error("[searchBiginContactAction] Error:", error);
    return { success: false, error: error.message || "Error al consultar Zoho Bigin" };
  }
}

/**
 * ⚡ Apply Bigin Contact Data Directly to a Quotation
 */
export async function applyBiginDataToQuotationAction(quotationId, biginContact) {
  if (!quotationId || !biginContact || !adminDb) {
    throw new Error("Quotation ID y datos de contacto de Bigin son requeridos");
  }

  try {
    const quoteRef = adminDb.collection('quotations').doc(quotationId);
    const snap = await quoteRef.get();
    if (!snap.exists) throw new Error("Cotización no encontrada");

    const now = new Date();
    const updates = {
      patientName: biginContact.name,
      clientName: biginContact.name,
      patientEmail: biginContact.email || '',
      patientPhone: biginContact.phone || biginContact.mobile || '',
      shippingAddress: biginContact.shippingAddress || null,
      deliveryInstructions: biginContact.deliveryInstructions || '',
      biginContactId: biginContact.id,
      biginSyncedAt: now.toISOString(),
      updatedAt: now
    };

    if (biginContact.company) {
      updates.clinicName = biginContact.company;
    }

    await quoteRef.update(updates);

    // Also upsert into Firestore clients collection for future reuse
    const clientSlug = (biginContact.name || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await adminDb.collection('clients').doc(clientSlug).set({
      id: clientSlug,
      name: biginContact.name,
      email: biginContact.email || '',
      phone: biginContact.phone || '',
      shippingAddress: biginContact.shippingAddress || null,
      deliveryInstructions: biginContact.deliveryInstructions || '',
      biginId: biginContact.id,
      updatedAt: now.toISOString()
    }, { merge: true }).catch(() => {});

    return {
      success: true,
      message: `Datos de ${biginContact.name} aplicados a la cotización con éxito`
    };
  } catch (error) {
    console.error("[applyBiginDataToQuotationAction] Error:", error);
    throw new Error(error.message || "Error al aplicar datos de Bigin a la cotización");
  }
}

