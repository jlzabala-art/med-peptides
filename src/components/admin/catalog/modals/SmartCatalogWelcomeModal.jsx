import React from 'react';
import { Brain, FileText, Filter, Box } from 'lucide-react';

export default function SmartCatalogWelcomeModal({ isOpen, selectedCount, filteredCount, onSelect }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Create Catalog
        </h2>
        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '1rem' }}>
          Choose how you want Atlas AI to build your catalog.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <button 
            onClick={() => onSelect('smart')}
            style={{ 
              padding: '20px', 
              textAlign: 'left', 
              borderRadius: '12px', 
              border: '2px solid #3b82f6', 
              background: '#eff6ff', 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '8px' }}>
              RECOMMENDED
            </div>
            <div style={{ padding: '8px', background: '#3b82f6', borderRadius: '8px', color: '#fff', flexShrink: 0 }}>
              <Brain size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '8px', fontSize: '1.1rem' }}>1. Smart Catalog</div>
              <div style={{ fontSize: '0.9rem', color: '#1e40af', lineHeight: '1.5' }}>
                Atlas AI automatically generates:
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <li>Catalog Name</li>
                  <li>Description</li>
                  <li>Clinical Goals</li>
                  <li>Product Groups</li>
                  <li>Featured Products</li>
                  <li>Supplier Strategy</li>
                </ul>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => onSelect('selected')}
            style={{ padding: '16px', textAlign: 'left', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ padding: '8px', background: '#e2e8f0', borderRadius: '8px', color: '#475569', flexShrink: 0 }}><Box size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}>2. From Selected Products</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Build catalog using the {selectedCount} currently selected items.</div>
            </div>
          </button>
          
          <button 
            onClick={() => onSelect('filtered')}
            style={{ padding: '16px', textAlign: 'left', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ padding: '8px', background: '#e2e8f0', borderRadius: '8px', color: '#475569', flexShrink: 0 }}><Filter size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}>3. From Current Filters</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Build catalog using all {filteredCount} items matching active filters.</div>
            </div>
          </button>
          
          <button 
            onClick={() => onSelect('empty')}
            style={{ padding: '16px', textAlign: 'left', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#fff', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
          >
            <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#64748b', flexShrink: 0 }}><FileText size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '2px' }}>4. Empty Catalog</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Advanced option. Start from scratch.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
