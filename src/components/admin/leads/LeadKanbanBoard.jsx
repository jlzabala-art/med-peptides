import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Target from "lucide-react/dist/esm/icons/target";
import Package from "lucide-react/dist/esm/icons/package";
import Clock from "lucide-react/dist/esm/icons/clock";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import User from "lucide-react/dist/esm/icons/user";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import React, { useState } from 'react';
import { calculateDetailedAIScore } from './LeadUtils';












const STAGES = [
  { id: 'new', label: 'New', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'qualified', label: 'Qualified', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'pricing', label: 'RFQ Requested', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'quoted', label: 'Quotation Sent', color: '#10b981', bg: '#f0fdf4' },
  { id: 'negotiation', label: 'Negotiation', color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'awaiting', label: 'Awaiting Decision', color: '#ea580c', bg: '#fff7ed' },
  { id: 'won', label: 'Won', color: '#16a34a', bg: '#dcfce3' },
  { id: 'lost', label: 'Lost', color: '#ef4444', bg: '#fef2f2' }
];

export default function LeadKanbanBoard({ leads, onLeadClick, onStatusChange }) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
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

  // Map leads to columns, handle status aliases for robustness
  const columns = STAGES.map(stage => {
    const stageLeads = leads.filter(l => {
      let st = (l.status || 'new').toLowerCase();
      if (st === 'hold') st = 'awaiting';
      if (st === 'completed') st = 'won';
      if (st === 'rfq_requested') st = 'pricing';
      if (st === 'quotation_sent') st = 'quoted';
      if (st === 'awaiting_decision') st = 'awaiting';
      return st === stage.id;
    });
    return { ...stage, leads: stageLeads };
  });

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      overflowX: 'auto', 
      paddingBottom: '1.5rem',
      minHeight: '600px',
      alignItems: 'flex-start'
    }}>
      {columns.map(col => (
        <div 
          key={col.id} 
          style={{ 
            minWidth: '280px',
            maxWidth: '280px',
            backgroundColor: 'var(--surface-raised, #f8fafc)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '750px',
            border: '1px solid var(--border, #e2e8f0)',
            flexShrink: 0
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          {/* Column Header */}
          <div style={{ 
            padding: '1rem', 
            borderBottom: `3px solid ${col.color}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--surface, #ffffff)',
            borderRadius: '12px 12px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
              <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-main, #1e293b)' }}>{col.label}</span>
            </div>
            <span style={{ 
              fontSize: '0.7rem', fontWeight: 700, color: col.color, 
              backgroundColor: col.bg, padding: '2px 8px', borderRadius: '10px' 
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
            minHeight: '200px'
          }}>
            {col.leads.map(lead => {
              const aiDetails = calculateDetailedAIScore(lead);
              const isRFQ = lead.type === 'rfq';
              const itemsCount = lead.originalData?.items?.length || 0;
              // Calculate opportunity value
              const value = isRFQ 
                ? (lead.originalData?.items || []).reduce((sum, item) => sum + ((item.clientUnitPrice || 250) * (item.quantity || 1)), 0)
                : 500;
              const daysOpen = Math.max(0, Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24)));
              const owner = lead.assignedOwner || 'Jose';
              const country = lead.country || (isRFQ ? 'Spain' : 'UAE');
              const leadType = lead.leadType || (isRFQ ? 'Compounding Pharmacy' : 'Clinic');

              // Lead Health check
              let healthColor = '#10b981'; // Healthy
              let healthLabel = 'Healthy';
              if (daysOpen > 15 && col.id !== 'won' && col.id !== 'lost') {
                healthColor = '#dc2626'; // Critical
                healthLabel = 'Critical';
              } else if (daysOpen > 7 && col.id !== 'won' && col.id !== 'lost') {
                healthColor = '#f59e0b'; // Attention
                healthLabel = 'Attention';
              }

              return (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => onLeadClick(lead)}
                  style={{
                    backgroundColor: 'var(--surface, #ffffff)',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid var(--border, #e2e8f0)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    opacity: draggedLeadId === lead.id ? 0.4 : 1,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = 'var(--primary, #3b82f6)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                  }}
                >
                  {/* Lead Health Marker Bar */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '3.5px',
                    backgroundColor: healthColor,
                    borderRadius: '10px 0 0 10px'
                  }} title={`Health Score: ${healthLabel}`} />

                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', paddingLeft: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main, #1e293b)', lineHeight: 1.3 }}>
                      {lead.name}
                    </span>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '2px', 
                      color: aiDetails.score >= 80 ? '#10b981' : aiDetails.score >= 50 ? '#f59e0b' : '#ef4444',
                      backgroundColor: aiDetails.score >= 80 ? '#f0fdf4' : aiDetails.score >= 50 ? '#fffbeb' : '#fef2f2',
                      padding: '1px 5px', borderRadius: '4px', border: `1px solid ${aiDetails.score >= 80 ? '#bbf7d0' : aiDetails.score >= 50 ? '#fcd34d' : '#fca5a5'}`,
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>AI {aiDetails.score}</span>
                    </div>
                  </div>

                  {/* Secondary info: Type & Country */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.6rem', paddingLeft: '4px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: isRFQ ? '#f5f3ff' : '#f0fdf4', color: isRFQ ? '#6d28d9' : '#15803d'
                    }}>
                      {leadType}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <MapPin size={10} /> {country}
                    </span>
                  </div>

                  {/* Operational metrics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1.2fr', 
                    gap: '0.5rem', 
                    marginBottom: '0.6rem', 
                    padding: '0.5rem', 
                    backgroundColor: 'var(--surface-raised, #f8fafc)', 
                    borderRadius: '6px',
                    marginLeft: '4px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Est. Value</span>
                      <strong style={{ color: 'var(--text-main, #0f172a)', fontSize: '0.75rem', fontWeight: 800 }}>
                        AED {value.toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Last Activity</span>
                      <span style={{ color: 'var(--text-muted, #475569)', fontSize: '0.7rem', fontWeight: 600 }}>
                        {daysOpen === 0 ? 'Today' : `${daysOpen} days ago`}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid var(--border, #f1f5f9)', 
                    paddingTop: '0.5rem',
                    paddingLeft: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-light, #eff6ff)', 
                        color: 'var(--primary, #2563eb)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>
                        {owner.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{owner}</span>
                    </div>
                    {/* Next Action Indicator */}
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      color: healthColor,
                      backgroundColor: healthColor + '15',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {aiDetails.score > 80 ? 'Send Quote' : 'Qualify'}
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