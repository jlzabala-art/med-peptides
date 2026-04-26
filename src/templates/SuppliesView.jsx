import React, { useEffect, useMemo, useCallback } from 'react';
import { Droplets, Syringe, Info, CheckCircle, ShieldCheck, FlaskConical } from 'lucide-react';
import { resolveVariantPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';

const SuppliesView = ({
  onSelectProduct,
  updateCart,
  products = [],
  region,
  isProfessional,
  EXCHANGE_RATES
}) => {
  const { tier } = usePricingTier();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FASE 1: Optimización de Datos (Memoized)
  const supplies = useMemo(() => {
    if (!products.length) return [];

    const filtered = products.filter(p => p.category === "Research Supplies");
    const map = new Map();

    filtered.forEach(item => {
      const existing = map.get(item.name);
      // Prefer entries with a resolved price over price-less entries
      const variant = item.defaultVariant ?? item.variants?.[0] ?? item;
      const hasPrice = (p) => {
        const v = p.defaultVariant ?? p.variants?.[0] ?? p;
        return resolveVariantPrice(v, { tier }).perUnit != null;
      };
      if (!existing || (!hasPrice(existing) && hasPrice(item))) {
        map.set(item.name, item);
      }
    });

    return Array.from(map.values());
  }, [products, tier]);

  // FASE 1.1: Formateo de precios — resuelto desde datos de variante en Firestore
  const formatPrice = useCallback((item) => {
    if (!region || !EXCHANGE_RATES[region]) return '---';

    const variant = item.defaultVariant ?? item.variants?.[0] ?? item;
    const resolved = resolveVariantPrice(variant, { tier });
    const priceUSD = resolved.perUnit ?? 0;

    const formatValue = (val) => val.toLocaleString(region === 'row' ? 'en-US' : 'de-DE');

    if (region === 'row') {
      return `$${formatValue(Math.round(priceUSD))} USD`;
    } else {
      const config = EXCHANGE_RATES[region];
      const localPrice = Math.round(priceUSD * config.rate * 1.10);
      return `${formatValue(localPrice)} ${config.currency}`;
    }
  }, [region, isProfessional, EXCHANGE_RATES]);

  return (
    <div className="template-root" style={{ padding: 'clamp(1rem, 5vw, 4rem) 1rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header Minimalista */}
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
          <FlaskConical size={48} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Laboratory Consumables</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Certified research supplies optimized for analytical peptide stability and precise laboratory handling.
        </p>
      </header>

      {/* Grid Optimizado para Mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {supplies.map(item => (
          <div key={item.name} className="card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            borderTop: '4px solid var(--secondary)',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--secondary)' }}>
                {item.name.toLowerCase().includes('water') ? <Droplets size={28} /> : <Syringe size={28} />}
              </div>
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--surface-subtle)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: 600
              }}>
                LAB-GRADE
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.name}</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatPrice(item)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {item.dosage} / {item.quantity}
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
              {item.desc}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button
                onClick={() => onSelectProduct(item.name)}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem' }}
              >
                Specs
              </button>
              <button
                onClick={() => updateCart(item.name, 1)}
                className="btn"
                style={{ flex: 2, fontSize: '0.85rem', padding: '0.6rem' }}
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security Disclaimer Small */}
      <footer style={{ marginTop: '4rem', opacity: 0.7 }}>
        <p style={{ fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
          <strong>Research Use Only:</strong> Laboratory consumables are strictly for institutional research.
        </p>
      </footer>
    </div>
  );
};

export default memo(SuppliesView);