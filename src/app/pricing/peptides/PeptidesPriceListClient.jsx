'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Share2,
  Check,
  ShoppingCart,
  ShieldCheck,
  Box,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  Lock,
  ArrowRight,
  Eye,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import Breadcrumb from '@/components/ui/Breadcrumb';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import { COUNTRIES } from '@/data/countries';
import '../colway/ColwayPriceList.css';

const CATEGORY_MAP = {
  metabolic: { label: 'Metabolic & GLP-1', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  repair: { label: 'Tissue Repair & Healing', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  longevity: { label: 'Longevity & Cellular', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
  neuro: { label: 'Neuro & Cognitive', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' },
  growth_hormone: { label: 'GH Secretagogues', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  cosmetic: { label: 'Dermal & Follicular', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  general_health: { label: 'Bioactive Peptide', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' }
};

export default function PeptidesPriceListClient({ initialProducts = [], referralCode = 'CAT-RX-7482' }) {
  const router = useRouter();
  const { user } = useAuth();
  const { is, effectiveRole } = useRoleAccess();

  const isAdmin = is('admin');
  const isWholesaler = is('wholesaler') || isAdmin;
  const isClinic = is('doctor') || is('clinic') || is('fagron_clinic') || is('medical_director') || isWholesaler;

  const [currency, setCurrency] = useState('USD'); // USD, EUR, AED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22)
  const [copied, setCopied] = useState(false);
  
  // Order Drawer State
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState({}); // { [productId]: { quantity1x: 0, quantity10x: 0, product } }
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    phoneCountryCode: 'es',
    country: 'Spain',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    notes: ''
  });

  // Currency conversions (Base USD)
  const fxRate = useMemo(() => {
    if (currency === 'EUR') return 0.92;
    if (currency === 'AED') return 3.6725;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'EUR') return '€';
    if (currency === 'AED') return 'AED ';
    return '$';
  }, [currency]);

  const formatPrice = useCallback((usdAmount) => {
    if (usdAmount == null || isNaN(usdAmount)) return '—';
    const converted = usdAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  // Map and categorize products
  const processedProducts = useMemo(() => {
    return initialProducts.map((p, index) => {
      const nameLower = (p.productName || '').toLowerCase();
      let categoryKey = p.primaryGoal || 'general_health';

      if (nameLower.includes('semaglutide') || nameLower.includes('tirzepatide') || nameLower.includes('retatrutide') || nameLower.includes('aod') || nameLower.includes('cagrilintide') || nameLower.includes('survodutide')) {
        categoryKey = 'metabolic';
      } else if (nameLower.includes('bpc') || nameLower.includes('tb-500') || nameLower.includes('kpv') || nameLower.includes('thymosin beta')) {
        categoryKey = 'repair';
      } else if (nameLower.includes('epithalon') || nameLower.includes('mots-c') || nameLower.includes('ss-31') || nameLower.includes('humanin') || nameLower.includes('foxo4') || nameLower.includes('nad')) {
        categoryKey = 'longevity';
      } else if (nameLower.includes('semax') || nameLower.includes('selank') || nameLower.includes('dihexa') || nameLower.includes('oxytocin') || nameLower.includes('pinealon')) {
        categoryKey = 'neuro';
      } else if (nameLower.includes('cjc') || nameLower.includes('ipamorelin') || nameLower.includes('sermorelin') || nameLower.includes('ghrp') || nameLower.includes('hexarelin') || nameLower.includes('tesamorelin')) {
        categoryKey = 'growth_hormone';
      } else if (nameLower.includes('ghk') || nameLower.includes('ahk') || nameLower.includes('snap-8')) {
        categoryKey = 'cosmetic';
      }

      return {
        ...p,
        itemNumber: index + 1,
        categoryKey,
        categoryMeta: CATEGORY_MAP[categoryKey] || CATEGORY_MAP.general_health
      };
    });
  }, [initialProducts]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return processedProducts.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.productName || '').toLowerCase().includes(q) ||
        (p.dosage || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.categoryMeta.label || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.categoryKey === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [processedProducts, searchQuery, selectedCategory]);

  // Cart operations
  const handleAddToCart = (product, packType) => {
    setCartItems(prev => {
      const current = prev[product.id] || { quantity1x: 0, quantity10x: 0, product };
      const updated = {
        ...current,
        [packType === '10x' ? 'quantity10x' : 'quantity1x']: current[packType === '10x' ? 'quantity10x' : 'quantity1x'] + 1
      };
      return { ...prev, [product.id]: updated };
    });
    toast.success(`Added ${product.productName} (${packType === '10x' ? 'Pack ×10' : '1x Vial'}) to request ✓`);
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity1x + (item.quantity10x * 10), 0);
  }, [cartItems]);

  const totalCartValueUsd = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const p = item.product;
      const v1x = (item.quantity1x || 0) * (p.unitPrice || 0);
      const v10x = (item.quantity10x || 0) * (p.pack10Price || (p.unitPrice * 10 * 0.85));
      return sum + v1x + v10x;
    }, 0);
  }, [cartItems]);

  const handleShareSchedule = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Official B2B Price Schedule link copied to clipboard ✓');
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit B2B Order Request
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      toast.error('Please enter your name, email and phone number');
      return;
    }
    if (!orderForm.addressLine1 || !orderForm.city || !orderForm.postalCode) {
      toast.error('Please provide full shipping address (Street, City, Postal Code)');
      return;
    }
    if (Object.keys(cartItems).length === 0) {
      toast.error('Your order request is empty. Please select products first.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const itemsPayload = Object.values(cartItems).map(item => ({
        id: item.product.id,
        productId: item.product.productId,
        name: item.product.productName,
        dosage: item.product.dosage,
        quantity1x: item.quantity1x,
        quantity10x: item.quantity10x,
        totalVials: item.quantity1x + (item.quantity10x * 10),
        unitPriceUsd: item.product.unitPrice,
        subtotalUsd: (item.quantity1x * item.product.unitPrice) + (item.quantity10x * (item.product.pack10Price || item.product.unitPrice * 8.5))
      }));

      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: orderForm,
          items: itemsPayload,
          referralCode,
          source: 'public_peptides_price_schedule',
          totalAmountUsd: totalCartValueUsd,
          currency: 'USD'
        })
      });

      if (!res.ok) {
        throw new Error('Could not submit order proforma');
      }

      toast.success('Proforma request submitted successfully! Confirmation sent to your email.');
      setCartItems({});
      setIsOrderDrawerOpen(false);
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error('Unable to send order. Please try again or contact support.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // DataTable columns (Strict Rule #30: explicit width, no horizontal scroll, Google Cloud UX)
  const columns = useMemo(() => [
    {
      key: 'itemNumber',
      label: '#',
      width: '4%',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.80rem', color: '#64748b', fontWeight: 600 }}>
          {val ?? row?.itemNumber}
        </span>
      )
    },
    {
      key: 'productName',
      label: 'Peptide Formulation & Concentration',
      width: '42%',
      sortable: true,
      render: (_, row) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
            {row.productName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 750,
              color: '#0369a1',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '2px 8px',
              borderRadius: '5px',
              letterSpacing: '-0.01em'
            }}>
              {row.dosage}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: row?.categoryMeta?.color,
              background: row?.categoryMeta?.bg,
              border: `1px solid ${row?.categoryMeta?.border}`,
              padding: '2px 8px',
              borderRadius: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              {row?.categoryMeta?.label}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'unitPrice',
      label: 'Single Vial (1x)',
      width: '18%',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 750, color: '#0f172a', fontSize: '0.95rem' }}>
            {formatPrice(val ?? row.unitPrice)}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>per sterile vial</span>
        </div>
      )
    },
    {
      key: 'pack10Price',
      label: 'Box of 10 (Pack ×10)',
      width: '20%',
      sortable: true,
      render: (_, row) => {
        const p10 = row.pack10Price || (row.unitPrice * 10 * 0.85);
        const perUnit = row.tier10UnitPrice || (row.unitPrice * 0.85);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
                {formatPrice(p10)}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 750,
                color: '#065f46',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                -15% Vol.
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#047857', fontFamily: 'monospace' }}>
              ({formatPrice(perUnit)} / vial)
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Order Request',
      width: '16%',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleAddToCart(row, '1x')}
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              color: '#1e293b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Add 1 Single Vial"
          >
            +1 Vial
          </button>
          <button
            onClick={() => handleAddToCart(row, '10x')}
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#0284c7',
              border: '1px solid #0284c7',
              borderRadius: '5px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Add Box of 10 Vials (-15% volume discount)"
          >
            <Box size={12} />
            +Pack ×10
          </button>
        </div>
      )
    }
  ], [formatPrice]);

  return (
    <div className="colway-price-root">
      {/* ── Screen Navigation Bar ── */}
      <header className="screen-nav-bar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand">
              <Sparkles size={16} className="text-sky-400" />
              <span>MEDILUXE B2B</span>
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-section">Price Schedules</span>
            <span className="nav-divider">/</span>
            <span className="nav-current">Lyophilized Peptide Vials</span>
          </div>

          <div className="nav-actions">
            {/* Currency selector */}
            <div className="currency-selector">
              <span>Display FX:</span>
              <div className="pill-group">
                {['USD', 'EUR', 'AED'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`pill-btn ${currency === curr ? 'active' : ''}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsOrderDrawerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: totalCartCount > 0 ? '#0284c7' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShoppingCart size={14} />
              <span>Request Proforma</span>
              {totalCartCount > 0 && (
                <span style={{
                  background: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '0.70rem',
                  fontWeight: 800
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Share button */}
            <button
              onClick={handleShareSchedule}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Copy verified price list link"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Breadcrumb items={[
            { label: 'B2B Portal', href: '/' },
            { label: 'Official Price Schedules', href: '/pricing/peptides' },
            { label: 'Clinical Peptide Vials' }
          ]} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Official B2B & Clinical Price Schedule
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Batch Verified ≥99.0% HPLC
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Certified Clinical Peptide Vials
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', maxWidth: '750px' }}>
                Comprehensive institutional price schedule for sterile lyophilized bioactive peptides. Direct lab pricing with volume tiers for registered medical practices, clinics, and research compounding facilities.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>Export PDF / Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4 KPIs with Scope Switcher (Golden Rule #22) ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* Scope Indicator & Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: scopeMode === 'filtered' ? '#0284c7' : '#475569',
                background: scopeMode === 'filtered' ? '#f0f9ff' : '#f8fafc',
                border: `1px solid ${scopeMode === 'filtered' ? '#bae6fd' : '#e2e8f0'}`,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {scopeMode === 'filtered' ? `Matching Active Filters (${filteredProducts.length} Formulations)` : `Entire Database (${processedProducts.length} Formulations)`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Metrics Scope:</span>
              <div className="pill-group" style={{ background: '#f1f5f9' }}>
                <button
                  onClick={() => setScopeMode('filtered')}
                  className={`pill-btn ${scopeMode === 'filtered' ? 'active' : ''}`}
                  style={{ color: scopeMode === 'filtered' ? '#0284c7' : '#64748b' }}
                >
                  Filtered View
                </button>
                <button
                  onClick={() => setScopeMode('global')}
                  className={`pill-btn ${scopeMode === 'global' ? 'active' : ''}`}
                  style={{ color: scopeMode === 'global' ? '#0284c7' : '#64748b' }}
                >
                  Global Database
                </button>
              </div>
            </div>
          </div>

          {/* 4 Standard Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Available Formulations
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {scopeMode === 'filtered' ? filteredProducts.length : processedProducts.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
                Sterile Lyophilized Vials
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Volume Pack Tier
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                -15% Off
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>
                On 10+ Vial Box Orders
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Purity Verification
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                ≥99.0%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '2px' }}>
                HPLC & MS Analytical Testing
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Analytical Quality
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                100% COA
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '2px' }}>
                Batch HPLC & Mass Spec Tested
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Search & Filters (Golden Rule #7) ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by peptide name (e.g. BPC-157, Semaglutide, Tirzepatide, GHK-Cu, Epithalon)..."
            size="lg"
            resultCount={filteredProducts.length}
            filters={
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 650,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: selectedCategory === 'all' ? '#0f172a' : '#ffffff',
                    color: selectedCategory === 'all' ? '#ffffff' : '#475569',
                    borderColor: selectedCategory === 'all' ? '#0f172a' : '#cbd5e1'
                  }}
                >
                  All Categories ({processedProducts.length})
                </button>
                {Object.entries(CATEGORY_MAP).map(([key, meta]) => {
                  const count = processedProducts.filter(p => p.categoryKey === key).length;
                  if (count === 0) return null;
                  const active = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 650,
                        border: '1px solid',
                        cursor: 'pointer',
                        background: active ? meta.color : '#ffffff',
                        color: active ? '#ffffff' : meta.color,
                        borderColor: meta.border
                      }}
                    >
                      {meta.label} ({count})
                    </button>
                  );
                })}
              </div>
            }
          />
        </div>

        {/* ── Peptide DataTable (Golden Rule #3) ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem' }}>
              <EmptyState
                icon={FileText}
                title="No peptide formulations found"
                subtitle="Try adjusting your keyword search or category filter to discover available formulations."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }
                }}
              />
            </div>
          ) : (
            <DataTable
              data={filteredProducts}
              columns={columns}
              keyField="id"
              pageSize={50}
              showPagination={true}
              sortable={true}
            />
          )}
        </div>
      </main>

      {/* ── Quick Order Request Drawer ── */}
      {isOrderDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Request B2B Proforma
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Reference Code: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{referralCode}</span>
                </p>
              </div>
              <button
                onClick={() => setIsOrderDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {/* Selected Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Selected Formulations ({totalCartCount} Vials)
                </h4>

                {Object.keys(cartItems).length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    fontSize: '0.82rem'
                  }}>
                    Your order request is currently empty. Use the "+1 Vial" or "+Pack ×10" buttons in the table to add items.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.values(cartItems).map(item => {
                      const p = item.product;
                      return (
                        <div
                          key={p.id}
                          style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                              {p.productName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {p.dosage} • {item.quantity1x > 0 ? `${item.quantity1x}x Vial ` : ''}
                              {item.quantity10x > 0 ? `${item.quantity10x}x Pack ×10` : ''}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                              {formatPrice((item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5)))}
                            </span>
                            <button
                              onClick={() => {
                                setCartItems(prev => {
                                  const copy = { ...prev };
                                  delete copy[p.id];
                                  return copy;
                                });
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                padding: '2px 4px'
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{
                      marginTop: '0.5rem',
                      padding: '10px 12px',
                      background: '#f0f9ff',
                      borderRadius: '6px',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369a1' }}>Estimated Total:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#0369a1' }}>
                        {formatPrice(totalCartValueUsd)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmitOrder}>
                {/* ── Section 1: Contact ── */}
                <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>1.</span> Institutional Contact
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={e => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. Full Name / Procurement Lead"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Practice / Clinic Name
                      </label>
                      <input
                        type="text"
                        value={orderForm.clinicName}
                        onChange={e => setOrderForm(prev => ({ ...prev, clinicName: e.target.value }))}
                        placeholder="Clinic / Lab Name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.email}
                        onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="doctor@clinic.com"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Phone / WhatsApp (International) *
                    </label>
                    <InternationalPhoneInput
                      value={orderForm.phone}
                      onChange={(val) => setOrderForm(prev => ({ ...prev, phone: val }))}
                      countryHint={orderForm.phoneCountryCode || 'ES'}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                {/* ── Section 2: Delivery Destination ── */}
                <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>2.</span> Shipping & Delivery Destination
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Destination Country *
                    </label>
                    <select
                      value={orderForm.country}
                      onChange={e => {
                        const selectedName = e.target.value;
                        const match = COUNTRIES.find(c => c.name === selectedName);
                        setOrderForm(prev => ({
                          ...prev,
                          country: selectedName,
                          phoneCountryCode: match?.code || prev.phoneCountryCode
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        backgroundColor: '#ffffff',
                        color: '#0f172a'
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.dial_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Street Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.addressLine1}
                      onChange={e => setOrderForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                      placeholder="Street address, building number, medical tower..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Suite / Floor / Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderForm.addressLine2}
                      onChange={e => setOrderForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                      placeholder="Suite 400, Floor 3, Clinic Reception..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.city}
                        onChange={e => setOrderForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        value={orderForm.state}
                        onChange={e => setOrderForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State or Region"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Postal Code / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.postalCode}
                      onChange={e => setOrderForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="Postal / ZIP code"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                {/* ── Section 3: Notes ── */}
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                    Order Notes / Compounding Specifications
                  </label>
                  <textarea
                    rows={2}
                    value={orderForm.notes}
                    onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific batch, concentration, or delivery notes..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                  <button
                    type="submit"
                    disabled={submittingOrder || Object.keys(cartItems).length === 0}
                    style={{
                      marginTop: '0.5rem',
                      padding: '12px',
                      background: Object.keys(cartItems).length === 0 ? '#94a3b8' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.90rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {submittingOrder ? 'Submitting Proforma Request...' : 'Submit Proforma Request'}
                    <ArrowRight size={16} />
                  </button>

                  <p style={{ fontSize: '0.70rem', color: '#94a3b8', textAlign: 'center', margin: '4px 0 0 0' }}>
                    Upon submission, our medical logistics team will issue an official B2B proforma invoice with customs documentation and analytical COA verification.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Unified Public Footer */}
      <PublicUnifiedFooter />
    </div>
  );
}

