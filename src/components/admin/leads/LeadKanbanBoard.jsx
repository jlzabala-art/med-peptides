import React, { useState } from 'react';
import { calculateAILeadScore } from './LeadUtils';
import { Mail, Phone, Calendar, ArrowUpRight, DollarSign, Target, Package, Clock, ShieldAlert } from 'lucide-react';

const STAGES = [
  { id: 'new', label: 'New', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'qualified', label: 'Qualified', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'pricing', label: 'Pricing', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'quoted', label: 'Quotation Sent', color: '#10b981', bg: '#f0fdf4' },
  { id: 'negotiation', label: 'Negotiation', color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'won', label: 'Won', color: '#16a34a', bg: '#dcfce3' },
  { id: 'lost', label: 'Lost', color: '#ef4444', bg: '#fef2f2' },
  { id: 'hold', label: 'Hold', color: '#64748b', bg: '#f8fafc' },
];

export default function LeadKanbanBoard({ leads, onLeadClick, onStatusChange }) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires some data to be set
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedLeadId) {
      onStatusChange(draggedLeadId, stageId);
      setDraggedLeadId(null);
    }
  };

  // Map leads to stages
  const columns = STAGES.map(stage => {
    const stageLeads = leads.filter(l => (l.status || 'new').toLowerCase() === stage.id);
    return { ...stage, leads: stageLeads };
  });

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      overflowX: 'auto', 
      paddingBottom: '1rem',
      minHeight: '600px',
      alignItems: 'flex-start'
    }}>
      {columns.map(col => (
        <div 
          key={col.id} 
          style={{ 
            minWidth: '300px',
            maxWidth: '300px',
            backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
            border: '1px solid var(--border, #e2e8f0)',
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          {/* Column Header */}
          <div style={{ 
            padding: '1rem', 
            borderBottom: '2px solid transparent', 
            borderColor: col.color,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '12px 12px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.color }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main, #1e293b)' }}>{col.label}</span>
            </div>
            <span style={{ 
              fontSize: '0.75rem', fontWeight: 600, color: col.color, 
              backgroundColor: col.bg, padding: '2px 8px', borderRadius: '12px' 
            }}>
              {col.leads.length}
            </span>
          </div>

          {/* Cards Container */}
          <div style={{ 
            padding: '0.75rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            overflowY: 'auto',
            minHeight: '150px' // allow drop even if empty
          }}>
            {col.leads.map(lead => {
              const score = calculateAILeadScore(lead);
              const isRFQ = lead.type === 'rfq';
              const itemsCount = lead.originalData?.items?.length || 0;
              // Mock value based on item count for display
              const value = isRFQ ? itemsCount * 500 : 0;
              const daysOpen = Math.max(0, Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => onLeadClick(lead)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid var(--border, #e2e8f0)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    opacity: draggedLeadId === lead.id ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lead.name}
                    </span>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '2px', 
                      color: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
                      backgroundColor: score >= 80 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2',
                      padding: '2px 6px', borderRadius: '4px', border: `1px solid ${score >= 80 ? '#bbf7d0' : score >= 50 ? '#fcd34d' : '#fca5a5'}`
                    }}>
                      <Target size={10} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{score}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ 
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: isRFQ ? '#f5f3ff' : '#f0fdf4', color: isRFQ ? '#6d28d9' : '#15803d'
                    }}>
                      {isRFQ ? 'Wholesaler RFQ' : 'B2C Catalog Request'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {isRFQ && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>Products</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: 600, fontSize: '0.8rem' }}>
                          <Package size={12} /> {itemsCount}
                        </div>
                      </div>
                    )}
                    {value > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>Est. Value</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#0f766e', fontWeight: 600, fontSize: '0.8rem' }}>
                          <DollarSign size={12} /> {value.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.7rem' }}>
                      <Clock size={10} /> {daysOpen} days open
                    </div>
                    {/* Mock Next Action */}
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#3b82f6' }}>
                      {score > 80 ? 'Send Pricing' : 'Qualify'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
