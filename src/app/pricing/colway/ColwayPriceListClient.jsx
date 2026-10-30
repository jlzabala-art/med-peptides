'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Share2,
  Copy,
  Check,
  Activity,
  Download,
  Building2,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Layers,
  Search,
  Filter,
  Package,
  Calendar,
  AlertCircle,
  FileText,
  BadgeCheck,
  MessageCircle,
  ArrowRight,
  Sliders,
  DollarSign,
  Coins,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  LogIn,
  User,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import InlineEditableCell from '@/components/ui/InlineEditableCell';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import './ColwayPriceList.css';

export default function ColwayPriceListClient({ initialProducts = [], initialCategory = 'all', isHairLineFocus = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const { is, effectiveRole } = useRoleAccess();

  const isAdmin = is('admin');
  const isWholesaler = is('wholesaler') || isAdmin;
  const isClinicOrDoctor = is('doctor') || is('clinic') || is('fagron_clinic') || is('medical_director') || isWholesaler;
  const isGuest = !user || effectiveRole === 'guest';
  const canViewLanded = Boolean(isAdmin);

  const [markupPct, setMarkupPct] = useState(15); // Default 15% requested by user
  const [currency, setCurrency] = useState('AED'); // AED, USD, EUR
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22 Scope Switcher)
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTier, setExportTier] = useState('master'); // 'master' | 'clinic'
  const [itemOverrides, setItemOverrides] = useState({}); // Per-product custom margin/price overrides
  const [showLandedCost, setShowLandedCost] = useState(false); // Toggle Landed Cost CIF visibility (restricted to admins)

  // FX peg rates for UAE: 1 USD = 3.6725 AED, 1 EUR ~ 3.98 AED
  const fxRate = useMemo(() => {
    if (currency === 'USD') return 1 / 3.6725;
    if (currency === 'EUR') return 1 / 3.98;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return 'AED ';
  }, [currency]);

  const formatPrice = useCallback((aedAmount) => {
    if (aedAmount == null || isNaN(aedAmount)) return '—';
    const converted = aedAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  // Handler for bidirectional price & margin updates (Golden Rule #5)
  const handleUpdateProductPrice = useCallback((productId, tier, newPrice) => {
    const numPrice = Number(newPrice);
    if (isNaN(numPrice) || numPrice < 0) return;
    // convert from active display currency back to AED base
    const priceInAed = numPrice / fxRate;

    setItemOverrides((prev) => {
      const existing = prev[productId] || {};
      const prod = initialProducts.find((p) => p.id === productId);
      const landed = prod?.landedCostAed || 1;

      if (tier === 'wholesale') {
        const markup = Number((((priceInAed - landed) / landed) * 100).toFixed(1));
        return { ...prev, [productId]: { ...existing, wholesalePrice: priceInAed, wholesaleMarkupPct: markup } };
      }
      if (tier === 'clinic') {
        const wholesale = existing.wholesalePrice ?? Number((landed * (1 + (existing.wholesaleMarkupPct ?? markupPct) / 100)).toFixed(2));
        const margin = wholesale > 0 ? Number((((priceInAed - wholesale) / wholesale) * 100).toFixed(1)) : 25;
        return { ...prev, [productId]: { ...existing, clinicPrice: priceInAed, clinicMarginPct: margin } };
      }
      if (tier === 'retail') {
        const wholesale = existing.wholesalePrice ?? Number((landed * (1 + (existing.wholesaleMarkupPct ?? markupPct) / 100)).toFixed(2));
        const clinic = existing.clinicPrice ?? Number((wholesale * 1.25).toFixed(2));
        const margin = clinic > 0 ? Number((((priceInAed - clinic) / clinic) * 100).toFixed(1)) : 30;
        return { ...prev, [productId]: { ...existing, retailPrice: priceInAed, retailMarginPct: margin } };
      }
      return prev;
    });
    toast.success('Price updated & margins recalculated ✓');
  }, [fxRate, initialProducts, markupPct]);

  const handleUpdateProductMargin = useCallback((productId, tier, newMargin) => {
    const numMargin = Number(newMargin);
    if (isNaN(numMargin) || numMargin < 0) return;

    setItemOverrides((prev) => {
      const existing = prev[productId] || {};
      const prod = initialProducts.find((p) => p.id === productId);
      const landed = prod?.landedCostAed || 0;

      if (tier === 'wholesale') {
        const price = Number((landed * (1 + numMargin / 100)).toFixed(2));
        return { ...prev, [productId]: { ...existing, wholesaleMarkupPct: numMargin, wholesalePrice: price } };
      }
      if (tier === 'clinic') {
        const wholesale = existing.wholesalePrice ?? Number((landed * (1 + (existing.wholesaleMarkupPct ?? markupPct) / 100)).toFixed(2));
        const price = Number((wholesale * (1 + numMargin / 100)).toFixed(2));
        return { ...prev, [productId]: { ...existing, clinicMarginPct: numMargin, clinicPrice: price } };
      }
      if (tier === 'retail') {
        const wholesale = existing.wholesalePrice ?? Number((landed * (1 + (existing.wholesaleMarkupPct ?? markupPct) / 100)).toFixed(2));
        const clinic = existing.clinicPrice ?? Number((wholesale * 1.25).toFixed(2));
        const price = Number((clinic * (1 + numMargin / 100)).toFixed(2));
        return { ...prev, [productId]: { ...existing, retailMarginPct: numMargin, retailPrice: price } };
      }
      return prev;
    });
    toast.success('Margin updated & price recalculated ✓');
  }, [initialProducts, markupPct]);

  const handleResetOverrides = useCallback(() => {
    setItemOverrides({});
    toast.success('Pricing reset to default standard schedule ✓');
  }, []);

  const hasCustomOverrides = Object.keys(itemOverrides).length > 0;

  // Filtered and calculated products based on fixed wholesale markup + itemOverrides (Strictly no combos)
  const processedProducts = useMemo(() => {
    const standaloneOnly = initialProducts.filter((p) => {
      const id = (p.id || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const isCombo =
        p.isCombo === true ||
        p.isBundle === true ||
        id.startsWith('bundle-') ||
        id.includes('combo') ||
        name.includes('ritual') ||
        name.includes('bundle') ||
        name.includes('combo') ||
        name.includes('set ') ||
        cat.includes('bundle') ||
        cat.includes('combo');
      return !isCombo;
    });

    return standaloneOnly.map((p, index) => {
      const landed = p.landedCostAed || 0;
      const overrides = itemOverrides[p.id] || {};

      // 1. Wholesaler Level
      let wholesaleMarkupPct = overrides.wholesaleMarkupPct !== undefined ? overrides.wholesaleMarkupPct : markupPct;
      let wholesale = overrides.wholesalePrice !== undefined
        ? overrides.wholesalePrice
        : Number((landed * (1 + wholesaleMarkupPct / 100)).toFixed(2));
      if (overrides.wholesalePrice !== undefined && landed > 0) {
        wholesaleMarkupPct = Number((((wholesale - landed) / landed) * 100).toFixed(1));
      }
      const marginAed = Number((wholesale - landed).toFixed(2));
      const marginPctVal = wholesale > 0 ? Number(((marginAed / wholesale) * 100).toFixed(1)) : 0;

      // 2. Recommended Clinic Price (default +25% over Wholesaler Price)
      let clinicMarginPct = overrides.clinicMarginPct !== undefined ? overrides.clinicMarginPct : 25;
      let recommendedClinic = overrides.clinicPrice !== undefined
        ? overrides.clinicPrice
        : Number((wholesale * (1 + clinicMarginPct / 100)).toFixed(2));
      if (overrides.clinicPrice !== undefined && wholesale > 0) {
        clinicMarginPct = Number((((recommendedClinic - wholesale) / wholesale) * 100).toFixed(1));
      }

      // 3. Recommended Retail MSRP (default +30% over Clinic Price)
      let retailMarginPct = overrides.retailMarginPct !== undefined ? overrides.retailMarginPct : 30;
      let recommendedRetail = overrides.retailPrice !== undefined
        ? overrides.retailPrice
        : Number((recommendedClinic * (1 + retailMarginPct / 100)).toFixed(2));
      if (overrides.retailPrice !== undefined && recommendedClinic > 0) {
        retailMarginPct = Number((((recommendedRetail - recommendedClinic) / recommendedClinic) * 100).toFixed(1));
      }

      return {
        ...p,
        itemNumber: index + 1,
        calculatedLanded: landed,
        calculatedWholesale: wholesale,
        calculatedWholesaleMarkupPct: wholesaleMarkupPct,
        calculatedMarginAed: marginAed,
        calculatedMarginPct: marginPctVal,
        recommendedClinic,
        calculatedClinicMarginPct: clinicMarginPct,
        recommendedRetail,
        calculatedRetailMarginPct: retailMarginPct,
        hasCustomOverride: Boolean(itemOverrides[p.id])
      };
    });
  }, [initialProducts, markupPct, itemOverrides]);

  const filteredProducts = useMemo(() => {
    return processedProducts.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.keyActives && p.keyActives.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [processedProducts, searchQuery, selectedCategory]);

  const hasActiveFilters = Boolean(searchQuery || selectedCategory !== 'all');
  const kpiSourceProducts = (scopeMode === 'filtered' && hasActiveFilters) ? filteredProducts : processedProducts;

  // Aggregate Totals (respecting Scope Switcher per Rule #22)
  const totals = useMemo(() => {
    const totalLanded = kpiSourceProducts.reduce((sum, p) => sum + p.calculatedLanded, 0);
    const totalWholesale = kpiSourceProducts.reduce((sum, p) => sum + p.calculatedWholesale, 0);
    const totalMargin = Number((totalWholesale - totalLanded).toFixed(2));
    const avgMarginPct = totalWholesale > 0 ? Number(((totalMargin / totalWholesale) * 100).toFixed(1)) : 0;
    return { totalLanded, totalWholesale, totalMargin, avgMarginPct, count: kpiSourceProducts.length };
  }, [kpiSourceProducts]);

  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [initialProducts]);

  // DataTable column definitions (Rules #3, #5, #8, #11, #30: Google Cloud UX standard)
  const colwayColumns = useMemo(() => {
    const cols = [
      {
        key: 'itemNumber',
        label: '#',
        width: '3%',
        sortable: true,
        render: (val, row) => (
          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            {val ?? row?.itemNumber}
          </span>
        )
      },
      {
        key: 'sku',
        label: 'SKU',
        width: '11%',
        sortable: true,
        render: (val, row) => {
          // Simplify SKU: remove the 'SKU-COLWAY-' prefix to keep it compact
          const rawSku = val ?? row?.sku ?? '';
          const simpleSku = rawSku.replace(/^SKU-COLWAY-/i, '');
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
              <CopyableId value={simpleSku} />
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 650,
                color: '#0d9488',
                background: '#f0fdfa',
                border: '1px solid #a7f3d0',
                padding: '1px 6px',
                borderRadius: '4px',
                letterSpacing: '0.02em',
                textTransform: 'lowercase'
              }}>
                {row?.category}
              </span>
            </div>
          );
        }
      },
      {
        key: 'name',
        label: 'Product',
        width: (canViewLanded && showLandedCost) ? '28%' : '34%',
        sortable: true,
        render: (_, row) => {
          const detailUrl = `/p/${row.slug || row.id}`;
          return (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(detailUrl);
              }}
              title="Click to view detailed clinical formulation & product specs"
            >
              {row?.image && (
                <img
                  src={row.image}
                  alt={row.name}
                  style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    maxWidth: '42px',
                    minHeight: '42px',
                    maxHeight: '42px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '2px',
                    flexShrink: 0
                  }}
                  loading="lazy"
                />
              )}
              <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                  {row?.name}
                </span>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                  <span>View Details</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>
          );
        }
      },
      {
        key: 'volume',
        label: 'Size',
        width: '10%',
        sortable: true,
        render: (val, row) => (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#0369a1',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '2px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            display: 'inline-block'
          }}>
            {val ?? row?.volume}
          </span>
        )
      }
    ];

    if (canViewLanded && showLandedCost) {
      cols.push({
        key: 'calculatedLanded',
        label: 'CIF Landed (Dubai)',
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
              {formatPrice(val ?? row?.calculatedLanded)}
            </span>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>Cost Basis</div>
          </div>
        )
      });
    }

    cols.push({
      key: 'calculatedWholesale',
        label: canViewLanded ? `Wholesaler (+${markupPct}% Net)` : 'Wholesaler Price',
        width: (canViewLanded && showLandedCost) ? '15%' : '16%',
        sortable: true,
        render: (val, row) => {
          if (!isWholesaler) {
            return (
              <Link
                href="/login?redirect=/pricing/colway&tier=wholesale"
                className="b2b-lock-pill"
                title="Sign in with verified wholesale credentials to view volume pricing"
              >
                <Lock size={12} className="text-slate-400" />
                <span>B2B Rate Protected</span>
              </Link>
            );
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {isAdmin ? (
                <InlineEditableCell
                  value={Number(((val ?? row?.calculatedWholesale) * fxRate).toFixed(2))}
                  type="number"
                  prefix={currencySymbol}
                  onSave={async (newVal) => handleUpdateProductPrice(row.id, 'wholesale', newVal)}
                  format={(v) => formatPrice(v / fxRate)}
                />
              ) : (
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f766e', fontSize: '0.88rem' }}>
                  {formatPrice(val ?? row?.calculatedWholesale)}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                {canViewLanded && (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    color: '#047857',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    +{row?.calculatedWholesaleMarkupPct}% Net
                  </span>
                )}
                {row?.hasCustomOverride && canViewLanded && (
                  <span style={{ fontSize: '0.60rem', fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '1px 4px', borderRadius: '3px' }}>custom</span>
                )}
              </div>
            </div>
          );
        }
      },
      {
        key: 'recommendedClinic',
        label: 'Recommended Clinic',
        width: (canViewLanded && showLandedCost) ? '14%' : '14%',
        sortable: true,
        render: (val, row) => {
          if (!isClinicOrDoctor) {
            return (
              <Link
                href="/login?redirect=/pricing/colway&tier=clinic"
                className="b2b-lock-pill"
                title="Sign in with verified clinic or doctor credentials to view professional pricing"
              >
                <Lock size={12} className="text-slate-400" />
                <span>Clinic Rate Protected</span>
              </Link>
            );
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {isAdmin ? (
                <InlineEditableCell
                  value={Number(((val ?? row?.recommendedClinic) * fxRate).toFixed(2))}
                  type="number"
                  prefix={currencySymbol}
                  onSave={async (newVal) => handleUpdateProductPrice(row.id, 'clinic', newVal)}
                  format={(v) => formatPrice(v / fxRate)}
                />
              ) : (
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', fontSize: '0.88rem' }}>
                  {formatPrice(val ?? row?.recommendedClinic)}
                </span>
              )}
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 650,
                color: '#1d4ed8',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '1px 5px',
                borderRadius: '4px',
                width: 'fit-content'
              }}>
                +{row?.calculatedClinicMarginPct}% Clinic
              </span>
            </div>
          );
        }
      },
      {
        key: 'recommendedRetail',
        label: 'Retail MSRP',
        width: (canViewLanded && showLandedCost) ? '14%' : '14%',
        sortable: true,
        render: (val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {isAdmin ? (
              <InlineEditableCell
                value={Number(((val ?? row?.recommendedRetail) * fxRate).toFixed(2))}
                type="number"
                prefix={currencySymbol}
                onSave={async (newVal) => handleUpdateProductPrice(row.id, 'retail', newVal)}
                format={(v) => formatPrice(v / fxRate)}
              />
            ) : (
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.90rem' }}>
                {formatPrice(val ?? row?.recommendedRetail)}
              </span>
            )}
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 650,
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '1px 5px',
              borderRadius: '4px',
              width: 'fit-content'
            }}>
              MSRP / Retail
            </span>
          </div>
        )
      }
    );
    return cols;
  }, [
    isWholesaler,
    isClinicOrDoctor,
    isAdmin,
    canViewLanded,
    showLandedCost,
    formatPrice,
    fxRate,
    currencySymbol,
  ]);

  const handlePrint = () => {
    setIsExportModalOpen(false);
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportCSV = (tier = exportTier) => {
    setIsExportModalOpen(false);
    const isMaster = tier === 'master';

    const headers = isMaster
      ? [
          '#',
          'SKU Code',
          'Product Name',
          'Subtitle',
          'Category',
          'Presentation',
          `Landed Cost CIF Dubai (${currency})`,
          `Wholesale B2B (+${markupPct}%) (${currency})`,
          `Wholesaler Margin (${currency})`,
          'Wholesaler Margin (%)',
          `Recommended Clinic Price (${currency})`,
          `Recommended Retail MSRP (${currency})`,
          'Key Bioactive Compounds',
          'Clinical Indication & Protocol',
          'Stock Status'
        ]
      : [
          '#',
          'SKU Code',
          'Product Name',
          'Subtitle',
          'Category',
          'Presentation',
          `Wholesale B2B Price (${currency})`,
          `Recommended Clinic Price (${currency})`,
          `Recommended Retail MSRP (${currency})`,
          'Key Bioactive Compounds',
          'Clinical Indication & Protocol',
          'Stock Status'
        ];

    const rows = filteredProducts.map((p) => {
      const landed = (p.calculatedLanded * fxRate).toFixed(2);
      const wholesale = (p.calculatedWholesale * fxRate).toFixed(2);
      const margin = (p.calculatedMarginAed * fxRate).toFixed(2);
      const clinic = ((p.clinicPriceAed || 0) * fxRate).toFixed(2);
      const retail = ((p.retailPriceAed || 0) * fxRate).toFixed(2);

      if (isMaster) {
        return [
          p.itemNumber,
          p.sku,
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${(p.subtitle || '').replace(/"/g, '""')}"`,
          `"${(p.category || '').replace(/"/g, '""')}"`,
          `"${(p.volume || '').replace(/"/g, '""')}"`,
          landed,
          wholesale,
          margin,
          `${p.calculatedMarginPct}%`,
          clinic,
          retail,
          `"${(p.keyActives || '').replace(/"/g, '""')}"`,
          `"${(p.clinicalFocus || '').replace(/"/g, '""')}"`,
          `"${(p.stockStatus || 'In Stock (Dubai)').replace(/"/g, '""')}"`
        ];
      }

      return [
        p.itemNumber,
        p.sku,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.subtitle || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.volume || '').replace(/"/g, '""')}"`,
        wholesale,
        clinic,
        retail,
        `"${(p.keyActives || '').replace(/"/g, '""')}"`,
        `"${(p.clinicalFocus || '').replace(/"/g, '""')}"`,
        `"${(p.stockStatus || 'In Stock (Dubai)').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Colway_UAE_Price_Schedule_${isMaster ? 'Master_B2B' : 'Clinic_Catalog'}_${currency}_${markupPct}pct_${dateStr}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename} successfully! ✓`);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Colway Price Sheet link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*COLWAY CLINICAL DERMA — OFFICIAL UAE B2B WHOLESALE SCHEDULE*\n` +
      `Authorized Clinic & Wholesaler Pricing (Dubai Warehouse):\n\n` +
      processedProducts.map(p => `• ${p.name} (${p.volume}): AED ${p.calculatedWholesale.toFixed(2)}`).join('\n') +
      `\n\nFull official datasheet & verified catalog:\n${typeof window !== 'undefined' ? window.location.href : 'https://www.atlashealth-services.com/pricing/colway'}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="colway-price-root">
      {/* ── Screen-Only Interactive Navigation Bar ── */}
      <nav className="screen-nav-bar no-print">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand">
              <Building2 size={18} className="text-teal-400" />
              <span>Atlas Health Services</span>
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-section">B2B Wholesale</span>
            <span className="nav-divider">/</span>
            <span className="nav-current">Colway UAE Price Schedule</span>
          </div>

          <div className="nav-actions">
            <div className="currency-selector">
              <span className="control-label">Currency:</span>
              <div className="pill-group">
                {['AED', 'USD', 'EUR'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`pill-btn ${currency === cur ? 'pill-active' : ''}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCopyLink} className="action-btn action-ghost" title="Copy shareable link">
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button onClick={handleWhatsAppShare} className="action-btn action-whatsapp" title="Share via WhatsApp">
              <MessageCircle size={16} />
              <span>Share</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="action-btn action-export"
              title="Export in PDF or Excel / CSV format"
            >
              <Download size={16} />
              <span>Export</span>
            </button>

            <button onClick={handlePrint} className="action-btn action-primary" title="Print this Price Sheet">
              <Printer size={16} />
              <span>Print</span>
            </button>

            {/* Login / Portal CTA Button (GCP Standard) */}
            {user ? (
              <Link
                href={isAdmin ? '/admin' : isProfessional ? '/doctor' : '/dashboard'}
                className="action-btn action-login"
                title={isAdmin ? 'Admin Console' : 'Workspace Portal'}
              >
                <User size={15} />
                <span>{isAdmin ? 'Admin' : 'Portal'}</span>
              </Link>
            ) : (
              <Link
                href="/login?redirect=/pricing/colway"
                className="action-btn action-login"
                title="Sign in to your verified clinical or wholesale account"
              >
                <LogIn size={15} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="price-sheet-container">
        {/* ── Document Official Header ── */}
        <header className="document-header">
          <div className="header-meta-row">
            <div className="institutional-identity">
              <div className="brand-pairing">
                <div className="brand-pill-atlas">ATLAS HEALTH</div>
                <span className="partner-cross">×</span>
                <div className="brand-pill-colway">COLWAY CLINICAL DERMA</div>
              </div>
              <h1 className="document-title">
                COLWAY CLINICAL CELLULAR & TRICHOLOGY PORTFOLIO
              </h1>
              <p className="document-subtitle">
                Official UAE B2B Wholesaler Price Schedule · Biologically Active Collagen & Peptides
              </p>
            </div>

            <div className="document-stamp-box">
              <div className="stamp-item">
                <span className="stamp-label">DOCUMENT REF:</span>
                <span className="stamp-value font-mono">DOC-UAE-COL-2026-V1</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">TERRITORY:</span>
                <span className="stamp-value">United Arab Emirates (Dubai / GCC)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">PRICING BASIS:</span>
                <span className="stamp-value">Official B2B Wholesale Ex-Warehouse Dubai (excl. 5% VAT)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">SCHEDULE TIER:</span>
                <span className="stamp-value text-emerald-600 font-bold">Authorized Clinic & Wholesaler</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">EFFECTIVE DATE:</span>
                <span className="stamp-value">October 2026 · Active & Verified</span>
              </div>
            </div>
          </div>

          <div className="regulatory-banner">
            <div className="regulatory-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
              <AlertCircle size={14} className="text-amber-500" />
              <span><strong>No Direct Purchase:</strong> Informational B2B Wholesale Schedule (Online checkout disabled)</span>
            </div>
            <div className="regulatory-item">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span><strong>Native Tropocollagen:</strong> Intact triple-helix conformation preserved &lt;26°C</span>
            </div>
            <div className="regulatory-item">
              <BadgeCheck size={14} className="text-sky-500" />
              <span><strong>Origin:</strong> European Union (Poland) · ISO 22716 / cGMP Certified</span>
            </div>
            <div className="regulatory-item">
              <FileText size={14} className="text-amber-500" />
              <span><strong>Tax Compliance:</strong> Prices net of 5% UAE VAT (FTA Compliant)</span>
            </div>
          </div>
        </header>

        {/* ── Role Banner (Informed Login UX) ── */}
        <div className="no-print" style={{
          marginBottom: '1rem',
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
                  Viewing <strong>Public Retail MSRP Schedule</strong>. Are you a registered clinic, trichologist or wholesaler?{' '}
                  <Link href="/login?redirect=/pricing/colway" style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 700 }}>
                    Sign in here
                  </Link>{' '}
                  to view verified professional B2B pricing.
                </>
              )}
              {!isGuest && isClinicOrDoctor && !isWholesaler && (
                <>
                  Authenticated as <strong>Doctor / Clinic Practitioner</strong>. Professional Clinic Price Schedule is unlocked.
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

        {/* ── Scope Indicator & Switcher (Golden Rule #22) ── */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '3px 10px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
            {scopeMode === 'filtered' && hasActiveFilters
              ? `Matching Active Filters (${filteredProducts.length} items)`
              : `Entire Database (Unfiltered · ${processedProducts.length} items)`}
          </span>
          {hasActiveFilters && (
            <div style={{ display: 'inline-flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setScopeMode('filtered')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: scopeMode === 'filtered' ? '#0284c7' : 'transparent',
                  color: scopeMode === 'filtered' ? '#fff' : '#475569'
                }}
              >
                Applied Filters View
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('global')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: scopeMode === 'global' ? '#0284c7' : 'transparent',
                  color: scopeMode === 'global' ? '#fff' : '#475569'
                }}
              >
                Global Database View
              </button>
            </div>
          )}
        </div>

        {/* ── KPI Summary Cards (Role-Adaptive — Rule #22) ── */}
        <section className="kpi-grid">
          {isGuest && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-blue-500/10 text-blue-500">
                  <Package size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Curated Formulations</div>
                  <div className="kpi-value">{totals.count} Active Systems</div>
                  <div className="kpi-sub">Trichology, Vege Collagen &amp; Derma</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Bioactive Conformation</div>
                  <div className="kpi-value text-emerald-600">Native Tropocollagen</div>
                  <div className="kpi-sub">Preserved triple-helix &lt;26°C</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-indigo-500/10 text-indigo-500">
                  <Building2 size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Dispatch Hub</div>
                  <div className="kpi-value">Dubai Warehouse</div>
                  <div className="kpi-sub">Immediate GCC cold-chain delivery</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-sky-500/10 text-sky-500">
                  <BadgeCheck size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Regulatory Standard</div>
                  <div className="kpi-value text-sky-600">EU / ISO 22716</div>
                  <div className="kpi-sub">cGMP Certified · UAE FTA VAT Compliant</div>
                </div>
              </div>
            </>
          )}

          {isClinicOrDoctor && !isWholesaler && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Clinic Margin on MSRP</div>
                  <div className="kpi-value text-emerald-600">~25% – 30% Net</div>
                  <div className="kpi-sub">Recommended clinic markup over wholesale</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-blue-500/10 text-blue-500">
                  <Package size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Stock Availability</div>
                  <div className="kpi-value">100% In Stock</div>
                  <div className="kpi-sub">Guaranteed Dubai cold-chain allocation</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-indigo-500/10 text-indigo-500">
                  <FileText size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Professional Protocols</div>
                  <div className="kpi-value text-indigo-600">{totals.count} Dossiers</div>
                  <div className="kpi-sub">In-clinic and homecare regimens</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-teal-500/10 text-teal-500">
                  <ShieldCheck size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Order Minimum (MOQ)</div>
                  <div className="kpi-value text-teal-600">No Clinic MOQ</div>
                  <div className="kpi-sub">Unitary clinical dispensing enabled</div>
                </div>
              </div>
            </>
          )}

          {isWholesaler && !isAdmin && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-sky-500/10 text-sky-500">
                  <Coins size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Wholesale Portfolio Basket</div>
                  <div className="kpi-value text-sky-600">{formatPrice(totals.totalWholesale)}</div>
                  <div className="kpi-sub">Total 1-unit basket of {totals.count} SKUs</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Gross Margin vs Clinic</div>
                  <div className="kpi-value text-emerald-600">~25% Spread</div>
                  <div className="kpi-sub">Wholesale to clinic distribution spread</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-indigo-500/10 text-indigo-500">
                  <Percent size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Active Volume Tier</div>
                  <div className="kpi-value">+{markupPct}% Net Tier</div>
                  <div className="kpi-sub">Configured partner wholesale rate</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-blue-500/10 text-blue-500">
                  <Building2 size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Logistics Basis</div>
                  <div className="kpi-value">Ex-Warehouse Dubai</div>
                  <div className="kpi-sub">Refrigerated pallet &amp; carton dispatch</div>
                </div>
              </div>
            </>
          )}

          {isAdmin && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-indigo-500/10 text-indigo-500">
                  <Coins size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Portfolio Landed Cost</div>
                  <div className="kpi-value">{formatPrice(totals.totalLanded)}</div>
                  <div className="kpi-sub">Total CIF Dubai acquisition cost</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-sky-500/10 text-sky-500">
                  <Percent size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Portfolio Wholesale Revenue</div>
                  <div className="kpi-value text-sky-600">{formatPrice(totals.totalWholesale)}</div>
                  <div className="kpi-sub">Total wholesale unit basket</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Aggregate Net Margin</div>
                  <div className="kpi-value text-emerald-600">+{formatPrice(totals.totalMargin)}</div>
                  <div className="kpi-sub">{totals.avgMarginPct}% avg margin on wholesale</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap bg-amber-500/10 text-amber-500">
                  <Sliders size={20} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Formula Overrides</div>
                  <div className="kpi-value text-amber-600">{hasCustomOverrides ? 'Custom Rates Active' : 'Standard Formula'}</div>
                  <div className="kpi-sub">+{markupPct}% base wholesale markup</div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Unified GlobalSearchBar + Category Chips & Controls (Rules #7 & #24) ── */}
        <div className="no-print" style={{ marginBottom: '1rem' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Colway formulations by product name, SKU, or active ingredient..."
            resultCount={filteredProducts.length}
            totalCount={processedProducts.length}
            size="lg"
            storageNamespace="colway_uae_pricing"
            filters={selectedCategory !== 'all' ? [{
              key: 'category',
              label: 'Category',
              value: selectedCategory,
              onRemove: () => setSelectedCategory('all')
            }] : []}
          />
        </div>

        <div className="controls-strip no-print">
          <div className="controls-left">
            <div className="category-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'all' ? 'All Formulations' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-right">
            {/* Show/Hide CIF Landed Cost Toggle (Admin Only - Confidential) */}
            {canViewLanded && (
              <button
                type="button"
                onClick={() => setShowLandedCost((prev) => !prev)}
                className={`action-btn ${showLandedCost ? 'action-active' : 'action-ghost'}`}
                style={{
                  fontSize: '0.74rem',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: showLandedCost ? '1px solid #0d9488' : '1px solid #e2e8f0',
                  background: showLandedCost ? '#f0fdfa' : '#ffffff',
                  color: showLandedCost ? '#0d9488' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                title="Toggle Landed Cost CIF Dubai column (Admin View Only)"
              >
                {showLandedCost ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showLandedCost ? 'Hide Landed CIF' : 'Show Landed CIF'}</span>
              </button>
            )}

            {/* Reset Overrides Button if any override exists */}
            {hasCustomOverrides && (
              <button
                type="button"
                onClick={handleResetOverrides}
                style={{
                  fontSize: '0.74rem',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: '1px solid #fde68a',
                  background: '#fffbeb',
                  color: '#b45309',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                title="Reset custom price overrides to default standard schedule"
              >
                <RotateCcw size={14} />
                <span>Reset Overrides</span>
              </button>
            )}

            {/* Fixed Wholesaler Markup Tier (+15% over Landed Cost per Agreement) */}
            <div className="markup-simulator" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '6px 14px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <span className="slider-label" style={{ color: '#166534', fontWeight: 700, margin: 0 }}>
                Wholesaler Tier:
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d', fontFamily: 'monospace' }}>
                +15% sobre coste CIF
              </span>
            </div>

            {/* View Switcher */}
            <div className="view-switcher">
              <button
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table View (Ideal for print and order placement)"
              >
                <FileText size={15} />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                title="Card View (Visual catalog overview)"
              >
                <Layers size={15} />
                <span>Visual</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 1A. Screen-Only Unified DataTable (Rules #3, #4, #11, #30) ── */}
        {viewMode === 'table' && (
          <div className="no-print" style={{ marginBottom: '1.5rem' }}>
            <DataTable
              columns={colwayColumns}
              data={filteredProducts}
              emptyMessage="No Colway formulations match the current filter criteria."
              onRowClick={(row) => router.push(`/p/${row.slug || row.id}`)}
            />
          </div>
        )}

        {/* ── 1B. Print-Only Official Schedule Table (Preserved for A4 @media print) ── */}
        <div className="table-responsive-wrapper print-only-schedule">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="colway-price-table">
              <thead>
                <tr>
                  <th style={{ width: '4%' }} className="text-center">#</th>
                  <th style={{ width: '12%' }}>SKU</th>
                  <th style={{ width: '32%' }}>Product</th>
                  <th style={{ width: '12%' }}>Size</th>
                  <th style={{ width: '14%' }} className="text-right th-highlight">
                    Wholesaler Price <span className="th-sub">(B2B Net)</span>
                  </th>
                  <th style={{ width: '13%' }} className="text-right">
                    Recommended Clinic
                  </th>
                  <th style={{ width: '13%' }} className="text-right">
                    Retail MSRP <span className="th-sub">(Rec.)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="product-row">
                    <td className="text-center text-muted font-mono">{p.itemNumber}</td>
                    
                    <td>
                      <div className="sku-badge">
                        <span className="font-mono text-xs">{(p.sku || '').replace(/^SKU-COLWAY-/i, '')}</span>
                      </div>
                      <div className="product-category-tag">{p.category}</div>
                    </td>

                    <td>
                      <div className="product-identity-cell">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: '44px',
                              height: '44px',
                              minWidth: '44px',
                              maxWidth: '44px',
                              minHeight: '44px',
                              maxHeight: '44px',
                              objectFit: 'contain',
                              borderRadius: '6px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              padding: '2px',
                              flexShrink: 0
                            }}
                            className="product-thumb"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <div className="product-name font-bold">{p.name}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="volume-badge">{p.volume}</span>
                    </td>

                    {/* Wholesaler Price */}
                    <td className="text-right font-mono font-bold wholesale-cell">
                      {formatPrice(p.calculatedWholesale)}
                    </td>

                    {/* Recommended Clinic Price (25% over wholesale) */}
                    <td className="text-right font-mono text-slate-600">
                      {formatPrice(p.recommendedClinic)}
                    </td>

                    {/* Retail / MSRP (30% over clinic) */}
                    <td className="text-right font-mono font-semibold text-slate-800">
                      {formatPrice(p.recommendedRetail)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan="4" className="text-right font-bold uppercase tracking-wider text-xs">
                    Portfolio Aggregate Wholesale Basket:
                  </td>
                  <td className="text-right font-mono font-bold text-sky-600">
                    {formatPrice(totals.totalWholesale)}
                  </td>
                  <td colSpan="3" className="text-right text-xs text-slate-500">
                    UAE Mainland &amp; Free Zone Wholesale Schedule (Net of 5% VAT)
                  </td>
                </tr>
              </tfoot>
            </table>
        </div>

        {/* ── 2. Visual Product Cards Grid (Optional Screen View) ── */}
        {viewMode === 'cards' && (
          <div className="product-cards-grid no-print">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div className="card-image-wrap">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="card-product-img" />
                  ) : (
                    <div className="card-placeholder-img">
                      <Package size={32} className="text-slate-400" />
                    </div>
                  )}
                  <span className="card-category-badge">{p.category}</span>
                </div>

                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div className="card-sku font-mono">{(p.sku || '').replace(/^SKU-COLWAY-/i, '')}</div>
                    <span style={{
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: '#0369a1',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {p.volume}
                    </span>
                  </div>
                  <h3 className="card-title" style={{ marginTop: '4px', marginBottom: '8px' }}>{p.name}</h3>

                  <div className="card-clinical-focus">
                    <strong>Clinical Role:</strong> {p.clinicalFocus}
                  </div>

                  <div className="card-pricing-strip">
                    {isWholesaler ? (
                      <div className="price-item highlight">
                        <span className="price-item-label">Wholesaler (+15%)</span>
                        <span className="price-item-val font-mono text-emerald-700 font-bold">{formatPrice(p.calculatedWholesale)}</span>
                      </div>
                    ) : (
                      <div className="price-item">
                        <span className="price-item-label">Wholesale Rate</span>
                        <Link href="/login?redirect=/pricing/colway&tier=wholesale" className="b2b-lock-pill">
                          <Lock size={11} /> <span>Sign In</span>
                        </Link>
                      </div>
                    )}
                    {isClinicOrDoctor ? (
                      <div className="price-item">
                        <span className="price-item-label">Recommended Clinic</span>
                        <span className="price-item-val font-mono">{formatPrice(p.recommendedClinic)}</span>
                      </div>
                    ) : (
                      <div className="price-item">
                        <span className="price-item-label">Clinic Rate</span>
                        <Link href="/login?redirect=/pricing/colway&tier=clinic" className="b2b-lock-pill">
                          <Lock size={11} /> <span>Sign In</span>
                        </Link>
                      </div>
                    )}
                    <div className="price-item">
                      <span className="price-item-label">Retail MSRP</span>
                      <span className="price-item-val font-mono font-bold text-slate-800">{formatPrice(p.recommendedRetail)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Commercial & Logistics Terms Block ── */}
        <section className="terms-block">
          <h2 className="terms-title">
            <Building2 size={16} className="text-slate-600" />
            <span>Commercial Terms, Logistics & Ordering Protocol (UAE)</span>
          </h2>
          
          <div className="terms-columns">
            <div className="terms-col">
              <h4 className="terms-subheading">1. Taxation & Customs (FTA Compliance)</h4>
              <p>
                All prices quoted in this schedule are <strong>exclusive of 5% United Arab Emirates Value Added Tax (VAT)</strong>. 
                VAT will be added to the final commercial tax invoice in accordance with UAE Federal Decree-Law No. (8) of 2017. 
                Landed costs incorporate international air freight, UAE customs clearance, and refrigerated customs inspection charges.
              </p>
            </div>

            <div className="terms-col">
              <h4 className="terms-subheading">2. Cold-Chain & Product Integrity</h4>
              <p>
                Colway’s patented native fish tropocollagen is biologically active and maintains its helical tertiary structure 
                at temperatures up to 26°C (78.8°F). Stock is stored in climate-controlled pharmaceutical warehousing in Dubai 
                and dispatched via temperature-monitored vehicles across the UAE.
              </p>
            </div>

            <div className="terms-col">
              <h4 className="terms-subheading">3. Fulfillment & Minimum Order Quantity (MOQ)</h4>
              <p>
                Orders placed before 12:00 PM GST qualify for same-day delivery within Dubai and Sharjah. Delivery to Abu Dhabi, 
                Al Ain, Ras Al Khaimah, and Fujairah is completed within 24–48 hours. Flexible clinical trial quantities 
                are available for verified medical institutions with no minimum order surcharge.
              </p>
            </div>

            <div className="terms-col">
              <h4 className="terms-subheading">4. Invoicing & Wholesale Orders</h4>
              <p>
                Authorized distributor: <strong>Atlas Biopharma Middle East FZ-LLC</strong>, Dubai Science Park / Meydan Free Zone. 
                Payment terms: Advance corporate wire transfer or corporate credit card in AED. 
                For customized commercial distribution or private clinic bulk orders, contact wholesale procurement directly.
              </p>
            </div>
          </div>

          <div className="print-footer-signature">
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-text">Authorized Officer · Atlas Biopharma Distribution</div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-text">Approved Receiving Physician / Pharmacy Director</div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Export Schedule Modal (2 Distinct Formats: PDF vs CSV/Excel) ── */}
      {isExportModalOpen && (
        <div className="export-modal-backdrop no-print" onClick={() => setIsExportModalOpen(false)}>
          <div className="export-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="export-modal-title-wrap">
                <span className="export-badge">Official Schedule Export</span>
                <h3 className="export-modal-title">Export Colway UAE Price Schedule</h3>
                <p className="export-modal-subtitle">
                  Select your preferred format for institutional presentation or procurement processing.
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="export-close-btn"
                aria-label="Close export dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="export-options-grid">
              {/* Option 1: Executive PDF / Print Dossier */}
              <div className="export-card">
                <div className="export-card-icon-wrap pdf-icon-wrap">
                  <FileText size={24} className="text-rose-600" />
                </div>
                <div className="export-card-content">
                  <div className="export-card-tag text-rose-700 bg-rose-50 border border-rose-200">
                    Documental / Institutional
                  </div>
                  <h4 className="export-card-title">Executive PDF & Print Dossier</h4>
                  <p className="export-card-desc">
                    Official A4 landscape schedule with dual branding (Atlas × Colway), UAE cold-chain compliance stamps (&lt;26°C), full product breakdown, commercial terms, and physical sign-off lines.
                  </p>
                  <ul className="export-features-list">
                    <li>✓ High-resolution print-ready typography</li>
                    <li>✓ Cold-chain (&lt;26°C) & ISO 22716 certification stamp</li>
                    <li>✓ Formatted for A4 landscape / PDF download</li>
                  </ul>
                  <button onClick={handlePrint} className="export-primary-btn pdf-btn">
                    <Printer size={16} />
                    <span>Print / Save as PDF (A4)</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Structured CSV / Excel Spreadsheet */}
              <div className="export-card">
                <div className="export-card-icon-wrap excel-icon-wrap">
                  <Download size={24} className="text-emerald-600" />
                </div>
                <div className="export-card-content">
                  <div className="export-card-tag text-emerald-700 bg-emerald-50 border border-emerald-200">
                    Operative / ERP & Spreadsheet
                  </div>
                  <h4 className="export-card-title">Procurement CSV & Excel Data Sheet</h4>
                  <p className="export-card-desc">
                    Clean, computational spreadsheet formatted with UTF-8 BOM for instant import into Microsoft Excel, Google Sheets, Zoho Books, or hospital ERP systems.
                  </p>

                  <div className="export-tier-selector">
                    <label className="tier-radio-option">
                      <input
                        type="radio"
                        name="exportTier"
                        value="master"
                        checked={exportTier === 'master'}
                        onChange={() => setExportTier('master')}
                      />
                      <span>
                        <strong>Wholesaler Master:</strong> Includes Landed CIF, Markup % and Net Margins
                      </span>
                    </label>
                    <label className="tier-radio-option">
                      <input
                        type="radio"
                        name="exportTier"
                        value="clinic"
                        checked={exportTier === 'clinic'}
                        onChange={() => setExportTier('clinic')}
                      />
                      <span>
                        <strong>Clinic Catalog:</strong> Wholesale, Clinic & MSRP (Confidential landed costs hidden)
                      </span>
                    </label>
                  </div>

                  <button onClick={() => handleExportCSV(exportTier)} className="export-primary-btn excel-btn">
                    <Download size={16} />
                    <span>Download Spreadsheet (.csv)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="export-modal-footer">
              <span className="export-footer-note">
                Values calculated dynamically based on current configuration: <strong>{currency}</strong> at <strong>+{markupPct}% markup</strong> ({filteredProducts.length} items).
              </span>
              <button onClick={() => setIsExportModalOpen(false)} className="export-dismiss-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Floating Action Bar (<768px) ── */}
      <div className="mobile-floating-bar no-print">
        <div className="mobile-floating-inner">
          <div className="mobile-currency-pills">
            {['AED', 'USD', 'EUR'].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`mobile-pill ${currency === cur ? 'active' : ''}`}
              >
                {cur}
              </button>
            ))}
          </div>

          <div className="mobile-action-buttons">
            <button
              onClick={() => setViewMode(prev => prev === 'table' ? 'cards' : 'table')}
              className="mobile-btn mobile-btn-ghost"
              title="Toggle View Mode"
            >
              {viewMode === 'table' ? <Layers size={14} /> : <FileText size={14} />}
              <span>{viewMode === 'table' ? 'Visual' : 'Table'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="mobile-btn mobile-btn-accent"
              title="Export Price Schedule"
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            <button
              onClick={handlePrint}
              className="mobile-btn mobile-btn-primary"
              title="Print Price Schedule"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Institutional Unified Public Footer ── */}
      <PublicUnifiedFooter lang="en" />
    </div>
  );
}
