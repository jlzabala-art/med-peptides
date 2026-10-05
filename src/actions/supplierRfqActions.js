"use server";

import { adminDb } from '../lib/firebaseAdmin.js';
import { serializeFirestoreData, serializeDoc } from '../lib/serializeFirestore.js';
import logger from '../utils/logger.js';

/**
 * Generates a clean random token for public zero-login supplier access
 */
function generatePublicToken() {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `rfq_${time}_${rand}`;
}

/**
 * 1. Create a Supplier RFQ directly from an imported Prescription
 */
export async function serverCreateSupplierRFQFromPrescription({
  rxId,
  supplierId = null,
  supplierName = null,
  notes = '',
  requestedByUid = 'admin',
}) {
  if (!adminDb) {
    throw new Error("Firebase Admin is not initialized.");
  }

  try {
    // 1. Fetch prescription
    let rxSnap = await adminDb.collection('prescriptions').doc(rxId).get();
    let rxData = null;

    if (rxSnap.exists) {
      rxData = rxSnap.data();
    } else {
      // Fallback: search by prescriptionCode or boxId
      const qCode = await adminDb.collection('prescriptions').where('prescriptionCode', '==', rxId).limit(1).get();
      if (!qCode.empty) {
        rxSnap = qCode.docs[0];
        rxData = rxSnap.data();
      } else {
        const qBox = await adminDb.collection('prescriptions').where('fagronDetails.boxId', '==', rxId).limit(1).get();
        if (!qBox.empty) {
          rxSnap = qBox.docs[0];
          rxData = rxSnap.data();
        }
      }
    }

    if (!rxData) {
      throw new Error(`Prescription ${rxId} not found.`);
    }

    // 2. Extract active ingredients and vehicles
    const items = [];
    const formulationBlocks = rxData.formulationBlocks || [];

    if (formulationBlocks.length > 0) {
      formulationBlocks.forEach((block, bIdx) => {
        const blockTitle = block.title || block.name || `Formulation ${bIdx + 1}`;
        const vehicleRaw = block.vehicle || 'Standard Vehicle';
        const vehicle = typeof vehicleRaw === 'string' ? vehicleRaw : (vehicleRaw?.name || vehicleRaw?.title || 'Standard Vehicle');
        const rawItems = block.items || block.ingredients || [];

        rawItems.forEach((ing, iIdx) => {
          items.push({
            itemId: `item_${bIdx + 1}_${iIdx + 1}`,
            blockTitle,
            name: ing.name || ing.activeIngredient || 'Compounded Ingredient',
            concentration: ing.dosage || ing.concentration || ing.dose || '',
            vehicle,
            amount: ing.amount || 1,
            unit: ing.unit || 'unit',
            purity: 'Ph. Eur. / USP Grade (≥98%)',
            proposedUnitPrice: 0,
            finalUnitPrice: null,
            instructions: ing.instructions || block.posology || '',
          });
        });

        // Add vehicle line if specific compounding base is required
        if (vehicle && !String(vehicle).toLowerCase().includes('standard')) {
          items.push({
            itemId: `vehicle_${bIdx + 1}`,
            blockTitle,
            name: `Compounding Vehicle Base: ${vehicle}`,
            concentration: 'Excipient / Vehicle',
            vehicle,
            amount: 1,
            unit: 'bottle/vial',
            purity: 'Compounding Pharmaceutical Grade',
            proposedUnitPrice: 0,
            finalUnitPrice: null,
            instructions: 'Vehicle base for active formulation',
          });
        }
      });
    } else if (Array.isArray(rxData.items) && rxData.items.length > 0) {
      rxData.items.forEach((it, idx) => {
        items.push({
          itemId: `item_1_${idx + 1}`,
          blockTitle: 'Primary Prescription Formulation',
          name: it.name || it.product_title || 'Active Compound',
          concentration: it.dosage || it.strength || '',
          vehicle: it.vehicle || 'Sterile Solution / Base',
          amount: it.amount || it.quantity || 1,
          unit: it.unit || 'vial',
          purity: 'Ph. Eur. / USP Grade (≥98%)',
          proposedUnitPrice: 0,
          finalUnitPrice: null,
          instructions: it.instructions || '',
        });
      });
    }

    // 3. Setup RFQ document
    const prfqId = `PRFQ-${Date.now().toString().slice(-6)}`;
    const publicToken = generatePublicToken();
    const prescriptionCode = rxData.prescriptionCode || rxData.fagronDetails?.boxId || rxId;

    const rfqPayload = {
      prfqId,
      publicToken,
      prescriptionId: rxSnap.id,
      prescriptionCode,
      patientReference: rxData.patient?.name ? `${rxData.patient.name.charAt(0)}... (Ref: ${prescriptionCode})` : `Ref: ${prescriptionCode}`,
      patientName: rxData.patient?.name || rxData.patientName || 'Clinical Patient',
      doctorName: rxData.doctor?.name || rxData.doctorName || 'Prescribing Physician',
      clinicName: 'Med-Peptides & Magenta Health Compounding Network',
      supplierId: supplierId || null,
      supplierName: supplierName || 'Specialist Compounding Pharmacy / Lab',
      items,
      formulationBlocks,
      fagronDetails: rxData.fagronDetails || null,
      notes: notes || 'Please provide compounding quotation, available batch expiry, certificate of analysis, and express cold-chain freight.',
      status: 'pending_supplier',
      requestedByUid,
      totals: {
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days validity
    };

    const docRef = await adminDb.collection('purchase_rfqs').add(rfqPayload);

    logger.info('[supplierRfqActions] Created RFQ for prescription', {
      rfqDocId: docRef.id,
      prfqId,
      publicToken,
      prescriptionCode,
    });

    return {
      success: true,
      rfqId: docRef.id,
      prfqId,
      publicToken,
      publicUrl: `/rfq/${publicToken}`,
      itemCount: items.length,
    };
  } catch (err) {
    logger.error('[supplierRfqActions] Error creating RFQ from prescription', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * 2. Public Action: Fetch RFQ by publicToken (Zero Login Required)
 */
export async function fetchPublicRFQByTokenAction(token) {
  if (!token || !adminDb) {
    return { success: false, error: "Invalid token or database unavailable." };
  }

  try {
    let rfqDoc = null;

    // Search by publicToken
    const qToken = await adminDb.collection('purchase_rfqs').where('publicToken', '==', token).limit(1).get();
    if (!qToken.empty) {
      rfqDoc = qToken.docs[0];
    } else {
      // Fallback 1: direct doc ID in purchase_rfqs
      const dDoc = await adminDb.collection('purchase_rfqs').doc(token).get();
      if (dDoc.exists) {
        rfqDoc = dDoc;
      } else {
        // Fallback 2: search by prfqId
        const qPrfq = await adminDb.collection('purchase_rfqs').where('prfqId', '==', token).limit(1).get();
        if (!qPrfq.empty) {
          rfqDoc = qPrfq.docs[0];
        }
      }
    }

    if (!rfqDoc || !rfqDoc.exists) {
      return { success: false, error: "Request for Quotation not found or expired." };
    }

    const data = rfqDoc.data();

    // Track first view if pending
    if (data.status === 'pending_supplier' && !data.viewedAt) {
      await adminDb.collection('purchase_rfqs').doc(rfqDoc.id).update({
        viewedAt: new Date(),
        updatedAt: new Date(),
      }).catch(() => {});
    }

    const serialized = {
      id: rfqDoc.id,
      prfqId: data.prfqId || `PRFQ-${rfqDoc.id.slice(0, 6)}`,
      publicToken: data.publicToken || token,
      prescriptionId: data.prescriptionId || null,
      prescriptionCode: data.prescriptionCode || null,
      patientReference: data.patientReference || 'Anonymized Clinical Patient',
      doctorName: data.doctorName || 'Prescribing Physician',
      clinicName: data.clinicName || 'Med-Peptides Compounding Network',
      supplierName: data.supplierName || 'Compounding Pharmacy / Lab',
      items: Array.isArray(data.items) ? data.items : [],
      formulationBlocks: Array.isArray(data.formulationBlocks) ? data.formulationBlocks : [],
      fagronDetails: data.fagronDetails || null,
      notes: data.notes || '',
      status: data.status || 'pending_supplier',
      totals: data.totals || { subtotal: 0, shipping: 0, total: 0 },
      supplierQuotation: data.supplierQuotation || null,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
      expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : null,
      viewedAt: data.viewedAt?.toDate ? data.viewedAt.toDate().toISOString() : null,
      quotedAt: data.quotedAt?.toDate ? data.quotedAt.toDate().toISOString() : null,
    };

    return { success: true, rfq: serialized };
  } catch (err) {
    logger.error('[supplierRfqActions] Error fetching public RFQ', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * 3. Public Action: Supplier submits quotation prices and details
 */
export async function submitSupplierQuotationAction(token, quotationPayload) {
  if (!token || !adminDb) {
    return { success: false, error: "Invalid token or database unavailable." };
  }

  try {
    // 1. Find RFQ
    let rfqRef = null;
    const qToken = await adminDb.collection('purchase_rfqs').where('publicToken', '==', token).limit(1).get();
    if (!qToken.empty) {
      rfqRef = qToken.docs[0].ref;
    } else {
      const dDoc = await adminDb.collection('purchase_rfqs').doc(token).get();
      if (dDoc.exists) {
        rfqRef = dDoc.ref;
      }
    }

    if (!rfqRef) {
      return { success: false, error: "Quotation request not found or expired." };
    }

    const {
      supplierName,
      contactPerson,
      contactEmail,
      contactPhone,
      facilityLocation,
      currency = 'EUR',
      items = [],
      compoundingFee = 0,
      shippingCost = 0,
      leadTimeDays = 3,
      hasCOA = true,
      supplierNotes = '',
    } = quotationPayload;

    if (!supplierName?.trim()) {
      return { success: false, error: "Supplier / Laboratory name is required." };
    }

    // Calculate subtotal from items
    let itemsSubtotal = 0;
    const sanitizedItems = items.map((item) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const amount = parseFloat(item.amount) || 1;
      const lineTotal = unitPrice * amount;
      itemsSubtotal += lineTotal;

      return {
        ...item,
        finalUnitPrice: unitPrice,
        lineTotal,
      };
    });

    const parsedCompounding = parseFloat(compoundingFee) || 0;
    const parsedShipping = parseFloat(shippingCost) || 0;
    const grandTotal = itemsSubtotal + parsedCompounding + parsedShipping;

    const supplierQuotation = {
      supplierName: supplierName.trim(),
      contactPerson: (contactPerson || '').trim(),
      contactEmail: (contactEmail || '').trim(),
      contactPhone: (contactPhone || '').trim(),
      facilityLocation: (facilityLocation || '').trim(),
      currency,
      items: sanitizedItems,
      compoundingFee: parsedCompounding,
      shippingCost: parsedShipping,
      itemsSubtotal,
      total: grandTotal,
      leadTimeDays: parseInt(leadTimeDays) || 3,
      hasCOA: Boolean(hasCOA),
      supplierNotes: (supplierNotes || '').trim(),
      submittedAt: new Date().toISOString(),
    };

    // Update the purchase_rfqs document in Firestore
    await rfqRef.update({
      status: 'supplier_quoted',
      supplierName: supplierName.trim(),
      supplierQuotation,
      items: sanitizedItems,
      supplierNotes: supplierNotes.trim(),
      totals: {
        subtotal: itemsSubtotal + parsedCompounding,
        shipping: parsedShipping,
        total: grandTotal,
        currency,
      },
      quotedAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info('[supplierRfqActions] Supplier quotation submitted successfully', {
      rfqId: rfqRef.id,
      supplierName,
      grandTotal,
      currency,
    });

    return {
      success: true,
      rfqId: rfqRef.id,
      total: grandTotal,
      currency,
    };
  } catch (err) {
    logger.error('[supplierRfqActions] Error submitting quotation', { error: err.message });
    return { success: false, error: err.message };
  }
}
