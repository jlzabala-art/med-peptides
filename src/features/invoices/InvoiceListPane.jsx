import React, { useState } from 'react';
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down";
import Plus from "lucide-react/dist/esm/icons/plus";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

function fmtShortDate(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function InvoiceListPane({ invoices, selectedInvoiceId, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = invoices.filter(i => 
    i.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    i.documentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      
      {/* Header */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Invoices
          </h2>
          <button style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            <Plus size={14} /> New Invoice
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..." 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s' }}
            />
          </div>
          <button style={{ padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} title="Sort">
            <ArrowUpDown size={16} />
          </button>
          <button style={{ padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} title="Filter">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1 }}>
        {filtered.map(invoice => {
          const isSelected = invoice.id === selectedInvoiceId;
          const status = invoice.status || 'Draft';
          
          let statusBg = '#f1f5f9';
          let statusColor = '#64748b';
          if (status === 'Paid') { statusBg = '#d1fae5'; statusColor = '#059669'; }
          else if (status === 'Sent') { statusBg = '#eff6ff'; statusColor = '#2563eb'; }
          else if (status === 'Overdue') { statusBg = '#fee2e2'; statusColor = '#dc2626'; }
          else if (status === 'Partially Paid') { statusBg = '#fef3c7'; statusColor = '#d97706'; }

          return (
            <div 
              key={invoice.id}
              onClick={() => onSelect(invoice)}
              style={{ 
                padding: '1rem 1.25rem', 
                borderBottom: '1px solid #f1f5f9', 
                cursor: 'pointer',
                background: isSelected ? '#f8fafc' : '#fff',
                borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                transition: 'all 0.2s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1e40af' : '#0f172a' }}>
                  {invoice.documentNumber || invoice.id.slice(0, 8)}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                  {fmtCurrency(invoice.grandTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {invoice.customerName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  {fmtShortDate(invoice.createdAt)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ 
                  fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em',
                  background: statusBg, color: statusColor,
                  border: '1px solid', borderColor: statusColor === '#059669' ? '#a7f3d0' : statusColor === '#dc2626' ? '#fca5a5' : '#e2e8f0'
                }}>
                  {status}
                </span>

                {invoice.linkedDocumentNumber && (
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Ref: {invoice.linkedDocumentNumber}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
