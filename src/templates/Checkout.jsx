import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin, Building2, CreditCard, Landmark, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


import { ALL_COUNTRIES } from '../data/countries';


export default function Checkout({ cart, region, isProfessional, EXCHANGE_RATES, detectedCountry, onBack, onComplete, products }) {
  const { user } = useAuth();
  useEffect(() => {
    // Scroll to top when checkout is mounted
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Also scroll the checkout container itself just in case since it's fixed
    const container = document.getElementById('checkout-overlay');
    if (container) container.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [step, setStep] = useState(1);

  const scrollReset = () => {
    window.scrollTo(0, 0);
    const container = document.getElementById('checkout-overlay');
    if (container) container.scrollTo(0, 0);
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.email && formData.phone &&
        (!isProfessional || formData.clinic);
    }
    if (step === 2) return formData.country && formData.address;
    return true;
  };

  const goNext = () => {
    if (!validateStep()) { alert('Please fill in all required fields before continuing.'); return; }
    setStep(s => Math.min(s + 1, 3)); scrollReset();
  };
  const goBack = () => { setStep(s => Math.max(s - 1, 1)); scrollReset(); };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clinic: '',
    address: '',
    country: null,
    paymentMethod: 'credit_card'
  });

  // Priority List: 1. IP Detected, 2. Exchange Rate Regions, 3. Everyone else
  const countryOptions = useMemo(() => {
    return ALL_COUNTRIES
      .map(c => ({ value: c.name, label: `${c.flag} ${c.name}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  useEffect(() => {
    // Set default country based on detection or region mapping
    const defaultCountryName = detectedCountry || EXCHANGE_RATES[region]?.name || 'United Arab Emirates';
    
    let foundOption = countryOptions.find(c => c.value === defaultCountryName || c.value === detectedCountry);

    if (foundOption) {
      setFormData(prev => ({ ...prev, country: foundOption }));
    }
  }, [region, detectedCountry, countryOptions]);

  const cartItems = Object.entries(cart);
  const totalItems = cartItems.reduce((acc, [_, qty]) => acc + qty, 0);

  const activeRegion = useMemo(() => {
    if (!formData.country) return region;
    const countryName = formData.country.value;
    const matched = Object.entries(EXCHANGE_RATES).find(([key, val]) => val.name === countryName);
    return matched ? matched[0] : 'row';
  }, [formData.country, EXCHANGE_RATES, region]);

  const checkoutTotals = useMemo(() => {
    let totalUSD = 0;
    cartItems.forEach(([itemKey, qty]) => {
      let namePart = itemKey;
      let dosagePart = null;
      if (itemKey.includes('(')) {
        const match = itemKey.match(/(.+) \((.+)\)/);
        if (match) {
          namePart = match[1];
          dosagePart = match[2];
        }
      }

      const product = products.find(p => p.name === namePart && (!dosagePart || p.dosage === dosagePart));
      
      if (product) {
        const productGuestVial = parseFloat(product.guestVialPrice || 0);
        const productProVial = parseFloat(product.proVialPrice || 0);
        const productGuestKit = parseFloat(product.guestKitPrice || 0);
        const productProKit = parseFloat(product.proKitPrice || 0);

        if (isProfessional && product.category !== "Research Supplies") {
          const kits = Math.floor(qty / 10);
          const individuals = qty % 10;
          totalUSD += (kits * productProKit) + (individuals * productProVial);
        } else if (isProfessional) {
          totalUSD += qty * productProVial;
        } else {
          totalUSD += qty * productGuestVial;
        }
      }
    });

    const formatValue = (val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return {
      display: `$${formatValue(totalUSD.toFixed(0))}`,
      subtext: activeRegion === 'row' ? 'Excl. shipping' : 'Incl. door-to-door'
    };
  }, [cartItems, activeRegion, isProfessional, EXCHANGE_RATES, products]);

  const generateOrderId = () => {
    const now = new Date();
    const datePart = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${datePart}-${randomPart}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newId = generateOrderId();
    setOrderId(newId);

    try {
      // Build enriched items with unit price for the email template
      const enrichedItems = Object.entries(cart).map(([itemKey, qty]) => {
        let namePart = itemKey;
        let dosagePart = null;
        if (itemKey.includes('(')) {
          const match = itemKey.match(/(.+) \((.+)\)/);
          if (match) { namePart = match[1]; dosagePart = match[2]; }
        }
        const product = products.find(
          p => p.name === namePart && (!dosagePart || p.dosage === dosagePart)
        );
        let unitPrice = 0;
        if (product) {
          unitPrice = isProfessional && product.category !== 'Research Supplies'
            ? parseFloat(product.proVialPrice || 0)
            : isProfessional
              ? parseFloat(product.proVialPrice || 0)
              : parseFloat(product.guestVialPrice || 0);
        }
        return { name: itemKey, variant: dosagePart || null, quantity: qty, price: unitPrice };
      });

      const subtotal = enrichedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const shipping = activeRegion === 'row' ? 0 : 0; // adjust if you add shipping costs later
      const total = subtotal + shipping;

      const orderData = {
        uid: user?.uid || null,
        orderId: newId,
        customer: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          institution: formData.clinic || null,
        },
        shippingAddress: {
          street: formData.address,
          country: formData.country?.value || null,
        },
        items: enrichedItems,
        subtotal,
        shipping,
        total,
        totalDisplay: checkoutTotals.display,
        currency: EXCHANGE_RATES[activeRegion]?.currency || 'USD',
        region: activeRegion,
        paymentMethod: formData.paymentMethod,
        isProfessional,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      setIsSubmitting(false);
      setIsDone(true);
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Error saving order:", err);
      setIsSubmitting(false);
      setIsDone(true);
      if (onComplete) onComplete();
    }
  };

  if (isDone) {
    // Ensure we scroll to top when success view mounts
    setTimeout(() => {
      window.scrollTo(0, 0);
      const container = document.getElementById('checkout-overlay');
      if (container) container.scrollTo(0, 0);
    }, 10);

    return (
      <div id="checkout-overlay" className="checkout-success-view" style={{ 
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'white',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '10vh 2rem 2rem 2rem',
        textAlign: 'center',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ color: 'var(--success)', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle2 size={100} strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', fontWeight: 800 }}>Request Received</h1>
          
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            marginBottom: '2rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Order Tracking ID</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{orderId}</div>
          </div>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '3rem' }}>
            We have received your research inquiry, <strong>{formData.firstName}</strong>. 
            Keep your Tracking ID for future reference. A specialist will contact you shortly via email with formal documentation.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%' }}>
            <button 
              onClick={() => {
                onBack(); // close checkout overlay first
                setTimeout(() => window.location.href = '/', 100);
              }} 
              className="btn btn-primary"
              style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}
            >
              Return to Home
            </button>
            <button 
              onClick={() => {
                onBack();
                // We don't have a direct route in the router since it's state based, 
                // so we reload the page avoiding hash links that don't trigger state updates
                setTimeout(() => window.location.reload(), 100); 
              }} 
              className="btn"
              style={{ padding: '1.25rem', fontWeight: 700, borderColor: 'var(--border)' }}
            >
              Start New Inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'white',
      zIndex: 2500,
      overflowY: 'auto',
      animation: 'slideDownNav 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
    }}>
      <style>{`
        @keyframes slideDownNav {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .checkout-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 2rem !important;
          }
          .checkout-container { padding: 1.5rem 1rem 120px 1rem !important; }
          .checkout-name-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .checkout-summary-box { display: none !important; }
          .checkout-success-view { padding: 4rem 1.5rem !important; }
          .checkout-sticky-cta {
            position: fixed !important;
            bottom: 0; left: 0; right: 0;
            padding: 1rem 1.5rem;
            background: white;
            border-top: 1px solid var(--border);
            z-index: 100;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          }
          .checkout-inline-cta { display: none !important; }
        }
        @media (min-width: 769px) {
          .checkout-sticky-cta { display: none !important; }
          .checkout-inline-cta { display: flex !important; }
        }
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.85rem; transition: all 0.3s;
          flex-shrink: 0;
        }
        .step-dot.active { background: var(--primary); color: white; }
        .step-dot.done { background: var(--primary); color: white; opacity: 0.6; }
        .step-dot.upcoming { background: var(--border); color: var(--text-muted); }
        .step-line { flex: 1; height: 2px; transition: background 0.3s; }
        .step-line.done { background: var(--primary); opacity: 0.4; }
        .step-line.upcoming { background: var(--border); }
      `}</style>

      <div className="checkout-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 8rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
          <div 
            onClick={onBack}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={20} /> Return to Catalog
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Research Inquiry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            Complete the form below to receive a professional quotation.
          </p>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, maxWidth: '360px', margin: '0 auto' }}>
            {[1, 2, 3].map((s, i) => (
              <>
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <div className={`step-dot ${step === s ? 'active' : step > s ? 'done' : 'upcoming'}`}>
                    {step > s ? '✓' : s}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: step === s ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {['Identity', 'Logistics', 'Review'][i]}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`step-line ${step > s ? 'done' : 'upcoming'}`}
                    style={{ marginBottom: '1.2rem', margin: '0 0.25rem 1.2rem 0.25rem' }} />
                )}
              </>
            ))}
          </div>
        </div>

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', alignItems: 'start' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* ── STEP 1: Research Identity ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="checkout-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name*</label>
                    <input
                      required
                      className="premium-input"
                      inputMode="text"
                      autoComplete="given-name"
                      style={{ fontSize: '1rem' }}
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      placeholder="e.g. Alexander"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Surname*</label>
                    <input
                      required
                      className="premium-input"
                      inputMode="text"
                      autoComplete="family-name"
                      style={{ fontSize: '1rem' }}
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      placeholder="e.g. Sterling"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Institutional Email*</label>
                  <input
                    required
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="premium-input"
                    style={{ fontSize: '1rem' }}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@institution.edu"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone (WhatsApp Preferred)*</label>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="premium-input"
                    style={{ fontSize: '1rem' }}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+00 123 456 789"
                  />
                </div>

                {isProfessional && (
                  <div className="form-group">
                    <label className="form-label">Organization / Clinic*</label>
                    <input
                      required
                      className="premium-input"
                      inputMode="text"
                      autoComplete="organization"
                      style={{ fontSize: '1rem' }}
                      value={formData.clinic}
                      onChange={e => setFormData({...formData, clinic: e.target.value})}
                      placeholder="Medical Center / Research Lab"
                    />
                  </div>
                )}

                {/* Inline CTA — desktop only */}
                <div className="checkout-inline-cta" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={onBack}
                    style={{ flex: 1, padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 700,
                      borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                      backgroundColor: 'white', color: 'var(--text-main)', cursor: 'pointer' }}>
                    ← Catalog
                  </button>
                  <button type="button" onClick={goNext}
                    className="btn btn-primary"
                    style={{ flex: 2, minHeight: '54px', fontSize: '1.1rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Sticky CTA — Step 1, mobile only */}
            {step === 1 && (
              <div className="checkout-sticky-cta">
                <button type="button" onClick={goNext}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '54px', fontSize: '1.1rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── STEP 2: Logistics ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Country*</label>
                  <Select
                    options={countryOptions}
                    value={formData.country}
                    onChange={(option) => setFormData({...formData, country: option})}
                    placeholder="Search for your country..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-md)',
                        borderColor: 'var(--border)',
                        borderWidth: '1.5px',
                        boxShadow: state.isFocused ? '0 0 0 4px rgba(0, 163, 224, 0.1)' : 'none',
                        backgroundColor: state.isFocused ? 'white' : 'var(--surface)',
                        fontSize: '1rem',
                      })
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Delivery Address*</label>
                  <textarea
                    required
                    className="premium-input"
                    inputMode="text"
                    autoComplete="street-address"
                    rows="3"
                    style={{ fontSize: '1rem' }}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Street Name, Unit/Bldg Number, City, Postal Code"
                  />
                </div>

                {/* Inline CTA — desktop only */}
                <div className="checkout-inline-cta" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={goBack}
                    style={{ flex: 1, padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 700,
                      borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                      backgroundColor: 'white', color: 'var(--text-main)', cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button type="button" onClick={goNext}
                    className="btn btn-primary"
                    style={{ flex: 2, minHeight: '54px', fontSize: '1.1rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Sticky CTA — Step 2, mobile only */}
            {step === 2 && (
              <div className="checkout-sticky-cta">
                <button type="button" onClick={goNext}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '54px', fontSize: '1.1rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── STEP 3: Payment & Review ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>Preferred Payment Method*</label>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Select how you prefer to complete the transaction once your inquiry is approved.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div
                      role="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'credit_card'})}
                      style={{
                        minHeight: '60px', padding: '1.5rem',
                        border: formData.paymentMethod === 'credit_card' ? '2px solid var(--primary)' : '2px solid var(--border)',
                        backgroundColor: formData.paymentMethod === 'credit_card' ? 'rgba(0, 75, 135, 0.05)' : 'white',
                        borderRadius: '12px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                      }}
                    >
                      <CreditCard size={28} color={formData.paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600, color: formData.paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--text-main)' }}>Credit Card</span>
                      {formData.paymentMethod === 'credit_card' && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>✓ Selected</span>}
                    </div>

                    <div
                      role="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'bank_transfer'})}
                      style={{
                        minHeight: '60px', padding: '1.5rem',
                        border: formData.paymentMethod === 'bank_transfer' ? '2px solid var(--primary)' : '2px solid var(--border)',
                        backgroundColor: formData.paymentMethod === 'bank_transfer' ? 'rgba(0, 75, 135, 0.05)' : 'white',
                        borderRadius: '12px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                      }}
                    >
                      <Landmark size={28} color={formData.paymentMethod === 'bank_transfer' ? 'var(--primary)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600, color: formData.paymentMethod === 'bank_transfer' ? 'var(--primary)' : 'var(--text-main)' }}>Bank Transfer</span>
                      {formData.paymentMethod === 'bank_transfer' && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>✓ Selected</span>}
                    </div>
                  </div>
                </div>

                {/* Inline CTA — desktop only */}
                <div className="checkout-inline-cta" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={goBack}
                    style={{ flex: 1, padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 700,
                      borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                      backgroundColor: 'white', color: 'var(--text-main)', cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || totalItems === 0}
                    style={{ flex: 2, minHeight: '54px', fontSize: '1.1rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    {isSubmitting ? 'Processing...' : (<>Confirm Request <Send size={18} /></>)}
                  </button>
                </div>
              </div>
            )}

            {/* Sticky CTA — Step 3, mobile only */}
            {step === 3 && (
              <div className="checkout-sticky-cta">
                <button
                  type="submit"
                  form="checkout-form"
                  className="btn btn-primary"
                  disabled={isSubmitting || totalItems === 0}
                  style={{ width: '100%', minHeight: '54px', fontSize: '1.1rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  {isSubmitting ? 'Processing...' : (<>Confirm Request <Send size={18} /></>)}
                </button>
              </div>
            )}

          </form>

          <div className="checkout-summary-box" style={{ position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <ShieldCheck size={18} />
              <span>Secure & Encrypted Process</span>
            </div>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '2.5rem', 
              borderRadius: '24px', 
              border: '1px solid var(--border)' 
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Research Items</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {cartItems.map(([itemKey, qty]) => {
                  return (
                    <div key={itemKey} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700 }}>
                        {itemKey}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          Qty: {qty} units
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '2px solid var(--border)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Estimated Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{checkoutTotals.display}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>*{checkoutTotals.subtext}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
