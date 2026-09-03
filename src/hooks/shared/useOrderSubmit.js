import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as fb from '../../firebase';
const db = fb?.db;
const storage = fb?.storage;
// import { trackEvent } from '../../utils/analytics';
import { EXCHANGE_RATES } from '../../utils/currencies';
import { useTransactionManager } from '../data/useTransactionManager';

export function useOrderSubmit({
  user,
  register,
  updateProfileData,
  activeRegion,
  cartOwnership,
  isProfessional,
  pricingTier,
  pricingRole,
  shippingCosts,
  products
}) {
  const { createQuotationRequest } = useTransactionManager();

  const generateOrderId = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 8; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  }, []);

  const submitOrder = useCallback(async ({
    formData,
    enrichedCartItems,
    cartMetadata,
    protocolGroups,
    checkoutTotals,
    selectedShipping,
    prescriptionFile,
    prescriptionName,
    prescriptionSpecs,
    stateControls
  }) => {
    const {
      setIsSubmitting,
      setShowLogin,
      setInlineError,
      setOrderId,
      setFinalOrderData,
      setIsDone,
      onComplete
    } = stateControls;

    setIsSubmitting(true);
    setInlineError(null);

    try {
      const itemNames = enrichedCartItems.map(i => i.itemKey).join(', ');
      const protocolIds = Object.keys(protocolGroups).join(', ');
      
      // trackEvent('purchase_intent', {
      //   intent_type: 'final_submission',
      //   protocol_id: protocolIds || 'none',
      //   peptide_name: itemNames || 'none',
      //   order_total: checkoutTotals.display
      // });

      let currentUid = user?.uid;
      
      // Auto-register if not logged in
      if (!currentUid) {
        try {
          const fullName = `${formData.firstName} ${formData.lastName}`;
          const userType = formData.isProfessional ? 'researcher' : 'patient';
          const cred = await register(
            formData.email,
            formData.password,
            fullName,
            formData.clinic,
            userType
          );
          currentUid = cred.user.uid;
        } catch (err) {
          console.error('Registration failed:', err);
          if (err.code === 'auth/email-already-in-use') {
            setShowLogin(true);
            setInlineError('An account with this email already exists. Please sign in below to continue with your order.');
          } else {
            setInlineError(err.message || 'Registration failed. If you already have an account, please sign in.');
          }
          setIsSubmitting(false);
          return;
        }
      }

      const newId = generateOrderId();
      setOrderId(newId);
      const shippingCost = shippingCosts[selectedShipping] ?? 40;
      
      let fileUrl = null;
      if (prescriptionFile && currentUid) {
        try {
          const storageRef = ref(storage, `prescriptions/${currentUid}/${Date.now()}_${prescriptionFile.name}`);
          const uploadSnap = await uploadBytes(storageRef, prescriptionFile);
          fileUrl = await getDownloadURL(uploadSnap.ref);
        } catch (storageErr) {
          console.error('Storage upload failed:', storageErr);
        }
      }

      const items = enrichedCartItems.map(i => {
        const meta = cartMetadata[i.itemKey] || {};
        return {
          name: i.name || i.namePart || meta.productName || meta.protocolName || meta.name || i.itemKey,
          variant: i.dosagePart || meta.dosage || null,
          category: i.category || meta.category || (i.isProtocol ? 'Protocol' : 'Peptides'),
          productKey: i.itemKey,
          quantity: i.qty,
          unitPrice: i.unitPrice ?? 0,
          lineTotal: i.lineTotal ?? 0,
          productId: i.productId || meta.productId || null,
          variantId: i.variantId || meta.variantId || null,
          supplierId: i.supplierId || meta.supplierId || null,
          isProtocol: i.isProtocol || meta.isProtocol || false,
          protocolId: meta.protocolId || null
        };
      });

      const subtotal = checkoutTotals?.subtotal !== undefined ? checkoutTotals.subtotal : enrichedCartItems.reduce((a, i) => a + i.lineTotal, 0);
      const total = subtotal + shippingCost;
      const currency = EXCHANGE_RATES[activeRegion]?.currency || 'USD';
      const currencySymbol = currency === 'USD' ? '$' : '€';

      const paymentOwnerId = currentUid;
      const supervisingPhysicianId = cartOwnership?.supervisingPhysicianId ?? null;
      const supervisingAdminId = cartOwnership?.supervisingAdminId ?? null;
      const orderSource = cartOwnership?.source ?? 'patient_selected';
      const recommendationId = cartOwnership?.recommendationId ?? null;
      const prescriptionId = cartOwnership?.prescriptionId ?? null;

      const customerData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        institution: formData.clinic || null
      };

      const shippingAddressData = { street: formData.address, country: formData.country?.value || null };

      if (isProfessional) {
        // Create an RFQ for B2B
        const rfqParams = {
          requestedByUid: currentUid,
          tenantId: cartOwnership?.tenantId || null,
          patientId: cartOwnership?.patientId || null,
          customer: customerData,
          shippingAddress: shippingAddressData,
          totals: {
            subtotal,
            shipping: shippingCost,
            total,
            currency,
            shippingMethod: selectedShipping ?? 'standard'
          },
          items,
          notes: formData.orderNotes || null,
          source: orderSource
        };
        const { rfqId } = await createQuotationRequest(rfqParams);
        // Overwrite newId to be the RFQ ID so it shows nicely on the success screen
        setOrderId(rfqId);
      } else {
        // Standard B2C Order creation (Matched exactly to Checkout.jsx)
        const orderRef = await addDoc(collection(db, 'orders'), {
          source: isProfessional ? 'b2b_portal' : 'b2c_home',
          customerType: isProfessional ? 'professional' : 'retail',
          // ── Identity & ownership ──
          uid: currentUid,
          paymentOwnerId,           // always === currentUid (invariant)
          supervisingPhysicianId,   // null when no supervising doctor assigned
          supervisingAdminId,       // null when no admin supervision
          source: orderSource,      // 'patient_selected' | 'from_prescription' | 'refill' | 'doctor_recommended'
          recommendationId,         // links back to recommendations collection when applicable
          prescriptionId,           // links to prescriptions/{id}; triggers onOrderCreatedForRx CF when set
          // Tenant attribution B2B franchise
          tenantId: cartOwnership?.tenantId || null,
          ownerType: cartOwnership?.ownerType || null,
          ownerId: cartOwnership?.ownerId || null,
          sourceDomain: cartOwnership?.sourceDomain || null,
          attributionLocked: cartOwnership?.attributionLocked || false,

          orderId: newId,
          customer: customerData,
          shippingAddress: shippingAddressData,
          items, subtotal, shipping: shippingCost, shippingMethod: selectedShipping ?? 'standard', total,
          totalDisplay: `${currencySymbol}${total.toFixed(0)}`,
          currency,
          region: activeRegion, paymentMethod: formData.paymentMethod ?? 'credit_card',
          orderNotes: formData.orderNotes || null,
          isProfessional: isProfessional || false, pricingTier, pricingRole, status: 'pending', createdAt: serverTimestamp(),
          prescription: prescriptionSpecs ? {
            fileName: prescriptionName,
            fileUrl,
            dosage: prescriptionSpecs.dosage,
            frequency: prescriptionSpecs.frequency,
            match: prescriptionSpecs.match,
            verified: true
          } : null,
        });

        // ── Cross-Integration: Clinic & Doctor Commission Recording ──
        const activeDoctorOrClinicId = supervisingPhysicianId || (cartOwnership?.ownerType === 'doctor' ? cartOwnership?.ownerId : null);
        if (activeDoctorOrClinicId) {
          try {
            const commissionRate = 0.15; // 15% standard practitioner referral margin
            const commissionAmount = Math.round(subtotal * commissionRate * 100) / 100;
            await addDoc(collection(db, 'clinic_commissions'), {
              doctorId: activeDoctorOrClinicId,
              clinicId: cartOwnership?.tenantId || null,
              b2cOrderId: newId,
              orderSubtotal: subtotal,
              commissionRate,
              commissionAmount,
              currency,
              status: 'pending',
              createdAt: serverTimestamp()
            });
          } catch (commErr) {
            console.warn('[B2C->B2B] Clinic commission recording error:', commErr);
          }
        }

        // ── Cross-Integration: Automatic Dropship PO Generation for B2B Suppliers ──
        try {
          const supplierMap = {};
          items.forEach(item => {
            const sId = item.supplierId || 'direct_fulfillment';
            if (!supplierMap[sId]) supplierMap[sId] = [];
            supplierMap[sId].push(item);
          });

          const supplierEntries = Object.entries(supplierMap);
          for (let idx = 0; idx < supplierEntries.length; idx++) {
            const [sId, sItems] = supplierEntries[idx];
            const sSubtotal = sItems.reduce((acc, it) => acc + (it.lineTotal || 0), 0);
            await addDoc(collection(db, 'purchase_orders'), {
              poNumber: `PO-${newId}-${idx + 1}`,
              b2cOrderId: newId,
              supplierId: sId,
              items: sItems,
              subtotal: sSubtotal,
              currency,
              fulfillmentType: 'dropship_b2c',
              status: 'po_created',
              shippingAddress: shippingAddressData,
              customerName: customerData.fullName,
              customerEmail: customerData.email,
              createdAt: serverTimestamp()
            });
          }
        } catch (poErr) {
          console.warn('[B2C->B2B] Dropship PO generation error:', poErr);
        }
      }

      if (currentUid && prescriptionSpecs) {
        try {
          await addDoc(collection(db, 'users', currentUid, 'prescriptions'), {
            fileName: prescriptionName,
            fileUrl,
            dosage: prescriptionSpecs.dosage,
            frequency: prescriptionSpecs.frequency,
            match: prescriptionSpecs.match,
            orderId: newId,
            uploadedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.error('Failed to save prescription document:', dbErr);
        }
      }

      // ── Write back to the unified users/{uid} profile ──
      if (currentUid) {
        await updateProfileData({
          firstName:       formData.firstName,
          lastName:        formData.lastName,
          phone:           formData.phone,
          institution:     formData.clinic || user?.institution || '',
          shippingStreet:  formData.address,
          shippingCountry: formData.country?.value || '',
          shippingCity:    user?.shippingCity || '',
          shippingZip:     user?.shippingZip  || '',
        });
      }

      setFinalOrderData({
        items: [...enrichedCartItems],
        totals: { ...checkoutTotals },
        formData: { ...formData },
        orderId: newId,
        selectedShipping
      });

      setIsDone(true);
      if (onComplete) onComplete();

    } catch (err) {
      console.error(err);
      setInlineError(err.message || 'An error occurred while confirming your request.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user, register, updateProfileData, activeRegion, cartOwnership,
    isProfessional, pricingTier, pricingRole, shippingCosts, generateOrderId,
    createQuotationRequest
  ]);

  return { submitOrder, generateOrderId };
}
