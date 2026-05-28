import React from 'react';

export const ProtocolTechnicalTesting = ({
  recommendedTests = [],
  products = [],
  onSelectionChange,
  selectedIds = new Set()
}) => {
  // Find detailed product objects for each recommended test ID
  const itemsList = recommendedTests
    .map(testId => {
      const match = products.find(p => p.id === testId);
      if (match) return match;
      // Fallback stub if not found in catalog
      return {
        id: testId,
        displayName: testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        desc: 'Diagnostic testing tool for clinical evaluation.',
        category: 'Diagnostic Testing'
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
        .ptt-container {
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 1rem;
        }
        .ptt-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          display: block;
        }
        .ptt-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 640px) {
          .ptt-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .ptt-card {
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
        .ptt-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transform: translateY(-1px);
        }
        .ptt-card.selected {
          background: #fdfaf2;
          border-color: #fbd38d;
          box-shadow: 0 4px 12px rgba(221, 107, 32, 0.05);
        }
        .ptt-checkbox-wrapper {
          margin-top: 0.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ptt-checkbox {
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
        .ptt-card.selected .ptt-checkbox {
          background: #dd6b20;
          border-color: #dd6b20;
        }
        .ptt-checkbox svg {
          width: 0.75rem;
          height: 0.75rem;
          stroke: #ffffff;
          stroke-width: 3px;
          fill: none;
          display: none;
        }
        .ptt-card.selected .ptt-checkbox svg {
          display: block;
        }
        .ptt-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          min-width: 0;
        }
        .ptt-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .ptt-card-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          word-break: break-word;
          transition: color 0.15s ease;
        }
        .ptt-card.selected .ptt-card-name {
          color: #dd6b20;
        }
        .ptt-card-badge {
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
        .ptt-card-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .ptt-desc {
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.35;
          margin: 0;
        }
        .ptt-objective {
          font-size: 0.7rem;
          color: #475569;
          font-style: italic;
          margin-top: 0.2rem;
        }
      `}</style>
      <div className="ptt-container">
        <div style={{ marginBottom: '0.85rem' }}>
          <span className="ptt-subtitle">Select diagnostic tests to include in bundle (Optional)</span>
        </div>

        <div className="ptt-grid">
          {itemsList.map((item, idx) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id || idx}
                onClick={() => handleToggle(item)}
                className={`ptt-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="ptt-checkbox-wrapper">
                  <div className="ptt-checkbox">
                    <svg viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>

                <div className="ptt-card-content">
                  <div className="ptt-card-header">
                    <h4 className="ptt-card-name">
                      {item.displayName || item.name}
                    </h4>
                    <span className="ptt-card-badge">{item.category || 'Diagnostics'}</span>
                  </div>

                  <div className="ptt-card-details">
                    <p className="ptt-desc">{item.desc || item.description}</p>
                    {item.objective && (
                      <div className="ptt-objective">
                        <strong>Goal:</strong> {item.objective}
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

export default ProtocolTechnicalTesting;
