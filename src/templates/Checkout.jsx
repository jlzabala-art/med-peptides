/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Landmark, Send, CheckCircle2, FileDown, ChevronRight, ChevronDown, ChevronUp, Check, Activity, Truck, BookOpen, MessageCircle, Eye, EyeOff, Lock, Plus, Minus, Sparkles, UserCheck, Zap, Package, FileSearch, Shield, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { db, storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { resolveVariantPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';
// jsPDF and autoTable are loaded dynamically on demand (see downloadPDF)
import { ALL_COUNTRIES } from '../data/countries';
import { trackEvent } from '../hooks/useAnalytics';

const selectStyles = {
  control: (b, s) => ({
    ...b,
    padding: '0.2rem 0.25rem',
    borderRadius: '10px',
    borderColor: s.isFocused ? 'var(--primary)' : 'var(--color-border)',
    borderWidth: '1px',
    boxShadow: s.isFocused ? '0 0 0 3px rgba(0,75,135,0.08)' : 'none',
    fontSize: '0.95rem',
    '&:hover': { borderColor: 'var(--color-text-tertiary)' },
  }),
  option: (b, s) => ({
    ...b,
    fontSize: '0.9rem',
    backgroundColor: s.isSelected ? 'var(--primary)' : s.isFocused ? '#f0f9ff' : 'var(--color-bg-surface)',
  }),
};

// PDF.js dynamic CDN loader
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      console.error("Failed to load PDF.js script:", err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};

const scanCatalogProducts = (text, productsList = []) => {
  const found = [];
  if (!text || !productsList || !productsList.length) return found;

  const textLower = text.toLowerCase();
  productsList.forEach(prod => {
    if (!prod || !prod.name) return;
    const nameLower = prod.name.toLowerCase();
    
    // Look for exact word match or standard contains to prevent false positives on very short names
    const isShort = nameLower.length <= 3;
    let matches = false;
    
    if (isShort) {
      const rx = new RegExp(`\\b${nameLower}\\b`, 'i');
      matches = rx.test(textLower);
    } else {
      matches = textLower.includes(nameLower);
    }

    // Also match synonyms if available
    if (!matches && prod.synonyms && Array.isArray(prod.synonyms)) {
      matches = prod.synonyms.some(syn => {
        const synLower = syn.toLowerCase();
        return synLower.length <= 3 
          ? new RegExp(`\\b${synLower}\\b`, 'i').test(textLower)
          : textLower.includes(synLower);
      });
    }

    if (matches) {
      if (!found.some(f => f.id === prod.id || f.name === prod.name)) {
        found.push(prod);
      }
    }
  });
  return found;
};

export default function Checkout({ cart, cartMetadata = {}, updateCart, region, isProfessional, EXCHANGE_RATES, detectedCountry, onBack, onComplete, products, shippingCosts = { standard: 40, express: 80 }, selectedShipping, setSelectedShipping, cartOwnership = {} }) {
  const { user, userProfile, login, register, loginWithGoogle, updateProfileData } = useAuth();
  const { tier: pricingTier, role: pricingRole } = usePricingTier();
  const [finalOrderData, setFinalOrderData] = useState(null);

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionName, setPrescriptionName] = useState('');
  const [prescriptionSpecs, setPrescriptionSpecs] = useState(null);
  const [isScanningPrescription, setIsScanningPrescription] = useState(false);
  const [prescriptionSelectedVariants, setPrescriptionSelectedVariants] = useState({});

  const loadTesseract = () => {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/tesseract.js@v4.0.1/dist/tesseract.min.js';
      script.onload = () => resolve(window.Tesseract);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  const handlePrescriptionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPrescriptionFile(file);
    setPrescriptionName(file.name);
    setIsScanningPrescription(true);
    setPrescriptionSpecs(null);
    setPrescriptionSelectedVariants({});

    try {
      let text = '';
      if (file.type.startsWith('image/')) {
        const tesseract = await loadTesseract();
        const result = await tesseract.recognize(file, 'eng');
        text = result.data.text;
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await loadPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        text = fullText;
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        throw new Error('The document appears to be empty or contains no extractable text.');
      }

      const dosageRegex = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|µg)\b/i;
      const dosageMatch = text.match(dosageRegex);
      const extractedDose = dosageMatch ? dosageMatch[0].toLowerCase().replace(/\s+/g, '') : '';
      
      const frequencyRegex = /\b(?:weekly|daily|twice\s+a\s+week|every\s+other\s+day|subcutaneous|sub-q|sc)\b/i;
      const frequencyMatch = text.match(frequencyRegex);

      const matches = scanCatalogProducts(text, products || []);

      const initialSelected = {};
      matches.forEach(prod => {
        const vars = prod.variants || [];
        const matchedVar = vars.find(v => {
          const vDose = (v.dosage || v.strength || v.size || '').toLowerCase().replace(/\s+/g, '');
          return extractedDose && vDose.includes(extractedDose);
        });
        if (matchedVar) {
          initialSelected[prod.id || prod.name] = matchedVar.variantId || matchedVar.id;
        } else if (vars.length > 0) {
          initialSelected[prod.id || prod.name] = vars[0].variantId || vars[0].id;
        }
      });
      setPrescriptionSelectedVariants(initialSelected);

      setPrescriptionSpecs({
        dosage: dosageMatch ? dosageMatch[0] : 'Not specified',
        frequency: frequencyMatch ? frequencyMatch[0] : 'Not specified',
        matchedProducts: matches
      });
    } catch (err) {
      console.error('Prescription scanning failed:', err);
      alert(err.message || 'Error processing document.');
    } finally {
      setIsScanningPrescription(false);
    }
  };

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
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  // P1 Fix 1.3 — inline errors/success instead of alert()
  const [inlineError, setInlineError] = useState(null);
  const [inlineSuccess, setInlineSuccess] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    isProfessional: !!isProfessional,
    clinic: '', address: '', country: null, paymentMethod: 'credit_card',
    password: '', confirmPassword: '', orderNotes: ''
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

  // P1 Fix 1.2 — Auto-skip to Step 3 for logged-in users with complete profiles
  useEffect(() => {
    if (!user || !prefillApplied || step !== 1) return;
    const s1 = !!(formData.firstName && formData.lastName && formData.email && formData.phone);
    const s2 = !!(formData.country && formData.address);
    if (s1 && s2) {
      setStep(3);
      scrollReset();
      trackEvent('checkout_auto_fast_track', { user_id: user?.uid });
    } else if (s1) {
      setStep(2);
      scrollReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillApplied]);

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

  // ── Protocol groups (for Protocol Review in Step 3) ──────────────────
  const protocolGroups = useMemo(() => {
    const groups = {};
    const bundles = cartMetadata.protocolBundles ?? [];
    
    // 1. Initialize groups from explicit bundles
    bundles.forEach(b => {
      groups[b.id] = {
        name: b.name,
        goal: b.goal,
        bundleTotal: b.bundleTotal ?? b.estimatedCost ?? 0,
        products: b.products ?? [], 
        patientGuide: b.patientGuide ?? null,
        items: []
      };
    });

    // 2. Assign items to these groups
    cartItems.forEach(([itemKey, qty]) => {
      const meta = cartMetadata[itemKey];
      const pid = meta?.protocolId;
      if (pid && groups[pid]) {
        groups[pid].items.push({ itemKey, qty });
      } else if (meta?.isProtocol || meta?.protocolId) {
        // Fallback for ad-hoc protocols not in protocolBundles
        const fallbackId = pid || 'protocol';
        if (!groups[fallbackId]) {
          groups[fallbackId] = { name: meta.protocolName || 'Protocol', items: [] };
        }
        groups[fallbackId].items.push({ itemKey, qty });
      }
    });
    return groups;
  }, [cartItems, cartMetadata]);
  const hasProtocols = Object.keys(protocolGroups).length > 0;

  const checkoutTotals = useMemo(() => {
    // 1. Sum individual items EXCLUDING protocol ones
    const individualItems = enrichedCartItems.filter(i => {
      const meta = cartMetadata[i.itemKey];
      return !meta?.isProtocol && !meta?.protocolId;
    });
    
    let subtotal = individualItems.reduce((a, i) => a + i.lineTotal, 0);

    // 2. Add Bundle Totals from explicit bundles
    const bundles = cartMetadata.protocolBundles ?? [];
    bundles.forEach(b => {
      subtotal += (b.bundleTotal ?? b.estimatedCost ?? 0);
    });

    // 3. Fallback: If there are protocol items but NO explicit bundles (edge case),
    // we should still price them individually to avoid $0 subtotal.
    if (bundles.length === 0 && enrichedCartItems.some(i => cartMetadata[i.itemKey]?.isProtocol)) {
      const protocolItems = enrichedCartItems.filter(i => cartMetadata[i.itemKey]?.isProtocol);
      subtotal += protocolItems.reduce((a, i) => a + i.lineTotal, 0);
    }

    const shippingCost = shippingCosts[selectedShipping] ?? 40;
    const total = subtotal + shippingCost;
    const fmt = v => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return { 
      display: `$${fmt(total.toFixed(0))}`, 
      subtotal, 
      shippingCost, 
      subtext: null // Redundant subtext removed as requested
    };
  }, [enrichedCartItems, cartMetadata, shippingCosts, selectedShipping]);

  const step1Valid = showLogin 
    ? (formData.email && formData.password)
    : (formData.firstName && formData.lastName && formData.email && 
       (user || formData.phone) &&  // phone optional when already logged-in
       (!formData.isProfessional || formData.clinic) && 
       (user || (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword)));
  const step2Valid = formData.country && formData.address;

  const scrollReset = () => {
    window.scrollTo(0, 0);
    document.getElementById('co-overlay')?.scrollTo(0, 0);
  };

  const goNext = () => {
    if (step === 1 && !step1Valid) { setInlineError('Please fill in all required fields.'); return; }
    if (step === 2 && !step2Valid) { setInlineError('Please complete your delivery address and select a country.'); return; }
    setInlineError(null);
    setStep(s => Math.min(s + 1, 3)); scrollReset();
  };
  const goBack = () => { setStep(s => Math.max(s - 1, 1)); scrollReset(); };

  const fastTrackToReview = () => {
    if (step1Valid && step2Valid) {
      setStep(3);
      scrollReset();
      trackEvent('checkout_fast_track', { user_id: user?.uid });
    } else if (step1Valid) {
      setStep(2);
      scrollReset();
    }
  };

  const generateOrderId = () => {
    const n = new Date();
    return `ORD-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
  };

  const handleCheckoutLogin = async e => {
    e.preventDefault();
    setLoginLoading(true);
    setInlineError(null);
    try {
      await login(formData.email, formData.password);
      setShowLogin(false);
      setInlineSuccess('Signed in successfully! Your details have been pre-filled.');
      setTimeout(() => setInlineSuccess(null), 4000);
    } catch (err) {
      console.error('Checkout login failed:', err);
      setInlineError('Incorrect email or password. Please try again.');
    }
    setLoginLoading(false);
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 6) score += 1;
    if (pwd.length > 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0 to 5
  };

  const handleSubmit = async e => {
    e.preventDefault();
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
        // P1 Fix 1.1 — Detect existing account and auto-switch to login tab
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

      const items = enrichedCartItems.map(i => ({ name: i.itemKey, variant: i.dosagePart, quantity: i.qty, unitPrice: i.unitPrice, lineTotal: i.lineTotal }));
      const subtotal = enrichedCartItems.reduce((a, i) => a + i.lineTotal, 0);
      const total = subtotal + shippingCost;
      const currency = EXCHANGE_RATES[activeRegion]?.currency || 'USD';
      const currencySymbol = currency === 'USD' ? '$' : '€';
      // ── Phase 10: enforce payment & B2B ownership on every order ──────────
      // paymentOwnerId MUST always equal the authenticated patient's uid.
      // supervisingPhysicianId / supervisingAdminId come from cartOwnership (set by
      // the assignment engine in App.jsx) and are optional — null for solo orders.
      const paymentOwnerId           = currentUid;  // invariant: payment = patient
      const supervisingPhysicianId   = cartOwnership?.supervisingPhysicianId  ?? null;
      const supervisingAdminId       = cartOwnership?.supervisingAdminId      ?? null;
      const orderSource              = cartOwnership?.source                  ?? 'patient_selected';
      const recommendationId         = cartOwnership?.recommendationId        ?? null;
      // ── prescriptionId: required by onOrderCreatedForRx Cloud Function ─────
      // Set when patient buys from a doctor's prescription (PatientPrescriptionPanel)
      // or from a refill. Without this field the Cloud Function does NOT fire.
      const prescriptionId           = cartOwnership?.prescriptionId          ?? null;

      await addDoc(collection(db, 'orders'), {
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
        customer: { fullName: `${formData.firstName} ${formData.lastName}`, firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, institution: formData.clinic || null },
        shippingAddress: { street: formData.address, country: formData.country?.value || null },
        items, subtotal, shipping: shippingCost, shippingMethod: selectedShipping ?? 'standard', total,
        totalDisplay: `${currencySymbol}${total.toFixed(0)}`,
        currency,
        region: activeRegion, paymentMethod: formData.paymentMethod ?? 'credit_card',
        orderNotes: formData.orderNotes || null,
        isProfessional: formData.isProfessional, pricingTier, pricingRole, status: 'pending', createdAt: serverTimestamp(),
        prescription: prescriptionSpecs ? {
          fileName: prescriptionName,
          fileUrl,
          dosage: prescriptionSpecs.dosage,
          frequency: prescriptionSpecs.frequency,
          match: prescriptionSpecs.match,
          verified: true
        } : null,
      });

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
          console.error('Failed to save prescription document in user space:', dbErr);
        }
      }
      // ── Write back to the unified users/{uid} profile ──
      if (currentUid) {
        await updateProfileData({
          firstName:       formData.firstName,
          lastName:        formData.lastName,
          phone:           formData.phone,
          institution:     formData.clinic || userProfile?.institution || '',
          shippingStreet:  formData.address,
          shippingCountry: formData.country?.value || '',
          shippingCity:    userProfile?.shippingCity || '',
          shippingZip:     userProfile?.shippingZip  || '',
        });
      }

      setFinalOrderData({
        items: [...enrichedCartItems],
        totals: { ...checkoutTotals },
        formData: { ...formData },
        orderId: newId,
        selectedShipping
      });
      setOrderId(newId);
      setIsDone(true);
      if (onComplete) onComplete();
    } catch (err) { 
      console.error(err);
      setInlineError(err.message || 'An error occurred while confirming your request. Please try again.');
    }
    setIsSubmitting(false);
  };

  const downloadPDF = useCallback(async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    
    // Use final data if available (post-checkout), otherwise current state
    const targetItems = finalOrderData ? finalOrderData.items : enrichedCartItems;
    const targetTotals = finalOrderData ? finalOrderData.totals : checkoutTotals;
    const targetOrderId = finalOrderData ? finalOrderData.orderId : orderId;
    const targetFormData = finalOrderData ? finalOrderData.formData : formData;
    const targetShipping = finalOrderData ? finalOrderData.selectedShipping : selectedShipping;

    // ── Header band ──
    doc.setFillColor(0, 54, 102); doc.rect(0, 0, W, 36, 'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(20);
    doc.text('Atlas Health', W/2, 16, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Sample Order Confirmation', W/2, 24, { align: 'center' });
    doc.text(`Order ID: ${targetOrderId}`, W/2, 31, { align: 'center' });

    // ── Customer info ──
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

    // ── Products table ──
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

    // ── Weekly Dose Calendar (per protocol group) ──
    const pGroups = Object.entries(protocolGroups);
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
        
        // Group Header
        doc.setFillColor(248, 250, 252); doc.rect(15, fy, W-30, 10, 'F');
        doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
        doc.text(`${name} — ${weeks} Week Research Program`, 20, fy + 6.5);
        fy += 14;

        // Weekly Table
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

        // --- Expected Results Chart (PDF Render) ---
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
            const pct = Math.min((val / 100) * chartW, chartW); // Simplified mapping

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

        // --- Safety Notes ---
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

    // ── Footer ──
    const footY = doc.internal.pageSize.getHeight()-15;
    doc.setDrawColor(226,232,240); doc.line(15, footY-4, W-15, footY-4);
    doc.setFontSize(8); doc.setTextColor(148,163,184);
    doc.text('Atlas Health — Advanced Research Solutions | info@Atlas Health.com', W/2, footY, { align: 'center' });
    doc.save(`Atlas Health-Order-${targetOrderId}.pdf`);
   
  }, [orderId, formData, enrichedCartItems, protocolGroups, checkoutTotals, selectedShipping, finalOrderData]);

  // ── Preview Receipt (HTML popup — same format as email) ──────────────
  const previewReceipt = useCallback(() => {
    const targetTotals = finalOrderData ? finalOrderData.totals : checkoutTotals;
    const targetItems = finalOrderData ? finalOrderData.items : enrichedCartItems;
    const targetOrderId = finalOrderData ? finalOrderData.orderId : orderId;
    const targetFormData = finalOrderData ? finalOrderData.formData : formData;
    const targetShipping = finalOrderData ? finalOrderData.selectedShipping : selectedShipping;

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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Receipt — ${orderId} — Atlas Health</title>
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

          ${targetFormData.clinic || targetFormData.country?.value ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              ${targetFormData.clinic ? `<td style="width:50%;vertical-align:top;padding-right:8px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Institution</p><p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${targetFormData.clinic}</p></td>` : ''}
              ${targetFormData.country?.value ? `<td style="width:50%;vertical-align:top;padding-left:8px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Country</p><p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${targetFormData.country.value}</p></td>` : ''}
            </tr>
          </table>` : ''}

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
          <p style="margin:-18px 0 24px;font-size:11px;color:#94a3b8;text-align:right;">*Final price subject to professional review and approval.</p>

          <!-- Shipping address -->
          ${targetFormData.address || targetFormData.country?.value ? `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">📦 Ship To</p>
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;">
              <strong>${targetFormData.firstName} ${targetFormData.lastName}</strong><br/>
              ${targetFormData.address ? `${targetFormData.address}<br/>` : ''}
              ${targetFormData.country?.value || ''}
            </p>
          </div>` : ''}

          <!-- Next steps -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">📋 Next Steps</p>
            <ol style="margin:0;padding-left:1.25rem;font-size:13px;color:#0c4a6e;line-height:1.8;">
              <li>Our team will review your inquiry within <strong>1–2 business days</strong>.</li>
              <li>You will receive a formal quotation with pricing and documentation.</li>
              <li>Following approval, we will provide payment and shipping instructions.</li>
            </ol>
          </div>

          <!-- Tracking ID -->
          <div style="text-align:center;background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:8px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Your Order ID</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#003666;letter-spacing:0.05em;font-family:monospace;">${targetOrderId}</p>
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

    const win = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, formData, enrichedCartItems, checkoutTotals, selectedShipping]);

  // ── Download Receipt as PDF (auto-print dialog → Save as PDF) ────────
  const downloadReceiptPDF = useCallback(() => {
    const targetTotals    = finalOrderData ? finalOrderData.totals          : checkoutTotals;
    const targetItems     = finalOrderData ? finalOrderData.items           : enrichedCartItems;
    const targetOrderId   = finalOrderData ? finalOrderData.orderId         : orderId;
    const targetFormData  = finalOrderData ? finalOrderData.formData        : formData;
    const targetShipping  = finalOrderData ? finalOrderData.selectedShipping: selectedShipping;

    const { subtotal, shippingCost } = targetTotals;
    const total         = subtotal + shippingCost;
    const shippingLabel = targetShipping.charAt(0).toUpperCase() + targetShipping.slice(1);
    const paymentLabel  = targetFormData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit / Debit Card';
    const dateStr       = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmt           = (n) => `$${n.toFixed(2)}`;

    const itemRows = targetItems.map(i => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#1e293b;">
          ${i.namePart}${i.dosagePart ? `<br><span style="font-size:12px;color:#64748b;">${i.dosagePart}</span>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:center;">${i.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;color:#475569;text-align:right;">${fmt(i.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8edf5;font-size:14px;font-weight:600;color:#003666;text-align:right;">${fmt(i.lineTotal)}</td>
      </tr>`).join('');

    const pdfHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Receipt_${targetOrderId}_Atlas Health</title>
  <style>
    @page { size: A4; margin: 16mm 12mm; }
    @media print {
      body { margin: 0; background: #fff !important; }
      .no-print { display: none !important; }
    }
    body { margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Helvetica,Arial,sans-serif; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#003666 0%,#005a9c 100%);border-radius:14px 14px 0 0;padding:28px 36px;text-align:center;">
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

          <p style="margin:0 0 24px;font-size:16px;color:#1e293b;line-height:1.6;">
            Dear <strong>${targetFormData.firstName} ${targetFormData.lastName}</strong>,<br/><br/>
            Thank you for your research inquiry. We have received your request and a specialist from our team will contact you shortly.
          </p>

          <!-- Meta -->
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

          ${targetFormData.clinic || targetFormData.country?.value ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              ${targetFormData.clinic ? `<td style="width:50%;vertical-align:top;padding-right:8px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Institution</p><p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${targetFormData.clinic}</p></td>` : ''}
              ${targetFormData.country?.value ? `<td style="width:50%;vertical-align:top;padding-left:8px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Country</p><p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${targetFormData.country.value}</p></td>` : ''}
            </tr>
          </table>` : ''}

          <!-- Products -->
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
          <p style="margin:-18px 0 24px;font-size:11px;color:#94a3b8;text-align:right;">*Final price subject to professional review and approval.</p>

          ${targetFormData.address || targetFormData.country?.value ? `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">📦 Ship To</p>
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;">
              <strong>${targetFormData.firstName} ${targetFormData.lastName}</strong><br/>
              ${targetFormData.address ? `${targetFormData.address}<br/>` : ''}
              ${targetFormData.country?.value || ''}
            </p>
          </div>` : ''}

          <!-- Order ID -->
          <div style="text-align:center;background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:8px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#003666;letter-spacing:0.05em;font-family:monospace;">${targetOrderId}</p>
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
  <script>
    window.addEventListener('load', function() {
      document.title = 'Receipt_${targetOrderId}_Atlas Health';
      setTimeout(function() { window.print(); }, 300);
    });
  </script>
</body>
</html>`;

    // Use Blob URL to avoid popup blockers and set a proper filename via document.title
    const blob = new Blob([pdfHtml], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const tab  = window.open(url, '_blank');
    // Revoke the object URL after the tab has loaded to free memory
    if (tab) {
      tab.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    } else {
      // Fallback: download as .html if popups are blocked
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${targetOrderId}_Atlas Health.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, formData, enrichedCartItems, checkoutTotals, selectedShipping]);

  // ── Order Summary panel (reused in sidebar + sheet) ──────────────────
  const SummaryItems = () => {
    const individualItems = enrichedCartItems.filter(i => {
      const meta = cartMetadata[i.itemKey];
      return !meta?.isProtocol && !meta?.protocolId;
    });

    const protocolGroupsList = Object.values(protocolGroups);

    return (
      <>
        {/* ── Individual Peptides (Not in a bundle) ── */}
        {individualItems.length > 0 && individualItems.map(({ itemKey, qty, namePart, dosagePart, unitPrice, lineTotal }) => (
          <div key={itemKey} className="co-item-row" style={{ position: 'relative', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="co-item-name">{namePart}</div>
              {dosagePart && <div className="co-item-variant">{dosagePart}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                <div className="co-item-qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', padding: '2px' }}>
                  <button 
                    type="button"
                    onClick={() => updateCart(itemKey, -1)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '1.2rem', textAlign: 'center', color: '#0f172a' }}>{qty}</span>
                  <button 
                    type="button"
                    onClick={() => updateCart(itemKey, 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>
                <div className="co-item-qty" style={{ margin: 0 }}>× ${unitPrice.toFixed(2)}</div>
              </div>
            </div>
            <div className="co-item-price" style={{ fontWeight: 800, color: '#0f172a' }}>${lineTotal.toFixed(2)}</div>
          </div>
        ))}

        {/* ── Protocol Bundles (Grouped) ── */}
        {protocolGroupsList.map(group => (
          <div key={group.name} className="co-item-row co-bundle-row" style={{ 
            background: 'rgba(0,163,224,0.04)', 
            margin: '0.5rem -1.5rem', 
            padding: '1.25rem 1.5rem',
            borderLeft: '5px solid var(--primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <div className="co-item-name" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>{group.name}</div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 900, 
                    backgroundColor: 'var(--primary)', 
                    color: 'var(--color-bg-surface)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Bundle</span>
                </div>
                {group.goal && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{group.goal}</div>}
              </div>
              <div className="co-item-price" style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.1rem' }}>
                ${(group.bundleTotal || 0).toFixed(0)}
              </div>
            </div>

            {/* List of included items in this specific bundle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px' }}>
               {/* Use group.products (from cartMetadata.protocolBundles) if available, otherwise fallback to group.items */}
               {(group.products?.length > 0 ? group.products : group.items).map((i, idx) => {
                 const name = typeof i === 'string' ? i : (i.name || i.itemKey);
                 const qty = typeof i === 'string' ? null : i.qty;
                 const isAcc = i.isAccessory || name.toLowerCase().includes('water') || name.toLowerCase().includes('syringe') || name.toLowerCase().includes('pad');
                 
                 return (
                   <div key={`${name}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-primary)' }}>
                     {isAcc ? <Package size={12} color="var(--color-text-tertiary)" /> : <Activity size={12} color="var(--primary)" />}
                     <span style={{ fontWeight: 600 }}>{name}</span>
                     {qty > 0 && <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}>(x{qty})</span>}
                     <span style={{ marginLeft: 'auto', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.7rem' }}>INCLUDED</span>
                   </div>
                 );
               })}
            </div>
          </div>
        ))}

        <div className="co-total-row" style={{ marginTop: '1.5rem' }}>
          <div>
            <div className="co-total-label">Estimated Total</div>
            {checkoutTotals.subtext && <div className="co-total-sub">*{checkoutTotals.subtext}</div>}
          </div>
          <div className="co-total-amount">{checkoutTotals.display}</div>
        </div>
      </>
    );
  };

  // ── Protocol Activation Page ──────────────────────────────────────────
  if (isDone) {
    const suppliesItems = enrichedCartItems.filter(i => !cartMetadata[i.itemKey]?.protocolRequest);
    const planGroups = Object.entries(protocolGroups);

    const NEXT_STEPS = [
      { icon: Truck,         label: 'Order Preparation in Progress', sub: 'Your materials are being prepared.' },
      { icon: BookOpen,      label: 'Laboratory Preparation Guide',   sub: 'Review the instructions included in your documentation.' },
      { icon: MessageCircle, label: 'Clinical Support Follow-up',     sub: 'A specialist may contact you if required.' },
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
          /* Next-steps icons: no color change on hover */

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
          position: 'fixed', inset: 0, background: 'var(--color-bg-surface)',
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
                  <Check size={30} color="var(--color-bg-surface)" strokeWidth={2.5} />
                </div>
              </div>

              <div style={{
                display: 'inline-block',
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em',
                color: hasProtocols ? 'var(--primary)' : 'var(--color-success)',
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
                  <Activity size={13} strokeWidth={2} color="var(--color-warning)" />
                  Research Protocol Activated
                </div>
              )}

              <h1 style={{
                fontSize: 'clamp(1.7rem,4.5vw,2.6rem)', fontWeight: 800,
                color: '#0f172a', lineHeight: 1.15, marginBottom: '0.6rem',
              }}>
                {hasProtocols ? 'Protocol Activated' : 'Order Confirmed'}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                Thank you, <strong style={{ color: '#0f172a' }}>{(finalOrderData?.formData || formData).firstName}</strong>. Your research inquiry has been registered.
                <br />
                <span style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Check your email <strong style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{formData.email}</strong> to complete the transaction.
                </span>
              </p>
            </div>

          {/* ── 2-column responsive grid ── */}
          <div className="pa-content-grid">

            {/* ── LEFT COLUMN: Payment Instructions (priority) → Steps → CTAs → WhatsApp → Footer ── */}
            <div className="pa-col-left">

            {/* ── PAYMENT INSTRUCTIONS (shown first — highest urgency) ── */}
            <div className="pa-section" style={{
              border: formData.paymentMethod === 'bank_transfer'
                ? '0.5px solid rgba(0,113,189,0.2)'
                : '0.5px solid rgba(99,102,241,0.22)',
              borderRadius: 16,
              background: formData.paymentMethod === 'bank_transfer'
                ? 'rgba(0,113,189,0.03)'
                : 'rgba(99,102,241,0.03)',
              padding: '1.25rem 1.5rem',
            }}>
              <h3 style={{ 
                fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', 
                marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                letterSpacing: '-0.01em'
              }}>
                {formData.paymentMethod === 'bank_transfer'
                  ? <><CreditCard size={17} color="var(--primary)" /> Bank Transfer Instructions</>
                  : <><CreditCard size={17} color="#6366f1" /> Card Payment — Next Step</>
                }
              </h3>

              {formData.paymentMethod === 'bank_transfer' ? (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                    background: 'rgba(0,113,189,0.06)', border: '0.5px solid rgba(0,113,189,0.18)',
                    borderRadius: 10, padding: '0.65rem 0.9rem',
                    marginBottom: '1rem', fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.55,
                  }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>✉️</span>
                    <span>
                      The <strong>complete bank account details</strong> have been sent to{' '}
                      <strong style={{ color: 'var(--primary)' }}>{formData.email}</strong>.
                      Use <strong>Order {orderId}</strong> as the payment reference.
                    </span>
                  </div>
                  <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Beneficiary</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>Atlas Health International</strong>
                    </div>
                    <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>IBAN</span>
                      <strong style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.82rem', letterSpacing: '0.04em' }}>ES12 3456 7890 1234 5678 9012</strong>
                    </div>
                    <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SWIFT / BIC</span>
                      <strong style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.82rem' }}>MEDPINTLXXX</strong>
                    </div>
                    <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reference (required)</span>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.88rem', letterSpacing: '0.05em' }}>Order {orderId}</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.71rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                    ⏱ Processing begins once funds clear — typically within 24–48 business hours.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                    background: 'rgba(99,102,241,0.06)', border: '0.5px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, padding: '0.65rem 0.9rem',
                    marginBottom: '0.85rem', fontSize: '0.8rem', color: '#4338ca', lineHeight: 1.55,
                  }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔗</span>
                    <span>
                      A <strong>secure payment link</strong> will be sent to{' '}
                      <strong style={{ color: '#6366f1' }}>{formData.email}</strong>{' '}
                      within the next <strong>48 hours</strong>. Open it to pay safely via credit or debit card.
                    </span>
                  </div>
                  <p style={{ fontSize: '0.71rem', color: 'var(--color-text-tertiary)', marginTop: '0.1rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                    ⏱ Check your spam folder if you don't see it within 48 hours.
                  </p>
                </div>
              )}
            </div>

            {/* ── ORDER REFERENCE ── */}
            <div className="pa-section" style={{
              border: '0.5px solid rgba(0,113,189,0.18)',
              borderRadius: 16,
              background: 'rgba(248,252,255,0.9)',
              padding: '1rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Order Reference</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>{orderId}</div>
            </div>

            {/* ── NEXT STEPS ── */}
            <div className="pa-section" style={{
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.65rem 1.25rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-secondary)',
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>Next Steps for Researchers</div>
              <div style={{ padding: '0.5rem 1.25rem 0.85rem' }}>
                {NEXT_STEPS.map(({ icon: Icon, label, sub }, idx) => (
                  <div key={idx} className="pa-step-item" style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '0.85rem 0',
                    borderBottom: idx < NEXT_STEPS.length - 1 ? '0.5px solid #f1f5f9' : 'none',
                  }}>
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
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5. CTAs ── */}
            <div className="pa-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Protocol manual download — only shown when a protocol was ordered */}
              {hasProtocols && (
                <button
                  onClick={downloadPDF}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    padding: '1.2rem 1.5rem',
                    background: 'linear-gradient(135deg, #1e40af 0%, var(--primary) 50%, #0ea5e9 100%)',
                    color: 'var(--color-bg-surface)', border: 'none', borderRadius: 12,
                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    letterSpacing: '0.01em',
                    boxShadow: '0 4px 20px rgba(0,113,189,0.35)',
                    transition: 'opacity 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}
                >
                  <FileDown size={20} strokeWidth={1.8} />
                  Download Protocol Manual (PDF)
                </button>
              )}

              {/* Primary: Preview & Print Receipt */}
              <button
                onClick={previewReceipt}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  padding: '1.1rem 1.5rem',
                  background: hasProtocols
                    ? 'rgba(0,54,102,0.06)'
                    : 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                  border: hasProtocols ? '1px solid rgba(0,54,102,0.18)' : 'none',
                  borderRadius: 12, fontWeight: 700,
                  fontSize: '0.95rem',
                  color: hasProtocols ? 'var(--primary)' : 'var(--color-bg-surface)',
                  cursor: 'pointer',
                  boxShadow: hasProtocols ? 'none' : '0 4px 16px rgba(0,113,189,0.28)',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                🖨️ Preview &amp; Print Receipt
              </button>

              {/* Optional: Download Receipt PDF */}
              <button
                onClick={downloadReceiptPDF}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  padding: '0.85rem 1.5rem',
                  background: 'transparent',
                  border: '1px dashed rgba(0,113,189,0.3)',
                  borderRadius: 12, fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--primary)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,113,189,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,113,189,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,113,189,0.3)'; }}
              >
                <FileDown size={16} strokeWidth={1.8} />
                Download Receipt (PDF)
              </button>

              {/* Secondary: View My Orders */}
              <button
                onClick={() => { window.location.href = '/paciente/orders'; }}
                style={{
                  padding: '1.1rem 1.5rem',
                  background: 'rgba(0,0,0,0.03)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 12, fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)', cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View My Orders
                <ArrowLeft size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} />
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
                fontSize: '0.82rem', color: 'var(--color-text-primary)', lineHeight: 1.7,
                margin: '0 0 1rem',
              }}>
                Our technical team is available to guide you. You can also contact us via
                {' '}<strong style={{ color: '#0f172a' }}>WhatsApp</strong> for any questions regarding your protocol administration.
              </p>
              <button
                onClick={() => {
                  const WA_NUMBER = '971564179256';
                  const msg = encodeURIComponent(`Hello, I just placed order ${orderId} and I need guidance on my protocol.`);
                  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  width: '100%', padding: '0.9rem 1.5rem',
                  background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                  color: 'var(--color-bg-surface)', border: 'none', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <MessageCircle size={18} strokeWidth={1.8} />
                Contact Clinical Support via WhatsApp
              </button>
            </div>

            {/* ── 7. Footer disclaimer ── */}
            <div className="pa-section" style={{
              textAlign: 'center',
              fontSize: '0.68rem', color: 'var(--color-border)',
              letterSpacing: '0.08em', paddingTop: '0.5rem',
            }}>
              FOR RESEARCH USE ONLY — Not for human therapeutic use &nbsp;·&nbsp; Atlas Health.com
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
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Tracking Reference</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>{orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Status</div>
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
                    fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-secondary)',
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
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{i.qty} unit{i.qty > 1 ? 's' : ''}</span>
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
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>~{weeks}w · {totalUnits} vials</span>
                          </div>
                          {items.map(({ itemKey, qty }) => (
                            <div key={itemKey} style={{
                              display: 'flex', justifyContent: 'space-between',
                              fontSize: '0.78rem', padding: '0.25rem 0 0.25rem 1rem',
                              borderBottom: '0.5px solid #f8fafc',
                            }}>
                              <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{itemKey}</span>
                              <span style={{ fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{(qty / weeks).toFixed(1)} vial/w</span>
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
      <Icon size={26} color={formData.paymentMethod === method ? 'var(--primary)' : 'var(--color-text-tertiary)'} strokeWidth={1.5} />
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
          <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', fontWeight:600, fontSize:'0.9rem' }}>
            <ArrowLeft size={16} /> Return Home
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:800, color:'#0f172a', marginBottom:'0.5rem' }}>
            {user && userProfile?.role === 'patient' ? 'Your Order' : 'Sample Order'}
          </h1>
          <p style={{ color:'var(--color-text-secondary)', fontSize:'0.95rem', marginBottom:'2rem' }}>
            {user && userProfile?.role === 'patient'
              ? 'Review your items and confirm delivery details.'
              : 'Complete the form below to receive a professional quotation.'}
          </p>

          {/* Step track */}
          <div className="co-step-track">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <React.Fragment key={s}>
                  {i > 0 && (
                    <div className={`co-dot-line ${step >= s ? 'done' : 'pending'}`} />
                  )}
                  <div className="co-step-item">
                    <div className={`co-dot ${stepDotClass(s)}`}>
                      {step > s ? <Check size={14} strokeWidth={3} /> : s}
                    </div>
                    <span className="co-dot-label" style={{ color: step === s ? 'var(--primary)' : 'var(--color-text-tertiary)' }}>{label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 60/40 grid */}
        <div className="co-grid">

          {/* ── LEFT: Form ──────────────────────────────────────────── */}
          <form id="checkout-form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

            {/* P1 Fix 1.3 — Inline error / success banners (replaces all alert() calls) */}
            <AnimatePresence>
              {inlineError && (
                <motion.div
                  key="inline-error"
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '14px', padding: '1rem 1.1rem', color: '#b91c1c'
                  }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                  <span style={{ flex: 1, fontSize: '0.87rem', lineHeight: 1.5 }}>{inlineError}</span>
                  <button type="button" onClick={() => setInlineError(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#b91c1c', fontSize: '1.1rem', lineHeight: 1, padding: '0 2px', flexShrink: 0
                  }}>×</button>
                </motion.div>
              )}
              {inlineSuccess && (
                <motion.div
                  key="inline-success"
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '14px', padding: '1rem 1.1rem', color: '#065f46'
                  }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>✅</span>
                  <span style={{ flex: 1, fontSize: '0.87rem', lineHeight: 1.5 }}>{inlineSuccess}</span>
                  <button type="button" onClick={() => setInlineSuccess(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#065f46', fontSize: '1.1rem', lineHeight: 1, padding: '0 2px', flexShrink: 0
                  }}>×</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}
                >
                {/* Registered User Welcome */}
                {user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,75,135,0.05) 0%, rgba(14,165,233,0.05) 100%)',
                      border: '1px solid rgba(0,75,135,0.12)',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      marginBottom: '2rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}>
                      <UserCheck size={100} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: '15px', 
                        background: 'var(--primary)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,75,135,0.2)'
                      }}>
                        <UserCheck color="var(--color-bg-surface)" size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Welcome back</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0f172a' }}>{formData.firstName || userProfile?.firstName || 'Researcher'}</div>
                      </div>
                      <button 
                        type="button"
                        onClick={fastTrackToReview}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'var(--color-bg-surface)', border: 'none', borderRadius: '12px',
                          padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Zap size={14} fill="var(--color-bg-surface)" /> Fast Track
                      </button>
                    </div>
                    <div style={{ 
                      marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(255,255,255,0.5)', 
                      borderRadius: '12px', fontSize: '0.82rem', color: 'var(--color-text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '0.6rem', border: '1px solid rgba(0,0,0,0.03)'
                    }}>
                      <ShieldCheck size={14} color="var(--color-success)" />
                      <span>Shipping and contact details pre-filled from your secure profile.</span>
                    </div>
                  </motion.div>
                )}

                {!user && (
                  <div style={{ 
                    display: 'flex', background: 'var(--color-bg-app)', padding: '0.4rem', 
                    borderRadius: '16px', border: '1.5px solid #e2e8f0', marginBottom: '1.5rem',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <button type="button" onClick={() => setShowLogin(false)} style={{
                      flex: 1, padding: '0.75rem', border: 'none', borderRadius: '12px',
                      fontSize: '0.9rem', fontWeight: 750, cursor: 'pointer',
                      background: !showLogin ? 'var(--color-bg-surface)' : 'transparent',
                      color: !showLogin ? 'var(--primary)' : 'var(--color-text-secondary)',
                      boxShadow: !showLogin ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>Create Account</button>
                    <button type="button" onClick={() => setShowLogin(true)} style={{
                      flex: 1, padding: '0.75rem', border: 'none', borderRadius: '12px',
                      fontSize: '0.9rem', fontWeight: 750, cursor: 'pointer',
                      background: showLogin ? 'var(--color-bg-surface)' : 'transparent',
                      color: showLogin ? 'var(--primary)' : 'var(--color-text-secondary)',
                      boxShadow: showLogin ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>Log In</button>
                  </div>
                )}

                {prefillApplied && !showLogin && !user && (
                  <div className="co-section-valid"><Check size={13} /> Pre-filled from your profile — review if needed</div>
                )}

                {!showLogin ? (
                  <>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <button
                        type="button"
                        disabled={loginLoading}
                        onClick={async () => {
                          setLoginLoading(true);
                          try {
                            await loginWithGoogle();
                          } catch (err) {
                            console.error('Google auth error:', err);
                          } finally {
                            setLoginLoading(false);
                          }
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.6rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          border: '1.5px solid #e2e8f0',
                          background: 'var(--color-bg-surface)',
                          color: 'var(--color-text-primary)',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          cursor: loginLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.18s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.5 16.2 44 24 44z"/>
                          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.9 35.8 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                        </svg>
                        {loginLoading ? 'Connecting…' : 'Quick Register with Google'}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0 0.5rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>or fill manually</span>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                      </div>
                    </div>

                    {/* P2 Fix 2.2 — Friendly B2C-first order type picker */}
                    <div className="co-field" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>Who is this order for?</div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          onClick={() => set({ isProfessional: false })}
                          style={{
                            flex: 1, padding: '0.7rem', borderRadius: '12px',
                            border: `2px solid ${!formData.isProfessional ? 'var(--primary)' : 'var(--color-border)'}`,
                            background: !formData.isProfessional ? 'rgba(0,75,135,0.06)' : 'var(--color-bg-surface)',
                            color: !formData.isProfessional ? 'var(--primary)' : 'var(--color-text-secondary)',
                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.2rem'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>👤</span>
                          Personal Use
                        </button>
                        <button
                          type="button"
                          onClick={() => set({ isProfessional: true })}
                          style={{
                            flex: 1, padding: '0.7rem', borderRadius: '12px',
                            border: `2px solid ${formData.isProfessional ? 'var(--primary)' : 'var(--color-border)'}`,
                            background: formData.isProfessional ? 'rgba(0,75,135,0.06)' : 'var(--color-bg-surface)',
                            color: formData.isProfessional ? 'var(--primary)' : 'var(--color-text-secondary)',
                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.2rem'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>🏥</span>
                          Clinic / Lab
                        </button>
                      </div>
                    </div>

                    {formData.isProfessional && !user && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: 'rgba(52, 152, 219, 0.08)',
                          border: '1px dashed rgba(52, 152, 219, 0.3)',
                          borderRadius: '12px',
                          padding: '1rem',
                          marginBottom: '1.5rem',
                          fontSize: '0.85rem',
                          color: '#2980b9',
                          lineHeight: 1.5
                        }}
                      >
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <Sparkles size={14} /> Professional Advantage
                        </div>
                        Registering your institutional account unlocks <strong>tiered pricing</strong>, 
                        direct access to <strong>Batch CoA documentation</strong>, and <strong>priority logistics</strong> for clinical research.
                      </motion.div>
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
                      <label className="co-label">Email *</label>
                      <input required type="email" className={`co-input${formData.email ? ' valid' : ''}`} value={formData.email}
                        onChange={e => { set({ email: e.target.value }); setInlineError(null); }} placeholder="your@email.com" autoComplete="email" />
                      {/* P1 Fix 2.2 — hint to switch to login if user already exists */}
                      <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>Already have an account?</span>
                        <button type="button" onClick={() => { setShowLogin(true); setInlineError(null); }} style={{
                          fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700,
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          textDecoration: 'underline', textUnderlineOffset: '2px'
                        }}>Sign in →</button>
                      </div>
                    </div>

                    <div className="co-field">
                      <label className="co-label">Phone (WhatsApp Preferred) *</label>
                      <input required type="tel" className={`co-input${formData.phone ? ' valid' : ''}`} value={formData.phone}
                        onChange={e => set({ phone: e.target.value })} placeholder="+00 123 456 789" autoComplete="tel" />
                    </div>

                    {formData.isProfessional && (
                      <div className="co-field">
                        <label className="co-label">Organization / Clinic *</label>
                        <input required className={`co-input${formData.clinic ? ' valid' : ''}`} value={formData.clinic}
                          onChange={e => set({ clinic: e.target.value })} placeholder="Medical Center / Research Lab" autoComplete="organization" />
                      </div>
                    )}

                    {!user && (
                      <>
                        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', paddingTop: '1.25rem' }}>
                          <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Create Research Account</div>
                        </div>
                        <div className="co-name-grid">
                          <div className="co-field">
                            <label className="co-label">Create Password *</label>
                            <div style={{ position: 'relative' }}>
                              <input required type={showPassword ? "text" : "password"} className={`co-input${formData.password ? ' valid' : ''}`} value={formData.password}
                                onChange={e => set({ password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px'
                              }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            {formData.password && (
                              <div style={{ marginTop: '6px', display: 'flex', gap: '3px' }}>
                                {[1,2,3,4,5].map(lvl => (
                                  <div key={lvl} style={{ 
                                    flex: 1, height: '3px', borderRadius: '2px',
                                    background: lvl <= getPasswordStrength(formData.password) 
                                      ? (getPasswordStrength(formData.password) <= 2 ? 'var(--color-danger)' : getPasswordStrength(formData.password) <= 4 ? '#f59e0b' : '#22c55e') 
                                      : 'var(--color-border)' 
                                  }} />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="co-field">
                            <label className="co-label">Confirm Password *</label>
                            <input required type="password" className={`co-input${formData.confirmPassword ? ' valid' : ''}`} value={formData.confirmPassword}
                              onChange={e => set({ confirmPassword: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
                          </div>
                        </div>
                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '-0.5rem' }}>Passwords do not match.</p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
                    <div className="co-field">
                      <label className="co-label">Email Address</label>
                      <input required type="email" className="co-input" value={formData.email}
                        onChange={e => set({ email: e.target.value })} placeholder="researcher@email.com" />
                    </div>
                    <div className="co-field">
                      <label className="co-label">Password</label>
                      <div style={{ position: 'relative' }}>
                        <input required type={showPassword ? "text" : "password"} className="co-input" value={formData.password}
                          onChange={e => set({ password: e.target.value })} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px'
                        }}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button type="button" disabled={loginLoading || !formData.email || !formData.password} onClick={handleCheckoutLogin} className="co-btn-next" style={{ width: '100%', marginTop: '0.5rem' }}>
                      {loginLoading ? 'Verifying...' : 'Sign In and Continue'}
                    </button>

                    {/* — OR divider — */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>or continue with</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                    </div>

                    {/* Google SSO */}
                    <button
                      type="button"
                      disabled={loginLoading}
                      onClick={async () => {
                        setLoginLoading(true);
                        try {
                          await loginWithGoogle();
                          setShowLogin(false);
                        } catch (err) {
                          console.error('Google sign-in error:', err);
                        } finally {
                          setLoginLoading(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        background: 'var(--color-bg-surface)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: loginLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.18s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; }}
                    >
                      {/* Google logo SVG */}
                      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.5 16.2 44 24 44z"/>
                        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.9 35.8 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                      </svg>
                      {loginLoading ? 'Connecting…' : 'Sign in with Google'}
                    </button>
                  </div>
                )}

                {!showLogin && (
                  <div className="co-cta-row">
                    <button type="button" className="co-btn-back" onClick={onBack}>← Home</button>
                    <button type="button" className="co-btn-next" onClick={goNext}>Continue <ChevronRight size={16} /></button>
                  </div>
                )}
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}
                >
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

                  <div className="co-field">
                    <label className="co-label">Shipping Method *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                      <div 
                        onClick={() => setSelectedShipping('standard')}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '16px',
                          border: `2px solid ${selectedShipping === 'standard' ? 'var(--primary)' : 'var(--color-border)'}`,
                          background: selectedShipping === 'standard' ? 'rgba(0,113,189,0.04)' : 'var(--color-bg-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedShipping === 'standard' ? 'var(--primary)' : 'var(--color-text-primary)' }}>Standard</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>5-7 business days</div>
                        <div style={{ marginTop: '0.75rem', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>${shippingCosts.standard.toFixed(2)}</div>
                      </div>
                      <div 
                        onClick={() => setSelectedShipping('express')}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '16px',
                          border: `2px solid ${selectedShipping === 'express' ? 'var(--primary)' : 'var(--color-border)'}`,
                          background: selectedShipping === 'express' ? 'rgba(0,113,189,0.04)' : 'var(--color-bg-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedShipping === 'express' ? 'var(--primary)' : 'var(--color-text-primary)' }}>Express</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>2-3 business days</div>
                        <div style={{ marginTop: '0.75rem', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>${shippingCosts.express.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="co-field">
                    <label className="co-label">Order Notes / Delivery Instructions (Optional)</label>
                    <textarea 
                      className="co-input" 
                      value={formData.orderNotes}
                      onChange={e => set({ orderNotes: e.target.value })}
                      placeholder="E.g. Department name, specific laboratory, or delivery gate..."
                      style={{ minHeight: '80px', padding: '0.75rem', resize: 'vertical' }}
                    />
                  </div>

                  <div className="co-cta-row">
                    <button type="button" className="co-btn-back" onClick={goBack}>← Back</button>
                    <button type="button" className="co-btn-next" onClick={goNext}>Continue <ChevronRight size={16} /></button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}
                >
                  {step2Valid && <div className="co-section-valid"><Check size={13} /> Logistics confirmed</div>}

                   {/* ── Protocol Review (Clinical Report Redesign) ── */}
                   {hasProtocols && (
                     <div style={{
                       border: '1px solid #e2e8f0',
                       borderRadius: '20px',
                       overflow: 'hidden',
                       backgroundColor: 'white',
                       boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                       position: 'relative'
                     }}>
                       <div style={{
                         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                         padding: '1.25rem 1.5rem',
                         backgroundColor: '#0f172a',
                         color: 'white'
                       }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <FileSearch size={18} color="#38bdf8" />
                           <div>
                             <div style={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Clinical Summary Report</div>
                             <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>ID: {orderId || 'PENDING'} • {new Date().toLocaleDateString()}</div>
                           </div>
                         </div>
                         <button 
                           type="button"
                           onClick={downloadPDF}
                           style={{ 
                             backgroundColor: 'rgba(255,255,255,0.1)', 
                             border: '1px solid rgba(255,255,255,0.2)', 
                             borderRadius: '8px', 
                             padding: '0.4rem 0.8rem', 
                             color: 'white', 
                             fontSize: '0.7rem', 
                             fontWeight: 700,
                             display: 'flex',
                             alignItems: 'center',
                             gap: '0.4rem',
                             cursor: 'pointer',
                             transition: 'all 0.2s'
                           }}
                         >
                           <FileDown size={14} /> PDF PREVIEW
                         </button>
                       </div>
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {Object.entries(protocolGroups).map(([id, group]) => {
                          const { name, items, patientGuide } = group;
                          const totalUnits = items.reduce((a, i) => a + i.qty, 0);
                          const weeks = Math.max(1, Math.round(totalUnits / Math.max(1, items.length)));
                          const expectedResults = patientGuide?.expectedResults;

                          return (
                            <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              <div>
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
                                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{name}</span>
                                  <span style={{ fontSize:'0.75rem', backgroundColor:'rgba(0,163,224,0.1)', color:'var(--primary)', padding:'0.25rem 0.6rem', borderRadius:'20px', fontWeight:700 }}>
                                    ~{weeks} week{weeks !== 1 ? 's' : ''} cycle
                                  </span>
                                </div>
                                {/* Timeline bar */}
                                <div style={{ display:'flex', gap:'4px', height:'6px', borderRadius:'4px', overflow:'hidden', background: '#f1f5f9' }}>
                                  {Array.from({ length: weeks }).map((_, wi) => (
                                    <div key={wi} style={{
                                      flex: 1,
                                      backgroundColor: wi < Math.ceil(weeks * 0.5) ? 'var(--primary)' : 'rgba(0,163,224,0.25)',
                                      borderRadius: '2px'
                                    }} />
                                  ))}
                                </div>
                                <div style={{ marginTop:'0.5rem', fontSize:'0.75rem', color:'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  {items.map((i, idx) => (
                                    <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      {i.itemKey}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Clinical Chart Sync */}
                              {expectedResults && (
                                <div style={{ 
                                  backgroundColor: '#f0f9ff', 
                                  padding: '1rem', 
                                  borderRadius: '12px', 
                                  border: '1px solid #e0f2fe' 
                                }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                    Expected Clinical Outcome
                                  </div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0c4a6e', marginBottom: '0.75rem' }}>
                                    {expectedResults.metric}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {(expectedResults.observations || []).slice(0, 3).map((obs, i) => {
                                      const valMatch = obs.match(/([\d.]+)\s*(%|cm|kg|lb)/i);
                                      const val = valMatch ? parseFloat(valMatch[1]) : 50; // fallback for viz
                                      const max = 100; // simplified for review
                                      const pct = Math.min(Math.round((val / max) * 100), 100);
                                      
                                      return (
                                        <div key={i}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', fontWeight: 600, color: '#0369a1' }}>
                                            <span>{obs.split(' ')[0]} {obs.split(' ')[1]}</span>
                                            <span>{obs.split(':').pop().trim()}</span>
                                          </div>
                                          <div style={{ height: '5px', backgroundColor: '#bae6fd', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: '10px' }} />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Safety / Admin Sync */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {patientGuide?.safetyNotes && (
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.75rem', backgroundColor: 'var(--color-success-bg)', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                    <Shield size={14} color="var(--color-success)" style={{ marginTop: '2px' }} />
                                    <div style={{ fontSize: '0.7rem', color: '#166534', lineHeight: 1.4 }}>
                                      <span style={{ fontWeight: 800 }}>Clinical Safety:</span> Monitor {patientGuide.safetyNotes.sideEffects?.[0] || 'metabolic markers'}.
                                    </div>
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.75rem', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                                  <Zap size={14} color="#f59e0b" style={{ marginTop: '2px' }} />
                                  <div style={{ fontSize: '0.7rem', color: '#9a3412', lineHeight: 1.4 }}>
                                    <span style={{ fontWeight: 800 }}>Synergy:</span> Cross-pathway recursive optimization active.
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Prescription Upload Card */}
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.01)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                      <Activity size={18} color="var(--primary)" />
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                        Clinical Prescription Verification (Optional)
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                      Upload your official research prescription to fast-track approval. Supported formats: Images (.png, .jpg) or PDFs.
                    </p>

                    <div style={{
                      border: prescriptionName ? '1px solid #cbd5e1' : '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-bg-app)',
                      cursor: prescriptionName ? 'default' : 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s',
                      boxShadow: prescriptionName ? '0 4px 20px rgba(0,0,0,0.02)' : 'none'
                    }}
                    onClick={() => {
                      if (!prescriptionName) {
                        document.getElementById('checkout-prescription-input').click();
                      }
                    }}
                    >
                      <input 
                        type="file" 
                        id="checkout-prescription-input"
                        accept=".pdf,image/*"
                        onChange={handlePrescriptionUpload}
                        style={{ display: 'none' }}
                      />
                      
                      {isScanningPrescription ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem 0' }}>
                          <div style={{
                            width: '24px', height: '24px',
                            border: '2.5px solid rgba(0, 75, 135, 0.15)',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            Extracting text & matching compounds...
                          </span>
                        </div>
                      ) : prescriptionName ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', textAlign: 'left' }}>
                          {/* File Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={18} color="var(--color-success)" />
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                                {prescriptionName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('checkout-prescription-input').click();
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                                textDecoration: 'underline'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 75, 135, 0.05)'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              Change File
                            </button>
                          </div>

                          {prescriptionSpecs && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {/* Metadata Grid */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>Dose Detected</span>
                                  <strong style={{ color: '#0f172a', fontSize: '0.78rem' }}>{prescriptionSpecs.dosage}</strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>Freq Detected</span>
                                  <strong style={{ color: '#0f172a', fontSize: '0.78rem', textTransform: 'capitalize' }}>{prescriptionSpecs.frequency}</strong>
                                </div>
                              </div>

                              {/* Section Title */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.2rem' }}>
                                <Sparkles size={14} color="var(--primary)" />
                                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-primary)', fontWeight: 800 }}>
                                  Detected Compounds & Products
                                </span>
                              </div>

                              {/* Matches List */}
                              {prescriptionSpecs.matchedProducts && prescriptionSpecs.matchedProducts.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {prescriptionSpecs.matchedProducts.map(prod => {
                                    const isAlreadyInCart = enrichedCartItems.some(item => 
                                      item.namePart.toLowerCase() === prod.name.toLowerCase()
                                    );

                                    const variants = prod.variants || [];
                                    const selectedVariantId = prescriptionSelectedVariants[prod.id || prod.name];
                                    const activeVar = variants.find(v => (v.variantId || v.id) === selectedVariantId) || variants[0] || prod;

                                    return (
                                      <div 
                                        key={prod.id || prod.name}
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '8px',
                                          backgroundColor: 'white',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: '10px',
                                          padding: '10px 12px',
                                          boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 850, color: '#0f172a' }}>
                                              {prod.name}
                                            </span>
                                            {prod.category && (
                                              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                                                {prod.category}
                                              </span>
                                            )}
                                          </div>

                                          {isAlreadyInCart ? (
                                            <div style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              color: 'var(--color-success)',
                                              backgroundColor: '#ecfdf5',
                                              border: '1px solid #a7f3d0',
                                              padding: '4px 8px',
                                              borderRadius: '6px',
                                              fontSize: '0.68rem',
                                              fontWeight: 800
                                            }}>
                                              <Check size={12} strokeWidth={3} />
                                              <span>In Order</span>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const addDose = activeVar.dosage || activeVar.strength || activeVar.size;
                                                updateCart({
                                                  name: prod.name,
                                                  dosage: addDose
                                                }, 1);
                                              }}
                                              style={{
                                                backgroundColor: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '5px 12px',
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 6px rgba(0, 75, 135, 0.15)'
                                              }}
                                              onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#003a6a';
                                                e.target.style.transform = 'translateY(-1px)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'var(--primary)';
                                                e.target.style.transform = 'none';
                                              }}
                                            >
                                              + Add to Order
                                            </button>
                                          )}
                                        </div>

                                        {!isAlreadyInCart && variants.length > 0 && (
                                          <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            borderTop: '1px solid #f1f5f9', 
                                            paddingTop: '8px', 
                                            marginTop: '2px' 
                                          }}>
                                            <span style={{ fontSize: '0.66rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Select Dosage:</span>
                                            <select
                                              value={selectedVariantId || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setPrescriptionSelectedVariants(prev => ({
                                                  ...prev,
                                                  [prod.id || prod.name]: val
                                                }));
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                              style={{
                                                fontSize: '0.68rem',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                backgroundColor: 'white',
                                                color: 'var(--color-text-primary)',
                                                fontWeight: 600,
                                                outline: 'none',
                                                flex: 1,
                                                cursor: 'pointer'
                                              }}
                                            >
                                              {variants.map(v => (
                                                <option key={v.variantId || v.id} value={v.variantId || v.id}>
                                                  {v.dosage || v.strength || v.size || 'Default'} — {v.price} {region === 'EU' ? '€' : '$'}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Add All Missing Button */}
                                  {prescriptionSpecs.matchedProducts.some(prod => 
                                    !enrichedCartItems.some(item => item.namePart.toLowerCase() === prod.name.toLowerCase())
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        prescriptionSpecs.matchedProducts.forEach(prod => {
                                          const isAlreadyInCart = enrichedCartItems.some(item => 
                                            item.namePart.toLowerCase() === prod.name.toLowerCase()
                                          );
                                          if (!isAlreadyInCart) {
                                            const variants = prod.variants || [];
                                            const selectedVariantId = prescriptionSelectedVariants[prod.id || prod.name];
                                            const activeVar = variants.find(v => (v.variantId || v.id) === selectedVariantId) || variants[0] || prod;
                                            const addDose = activeVar.dosage || activeVar.strength || activeVar.size;
                                            updateCart({
                                              name: prod.name,
                                              dosage: addDose
                                            }, 1);
                                          }
                                        });
                                      }}
                                      style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '9px',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        marginTop: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 14px rgba(14, 165, 233, 0.2)',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 6px 18px rgba(14, 165, 233, 0.3)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'none';
                                        e.target.style.boxShadow = '0 4px 14px rgba(14, 165, 233, 0.2)';
                                      }}
                                    >
                                      <Zap size={14} fill="white" color="white" />
                                      Add All Detected Compounds to Order
                                    </button>
                                  )}

                                  {/* Recommended Reconstitution Supplies */}
                                  {(() => {
                                    const accessories = (products || []).filter(p => p && p.name && (
                                      p.name.toLowerCase().includes('water') || 
                                      p.name.toLowerCase().includes('bacteriostatic') || 
                                      p.name.toLowerCase().includes('syringe') || 
                                      p.name.toLowerCase().includes('insulin')
                                    )).slice(0, 2);

                                    if (accessories.length === 0) return null;

                                    return (
                                      <div style={{
                                        borderTop: '1px dashed #cbd5e1',
                                        paddingTop: '0.85rem',
                                        marginTop: '0.65rem'
                                      }}>
                                        <span style={{ 
                                          fontSize: '0.66rem', 
                                          color: 'var(--color-text-secondary)', 
                                          fontWeight: 800, 
                                          textTransform: 'uppercase', 
                                          letterSpacing: '0.03em',
                                          display: 'block',
                                          marginBottom: '6px'
                                        }}>
                                          📦 Reconstitution & Injection Supplies
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {accessories.map(acc => {
                                            const isAlreadyInCart = enrichedCartItems.some(item => 
                                              item.namePart.toLowerCase() === acc.name.toLowerCase()
                                            );

                                            return (
                                              <div 
                                                key={acc.id || acc.name}
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                                  padding: '6px 10px',
                                                  backgroundColor: 'rgba(0, 75, 135, 0.02)',
                                                  border: '1px solid rgba(0, 75, 135, 0.05)',
                                                  borderRadius: '8px',
                                                  fontSize: '0.7rem'
                                                }}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  <span>{acc.name.toLowerCase().includes('water') ? '💧' : '💉'}</span>
                                                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                                                    {acc.name}
                                                  </span>
                                                </div>

                                                {isAlreadyInCart ? (
                                                  <span style={{
                                                    fontSize: '0.64rem',
                                                    color: 'var(--color-success)',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    backgroundColor: '#ecfdf5',
                                                    borderRadius: '4px'
                                                  }}>
                                                    ✓ Bundled
                                                  </span>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      updateCart({
                                                        name: acc.name,
                                                        dosage: acc.variants?.[0]?.dosage || acc.variants?.[0]?.size || null
                                                      }, 1);
                                                    }}
                                                    style={{
                                                      backgroundColor: 'white',
                                                      color: 'var(--primary)',
                                                      border: '1px solid var(--primary)',
                                                      borderRadius: '6px',
                                                      padding: '2px 8px',
                                                      fontSize: '0.64rem',
                                                      fontWeight: 800,
                                                      cursor: 'pointer',
                                                      transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.target.style.backgroundColor = 'var(--primary)';
                                                      e.target.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.target.style.backgroundColor = 'white';
                                                      e.target.style.color = 'var(--primary)';
                                                    }}
                                                  >
                                                    + Bundle
                                                  </button>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div style={{ 
                                  fontSize: '0.7rem', 
                                  color: 'var(--color-text-secondary)', 
                                  fontStyle: 'italic', 
                                  textAlign: 'center', 
                                  padding: '12px', 
                                  backgroundColor: '#f1f5f9', 
                                  borderRadius: '8px', 
                                  border: '1px solid #e2e8f0',
                                  fontWeight: 600
                                }}>
                                  No matching catalog products detected in the document text.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '0.5rem 0' }}>
                          <FileSearch size={24} color="var(--color-text-secondary)" />
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            Click to select or drag document here
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
                            PDF, PNG, JPG up to 10MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="co-label">Payment Method *</label>
                    <p style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)', margin:'0.25rem 0 1rem' }}>
                      Select how you prefer to complete the transaction once approved.
                    </p>
                    <div className="co-pay-grid">
                      <PayCard method="credit_card" icon={CreditCard} label="Credit Card" />
                      <PayCard method="bank_transfer" icon={Landmark} label="Bank Transfer" />
                    </div>
                  </div>

                  <div className="co-cta-row" style={{ marginTop: '2rem' }}>
                    <button type="button" className="co-btn-back" onClick={goBack}>← Back</button>
                    <button type="submit" className="co-btn-next" disabled={isSubmitting} style={{
                      background: 'linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)',
                      boxShadow: '0 8px 25px rgba(0, 75, 135, 0.2)'
                    }}>
                      {isSubmitting ? 'Processing…' : <><span>Confirm Request</span><Send size={18} /></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
              <span>Order Summary — {checkoutTotals.display}</span>
            </div>
            <motion.div animate={{ rotate: mobileSummaryOpen ? 180 : 0 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>
          <AnimatePresence>
            {mobileSummaryOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="co-sheet-body"
              >
                <SummaryItems />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Mobile: Floating Action Bar (glassmorphism) ───────────────── */}
      <div className="co-fab">
        {!isDone ? (
          <>
            <div className="co-fab-progress">
              <div className="co-fab-progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <div className="co-fab-inner">
              {step > 1 && (
                <button type="button" className="co-fab-back" onClick={goBack} aria-label="Go back">
                  <ArrowLeft size={22} />
                </button>
              )}
              {step < 3 ? (
                <button type="button" className="co-fab-btn" onClick={goNext}>
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button type="submit" form="checkout-form" className="co-fab-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing…' : <><span>Confirm Request</span><Send size={18} /></>}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="co-fab-inner">
            <button type="button" className="co-fab-btn" onClick={() => { window.location.href = '/paciente/orders'; }} style={{ background: 'var(--color-text-primary)' }}>
              <span>View My Orders</span>
              <ArrowLeft size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
