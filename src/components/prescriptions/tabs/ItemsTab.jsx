import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Pill, Wand2, CheckCircle, FlaskConical, AlertCircle, CheckCircle2 } from '@/lib/icons';
import { checkInteractionsAction } from '../../../actions/aiActions';
import { updatePrescription } from '../../../services/prescriptionsService';

export default function ItemsTab({ rx, products = [], onProductClick, onProtocolClick, protocolMatch, isMatching, onUpdateRx }) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(rx.items || rx.products || []);
  const [safetyCheck, setSafetyCheck] = useState(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState(true);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    setLocalItems(rx.items || rx.products || []);
  }, [rx.items, rx.products]);

  useEffect(() => {
    async function runCheck() {
      try {
        const result = await checkInteractionsAction(rx.patientId, localItems);
        setSafetyCheck(result);
      } catch (err) {
        console.error("Safety check error:", err);
      } finally {
        setIsCheckingSafety(false);
      }
    }
    if (rx.patientId && localItems.length > 0) {
      runCheck();
    } else {
      setIsCheckingSafety(false);
    }
  }, [rx.patientId, localItems]);

  const handleLinkProduct = async (matchedProduct, itemIndex) => {
    if (isLinking) return;
    setIsLinking(true);
    
    try {
      const newItems = [...localItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        productId: matchedProduct.id,
        name: matchedProduct.title || matchedProduct.name || newItems[itemIndex].name
      };
      
      const updateField = rx.items ? 'items' : 'products';
      await updatePrescription(rx.id, { [updateField]: newItems });
      
      // Update UI immediately
      setLocalItems(newItems);
      if (onUpdateRx) {
        onUpdateRx({ ...rx, [updateField]: newItems });
      }
      router.refresh();
    } catch (err) {
      console.error("Error linking product:", err);
      alert("Failed to link product.");
    } finally {
      setIsLinking(false);
    }
  };

  const getProductDetails = (productId, fallbackName) => {
    if (!productId) return { name: fallbackName || 'Unknown Product' };
    const found = products.find((p) => p.id === productId);
    return found || { name: fallbackName || 'Unknown Product', id: productId };
  };

  if (localItems.length === 0) {
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
            {onProtocolClick && protocolMatch.protocol && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProtocolClick(protocolMatch.protocol);
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <span style={{ fontSize: '1rem' }}>📄</span> View Protocol
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Check Banner */}
      <div
        style={{
          background: isCheckingSafety ? '#f8fafc' : (safetyCheck?.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#fef2f2' : '#fffbeb') : '#f0fdf4'),
          border: `1px solid ${isCheckingSafety ? '#e2e8f0' : (safetyCheck?.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#fecaca' : '#fde68a') : '#bbf7d0')}`,
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}
      >
        {isCheckingSafety ? (
          <Wand2 size={20} color="#64748b" style={{ marginTop: '2px', animation: 'spin 2s linear infinite' }} />
        ) : !safetyCheck?.hasRisk ? (
          <CheckCircle2 size={20} color="#16a34a" style={{ marginTop: '2px' }} />
        ) : (
          <AlertCircle size={20} color={safetyCheck.riskLevel === 'high' ? '#dc2626' : '#d97706'} style={{ marginTop: '2px' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 700, 
            color: isCheckingSafety ? '#334155' : (safetyCheck?.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#991b1b' : '#92400e') : '#166534'), 
            marginBottom: '0.25rem', 
            fontSize: '0.95rem' 
          }}>
            {isCheckingSafety ? 'Running Clinical Safety Check...' : 'Clinical Safety Check: ' + (safetyCheck?.hasRisk ? 'Warnings Detected' : 'Clear')}
          </div>
          {isCheckingSafety && (
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Checking drug-to-drug interactions...
            </div>
          )}
          {!isCheckingSafety && safetyCheck?.hasRisk && safetyCheck?.warnings?.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: safetyCheck.riskLevel === 'high' ? '#991b1b' : '#92400e' }}>
              {safetyCheck.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.entries(
          localItems.reduce((acc, item) => {
            const product = getProductDetails(item.productId, item.name || item.productName);
            let rawForm = (item.form || product.form || product.productType || 'Other').toLowerCase();
            let itemName = (item.name || product.name || '').toLowerCase();
            
            let groupName = 'Other Items';
            if (rawForm.includes('cream') || rawForm.includes('crema') || rawForm.includes('topical') || itemName.includes('cream') || itemName.includes('crema')) {
              groupName = 'Creams & Topicals';
            } else if (rawForm.includes('cap') || rawForm.includes('tab') || rawForm.includes('pill') || itemName.includes('cap') || itemName.includes('tab')) {
              groupName = 'Capsules & Tablets';
            } else if (rawForm.includes('inject') || rawForm.includes('vial') || itemName.includes('vial') || itemName.includes('inject')) {
              groupName = 'Injectables';
            } else if (rawForm.includes('supp') || itemName.includes('supp') || rawForm.includes('vit') || itemName.includes('vit')) {
              groupName = 'Supplements';
            } else if (rawForm !== 'other') {
              // Capitalize first letter of rawForm if it's a specific string not matching above
              groupName = rawForm.charAt(0).toUpperCase() + rawForm.slice(1);
            }

            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push({ ...item, _originalIndex: localItems.indexOf(item) });
            return acc;
          }, {})
        ).map(([groupName, itemsInGroup]) => (
          <div key={groupName} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div
              style={{
                background: '#f1f5f9',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
              }}
            >
              {groupName}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                background: '#f8fafc',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <div>Product</div>
              <div>Dose</div>
              <div>Frequency</div>
              <div>Duration</div>
              <div>Units</div>
            </div>
            {itemsInGroup.map((item, idx) => (
              <div
                key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '1rem 1.25rem',
              borderBottom: idx < itemsInGroup.length - 1 ? '1px solid #f8fafc' : 'none',
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
                            const results = fuse.search(product.name).slice(0, 3);

                            return (
                              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                {results.length > 0 && (
                                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Did you mean?
                                  </div>
                                )}
                                {results.map((res, i) => (
                                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: i < results.length - 1 ? '0.5rem' : '0', borderBottom: i < results.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                                        {res.item.title || res.item.name}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLinkProduct(res.item, item._originalIndex);
                                        }}
                                        disabled={isLinking}
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '3px 8px',
                                          background: isLinking ? '#f1f5f9' : '#f0fdf4',
                                          color: isLinking ? '#94a3b8' : '#16a34a',
                                          border: `1px solid ${isLinking ? '#cbd5e1' : '#bbf7d0'}`,
                                          borderRadius: '4px',
                                          cursor: isLinking ? 'not-allowed' : 'pointer',
                                          fontWeight: 600,
                                          flexShrink: 0,
                                          marginLeft: '0.5rem'
                                        }}
                                      >
                                        {isLinking ? 'Linking...' : 'Link Match'}
                                      </button>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {res.item.productType && (
                                        <span style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>{res.item.productType}</span>
                                      )}
                                      {res.item.category && (
                                        <span style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>{res.item.category}</span>
                                      )}
                                      {res.item.supplier && (
                                        <span style={{ color: '#475569' }}>🏢 {res.item.supplier}</span>
                                      )}
                                    </div>
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
                    {(() => {
                      const rawDose = item.dosage || item.dose || item.strength || '';
                      const isInstruction = rawDose.length > 35;
                      const instructions = item.instructions || item.directions || (isInstruction ? rawDose : null);
                      if (!instructions) return null;
                      return (
                        <div style={{ 
                          marginTop: '0.85rem', 
                          padding: '0.75rem 1rem', 
                          background: 'linear-gradient(to right, #eff6ff, #f8fafc)', 
                          borderRadius: '8px', 
                          border: '1px solid #e0e7ff', 
                          borderLeft: '4px solid #3b82f6', 
                          fontSize: '0.85rem', 
                          color: '#334155', 
                          lineHeight: 1.5,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                            <Pill size={12} /> CLINICAL INSTRUCTIONS
                          </div>
                          {instructions}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                    {(() => {
                      const rawDose = item.dosage || item.dose || item.strength || '';
                      const isInstruction = rawDose.length > 35;
                      const displayDose = isInstruction ? (product.dosage || product.strength || product.concentration || '—') : (rawDose || product.dosage || '—');
                      const form = product.form || product.productType || item.form || '';
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span>{displayDose}</span>
                          {form && <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'capitalize' }}>{form}</span>}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {(() => {
                      let displayFreq = item.frequency;
                      if (!displayFreq) {
                        const freqText = item.instructions || item.directions || item.dosage || '';
                        const match = freqText.match(/(once daily|twice a week|5 nights per week|6 days per week|\d+ days per week|\d+ times a week|daily|weekly|qod|bid|tid|qid|tiw|every other day)/i);
                        displayFreq = match ? match[0].toLowerCase() : '—';
                      }
                      return <span style={{ textTransform: displayFreq !== '—' ? 'capitalize' : 'none' }}>{displayFreq}</span>;
                    })()}
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
        ))}
      </div>
    </div>
  );
}
