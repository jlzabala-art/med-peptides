import React from 'react';
import { Package, ShoppingCart, ArrowRight } from 'lucide-react';

export default function RichMessageCard({ text, onAction }) {
  // Very simple parsing for demonstration:
  // Detects if text contains "SKU-" or words like "quote" or "order"
  
  const hasSku = text.match(/SKU-[A-Z0-9-]+/i);
  const skuMatch = hasSku ? hasSku[0] : null;
  const isQuote = text.toLowerCase().includes('quote') || text.toLowerCase().includes('order');

  if (!skuMatch && !isQuote) {
    return <>{text}</>; // Plain text if no rich elements detected
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' }}>
      <div>{text}</div>
      
      {/* Rich Widget Container */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '8px'
      }}>
        {skuMatch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Package size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{skuMatch}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Product Mentioned</div>
            </div>
            <button 
              onClick={() => onAction && onAction('view_product', skuMatch)}
              style={{
                background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px',
                borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              View
            </button>
          </div>
        )}

        {isQuote && (
          <div style={{ 
            borderTop: skuMatch ? '1px solid #e2e8f0' : 'none', 
            paddingTop: skuMatch ? '12px' : '0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontSize: '13px', fontWeight: 600 }}>
              <ShoppingCart size={16} color="#10b981" />
              Generate Quote Draft
            </div>
            <button 
              onClick={() => onAction && onAction('create_quote', null)}
              style={{
                background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px',
                borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
              }}
            >
              Draft <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
