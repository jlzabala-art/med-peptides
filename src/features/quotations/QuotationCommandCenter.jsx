import FileText from "lucide-react/dist/esm/icons/file-text";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Plus from "lucide-react/dist/esm/icons/plus";
import React, { useMemo } from 'react';






export default function QuotationCommandCenter({ quotations, onCreateNew }) {
  const stats = useMemo(() => {
    const total = quotations.length;
    const pending = quotations.filter(q => q.status === 'Draft' || q.status === 'Pending').length;
    const accepted = quotations.filter(q => q.status === 'Accepted').length;
    const totalValue = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);

    return { total, pending, accepted, totalValue };
  }, [quotations]);

  const cards = [
    { label: 'Total Quotes', value: stats.total, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pipeline Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: '#10b981', bg: '#dcfce7' },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: '#8b5cf6', bg: '#ede9fe' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
          Commercial Proposal Hub
        </h2>
        <button 
          onClick={onCreateNew}
          style={{
            background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px',
            padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={16} /> New Proposal
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{ 
            background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ background: card.bg, color: card.color, width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <card.icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{card.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}