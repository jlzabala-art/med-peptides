import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Scale from "lucide-react/dist/esm/icons/scale";
import React, { useState } from 'react';



export default function InstantResultsTabs({ preRankedProducts = [], preRankedProtocols = [], navigate, setIsOpen, onCompare }) {
  const [activeTab, setActiveTab] = useState('compounds');

  const getBaseSlug = (slug) => (slug || '').replace(/[\-]*(\d+(\.\d+)?[\-]?(mg|mcg|iu|ml|g|kg)[\-\w]*)$/i, '').replace(/\-+$/, '') || slug;
  const getBaseName = (name) => (name || '').replace(/[\-\s]*(\d+(\.\d+)?\s*(mg|mcg|iu|ml|g|kg)[\-\w]*)$/i, '').trim() || name;

  const seenNames = new Set();
  const uniqueProducts = preRankedProducts.filter(product => {
    const baseName = getBaseName(product.displayName || product.name || '').toLowerCase();
    if (seenNames.has(baseName)) return false;
    seenNames.add(baseName);
    return true;
  });
  const uniqueProtos = preRankedProtocols.filter((p, i, arr) => arr.findIndex(x => (x.protocol_slug || x.slug || x.id) === (p.protocol_slug || p.slug || p.id)) === i);

  const hasCompounds = uniqueProducts.length > 0;
  const hasProtocols = uniqueProtos.length > 0;
  const showTabs = hasCompounds && hasProtocols;
  const effectiveTab = showTabs ? activeTab : (hasCompounds ? 'compounds' : 'protocols');

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0.7rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #dde8f5 0%, transparent 100%)' }} />
        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', padding: '0.2rem 0.65rem', background: 'rgba(0,75,135,0.07)', borderRadius: '20px', border: '1px solid rgba(0,75,135,0.15)', whiteSpace: 'nowrap' }}>
          ⚡ Instant Results
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #dde8f5 100%)' }} />
      </div>

      {showTabs && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem', position: 'sticky', top: '-1px', zIndex: 10, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '0.5rem 0' }}>
          <button onClick={() => setActiveTab('compounds')} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700, background: effectiveTab === 'compounds' ? 'rgba(0,75,135,0.12)' : 'transparent', color: effectiveTab === 'compounds' ? 'var(--primary)' : 'var(--text-muted)', border: 'none' }}>
            Compounds ({uniqueProducts.length})
          </button>
          <button onClick={() => setActiveTab('protocols')} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700, background: effectiveTab === 'protocols' ? 'rgba(3,105,161,0.12)' : 'transparent', color: effectiveTab === 'protocols' ? '#0369a1' : 'var(--text-muted)', border: 'none' }}>
            Protocols ({uniqueProtos.length})
          </button>
        </div>
      )}

      {effectiveTab === 'compounds' && hasCompounds && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {uniqueProducts.map((product, idx) => {
            const baseName = getBaseName(product.displayName || product.name);
            return (
              <div key={idx} 
                onClick={() => { navigate(`/product/${getBaseSlug(product.slug || product.id)}`); setIsOpen(false); }} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', 
                  borderRadius: '14px', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', cursor: 'pointer',
                  position: 'relative', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FlaskConical size={16} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{baseName}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{product.shortDescription || 'Research Peptide'}</div>
                </div>
                {onCompare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompare(baseName);
                    }}
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: 'white',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.02)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    title={`Compare ${baseName}`}
                  >
                    <Scale size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {effectiveTab === 'protocols' && hasProtocols && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {uniqueProtos.slice(0, 5).map((proto, idx) => (
            <div key={idx} onClick={() => { navigate(`/protocol/${proto.protocol_slug || proto.slug || proto.id}`); setIsOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.8rem', borderRadius: '12px', background: '#f0f7ff', border: '1px solid #dbeafe', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{proto.name || proto.title}</div>
                <div style={{ fontSize: '0.58rem', color: '#0369a1' }}>{proto.category || 'Protocol'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}