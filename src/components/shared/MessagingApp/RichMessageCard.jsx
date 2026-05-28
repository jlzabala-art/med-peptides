import React from 'react';
import { Package, ShoppingBag, CreditCard, ExternalLink } from 'lucide-react';

export default function RichMessageCard({ type, referenceId, text }) {
  let icon = null;
  let title = '';
  let color = '#1a73e8';
  let bgColor = '#e8f0fe';

  if (type === 'link_product') {
    icon = <Package size={24} color={color} />;
    title = 'Product Recommendation';
  } else if (type === 'link_order') {
    color = '#f59e0b';
    bgColor = '#fef3c7';
    icon = <ShoppingBag size={24} color={color} />;
    title = 'Order Reference';
  } else if (type === 'payment_link') {
    color = 'var(--color-success)';
    bgColor = '#d1fae5';
    icon = <CreditCard size={24} color={color} />;
    title = 'Payment Link';
  }

  // Usually, we would fetch the actual product/order details using the referenceId.
  // For now, we display a simplified card that can be clicked if it's a URL (like a payment link).

  const isUrl = referenceId && (referenceId.startsWith('http://') || referenceId.startsWith('https://'));

  const handleClick = () => {
    if (isUrl) {
      window.open(referenceId, '_blank');
    } else {
      // In a real app, route to the product or order details page
      alert(`Navigating to ${type}: ${referenceId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem',
        marginTop: '0.5rem',
        backgroundColor: 'var(--color-bg-surface)',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        cursor: 'pointer',
        gap: '1rem',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '8px', backgroundColor: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, color: '#3c4043' }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, wordBreak: 'break-all' }}>
          {text || referenceId}
        </div>
      </div>
      {isUrl && <ExternalLink size={16} color="#9aa0a6" />}
    </div>
  );
}
