import Eye from "lucide-react/dist/esm/icons/eye";
import Copy from "lucide-react/dist/esm/icons/copy";
import Send from "lucide-react/dist/esm/icons/send";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Truck from "lucide-react/dist/esm/icons/truck";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import React from 'react';










export default function QuotationDataGrid({ quotations, onSelect }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quote #</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zoho Books</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fulfillment</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
              <th style={{ padding: '1rem', width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {quotations.map(quote => {
              // Mock Zoho status based on document data or random for visual
              const zohoStatus = quote.zohoStatus || (quote.status === 'Accepted' ? 'Synced' : quote.status === 'Draft' ? 'Pending' : 'Error');
              const isDropship = quote.fulfillment === 'Dropshipping' || quote.dropship;

              return (
                <tr 
                  key={quote.id} 
                  onClick={() => onSelect(quote)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {quote.documentNumber || quote.id.slice(0,8)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {quote.customerName || 'Unknown Customer'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>
                    ${Number(quote.totalAmount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      background: quote.status === 'Accepted' ? '#dcfce7' : quote.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: quote.status === 'Accepted' ? '#166534' : quote.status === 'Rejected' ? '#991b1b' : '#854d0e'
                    }}>
                      {quote.status || 'Draft'}
                    </span>
                  </td>
                  {/* Zoho Status Column */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: zohoStatus === 'Synced' ? '#059669' : zohoStatus === 'Error' ? '#dc2626' : '#6b7280' }}>
                      {zohoStatus === 'Synced' && <CheckCircle size={14} />}
                      {zohoStatus === 'Pending' && <RefreshCw size={14} />}
                      {zohoStatus === 'Error' && <AlertTriangle size={14} />}
                      {zohoStatus}
                    </div>
                  </td>

                  {/* Fulfillment Column */}
                  <td style={{ padding: '1rem' }}>
                    {isDropship ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#ec4899', background: '#fce7f3', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                        <Truck size={14} /> Dropship
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Stock</span>
                    )}
                  </td>

                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    {quote.createdAt ? new Date(quote.createdAt?.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* Actions Menu */}
                  <td style={{ padding: '1rem', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', color: 'var(--color-text-tertiary)' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }} title="Preview">
                        <Eye size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }} title="Send">
                        <Send size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }} title="More">
                        <MoreVertical size={16} />
                      </button>
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