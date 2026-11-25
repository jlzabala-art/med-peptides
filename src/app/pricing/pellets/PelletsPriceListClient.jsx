'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PelletPricePdfPreviewModal = dynamic(() => import('@/components/pricing/PelletPricePdfPreviewModal'), { ssr: false });
import {
  Syringe,
  ShieldCheck,
  Lock,
  Award,
  FileText,
  Download,
  Share2,
  Plus,
  Minus,
  Check,
  ExternalLink,
  Layers,
  X,
  Activity,
  CheckCircle2,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
import PageHeroCard from '@/components/ui/PageHeroCard';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import CatalogPricingBridgeBar from '@/components/shared/CatalogPricingBridgeBar';
import PriceScheduleExpandedActions from '@/components/pricing/shared/PriceScheduleExpandedActions';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';

import './PelletsPriceList.css';

const FX_RATES_FROM_EUR = {
  EUR: 1.0,
  USD: 1.087,
  AED: 3.992
};

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  AED: 'AED '
};

/**
 * PelletMobileCard — Symmetric 2-Zone Stripe / GCP Mobile Product Card
 * Zone A: Compact clinical identity ([PL-01] + Name + Expand + Strength/Trocar/Duration + Copyable SKU)
 * Zone B: Side-by-side 50/50 pricing tiles (Single Unit vs Pack x10 -10%) with full-width 40px tap targets
 */
function PelletMobileCard({
  row,
  expandableRender,
  formatPrice,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  isEs,
}) {
  const [expanded, setExpanded] = useState(false);
  const isPellet = row.category !== 'Trocar Kits';
  const unitEur = row.pricing?.wholesalePriceEur || row.pricing?.price_eur || row.pricing?.costPriceEur || 0;
  const packEur = row.pricing?.box10WholesalePriceEur || Number((unitEur * 10 * 0.90).toFixed(2));
  const singleQty = cartItems?.[row.id]?.single || 0;
  const packQty = cartItems?.[row.id]?.pack10 || 0;

  return (
    <div className="pellet-mcard">
      {/* Zone A: Clinical Identity */}
      <div className="pellet-mcard-top">
        <div className="pellet-mcard-header">
          <div className="pellet-mcard-title-row">
            {row.itemNumber && (
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.68rem',
                color: '#334155',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '1px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}>
                {row.itemNumber}
              </span>
            )}
            {isPellet ? (
              <Link
                href={`/p/${row.slug}`}
                style={{ color: '#003666', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', lineHeight: 1.25 }}
              >
                {row.name}
              </Link>
            ) : (
              <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.25 }}>
                {row.name}
              </span>
            )}
          </div>

          {expandableRender && (
            <button
              type="button"
              className="pellet-mcard-expand-btn"
              onClick={() => setExpanded((v) => !v)}
              aria-label={isEs ? 'Ver detalle clínico' : 'Toggle clinical details'}
              aria-expanded={expanded}
            >
              <ChevronDown
                size={16}
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s ease' }}
              />
            </button>
          )}
        </div>

        {/* 1-Line Compact Clinical Metadata */}
        <div className="pellet-mcard-meta-row">
          <span style={{
            fontSize: '0.67rem',
            fontWeight: 700,
            color: row.hormoneType === 'estrogen' ? '#be185d' : row.hormoneType === 'androgen' ? '#1d4ed8' : '#0d9488',
            backgroundColor: row.hormoneType === 'estrogen' ? '#fdf2f8' : row.hormoneType === 'androgen' ? '#eff6ff' : '#f0fdfa',
            border: `1px solid ${row.hormoneType === 'estrogen' ? '#fbcfe8' : row.hormoneType === 'androgen' ? '#bfdbfe' : '#ccfbf1'}`,
            padding: '1px 6px',
            borderRadius: '4px',
          }}>
            {row.strength}
          </span>
          {row.trocarSize && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '1px 6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#334155',
            }}>
              <Syringe size={10} color="#003666" />
              <span>{row.trocarSize}</span>
            </span>
          )}
          {row.duration && (
            <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#475569' }}>
              · {row.duration}
            </span>
          )}
        </div>

        {/* Copyable SKU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <CopyableId value={row.sku} displayValue={row.sku} />
          <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 600 }}>
            {row.category === 'Trocar Kits' ? (isEs ? 'Kit Quirúrgico' : 'Surgical Kit') : 'EU GMP'}
          </span>
        </div>
      </div>

      {/* Zone B: Symmetric 50/50 Pricing Action Footer */}
      <div className="pellet-mcard-pricing-grid">
        {/* Single Unit Tile */}
        <div className="pellet-mcard-price-box">
          <div className="pellet-mcard-price-label">
            <span>{isEs ? 'Unidad' : 'Single Unit'}</span>
          </div>
          <div className="pellet-mcard-price-val">{formatPrice(unitEur)}</div>
          {singleQty > 0 ? (
            <div className="pellet-mcard-stepper">
              <button type="button" onClick={() => onUpdateQuantity(row.id, 'single', -1)} aria-label="Decrease single">
                <Minus size={13} />
              </button>
              <span>{singleQty}</span>
              <button type="button" onClick={() => onUpdateQuantity(row.id, 'single', 1)} aria-label="Increase single">
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pellet-mcard-action-btn"
              onClick={() => onAddToCart(row.id, 'single')}
            >
              <Plus size={13} />
              <span>{isEs ? 'Unidad' : 'Single'}</span>
            </button>
          )}
        </div>

        {/* Pack x10 Box Tile */}
        <div className="pellet-mcard-price-box pack">
          <div className="pellet-mcard-price-label">
            <span>{isEs ? 'Caja ×10' : 'Pack ×10'}</span>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontSize: '0.62rem' }}>
              -10%
            </span>
          </div>
          <div className="pellet-mcard-price-val">{formatPrice(packEur)}</div>
          {packQty > 0 ? (
            <div className="pellet-mcard-stepper pack">
              <button type="button" onClick={() => onUpdateQuantity(row.id, 'pack10', -1)} aria-label="Decrease pack">
                <Minus size={13} />
              </button>
              <span>{packQty}</span>
              <button type="button" onClick={() => onUpdateQuantity(row.id, 'pack10', 1)} aria-label="Increase pack">
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pellet-mcard-action-btn pack"
              onClick={() => onAddToCart(row.id, 'pack10')}
            >
              <Plus size={13} />
              <span>{isEs ? 'Pack ×10' : 'Pack ×10'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Master-Detail */}
      {expanded && expandableRender && (
        <div style={{ padding: '0 12px 12px', background: '#f8fafc' }}>
          {expandableRender(row)}
        </div>
      )}
    </div>
  );
}

export default function PelletsPriceListClient({
  initialProducts = [],
  initialCurrency = 'USD',
  initialLang = 'en'
}) {
  const workspace = usePublicWorkspace();
  const { is } = useRoleAccess();
  const isAdmin = is('admin');
  const currency = workspace?.currency || initialCurrency || 'USD';
  const lang = workspace?.lang || initialLang || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState('all'); // 'all' | 'female' | 'male' | 'trocar'
  const [copiedPelletUrl, setCopiedPelletUrl] = useState(false);
  const [copiedPelletWhatsApp, setCopiedPelletWhatsApp] = useState(false);

  // Hydrate initial search/category/profile from URL query params (?q=..., ?category=..., ?profile=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('category');
    const profile = params.get('profile');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat);
    if (profile && ['female', 'male', 'trocar'].includes(profile.toLowerCase())) {
      setSelectedProfile(profile.toLowerCase());
    }
    if (q || cat || profile) {
      setScopeMode('filtered');
    }
  }, []);
  const [cartItems, setCartItems] = useState({}); // { [id]: { single: number, pack10: number } }
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [scopeMode, setScopeMode] = useState('all'); // 'all' | 'filtered'
  const [showMobileSpecs, setShowMobileSpecs] = useState(false);

  const isEs = lang === 'es';

  // Currency Converter
  const fxRate = FX_RATES_FROM_EUR[currency] || 1.0;
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '€';

  const formatPrice = useCallback((eurAmount) => {
    if (eurAmount === null || eurAmount === undefined) return '—';
    const converted = Number(eurAmount) * fxRate;
    return `${currencySymbol}${converted.toFixed(2)}`;
  }, [fxRate, currencySymbol]);

  // Cart operations (synced with Global PublicWorkspaceContext Quote Cart)
  const syncPelletToWorkspace = useCallback((productId, type, nextQty) => {
    if (!workspace?.syncRfqItem) return;
    const prod = initialProducts.find((p) => p.id === productId);
    if (!prod) return;
    const unitEur = prod.pricing?.wholesalePriceEur || prod.pricing?.price_eur || prod.pricing?.costPriceEur || 0;
    const pack10Eur = prod.pricing?.pack10PriceEur || Number((unitEur * 10 * 0.90).toFixed(2));
    const rawEur = type === 'pack10' ? pack10Eur : unitEur;
    workspace.syncRfqItem(
      {
        id: `pellet:${productId}:${type}`,
        sku: prod.sku || prod.itemNumber || productId,
        name: `${prod.name} (${type === 'pack10' ? 'Pack ×10' : 'Single Unit'})`,
        unitPrice: Number((rawEur * fxRate).toFixed(2)),
        source: 'pellets',
        href: '/pricing/pellets',
      },
      nextQty
    );
  }, [workspace, initialProducts, fxRate]);

  const handleAddToCart = useCallback((productId, type = 'single') => {
    triggerHaptic('selection');
    setCartItems(prev => {
      const current = prev[productId] || { single: 0, pack10: 0 };
      const nextQty = (current[type] || 0) + 1;
      syncPelletToWorkspace(productId, type, nextQty);
      return {
        ...prev,
        [productId]: {
          ...current,
          [type]: nextQty
        }
      };
    });
    toast.success(isEs ? 'Añadido a la cotización' : 'Added to quote cart');
  }, [isEs, syncPelletToWorkspace]);

  const handleUpdateQuantity = useCallback((productId, type, delta) => {
    triggerHaptic('light');
    setCartItems(prev => {
      const current = prev[productId] || { single: 0, pack10: 0 };
      const nextVal = Math.max(0, (current[type] || 0) + delta);
      syncPelletToWorkspace(productId, type, nextVal);
      return {
        ...prev,
        [productId]: {
          ...current,
          [type]: nextVal
        }
      };
    });
  }, [syncPelletToWorkspace]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(item => {
      // Category filter
      if (selectedCategory === 'estrogen') {
        if (item.hormoneType !== 'estrogen' && item.hormoneType !== 'biest') return false;
      } else if (selectedCategory === 'androgen') {
        if (item.hormoneType !== 'androgen') return false;
      } else if (selectedCategory === 'progesterone') {
        if (item.hormoneType !== 'progesterone') return false;
      } else if (selectedCategory === 'synergy') {
        if (item.hormoneType !== 'synergy') return false;
      } else if (selectedCategory === 'trocar') {
        if (item.category !== 'Trocar Kits' && item.hormoneType !== 'instrument') return false;
      }

      // Clinical profile filter (1-click guided selection)
      if (selectedProfile === 'female') {
        const isFemalePellet = item.targetGender === 'female' || item.hormoneType === 'estrogen' || item.hormoneType === 'biest' || item.hormoneType === 'progesterone';
        if (!isFemalePellet) return false;
      } else if (selectedProfile === 'male') {
        const isMalePellet = item.targetGender === 'male' || item.hormoneType === 'synergy';
        if (!isMalePellet) return false;
      } else if (selectedProfile === 'trocar') {
        if (item.category !== 'Trocar Kits' && item.hormoneType !== 'instrument') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchSku = item.sku?.toLowerCase().includes(q);
        const matchDesc = item.shortDescription?.toLowerCase().includes(q);
        const matchStrength = item.strength?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDesc && !matchStrength) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, selectedProfile, searchQuery]);

  // Cart Totals calculation
  const cartSummary = useMemo(() => {
    let totalItems = 0;
    let totalEur = 0;

    Object.entries(cartItems).forEach(([prodId, counts]) => {
      const product = initialProducts.find(p => p.id === prodId);
      if (!product) return;

      const singlePriceEur = product.pricing?.wholesalePriceEur || product.pricing?.price_eur || product.pricing?.costPriceEur || 0;
      const pack10PriceEur = product.pricing?.pack10PriceEur || (singlePriceEur * 10 * 0.90); // 10% discount for pack ×10

      if (counts.single > 0) {
        totalItems += counts.single;
        totalEur += counts.single * singlePriceEur;
      }
      if (counts.pack10 > 0) {
        totalItems += counts.pack10 * 10;
        totalEur += counts.pack10 * pack10PriceEur;
      }
    });

    return {
      totalItems,
      totalEur,
      formattedTotal: formatPrice(totalEur)
    };
  }, [cartItems, initialProducts, formatPrice]);

  // Listen to open-pellets-pdf-modal from GlobalBottomStickyBar and set Atlas context
  React.useEffect(() => {
    const handler = () => setIsPdfPreviewOpen(true);
    window.addEventListener('open-pellets-pdf-modal', handler);

    // Provide rich Pellets context to Atlas AI
    const detail = {
      contextType: 'catalog',
      storageKey: 'pricing-pellets',
      contextAnchor: {
        sectionTitle: isEs
          ? 'Pellets Hormonales Subcutáneos (EU GMP) y Kits Quirúrgicos de Trócar'
          : 'EU GMP Subcutaneous Bioidentical Hormone Pellets & Surgical Trocar Kits',
        keyActives: '17β-Estradiol, Biest, Micronized Testosterone (USP), Progesterone (P4), Testosterone + Anastrozole, Single-Use Surgical Trocars (3.2mm & 4.5mm)',
        mechanisms: isEs
          ? 'Implantes cristalinos comprimidos estériles EU GMP, irradiación E-Beam validada SAL 10⁻⁶, liberación continua de orden cero durante 3.5 a 6 meses sin fluctuaciones, 0% primer paso hepático, tarifas mayoristas unitarias y packs de 10.'
          : 'EU GMP sterile crystalline compressed implants, validated E-Beam SAL 10⁻⁶, zero-order release kinetics over 3.5 to 6 months without peak/trough fluctuations, 0% hepatic first-pass bypass, wholesale unit and pack-of-10 institutional pricing tiers.',
      },
    };
    window.dispatchEvent(new CustomEvent('set-public-atlas-context', { detail }));

    return () => window.removeEventListener('open-pellets-pdf-modal', handler);
  }, [isEs]);

  // Share link handler (Bilingual WhatsApp-ready)
  const handleShare = async () => {
    const url = 'https://www.atlashealth-services.com/pricing/pellets';
    const text = isEs
      ? `Tarifa Oficial B2B · Pellets Hormonales Subcutáneos (EU GMP)\nMonografías clínicas y precios mayoristas institucionales:\n${url}`
      : `Official B2B Price Schedule · EU GMP Subcutaneous Hormone Pellets\nClinical monographs & institutional wholesale pricing:\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isEs ? 'Tarifa Oficial B2B · Pellets Hormonales Subcutáneos' : 'Official B2B Price Schedule · Hormone Pellets',
          text,
          url
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      triggerHaptic('copy');
      toast.success(isEs ? 'Enlace y detalles copiados para compartir' : 'Price schedule details copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: initialProducts.length, estrogen: 0, androgen: 0, progesterone: 0, synergy: 0, trocar: 0 };
    initialProducts.forEach(p => {
      if (p.hormoneType === 'estrogen' || p.hormoneType === 'biest') counts.estrogen++;
      else if (p.hormoneType === 'androgen') counts.androgen++;
      else if (p.hormoneType === 'progesterone') counts.progesterone++;
      else if (p.hormoneType === 'synergy') counts.synergy++;
      else if (p.category === 'Trocar Kits' || p.hormoneType === 'instrument') counts.trocar++;
    });
    return counts;
  }, [initialProducts]);

  // DataTable columns definition (Strict Rule #3 & Rule #30 - Zero horizontal scroll)
  const columns = useMemo(() => [
    {
      key: 'name',
      label: isEs ? 'Formulación & Dosis' : 'Formulation & Strength',
      width: '305px',
      render: (val, row) => {
        const isPellet = row.category !== 'Trocar Kits';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              {row.itemNumber && (
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  color: '#334155',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}>
                  {row.itemNumber}
                </span>
              )}
              {isPellet ? (
                <Link
                  href={`/p/${row.slug}`}
                  style={{
                    color: '#003666',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textDecoration: 'none'
                  }}
                  className="hover:underline"
                >
                  {row.name}
                </Link>
              ) : (
                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.84rem' }}>
                  {row.name}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: row.hormoneType === 'estrogen' ? '#be185d' : row.hormoneType === 'androgen' ? '#1d4ed8' : '#0d9488',
                backgroundColor: row.hormoneType === 'estrogen' ? '#fdf2f8' : row.hormoneType === 'androgen' ? '#eff6ff' : '#f0fdfa',
                border: `1px solid ${row.hormoneType === 'estrogen' ? '#fbcfe8' : row.hormoneType === 'androgen' ? '#bfdbfe' : '#ccfbf1'}`,
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {row.strength}
              </span>
              {row.purity && (
                <span style={{ fontSize: '0.66rem', color: '#16a34a', fontWeight: 600 }}>
                  {row.purity}
                </span>
              )}
            </div>
            {/* Embedded SKU underneath to eliminate dedicated SKU column */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
              <CopyableId value={row.sku} displayValue={row.sku} />
              <span style={{ fontSize: '0.64rem', color: '#64748b' }}>
                {row.category === 'Trocar Kits' ? (isEs ? 'Instrumental' : 'Surgical Kit') : 'EU GMP Blister'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'trocarSize',
      label: isEs ? 'Trócar / Vía' : 'Trocar Cannula',
      width: '115px',
      render: (val) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: '#334155',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <Syringe size={11} color="#003666" />
          <span>{val}</span>
        </span>
      )
    },
    {
      key: 'duration',
      label: isEs ? 'Cinética' : 'Kinetics / Duration',
      width: '125px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
            {val}
          </span>
          {row.targetSerum && row.targetSerum !== 'N/A (Surgical Kit)' && (
            <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
              Obj: {row.targetSerum}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'singlePrice',
      label: isEs ? 'Tarifa Unitaria' : 'Single Unit',
      width: '120px',
      align: 'right',
      render: (_, row) => {
        const eur = row.pricing?.wholesalePriceEur || row.pricing?.price_eur || row.pricing?.costPriceEur || 0;
        const currentQty = cartItems[row.id]?.single || 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              {formatPrice(eur)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {currentQty > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'single', -1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Minus size={11} />
                  </button>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0 4px' }}>{currentQty}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'single', 1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddToCart(row.id, 'single')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#003666',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={10} />
                  <span>{isEs ? 'Unidad' : 'Single'}</span>
                </button>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'pack10Price',
      label: isEs ? 'Pack ×10 (-10%)' : 'Pack ×10 Box (-10%)',
      width: '145px',
      align: 'right',
      render: (_, row) => {
        const eur = row.pricing?.wholesalePriceEur || row.pricing?.price_eur || row.pricing?.costPriceEur || 0;
        const pack10Eur = row.pricing?.pack10PriceEur || (eur * 10 * 0.90); // 10% institutional discount
        const currentQty = cartItems[row.id]?.pack10 || 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#16a34a' }}>
                {formatPrice(pack10Eur)}
              </span>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: '#166534',
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0',
                padding: '1px 5px',
                borderRadius: '3px'
              }}>
                -10%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {currentQty > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'pack10', -1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Minus size={11} />
                  </button>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0 4px' }}>{currentQty}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'pack10', 1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddToCart(row.id, 'pack10')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#166534',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={10} />
                  <span>{isEs ? 'Pack ×10' : 'Pack ×10'}</span>
                </button>
              )}
            </div>
          </div>
        );
      }
    }
  ], [isEs, formatPrice, cartItems, handleAddToCart, handleUpdateQuantity]);

  // Master Detail Render (Strict Rule #4)
  const expandableRender = useCallback((row) => (
    <div className="pellets-detail-panel">
      <div className="pellets-detail-col">
        <span className="pellets-detail-title">
          {isEs ? 'Perfil Clínico & Especificaciones Farmacéuticas' : 'Clinical Profile & Pharmaceutical Specs'}
        </span>
        <p className="pellets-detail-desc">
          {row.shortDescription}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '6px', fontSize: '0.72rem', color: '#64748b' }}>
          <span><strong>{isEs ? 'Fabricación:' : 'Standard:'}</strong> {isAdmin ? 'Pharmapolis (Bulgaria)' : 'EU GMP Certified Facility'}</span>
          <span>•</span>
          <span><strong>{isEs ? 'Esterilidad:' : 'Sterility:'}</strong> E-Beam SAL 10⁻⁶</span>
          {row.trocarSize && (
            <>
              <span>•</span>
              <span><strong>{isEs ? 'Trócar:' : 'Trocar:'}</strong> {row.trocarSize}</span>
            </>
          )}
          {row.duration && (
            <>
              <span>•</span>
              <span><strong>{isEs ? 'Duración:' : 'Duration:'}</strong> {row.duration}</span>
            </>
          )}
        </div>
      </div>

      <div className="pellets-detail-col" style={{ alignItems: 'flex-start' }}>
        <span className="pellets-detail-title">
          {isEs ? 'Recursos Clínicos Relacionados' : 'Associated Clinical Resources'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          <Link
            href="/guides/hormone-pellets-implantation"
            target="_blank"
            className="pellets-guide-btn"
          >
            <Activity size={13} />
            <span>{isEs ? 'Ver Guía Gráfica de Implante con Trócar' : 'Open Interactive Trocar Guide'}</span>
            <ExternalLink size={12} />
          </Link>

          {row.category !== 'Trocar Kits' && (
            <Link
              href={`/p/${row.slug}`}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                color: '#003666',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '4px'
              }}
            >
              <FileText size={13} />
              <span>{isEs ? 'Abrir Monografía Completa (7 Secciones)' : 'Open Full Clinical Monograph (7 Tabs)'}</span>
              <ExternalLink size={12} />
            </Link>
          )}

          {/* Cross-Catalog Peptide Synergies (1-Click Navigation to /pricing/peptides) */}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', width: '100%' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7c3aed', marginBottom: '5px' }}>
              {isEs ? 'Sinergias Clínicas en Péptidos' : 'Recommended Peptide Synergies'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {((Array.isArray(row.synergyKeys) && row.synergyKeys.length > 0
                ? row.synergyKeys
                : (row.category === 'Trocar Kits' ? ['bpc-157'] : ['cjc-1295', 'bpc-157', 'nad'])
              ).map((key) => {
                const synMap = {
                  'bpc-157': { q: 'BPC-157', label: row.category === 'Trocar Kits' ? (isEs ? 'BPC-157 (Recuperación tisular)' : 'BPC-157 (Tissue Recovery)') : 'BPC-157' },
                  'ghk-cu': { q: 'GHK-Cu', label: isEs ? 'GHK-Cu (Colágeno/Piel)' : 'GHK-Cu (Collagen/Dermal)' },
                  'epithalon': { q: 'Epitalon', label: isEs ? 'Epitalon (Longevidad)' : 'Epitalon (Longevity)' },
                  'cjc-1295': { q: 'CJC-1295', label: isEs ? 'CJC-1295 / Ipamorelin (Eje GH)' : 'CJC-1295 / Ipamorelin (GH Axis)' },
                  'nad': { q: 'NAD+', label: 'NAD+' },
                };
                return synMap[key] || { q: key, label: key.toUpperCase() };
              })).map((syn) => {
                const synParams = new URLSearchParams({ q: syn.q });
                if (isEs) synParams.set('lang', 'es');
                if (currency) synParams.set('currency', currency);
                return (
                  <Link
                    key={syn.q}
                    href={`/pricing/peptides?${synParams.toString()}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f3e8ff',
                      border: '1px solid #d8b4fe',
                      color: '#6b21a8',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>+ {syn.label} →</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <PriceScheduleExpandedActions
        item={{
          ...row,
          packSize: row.strength || row.trocarSize || 'EU GMP Blister',
        }}
        currency={currency}
        unitPrice={Number(row.pricing?.wholesalePriceEur ?? row.pricing?.price_eur ?? 0)}
        categoryLabel="BHRT Hormone Pellets"
      />
    </div>
  ), [isEs, currency]);

  // Contextual KPI values (dynamically computed from active scope)
  const kpiProducts = scopeMode === 'all' ? initialProducts : filteredProducts;
  const activeCount = kpiProducts.length;
  const kpiPriceStats = useMemo(() => {
    const prices = kpiProducts
      .map((p) => Number(p.pricing?.wholesalePriceEur || p.pricing?.price_eur || p.pricing?.costPriceEur || 0))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) return { minUnit: 0, maxUnit: 0, minPack10: 0 };
    const minUnit = Math.min(...prices);
    const maxUnit = Math.max(...prices);
    const minPack10 = Number((minUnit * 10 * 0.90).toFixed(2));
    return { minUnit, maxUnit, minPack10 };
  }, [kpiProducts]);

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'pricing-pellets',
        name: isAdmin ? 'Pharmapolis Hormone Pellets' : 'Subcutaneous Hormone Pellets',
        subtitle: 'EU GMP Subcutaneous Therapy · Surgical Trocars',
        sectionTitle: isEs ? 'Pellets Hormonales Subcutáneos' : (isAdmin ? 'Pharmapolis Hormone Pellets' : 'Subcutaneous Hormone Pellets'),
        currency,
        skuCount: initialProducts.length,
      },
      bottomBar: {
        summaryTitle: isEs ? 'Pellets Hormonales Subcutáneos' : (isAdmin ? 'Pharmapolis Hormone Pellets' : 'Subcutaneous Hormone Pellets'),
        summarySubtitle: `${currency} · ${initialProducts.length} SKUs · EU GMP`,
        atlasAiLabel: isEs ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        primaryAction: {
          label: isEs ? 'Guía de Trócar' : 'Trocar Guide',
          onClick: () => {
            if (typeof window !== 'undefined') window.location.href = '/guides/hormone-pellets-implantation';
          },
        },
      },
    },
    [isEs, currency, initialProducts.length]
  );

  return (
    <div className="pellets-price-page">
      {/* ── UNIFIED ATLAS PUBLIC HEADER ── */}
      <PublicUnifiedHeader
        brandHref="/pricing"
        loginRedirect="/pricing/pellets"
        currentApp="services"
        lang={lang}
        currency={currency}
        onCurrencyChange={(c) => workspace?.setCurrency?.(c)}
        onLangChange={(l) => workspace?.setLang?.(l)}
        hideAiButton={true}
        hideContactButton={true}
        breadcrumb={[
          { label: isEs ? 'Tarifas B2B' : 'B2B Schedules', href: '/pricing' },
          { label: isEs ? 'Pellets Hormonales' : 'Hormone Pellets' },
        ]}
      />

      {/* ── UNIFIED CLINICAL FORMAT SWITCHER (1-Click Navigation Across Vials, Pens & Pellets) ── */}
      <CatalogPricingBridgeBar activeMode="pricing" slug="pellets" lang={lang} />

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="pellets-price-container">
        {/* ── UNIFIED COMPACT GCP RESOURCE HERO (Consistent across all platform screens) ── */}
        <PageHeroCard
          brandRight={isAdmin ? 'PHARMAPOLIS EU GMP' : 'EU GMP CERTIFIED'}
          badges={[
            isEs ? 'E-Beam SAL 10⁻⁶ · POM' : 'E-Beam SAL 10⁻⁶ · POM',
            isEs ? 'Liberación 3.5–6 Meses' : '3.5–6 Mo Zero-Order',
          ]}
          metaItems={[{ label: 'REF:', value: 'DOC-BG-PHARM-PELLET-2026', mono: true }]}
          title={
            isEs
              ? 'Pellets Hormonales Subcutáneos y Kits Quirúrgicos · Tarifa B2B'
              : 'Subcutaneous Hormone Pellets & Surgical Trocar Kits · B2B Schedule'
          }
          subtitle={
            isEs
              ? 'Pellets bioidénticos estériles (≥99.5% USP/EP, 0% primer paso hepático) y kits de trócar con descuento institucional Pack ×10 (-10%).'
              : 'Sterile bioidentical hormone pellets (≥99.5% USP/EP, 0% hepatic first-pass) & surgical trocar kits with Pack ×10 (-10%) volume pricing.'
          }
          actions={
            <>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setIsPdfPreviewOpen(true)}
                title={isEs ? 'Vista Previa Oficial A4 / Guardar PDF' : 'Official A4 Preview / Save PDF'}
                style={{ height: '36px', padding: '0 12px', fontSize: '0.78rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={13} color="#5f6368" />
                <span>{isEs ? 'Tarifa PDF' : 'Preview PDF'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleShare}
                title={isEs ? 'Copiar enlace al portapapeles' : 'Copy link to clipboard'}
                style={{ height: '36px', padding: '0 12px', fontSize: '0.78rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={13} color="#5f6368" />
                <span>{isEs ? 'Compartir' : 'Share'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => setIsInquiryDrawerOpen(true)}
                style={{ height: '36px', padding: '0 13px', fontSize: '0.78rem', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={13} />
                <span>{isEs ? 'Solicitar' : 'Request Allocation'}</span>
              </button>
            </>
          }
        />
        {/* ── 4 KPIs with Scope Switcher (Strict Golden Rule #22) ── */}
        <div className="pellets-kpi-bar">
          <div className="pellets-kpi-header">
            <div className="pellets-kpi-title">
              <Award size={16} color="#003666" />
              <span>{isEs ? 'Resumen Métrico Institucional' : 'Institutional Summary & Scope'}</span>
            </div>

            {/* Currency FX + Scope Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {currency !== 'EUR' && (
                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  color: '#0369a1',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  FX: 1 EUR = {FX_RATES_FROM_EUR[currency]} {currency}
                </span>
              )}
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {isEs ? 'Alcance:' : 'Scope:'}
              </span>
              <div className="gcp-segmented-switch">
                <button
                  type="button"
                  className={`gcp-segmented-btn ${scopeMode === 'all' ? 'active' : ''}`}
                  onClick={() => setScopeMode('all')}
                >
                  {isEs ? `Base Global (${initialProducts.length})` : `All Database (${initialProducts.length})`}
                </button>
                <button
                  type="button"
                  className={`gcp-segmented-btn ${scopeMode === 'filtered' ? 'active' : ''}`}
                  onClick={() => setScopeMode('filtered')}
                >
                  {isEs ? `Filtro Activo (${filteredProducts.length})` : `Filtered (${filteredProducts.length})`}
                </button>
              </div>
            </div>
          </div>

          <div className="pellets-kpi-grid">
            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Formulaciones Disponibles' : 'Sterile Formulations'}
              </span>
              <span className="pellets-kpi-card-val">
                {activeCount} {isEs ? 'Líneas' : 'SKUs'}
              </span>
              <span className="pellets-kpi-card-sub">
                ≥99.5% USP Bioidentical Pure
              </span>
            </div>

            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Rango Tarifario B2B' : 'Wholesale Price Range'}
              </span>
              <span className="pellets-kpi-card-val">
                {kpiPriceStats.minUnit > 0
                  ? `${formatPrice(kpiPriceStats.minUnit)} – ${formatPrice(kpiPriceStats.maxUnit)}`
                  : '—'}
              </span>
              <span className="pellets-kpi-card-sub">
                {isEs ? 'Tarifa mayorista oficial' : 'Official wholesale tariff'}
              </span>
            </div>

            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Ahorro Pack ×10 Institucional' : 'Pack ×10 Tier Savings'}
              </span>
              <span className="pellets-kpi-card-val" style={{ color: '#16a34a' }}>
                {isEs ? '-10% Descuento Volumen' : '-10% Volume Discount'}
              </span>
              <span className="pellets-kpi-card-sub">
                {kpiPriceStats.minPack10 > 0
                  ? (isEs ? `Desde ${formatPrice(kpiPriceStats.minPack10)} / caja ×10` : `From ${formatPrice(kpiPriceStats.minPack10)} / 10-pack box`)
                  : '—'}
              </span>
            </div>

            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Ventana Cinética Meseta' : 'Zero-Order Release'}
              </span>
              <span className="pellets-kpi-card-val">
                {isEs ? '3.5 a 6 Meses' : '3.5 to 6 Months'}
              </span>
              <span className="pellets-kpi-card-sub">
                {isEs ? 'Sin picos ni valles séricos' : 'Steady state without fluctuations'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content Layout with Left Sidebar Rail & Main Table ── */}
        <div className="pellets-content-layout">
          {/* Left Category Sidebar Rail */}
          <aside className="pellets-sidebar-rail">
            <div className="pellets-sidebar-title">
              <span>{isEs ? 'Categorías' : 'Categories'}</span>
              <Layers size={13} color="#64748b" />
            </div>

            <div className="pellets-category-list">
              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span>{isEs ? 'Todas las Líneas' : 'All Formulations'}</span>
                <span className="pellets-cat-count">{categoryCounts.all}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'estrogen' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('estrogen')}
              >
                <span>{isEs ? '17β-Estradiol & Biest' : '17β-Estradiol & Biest'}</span>
                <span className="pellets-cat-count">{categoryCounts.estrogen}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'androgen' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('androgen')}
              >
                <span>{isEs ? 'Testosterona (T)' : 'Testosterone (T)'}</span>
                <span className="pellets-cat-count">{categoryCounts.androgen}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'progesterone' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('progesterone')}
              >
                <span>{isEs ? 'Progesterona (P4)' : 'Progesterone (P4)'}</span>
                <span className="pellets-cat-count">{categoryCounts.progesterone}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'synergy' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('synergy')}
              >
                <span>{isEs ? 'T + Anastrozol' : 'T + Anastrozole'}</span>
                <span className="pellets-cat-count">{categoryCounts.synergy}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'trocar' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('trocar')}
              >
                <span>{isEs ? 'Kits de Trócar' : 'Trocar Kits'}</span>
                <span className="pellets-cat-count">{categoryCounts.trocar}</span>
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <Link
                href="/guides/hormone-pellets-implantation"
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#0d9488',
                  textDecoration: 'none'
                }}
              >
                <Activity size={13} />
                <span>{isEs ? 'Guía Técnica de Trócar' : 'Interactive Trocar Guide'}</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </aside>

          {/* Main Table Column */}
          <div style={{ minWidth: 0 }}>
            {/* Guided Clinical Profile Strip (1-Click Female BHRT / Male TRT / Trocars + Clinical Window Tip) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginRight: '2px' }}>
                  {isEs ? 'Perfil Clínico:' : 'Clinical Profile:'}
                </span>
                {[
                  { id: 'all', label: isEs ? 'Todos' : 'All Formulations' },
                  { id: 'female', label: isEs ? '♀️ Mujer / Menopausia' : '♀️ Female BHRT' },
                  { id: 'male', label: isEs ? '♂️ Hombre / TRT' : '♂️ Male TRT' },
                  { id: 'trocar', label: isEs ? '🧰 Kits Trócar' : '🧰 Trocar Kits' },
                ].map((prof) => {
                  const active = selectedProfile === prof.id;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => {
                        setSelectedProfile(prof.id);
                        if (typeof window !== 'undefined') {
                          const url = new URL(window.location.href);
                          if (prof.id === 'all') url.searchParams.delete('profile');
                          else url.searchParams.set('profile', prof.id);
                          window.history.replaceState({}, '', url.toString());
                        }
                      }}
                      style={{
                        padding: '5px 11px',
                        minHeight: '34px',
                        borderRadius: '999px',
                        border: active ? '1px solid #003666' : '1px solid #cbd5e1',
                        background: active ? '#003666' : '#f8fafc',
                        color: active ? '#ffffff' : '#334155',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {prof.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.73rem', color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  {selectedProfile === 'female'
                    ? (isEs ? 'Trócar 3.2 mm · Ventana T: 150–350 ng/dL · E2: 40–110 pg/mL' : '3.2 mm Trocar · Target T: 150–350 ng/dL · E2: 40–110 pg/mL')
                    : selectedProfile === 'male'
                      ? (isEs ? 'Trócar 4.5 mm (>50 mg) · Ventana T: 400–800 ng/dL' : '4.5 mm Trocar (>50 mg) · Target T: 400–800 ng/dL')
                      : (isEs ? '≥99.5% USP · Liberación orden cero 3.5–6 meses · Sin primer paso hepático' : '≥99.5% USP · Zero-order release 3.5–6 mo · Zero hepatic first-pass')}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window === 'undefined') return;
                    navigator.clipboard?.writeText(window.location.href);
                    setCopiedPelletUrl(true);
                    setTimeout(() => setCopiedPelletUrl(false), 2000);
                  }}
                  style={{
                    padding: '5px 10px',
                    minHeight: '30px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: copiedPelletUrl ? '#f0fdf4' : '#ffffff',
                    color: copiedPelletUrl ? '#15803d' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedPelletUrl ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar enlace filtrado' : 'Copy Filtered Link')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window === 'undefined') return;
                    const profileLabel = selectedProfile === 'female'
                      ? 'Female BHRT & Gynecology'
                      : selectedProfile === 'male'
                        ? 'Male TRT & Andrology'
                        : 'Bioidentical Hormone Pellets';
                    const pitch = `Good morning Dr. [Last Name],\n\nAs a brief clinical reference for your ${profileLabel} practice, I am sharing our pre-filtered EU GMP sterile bioidentical hormone pellet formulary:\n\n• ${profileLabel} Formulary:\n${window.location.href}\n\nZero-order sustained release kinetics, ≥99.5% USP/EP purity, and sterile trocar implantation kits are detailed on the page. Should you require Certificates of Analysis (CoAs) or prescription coordination, please let me know.\n\nKind regards,\n[Your Name]`;
                    navigator.clipboard?.writeText(pitch);
                    setCopiedPelletWhatsApp(true);
                    setTimeout(() => setCopiedPelletWhatsApp(false), 2000);
                  }}
                  style={{
                    padding: '5px 10px',
                    minHeight: '30px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: copiedPelletWhatsApp ? '#f0fdf4' : '#ffffff',
                    color: copiedPelletWhatsApp ? '#15803d' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedPelletWhatsApp ? (isEs ? 'Mensaje copiado ✓' : 'Pitch Copied ✓') : (isEs ? 'Copiar WhatsApp' : 'Copy WhatsApp Pitch')}
                </button>
              </div>
            </div>

            {/* Global Search Bar (Strict Rule #6 & #7) */}
            <div className="pellets-filter-toolbar">
              <GlobalSearchBar
                namespace="pellets"
                searchScope="local"
                lang={lang}
                value={searchQuery}
                onChange={setSearchQuery}
                resultCount={filteredProducts.length}
                filters={[
                  { id: 'all', label: isEs ? 'Todos' : 'All', active: selectedProfile === 'all', onClick: () => setSelectedProfile('all') },
                  { id: 'female', label: isEs ? 'Mujer' : 'Female', active: selectedProfile === 'female', onClick: () => setSelectedProfile('female') },
                  { id: 'male', label: isEs ? 'Hombre' : 'Male', active: selectedProfile === 'male', onClick: () => setSelectedProfile('male') },
                  { id: 'trocar', label: isEs ? 'Kits Trócar' : 'Trocar Kits', active: selectedProfile === 'trocar', onClick: () => setSelectedProfile('trocar') },
                ]}
                size="lg"
              />

              {/* Mobile Horizontal Scrollable Category Strip (Replaces 340px vertical sidebar on mobile) */}
              <div className="pellets-mobile-cats-strip" role="tablist" aria-label={isEs ? 'Categorías' : 'Categories'}>
                {[
                  { id: 'all', label: isEs ? 'Todos' : 'All', count: categoryCounts.all },
                  { id: 'estrogen', label: 'Estradiol & Biest', count: categoryCounts.estrogen },
                  { id: 'androgen', label: isEs ? 'Testosterona' : 'Testosterone', count: categoryCounts.androgen },
                  { id: 'progesterone', label: isEs ? 'Progesterona' : 'Progesterone', count: categoryCounts.progesterone },
                  { id: 'synergy', label: 'T + Anastrozole', count: categoryCounts.synergy },
                  { id: 'trocar', label: isEs ? 'Trócares' : 'Trocars', count: categoryCounts.trocar },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat.id}
                    className={`pellets-mobile-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.label}</span>
                    <span className="pellets-mobile-cat-pill-count">{cat.count}</span>
                  </button>
                ))}
                <Link
                  href="/guides/hormone-pellets-implantation"
                  className="pellets-mobile-cat-pill"
                  style={{ textDecoration: 'none', color: '#0d9488', borderColor: '#99f6e4', background: '#f0fdfa' }}
                >
                  <Activity size={12} />
                  <span>{isEs ? 'Guía Trócar' : 'Trocar Guide'}</span>
                </Link>
              </div>

              {/* Active Filter Chips (Rule #24) */}
              {(selectedCategory !== 'all' || searchQuery.trim()) && (
                <div className="pellets-active-chips">
                  {selectedCategory !== 'all' && (
                    <span className="pellets-chip">
                      <span>{isEs ? 'Categoría:' : 'Category:'} {selectedCategory}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className="pellets-chip-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="pellets-chip">
                      <span>{isEs ? 'Búsqueda:' : 'Query:'} &ldquo;{searchQuery}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="pellets-chip-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {isEs ? 'Limpiar filtros' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>

            {/* DataTable (Strict Rule #3 & Rule #4 + Symmetric Mobile Card UX) */}
            {filteredProducts.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredProducts}
                expandableRender={expandableRender}
                mobileCardComponent={PelletMobileCard}
                mobileCardProps={{
                  formatPrice,
                  cartItems,
                  onAddToCart: handleAddToCart,
                  onUpdateQuantity: handleUpdateQuantity,
                  isEs,
                }}
                pagination={false}
              />
            ) : (
              <EmptyState
                icon={Syringe}
                title={isEs ? 'No se encontraron formulaciones' : 'No formulations found'}
                subtitle={isEs
                  ? 'Prueba a cambiar los filtros de categoría o el término de búsqueda.'
                  : 'Try modifying your search criteria or category filter.'}
                action={{
                  label: isEs ? 'Restablecer filtros' : 'Reset Filters',
                  onClick: () => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── FLOATING BOTTOM CART / RFQ DOCK ── */}
      {cartSummary.totalItems > 0 && (
        <div className="pellets-cart-dock">
          <div className="pellets-cart-dock-inner">
            <div className="pellets-cart-summary">
              <span className="pellets-cart-badge">
                <ShoppingCart size={13} style={{ marginRight: '4px' }} />
                {cartSummary.totalItems} {isEs ? 'unidades' : 'units'}
              </span>
              <div className="pellets-cart-subtotal">
                <span className="pellets-cart-subtotal-lbl">
                  {isEs ? 'Subtotal Estimado Cotización' : 'Estimated RFQ Subtotal'}
                </span>
                <span className="pellets-cart-subtotal-val">
                  {cartSummary.formattedTotal}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setCartItems({})}
              >
                <span>{isEs ? 'Vaciar' : 'Clear'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => setIsInquiryDrawerOpen(true)}
              >
                <CheckCircle2 size={14} />
                <span>{isEs ? 'Solicitar Asignación / Cotización Formal' : 'Request Allocation / Official Quote'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── B2B INQUIRY DRAWER ── */}
      {isInquiryDrawerOpen && (
        <PublicInstitutionalInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          contextType="pellets_b2b_schedule"
          brandType="pellets_schedule"
          lang={lang}
          customNotes={`Subcutaneous Hormone Pellets RFQ Request. Currency: ${currency}. Selected items: ${JSON.stringify(cartItems)}`}
        />
      )}

      {/* ── OFFICIAL PRICE SCHEDULE PDF PREVIEW MODAL ── */}
      {isPdfPreviewOpen && (
        <PelletPricePdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          products={initialProducts}
          currency={currency}
          currencySymbol={currencySymbol}
          formatPrice={formatPrice}
          lang={lang}
          isAdmin={isAdmin}
        />
      )}

      {/* ── FOOTER ── */}
      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
