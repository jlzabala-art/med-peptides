import Calendar from "lucide-react/dist/esm/icons/calendar";
import Clock from "lucide-react/dist/esm/icons/clock";
import Target from "lucide-react/dist/esm/icons/target";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Activity from "lucide-react/dist/esm/icons/activity";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import React, { memo } from 'react';






import { safeStr } from '../../utils/textUtils';

/**
 * BrochurePhaseCard — Clinical Infographic card for the brochure flow
 */
const BrochurePhaseCard = memo(function BrochurePhaseCard({
  phase, index, weekRange, clinicalGoal, simplified_explanation,
}) {
  const drugs = phase.drugs || phase.compounds || phase.medications || phase.drugs_used || [];
  const phaseName = phase.name || phase.phase_name || `Phase ${index + 1}`;
  const goal = clinicalGoal || phase.objective || '';
  const phaseType = phase.phase_type || phase.type || '';
  const colorIdx = index % 8; // cycles through 8 palette slots

  return (
    <div
      className="brochure-phase-card"
      style={{ '--phase-color': `var(--phase-color-${colorIdx})` }}
    >
      {/* ── HEADER BAND ── */}
      <div className="brochure-phase-card__header">
        <div className="brochure-phase-card__header-left">
          <span className="brochure-phase-card__num">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="brochure-phase-card__title-group">
            {phaseType && (
              <span className="brochure-phase-card__type-badge">
                {phaseType.toUpperCase()}
              </span>
            )}
            <span className="brochure-phase-card__name">{phaseName}</span>
          </div>
        </div>
        {weekRange && (
          <div className="brochure-phase-card__week-pill">
            <Calendar size={11} strokeWidth={2.5} />
            <span>{weekRange}</span>
          </div>
        )}
        {phase.duration_weeks && (
          <div className="brochure-phase-card__dur">
            <Clock size={11} strokeWidth={2.5} />
            <span>{phase.duration_weeks}w</span>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="brochure-phase-card__body">
        {/* ── CLINICAL OBJECTIVE ── */}
        {goal && (
          <div className="brochure-phase-card__objective">
            <Target className="brochure-phase-card__objective-icon" size={16} strokeWidth={2.5} />
            <p className="brochure-phase-card__objective-text">{goal}</p>
          </div>
        )}

        {/* ── SIMPLIFIED EXPLANATION ── */}
        {simplified_explanation && (
          <p className="brochure-phase-card__simplified">{simplified_explanation}</p>
        )}

        {/* ── COMPOUND TABLE ── */}
        {drugs.length > 0 && (
          <div className="brochure-phase-card__compounds">
            <div className="brochure-phase-card__compounds-header">
              <FlaskConical size={12} strokeWidth={2.5} />
              <span>Compound Registry</span>
              <span className="brochure-phase-card__compounds-count">{drugs.length}</span>
            </div>

            <div className="brochure-phase-compound-table">
              <div className="brochure-phase-compound-table__head">
                <span>Compound</span>
                <span>Dose</span>
                <span>Frequency</span>
                <span>Route</span>
              </div>

              {drugs.map((d, i) => (
                <div key={i} className="brochure-phase-compound-row">
                  <span className="brochure-phase-compound-row__name">
                    <div className="brochure-phase-compound-row__dot" />
                    {safeStr(d.name || d.product_name || d.compound || d.product_slug)}
                  </span>
                  <span className="brochure-phase-compound-row__dose">
                    {d.weekly_dose_amount != null
                      ? `${d.weekly_dose_amount} ${d.weekly_dose_unit || ''}`
                      : d.dose_logic?.starting_weekly_dose != null
                        ? `${d.dose_logic.starting_weekly_dose} ${d.dose_logic.dose_unit || ''}`
                        : d.dose_logic?.dose_per_administration != null
                          ? `${d.dose_logic.dose_per_administration} ${d.dose_logic.dose_unit || ''}`
                          : safeStr(d.weekly_dose ?? d.dose)}
                  </span>
                  <span className="brochure-phase-compound-row__freq">
                    {d.dose_logic?.administration_frequency
                      ? safeStr(d.dose_logic.administration_frequency).replace(/_/g, ' ')
                      : safeStr(d.frequency || d.frequency_of_use || d.administration_schedule)}
                  </span>
                  <span className="brochure-phase-compound-row__route">
                    {safeStr(d.dose_logic?.route_of_administration || d.route || d.administration_route || d.route_of_administration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MONITORING & NOTES ── */}
        {(phase.monitoring || phase.notes) && (
          <div className="brochure-phase-card__details">
            {phase.monitoring && (
              <div className="brochure-phase-card__detail-block">
                <div className="brochure-phase-card__detail-label">
                  <Activity size={11} strokeWidth={2.5} /> Monitoring Protocol
                </div>
                <p className="brochure-phase-card__detail-text">{safeStr(phase.monitoring)}</p>
              </div>
            )}
            {phase.notes && (
              <div className="brochure-phase-card__detail-block">
                <div className="brochure-phase-card__detail-label">
                  <BookOpen size={11} strokeWidth={2.5} /> Clinical Notes
                </div>
                <p className="brochure-phase-card__detail-text">{safeStr(phase.notes)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default BrochurePhaseCard;