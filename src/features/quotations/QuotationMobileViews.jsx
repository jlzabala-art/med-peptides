import React, { useState } from 'react';
import Search from "lucide-react/dist/esm/icons/search";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Target from "lucide-react/dist/esm/icons/target";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function QuotationMobileViews({ quotes, selectedQuote, onSelect }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const filtered = quotes.filter(q => 
    q.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    q.documentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    'Draft': { bg: '#f1f5f9', color: '#64748b' },
    'Sent': { bg: '#eff6ff', color: '#2563eb' },
    'Viewed': { bg: '#e0e7ff', color: '#4f46e5' },
    'Negotiation': { bg: '#fef3c7', color: '#d97706' },
    'Accepted': { bg: '#d1fae5', color: '#059669' },
    'Expired': { bg: '#fee2e2', color: '#ef4444' },
    'Rejected': { bg: '#fee2e2', color: '#b91c1c' }
  };

  if (selectedQuote) {
    const status = selectedQuote.status || 'Draft';
    const badge = statusColors[status] || statusColors['Draft'];
    const probability = selectedQuote.probability || (status === 'Accepted' ? 100 : status === 'Negotiation' ? 65 : status === 'Sent' ? 40 : 10);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f8fafc', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
        
        {/* Detail Sticky Header */}
        <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => onSelect(null)} style={{ background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={24} color="#0f172a" />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedQuote.documentNumber || 'Quote Details'}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{selectedQuote.customerName}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 1rem', flexShrink: 0 }}>
           {['overview', 'products', 'negotiation', 'intelligence'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               style={{
                 padding: '1rem 0.75rem', background: 'transparent', border: 'none', 
                 borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
                 color: activeTab === tab ? '#8b5cf6' : '#64748b',
                 fontWeight: activeTab === tab ? 700 : 500,
                 fontSize: '0.9rem', textTransform: 'capitalize', cursor: 'pointer',
                 whiteSpace: 'nowrap'
               }}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {activeTab === 'overview' && (
            <>
              {/* Summary */}
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Opportunity</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{fmtCurrency(selectedQuote.totalAmount)}</div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: badge.bg, color: badge.color, borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {status}
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Target size={12} /> {probability}% Win Prob.
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {(selectedQuote.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i < (selectedQuote.items?.length || 0)-1 ? '1px solid #f1f5f9' : 'none', padding: '0.75rem 0' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{item.name || item.itemName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.quantity} x {fmtCurrency(item.rate)}</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{fmtCurrency(item.quantity * item.rate)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'negotiation' && <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Negotiation history here</div>}
          {activeTab === 'intelligence' && <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>AI Insights here</div>}

        </div>

        {/* Sticky Action Bar */}
        <div style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', position: 'sticky', bottom: 0, zIndex: 10 }}>
           <button style={{ padding: '0.85rem', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', border: 'none', fontWeight: 600, flex: 1 }}>More</button>
           <button style={{ padding: '0.85rem', borderRadius: '8px', background: status === 'Accepted' ? '#059669' : '#8b5cf6', color: '#fff', border: 'none', fontWeight: 700, flex: 2 }}>
             {status === 'Draft' ? 'Send Quote' : status === 'Accepted' ? 'Convert to Order' : 'Follow up'}
           </button>
        </div>

      </div>
    );
  }

  // Home Screen (Mobile List)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Global Search Header */}
      <div style={{ padding: '1.25rem 1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Quotations</h1>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search quotes..." 
            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' }}
          />
        </div>
      </div>

      {/* Full-screen List */}
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(quote => {
          const status = quote.status || 'Draft';
          const badge = statusColors[status] || statusColors['Draft'];

          return (
            <div 
              key={quote.id} 
              onClick={() => onSelect(quote)}
              style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{quote.documentNumber || quote.id.slice(0, 8)}</span>
                <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '1rem' }}>{fmtCurrency(quote.totalAmount)}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>{quote.customerName}</div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                 <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: badge.bg, color: badge.color, borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
