 
import React from 'react';
import { ROUTE_LABELS } from '../../constants/productEnums';

const ProtocolTechnicalPeptides = ({ peptides = [], activeProtocolPhases = [] }) => {
  let resolvedPeptides = [...peptides];
  if (resolvedPeptides.length === 0 && activeProtocolPhases.length > 0) {
    const seen = new Set();
    activeProtocolPhases.forEach(ph => {
      const drugs = ph.drugs || ph.compounds || ph.medications || [];
      drugs.forEach(d => {
        const title = d.product_title || d.name || d.compound || '';
        if (title && !seen.has(title)) {
          seen.add(title);
          resolvedPeptides.push({
            name: title,
            route: d.route || d.dose_logic?.route_of_administration || 'subcutaneous',
            weekly_dose: d.dose_logic?.starting_weekly_dose || '—',
            dose_unit: d.dose_logic?.dose_unit || 'mg',
            frequency: d.dose_logic?.administration_frequency || '—',
            vial_size: d.vial_strength || d.dose_logic?.vial_strength || null,
            dosage_form: 'vial'
          });
        }
      });
    });
  }

  if (resolvedPeptides.length === 0) return null;

  return (
    <>
      <style>{`
        .ptp-container {
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 1rem;
          padding-top: 0.5rem;
        }
        .ptp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 640px) {
          .ptp-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .ptp-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ptp-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .ptp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .ptp-card-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ptp-card-badge {
          font-size: 0.6rem;
          font-weight: 700;
          color: #0369a1;
          background: #e0f2fe;
          padding: 0.15rem 0.45rem;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          flex-shrink: 0;
        }
        .ptp-card-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .ptp-detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          line-height: 1.3;
        }
        .ptp-detail-label {
          color: #64748b;
        }
        .ptp-detail-value {
          color: #334155;
          font-weight: 600;
        }
        .ptp-note {
          margin-top: 0.25rem;
          padding: 0.5rem;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 6px;
          font-size: 0.62rem;
          color: #b45309;
          font-style: italic;
          line-height: 1.3;
        }
      `}</style>

      <div className="ptp-container">
        <div className="ptp-grid">
          {resolvedPeptides.map((p, idx) => (
            <div key={idx} className="ptp-card">
              <div className="ptp-card-header">
                <h4 className="ptp-card-name">{p.name || p.product_title}</h4>
                <span className="ptp-card-badge">
                  {ROUTE_LABELS[p.route] || 'Subcutaneous'}
                </span>
              </div>
              
              <div className="ptp-card-details">
                <div className="ptp-detail-row">
                  <span className="ptp-detail-label">Weekly Dose:</span>
                  <span className="ptp-detail-value font-mono">{p.weekly_dose || p.startDose} {p.dose_unit || 'mg'}</span>
                </div>
                <div className="ptp-detail-row">
                  <span className="ptp-detail-label">Frequency:</span>
                  <span className="ptp-detail-value">{p.frequency || p.dosing_frequency}</span>
                </div>
                {p.vial_size && (
                  <div className="ptp-detail-row">
                    <span className="ptp-detail-label">Vial Size:</span>
                    <span className="ptp-detail-value">{p.vial_size} mg</span>
                  </div>
                )}
              </div>

              {p.dosage_form === 'vial' && (
                <div className="ptp-note">
                  * Clinical Note: Use sterile "vial" terminology for subcutaneous administration only.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProtocolTechnicalPeptides;
