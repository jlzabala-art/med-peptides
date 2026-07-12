"use client";

import React from 'react';
import { Package, Copy, Check, DollarSign, Activity, Settings, Stethoscope } from '@/lib/icons';

function ProductGridCard({ product, onClick, isSelected, onToggleSelect }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onClick && onClick(product)}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
        padding: '1.25rem',
        boxShadow: isSelected ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'none';
      }}
    >
      {onToggleSelect && (
        <div 
          onClick={(e) => { e.stopPropagation(); onToggleSelect(product.id); }}
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2 }}
        >
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => {}} 
            style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '48px', height: '48px', 
          borderRadius: '12px', 
          background: 'var(--primary-light)', 
          color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          {product.category === 'Peptides' ? <Stethoscope size={24} /> : <Package size={24} />}
        </div>
        <div style={{ paddingRight: '2rem' }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.2 }}>
            {product.name || product.productName || 'Unnamed'}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>{product.sku || 'No SKU'}</span>
            <button 
              onClick={handleCopyId}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              title="Copy ID"
            >
              {copied ? <Check size={12} color="green" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: 'var(--color-bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          {product.category || 'Uncategorized'}
        </span>
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: 'var(--color-bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          {product.dosage || 'No Dosage'}
        </span>
        <span style={{ 
          fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', 
          background: product.isActive ? '#dcfce7' : '#fee2e2', 
          color: product.isActive ? '#15803d' : '#dc2626',
          border: `1px solid ${product.isActive ? '#bbf7d0' : '#fecaca'}`
        }}>
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Activity size={12} /> Stock
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: (product.stock > 10) ? '#0f172a' : '#b45309' }}>
            {product.stock || 0}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <DollarSign size={12} /> Pro Vial
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${product.proVialPrice || 0}
          </div>
        </div>
      </div>
      
    </div>
  );
}

// Prevent re-renders if the product data and callbacks haven't changed
export default React.memo(ProductGridCard, (prev, next) =>
  prev.product.id === next.product.id &&
  prev.product.stock === next.product.stock &&
  prev.product.isActive === next.product.isActive &&
  prev.product.price === next.product.price &&
  prev.isSelected === next.isSelected
);
