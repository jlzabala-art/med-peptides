import Box from 'lucide-react/dist/esm/icons/box';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
import Package from 'lucide-react/dist/esm/icons/package';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import React from 'react';
import { calculateProductHealthScore } from '../useProductHealthScore';

export default function CatalogCardsView({ items, loading, onRowClick, onAction, filterState }) {
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: '160px',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '50%', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '30%', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '20%', animation: 'pulse 1.5s infinite' }}></div>
            </div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        ))}
      </div>
    );
  }

  if (!items || !items.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No items found.
      </div>
    );
  }

  const { currentPage, totalPages, setCurrentPage, totalItems } = filterState || {};

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
      }}
    >
      {items.map((product) => {
        const { score, color, flags } = calculateProductHealthScore(product);
        return (
          <div
            key={product.id}
            onClick={() => onRowClick(product)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {product.images?.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box size={24} color="#cbd5e1" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {product.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {product.supplier || 'No Supplier'}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('menu', product);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                }}
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Metrics */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} color="var(--text-muted)" />
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color:
                      (typeof product.stock === 'object'
                        ? product.stock?.available || 0
                        : product.stock || 0) > 0
                        ? 'var(--text-main)'
                        : '#dc2626',
                  }}
                >
                  {typeof product.stock === 'object'
                    ? product.stock?.available || 0
                    : product.stock || 0}{' '}
                  in stock
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Score {score}
                </span>
              </div>
            </div>

            {/* Quick Actions / Flags */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {flags.slice(0, 1).map((flag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertCircle size={10} /> {flag}
                  </span>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('ai', product);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#a855f7',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={12} /> Insights
              </button>
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {filterState && currentPage < totalPages && (
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            padding: '1.5rem 0',
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              padding: '10px 24px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            Load More (Showing {items.length} of {totalItems})
          </button>
        </div>
      )}
    </div>
  );
}
