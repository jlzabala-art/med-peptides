import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import notifier from './NotificationService';
import logger from '../utils/logger.js';

/**
 * WorkspaceDispatcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Command Dispatcher for the Workspace Buffer.
 * Encapsulates multi-role business rules, negative margin validation,
 * supplier grouping, and Firestore atomic writes for Quotations, RFQs & Rx.
 */

/**
 * Validates workspace items before dispatch
 * @param {Array} items - List of items in the workspace buffer
 * @param {string} targetType - 'quotation' | 'rfq' | 'prescription' | 'order'
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateWorkspaceItems(items = [], targetType = 'quotation') {
  const errors = [];
  const warnings = [];

  if (!items || items.length === 0) {
    errors.push('The workspace buffer is empty. Please add products or protocols first.');
    return { isValid: false, errors, warnings };
  }

  items.forEach((item, idx) => {
    const itemName = item.name || `Item #${idx + 1}`;
    
    // 1. Quantity validation
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`"${itemName}" has an invalid quantity (${item.quantity}).`);
    }

    // 2. Pricing & Margin Guard (For Quotations & Orders)
    if (targetType === 'quotation' || targetType === 'order') {
      const cost = Number(item.costPrice ?? item.unitCost ?? 0);
      const price = Number(item.price ?? item.unitPrice ?? 0);
      
      if (price <= 0) {
        warnings.push(`"${itemName}" has a price of $0.00. Please verify.`);
      } else if (cost > 0 && price < cost) {
        errors.push(`Negative Margin Guard: "${itemName}" price ($${price}) is below acquisition cost ($${cost}).`);
      }
    }

    // 3. Clinical Dosage validation (For Prescriptions)
    if (targetType === 'prescription') {
      if (!item.dosage && !item.sampleType && !item.size) {
        warnings.push(`"${itemName}" does not have an explicit dosage assigned.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Dispatches the workspace buffer to a formal B2B Quotation
 */
