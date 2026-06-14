import Eye from "lucide-react/dist/esm/icons/eye";
import Copy from "lucide-react/dist/esm/icons/copy";
import Send from "lucide-react/dist/esm/icons/send";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Truck from "lucide-react/dist/esm/icons/truck";
import React, { useState } from 'react';







export default function QuotationKanbanView({ quotations, onSelect }) {
  const [draggedQuote, setDraggedQuote] = useState(null);

  const stages = [
    { id: 'Draft', label: 'Draft', color: '#94a3b8', bg: '#f1f5f9' },
    { id: 'Sent', label: 'Sent', color: '#3b82f6', bg: '#eff6ff' },
    { id: 'Under Review', label: 'Under Review', color: '#f59e0b', bg: '#fef3c7' },
    { id: 'Negotiation', label: 'Negotiation', color: '#8b5cf6', bg: '#ede9fe' },
    { id: 'Accepted', label: 'Accepted', color: '#10b981', bg: '#d1fae5' },
    { id: 'Rejected', label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
  ];

  const getQuotesByStage = (stageId) => quotations.filter(q => (q.status || 'Draft') === stageId);

  const handleDragStart = (e, quote) => {
    setDraggedQuote(quote);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    if (draggedQuote && draggedQuote.status !== targetStage) {
      // Mock D&D: In a real app we would update Firestore here
      console.log(`Moved quote ${draggedQuote.id} to ${targetStage}`);
      alert(`Quote ${draggedQuote.documentNumber || draggedQuote.id.slice(0,6)} moved to ${targetStage}. (Mock)`);
    }
    setDraggedQuote(null);
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%', overflowX: 'auto', padding: '0.5rem' }} className="hide-scrollbars">
      <style>{`.hide-scrollbars::-webkit-scrollbar { display: none; }`}</style>
      {stages.map(stage => {
        const stageQuotes = getQuotesByStage(stage.id);
        const stageTotal = stageQuotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);

        return (
          <div 
            key={stage.id} 
            style={{ 
              minWidth: '300px', width: '300px', display: 'flex', flexDirection: 'column', 
              background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' 
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'white', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }}></div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{stage.label}</h3>
                  <span style={{ background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{stageQuotes.length}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>${stageTotal.toLocaleString()}</p>
            </div>

            {/* Cards */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
              {stageQuotes.map(quote => (
                <div 
                  key={quote.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, quote)}
                  onClick={() => onSelect(quote)}
                  style={{ 
                    background: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'grab', transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{quote.documentNumber || quote.id.slice(0,8)}</span>
                    {(quote.fulfillment === 'Dropshipping' || quote.dropship) && (
                      <span title="Dropship Item" style={{ color: '#ec4899', background: '#fce7f3', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                        <Truck size={12} />
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{quote.customerName}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>${Number(quote.totalAmount || 0).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      Valid: {quote.validUntil ? new Date(quote.validUntil?.seconds * 1000).toLocaleDateString() : '30 days'}
                    </span>
                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }} title="Preview">
                        <Eye size={14} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }} title="PDF">
                        <FileText size={14} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }} title="Convert">
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {stageQuotes.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>No quotes in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}