import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import Package from "lucide-react/dist/esm/icons/package";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Eye from "lucide-react/dist/esm/icons/eye";
import React, { useState } from 'react';







import { Button } from '../../ui';

export default function PredictiveInventoryAlerts({ products = [], onOpenProduct }) {
  const [orderedMap, setOrderedMap] = useState({});

  // Filter out low stock or high velocity items
  const criticalItems = products.filter(p => (p.stock || 0) < 50).slice(0, 5);

  if (criticalItems.length === 0) return null;

  const handleAutoOrder = (itemId) => {
    setOrderedMap(prev => ({ ...prev, [itemId]: true }));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)',
      padding: '0.85rem 1.25rem',
      borderRadius: '12px',
      border: '1px solid #fbd38d',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={18} color="#d97706" />
          <strong style={{ fontSize: '0.85rem', color: '#7c2d12' }}>Predictive Stock Out Warning</strong>
          <span style={{ fontSize: '0.75rem', color: '#c2410c', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <Sparkles size={11} /> Atlas AI Velocity Diagnostics
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#7c2d12', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
          View All Alerts <ChevronRight size={14} />
        </span>
      </div>

      {/* Horizontal Carousel List */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
        scrollbarWidth: 'none'
      }}>
        {criticalItems.map((item, idx) => {
          const isOrdered = orderedMap[item.id];
          // Simulated velocity metrics
          const daysLeft = Math.round(item.stock ? item.stock / 2.5 : 8);
          return (
            <div key={item.id || idx} style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '320px',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#fee2e2', color: '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Stock: <strong style={{ color: '#dc2626' }}>{item.stock || 0}</strong> • Depletes: <strong style={{ color: '#b45309' }}>{daysLeft} days</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  onClick={() => onOpenProduct?.(item)}
                  style={{
                    padding: '4px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex'
                  }}
                  title="Open Product"
                >
                  <Eye size={12} />
                </button>
                {isOrdered ? (
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 8px' }}>
                    <CheckSquare size={12} /> PO Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleAutoOrder(item.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Package size={11} /> Auto-Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}