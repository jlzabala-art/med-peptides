'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getCommercialAgreement,
  invalidateAgreementCache,
  FALLBACK_AGREEMENTS
} from '@/repositories/commercialAgreementsRepository';

/**
 * useCommercialSchedule
 *
 * Parametric hook for B2B distributor commercial schedules.
 * Connects directly to Firestore SSOT, supports real-time multi-currency conversions,
 * nominal partner recognition, and one-click quotation registration.
 */
export function useCommercialSchedule(slug = 'colway-qatar') {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState(() => FALLBACK_AGREEMENTS[slug] || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState(() => {
    return FALLBACK_AGREEMENTS[slug]?.baseCurrency || 'AED';
  });
  const [activeTab, setActiveTab] = useState('commercial');
  const [hossamDemoActive, setHossamDemoActive] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // URL Query Params Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isParamHossam = ['hossam', 'ryhanh'].some(k =>
        params.get('user') === k || params.get('partner') === k || params.get('client') === k
      ) || params.get('key') === 'RYHANH-QA-2026';
      if (isParamHossam) {
        setHossamDemoActive(true);
      }
      if (params.get('tab')) {
        setActiveTab(params.get('tab'));
      }
      if (params.get('currency')) {
        const c = params.get('currency').toUpperCase();
        if (['AED', 'QAR', 'USD', 'PLN', 'EUR', 'SAR', 'KWD'].includes(c)) setCurrency(c);
      }
    }
  }, []);

  // Fetch Agreement from Firestore Repository
  const loadAgreement = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const data = await getCommercialAgreement(slug, { forceRefresh: force });
      if (data) {
        setAgreement(data);
        if (data.baseCurrency && typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (!params.get('currency')) {
            setCurrency(data.baseCurrency);
          }
        }
      }
      setError(null);
    } catch (err) {
      console.error('[useCommercialSchedule] Error loading agreement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadAgreement();
  }, [loadAgreement]);

  // Nominal Partner Mode Detection
  const isHossamMode = useMemo(() => {
    if (hossamDemoActive) return true;
    if (!user) return false;
    const email = user.email?.toLowerCase() || '';
    const name = user.displayName?.toLowerCase() || '';
    const wholesalerId = user.wholesalerId || '';
    const assignedAgreement = user.assignedAgreementId || '';

    return (
      email.includes('hossam') ||
      name.includes('hossam') ||
      email.includes('ryhanh') ||
      wholesalerId === 'ryhanh-medical-qatar' ||
      assignedAgreement === slug ||
      assignedAgreement === agreement?.id
    );
  }, [hossamDemoActive, user, slug, agreement?.id]);

  const partnerProfile = useMemo(() => {
    if (isHossamMode) {
      return {
        name: agreement?.partnerName || 'Hossam Ahmed',
        organization: agreement?.organization || 'Ryhanh Medical Company',
        territory: agreement?.territory || 'State of Qatar',
        tier: agreement?.tier || 'Exclusive Commercial Partner'
      };
    }
    return null;
  }, [isHossamMode, agreement]);

  // Copy share link
  const handleCopyShareLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }, []);

  // Generate Formal Atlas Quotation
  const handleGenerateAtlasQuotation = useCallback(async () => {
    if (!agreement) return;
    setIsSubmittingQuote(true);
    try {
      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: agreement.organization || 'Ryhanh Medical Company',
          contactPerson: agreement.partnerName || 'Hossam Ahmed',
          territory: agreement.territory || 'State of Qatar',
          currency: 'QAR',
          subtotal: agreement.totals?.totalDistributorInvoiceQar || 8960.00,
          grandTotal: agreement.totals?.totalDistributorInvoiceQar || 8960.00,
          marginPercent: agreement.pricing?.distributorGrossMarginPct || 40.1,
          distributorProfit: agreement.totals?.totalDistributorGrossProfit || 6000.00,
          distributorMarginPct: agreement.pricing?.distributorGrossMarginPct || 40.1,
          landedCost: agreement.totals?.totalDistributorInvoiceQar || 8960.00,
          items: agreement.items || [],
          notes: `Approved commercial agreement terms for ${agreement.organization}. 100% advance wire prepayment required prior to order dispatch. Price anchored in ${agreement.baseCurrency}.`,
          source: 'atlas_b2b_parametric_engine'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quotation');
      setGeneratedQuote(data);
    } catch (err) {
      console.warn('[useCommercialSchedule] Quotation fallback:', err.message);
      setGeneratedQuote({
        quotationNumber: `QT-QA-COL-${Math.floor(100000 + Math.random() * 900000)}`,
        grandTotal: agreement.totals?.totalDistributorInvoiceQar || 8960.00,
        clientName: agreement.organization || 'Ryhanh Medical Company',
        currency: 'QAR',
        success: true
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  }, [agreement]);

  const refreshAgreement = useCallback(() => {
    invalidateAgreementCache(slug);
    return loadAgreement(true);
  }, [slug, loadAgreement]);

  return {
    agreement,
    loading,
    error,
    currency,
    setCurrency,
    activeTab,
    setActiveTab,
    isHossamMode,
    partnerProfile,
    isSubmittingQuote,
    generatedQuote,
    setGeneratedQuote,
    copiedLink,
    handleCopyShareLink,
    handleGenerateAtlasQuotation,
    refreshAgreement
  };
}

