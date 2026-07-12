import { useCallback, useState } from 'react';
import * as fb from '../../firebase';
const db = fb?.db;
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * Hook to manage the Admin <-> Supplier Procurement flow.
 * Includes creating Purchase RFQs, Supplier responses, and Purchase Orders.
 */
export function useProcurementManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  /**
   * 1. Create a Purchase RFQ
   * Triggered by Admin to request a quote from a Supplier.
   * Can include proposed prices/discounts based on the Supplier's price list.
   */
  const createPurchaseRFQ = useCallback(async ({ 
    requestedByUid, 
    supplierId, 
    items, 
    notes, 
    proposedDiscount = 0,
    shippingAddress = null 
  }) => {
    setLoading(true);
    setError(null);
    try {
      const prfqId = `PRFQ-${generateId()}`;
      
      // Calculate totals based on proposed prices
      let subtotal = 0;
      items.forEach(item => {
        subtotal += (item.proposedUnitPrice * item.qty);
      });
      
      const docRef = await addDoc(collection(db, 'purchase_rfqs'), {
        prfqId,
        requestedByUid,
        supplierId,
        shippingAddress,
        items,
        notes,
        proposedDiscount,
        totals: {
          subtotal,
          total: subtotal
        },
        status: 'pending_supplier', // pending_supplier | supplier_quoted | accepted | rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      return { id: docRef.id, prfqId };
    } catch (err) {
      console.error('Error creating Purchase RFQ:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * 2. Supplier Responds to RFQ
   * Triggered by Supplier to accept proposed prices, or counter-offer with their own.
   */
  const respondToPurchaseRFQ = useCallback(async ({ rfqDocId, supplierNotes, finalItems, finalShippingCost }) => {
    setLoading(true);
    setError(null);
    try {
      let subtotal = 0;
      finalItems.forEach(item => {
        subtotal += (item.finalUnitPrice * item.qty);
      });
      
      const total = subtotal + (finalShippingCost || 0);

      await updateDoc(doc(db, 'purchase_rfqs', rfqDocId), {
        status: 'supplier_quoted',
        items: finalItems,
        supplierNotes,
        totals: {
          subtotal,
          shipping: finalShippingCost || 0,
          total
        },
        updatedAt: serverTimestamp()
      });

      setLoading(false);
    } catch (err) {
      console.error('Error responding to Purchase RFQ:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * 3. Convert Purchase RFQ to Purchase Order (PO)
   * Triggered by Admin when accepting the supplier's quotation.
   */
  const convertPurchaseRFQToPO = useCallback(async ({ rfqDocId, paymentMethod }) => {
    setLoading(true);
    setError(null);
    try {
      const rfqSnap = await getDoc(doc(db, 'purchase_rfqs', rfqDocId));
      if (!rfqSnap.exists()) throw new Error('Purchase RFQ not found');

      const rfqData = rfqSnap.data();
      const poId = `PO-${generateId()}`;

      // Create Purchase Order
      const poRef = await addDoc(collection(db, 'purchase_orders'), {
        poId,
        prfqRef: rfqDocId,
        supplierId: rfqData.supplierId,
        requestedByUid: rfqData.requestedByUid,
        items: rfqData.items,
        totals: rfqData.totals,
        shippingAddress: rfqData.shippingAddress,
        notes: rfqData.notes,
        supplierNotes: rfqData.supplierNotes,
        paymentMethod,
        status: 'pending_fulfillment',
        createdAt: serverTimestamp(),
      });

      // Update RFQ status
      await updateDoc(doc(db, 'purchase_rfqs', rfqDocId), {
        status: 'accepted',
        poRef: poRef.id,
        updatedAt: serverTimestamp()
      });

      setLoading(false);
      return { poDocId: poRef.id, poId };
    } catch (err) {
      console.error('Error converting PRFQ to PO:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    createPurchaseRFQ,
    respondToPurchaseRFQ,
    convertPurchaseRFQToPO
  };
}
