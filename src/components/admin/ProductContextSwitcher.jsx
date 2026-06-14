import BookOpen from "lucide-react/dist/esm/icons/book-open";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Package from "lucide-react/dist/esm/icons/package";
import X from "lucide-react/dist/esm/icons/x";
import React from 'react';
import { useNavigate } from 'react-router-dom';





export default function ProductContextSwitcher({ searchTerm, productId, currentTab, onClear }) {
  const navigate = useNavigate();
  // If there's no specific search or product focus, don't show the switcher
  if (!searchTerm && !productId) return null;

  const displayTerm = searchTerm || productId;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.75rem 1rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Focused on:</span>
        <span style={{ 
          fontSize: '0.9rem', 
          fontWeight: 700, 
          color: 'var(--primary)',
          background: 'var(--bg-app)',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          border: '1px dashed var(--border)'
        }}>
          {displayTerm}
        </span>
        {onClear && (
          <button 
            onClick={onClear}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', padding: '0.2rem', borderRadius: '50%'
            }}
            title="Clear context"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(`/admin/products?search=${encodeURIComponent(displayTerm)}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
            border: currentTab === 'products' ? '1px solid var(--primary)' : '1px solid transparent',
            background: currentTab === 'products' ? 'rgba(59,130,246,0.1)' : 'transparent',
            color: currentTab === 'products' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { if(currentTab !== 'products') e.currentTarget.style.background = 'rgba(59,130,246,0.05)' }}
          onMouseLeave={(e) => { if(currentTab !== 'products') e.currentTarget.style.background = 'transparent' }}
        >
          <BookOpen size={14} /> Clinical Profile
        </button>
        <button
          onClick={() => navigate(`/admin/prices?sku=${encodeURIComponent(displayTerm)}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
            border: currentTab === 'prices' ? '1px solid #10b981' : '1px solid transparent',
            background: currentTab === 'prices' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            color: currentTab === 'prices' ? '#10b981' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { if(currentTab !== 'prices') e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)' }}
          onMouseLeave={(e) => { if(currentTab !== 'prices') e.currentTarget.style.background = 'transparent' }}
        >
          <DollarSign size={14} /> Prices Matrix
        </button>
        <button
          onClick={() => navigate(`/admin/stock?search=${encodeURIComponent(displayTerm)}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
            border: currentTab === 'stock' ? '1px solid #f59e0b' : '1px solid transparent',
            background: currentTab === 'stock' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
            color: currentTab === 'stock' ? '#f59e0b' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { if(currentTab !== 'stock') e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)' }}
          onMouseLeave={(e) => { if(currentTab !== 'stock') e.currentTarget.style.background = 'transparent' }}
        >
          <Package size={14} /> Stock & Variants
        </button>
      </div>
    </div>
  );
}