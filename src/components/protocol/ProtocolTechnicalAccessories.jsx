 
import React from 'react';

const ProtocolTechnicalAccessories = ({ 
  accessories = [], 
  phase_blueprints = [], 
  onSelectionChange, 
  selectedIds = new Set() 
}) => {
  // Derive standard accessories from phase blueprints if not provided explicitly
  let calculatedAccessories = [...accessories];
  if (calculatedAccessories.length === 0 && phase_blueprints.length > 0) {
    let totalInjections = 0;
    let totalBacWaterMl = 0;

    phase_blueprints.forEach(ph => {
      const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
      const drugs = ph.drugs || ph.compounds || ph.medications || [];
      
      drugs.forEach(d => {
        const logic = d.dose_logic || {};
        const canonicalVials =
          logic.vials_required != null ? Number(logic.vials_required)
          : d.vials_required   != null ? Number(d.vials_required)
          : null;

        const freq = logic.administration_frequency || logic.frequency || d.dosing_frequency || 'once_weekly';
        let dosingPerWeek = 1;
        const normFreq = freq.toLowerCase();
        if (normFreq.includes('daily') || normFreq.includes('diario')) dosingPerWeek = 7;
        else if (normFreq.includes('2x') || normFreq.includes('twice')) dosingPerWeek = 2;
        else if (normFreq.includes('3x') || normFreq.includes('thrice')) dosingPerWeek = 3;
        else if (normFreq.includes('4x')) dosingPerWeek = 4;
        else if (normFreq.includes('5x')) dosingPerWeek = 5;
        else if (normFreq.includes('6x')) dosingPerWeek = 6;

        const doseAmount = parseFloat(logic.starting_weekly_dose || logic.dose_per_administration || 0);
        const vialSize = parseFloat(d.vial_size_mg || logic.vial_strength || 5);
        const isWeeklyDose = Boolean(logic.starting_weekly_dose || logic.max_weekly_dose);

        const baseWeeklyDose = isWeeklyDose ? doseAmount : (doseAmount * dosingPerWeek);
        const maxDose = logic.max_weekly_dose || logic.possible_next_step_dose || null;
        const weeklyDose = maxDose && maxDose > baseWeeklyDose ? (baseWeeklyDose + maxDose) / 2 : baseWeeklyDose;
        const totalRequirement = weeklyDose * dur;
        const vialsNeeded = canonicalVials !== null && !isNaN(canonicalVials) 
          ? canonicalVials 
          : (totalRequirement > 0 ? Math.ceil(totalRequirement / vialSize) : 1);

        const explicitWaterMl = d.reconstitution?.water_volume_ml ?? logic.reconstitution_water_ml ?? null;
        const reconstitutionMl = explicitWaterMl !== null ? Number(explicitWaterMl) : (vialSize > 0 ? 2 : 0);

        totalInjections += (dosingPerWeek * dur);
        totalBacWaterMl += (reconstitutionMl * vialsNeeded);
      });
    });

    const bacWaterBottles = totalBacWaterMl > 0 ? Math.ceil(totalBacWaterMl / 10) : 0;
    const syringePacks = Math.ceil(totalInjections / 10) || 1;

    calculatedAccessories = [
      bacWaterBottles > 0 ? { id: 'bac_water_10ml', name: 'Bacteriostatic Water 10 mL', quantity: bacWaterBottles, usage: 'Required for lyophilized powder reconstitution', unitPrice: 8 } : null,
      { id: 'insulin_syringe', name: 'Insulin Syringes 1 mL (x10)', quantity: syringePacks, usage: 'Ultra-fine needle for comfortable subcutaneous injections', unitPrice: 12 },
      { id: 'alcohol_pads', name: 'Alcohol Prep Pads (x50)', quantity: 1, usage: 'Required for site sterilization before injection', unitPrice: 6 }
    ].filter(Boolean);
  }

  if (calculatedAccessories.length === 0) return null;

  const handleToggle = (item) => {
    if (!onSelectionChange) return;
    const nextIds = new Set(selectedIds);
    if (nextIds.has(item.id)) {
      nextIds.delete(item.id);
    } else {
      nextIds.add(item.id);
    }
    const nextItems = calculatedAccessories.filter(x => nextIds.has(x.id));
    onSelectionChange(nextIds, nextItems);
  };

  return (
    <>
      <style>{`
        .pta-container {
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 1rem;
        }
        .pta-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          display: block;
        }
        .pta-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pta-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pta-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transform: translateY(-1px);
        }
        .pta-card.selected {
          background: #f0f9ff;
          border-color: #7dd3fc;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.04);
        }
        .pta-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }
        .pta-checkbox-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pta-checkbox {
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
        .pta-card.selected .pta-checkbox {
          background: #0284c7;
          border-color: #0284c7;
        }
        .pta-checkbox svg {
          width: 0.75rem;
          height: 0.75rem;
          stroke: #ffffff;
          stroke-width: 3px;
          fill: none;
          display: none;
        }
        .pta-card.selected .pta-checkbox svg {
          display: block;
        }
        .pta-info {
          min-width: 0;
        }
        .pta-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          transition: color 0.15s ease;
          word-break: break-word;
        }
        .pta-card.selected .pta-name {
          color: #0369a1;
        }
        .pta-usage {
          font-size: 0.68rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
          word-break: break-word;
        }
        .pta-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .pta-qty-badge {
          font-size: 0.68rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-family: 'JetBrains Mono', monospace;
        }
        .pta-price {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          font-family: 'JetBrains Mono', monospace;
          min-width: 3.25rem;
          text-align: right;
        }
        .pta-card.selected .pta-price {
          color: #0369a1;
        }
      `}</style>
      <div className="pta-container">
        <div style={{ marginBottom: '0.85rem' }}>
          <span className="pta-subtitle">Select items to include in bundle</span>
        </div>

        <div className="pta-list">
          {calculatedAccessories.map((a, idx) => {
            const isSelected = selectedIds.has(a.id);
            return (
              <div 
                key={a.id || idx}
                onClick={() => handleToggle(a)}
                className={`pta-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="pta-left">
                  <div className="pta-checkbox-wrapper">
                    <div className="pta-checkbox">
                      <svg viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="pta-info">
                    <p className="pta-name">{a.name}</p>
                    <p className="pta-usage">{a.usage || 'Clinical supply'}</p>
                  </div>
                </div>

                <div className="pta-right">
                  <span className="pta-qty-badge">
                    Qty: {a.quantity}
                  </span>
                  <span className="pta-price">
                    ${(a.unitPrice * a.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProtocolTechnicalAccessories;
