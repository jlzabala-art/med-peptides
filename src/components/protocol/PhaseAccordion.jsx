 
import React, { useState, memo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  FlaskConical, 
  Activity, 
  BookOpen 
} from 'lucide-react';
import { safeStr } from '../../utils/textUtils';

const PhaseAccordion = memo(function PhaseAccordion({ phase, index, weekRange, clinicalGoal }) {

  const [open, setOpen] = useState(index === 0);
  const [showDetails, setShowDetails] = useState(false);
  const drugs = phase.drugs || phase.compounds || phase.medications || phase.drugs_used || [];
  const hasDetails = phase.monitoring || phase.notes;
  const phaseName = phase.name || phase.phase_name || `Phase ${index + 1}`;
  const goal = clinicalGoal || phase.objective || '';

  return (
    <div className={`proto-phase ${open ? 'proto-phase--open' : ''}`}>
      <button className="proto-phase__header" onClick={() => setOpen((o) => !o)}>
        <div className="proto-phase__title-row">
          <span className="proto-phase__num">{String(index + 1).padStart(2, '0')}</span>
          <div className="proto-phase__title-group">
            <span className="proto-phase__name">{phaseName}</span>
            {/* Week range — always visible */}
            {weekRange && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem',
                marginTop: '0.15rem',
              }}>
                <Calendar size={11} strokeWidth={2} />
                {weekRange}
              </span>
            )}
            {/* Clinical goal — shown collapsed only */}
            {goal && !open && (
              <span className="proto-phase__subtitle-preview">
                {goal.slice(0, 70)}{goal.length > 70 ? '…' : ''}
              </span>
            )}
          </div>
          {phase.duration_weeks && (
            <span className="proto-phase__dur">
              <Clock size={11} />
              {phase.duration_weeks}w
            </span>
          )}
        </div>
        <div className="proto-phase__header-right">
          {drugs.length > 0 && (
            <span className="proto-phase__compound-count">{drugs.length} compd.</span>
          )}
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {open && (
        <div className="proto-phase__body">
          {phase.objective && (
            <p className="proto-phase__objective">{phase.objective}</p>
          )}

          {/* COMPOUNDS TABLE — Technical Data Sheet format */}
          {drugs.length > 0 && (
            <div className="proto-phase__drugs">
              <div className="proto-phase__drugs-title">
                <FlaskConical size={12} />
                <span>Compound Registry</span>
                <span className="proto-phase__drugs-count">{drugs.length}</span>
              </div>
              <div className="proto-compound-table">
                <div className="proto-compound-table__head">
                  <span>Compound</span>
                  <span>Dose</span>
                  <span>Frequency</span>
                  <span>Route</span>
                </div>
                {drugs.map((d, i) => (
                  <div key={i} className="proto-compound-table__row">
                    <span className="proto-compound-table__name">
                      {safeStr(d.name || d.product_name || d.compound || d.product_slug)}
                    </span>
                    <span className="proto-compound-table__dose" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '0.8rem', fontWeight: 600 }}>
                      {d.weekly_dose_amount != null
                        ? `${d.weekly_dose_amount} ${d.weekly_dose_unit || ''}`
                        : d.dose_logic?.starting_weekly_dose != null
                          ? `${d.dose_logic.starting_weekly_dose} ${d.dose_logic.dose_unit || ''}`
                          : d.dose_logic?.dose_per_administration != null
                            ? `${d.dose_logic.dose_per_administration} ${d.dose_logic.dose_unit || ''}`
                            : safeStr(d.weekly_dose ?? d.dose)}
                    </span>
                    <span className="proto-compound-table__freq">
                      {d.dose_logic?.administration_frequency
                        ? safeStr(d.dose_logic.administration_frequency).replace(/_/g, ' ')
                        : safeStr(d.frequency || d.frequency_of_use || d.administration_schedule)}
                    </span>
                    <span className="proto-compound-table__route">
                      {safeStr(d.dose_logic?.route_of_administration || d.route || d.administration_route || d.route_of_administration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESSIVE DISCLOSURE — Monitoring + Notes */}
          {hasDetails && (
            <button
              onClick={() => setShowDetails(v => !v)}
              className="proto-phase__details-toggle"
            >
              {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showDetails ? 'Collapse Details' : 'View Clinical Details'}
            </button>
          )}

          {showDetails && (
            <div className="proto-phase__details-panel">
              {phase.monitoring && (
                <div className="proto-phase__detail-block">
                  <div className="proto-phase__detail-label">
                    <Activity size={11} /> Monitoring Protocol
                  </div>
                  <p className="proto-phase__monitoring-text">{safeStr(phase.monitoring)}</p>
                </div>
              )}
              {phase.notes && (
                <div className="proto-phase__detail-block">
                  <div className="proto-phase__detail-label">
                    <BookOpen size={11} /> Clinical Notes
                  </div>
                  <p className="proto-phase__notes">{safeStr(phase.notes)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default PhaseAccordion;
