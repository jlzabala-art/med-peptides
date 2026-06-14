import CloudLightning from "lucide-react/dist/esm/icons/cloud-lightning";
import Phone from "lucide-react/dist/esm/icons/phone";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import React, { useState, useEffect } from 'react';




import { toast } from 'react-hot-toast';

export default function InvoiceDataGrid({ invoices, onSelect, selectedInvoice }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return { bg: '#dcfce7', text: '#166534' };
      case 'Overdue': return { bg: '#fef2f2', text: '#b91c1c' };
      case 'Partially Paid': return { bg: '#fef3c7', text: '#854d0e' };
      case 'Sent': return { bg: '#eff6ff', text: '#1d4ed8' };
      default: return { bg: '#f1f5f9', text: '#475569' }; // Draft
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {invoices.map(inv => {
          const amount = Number(inv.grandTotal) || Number(inv.totalAmount) || 0;
          const statusColors = getStatusColor(inv.status);
          return (
            <div key={inv.id} onClick={() => onSelect(inv)} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>{inv.documentNumber || inv.id.slice(0,8)}</p>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{inv.customerName}</h3>
                </div>
                <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: statusColors.bg, color: statusColors.text }}>
                  {inv.status || 'Draft'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Amount</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>€{amount.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={(e) => { e.stopPropagation(); toast.success(`Calling customer...`); }} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Phone size={14} color="var(--color-text-secondary)" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toast.success(`Opening WhatsApp...`); }} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <MessageSquare size={14} color="#25D366" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toast('Opening Zoho Invoice', { icon: '🔗' }); }} style={{ padding: '0 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'white', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    Open <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Invoice #</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Amount</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sync</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const amount = Number(inv.grandTotal) || Number(inv.totalAmount) || 0;
              const statusColors = getStatusColor(inv.status);
              const isSelected = selectedInvoice?.id === inv.id;

              return (
                <tr 
                  key={inv.id} 
                  onClick={() => onSelect(inv)}
                  style={{ 
                    borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s',
                    backgroundColor: isSelected ? 'rgba(0,54,102,0.04)' : 'transparent'
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {inv.documentNumber || inv.id.slice(0,8)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {inv.customerName || 'Unknown Customer'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    €{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      background: statusColors.bg, color: statusColors.text
                    }}>
                      {inv.status || 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                      <CloudLightning size={14} /> Synced
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}