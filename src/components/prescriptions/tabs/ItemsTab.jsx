import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Pill, Wand2, CheckCircle, FlaskConical, AlertCircle, CheckCircle2 } from '@/lib/icons';
// Assuming checkInteractionsAction is imported here, though it was implicitly used before
import { checkInteractionsAction } from '../../../actions/aiActions';

export default function ItemsTab({ rx, products = [], onProductClick, protocolMatch, isMatching }) {
  const router = useRouter();
  const items = rx.items || rx.products || [];
  const [safetyCheck, setSafetyCheck] = useState(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState(true);

  useEffect(() => {
    async function runCheck() {
      try {
        const result = await checkInteractionsAction(rx.patientId, items);
        setSafetyCheck(result);
      } catch (err) {
        console.error("Safety check error:", err);
      } finally {
        setIsCheckingSafety(false);
      }
    }
    if (rx.patientId && items.length > 0) {
      runCheck();
    } else {
      setIsCheckingSafety(false);
    }
  }, [rx.patientId, items]);

  const getProductDetails = (productId, fallbackName) => {
    if (!productId) return { name: fallbackName || 'Unknown Product' };
    const found = products.find((p) => p.id === productId);
    return found || { name: fallbackName || 'Unknown Product', id: productId };
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1rem',
          color: '#94a3b8',
        }}
      >
        <Pill size={40} color="#e2e8f0" />
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#475569', fontWeight: 700 }}>No Items</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            No prescription items have been added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Protocol Match Banner */}
      {isMatching && (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem' }}>
          <Wand2 size={16} style={{ display: 'inline', marginRight: '0.5rem', marginBottom: '-3px' }} /> 
          Analyzing items to identify protocol match...
        </div>
      )}
      {!isMatching && protocolMatch && (
        <div
          style={{
            background: protocolMatch.matched ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${protocolMatch.matched ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          {protocolMatch.matched ? (
            <CheckCircle size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
          ) : (
            <FlaskConical size={20} color="#64748b" style={{ marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: protocolMatch.matched ? '#1e40af' : '#334155', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
              {protocolMatch.matched ? 'Standard Protocol Matched' : 'Custom Protocol Generation'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
              {protocolMatch.message}
            </div>
            {protocolMatch.matched && protocolMatch.protocol?.phases && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {protocolMatch.protocol.phases.map((phase, i) => (
                  <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {phase.phase_title} (Wk {phase.start_week}-{phase.end_week})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Check Warning */}
      {!isCheckingSafety && safetyCheck && (
        <div
          style={{
            background: safetyCheck.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#fef2f2' : '#fffbeb') : '#f0fdf4',
            border: `1px solid ${safetyCheck.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#fecaca' : '#fde68a') : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          {safetyCheck.hasRisk ? (
            <AlertCircle size={20} color={safetyCheck.riskLevel === 'high' ? '#ef4444' : '#f59e0b'} style={{ marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={20} color="#10b981" style={{ marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
              {safetyCheck.hasRisk ? 'Clinical Safety Warning' : 'Clinical Safety Check: Clear'}
            </div>
            {safetyCheck.warnings.map((warning, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '0',
            background: '#f8fafc',
            padding: '0.7rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {['Product', 'Dose', 'Frequency', 'Duration', 'Units'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '1rem 1.25rem',
              borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none',
              alignItems: 'center',
              gap: '0',
              transition: 'background 0.1s',
              cursor: onProductClick && item.productId ? 'pointer' : 'default',
            }}
            onClick={() => {
              const product = getProductDetails(item.productId, item.name || item.productName);
              if (onProductClick && item.productId) onProductClick(product);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {(() => {
              const product = getProductDetails(item.productId, item.name || item.productName);
              return (
                <React.Fragment>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {product.name}
                      {!item.productId && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '2px 4px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: '4px',
                            }}
                          >
                            Not in Catalog
                          </span>
                          
                          {(() => {
                            const fuse = new Fuse(products, {
                              keys: ['title', 'name', 'supplier'],
                              threshold: 0.4
                            });
                            const results = fuse.search(product.name).slice(0, 2);

                            return (
                              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {results.length > 0 && (
                                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                                    Did you mean?
                                  </div>
                                )}
                                {results.map((res, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>
                                      {res.item.title || res.item.name}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // In a real app, this might dispatch an update to link the product
                                        alert(`Linked to ${res.item.title || res.item.name}!`);
                                      }}
                                      style={{
                                        fontSize: '0.6rem',
                                        padding: '2px 6px',
                                        background: '#f0fdf4',
                                        color: '#16a34a',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Link Match
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/products?create=${encodeURIComponent(product.name)}`);
                                  }}
                                  style={{
                                    alignSelf: 'flex-start',
                                    marginTop: '0.2rem',
                                    fontSize: '0.65rem',
                                    padding: '2px 6px',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Create New Product
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    {item.concentration && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {item.concentration}
                      </div>
                    )}
                    {item.category && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          padding: '0.15rem 0.5rem',
                          background: '#f1f5f9',
                          color: '#64748b',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                    {item.dosage || item.dose || item.strength || '—'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {item.frequency || '—'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {item.duration || '—'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.95rem' }}>
                      {item.quantity || '—'}
                    </span>
                    {item.unit && (
                      <span
                        style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.25rem' }}
                      >
                        {item.unit}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
