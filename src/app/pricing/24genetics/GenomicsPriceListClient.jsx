'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dna,
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
  ChevronDown,
  Filter,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  FlaskConical,
  Activity,
  Award
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
import '../colway/ColwayPriceList.css';

export default function GenomicsPriceListClient({ initialProducts = [] }) {
  const router = useRouter();
  const { user } = useAuth();
  const { is, effectiveRole } = useRoleAccess();

  // Role Access Hierarchy
  const isAdmin = is('admin');
  const isWholesaler = is('wholesaler') || is('distributor') || isAdmin;
  const isClinicOrDoctor = is('doctor') || is('clinic') || is('fagron_clinic') || is('medical_director') || isWholesaler;
  const isGuest = !user || effectiveRole === 'guest';
  const canViewCost = Boolean(isAdmin);

  const [currency, setCurrency] = useState('EUR'); // EUR, USD, AED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scopeMode, setScopeMode] = useState('global');
  const [copied, setCopied] = useState(false);
  const [showCostBasis, setShowCostBasis] = useState(false);

  // Quick Order Drawer State
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState({}); // { [productId]: { quantity1x, quantity10x, product } }
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    country: 'Spain',
    notes: ''
  });

  // FX Rates (Base EUR)
  const fxRate = useMemo(() => {
    if (currency === 'USD') return 1.08;
    if (currency === 'AED') return 3.98;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'USD') return '$';
    if (currency === 'AED') return 'AED ';
    return '€';
  }, [currency]);

  const formatPrice = useCallback((eurAmount) => {
    if (eurAmount == null || isNaN(eurAmount)) return '—';
    const converted = eurAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [initialProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        (p.keyGenes || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [initialProducts, searchQuery, selectedCategory]);

  // Add to order request
  const handleAddToCart = (product, packType) => {
    setCartItems(prev => {
      const current = prev[product.id] || { quantity1x: 0, quantity10x: 0, product };
      const updated = {
        ...current,
        [packType === '10x' ? 'quantity10x' : 'quantity1x']: current[packType === '10x' ? 'quantity10x' : 'quantity1x'] + 1
      };
      return { ...prev, [product.id]: updated };
    });
    toast.success(`Added ${product.name} (${packType === '10x' ? 'Pack ×10' : '1 Kit'}) to proforma request ✓`);
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity1x + (item.quantity10x * 10), 0);
  }, [cartItems]);

  const totalCartValueEur = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const p = item.product;
      const unit = isWholesaler ? p.wholesalePriceEur : (isClinicOrDoctor ? p.clinicPriceEur : p.retailPriceEur);
      const pack10 = isWholesaler ? (p.wholesalePriceEur * 10 * 0.85) : (p.clinicPriceEur * 10 * 0.90);
      const v1x = (item.quantity1x || 0) * (unit || 0);
      const v10x = (item.quantity10x || 0) * pack10;
      return sum + v1x + v10x;
    }, 0);
  }, [cartItems, isWholesaler, isClinicOrDoctor]);

  const handleShareSchedule = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('24Genetics Official Price Schedule link copied ✓');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      toast.error('Please enter name, email and phone number');
      return;
    }
    if (Object.keys(cartItems).length === 0) {
      toast.error('Your order request is empty.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const itemsPayload = Object.values(cartItems).map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity1x: item.quantity1x,
        quantity10x: item.quantity10x,
        totalKits: item.quantity1x + (item.quantity10x * 10),
        unitPriceEur: isWholesaler ? item.product.wholesalePriceEur : item.product.clinicPriceEur
      }));

      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: orderForm,
          items: itemsPayload,
          source: 'public_24genetics_price_schedule',
          totalAmountEur: totalCartValueEur,
          currency: 'EUR'
        })
      });

      if (!res.ok) throw new Error('Order submission failed');

      toast.success('Proforma request submitted successfully! Confirmation sent to your email.');
      setCartItems({});
      setIsOrderDrawerOpen(false);
    } catch (err) {
      toast.error('Unable to send order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Columns definition with strict login-dependent visibility
  const columns = useMemo(() => {
    const cols = [
      {
        key: 'sku',
        label: 'SKU / Code',
        width: '12%',
        sortable: true,
        render: (val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
            <CopyableId value={val || row.id} />
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 650,
              color: '#0369a1',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              {row.category}
            </span>
          </div>
        )
      },
      {
        key: 'name',
        label: 'Genomic Test / Clinical Panel',
        width: (canViewCost && showCostBasis) ? '30%' : '36%',
        sortable: true,
        render: (_, row) => (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.90rem', color: '#0f172a' }}>
              {row.name}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
              {row.subtitle}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 650,
                color: '#475569',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {row.sampleType}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 650,
                color: '#0d9488',
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {row.snpsCount}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                TAT: {row.turnaroundTime}
              </span>
            </div>
          </div>
        )
      }
    ];

    // Optional Landed Cost basis (Admin only)
    if (canViewCost && showCostBasis) {
      cols.push({
        key: 'costPriceEur',
        label: 'Lab Cost (Madrid)',
        width: '12%',
        sortable: true,
        render: (val, row) => (
          <div style={{ fontFamily: 'monospace' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 650,
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {formatPrice(val ?? row.costPriceEur)}
            </span>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>
              Pack 10: {formatPrice(row.costPack10Eur)}
            </div>
          </div>
        )
      });
    }

    // Wholesale B2B Tier (Locked for Guests and Clinics; Unlocked for Wholesalers & Admins)
    cols.push({
      key: 'wholesalePriceEur',
      label: 'Wholesale B2B (1 Kit)',
      width: (canViewCost && showCostBasis) ? '16%' : '18%',
      sortable: true,
      render: (val, row) => {
        if (!isWholesaler) {
          return (
            <Link
              href="/login?redirect=/pricing/24genetics&tier=wholesale"
              className="b2b-lock-pill"
              title="Sign in with verified wholesale credentials to view volume B2B distributor pricing"
            >
              <Lock size={12} className="text-slate-400" />
              <span>B2B Rate Protected</span>
            </Link>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 750, color: '#0f766e', fontSize: '0.90rem' }}>
              {formatPrice(val ?? row.wholesalePriceEur)}
            </span>
            {row.costPack10Eur && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 650,
                color: '#065f46',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1px 5px',
                borderRadius: '4px',
                width: 'fit-content'
              }}>
                Pack ×10: {formatPrice((val ?? row.wholesalePriceEur) * 0.85)} / kit
              </span>
            )}
          </div>
        );
      }
    });

    // Clinic / Practitioner Price (Locked for Guests; Unlocked for Clinics, Wholesalers & Admins)
    cols.push({
      key: 'clinicPriceEur',
      label: 'Clinic / Doctor',
      width: (canViewCost && showCostBasis) ? '16%' : '18%',
      sortable: true,
      render: (val, row) => {
        if (!isClinicOrDoctor) {
          return (
            <Link
              href="/login?redirect=/pricing/24genetics&tier=clinic"
              className="b2b-lock-pill"
              title="Sign in with verified medical practitioner credentials to view clinic pricing"
            >
              <Lock size={12} className="text-slate-400" />
              <span>Clinic Rate Protected</span>
            </Link>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 750, color: '#1d4ed8', fontSize: '0.92rem' }}>
              {formatPrice(val ?? row.clinicPriceEur)}
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 650,
              color: '#1e40af',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '1px 5px',
              borderRadius: '4px',
              width: 'fit-content'
            }}>
              Professional Rate
            </span>
          </div>
        );
      }
    });

    // Retail MSRP (Always visible to everyone)
    cols.push({
      key: 'retailPriceEur',
      label: 'Retail MSRP',
      width: '16%',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 750, color: '#0f172a', fontSize: '0.92rem' }}>
            {formatPrice(val ?? row.retailPriceEur)}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Recommended Patient Price
          </span>
        </div>
      )
    });

    return cols;
  }, [formatPrice, isClinicOrDoctor, isWholesaler, canViewCost, showCostBasis]);

  // Master-Detail Expandable View (Rule #4)
  const renderExpandedRow = useCallback((row) => (
    <div style={{
      padding: '1.25rem 1.5rem',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.25rem'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Dna size={15} className="text-sky-600" />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
            Target Genes & Analytical SNPs
          </span>
        </div>
        <p style={{ fontSize: '0.80rem', color: '#475569', lineHeight: 1.5, margin: 0, fontFamily: 'monospace', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          {row.keyGenes}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <FlaskConical size={15} className="text-teal-600" />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
            Compounding Studio & Protocol Synergy
          </span>
        </div>
        <p style={{ fontSize: '0.80rem', color: '#475569', lineHeight: 1.4, margin: '0 0 8px 0' }}>
          {row.compoundingSynergy}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/compounding"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 650,
              color: '#0284c7',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '4px 8px',
              borderRadius: '4px',
              textDecoration: 'none'
            }}
          >
            <span>Open Compounding Studio</span>
            <ExternalLink size={11} />
          </Link>
          {row.id === 'skin' && (
            <Link
              href="/pricing/colway-hair"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 650,
                color: '#0d9488',
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '4px 8px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              <span>Pair with Colway Trichology Protocol</span>
              <ExternalLink size={11} />
            </Link>
          )}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Award size={15} className="text-amber-600" />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
            CE-IVD Lab Specifications
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
          <div>• Laboratory: 24Genetics S.L. (Madrid, Spain · EU CE-IVD)</div>
          <div>• Technology: Illumina Global Screening Array (GSA)</div>
          <div>• Sample Collection: Non-invasive Buccal Swab / Saliva</div>
          <div>• Direct Kit Order: Ready for institutional procurement</div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={() => handleAddToCart(row, '1x')}
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShoppingCart size={12} />
            <span>Add Kit to Proforma Request</span>
          </button>
        </div>
      </div>
    </div>
  ), []);

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
            <span className="nav-current">24Genetics Clinical Panels</span>
          </div>

          <div className="nav-actions">
            <div className="currency-selector">
              <span>Display FX:</span>
              <div className="pill-group">
                {['EUR', 'USD', 'AED'].map((curr) => (
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
                cursor: 'pointer'
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
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
        {/* Breadcrumbs & Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Breadcrumb items={[
            { label: 'B2B Portal', href: '/' },
            { label: 'Official Price Schedules', href: '/pricing/24genetics' },
            { label: '24Genetics DNA Panels' }
          ]} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: '#0d9488',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Official Clinical Genomics Schedule
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: '#0369a1',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  CE-IVD Certified European Laboratory
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                24Genetics Clinical DNA Panels & AI Connect
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', maxWidth: '750px' }}>
                Official wholesale schedule for saliva-based DNA test kits. Direct integration with our Nutrigenomic Compounding Laboratory to formulate patient-specific therapies based on individual genetic predispositions.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {canViewCost && (
                <button
                  onClick={() => setShowCostBasis(prev => !prev)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 650,
                    background: showCostBasis ? '#fef2f2' : '#ffffff',
                    border: '1px solid',
                    borderColor: showCostBasis ? '#fca5a5' : '#cbd5e1',
                    color: showCostBasis ? '#b91c1c' : '#475569',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {showCostBasis ? 'Hide Lab Cost Basis' : 'View Lab Cost Basis (Admin)'}
                </button>
              )}
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

        {/* ── Role Banner (Informed Login UX) ── */}
        <div style={{
          marginBottom: '1.25rem',
          padding: '10px 14px',
          borderRadius: '8px',
          background: isGuest ? '#fffbeb' : (isClinicOrDoctor ? '#f0fdfa' : '#f8fafc'),
          border: `1px solid ${isGuest ? '#fef3c7' : (isClinicOrDoctor ? '#ccfbf1' : '#e2e8f0')}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isGuest ? (
              <Lock size={16} className="text-amber-600" />
            ) : (
              <ShieldCheck size={16} className={isClinicOrDoctor ? 'text-teal-600' : 'text-slate-600'} />
            )}
            <span style={{ fontSize: '0.80rem', color: isGuest ? '#92400e' : '#334155', fontWeight: 600 }}>
              {isGuest && (
                <>
                  Viewing <strong>Public Retail MSRP Schedule</strong>. Are you a verified clinic, physician or distributor?{' '}
                  <Link href="/login?redirect=/pricing/24genetics" style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 700 }}>
                    Sign in here
                  </Link>{' '}
                  to unlock professional B2B pricing.
                </>
              )}
              {!isGuest && isClinicOrDoctor && !isWholesaler && (
                <>
                  Authenticated as <strong>Clinical Practitioner</strong>. Professional Clinic Price Schedule is unlocked.
                </>
              )}
              {!isGuest && isWholesaler && (
                <>
                  Authenticated as <strong>Wholesaler / Distributor</strong>. Volume B2B Wholesale Pricing is unlocked.
                </>
              )}
            </span>
          </div>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '4px',
            background: isGuest ? '#fef3c7' : '#e0f2fe',
            color: isGuest ? '#b45309' : '#0369a1'
          }}>
            Active Tier: {isGuest ? 'Retail (Public)' : (isWholesaler ? 'Wholesaler B2B' : 'Clinic / Doctor')}
          </span>
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
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#0d9488',
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {scopeMode === 'filtered' ? `Matching Active Filters (${filteredProducts.length} Panels)` : `Entire Database (${initialProducts.length} Panels & Subscriptions)`}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Metrics Scope:</span>
              <div className="pill-group" style={{ background: '#f1f5f9' }}>
                <button
                  onClick={() => setScopeMode('filtered')}
                  className={`pill-btn ${scopeMode === 'filtered' ? 'active' : ''}`}
                  style={{ color: scopeMode === 'filtered' ? '#0d9488' : '#64748b' }}
                >
                  Filtered View
                </button>
                <button
                  onClick={() => setScopeMode('global')}
                  className={`pill-btn ${scopeMode === 'global' ? 'active' : ''}`}
                  style={{ color: scopeMode === 'global' ? '#0d9488' : '#64748b' }}
                >
                  Global Database
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Total Genomic Panels
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {scopeMode === 'filtered' ? filteredProducts.length : initialProducts.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '2px' }}>
                Saliva Swab CE-IVD Kits
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Genomic Coverage
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                +700,000
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
                Illumina GSA SNPs Analyzed
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
                Pack ×10 Box Orders
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                Turnaround Time
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                3-4 Wks
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                Certified EU Laboratory (Madrid)
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Search & Filters (Golden Rule #7) ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search panels by name, genes or category (e.g. All-in-One, Pharmacogenetics, Skin, MTHFR, CYP450)..."
            size="lg"
            resultCount={filteredProducts.length}
            filters={
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  const label = cat === 'all' ? `All Panels (${initialProducts.length})` : cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 650,
                        border: '1px solid',
                        cursor: 'pointer',
                        background: active ? '#0f172a' : '#ffffff',
                        color: active ? '#ffffff' : '#475569',
                        borderColor: active ? '#0f172a' : '#cbd5e1'
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            }
          />
        </div>

        {/* ── DataTable with Expandable Master-Detail (Golden Rule #3 & #4) ── */}
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
                icon={Dna}
                title="No genomic panels found"
                subtitle="Try adjusting your keyword search or category filter to discover available tests."
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
              pageSize={20}
              showPagination={true}
              sortable={true}
              expandableRender={renderExpandedRow}
            />
          )}
        </div>
      </main>

      {/* ── Quick Order Proforma Drawer ── */}
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
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
          }}>
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
                  Request 24Genetics B2B Proforma
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Institutional DNA Kits Procurement & CE-IVD Swabs
                </p>
              </div>
              <button
                onClick={() => setIsOrderDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Selected Genomic Tests ({totalCartCount} Kits)
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
                    Your order request is empty. Click "+Kit" or "+Pack ×10" in the table to add tests.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.values(cartItems).map(item => {
                      const p = item.product;
                      const unit = isWholesaler ? p.wholesalePriceEur : (isClinicOrDoctor ? p.clinicPriceEur : p.retailPriceEur);
                      const pack10 = isWholesaler ? (p.wholesalePriceEur * 10 * 0.85) : (p.clinicPriceEur * 10 * 0.90);
                      const subtotal = (item.quantity1x * unit) + (item.quantity10x * pack10);
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
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {item.quantity1x > 0 ? `${item.quantity1x}x Kit ` : ''}
                              {item.quantity10x > 0 ? `${item.quantity10x}x Pack ×10` : ''}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                              {formatPrice(subtotal)}
                            </span>
                            <button
                              onClick={() => {
                                setCartItems(prev => {
                                  const copy = { ...prev };
                                  delete copy[p.id];
                                  return copy;
                                });
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px' }}
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
                      background: '#f0fdfa',
                      borderRadius: '6px',
                      border: '1px solid #ccfbf1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f766e' }}>Estimated Total:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#0f766e' }}>
                        {formatPrice(totalCartValueEur)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitOrder}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Clinic & Delivery Details
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={e => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. Full Name / Lab Director"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Clinic / Institute Name
                    </label>
                    <input
                      type="text"
                      value={orderForm.clinicName}
                      onChange={e => setOrderForm(prev => ({ ...prev, clinicName: e.target.value }))}
                      placeholder="Center for Precision Medicine"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.email}
                        onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="doctor@clinic.com"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={orderForm.phone}
                        onChange={e => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+34 600 000 000"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Delivery Country
                    </label>
                    <input
                      type="text"
                      value={orderForm.country}
                      onChange={e => setOrderForm(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Spain, United Arab Emirates, Mexico, Colombia..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Notes / Custom Branding Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={orderForm.notes}
                      onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any specific clinic delivery requirements or API Connect requests..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder || Object.keys(cartItems).length === 0}
                    style={{
                      marginTop: '0.5rem',
                      padding: '12px',
                      background: Object.keys(cartItems).length === 0 ? '#94a3b8' : '#0d9488',
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <PublicUnifiedFooter />
    </div>
  );
}

