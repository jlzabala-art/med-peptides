import * as fb from '../../firebase';
const db = fb?.db;
const storage = fb?.storage;
const ref = fb?.ref;
const uploadBytes = fb?.uploadBytes;
const getDownloadURL = fb?.getDownloadURL;
import { prescriptionRepository } from '../../repositories/prescriptionRepository';
import { trackEvent } from '../useAnalytics';
import { DEFAULT_SETTINGS } from '../../utils/constants';
import { submitValidatedOrderAction } from '../../actions/ordersActions';

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

  const generateOrderId = () => {
    const n = new Date();
    return `ORD-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
  };

  const submitOrder = async ({
    formData,
    enrichedCartItems,
    checkoutTotals,
    protocolGroups,
    selectedShipping,
    prescriptionFile,
    prescriptionSpecs,
    prescriptionName,
    setIsSubmitting,
    setOrderId,
    setFinalOrderData,
    setIsDone,
    setInlineError,
    onComplete
  }) => {
    setIsSubmitting(true);

    // Track final submission intent
    const itemNames = enrichedCartItems.map(i => i.itemKey).join(', ');
    const protocolIds = Object.keys(protocolGroups).join(', ');
    trackEvent('purchase_intent', {
      intent_type: 'final_submission',
      protocol_id: protocolIds || 'none',
      peptide_name: itemNames || 'none',
      order_total: checkoutTotals.display
    });
    let currentUid = user?.uid;
    // ── 1. Auto-register if not logged in ──
    if (!currentUid) {
      try {
        const fullName = `${formData.firstName} ${formData.lastName}`;
        const userType = formData.isProfessional ? 'researcher' : 'individual';
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
        // We cannot access setShowLogin directly here, so we just set error.
        if (err.code === 'auth/email-already-in-use') {
          setInlineError('An account with this email already exists. Please sign in to continue with your order.');
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
    try {
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
        const meta = i.meta || {};
        return { 
          name: i.itemKey, 
          variant: i.dosagePart, 
          quantity: i.qty, 
          unitPrice: i.unitPrice, 
          lineTotal: i.lineTotal,
          productId: meta.productId || null,
          variantId: meta.variantId || null,
          supplierId: meta.supplierId || null
        };
      });
      const subtotal = enrichedCartItems.reduce((a, i) => a + i.lineTotal, 0);
      const submitResult = await submitValidatedOrderAction({
        cartItems: enrichedCartItems.map(i => ({
          itemKey: i.itemKey,
          name: i.namePart || i.itemKey,
          qty: i.qty,
          dosagePart: i.dosagePart,
          productId: i.meta?.productId || null
        })),
        formData,
        shippingMethod: selectedShipping,
        selectedShippingCost: shippingCost,
        activeRegion,
        uid: currentUid,
        isProfessional: formData.isProfessional,
        pricingTier,
        pricingRole,
        cartOwnership,
        prescriptionSpecs,
        prescriptionName,
        fileUrl
      });

      if (!submitResult.success) {
        throw new Error("Failed to process order securely.");
      }

      // Update newId from the server-validated action
      const finalOrderId = submitResult.orderId;

      if (currentUid && prescriptionSpecs) {
        try {
          await prescriptionRepository.addUserPrescription(currentUid, {
            fileName: prescriptionName,
            fileUrl,
            dosage: prescriptionSpecs.dosage,
            frequency: prescriptionSpecs.frequency,
            match: prescriptionSpecs.match,
            orderId: finalOrderId
          });
        } catch (dbErr) {
          console.error('Failed to save prescription document in user space:', dbErr);
        }
      }

      if (currentUid) {
        await updateProfileData({
          firstName:       formData.firstName,
          lastName:        formData.lastName,
          phone:           formData.phone,
          institution:     formData.clinic || '',
          shippingStreet:  formData.address,
          shippingCountry: formData.country?.value || ''
        });
      }

      setFinalOrderData({
        items: submitResult.items,
        totals: submitResult.totals,
        formData: { ...formData },
        orderId: finalOrderId,
        selectedShipping
      });
      setOrderId(finalOrderId);
      setIsDone(true);
      if (onComplete) onComplete();
    } catch (err) { 
      console.error(err);
      setInlineError(err.message || 'An error occurred while confirming your request. Please try again.');
    }
    setIsSubmitting(false);
  };

  return { submitOrder, generateOrderId };
}
