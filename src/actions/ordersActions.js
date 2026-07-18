"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchOrdersAction({ limitCount = 50, buyerId = null, accountManagerId = null, doctorId = null } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    let ordersRef = adminDb.collection('orders');
    
    if (buyerId) {
      ordersRef = ordersRef.where('paymentOwnerId', '==', buyerId);
    }
    if (accountManagerId) {
      ordersRef = ordersRef.where('accountManagerId', '==', accountManagerId);
    }
    if (doctorId) {
      ordersRef = ordersRef.where('doctorId', '==', doctorId);
    }

    const snapshot = await ordersRef.orderBy('createdAt', 'desc').limit(limitCount).get();
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      // Serialize dates for Client Component passing
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && data.updatedAt.toDate) {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders securely:", error);
    return [];
  }
}

import { AggregateField } from 'firebase-admin/firestore';

export async function fetchOrdersMetricsAction({ buyerId = null, accountManagerId = null, doctorId = null } = {}) {
  try {
    if (!adminDb) return { total: 0, pending: 0, shipped: 0, completed: 0, totalRevenue: 0 };
    
    let baseQuery = adminDb.collection('orders');
    
    if (buyerId) {
      baseQuery = baseQuery.where('paymentOwnerId', '==', buyerId);
    }
    if (accountManagerId) {
      baseQuery = baseQuery.where('accountManagerId', '==', accountManagerId);
    }
    if (doctorId) {
      baseQuery = baseQuery.where('doctorId', '==', doctorId);
    }

    const [
      totalSnap,
      pendingSnap,
      shippedSnap,
      completedSnap,
      revenueSnap
    ] = await Promise.all([
      baseQuery.count().get(),
      baseQuery.where('status', 'in', ['pending', 'processing']).count().get(),
      baseQuery.where('status', '==', 'shipped').count().get(),
      baseQuery.where('status', 'in', ['completed', 'delivered']).count().get(),
      baseQuery.aggregate({ totalRevenue: AggregateField.sum('total') }).get().catch(() => ({ data: () => ({ totalRevenue: 0 }) }))
    ]);

    return {
      total: totalSnap.data().count,
      pending: pendingSnap.data().count,
      shipped: shippedSnap.data().count,
      completed: completedSnap.data().count,
      totalRevenue: revenueSnap.data().totalRevenue || 0
    };
  } catch (error) {
    console.error("Error fetching orders metrics:", error);
    return { total: 0, pending: 0, shipped: 0, completed: 0, totalRevenue: 0 };
  }
}

import { resolveVariantPrice } from '../utils/resolvePrice';
import { DEFAULT_SETTINGS } from '../utils/constants';

