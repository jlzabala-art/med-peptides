import React, { useState } from 'react';
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down";
import Plus from "lucide-react/dist/esm/icons/plus";
import Pin from "lucide-react/dist/esm/icons/pin";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

function fmtShortDate(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function QuotationListPane({ quotes, selectedQuoteId, onSelect }) {
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState(new Set());

  const filtered = quotes.filter(q => 
    q.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    q.documentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const togglePin = (e, id) => {
    e.stopPropagation();
    const newPinned = new Set(pinned);
    if (newPinned.has(id)) newPinned.delete(id);
    else newPinned.add(id);
    setPinned(newPinned);
  };

  const sorted = [...filtered].sort((a, b) => {
    const aPinned = pinned.has(a.id) ? 1 : 0;
    const bPinned = pinned.has(b.id) ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      
      {/* Header */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Quotations
          </h2>
          <button style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            <Plus size={14} /> New Quote
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, quote #..." 
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
        {sorted.map(quote => {
          const isSelected = quote.id === selectedQuoteId;
          const isPinned = pinned.has(quote.id);
          
          const probability = quote.probability || (quote.status === 'Accepted' ? 100 : quote.status === 'Negotiation' ? 65 : quote.status === 'Sent' ? 40 : 10);
          const probColor = probability >= 70 ? '#059669' : probability >= 40 ? '#d97706' : '#dc2626';

          return (
            <div 
              key={quote.id}
              onClick={() => onSelect(quote)}
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
              <button 
                onClick={(e) => togglePin(e, quote.id)}
                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: isPinned ? '#eab308' : 'transparent' }}
                className="pin-btn"
              >
                <Pin size={16} fill={isPinned ? '#eab308' : 'none'} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '1.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1e40af' : '#0f172a' }}>
                  {quote.documentNumber || quote.id.slice(0, 8)}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                  {fmtCurrency(quote.totalAmount || quote.grandTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {quote.customerName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  {fmtShortDate(quote.createdAt)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em',
                    background: quote.status === 'Accepted' ? '#ecfdf5' : quote.status === 'Negotiation' ? '#fef3c7' : '#f8fafc',
                    color: quote.status === 'Accepted' ? '#059669' : quote.status === 'Negotiation' ? '#d97706' : '#64748b',
                    border: '1px solid',
                    borderColor: quote.status === 'Accepted' ? '#a7f3d0' : quote.status === 'Negotiation' ? '#fde68a' : '#e2e8f0'
                  }}>
                    {quote.status || 'Draft'}
                  </span>
                </div>

                {/* Circular Probability Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <svg width="14" height="14" viewBox="0 0 36 36">
                    <path fill="none" stroke="#e2e8f0" strokeWidth="4" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path fill="none" stroke={probColor} strokeWidth="4" strokeDasharray={`${probability}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{probability}%</span>
                </div>
              </div>
            </div>
          );
        })}
        <style>{`
          div:hover > .pin-btn { color: #cbd5e1 !important; }
        `}</style>
      </div>
    </div>
  );
}
