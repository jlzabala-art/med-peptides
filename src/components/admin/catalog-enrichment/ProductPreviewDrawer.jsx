import React from 'react';
import { X, Sparkles, AlertCircle, Database, Search, Package, DollarSign, Activity } from 'lucide-react';

export default function ProductPreviewDrawer({ selectedItem, onClose }) {
  if (!selectedItem) return null;

  const { item, productInfo, confidence, reason, supplier, price, zohoStatus } = selectedItem;
  
  const isMatch = confidence > 0;
  const needsReview = confidence > 0 && confidence < 90;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--color-bg-surface)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{item}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {isMatch ? (
                <span style={{ 
                  padding: '2px 8px', 
                  backgroundColor: confidence >= 90 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                  color: confidence >= 90 ? 'var(--color-success)' : '#d97706', 
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
                }}>
                  {confidence}% Match
                </span>
              ) : (
                <span style={{ padding: '2px 8px', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                  No Match Found
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {zohoStatus}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* AI Explanation Box */}
          {needsReview && (
            <div style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.05)', 
              border: '1px solid rgba(245, 158, 11, 0.2)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Sparkles size={16} />
                AI Match Explanation
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: 0 }}>Atlas AI selected <strong>{productInfo?.name}</strong> because:</p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                  <li>Same base peptide</li>
                  <li>Same supplier</li>
                  <li style={{ color: '#d97706' }}><strong>{reason}</strong></li>
                </ul>
                <p style={{ margin: '0.5rem 0 0 0', fontWeight: 500 }}>Review recommended before Zoho Sync.</p>
              </div>
            </div>
          )}

          {/* Matched Product Details */}
          {productInfo && (
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={14} /> Master Catalog Match
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{productInfo.name}</span>
                  
                  <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                  <span>{productInfo.category || 'N/A'}</span>
                  
                  <span style={{ color: 'var(--text-muted)' }}>Supplier:</span>
                  <span>{supplier || 'Unknown'}</span>
                  
                  <span style={{ color: 'var(--text-muted)' }}>Stock:</span>
                  <span>{productInfo.stockCount || 0} units</span>
                </div>
              </div>
            </div>
          )}

          {/* Price Discovery */}
          <div>
             <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={14} /> Price Discovery
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Supplier Price</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>${price?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Margin Estimate</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-success)' }}>45%</div>
                  </div>
                </div>
              </div>
          </div>

          {/* Supplier Coverage (Mock) */}
           <div>
             <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={14} /> Supplier Intelligence
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                  <span>Lotusland</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Available</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                  <span>NP Labs</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Available</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Royal Care</span>
                  <span>Unavailable</span>
                </div>
              </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex',
          gap: '1rem'
        }}>
          {!isMatch ? (
            <button className="gcp-btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Quick Create Product</button>
          ) : needsReview ? (
            <>
              <button className="gcp-btn-secondary" style={{ flex: 1 }}>Merge Variant</button>
              <button className="gcp-btn-primary" style={{ flex: 1 }}>Create as New</button>
            </>
          ) : (
             <button className="gcp-btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Prepare Zoho Sync</button>
          )}
        </div>

      </div>
    </div>
  );
}
