import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EXCHANGE_RATES } from '../../utils/currencies';
import { ALL_COUNTRIES } from '../../utils/countries';

export function useCheckoutState({ detectedCountry, region }) {
  const { user, userProfile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  const [inlineSuccess, setInlineSuccess] = useState(null);
  const [finalOrderData, setFinalOrderData] = useState(null);
  
  // Payment methods: 'credit_card', 'bank_transfer', 'apple_pay', 'crypto'
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    isProfessional: false,
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
      isProfessional: userProfile.role === 'professional' || userProfile.role === 'master' || userProfile.role === 'clinic'
    });
    setPrefillApplied(true);
  }, [userProfile, countryOptions, prefillApplied, user, set]);

  useEffect(() => {
    if (prefillApplied) return;
    const name = detectedCountry || EXCHANGE_RATES[region]?.name || 'United Arab Emirates';
    const found = countryOptions.find(c => c.value === name || c.value === detectedCountry);
    if (found) set({ country: found });
  }, [region, detectedCountry, countryOptions, prefillApplied, set]);

  const step1Valid = showLogin 
    ? (formData.email && formData.password)
    : (formData.firstName && formData.lastName && formData.email && 
       (user || formData.phone) && 
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
    setStep(s => Math.min(s + 1, 3)); 
    scrollReset();
  };
  
  const goBack = () => { 
    setStep(s => Math.max(s - 1, 1)); 
    scrollReset(); 
  };

  return {
    step, setStep,
    isSubmitting, setIsSubmitting,
    isDone, setIsDone,
    orderId, setOrderId,
    mobileSummaryOpen, setMobileSummaryOpen,
    showLogin, setShowLogin,
    showPassword, setShowPassword,
    loginLoading, setLoginLoading,
    inlineError, setInlineError,
    inlineSuccess, setInlineSuccess,
    finalOrderData, setFinalOrderData,
    formData, set,
    countryOptions,
    step1Valid, step2Valid,
    goNext, goBack, scrollReset
  };
}
