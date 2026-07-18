import React from 'react';
import { Package, AlertCircle } from '@/lib/icons';
import { calculateProtocolRequirements } from '../../../engine/protocolMath';

export default function VialCalculator({ protocol, onProductClick }) {
  const products = calculateProtocolRequirements(protocol);

  if (products.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No products found in this protocol's phases.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Vial Calculator</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Automatically calculates the number of vials required based on dosage, frequency, and duration.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {products.map((product, idx) => (
          <div key={idx} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 
                  onClick={() => {
                    if (onProductClick) onProductClick({ id: product.product_id, name: product.name });
                  }}
                  style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {product.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {product.vialStrengthMg}mg Vial • Reconstitute with {product.reconstitutionVolMl}ml BAC
                </div>
              </div>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} />
                {product.vialsRequired} {product.vialsRequired === 1 ? 'Vial' : 'Vials'}
              </div>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Injections</span>
                <span style={{ fontWeight: 600 }}>{product.totalInjections}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Dose Required</span>
                <span style={{ fontWeight: 600 }}>{product.totalMgRequired.toFixed(2)} mg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected Wastage / Unused</span>
                <span style={{ fontWeight: 600, color: product.unusedMg > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
                  {product.unusedMg.toFixed(2)} mg
                </span>
              </div>

              {product.shelfLifeWarning && (
                <div style={{ marginTop: '0.5rem', background: 'var(--danger-light, #fee2e2)', color: 'var(--danger, #dc2626)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                  <div>
                    <strong>Shelf Life Warning:</strong> Protocol duration exceeds the reconstituted shelf life ({product.shelfLifeDays} days). Extra vials may be needed due to expiration.
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
