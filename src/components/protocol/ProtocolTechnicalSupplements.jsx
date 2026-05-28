 
import React from 'react';

const ProtocolTechnicalSupplements = ({ 
  supplements = [], 
  recommendedSupplements = [], 
  onSelectionChange, 
  selectedIds = new Set() 
}) => {
  const rawItems = recommendedSupplements.length > 0 ? recommendedSupplements : supplements;
  
  // Robust defensive parsing of supplement items (handling both string arrays and objects)
  const itemsList = rawItems.map((s, idx) => {
    if (typeof s === 'object' && s !== null) {
      if (s.id) return s;
      const id = `supp_${(s.name || s.product_title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}_${idx}`;
      return { ...s, id };
    }
    
    // Fallback if s is a string (e.g. "berberine")
    const id = s;
    const name = s
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
      
    return {
      id,
      name,
      dose: null,
      dose_unit: 'mg',
      frequency: 'Daily',
      dosage_form: 'Capsules',
      duration_weeks: null
    };
  });

  if (itemsList.length === 0) return null;

  const handleToggle = (item) => {
    if (!onSelectionChange) return;
    const nextIds = new Set(selectedIds);
    if (nextIds.has(item.id)) {
      nextIds.delete(item.id);
    } else {
      nextIds.add(item.id);
    }
    const nextItems = itemsList.filter(x => nextIds.has(x.id));
    onSelectionChange(nextIds, nextItems);
  };

  return (
    <>
      <style>{`
        .pts-container {
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 1rem;
        }
        .pts-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          display: block;
        }
        .pts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 640px) {
          .pts-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .pts-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pts-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transform: translateY(-1px);
        }
        .pts-card.selected {
          background: #f0fdf4;
          border-color: #86efac;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.05);
        }
        .pts-checkbox-wrapper {
          margin-top: 0.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pts-checkbox {
          width: 1.1rem;
          height: 1.1rem;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .pts-card.selected .pts-checkbox {
          background: #22c55e;
          border-color: #22c55e;
        }
        .pts-checkbox svg {
          width: 0.75rem;
          height: 0.75rem;
          stroke: #ffffff;
          stroke-width: 3px;
          fill: none;
          display: none;
        }
        .pts-card.selected .pts-checkbox svg {
          display: block;
        }
        .pts-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          min-width: 0;
        }
        .pts-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
         .pts-card-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          word-break: break-word;
          transition: color 0.15s ease;
        }
        .pts-card.selected .pts-card-name {
          color: #15803d;
        }
        .pts-card-badge {
          font-size: 0.6rem;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
          padding: 0.15rem 0.45rem;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          flex-shrink: 0;
        }
        .pts-card-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pts-detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          line-height: 1.3;
        }
        .pts-detail-label {
          color: #64748b;
        }
        .pts-detail-value {
          color: #334155;
          font-weight: 600;
        }
        .pts-card.selected .pts-detail-value {
          color: #166534;
        }
      `}</style>
      <div className="pts-container">
        <div style={{ marginBottom: '0.85rem' }}>
          <span className="pts-subtitle">Select items to include in bundle</span>
        </div>

        <div className="pts-grid">
          {itemsList.map((s, idx) => {
            const isSelected = selectedIds.has(s.id);
            return (
              <div 
                key={s.id || idx} 
                onClick={() => handleToggle(s)}
                className={`pts-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="pts-checkbox-wrapper">
                  <div className="pts-checkbox">
                    <svg viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>

                <div className="pts-card-content">
                  <div className="pts-card-header">
                    <h4 className="pts-card-name">
                      {s.name}
                    </h4>
                    <span className="pts-card-badge">Oral</span>
                  </div>

                  <div className="pts-card-details">
                    <div className="pts-detail-row">
                      <span className="pts-detail-label">Daily Dose:</span>
                      <span className="pts-detail-value">
                        {s.dosage || (s.dose ? `${s.dose} ${s.dose_unit || 'mg'}` : 'As directed')}
                      </span>
                    </div>
                    <div className="pts-detail-row">
                      <span className="pts-detail-label">Frequency:</span>
                      <span className="pts-detail-value">{s.frequency || 'Daily'}</span>
                    </div>
                    {s.duration_weeks && (
                      <div className="pts-detail-row">
                        <span className="pts-detail-label">Duration:</span>
                        <span className="pts-detail-value">{s.duration_weeks} weeks</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProtocolTechnicalSupplements;
