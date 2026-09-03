import { Beaker, Globe, Activity, AlertTriangle, X, Briefcase, FileText, Building2, Stethoscope, Send, Share2, Download, Layers, Sparkles, Plus, Trash2, DollarSign, Check, Folder, Save, ChevronDown, Clock, CheckCircle } from '@/lib/icons';
import notifier from '../services/NotificationService';
import { dispatchToQuotation, dispatchToSupplierRFQ, dispatchToPrescription } from '../services/WorkspaceDispatcher';
import { groupWorkspaceByFulfillment } from '../utils/workspaceLogisticsHelper';
import { saveWorkspaceDraft, getUserWorkspaceDrafts, deleteWorkspaceDraft } from '../repositories/workspaceDraftRepository';
import { checkWorkspaceClinicalStatus } from '../utils/workspaceClinicalChecker';
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useEffect, useState, useMemo } from 'react';





import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { resolveVariantPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';
import { trackEvent } from '../hooks/useAnalytics';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../stores/uiStore';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { useRouter } from 'next/navigation';
import { EXCHANGE_RATES } from '../utils/currencies';
import { useClinicalContextStore } from '../stores/clinicalContextStore';
import { getPatientsByDoctor } from '../repositories/userRepository';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';



// ─── Protocol bundle card (Floating Glass style) ────────────────────────────
function ProtocolBundleCard({ entry, onRemove }) {
  const { name, goal, phases, products = [], estimatedCost } = entry;

  // Compute total from product prices if available; fallback to estimatedCost
  const computedTotal = products.length > 0 && products.some(p => typeof p === 'object' && p.price > 0)
    ? products.reduce((sum, p) => {
        if (typeof p === 'string') return sum;
        return sum + (p.price ?? 0) * (p.qty ?? 1);
      }, 0)
    : estimatedCost ?? 0;

  const displayTotal = computedTotal > 0 ? computedTotal : estimatedCost ?? 0;

  return (
    <div style={{
      border: '0.5px solid rgba(0,163,224,0.25)',
      borderRadius: '14px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      marginBottom: '0.5rem',
      boxShadow: '0 2px 12px rgba(0,113,189,0.07)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
        padding: '0.8rem 1rem',
        background: 'linear-gradient(135deg, rgba(0,163,224,0.07) 0%, rgba(0,113,189,0.04) 100%)',
        borderBottom: '0.5px solid rgba(0,163,224,0.12)'
      }}>
        <Activity size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', lineHeight: 1.3 }}>{name}</div>
          {goal && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{goal}</div>}
        </div>
        <button
          onClick={() => onRemove(entry.id)}
          title="Remove protocol"
          style={{ padding: '0.2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body — pills + itemized product list */}
      <div style={{ padding: '0.75rem 1rem' }}>
        {/* Pills row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: products.length > 0 ? '0.65rem' : 0 }}>
          <span style={{ 
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em',
            color: 'var(--color-bg-surface)', backgroundColor: 'var(--primary)', 
            padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase'
          }}>
            Bundle
          </span>
          {phases > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--background)', border: '0.5px solid var(--border)', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
              {phases} phase{phases !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Itemized product list */}
        {products.length > 0 && (
          <div
            className="pse-products-scroll"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}
          >
            {/* Column header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              gap: '0.5rem', paddingBottom: '0.3rem',
              borderBottom: '0.5px solid rgba(0,163,224,0.15)',
              marginBottom: '0.15rem',
            }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Product</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', textAlign: 'center' }}>Qty</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', textAlign: 'right' }}>Subtotal</span>
            </div>

            {products.map((p, idx) => {
              const label     = typeof p === 'string' ? p : (p.name || p.label || '—');
              const qty       = typeof p === 'object' ? (p.qty ?? 1) : null;
              const unitPrice = typeof p === 'object' ? (p.price ?? 0) : 0;
              const lineTotal = unitPrice * (qty ?? 1);

              return (
                <div key={`${label}-${idx}`} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  gap: '0.5rem', alignItems: 'center',
                  padding: '0.3rem 0.5rem',
                  borderRadius: '7px',
                  background: p.isAccessory ? 'rgba(100,116,139,0.05)' : 'rgba(0,163,224,0.05)',
                  border: `0.5px solid ${p.isAccessory ? 'rgba(100,116,139,0.1)' : 'rgba(0,163,224,0.09)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                    <Activity size={9} color={p.isAccessory ? 'var(--color-text-tertiary)' : 'var(--primary)'} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: p.isAccessory ? 'var(--text-muted)' : 'var(--primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {label}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center', minWidth: '24px' }}>
                    ×{qty ?? 1}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: lineTotal > 0 ? '#0f172a' : 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {lineTotal > 0 ? `$${lineTotal.toFixed(0)}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '0.65rem',
          paddingTop: '0.55rem',
          borderTop: '1px solid rgba(0,163,224,0.18)',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Protocol Total
          </span>
          <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--primary)', letterSpacing: '-0.01em' }}>
            {displayTotal > 0 ? `$${displayTotal.toFixed(0)}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}


export default function Cart() {
  const { cart, cartMetadata = {}, updateCart } = useCart();
  const { tier } = usePricingTier();
  const { isProfessional, region } = useAuth();
  const { activeModal, setActiveModal } = useUIStore();
  const { catalogue: products } = useFirestoreData();
  const router = useRouter();
  const { userProfile } = useAuth();
  
  // Clinical Context & Patient Selection
  const activePatient = useClinicalContextStore(s => s.activePatient);
  const setActivePatient = useClinicalContextStore(s => s.setActivePatient);
  const clearCart = useCart(s => s.clearCart); // Need clearCart for checkout
  
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    if (userProfile?.role === 'doctor') {
      getPatientsByDoctor(userProfile.uid).then(setPatients).catch(console.error);
    }
  }, [userProfile]);

  const isOpen = activeModal === 'cart';
  const onClose = () => setActiveModal(null);

  const [selectedShipping, setSelectedShipping] = useState('standard');
  const shippingCosts = { standard: 40, express: 80 };
  const deliveryTimes = { standard: '5-7 days', express: '2-3 days' };
  const protocolRequests = [];
  const removeProtocolRequest = () => {};

  const [activeTab, setActiveTab] = useState('protocols');

  // Auto-select first available tab when cart content changes
  useEffect(() => {
    const allCounts = {
      protocols: (cartMetadata.protocolBundles ?? []).length + protocolRequests.length,
      kits: 0,
      products: 0,
    };
    // kits/products counts will be computed later but this effect is just for fallback
    setActiveTab(prev => {
      const available = ['protocols', 'kits', 'products'];
      // Stay on current if it might still have items; let tab rendering handle empty states
      return available.includes(prev) ? prev : 'protocols';
    });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen]);

  // ─── Phase 2: Detect header height dynamically ────────────────────────────
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const update = () => setHeaderHeight(header.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // ─── Phase 5: ESC key closes drawer ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cartItems = Object.entries(cart || {});
  const totalItems = cartItems.reduce((acc, [_, qty]) => acc + qty, 0);
  // hasContent considers both individual items AND auto-detected protocol groups
  // (protocolGroups is computed below after calculateTotal, so we re-evaluate here lazily)
  const hasContent = totalItems > 0 || protocolRequests.length > 0 || (cartMetadata.protocolBundles ?? []).length > 0;

  // ─── Price calculation ────────────────────────────────────────────────────
  const calculateTotal = () => {
    let totalUSD = 0;
    let totalSavingsUSD = 0;

    // Sum individual (non-protocol) items via resolveVariantPrice
    cartItems.forEach(([itemKey, qty]) => {
      // Skip items that are part of a protocol bundle — they are priced via bundleTotal
      const m = cartMetadata[itemKey];
      if (m && (m.isProtocol === true || m.protocolId)) return;

      let namePart = m?.name || itemKey.split('::')[0];
      let dosagePart = m?.dosage || null;

      const product = products?.find(p => p.id === (m?.productId || itemKey.split('::')[0]) || p.name === namePart);

      if (product) {
        const matchedVariant = dosagePart
          ? product.variants?.find(v => v.id === m?.variantId || v.dosage === dosagePart || v.strength === dosagePart)
          : null;
        const pricingSource = matchedVariant ?? product.defaultVariant ?? product.variants?.[0] ?? product;
        const resolved = resolveVariantPrice(pricingSource, { tier });
        const productVial = resolved.perUnit ?? 0;
        const productKit  = resolved.kit     ?? 0;

        if (isProfessional && product.category !== "Research Supplies" && productKit > 0) {
          const kits = Math.floor(qty / 10);
          const individuals = qty % 10;
          const standardCost   = qty * productVial;
          const discountedCost = (kits * productKit) + (individuals * productVial);
          totalUSD += discountedCost;
          totalSavingsUSD += (standardCost - discountedCost);
        } else {
          totalUSD += qty * productVial;
        }
      } else {
        const metaPrice = cartMetadata[itemKey]?.price;
        if (metaPrice != null && metaPrice > 0) {
          totalUSD += qty * metaPrice;
        }
      }
    });

    // Phase 2: Add bundleTotal from cartMetadata.protocolBundles (single source of truth)
    // Individual protocol-tagged items are excluded from per-unit pricing above (line 149)
    // so we only need to count the bundle total here — no double-counting.
    const bundles = cartMetadata.protocolBundles ?? [];
    bundles.forEach(b => { totalUSD += b.bundleTotal ?? b.estimatedCost ?? 0; });

    // ─── Shipping cost (only when cart has items) ────────────────────────────
    const shippingCost = hasContent ? (shippingCosts[selectedShipping] ?? 0) : 0;
    totalUSD += shippingCost;

    const formatValue = (val) => {
      if (isNaN(val)) return '0';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return {
      display: `$${formatValue(totalUSD.toFixed(0))}`,
      savings: totalSavingsUSD > 0 ? `$${formatValue(totalSavingsUSD.toFixed(0))}` : null,
      shippingCost,
      subtext: hasContent && shippingCost > 0
        ? `Includes $${shippingCost} ${selectedShipping} shipping estimate`
        : hasContent
          ? 'Standard shipping included · Final tax at checkout'
          : null,
    };
  };

  const { display, savings, shippingCost, subtext } = calculateTotal();

  // ─── Phase 1: Detect protocol items via cartMetadata ─────────────────────
  // An item belongs to a protocol if its metadata has isProtocol:true or a protocolId.
  const protocolItemKeys = new Set(
    cartItems
      .filter(([key]) => {
        const m = cartMetadata[key];
        return m && (m.isProtocol === true || m.protocolId);
      })
      .map(([key]) => key)
  );

  // Also collect protocol bundles stored directly in cartMetadata.protocolBundles
  const metaBundles = cartMetadata.protocolBundles ?? [];

  // Group protocol items by protocolId for the ProtocolBundleCard renderer
  const protocolGroupMap = {};
  // 1. First, populate from metaBundles (explicitly added bundles).
  //    Keep bundle.products (array of peptide names) — don't overwrite with [].
  metaBundles.forEach(bundle => {
    protocolGroupMap[bundle.id] = {
      ...bundle,
      // Ensure products is always an array (ProtocolSupplyEngine sends string[]).
      products: Array.isArray(bundle.products) ? bundle.products : [],
      estimatedCost: bundle.bundleTotal ?? bundle.estimatedCost ?? 0
    };
  });

  // 2. Then, map individual items to these bundles or create ad-hoc groups
  cartItems.forEach(([key, qty]) => {
    const m = cartMetadata[key];
    if (!m || (!m.isProtocol && !m.protocolId)) return;
    const pid = m.protocolId ?? 'protocol';
    if (!protocolGroupMap[pid]) {
      protocolGroupMap[pid] = {
        id: pid,
        name: m.protocolName ?? pid,
        goal: m.protocolGoal ?? '',
        phases: m.protocolPhases ?? 0,
        products: [],
        estimatedCost: m.bundleTotal ?? 0,
      };
    }
    if (!protocolGroupMap[pid].products.includes(key)) {
      protocolGroupMap[pid].products.push(key);
    }
  });

  const protocolGroups = Object.values(protocolGroupMap);

  // Individual items: exclude those already inside a protocol
  const cartItemEntries = cartItems.filter(([key]) => !protocolItemKeys.has(key));

  // ─── Workspace Buffer Computations ─────────────────────────────────────────
  const workspaceItemsList = useMemo(() => {
    return cartItems.map(([key, qty]) => {
      const meta = cartMetadata[key] || {};
      const parts = key.split('::');
      return {
        key,
        productId: meta.productId || parts[0],
        variantId: meta.variantId || parts[1] || 'default',
        name: meta.name || parts[0],
        dosage: meta.dosage || '',
        presentation: meta.presentation || 'vial',
        price: Number(meta.price || 0),
        costPrice: Number(meta.costPrice || meta.unitCost || 0),
        supplierId: meta.supplierId || null,
        supplierName: meta.supplierName || '',
        quantity: Number(qty || 1),
        bundleMeta: meta.bundleMeta || null
      };
    });
  }, [cartItems, cartMetadata]);

  // Clinical Synergies & Redundancy Intelligence
  const clinicalStatus = useMemo(() => {
    return checkWorkspaceClinicalStatus(workspaceItemsList);
  }, [workspaceItemsList]);

  // Split-Fulfillment Logistics Hubs
  const fulfillmentGroups = useMemo(() => {
    return groupWorkspaceByFulfillment(workspaceItemsList);
  }, [workspaceItemsList]);

  // Cloud Drafts State
  const [draftsList, setDraftsList] = useState([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [draftNameInput, setDraftNameInput] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile?.uid) {
      getUserWorkspaceDrafts(userProfile.uid).then(setDraftsList).catch(console.error);
    }
  }, [isOpen, userProfile]);

  const handleSaveDraft = async () => {
    if (!userProfile?.uid) {
      notifier.error('Please log in to save workspace drafts to the cloud.');
      return;
    }
    try {
      setIsSavingDraft(true);
      const name = draftNameInput.trim() || `Workspace Staging (${new Date().toLocaleDateString()})`;
      await saveWorkspaceDraft(userProfile.uid, {
        name,
        items: workspaceItemsList,
        metadata: cartMetadata,
        targetType: userProfile.role === 'doctor' ? 'prescription' : 'quotation',
        currency: 'USD'
      });
      setDraftNameInput('');
      setShowDraftsModal(false);
      const updated = await getUserWorkspaceDrafts(userProfile.uid);
      setDraftsList(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleLoadDraft = (draft) => {
    if (!draft?.items) return;
    draft.items.forEach(item => {
      updateCart(item.key, item.quantity, {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        dosage: item.dosage,
        presentation: item.presentation,
        price: item.price,
        costPrice: item.costPrice,
        supplierId: item.supplierId
      });
    });
    notifier.success(`Loaded draft "${draft.name}" into Workspace Buffer!`);
    setShowDraftsModal(false);
  };

  // ─── Tab classification ───────────────────────────────────────────────────
  // Kits: qty >= 10 (purchased using the Kit stepper by pro users)
  // Products: qty < 10 (individual unit purchases — peptides, supplements, etc.)
  const kitItems      = cartItemEntries.filter(([, qty]) => qty >= 10);
  const productItems  = cartItemEntries.filter(([, qty]) => qty < 10);

  // Tabs — only show when they have content
  const tabs = [
    { key: 'protocols', label: 'Protocols', count: protocolGroups.length + protocolRequests.length },
    { key: 'kits',      label: 'Kits',      count: kitItems.length },
    { key: 'products',  label: 'Products',  count: productItems.length },
  ].filter(t => t.count > 0);

  // ─── Clinical Compatibility Insights ──────────────────────────────────────
  // Cross-reference cart products against each other to detect:
  //  1. Shared metabolism pathway (pharmacokinetics.metabolism)
  //  2. Shared mechanistic keyword (mechanismOfAction.summary)
  // Only runs when there are ≥2 non-protocol individual items.
  const clinicalInsights = useMemo(() => {
    if (!products || cartItemEntries.length < 2) return [];

    // Resolve full product records for items in the cart
    const cartProducts = cartItemEntries.map(([key]) => {
      const m = cartMetadata[key];
      const prodId = m?.productId || key.split('::')[0];
      return products.find(p => p.id === prodId || p.name === m?.name) ?? null;
    }).filter(Boolean);

    if (cartProducts.length < 2) return [];

    const insights = [];
    const seen = new Set();

    for (let i = 0; i < cartProducts.length; i++) {
      for (let j = i + 1; j < cartProducts.length; j++) {
        const a = cartProducts[i];
        const b = cartProducts[j];
        const pairKey = [a.name, b.name].sort().join('|');
        if (seen.has(pairKey)) continue;

        // Check shared metabolism
        const metaA = a.pharmacokinetics?.metabolism?.toLowerCase() ?? '';
        const metaB = b.pharmacokinetics?.metabolism?.toLowerCase() ?? '';
        if (metaA && metaB) {
          const wordsA = metaA.split(/[\s,;/]+/).filter(w => w.length > 4);
          const wordsB = new Set(metaB.split(/[\s,;/]+/).filter(w => w.length > 4));
          const shared = wordsA.filter(w => wordsB.has(w));
          if (shared.length > 0) {
            seen.add(pairKey);
            insights.push({
              type: 'metabolism',
              peptides: [a.name, b.name],
              message: `${a.name} and ${b.name} share a ${shared[0]} metabolic pathway. Monitor for additive clearance effects.`,
            });
            continue;
          }
        }

        // Check shared mechanism keyword
        const mechA = (a.typeData?.peptide?.mechanismOfAction?.summary || a.mechanismOfAction?.summary || '').toLowerCase();
        const mechB = (b.typeData?.peptide?.mechanismOfAction?.summary || b.mechanismOfAction?.summary || '').toLowerCase();
        const SHARED_TERMS = ['ghrh', 'igf-1', 'collagen', 'cortisol', 'testosterone', 'estrogen', 'inflammation', 'angiogenesis', 'fibrosis', 'nrf2', 'mtor', 'bpc', 'melanocortin', 'ghrelin'];
        for (const term of SHARED_TERMS) {
          if (mechA.includes(term) && mechB.includes(term)) {
            seen.add(pairKey);
            insights.push({
              type: 'mechanism',
              peptides: [a.name, b.name],
              message: `${a.name} and ${b.name} both modulate ${term.toUpperCase()} pathways. Stacking may amplify effects — use with caution.`,
            });
            break;
          }
        }
      }
    }

    return insights.slice(0, 3); // cap at 3 insights
  }, [cartItemEntries, products]);

  // ─── Item row renderer ────────────────────────────────────────────────────
  const renderItem = ({ itemKey, qty, meta }) => {
    let namePart = meta?.name || itemKey.split('::')[0];
    let dosagePart = meta?.dosage || null;

    const product = products?.find(p => p.id === (meta?.productId || itemKey.split('::')[0]) || p.name === namePart);

    // Per-unit price for display
    // 1. Try static products catalog (peptides)
    // 2. Fall back to price stored in cartMetadata (supplements from Firestore)
    let perUnitPrice = null;
    if (product) {
      const matchedVariant = dosagePart
        ? product.variants?.find(v => v.dosage === dosagePart || v.strength === dosagePart)
        : null;
      const pricingSource = matchedVariant ?? product.defaultVariant ?? product.variants?.[0] ?? product;
      const resolved = resolveVariantPrice(pricingSource, { tier });
      if (resolved.perUnit) perUnitPrice = resolved.perUnit;
    } else {
      // Supplement or Firestore-only item: price was stored in cartMetadata
      const metaPrice = cartMetadata[itemKey]?.price;
      if (metaPrice != null && metaPrice > 0) perUnitPrice = metaPrice;
    }

    return (
      <div key={itemKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: '0.5px solid var(--border)' }}>
        {/* Left: name + dosage + qty label */}
        <div style={{ flex: 1, paddingRight: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2, fontSize: '0.88rem' }}>
                {namePart}
              </div>
              {dosagePart && (
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.25rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  backgroundColor: 'rgba(0,163,224,0.08)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.02em'
                }}>
                  {dosagePart}
                </span>
              )}
            </div>
            <button
              onClick={() => updateCart(itemKey, -qty)}
              title="Remove item"
              style={{
                padding: '0.2rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                borderRadius: '4px',
                flexShrink: 0
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Qty label + per-unit price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isProfessional && qty >= 10
                ? `${Math.floor(qty / 10)} Kit(s) + ${qty % 10} Unit(s)`
                : `${qty} Unit(s)`}
            </span>
            {perUnitPrice != null && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                · <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${perUnitPrice}/unit</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: steppers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.2rem' }}>
          {/* Unit stepper */}
          <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <button onClick={() => updateCart(itemKey, -1)} style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>-</button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
              {isProfessional && product && product.category !== 'Research Supplies' ? qty % 10 : qty}
            </span>
            <button onClick={() => updateCart(itemKey, 1)} style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>+</button>
          </div>

          {/* Kit stepper (pro only) */}
          {isProfessional && product && product.category !== "Research Supplies" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kits:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0,163,224,0.05)' }}>
                <button onClick={() => updateCart(itemKey, -10)} style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}>-</button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{Math.floor(qty / 10)}</span>
                <button onClick={() => updateCart(itemKey, 10)} style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}>+</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const onCheckout = async () => {
    if (userProfile?.role === 'doctor') {
      if (!activePatient) {
        alert("Please select a patient first.");
        return;
      }
      try {
        const newPrescription = {
          patientId: activePatient.id,
          doctorId: userProfile.uid,
          items: cartItems.map(([key, qty]) => ({ name: key, quantity: qty })),
          protocolBundles: cartMetadata.protocolBundles || [],
          status: 'draft',
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'prescriptions'), newPrescription);
        // We will assume clearCart exists, if not we will fix it
        if (typeof clearCart === 'function') clearCart(); 
        setActiveModal(null);
        alert("Prescription created successfully!");
      } catch (err) {
        console.error("Error creating prescription", err);
        alert("Failed to create prescription.");
      }
    } else {
      setActiveModal(null);
      router.push('/checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Drawer — Floating Glass — Phase 1: positioned below header */}
      <div style={{
        position: 'fixed',
        top: headerHeight,
        right: 0,
        height: `calc(100vh - ${headerHeight}px)`,
        width: '100%', maxWidth: '450px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 2000,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        border: '0.5px solid rgba(255,255,255,0.6)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
          .pse-products-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .pse-products-scroll::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.03);
            border-radius: 10px;
          }
          .pse-products-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,163,224,0.2);
            border-radius: 10px;
          }
          .pse-products-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(0,163,224,0.4);
          }
        `}</style>

        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface, #ffffff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0,163,224,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Briefcase size={22} strokeWidth={2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.3rem', fontWeight: 800 }}>Workspace Buffer</h3>
                {totalItems > 0 && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,163,224,0.12)',
                    color: 'var(--primary)'
                  }}>
                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {userProfile?.role === 'admin' ? 'Staging area for B2B Quotes, Supplier RFQs & Purchase Orders' :
                 userProfile?.role === 'doctor' ? 'Clinical staging area for Prescriptions & Patient Plans' :
                 userProfile?.role === 'wholesaler' ? 'Staging area for Custom Catalogs & Bulk Inquiries' :
                 'Staging area for your health protocols & products'}
              </p>
            </div>
          </div>
          <button
            className="cartCloseBtn"
            onClick={onClose}
            aria-label="Cerrar workspace"
            style={{
              background: 'rgba(15,23,42,0.08)',
              border: '1.5px solid rgba(15,23,42,0.2)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0f172a',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.borderColor = 'var(--color-danger)';
              e.currentTarget.style.color = 'var(--color-danger)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(15,23,42,0.08)';
              e.currentTarget.style.borderColor = 'rgba(15,23,42,0.2)';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <X
              size={18}
              strokeWidth={2.5}
              style={{
                stroke: '#0f172a',
                fill: 'none',
                display: 'block',
                color: '#0f172a',
                flexShrink: 0,
              }}
            />
          </button>
        </div>

        {/* Cloud Drafts Staging Bar */}
        <div style={{
          padding: '0.6rem 2rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Clock size={14} />
            <span>Cloud Staging: <strong>{totalItems} active item{totalItems !== 1 ? 's' : ''}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {draftsList.length > 0 && (
              <button
                onClick={() => setShowDraftsModal(prev => !prev)}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--primary)'
                }}
              >
                <Folder size={12} /> Drafts ({draftsList.length})
              </button>
            )}
            <button
              onClick={() => setShowDraftsModal(true)}
              disabled={!hasContent || isSavingDraft}
              style={{
                background: hasContent ? 'var(--primary)' : '#e2e8f0',
                color: hasContent ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: hasContent ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Save size={12} /> {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>

        {/* Drafts Modal / Drawer Overlay */}
        {showDraftsModal && (
          <div style={{
            padding: '1rem 2rem',
            backgroundColor: '#ffffff',
            borderBottom: '2px solid var(--primary)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Save Current Workspace or Load Stored Draft
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: draftsList.length > 0 ? '0.75rem' : 0 }}>
              <input
                type="text"
                value={draftNameInput}
                onChange={(e) => setDraftNameInput(e.target.value)}
                placeholder="Draft Name (e.g. Dr. Chen Q3 Quotation)..."
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft || !hasContent}
                style={{
                  backgroundColor: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>

            {draftsList.length > 0 && (
              <div style={{ maxHeight: '120px', overflowY: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Stored Cloud Drafts:</div>
                {draftsList.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', fontSize: '0.78rem' }}>
                    <span><strong>{d.name}</strong> ({d.itemCount || d.items?.length || 0} items)</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleLoadDraft(d)}
                        style={{ background: 'none', border: '1px solid #0284c7', color: '#0284c7', borderRadius: '4px', padding: '1px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        Load
                      </button>
                      <button
                        onClick={async () => {
                          await deleteWorkspaceDraft(d.id);
                          const updated = await getUserWorkspaceDrafts(userProfile.uid);
                          setDraftsList(updated);
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patient Selector (Doctor only) */}
        {userProfile?.role === 'doctor' && (
          <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,163,224,0.03)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Assign Prescription to Patient
            </div>
            <select 
              value={activePatient ? activePatient.id : ''}
              onChange={(e) => {
                const pat = patients.find(p => p.id === e.target.value);
                setActivePatient(pat || null);
              }}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="">-- Select a Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.displayName || p.email}</option>
              ))}
            </select>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {!hasContent ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', padding: '1.5rem' }}>
              <Globe size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your sample order is empty.</p>
            </div>
          ) : (
            <>
              {/* ── Segmented Tabs ── */}
              {tabs.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '0.35rem',
                  padding: '0.75rem 1.5rem 0',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  flexShrink: 0,
                }}>
                  {tabs.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '20px',
                          border: isActive ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                          background: isActive ? 'rgba(0,163,224,0.08)' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.18s ease',
                          flexShrink: 0,
                        }}
                      >
                        {tab.label}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '18px',
                          height: '18px',
                          padding: '0 5px',
                          borderRadius: '20px',
                          background: isActive ? 'var(--primary)' : 'rgba(0,0,0,0.12)',
                          color: 'var(--color-bg-surface)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          lineHeight: 1,
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Tab Content ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.5rem', animation: 'tabFadeIn 0.2s ease-out' }}>
                <style>{`@keyframes tabFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                {/* ── Split-Fulfillment Logistics Bar ── */}
                {fulfillmentGroups.length > 0 && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                        📦 Multi-Hub Split-Fulfillment
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {fulfillmentGroups.length} dispatch hub{fulfillmentGroups.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {fulfillmentGroups.map(fg => (
                        <div key={fg.hub.id} style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: fg.hub.bg,
                          border: `1px solid ${fg.hub.border}`,
                          color: fg.hub.color,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <span>{fg.hub.badge}</span>
                          <span style={{ opacity: 0.8, fontSize: '0.65rem' }}>({fg.totalQuantity} units)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Clinical Synergies & Intelligence Banners ── */}
                {(clinicalStatus.synergies.length > 0 || clinicalStatus.redundancies.length > 0 || clinicalStatus.accessorySuggestion) && (
                  <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Synergies */}
                    {clinicalStatus.synergies.map((syn, idx) => (
                      <div key={`syn-${idx}`} style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                      }}>
                        <Sparkles size={15} color={syn.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: syn.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {syn.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#166534', lineHeight: 1.35, marginTop: '0.1rem' }}>
                            {syn.message}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Redundancies */}
                    {clinicalStatus.redundancies.map((red, idx) => (
                      <div key={`red-${idx}`} style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                      }}>
                        <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.76rem', color: '#92400e', lineHeight: 1.35 }}>
                          {red.message}
                        </div>
                      </div>
                    ))}

                    {/* Accessory Quick Add Banner */}
                    {clinicalStatus.accessorySuggestion && (
                      <div style={{
                        padding: '0.7rem 0.85rem',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0,163,224,0.06)',
                        border: '1.5px dashed rgba(0,163,224,0.3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)' }}>
                            💧 {clinicalStatus.accessorySuggestion.title}
                          </div>
                          <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {clinicalStatus.accessorySuggestion.description}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const acc = clinicalStatus.accessorySuggestion.itemPayload;
                            updateCart(`${acc.productId}::${acc.variantId}`, 1, acc);
                            notifier.success('BAC Water (30ml) added to Workspace Buffer!');
                          }}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          + Add ($12)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Clinical Compatibility Insights Banner ── */}
                {clinicalInsights.length > 0 && (
                  <div style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    {clinicalInsights.map((insight, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '10px',
                        backgroundColor: insight.type === 'metabolism' ? 'rgba(245,158,11,0.06)' : 'rgba(0,163,224,0.06)',
                        border: `1px solid ${insight.type === 'metabolism' ? 'rgba(245,158,11,0.25)' : 'rgba(0,163,224,0.2)'}`,
                        animation: 'tabFadeIn 0.3s ease-out both',
                      }}>
                        <div style={{ flexShrink: 0, marginTop: '1px' }}>
                          {insight.type === 'metabolism'
                            ? <AlertTriangle size={13} color="#f59e0b" />
                            : <Beaker size={13} color="var(--secondary)" />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.63rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: insight.type === 'metabolism' ? '#92400e' : 'var(--secondary)', marginBottom: '0.15rem' }}>
                            {insight.type === 'metabolism' ? 'Metabolic Overlap' : 'Mechanism Overlap'} · Clinical Insight
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: 1.4, fontWeight: 500 }}>
                            {insight.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PROTOCOLS tab */}
                {(activeTab === 'protocols' || tabs.length === 1) && (protocolGroups.length > 0 || protocolRequests.length > 0) && (
                  <div>
                    {protocolGroups.map(entry => (
                      <ProtocolBundleCard key={entry.id} entry={entry} onRemove={removeProtocolRequest} />
                    ))}
                    {protocolRequests
                      .filter(r => !protocolGroups.find(g => g.id === r.id))
                      .map(entry => (
                        <ProtocolBundleCard key={entry.id} entry={entry} onRemove={removeProtocolRequest} />
                      ))}
                  </div>
                )}

                {/* KITS tab */}
                {activeTab === 'kits' && (
                  <div>
                    {kitItems.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>No kit orders yet.</p>
                    ) : (
                      kitItems.map(([itemKey, qty]) => renderItem({ itemKey, qty, meta: cartMetadata[itemKey] }))
                    )}
                  </div>
                )}

                {/* PRODUCTS tab */}
                {activeTab === 'products' && (
                  <div>
                    {productItems.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>No individual products yet.</p>
                    ) : (
                      productItems.map(([itemKey, qty]) => renderItem({ itemKey, qty, meta: cartMetadata[itemKey] }))
                    )}
                  </div>
                )}

                {/* Fallback: single-tab (only one type of content) */}
                {tabs.length === 1 && tabs[0].key !== 'protocols' && (
                  <div>
                    {cartItemEntries.map(([itemKey, qty]) => renderItem({ itemKey, qty, meta: cartMetadata[itemKey] }))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>

          {/* ── Shipping Method Selector (only shown when cart has items) ── */}
          {hasContent && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Shipping Method
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                   { key: 'standard', label: 'Standard', price: `$${shippingCosts?.standard ?? 40}`, time: deliveryTimes?.standard ?? '5-7 days' },
                   { key: 'express',  label: 'Express',  price: `$${shippingCosts?.express  ?? 80}`, time: deliveryTimes?.express  ?? '2-3 days' },
                 ].map(({ key, label, price, time }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedShipping(key)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.4rem',
                      border: selectedShipping === key
                        ? '1.5px solid var(--primary)'
                        : '1px solid var(--border)',
                      borderRadius: '8px',
                      background: selectedShipping === key
                        ? 'rgba(0,163,224,0.08)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                   >
                     <div style={{ fontSize: '0.72rem', fontWeight: 700, color: selectedShipping === key ? 'var(--primary)' : 'var(--text-main)' }}>{label}</div>
                     <div style={{ fontSize: '0.68rem', color: selectedShipping === key ? 'var(--primary)' : 'var(--text-muted)', marginTop: '0.1rem' }}>{price}</div>
                     <div style={{ fontSize: '0.65rem', color: selectedShipping === key ? 'var(--primary)' : 'var(--text-muted)', opacity: 0.8 }}>{time}</div>
                   </button>
                ))}
              </div>
            </div>
          )}

          {hasContent && savings && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Kit Savings Applied</span>
              <span>-{savings}</span>
            </div>
          )}
          {hasContent && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingTop: savings ? '0.4rem' : 0, borderTop: savings ? '0.5px solid var(--border)' : 'none' }}>
              <span style={{ fontWeight: 600 }}>Total Estimate</span>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
                {display || '---'}
              </span>
            </div>
          )}
          {hasContent && (
            <div style={{ marginBottom: '1.5rem' }}>
               {/* Redundant subtext removed as requested */}
            </div>
          )}

          {/* Multi-Role Action Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {userProfile?.role === 'admin' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={async () => {
                    try {
                      const quoteRefNumber = `QUOT-${Date.now().toString().slice(-6)}`;
                      const itemsList = cartItems.map(([key, qty]) => {
                        const meta = cartMetadata[key] || {};
                        return {
                          key,
                          name: meta.name || key.split('::')[0],
                          dosage: meta.dosage || '',
                          quantity: qty,
                          price: meta.price || 0,
                          productId: meta.productId || key.split('::')[0],
                          variantId: meta.variantId || key.split('::')[1],
                          supplierId: meta.supplierId || null,
                        };
                      });

                      await dispatchToQuotation({
                        items: workspaceItemsList,
                        protocols: protocolGroups,
                        clientName: '',
                        currency: 'USD',
                        shippingCost: shippingCost || 0,
                        shippingMethod: selectedShipping,
                        createdBy: userProfile?.email || 'admin'
                      });
                    } catch (err) {
                      console.error('[Cart] Quotation error:', err);
                    }
                  }}
                  className="btn"
                  disabled={!hasContent}
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: hasContent ? 'pointer' : 'not-allowed',
                    opacity: hasContent ? 1 : 0.6
                  }}
                >
                  <FileText size={15} /> Emit B2B Quote
                </button>
                <button
                  onClick={async () => {
                    try {
                      await dispatchToSupplierRFQ({
                        items: workspaceItemsList,
                        requestedBy: userProfile?.email || 'admin'
                      });
                    } catch (err) {
                      console.error('[Cart] RFQ error:', err);
                    }
                  }}
                  className="btn"
                  disabled={!hasContent}
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    cursor: hasContent ? 'pointer' : 'not-allowed',
                    opacity: hasContent ? 1 : 0.6
                  }}
                >
                  <Building2 size={15} style={{ color: '#0284c7' }} /> Launch RFQ
                </button>
              </div>
            )}

            {userProfile?.role === 'doctor' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={async () => {
                    try {
                      if (!activePatient) {
                        notifier.error('Please select an active patient above to assign the prescription.');
                        return;
                      }
                      await dispatchToPrescription({
                        items: workspaceItemsList,
                        protocols: protocolGroups,
                        patientId: activePatient.id,
                        patientName: activePatient.name || activePatient.displayName || activePatient.email,
                        doctorId: userProfile?.uid,
                        doctorName: userProfile?.displayName || userProfile?.email
                      });
                    } catch (err) {
                      console.error('[Cart] Prescription error:', err);
                    }
                  }}
                  className="btn"
                  disabled={!hasContent}
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: hasContent ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Stethoscope size={15} /> Convert to Rx
                </button>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/recommendation/${Date.now().toString(36)}`;
                    navigator.clipboard?.writeText(link);
                    notifier.success('Patient recommendation link copied to clipboard!');
                  }}
                  className="btn"
                  disabled={!hasContent}
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    cursor: hasContent ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Share2 size={15} style={{ color: '#0d9488' }} /> Recommend
                </button>
              </div>
            )}

            {userProfile?.role === 'wholesaler' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    notifier.success('Generating Branded Wholesaler Catalog PDF...');
                    window.open('/api/generate-pdf?docType=catalog', '_blank');
                  }}
                  className="btn"
                  disabled={!hasContent}
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#c2410c',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: hasContent ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Download size={15} /> Export Catalog (PDF)
                </button>
                <button
                  onClick={() => {
                    notifier.success('Volume RFQ inquiry submitted to Admin desk!');
                  }}
                  className="btn"
                  disabled={!hasContent}
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    cursor: hasContent ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Send size={15} style={{ color: '#c2410c' }} /> Request Tier RFQ
                </button>
              </div>
            )}

            {/* B2C -> B2B Volume Threshold Bridge */}
            {(!userProfile?.role || userProfile?.role === 'patient' || userProfile?.role === 'customer') && totalItems >= 5 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                borderRadius: '10px',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.6rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 800 }}>Institutional Volume Detected ({totalItems} items)</div>
                  <div style={{ opacity: 0.9 }}>Save up to 35% with wholesale tier pricing.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    router.push('/checkout?role=professional');
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    background: '#d97706',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'
                  }}
                >
                  B2B Quote →
                </button>
              </div>
            )}

            <button
              onClick={() => {
                const itemNames = Object.keys(cart).join(', ');
                const protocolIds = protocolGroups.map(g => g.id).join(', ');
                trackEvent('purchase_intent', {
                  intent_type: 'cart_checkout',
                  protocol_id: protocolIds || 'none',
                  peptide_name: itemNames || 'none',
                  cart_total: display,
                  items_count: totalItems
                });
                onCheckout();
              }}
              className="btn btn-primary"
              disabled={!hasContent}
              style={{
                width: '100%', padding: '0.85rem',
                fontWeight: 700, fontSize: '0.95rem',
                backgroundColor: !hasContent ? 'var(--color-text-tertiary)' : 'var(--primary)',
                borderColor: !hasContent ? 'var(--color-text-tertiary)' : 'var(--primary)',
                cursor: !hasContent ? 'not-allowed' : 'pointer',
                opacity: !hasContent ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Briefcase size={16} />
              {userProfile?.role === 'doctor' ? 'Process Prescription Order' : 
               userProfile?.role === 'admin' ? 'Create Direct Purchase Order' : 
               userProfile?.role === 'wholesaler' ? 'Submit Wholesale PO' : 
               'Submit Sample Order'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}