export async function submitValidatedOrderAction({
  cartItems,
  formData,
  shippingMethod,
  selectedShippingCost,
  activeRegion,
  uid,
  isProfessional,
  pricingTier,
  pricingRole,
  cartOwnership,
  prescriptionSpecs,
  prescriptionName,
  fileUrl
}) {
  try {
    if (!adminDb) throw new Error("adminDb is not initialized.");

    const items = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const { id, productId, name, itemKey, dosagePart, qty } = item;
      
      const targetId = productId || id || itemKey; // fallback
      
      let unitPrice = 0;
      let lineTotal = 0;

      if (targetId) {
        // Find product in DB
        let docRef;
        // Check if targetId is an actual doc ID (simple heuristic)
        if (targetId.includes('-') || targetId.length > 5) {
          docRef = adminDb.collection('products').doc(targetId);
        }
        
        let freshProduct = null;
        if (docRef) {
          const snap = await docRef.get();
          if (snap.exists) {
            freshProduct = snap.data();
          }
        }
        
        // If not found by ID, try querying by name
        if (!freshProduct) {
          const q = await adminDb.collection('products').where('name', '==', name || targetId).limit(1).get();
          if (!q.empty) {
            freshProduct = q.docs[0].data();
          }
        }

        if (freshProduct) {
           const variant = dosagePart ? freshProduct.variants?.find(v => v.dosage === dosagePart || v.strength === dosagePart) : null;
           const src = variant ?? freshProduct.defaultVariant ?? freshProduct.variants?.[0] ?? freshProduct;
           
           const resolved = resolveVariantPrice(src, { 
             tier: pricingTier || (isProfessional ? 'wholesale' : 'retail'),
             tenant: !isProfessional ? { id: 'lotusland' } : undefined
           });
           
           unitPrice = resolved.perUnit || 0;
           const kitPrice = resolved.kit || 0;
           
           if (isProfessional && freshProduct.category !== 'Research Supplies' && kitPrice > 0 && qty >= 10) {
             const kits = Math.floor(qty / 10);
             lineTotal = (kits * kitPrice) + ((qty % 10) * unitPrice);
           } else {
             lineTotal = unitPrice * qty;
           }
        }
      }

      subtotal += lineTotal;
      items.push({
        name: itemKey || name,
        variant: dosagePart || null,
        quantity: qty,
        unitPrice,
        lineTotal,
        productId: productId || id || null
      });
    }

    const shippingCost = selectedShippingCost || 40;
    const total = subtotal + shippingCost;
    const currency = DEFAULT_SETTINGS.exchangeRates?.[activeRegion]?.currency || 'USD';
    const currencySymbol = currency === 'USD' ? '$' : '€';

    const n = new Date();
    const newId = `ORD-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;

    const orderDoc = {
      orderId: newId,
      source: isProfessional ? 'b2b_portal' : 'b2c_home',
      customerType: isProfessional ? 'professional' : 'retail',
      uid: uid || null,
      paymentOwnerId: uid || null,
      supervisingPhysicianId: cartOwnership?.supervisingPhysicianId ?? null,
      supervisingAdminId: cartOwnership?.supervisingAdminId ?? null,
      recommendationId: cartOwnership?.recommendationId ?? null,
      prescriptionId: cartOwnership?.prescriptionId ?? null,
      tenantId: cartOwnership?.tenantId || null,
      ownerType: cartOwnership?.ownerType || null,
      ownerId: cartOwnership?.ownerId || null,
      sourceDomain: cartOwnership?.sourceDomain || null,
      attributionLocked: cartOwnership?.attributionLocked || false,
      
      customer: { 
        fullName: `${formData.firstName} ${formData.lastName}`, 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        email: formData.email, 
        phone: formData.phone, 
        institution: formData.clinic || null 
      },
      shippingAddress: { 
        street: formData.address, 
        country: formData.country?.value || null 
      },
      items, 
      subtotal, 
      shipping: shippingCost, 
      shippingMethod: shippingMethod ?? 'standard', 
      total,
      totalDisplay: `${currencySymbol}${total.toFixed(0)}`,
      currency,
      region: activeRegion || 'us', 
      paymentMethod: formData.paymentMethod ?? 'credit_card',
      orderNotes: formData.orderNotes || null,
      isProfessional: !!isProfessional, 
      pricingTier: pricingTier || null, 
      pricingRole: pricingRole || null, 
      status: 'pending', 
      createdAt: adminDb.FieldValue ? adminDb.FieldValue.serverTimestamp() : new Date(),
      
      prescription: prescriptionSpecs ? {
        fileName: prescriptionName,
        fileUrl: fileUrl || null,
        dosage: prescriptionSpecs.dosage,
        frequency: prescriptionSpecs.frequency,
        match: prescriptionSpecs.match,
        verified: true
      } : null,
    };

    await adminDb.collection('orders').add(orderDoc);
    
    return { success: true, orderId: newId, totals: { subtotal, shippingCost, total }, items };
  } catch (err) {
    console.error("submitValidatedOrderAction failed:", err);
    throw new Error("Order validation failed on the server.");
  }
}


export async function fetchBulkOrdersAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('bulk_orders')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && data.updatedAt.toDate) {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    return orders;
  } catch (error) {
    console.error("Error fetching bulk orders securely:", error);
    return [];
  }
}
