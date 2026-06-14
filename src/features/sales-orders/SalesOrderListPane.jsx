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

export default function SalesOrderListPane({ orders, selectedOrderId, onSelect }) {
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState(new Set());

  const filtered = orders.filter(o => 
    o.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    o.documentNumber?.toLowerCase().includes(search.toLowerCase())
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
            Orders
          </h2>
          <button style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            <Plus size={14} /> New Order
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, order #..." 
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
        {sorted.map(order => {
          const isSelected = order.id === selectedOrderId;
          const isPinned = pinned.has(order.id);
          
          return (
            <div 
              key={order.id}
              onClick={() => onSelect(order)}
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
                onClick={(e) => togglePin(e, order.id)}
                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: isPinned ? '#eab308' : 'transparent' }}
                className="pin-btn"
              >
                <Pin size={16} fill={isPinned ? '#eab308' : 'none'} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '1.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1e40af' : '#0f172a' }}>
                  {order.documentNumber || order.id.slice(0, 8)}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                  {fmtCurrency(order.grandTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {order.customerName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  {fmtShortDate(order.createdAt)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ 
                  fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em',
                  background: order.commercialStatus === 'Accepted' ? '#ecfdf5' : '#f8fafc',
                  color: order.commercialStatus === 'Accepted' ? '#059669' : '#64748b',
                  border: '1px solid',
                  borderColor: order.commercialStatus === 'Accepted' ? '#a7f3d0' : '#e2e8f0'
                }}>
                  {order.commercialStatus || 'Draft'}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em',
                  background: order.operationalStatus === 'Awaiting Stock' ? '#fef3c7' : '#f3e8ff',
                  color: order.operationalStatus === 'Awaiting Stock' ? '#d97706' : '#7c3aed',
                  border: '1px solid',
                  borderColor: order.operationalStatus === 'Awaiting Stock' ? '#fde68a' : '#e9d5ff'
                }}>
                  {order.operationalStatus || 'Awaiting'}
                </span>
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
