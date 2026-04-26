import { useEffect, useState } from 'react';
import { X, Globe, Activity } from 'lucide-react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { resolveVariantPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';



// ─── Protocol bundle card (Floating Glass style) ────────────────────────────
function ProtocolBundleCard({ entry, onRemove }) {
  const { name, goal, phases, products = [], estimatedCost } = entry;
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
          onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={14} />
        </button>
      </div>
      {/* Body — pills + nested supply breakdown */}
      <div style={{ padding: '0.75rem 1rem' }}>
        {/* Pills row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: products.length > 0 ? '0.6rem' : 0 }}>
          {phases > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--background)', border: '0.5px solid var(--border)', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
              {phases} phase{phases !== 1 ? 's' : ''}
            </span>
          )}
          {estimatedCost > 0 && (
            <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              ~${estimatedCost.toFixed(0)}
            </span>
          )}
        </div>
        {/* Nested supply list */}
        {products.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {products.map(p => (
              <div key={p} style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.28rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(0,163,224,0.05)',
              }}>
                <Activity size={10} color="var(--primary)" strokeWidth={2} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>{p}</span>
              </div>
            ))}
            {products.length > 4 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>+{products.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function Cart({ isOpen, onClose, cart, cartMetadata = {}, updateCart, region, isProfessional, EXCHANGE_RATES, onCheckout, products, protocolRequests = [], removeProtocolRequest, shippingCosts = { standard: 0, express: 50, courier: 30 } }) {
  const { tier } = usePricingTier();
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [activeTab, setActiveTab] = useState('protocols');

  // Auto-select first available tab when cart content changes
  useEffect(() => {
    const allCounts = {
      protocols: (cartMetadata.protocolBundles ?? []).length + protocolRequests.length,
      kits: 0,
      peptides: 0,
    };
    // kits/peptides counts will be computed later but this effect is just for fallback
    setActiveTab(prev => {
      const available = ['protocols', 'kits', 'peptides'];
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

  if (!isOpen) return null;

  const cartItems = Object.entries(cart);
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

      let namePart = itemKey;
      let dosagePart = null;
      if (itemKey.includes('(')) {
        const match = itemKey.match(/(.+) \((.+)\)/);
        if (match) {
          namePart = match[1];
          dosagePart = match[2];
        }
      }

      const product = products.find(p => p.name === namePart);

      if (product) {
        const matchedVariant = dosagePart
          ? product.variants?.find(v => v.dosage === dosagePart || v.strength === dosagePart)
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
      }
    });

    // Phase 2: Add bundleTotal from cartMetadata.protocolBundles
    const bundles = cartMetadata.protocolBundles ?? [];
    bundles.forEach(b => { totalUSD += b.bundleTotal ?? b.estimatedCost ?? 0; });

    // Also add estimatedCost from individual protocol-tagged items if no bundleTotal on the group
    cartItems.forEach(([itemKey]) => {
      const m = cartMetadata[itemKey];
      if (!m || (!m.isProtocol && !m.protocolId)) return;
      if (m.bundleTotal != null) totalUSD += m.bundleTotal;
    });

    // ─── Shipping cost ───────────────────────────────────────────────────────
    const shippingCost = shippingCosts[selectedShipping] ?? 0;
    totalUSD += shippingCost;

    const formatValue = (val) => {
      if (isNaN(val)) return '0';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return {
      display: `$${formatValue(totalUSD.toFixed(0))}`,
      savings: totalSavingsUSD > 0 ? `$${formatValue(totalSavingsUSD.toFixed(0))}` : null,
      shippingCost,
      subtext: shippingCost > 0
        ? `Includes $${shippingCost} ${selectedShipping} shipping estimate`
        : 'Standard shipping included · Final tax at checkout'
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
        estimatedCost: 0,
      };
    }
    protocolGroupMap[pid].products.push(key);
  });

  // Merge metaBundles into protocolGroupMap (they may not have individual cart items yet)
  metaBundles.forEach(bundle => {
    if (!protocolGroupMap[bundle.id]) {
      protocolGroupMap[bundle.id] = { ...bundle };
    }
  });

  const protocolGroups = Object.values(protocolGroupMap);

  // Individual items: exclude those already inside a protocol
  const cartItemEntries = cartItems.filter(([key]) => !protocolItemKeys.has(key));

  // ─── Tab classification ───────────────────────────────────────────────────
  // Kits: qty >= 10 (purchased using the Kit stepper by pro users)
  // Peptides: qty < 10 (individual unit purchases)
  const kitItems     = cartItemEntries.filter(([, qty]) => qty >= 10);
  const peptideItems = cartItemEntries.filter(([, qty]) => qty < 10);

  // Tabs — only show when they have content
  const tabs = [
    { key: 'protocols', label: 'Protocols', count: protocolGroups.length + protocolRequests.length },
    { key: 'kits',      label: 'Kits',      count: kitItems.length },
    { key: 'peptides',  label: 'Peptides',  count: peptideItems.length },
  ].filter(t => t.count > 0);

  // ─── Item row renderer ────────────────────────────────────────────────────
  const renderItem = ({ itemKey, qty, meta }) => {
    let namePart = itemKey;
    let dosagePart = null;
    if (itemKey.includes('(')) {
      const match = itemKey.match(/(.+) \((.+)\)/);
      if (match) { namePart = match[1]; dosagePart = match[2]; }
    }
    const product = products?.find(p => p.name === namePart);

    // Per-unit price for display
    let perUnitPrice = null;
    if (product) {
      const matchedVariant = dosagePart
        ? product.variants?.find(v => v.dosage === dosagePart || v.strength === dosagePart)
        : null;
      const pricingSource = matchedVariant ?? product.defaultVariant ?? product.variants?.[0] ?? product;
      const resolved = resolveVariantPrice(pricingSource, { tier });
      if (resolved.perUnit) perUnitPrice = resolved.perUnit;
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
              onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'; }}
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

      {/* Drawer — Floating Glass */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
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
        `}</style>

        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>Your Research List</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {totalItems > 0 && `${totalItems} unit${totalItems !== 1 ? 's' : ''}`}
              {totalItems > 0 && (protocolGroups.length > 0 || protocolRequests.length > 0) && ' · '}
              {(protocolGroups.length > 0 || protocolRequests.length > 0) &&
                `${protocolGroups.length || protocolRequests.length} protocol${(protocolGroups.length || protocolRequests.length) !== 1 ? 's' : ''}`}
              {!hasContent && 'Empty'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--background)', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-main)',
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--border)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {!hasContent ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', padding: '1.5rem' }}>
              <Globe size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your research list is empty.</p>
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
                          color: '#fff',
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

                {/* PEPTIDES tab */}
                {activeTab === 'peptides' && (
                  <div>
                    {peptideItems.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>No individual peptides yet.</p>
                    ) : (
                      peptideItems.map(([itemKey, qty]) => renderItem({ itemKey, qty, meta: cartMetadata[itemKey] }))
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

          {/* ── Shipping Method Selector ── */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Shipping Method
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { key: 'standard', label: 'Standard', desc: `$${shippingCosts.standard}` },
                { key: 'express',  label: 'Express',  desc: `$${shippingCosts.express}` },
                { key: 'courier',  label: 'Courier',  desc: `$${shippingCosts.courier}` },
              ].map(({ key, label, desc }) => (
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
                  <div style={{ fontSize: '0.68rem', color: selectedShipping === key ? 'var(--primary)' : 'var(--text-muted)', marginTop: '0.1rem' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {savings && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Kit Savings Applied</span>
              <span>-{savings}</span>
            </div>
          )}
          {shippingCost > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>{selectedShipping.charAt(0).toUpperCase() + selectedShipping.slice(1)} Shipping</span>
              <span>${shippingCost}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingTop: shippingCost > 0 || savings ? '0.4rem' : 0, borderTop: (shippingCost > 0 || savings) ? '0.5px solid var(--border)' : 'none' }}>
            <span style={{ fontWeight: 600 }}>Total Estimate</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
              {display || '---'}
            </span>
          </div>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            *{subtext}.
          </p>

          <button
            onClick={onCheckout}
            className="btn btn-primary"
            disabled={!hasContent}
            style={{
              width: '100%', padding: '1rem',
              fontWeight: 700, fontSize: '1rem',
              backgroundColor: !hasContent ? '#94a3b8' : 'var(--primary)',
              borderColor: !hasContent ? '#94a3b8' : 'var(--primary)',
              cursor: !hasContent ? 'not-allowed' : 'pointer',
              opacity: !hasContent ? 0.6 : 1
            }}
          >
            Request Quotation
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Total limit: 20 units per research inquiry.
          </p>
        </div>
      </div>
    </>
  );
}
