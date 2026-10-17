"use client";

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Clock from "lucide-react/dist/esm/icons/clock";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Activity from "lucide-react/dist/esm/icons/activity";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Info from "lucide-react/dist/esm/icons/info";

/**
 * Route badge color helper
 */
function getRouteBadgeStyle(route = '') {
  const r = route.toLowerCase();
  if (r.includes('nasal')) {
    return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', label: 'Intranasal' };
  }
  if (r.includes('oral')) {
    return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', label: 'Oral' };
  }
  if (r.includes('top')) {
    return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', label: 'Topical' };
  }
  return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Subcutaneous' };
}

export const PhaseAccordion = memo(function PhaseAccordion({ phase, index, weekRange, clinicalGoal }) {
  const [open, setOpen] = useState(index === 0);
  const [expandedCompound, setExpandedCompound] = useState(null);
  
  const drugs = phase.compounds || phase.drugs || [];
  const phaseName = phase.name || phase.phaseName || phase.phase_title || `Phase ${index + 1}`;
  const durationWeeks = phase.durationWeeks || phase.duration_weeks || 4;
  const startWeek = phase.startWeek || phase.start_week || 1;
  const endWeek = phase.endWeek || phase.end_week || (startWeek + durationWeeks - 1);
  const rangeStr = weekRange || `Wk ${startWeek}–${endWeek}`;
  const goal = clinicalGoal || phase.objective || phase.clinical_goal || '';
  const instructions = phase.instructions || '';

  return (
    <div className={`proto-phase ${open ? 'proto-phase--open' : ''}`} style={{
      border: '1px solid var(--color-border-subtle, #e2e8f0)',
      borderRadius: '12px',
      marginBottom: '1rem',
      background: '#ffffff',
      overflow: 'hidden',
      boxShadow: open ? '0 4px 16px rgba(0, 54, 102, 0.06)' : 'none',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
    }}>
      <button 
        className="proto-phase__header" 
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: open ? '#f8fafc' : '#ffffff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div className="proto-phase__title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span className="proto-phase__num" style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'var(--color-primary, #003666)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'monospace'
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="proto-phase__title-group">
            <span className="proto-phase__name" style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0f172a',
              display: 'block'
            }}>
              {phaseName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Calendar size={12} strokeWidth={2.2} />
                {rangeStr}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Clock size={12} strokeWidth={2.2} />
                {durationWeeks}w
              </span>
            </div>
            {goal && !open && (
              <span style={{
                fontSize: '0.75rem',
                color: '#64748b',
                display: 'block',
                marginTop: '0.2rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '480px'
              }}>
                {goal}
              </span>
            )}
          </div>
        </div>

        <div className="proto-phase__header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {drugs.length > 0 && (
            <span style={{
              background: '#e2e8f0',
              color: '#334155',
              borderRadius: '999px',
              padding: '0.15rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {drugs.length} {drugs.length === 1 ? 'compound' : 'compounds'}
            </span>
          )}
          {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
              {/* Objective & Instructions banner */}
              {goal && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.25rem' }}>
                    Clinical Purpose & Objective
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.5 }}>
                    {goal}
                  </div>
                  {instructions && instructions !== goal && (
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      Instructions: {instructions}
                    </div>
                  )}
                </div>
              )}

              {/* COMPOUNDS REGISTRY (Technical Data Sheet) */}
              {drugs.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                      <FlaskConical size={13} color="var(--color-primary, #003666)" />
                      <span>Compound Posology & Administration Schedule</span>
                    </div>
                  </div>

                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#ffffff'
                  }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(180px, 2fr) minmax(130px, 1.4fr) minmax(140px, 1.5fr) minmax(110px, 1fr) minmax(150px, 1.6fr)',
                      padding: '0.6rem 0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      gap: '0.5rem',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#64748b'
                    }}>
                      <span>Compound API</span>
                      <span>Dose / Cadence</span>
                      <span>Weekly Volume</span>
                      <span>Route</span>
                      <span>Administration Timing</span>
                    </div>

                    {/* Table Rows */}
                    {drugs.map((d, dIdx) => {
                      const routeBadge = getRouteBadgeStyle(d.route);
                      const isExpanded = expandedCompound === dIdx;
                      const hasNotes = Boolean(d.clinicalNotes || d.storage || d.reconstitution?.vialStrengthMg);

                      return (
                        <div key={dIdx} style={{
                          borderBottom: dIdx === drugs.length - 1 && !isExpanded ? 'none' : '1px solid #f1f5f9',
                          background: isExpanded ? '#fafafa' : '#ffffff',
                          transition: 'background 0.15s ease'
                        }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 2fr) minmax(130px, 1.4fr) minmax(140px, 1.5fr) minmax(110px, 1fr) minmax(150px, 1.6fr)',
                            padding: '0.75rem 0.85rem',
                            gap: '0.5rem',
                            alignItems: 'center',
                            fontSize: '0.8rem'
                          }}>
                            {/* Compound Name */}
                            <div>
                              <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                                {d.name}
                              </span>
                              {hasNotes && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedCompound(isExpanded ? null : dIdx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-primary, #003666)',
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                    marginTop: '0.15rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                  }}
                                >
                                  <Info size={10} />
                                  {isExpanded ? 'Hide guide' : 'Clinical guide'}
                                </button>
                              )}
                            </div>

                            {/* Single Dose */}
                            <div>
                              <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 700,
                                color: '#1e40af',
                                background: '#eff6ff',
                                border: '1px solid #dbeafe',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                display: 'inline-block'
                              }}>
                                {d.dosage || `${d.doseAmount} ${d.doseUnit}`}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                                {d.frequency}
                              </span>
                            </div>

                            {/* Weekly Total */}
                            <div>
                              <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 600,
                                color: '#0f172a',
                                fontSize: '0.75rem'
                              }}>
                                {d.weeklyDose || `${d.weeklyDoseAmount} ${d.weeklyDoseUnit}/wk`}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>
                                Cumulative / wk
                              </span>
                            </div>

                            {/* Route Badge */}
                            <div>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                background: routeBadge.bg,
                                color: routeBadge.color,
                                border: `1px solid ${routeBadge.border}`,
                                borderRadius: '999px',
                                padding: '0.15rem 0.5rem',
                                display: 'inline-block'
                              }}>
                                {routeBadge.label}
                              </span>
                            </div>

                            {/* Timing */}
                            <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.3 }}>
                              {d.timing || 'Morning on empty stomach'}
                            </div>
                          </div>

                          {/* Expanded Clinical / Reconstitution Guide */}
                          {isExpanded && (
                            <div style={{
                              padding: '0.75rem 1rem',
                              background: '#f8fafc',
                              borderTop: '1px dashed #e2e8f0',
                              borderBottom: dIdx === drugs.length - 1 ? 'none' : '1px solid #e2e8f0',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '0.75rem',
                              fontSize: '0.75rem'
                            }}>
                              {d.clinicalNotes && (
                                <div>
                                  <div style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <ShieldCheck size={12} color="#16a34a" />
                                    Clinical Pharmacology & Best Practice:
                                  </div>
                                  <div style={{ color: '#475569', marginTop: '0.2rem', lineHeight: 1.4 }}>
                                    {d.clinicalNotes}
                                  </div>
                                </div>
                              )}
                              {d.reconstitution && (
                                <div>
                                  <div style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Droplets size={12} color="#2563eb" />
                                    Reconstitution Parameters:
                                  </div>
                                  <div style={{ color: '#475569', marginTop: '0.2rem', lineHeight: 1.4 }}>
                                    Diluent: <strong>{d.reconstitution.diluentMl || 2.0} mL BAC Water</strong> | Vial: <strong>{d.reconstitution.vialStrengthMg || 5} mg</strong> | Insulin Syringe: <strong>{d.reconstitution.unitsPerDose || 10} UI</strong>
                                  </div>
                                </div>
                              )}
                              {d.storage && (
                                <div>
                                  <div style={{ fontWeight: 700, color: '#334155' }}>
                                    Conservation & Cold Chain:
                                  </div>
                                  <div style={{ color: '#475569', marginTop: '0.2rem', lineHeight: 1.4 }}>
                                    {d.storage}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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