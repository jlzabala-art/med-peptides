import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronUp, FlaskConical, Activity } from 'lucide-react';

export const PhaseAccordion = memo(function PhaseAccordion({ phase, index, weekRange, clinicalGoal }) {
  const [open, setOpen] = useState(index === 0);
  const [showDetails, setShowDetails] = useState(false);
  const drugs = phase.drugs || phase.compounds || phase.medications || [];
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

      <AnimatePresence initial={false}>
      {open && (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
        >
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
                      {d.name || d.product_name || d.compound || d.product_slug || '—'}
                    </span>
                    <span className="proto-compound-table__dose" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '0.8rem', fontWeight: 600 }}>
                      {d.weekly_dose_amount != null
                        ? `${d.weekly_dose_amount} ${d.weekly_dose_unit || ''}`
                        : d.dose_logic?.starting_weekly_dose != null
                          ? `${d.dose_logic.starting_weekly_dose} ${d.dose_logic.dose_unit || ''}`
                          : d.dose_logic?.dose_per_administration != null
                            ? `${d.dose_logic.dose_per_administration} ${d.dose_logic.dose_unit || ''}`
                            : d.weekly_dose || d.dose || '—'}
                    </span>
                    <span className="proto-compound-table__freq">
                      {d.dose_logic?.administration_frequency
                        ? d.dose_logic.administration_frequency.replace(/_/g, ' ')
                        : (d.frequency || d.frequency_of_use || d.administration_schedule || '—')}
                    </span>
                    <span className="proto-compound-table__route">
                      {d.dose_logic?.route_of_administration || d.route || d.administration_route || d.route_of_administration || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasDetails && (
            <div className="proto-phase__footer">
              <button
                className="proto-phase__details-toggle"
                onClick={() => setShowDetails((d) => !d)}
              >
                <Activity size={12} />
                {showDetails ? 'Hide Monitoring Details' : 'Show Monitoring & Notes'}
              </button>
              
              <AnimatePresence initial={false}>
              {showDetails && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                >
                <div className="proto-phase__details-content">
                  {phase.monitoring && (
                    <div className="proto-phase__block">
                      <h4 className="proto-phase__block-title">Clinical Monitoring</h4>
                      <div className="proto-phase__block-text" dangerouslySetInnerHTML={{ __html: phase.monitoring }} />
                    </div>
                  )}
                  {phase.notes && (
                    <div className="proto-phase__block">
                      <h4 className="proto-phase__block-title">Phase Notes</h4>
                      <div className="proto-phase__block-text" dangerouslySetInnerHTML={{ __html: phase.notes }} />
                    </div>
                  )}
                </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          )}
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
});

export default PhaseAccordion;