export async function dispatchToQuotation({
  items = [],
  protocols = [],
  clientName = '',
  clientEmail = '',
  clientId = null,
  currency = 'USD',
  priceChannel = 'wholesale',
  shippingCost = 0,
  shippingMethod = 'standard',
  notes = '',
  createdBy = 'admin'
}) {
  const validation = validateWorkspaceItems(items, 'quotation');
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' | '));
  }

  try {
    const timestamp = Date.now();
    const shortCode = timestamp.toString().slice(-6);
    const quotationNumber = `QUOT-${shortCode}`;
    const token = `qt_${timestamp.toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Compute totals
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const totalCost = items.reduce((sum, item) => sum + (Number(item.costPrice || item.unitCost || 0) * Number(item.quantity || 1)), 0);
    const total = subtotal + Number(shippingCost || 0);
    const grossProfit = subtotal - totalCost;
    const grossMarginPct = subtotal > 0 ? Number(((grossProfit / subtotal) * 100).toFixed(1)) : 0;

    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +30 days

    const quotationData = {
      quotationNumber,
      token,
      status: 'pending', // 'pending' | 'accepted' | 'converted' | 'expired'
      clientName: clientName.trim() || 'Valued Clinical Partner',
      clientEmail: clientEmail.trim() || '',
      clientId: clientId || null,
      currency,
      priceChannel,
      items: items.map(item => ({
        key: item.key || `${item.productId}::${item.variantId || 'default'}`,
        productId: item.productId || 'unknown',
        variantId: item.variantId || 'default',
        name: item.name || 'Product',
        dosage: item.dosage || '',
        presentation: item.presentation || '',
        supplierId: item.supplierId || null,
        supplierName: item.supplierName || '',
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price || 0),
        unitCost: Number(item.costPrice || item.unitCost || 0),
        totalPrice: Number(item.price || 0) * Number(item.quantity || 1),
        bundleMeta: item.bundleMeta || null
      })),
      protocols: (protocols || []).map(p => ({
        id: p.id,
        name: p.name,
        goal: p.goal || '',
        estimatedCost: p.estimatedCost || 0
      })),
      financials: {
        subtotal: Number(subtotal.toFixed(2)),
        shippingCost: Number(shippingCost || 0),
        shippingMethod,
        total: Number(total.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        grossMarginPct
      },
      validUntil,
      notes: notes || 'Prices valid for 30 calendar days. Ex-Works or direct cold-chain courier as specified.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy
    };

    const docRef = await addDoc(collection(db, 'quotations'), quotationData);

    notifier.success(`B2B Quotation "${quotationNumber}" generated successfully!`);
    return {
      success: true,
      id: docRef.id,
      quotationNumber,
      token,
      interactiveUrl: `/quotation/${token}`,
      pdfUrl: `/api/generate-pdf?docType=quotation&id=${docRef.id}&ref=${quotationNumber}`,
      financials: quotationData.financials
    };
  } catch (error) {
    logger.error('[WorkspaceDispatcher] Error emitting quotation:', error);
    notifier.error(`Failed to create quotation: ${error.message}`);
    throw error;
  }
}

/**
 * Groups workspace items by supplier and dispatches individual RFQ documents
 */
export async function dispatchToSupplierRFQ({
  items = [],
  notes = '',
  requestedBy = 'admin'
}) {
  const validation = validateWorkspaceItems(items, 'rfq');
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' | '));
  }

  try {
    // 1. Group items by supplierId
    const supplierGroups = {};
    items.forEach(item => {
      const suppId = item.supplierId || 'supplier-unassigned';
      if (!supplierGroups[suppId]) {
        supplierGroups[suppId] = {
          supplierId: suppId,
          supplierName: item.supplierName || suppId.replace('supplier-', '').toUpperCase(),
          items: []
        };
      }
      supplierGroups[suppId].items.push({
        key: item.key,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        dosage: item.dosage,
        presentation: item.presentation,
        quantity: item.quantity,
        targetUnitCost: item.costPrice || item.unitCost || 0
      });
    });

    const createdRfqs = [];
    const suppKeys = Object.keys(supplierGroups);

    // 2. Create RFQ document for each supplier
    for (const suppId of suppKeys) {
      const group = supplierGroups[suppId];
      const rfqNumber = `RFQ-${Date.now().toString().slice(-6)}-${suppId.replace('supplier-', '').slice(0, 4).toUpperCase()}`;

      const rfqDoc = {
        rfqNumber,
        supplierId: suppId,
        supplierName: group.supplierName,
        status: 'draft', // 'draft' | 'sent' | 'quoted' | 'accepted' | 'declined'
        items: group.items,
        totalItemsCount: group.items.reduce((sum, i) => sum + i.quantity, 0),
        notes: notes || 'Please provide updated volume tier pricing, current batch COA, and lead time.',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requestedBy
      };

      const docRef = await addDoc(collection(db, 'supplier_rfqs'), rfqDoc);
      createdRfqs.push({ id: docRef.id, rfqNumber, supplierName: group.supplierName });
    }

    notifier.success(`Created ${createdRfqs.length} Supplier RFQ drafts in staging!`);
    return {
      success: true,
      rfqsCount: createdRfqs.length,
      rfqs: createdRfqs
    };
  } catch (error) {
    logger.error('[WorkspaceDispatcher] Error launching supplier RFQs:', error);
    notifier.error(`Failed to launch supplier RFQs: ${error.message}`);
    throw error;
  }
}

/**
 * Dispatches workspace items into an official Medical Prescription Draft
 */
export async function dispatchToPrescription({
  items = [],
  protocols = [],
  patientId,
  patientName = '',
  doctorId,
  doctorName = '',
  clinicalNotes = ''
}) {
  if (!patientId) {
    throw new Error('Please select a patient to assign this prescription.');
  }

  const validation = validateWorkspaceItems(items, 'prescription');
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' | '));
  }

  try {
    const rxNumber = `RX-${Date.now().toString().slice(-6)}`;
    const rxData = {
      prescriptionNumber: rxNumber,
      patientId,
      patientName,
      doctorId: doctorId || 'dr_admin',
      doctorName: doctorName || 'Physician',
      status: 'draft', // 'draft' | 'active' | 'completed' | 'cancelled'
      medications: items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        dosage: item.dosage || 'As directed',
        presentation: item.presentation || 'vial',
        quantity: item.quantity || 1,
        frequency: 'Daily subcutaneous injection or as clinically indicated',
        durationWeeks: item.bundleMeta?.recommendedDurationWeeks || 4
      })),
      protocolRef: protocols.length > 0 ? protocols[0].name : null,
      clinicalNotes: clinicalNotes || 'Follow standard titration schedule. Monitor lab biomarkers at 4 weeks.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'prescriptions'), rxData);
    notifier.success(`Prescription "${rxNumber}" created for ${patientName || 'Patient'}!`);
    return {
      success: true,
      id: docRef.id,
      prescriptionNumber: rxNumber
    };
  } catch (error) {
    logger.error('[WorkspaceDispatcher] Error creating prescription:', error);
    notifier.error(`Failed to create prescription: ${error.message}`);
    throw error;
  }
}
