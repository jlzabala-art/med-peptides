 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Droplets, Target, ShieldCheck, Scale, Zap, Beaker } from 'lucide-react';
import { resolveProductPrice } from '../../utils/resolveProductPrice';

const ProductComparator = ({ compareList, setCompareList, onClose }) => {
  const navigate = useNavigate();

  if (!compareList || compareList.length === 0) {
    return (
      <div className="cart-drawer open" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-app)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--text-muted)" />
        </button>
        <Scale size={48} color="var(--border)" style={{ margin: '3rem auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>Comparison Engine</h2>
        <p style={{ color: 'var(--text-muted)' }}>Select up to 3 products to compare their clinical profiles side-by-side.</p>
        <button 
          onClick={() => { onClose(); navigate('/collection/peptides'); }}
          style={{ marginTop: '2rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="cart-drawer open" style={{ width: '100%', maxWidth: '900px', padding: '0', backgroundColor: 'var(--color-bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--section-alt, #EEF4FA)', color: 'var(--secondary)', padding: '0.5rem', borderRadius: '8px' }}>
            <Scale size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>Clinical Comparison</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{compareList.length} of 3 selected</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Close <X size={20} />
        </button>
      </div>

      {/* Comparison Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '2rem' }}>
          {compareList.map(product => {
            const priceInfo = resolveProductPrice(product, { tier: 'retail' });
            const type = product.category === 'Supplements' ? 'supplement' : 'peptide';
            const tData = product.typeData?.[type] || {};
            const pk = product.pharmacokinetics || {};
            const storage = product.storage_conditions || {};

            return (
              <div key={product.id} style={{ flex: '1 0 260px', background: 'white', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                {/* Card Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', position: 'relative', background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
                  <button onClick={() => removeFromCompare(product.id)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{product.category}</div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{product.name}</h3>
                  <div style={{ marginTop: '0.5rem', display: 'inline-block', background: 'rgba(0,163,224,0.1)', color: 'var(--secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {priceInfo?.display?.amount ? `${priceInfo.display.currencySymbol}${priceInfo.display.amount}` : 'N/A'}
                  </div>
                </div>

                {/* Data Rows */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                  {/* Mechanism */}
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Zap size={14} /> Primary Mechanism
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4, fontWeight: 500 }}>
                      {tData.mechanismOfAction?.summary || product.objective || 'Data not mapped'}
                    </div>
                  </div>

                  {/* Half Life */}
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Target size={14} /> Half-Life
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {pk.half_life || 'Variable'}
                    </div>
                  </div>

                  {/* Route */}
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Droplets size={14} /> Admin Route
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {pk.route || (type === 'supplement' ? 'Oral' : 'Subcutaneous')}
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={14} /> Storage (Dry)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {storage.dry || 'Room Temperature'}
                    </div>
                  </div>

                  {/* Sequence/Molecular */}
                  {type === 'peptide' && (
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Beaker size={14} /> Molecular Wt.
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {product.molecular_weight ? `${product.molecular_weight} Da` : 'Not specified'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--color-bg-app)', marginTop: 'auto' }}>
                  <button 
                    onClick={() => { onClose(); navigate(type === 'supplement' ? `/supplements/${product.slug}` : `/product/${product.slug}`); }}
                    style={{ width: '100%', background: 'white', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--secondary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty slot */}
          {compareList.length < 3 && (
            <div style={{ flex: '1 0 260px', background: 'rgba(255,255,255,0.5)', border: '2px dashed var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                 onClick={() => { onClose(); navigate('/collection/peptides'); }}
                 onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.background = 'white'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--section-alt, #EEF4FA)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={24} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Add Product</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select another to compare</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductComparator;
