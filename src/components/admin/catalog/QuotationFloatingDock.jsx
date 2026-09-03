"use client";

import React, { useState } from 'react';
import { useOrderBuilderStore } from '../../../stores/orderBuilderStore';
import { useDrawer } from '../../../context/DrawerContext';
import { FileText, ArrowRight, Trash2, ChevronUp, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import notifier from '../../../services/NotificationService';

export default function QuotationFloatingDock() {
  const { items = [], clearCart, selectedPricingTier = 'clinic' } = useOrderBuilderStore();
  const { openDrawer } = useDrawer();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const totalAmount = items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const rate = Number(it.unitPrice || it.price || it.unitRate || 0);
    return sum + (qty * rate);
  }, 0);

  const tierLabel = selectedPricingTier === 'wholesale' ? '🏢 Wholesale' :
                    selectedPricingTier === 'retail' ? '👤 Retail' :
                    selectedPricingTier === 'cost' ? '⚙️ Cost' : '🏥 Clinic';

  const handleOpenBuilder = () => {
    if (typeof openDrawer === 'function') {
      openDrawer('rx-builder');
    } else {
      window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
        detail: {
          type: 'manual',
          items
        }
      }));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 90,
      maxWidth: '480px',
      width: 'calc(100% - 48px)',
      backgroundColor: '#ffffff',
      borderRadius: '14px',
      border: '1px solid #bfdbfe',
      boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Expanded item list preview */}
      {isExpanded && (
        <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Quotation In-Progress Items ({items.length})
            </span>
            <button
              onClick={() => {
                clearCart();
                notifier.info('Quotation draft cleared');
              }}
              style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.80rem' }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {it.dosage || 'Standard'} • Qty: {it.quantity || 1}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#0284c7', flexShrink: 0 }}>
                  ${(Number(it.unitPrice || it.price || 0) * Number(it.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Floating Bar */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: 'linear-gradient(to right, #ffffff, #f0f9ff)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(2,132,199,0.3)' }}>
            {items.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#003666' }}>
                ${totalAmount.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                {tierLabel}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ border: 'none', background: 'transparent', padding: 0, color: '#64748b', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', textAlign: 'left' }}
            >
              {isExpanded ? 'Hide items' : 'Preview items'} {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenBuilder}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(2,132,199,0.35)',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
        >
          Review & Send <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
