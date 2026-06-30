import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Download from "lucide-react/dist/esm/icons/download";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import X from "lucide-react/dist/esm/icons/x";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect, useMemo } from 'react';











import { SectionAccordion } from './SectionAccordion';
import { resolveVariantPrice } from '../../utils/resolvePrice';
import InjectionDoseChart from './InjectionDoseChart';
import ProtocolTimeline from './ProtocolTimeline';

import { safeStr, humanize, displayDuration, displayPhases } from '../../utils/textUtils';
import EligibilityBlock from './EligibilityBlock';
const fmt = (v) => safeStr(v);



// ── Section Accordion (lazy-render + localStorage persistence) ────────────────
export function ProtocolPreviewModal({ protocol, onClose, updateCart, stickyTotal, bundleAdded, localTier = 'retail' }) {
  const phases  = protocol?.phase_blueprints || protocol?.phases || [];
  const name    = protocol?.protocol_title || protocol?.name || protocol?.protocol_name || 'Protocol';
  const meta    = protocol?.metadata || {};
  const today   = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // Derived metadata
  const category         = protocol?.category || meta.category || '—';
  const primaryGoal      = meta.primary_goal || protocol?.primary_goal || '—';
  const totalWeeks       = protocol?.protocol_duration_weeks || '—';
  const numPhases        = protocol?.number_of_phases || phases.length || '—';
  const evidenceGrade    = meta.evidence_grade || '—';
  const complexity       = meta.complexity_level || protocol?.complexity_level || '—';
  const version          = protocol?.protocol_version || meta.version || '—';
  const author           = protocol?.protocol_author_name || 'Atlas Health Clinical Team';
  const authorOrg        = protocol?.protocol_author_organization || 'Atlas Health';
  const shortCode        = meta.shortCode || protocol?.protocol_id || '';
  const reviewStatus     = (protocol?.protocol_review_status || protocol?.status || 'pending').toUpperCase();
  const clinicalSummary  = meta.clinical_summary || meta.description || protocol?.overview_summary || '';
  const longDescription  = meta.longDescription || '';
  const lastReviewed     = protocol?.protocol_last_reviewed_at || '—';
  const washoutWeeks     = protocol?.washout_recommended_weeks || protocol?.safety_profile?.washout_recommended_weeks || null;

  const numCompounds     = useMemo(() => {
    const compoundMap = new Map();
    phases.forEach(ph => {
      const drugs = ph.drugs || ph.drugs_used || ph.compounds || [];
      drugs.forEach(d => {
        const key = d.product_slug || d.name || d.product_title || 'unknown';
        if (!compoundMap.has(key)) compoundMap.set(key, d);
      });
    });
    return compoundMap.size || '—';
  }, [phases]);

  // ── Procurement Payload Calculation for Cart ────────────────────────────
  const procurementPayload = useMemo(() => {
    const procPhases = protocol?.phase_blueprints || protocol?.phases || [];
    const payloadItems = [];
    let bundleTotal = 0;

    procPhases.forEach((phase, phIdx) => {
      const dur = phase.duration_weeks || phase.default_duration_weeks ||
        ((phase.end_week || 0) - (phase.start_week || 1) + 1) || 4;
      const drugs = phase.drugs_used || phase.compounds || [];

      drugs.forEach(d => {
        const logic = d.dose_logic || {};
        const canonicalVials = logic.vials_required != null ? Number(logic.vials_required)
          : d.vials_required != null ? Number(d.vials_required)
          : null;

        let vialsNeeded;
        if (canonicalVials !== null && !isNaN(canonicalVials)) {
          vialsNeeded = canonicalVials;
        } else {
          const freqNum = (f => {
            const fl = (f || '').toLowerCase();
            if (fl.includes('daily') || fl.includes('nightly')) return 7;
            if (fl.includes('3x') || fl.includes('3 x')) return 3;
            if (fl.includes('2x') || fl.includes('2 x')) return 2;
            if (fl.includes('5x') || fl.includes('5 x')) return 5;
            return 1;
          })(d.dosing_frequency || logic.administration_frequency);
          const doseAmt = parseFloat(logic.starting_weekly_dose || logic.dose_per_administration || d.weekly_dose || 0);
          const vialSz  = parseFloat(d.vial_size_mg || logic.vial_strength || 5) || 5;
          const total   = doseAmt * freqNum * dur;
          vialsNeeded   = total > 0 ? Math.ceil(total / vialSz) : 1;
        }

        const resolvedPrice = resolveVariantPrice(
          { pricing: d.pricing ?? null },
          { tier: localTier }
        );
        const up = resolvedPrice?.perUnit != null ? parseFloat(resolvedPrice.perUnit) : null;
        if (up != null) {
          bundleTotal += up * vialsNeeded;
        }

        const compoundName = d.product_title || d.name ||
          (d.product_slug || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Compound';
        const strength = d.strength || d.vial_strength_used || d.selected_strength || '';
        payloadItems.push({
          id: d.id || d.product_slug || `item-${phIdx}-${Math.random()}`,
          label: strength ? `${compoundName} (${strength})` : compoundName,
          name: compoundName,
          qty: vialsNeeded,
          price: up,
          source: 'protocol',
          protocol: protocol?.name || protocol?.protocol_title || 'Protocol',
          isSupplement: false
        });
      });
    });

    return {
      items: payloadItems,
      bundle: {
        id: protocol?.id || protocol?.protocol_id || `proto-${Math.random()}`,
        name: protocol?.name || protocol?.protocol_title || 'Custom Protocol',
        bundleTotal,
        isProtocol: true
      }
    };
  }, [protocol, localTier]);


  // ── Phase 6: Exit animation state ───────────────────────────────────────
  const [closing, setClosing] = useState(false);
  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 220);
  }, [closing, onClose]);

  // Close on Escape (uses animated handleClose)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Download PDF: print the modal directly (pixel-perfect source of truth) ──
  const handleDownloadPDF = useCallback(() => { window.print(); }, []);

  // Shared sub-section header — solid bar matching PDF section style
  const sectionTitle = (label, color = 'var(--color-primary)', num = null) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0',
      marginBottom: '0.85rem',
      background: color,
      borderRadius: 2,
      overflow: 'hidden',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      {num && (
        <span style={{
          fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.18)', padding: '0.45rem 0.7rem',
          letterSpacing: '0.08em', flexShrink: 0, fontFamily: 'monospace',
        }}>{num}</span>
      )}
      <span style={{
        fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--color-bg-surface)',
        padding: '0.45rem 0.85rem',
        flex: 1,
      }}>{label}</span>
      <span style={{
        fontSize: '0.52rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)',
        padding: '0.45rem 0.7rem', letterSpacing: '0.06em',
        fontFamily: 'monospace',
      }}>Atlas Health</span>
    </div>
  );

  // Sub-section divider — matches the thin rules in the PDF
  const subsectionDivider = (label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.9rem 0 0.6rem' }}>
      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  );


  // Badge component (kept for potential reuse elsewhere)
  const Badge = ({ label, value, color = 'var(--color-primary)' }) => (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}20`,
      borderRadius: 4, padding: '0.4rem 0.65rem',
    }}>
      <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${color}90`, marginBottom: '0.12rem' }}>{label}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
    </div>
  );

  let weekCursor = 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — Clinical Protocol Document`}
      data-print-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: closing ? 'rgba(4,10,20,0)' : 'rgba(4,10,20,0.78)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        padding: '1rem',
        transition: 'background 0.22s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        data-print-modal="true"
        style={{
          background: 'var(--color-bg-surface)', borderRadius: 3,
          maxWidth: 900, width: '100%',
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)',
          border: '1px solid #d0d7de',
          overflow: 'hidden',
          animation: closing
            ? 'protoModalOut 0.22s cubic-bezier(0.4,0,1,1) forwards'
            : 'protoModalIn 0.28s cubic-bezier(0.22,1,0.36,1)',
        }}>

        {/* ── HEADER — clinical PDF cover style ── */}
        <div
          data-print-hide="true"
          style={{
            background: 'var(--color-primary)',
            borderRadius: '3px 3px 0 0',
            padding: '1.4rem 2rem 1.2rem',
            borderBottom: '3px solid #00509e',
          }}>
          {/* Top row: label + close */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                  Clinical Protocol Document
                </span>
                {shortCode && (
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', borderRadius: 2, padding: '0.08rem 0.4rem', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
                    {shortCode}
                  </span>
                )}
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: reviewStatus === 'APPROVED' ? '#4ade80' : '#fbbf24',
                }}>
                  ● {reviewStatus}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.45rem)', fontWeight: 700, color: 'var(--color-bg-surface)', lineHeight: 1.25, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                {name}
              </h2>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close preview"
              style={{
                flexShrink: 0,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 4, color: 'rgba(255,255,255,0.7)', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--color-bg-surface)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Metadata row — flat table style matching PDF */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '0.75rem' }}>
            {[
              category !== '—' && { label: 'CATEGORY', value: category },
              complexity !== '—' && { label: 'COMPLEXITY', value: complexity.charAt(0).toUpperCase() + complexity.slice(1) },
              { label: 'DURATION', value: `${totalWeeks} weeks` },
              { label: 'PHASES', value: numPhases },
              { label: 'COMPOUNDS', value: numCompounds },
              evidenceGrade !== '—' && { label: 'EVIDENCE', value: `Grade ${evidenceGrade}` },
            ].filter(Boolean).map((item, i, arr) => (
              <div key={i} style={{
                paddingRight: '1.25rem', marginRight: '1.25rem',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                marginBottom: '0.35rem',
              }}>
                <div style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.1rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABLE OF CONTENTS ── */}
        <div style={{
          flexShrink: 0,
          background: 'var(--color-bg-app)',
          borderBottom: '1px solid #e8edf4',
          padding: '0.45rem 2rem',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          overflowX: 'auto',
        }}>
          <span style={{ fontSize: '0.57rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, marginRight: '0.15rem' }}>Jump:</span>
          {[
            { num: '01', label: 'Overview',       id: 'pm-s01' },
            { num: '01.5', label: 'Eligibility',   id: 'pm-s01b' },
            { num: '02', label: 'Outcomes',        id: 'pm-s02' },
            { num: '03', label: 'Reconstitution',  id: 'pm-s03' },
            { num: '04', label: 'Phases',          id: 'pm-s04' },
            { num: '05', label: 'Monitoring',      id: 'pm-s05' },
            { num: '06', label: 'Procurement',     id: 'pm-s06' },
            { num: '07', label: 'Safety',          id: 'pm-s07' },
            { num: '08', label: 'Storage',         id: 'pm-s08' },
            { num: '09', label: 'References',      id: 'pm-s09' },
          ].map(({ num, label, id }) => (
            <button
              key={id}
              onClick={() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                flexShrink: 0, textDecoration: 'none',
                fontSize: '0.64rem', fontWeight: 600,
                color: 'var(--color-text-secondary)', background: 'var(--color-bg-surface)',
                borderRadius: 4, padding: '0.2rem 0.55rem',
                border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: '0.2rem',
                cursor: 'pointer', transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-bg-surface)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-surface)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <span style={{ fontSize: '0.5rem', opacity: 0.6, fontFamily: 'monospace' }}>{num}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div data-print-body="true" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── SECTION 1: PROTOCOL OVERVIEW ── */}
          <div id="pm-s01">
            {sectionTitle('Protocol Overview', 'var(--color-primary)', '01')}
            {/* Author / date row */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Compiled by: </span>{authorOrg}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Last reviewed: </span>{lastReviewed}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Document generated: </span>{today}
              </div>
              {washoutWeeks && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Washout: </span>{washoutWeeks} weeks recommended
                </div>
              )}
            </div>

            {/* Clinical summary */}
            {clinicalSummary && (
              <>
                {subsectionDivider('Clinical Summary')}
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.65 }}>
                  {clinicalSummary}
                </p>
              </>
            )}

            {/* Long description (mechanism) */}
            {longDescription && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', userSelect: 'none' }}>
                  ▸ Pharmacological background
                </summary>
                <p style={{ margin: '0.6rem 0 0 0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, borderLeft: '3px solid #003666', paddingLeft: '0.75rem' }}>
                  {longDescription}
                </p>
              </details>
            )}

            {/* Physician supervision notice */}
            {protocol?.physician_supervision_required && (
              <>
                {subsectionDivider('Supervision')} 
                <div style={{
                  background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.25)',
                  borderRadius: 8, padding: '0.65rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <AlertTriangle size={14} style={{ color: '#ca8a04', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.76rem', color: '#92400e', fontWeight: 600 }}>
                    Physician supervision required for this protocol.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── SECTION 1.5: ELIGIBILITY & PATIENT SELECTION ── */}
          <EligibilityBlock eligibility={protocol?.eligibility_rules} />

          {/* ── SECTION 2: EXPECTED OUTCOMES ── */}
          {(() => {
            const eo = protocol?.expected_outcomes;
            if (!eo) return null;
            const qualList  = Array.isArray(eo) ? eo : (eo.qualitative || []);
            const qRanges   = !Array.isArray(eo) ? (eo.quantitative_ranges || {}) : {};
            const responder = !Array.isArray(eo) ? eo.responder_rate_pct : null;
            const onset     = !Array.isArray(eo) ? eo.time_to_onset_weeks : null;
            if (!qualList.length && !Object.keys(qRanges).length) return null;
            return (
              <div id="pm-s02">
                {sectionTitle('Expected Clinical Outcomes', 'var(--color-success)', '02')}
                {/* Qualitative outcomes */}
                {qualList.length > 0 && (
                  <ul style={{ margin: '0 0 1rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {qualList.map((o, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                        <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '0.18rem' }} />
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Quantitative ranges */}
                {Object.keys(qRanges).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {Object.entries(qRanges).sort((a, b) => a[0].localeCompare(b[0])).map(([wk, val]) => (
                      <div key={wk} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.12)',
                        borderRadius: 8, padding: '0.55rem 0.85rem',
                      }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--color-success)', color: 'var(--color-bg-surface)', borderRadius: 4, padding: '0.1rem 0.45rem', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '0.05rem' }}>
                          {wk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.5 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Responder rate + onset */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {responder && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>Responder rate: </span>{responder}
                    </div>
                  )}
                  {onset && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>Time to onset: </span>~{onset} weeks
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── 03: RECONSTITUTION & COMPOUNDING PROTOCOL ── */}
          {(() => {
            // Build deduplicated compound list from all phases
            const compoundMap = new Map();
            phases.forEach(ph => {
              const drugs = ph.drugs || ph.drugs_used || [];
              drugs.forEach(d => {
                const key = d.product_slug || d.name || d.product_title || 'unknown';
                if (!compoundMap.has(key)) compoundMap.set(key, d);
              });
            });
            const compounds = Array.from(compoundMap.values());
            if (!compounds.length) return null;

            // Helpers mirroring pdfService logic
            const getReconVol = (strength) => {
              const mg = parseFloat(strength) || 5;
              if (mg <= 1)  return '0.5 mL';
              if (mg <= 5)  return '1.0 mL';
              if (mg <= 10) return '2.0 mL';
              return '2.0 mL';
            };
            const calcDrawVol = (d, reconVol) => {
              const vial = d.vial_strength_used || d.selected_strength || d.strength || '5';
              const mg   = parseFloat(vial) || 5;
              const dose = parseFloat(d.weekly_dose || d.per_administration_dose) || 0;
              if (!dose) return 'Per calc.';
              const vol  = parseFloat(reconVol) || 1;
              return `${((dose / mg) * vol).toFixed(2)} mL`;
            };

            return (
              <div id="pm-s03">
                {sectionTitle('Reconstitution & Compounding Protocol', '#0369a1', '03')}

                {/* Regulatory notice */}
                <div style={{
                  background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)',
                  borderRadius: 8, padding: '0.55rem 0.9rem', marginBottom: '0.9rem',
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                }}>
                  <AlertTriangle size={13} style={{ color: '#ca8a04', flexShrink: 0, marginTop: '0.1rem' }} />
                  <span style={{ fontSize: '0.73rem', color: '#78350f', lineHeight: 1.5 }}>
                    All lyophilized formulations must be reconstituted per the specifications below.
                    Failure to adhere to these parameters may compromise formulation integrity.
                  </span>
                </div>

                {/* Per-compound reconstitution table */}
                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', minWidth: 640 }}>
                    <thead>
                      <tr style={{ background: 'var(--color-primary)' }}>
                        {['Compound', 'Vial Spec.', 'Recon. Vol.', 'Diluent', 'Draw Vol.', 'Procedure', 'Syringe'].map(h => (
                          <th key={h} style={{
                            padding: '0.5rem 0.65rem', color: 'var(--color-bg-surface)', fontWeight: 700,
                            fontSize: '0.67rem', textAlign: 'left', whiteSpace: 'nowrap',
                            letterSpacing: '0.04em',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compounds.map((d, i) => {
                        const vial     = d.vial_strength_used || d.selected_strength || d.strength || '5 mg';
                        const reconVol = getReconVol(vial);
                        const drawVol  = calcDrawVol(d, reconVol);
                        const name     = d.product_title || d.name || 'Compound';
                        return (
                          <tr key={i} style={{ background: i % 2 === 0 ? 'var(--color-bg-surface)' : 'var(--color-bg-app)' }}>
                            <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>{name}</td>
                            <td style={{ padding: '0.5rem 0.65rem', color: 'var(--color-text-primary)', textAlign: 'center' }}>{vial}</td>
                            <td style={{ padding: '0.5rem 0.65rem', color: 'var(--color-text-primary)', textAlign: 'center', whiteSpace: 'nowrap' }}>{reconVol}</td>
                            <td style={{ padding: '0.5rem 0.65rem', color: 'var(--color-text-secondary)' }}>
                              Bacteriostatic Water for Injection (BWfI) 0.9% Benzyl Alcohol
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: '#0369a1', textAlign: 'center', whiteSpace: 'nowrap' }}>{drawVol}</td>
                            <td style={{ padding: '0.5rem 0.65rem', color: 'var(--color-text-secondary)', fontSize: '0.68rem' }}>
                              Direct diluent stream to vial wall; swirl gently ×10 s. Do NOT vortex or shake. Allow ≥60 s dissolution before aspirating.
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', fontSize: '0.68rem' }}>
                              U-100 Insulin Syringe<br/><span style={{ color: 'var(--color-text-tertiary)' }}>(31G × 6 mm, 0.5 mL)</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Storage reminder */}
                <div style={{
                  marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.72rem', color: 'var(--color-text-secondary)',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>🧊</span>
                  <span>Store reconstituted vials at <strong>2–8°C</strong>. Protect from light. Discard unused portions after 28 days.</span>
                </div>
              </div>
            );
          })()}


          {/* ── 04: CLINICAL PHASES & DOSING SCHEDULE ── */}
          <div id="pm-s04">
            {sectionTitle('Clinical Phases & Dosing Schedule', 'var(--color-primary)', '04')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {phases.length > 0 ? phases.map((ph, phIdx) => {
                const dur   = ph.default_duration_weeks || ph.duration_weeks || 4;
                const drugs = ph.drugs || ph.compounds || ph.drugs_used || [];
                const startWk = weekCursor;
                const endWk   = weekCursor + dur - 1;
                weekCursor   += dur;
                const clinPurpose = Array.isArray(ph.clinical_purpose)
                  ? ph.clinical_purpose.map(s => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
                  : [];

                return (
                  <div key={phIdx} style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                    {/* Phase header — navy */}
                    <div style={{
                      background: 'linear-gradient(90deg, rgba(0,54,102,0.07) 0%, rgba(0,54,102,0.02) 100%)',
                      padding: '0.75rem 1.1rem',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: clinPurpose.length ? '0.4rem' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <span style={{ background: 'var(--color-primary)', color: 'var(--color-bg-surface)', borderRadius: 5, padding: '0.15rem 0.5rem', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            Phase {phIdx + 1}
                          </span>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                            {safeStr(ph.phase_title || ph.name) || `Phase ${phIdx + 1}`}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-secondary)', background: '#f1f5f9', borderRadius: 5, padding: '0.15rem 0.55rem' }}>
                          Wk {startWk}–{endWk} · {dur} wks
                        </span>
                      </div>
                      {/* Clinical purpose tags */}
                      {clinPurpose.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {clinPurpose.map((tag, ti) => (
                            <span key={ti} style={{ fontSize: '0.6rem', fontWeight: 600, background: 'rgba(0,54,102,0.09)', color: 'var(--color-primary)', borderRadius: 4, padding: '0.1rem 0.4rem' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Clinical goal / objective */}
                    {(ph.clinical_goal || ph.objective) && (
                      <div style={{ padding: '0.55rem 1.25rem', background: '#fafbff', borderBottom: '1px solid #f0f4f8' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {safeStr(ph.clinical_goal || ph.objective)}
                        </p>
                      </div>
                    )}

                    {/* Compounds table */}
                    {drugs.length > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.79rem' }}>
                          <thead>
                            <tr style={{ background: 'rgba(79,70,229,0.04)' }}>
                              {['Compound', 'Starting Dose', 'Frequency', 'Vials Required', 'Route'].map(h => (
                                <th key={h} style={{ padding: '0.5rem 0.9rem', textAlign: 'left', fontWeight: 700, color: '#4338ca', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {drugs.map((d, dIdx) => {
                              const dl   = d.dose_logic || {};
                              const dose = dl.starting_weekly_dose != null
                                ? `${dl.starting_weekly_dose} ${dl.dose_unit || ''}`.trim()
                                : dl.dose_per_administration != null
                                ? `${dl.dose_per_administration} ${dl.dose_unit || ''}`.trim()
                                : dl.default_weekly_dose != null
                                ? `${dl.default_weekly_dose} ${dl.dose_unit || ''}`.trim()
                                : safeStr(d.weekly_dose ?? d.dose);
                              const maxDose  = dl.max_weekly_dose || dl.possible_next_step_dose;
                              const freq  = safeStr(dl.administration_frequency || d.frequency || d.frequency_of_use).replace(/_/g, ' ');
                              const route = safeStr(d.route || dl.route_of_administration || d.administration_route || d.route_of_administration);
                              const timing = dl.timing_hint ? dl.timing_hint.replace(/_/g, ' ') : (
                                dl.administration_days_default?.join(', ') || '—'
                              );
                              const isSC = route.toLowerCase().includes('sub') || route.toLowerCase() === 'sc';
                              return (
                                <tr key={dIdx} style={{ background: dIdx % 2 === 0 ? 'var(--color-bg-surface)' : '#fafbff' }}>
                                  <td style={{ padding: '0.55rem 0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    {safeStr(d.product_title || d.name)}
                                    {maxDose && (
                                      <span style={{ fontSize: '0.62rem', color: '#6366f1', marginLeft: '0.35rem', fontWeight: 600 }}>
                                        → up to {safeStr(maxDose)} {dl.dose_unit || ''}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.9rem', fontFamily: 'monospace', color: '#0369a1', fontWeight: 700 }}>{safeStr(dose)}</td>
                                  <td style={{ padding: '0.55rem 0.9rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{safeStr(freq)}</td>
                                  <td style={{ padding: '0.55rem 0.9rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                    {(() => {
                                      // Replicate SupplyEngine logic for visual consistency
                                      const weeklyDose = dl.starting_weekly_dose || dl.default_weekly_dose || 0;
                                      const totalNeeded = weeklyDose * dur;
                                      const strength = parseFloat((d.product_strength || '5').replace(/[^0-9.]/g, '')) || 5;
                                      const qty = Math.ceil(totalNeeded / strength) || 1;
                                      return `${qty} vial${qty > 1 ? 's' : ''}`;
                                    })()}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.9rem' }}>
                                    <span style={{ fontSize: '0.67rem', fontWeight: 600, borderRadius: 4, padding: '0.15rem 0.45rem', background: isSC ? 'rgba(99,102,241,0.1)' : 'rgba(0,54,102,0.08)', color: isSC ? '#4f46e5' : 'var(--color-primary)' }}>
                                      {route}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ── Weekly Administration Pattern (collapsible) ── */}
                    {drugs.length > 0 && (() => {
                      const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const freqToDays = (freq = '', dl = {}) => {
                        const f = freq.toLowerCase();
                        const raw = dl.administration_days_default;
                        if (Array.isArray(raw) && raw.length) {
                          return raw.map(dn => {
                            const idx = DAYS.findIndex(x => x.toLowerCase() === String(dn).toLowerCase().slice(0, 3));
                            return idx >= 0 ? idx : null;
                          }).filter(i => i !== null);
                        }
                        if (f.includes('daily') || f.includes('nightly') || f.includes('every day')) return [0,1,2,3,4,5,6];
                        if (f.includes('5x') || f.includes('5 x')) return [0,1,2,3,4];
                        if (f.includes('3x') || f.includes('3 x') || f.includes('three')) return [0,2,4];
                        if (f.includes('2x') || f.includes('twice')) return [0,3];
                        if (f.includes('eod') || f.includes('every other')) return [0,2,4,6];
                        return [0];
                      };
                      return (
                        <details style={{ borderTop: '1px solid #f0f4f8' }}>
                          <summary style={{
                            padding: '0.5rem 1.25rem', fontSize: '0.7rem', fontWeight: 700,
                            color: '#4338ca', cursor: 'pointer', userSelect: 'none',
                            display: 'flex', alignItems: 'center', gap: '0.35rem', listStyle: 'none',
                          }}>
                            <Calendar size={12} style={{ flexShrink: 0 }} />
                            &nbsp;Weekly Administration Pattern
                          </summary>
                          <div style={{ padding: '0.6rem 1.25rem 0.9rem', background: '#fafbff' }}>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', minWidth: 440 }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: '0.35rem 0.65rem', textAlign: 'left', color: 'var(--color-text-tertiary)', fontWeight: 700, fontSize: '0.62rem', borderBottom: '1px solid #e2e8f0' }}>Compound</th>
                                    {DAYS.map(d => (
                                      <th key={d} style={{ padding: '0.35rem 0.4rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.62rem', borderBottom: '1px solid #e2e8f0', minWidth: 36 }}>{d}</th>
                                    ))}
                                    <th style={{ padding: '0.35rem 0.65rem', textAlign: 'left', color: 'var(--color-text-tertiary)', fontWeight: 700, fontSize: '0.62rem', borderBottom: '1px solid #e2e8f0' }}>Timing</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {drugs.map((d, di) => {
                                    const dl2   = d.dose_logic || {};
                                    const freq2 = dl2.administration_frequency || d.frequency || d.frequency_of_use || 'weekly';
                                    const active = freqToDays(freq2, dl2);
                                    const timing = dl2.timing_hint ? dl2.timing_hint.replace(/_/g, ' ') : (d.timing || '—');
                                    return (
                                      <tr key={di} style={{ background: di % 2 === 0 ? 'var(--color-bg-surface)' : 'var(--color-bg-app)' }}>
                                        <td style={{ padding: '0.4rem 0.65rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>{d.product_title || d.name || 'Compound'}</td>
                                        {DAYS.map((_, dayIdx) => {
                                          const isOn = active.includes(dayIdx);
                                          return (
                                            <td key={dayIdx} style={{ padding: '0.4rem 0.4rem', textAlign: 'center' }}>
                                              {isOn ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: 'var(--color-bg-surface)', fontSize: '0.55rem', fontWeight: 800 }}>✓</span>
                                              ) : (
                                                <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
                                              )}
                                            </td>
                                          );
                                        })}
                                        <td style={{ padding: '0.4rem 0.65rem', color: 'var(--color-text-secondary)', fontSize: '0.67rem', textTransform: 'capitalize' }}>{timing}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </details>
                      );
                    })()}
                  </div>
                );
              }) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                  No phase data available for this protocol.
                </p>
              )}
            </div>

            {/* Advanced Visualization — collapsed */}
            <details style={{ marginTop: '0.75rem' }}>
              <summary style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0', borderTop: '1px dashed #e2e8f0' }}>
                ▸ Advanced Visualization (dose chart &amp; timeline)
              </summary>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#060b14', borderRadius: 10, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <InjectionDoseChart phase_blueprints={phases} compact={false} />
                </div>
                {(() => {
                  const wd2 = [];
                  let cur2 = 1;
                  (protocol?.phase_blueprints || []).forEach(ph2 => {
                    const d2 = ph2.default_duration_weeks || 4;
                    const pd = (ph2.drugs || [])[0];
                    if (pd) {
                      const dl2 = pd.dose_logic || {};
                      const rd = dl2.starting_weekly_dose ?? dl2.default_weekly_dose ?? dl2.dose_per_administration ?? pd.starting_weekly_dose ?? 0;
                      for (let w = 0; w < d2; w++) wd2.push({ week: cur2 + w, dose: rd, phase: ph2.name?.toLowerCase().includes('prim') ? 'priming' : ph2.name?.toLowerCase().includes('titr') ? 'titration' : 'therapeutic', note: ph2.purpose || '' });
                    }
                    cur2 += d2;
                  });
                  return (
                    <div style={{ background: 'var(--color-bg-app)', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <ProtocolTimeline weeks={cur2 - 1} weeklyDoses={wd2} productName={protocol?.protocol_title || protocol?.name} />
                    </div>
                  );
                })()}
              </div>
            </details>
          </div>


          {/* ── SECTION 4: MONITORING SCHEDULE ── */}
          {(() => {
            const mp = protocol?.monitoring_plan || {};
            const ms = protocol?.monitoringSchedule || [];
            const baselineLabs = mp.baseline_required || [];
            const checkpoints = mp.scheduled_checkpoints || ms;
            if (!baselineLabs.length && !checkpoints.length) return null;
            return (
              <div id="pm-s05">
                {sectionTitle('Clinical Monitoring Schedule', '#0891b2', '05')}
                {baselineLabs.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#0e7490', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Baseline Requirements (Week 0)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {baselineLabs.map((lab, i) => (
                        <span key={i} style={{ fontSize: '0.71rem', fontWeight: 600, background: 'rgba(8,145,178,0.08)', color: '#0e7490', borderRadius: 5, padding: '0.2rem 0.55rem', border: '1px solid rgba(8,145,178,0.18)' }}>
                          {lab.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {checkpoints.length > 0 && (
                  <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                      <thead>
                        <tr style={{ background: '#0f7490' }}>
                          {['Wk', 'Type', 'Tests / Labs', 'Notes'].map(h => (
                            <th key={h} style={{
                              padding: '0.5rem 0.75rem', color: 'var(--color-bg-surface)',
                              fontWeight: 700, fontSize: '0.63rem',
                              textAlign: 'left', whiteSpace: 'nowrap',
                              letterSpacing: '0.05em', textTransform: 'uppercase',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {checkpoints.map((cp, i) => {
                          const week  = cp.week ?? cp.week_number ?? i;
                          const type  = cp.label || cp.type?.replace(/_/g, ' ') || 'Check-in';
                          const labs  = cp.labs || cp.tests || [];
                          const note  = cp.purpose || cp.notes || cp.note || '';
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? 'var(--color-bg-surface)' : '#f0f9ff', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 800, color: '#0891b2', fontSize: '0.82rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                {week}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#0e7490', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                                {type}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                {labs.length > 0 ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                                    {labs.map((l, li) => (
                                      <span key={li} style={{ fontSize: '0.65rem', color: 'var(--color-text-primary)', background: '#e0f2fe', borderRadius: 3, padding: '0.07rem 0.32rem' }}>
                                        {l.replace(/_/g, ' ')}
                                      </span>
                                    ))}
                                  </div>
                                ) : <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.69rem', lineHeight: 1.4 }}>
                                {note || <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── 06: PROCUREMENT SUMMARY ── */}
          {(() => {
            const procPhases = protocol?.phase_blueprints || protocol?.phases || [];
            if (!procPhases.length) return null;

            // Build procurement rows — mirrors pdfService.js logic exactly
            const procRows = [];
            let grandTotal = 0;

            procPhases.forEach((phase, phIdx) => {
              const phLabel = `Phase ${phIdx + 1}: ${phase.phase_title || ''}`.trim();
              const dur = phase.duration_weeks || phase.default_duration_weeks ||
                ((phase.end_week || 0) - (phase.start_week || 1) + 1) || 4;
              const drugs = phase.drugs_used || phase.compounds || [];

              drugs.forEach(d => {
                const logic = d.dose_logic || {};
                const canonicalVials = logic.vials_required != null ? Number(logic.vials_required)
                  : d.vials_required != null ? Number(d.vials_required)
                  : null;

                let vialsNeeded;
                if (canonicalVials !== null && !isNaN(canonicalVials)) {
                  vialsNeeded = canonicalVials;
                } else {
                  const freqNum = (f => {
                    const fl = (f || '').toLowerCase();
                    if (fl.includes('daily') || fl.includes('nightly')) return 7;
                    if (fl.includes('3x') || fl.includes('3 x')) return 3;
                    if (fl.includes('2x') || fl.includes('2 x')) return 2;
                    if (fl.includes('5x') || fl.includes('5 x')) return 5;
                    return 1;
                  })(d.dosing_frequency || logic.administration_frequency);
                  const doseAmt = parseFloat(logic.starting_weekly_dose || logic.dose_per_administration || d.weekly_dose || 0);
                  const vialSz  = parseFloat(d.vial_size_mg || logic.vial_strength || 5) || 5;
                  const total   = doseAmt * freqNum * dur;
                  vialsNeeded   = total > 0 ? Math.ceil(total / vialSz) : 1;
                }

                const resolvedPrice = resolveVariantPrice(
                  { pricing: d.pricing ?? null },
                  { tier: localTier }
                );
                const up = resolvedPrice?.perUnit != null ? parseFloat(resolvedPrice.perUnit) : null;
                const lineTotal = up != null ? up * vialsNeeded : null;
                if (lineTotal != null) grandTotal += lineTotal;

                const compoundName = d.product_title || d.name ||
                  (d.product_slug || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Compound';
                const strength = d.strength || d.vial_strength_used || d.selected_strength || '';

                procRows.push({
                  phase: phLabel,
                  phaseIdx: phIdx,
                  compound: strength ? `${compoundName} (${strength})` : compoundName,
                  weeks: dur,
                  vials: vialsNeeded,
                  unitPrice: up,
                  lineTotal,
                });
              });
            });

            const tierLabel = localTier.charAt(0).toUpperCase() + localTier.slice(1);
            const PHASE_ACCENTS = ['var(--color-primary)', '#0891b2', '#6366f1', 'var(--color-success)', '#f59e0b', '#ec4899'];

            return (
              <div id="pm-s06">
                {sectionTitle('Procurement Summary', '#0f172a', '06')}

                {/* Tier badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <DollarSign size={13} color="var(--color-text-secondary)" />
                  <span style={{ fontSize: '0.69rem', color: 'var(--color-text-secondary)' }}>
                    Vial requirements per phase &middot; Pricing tier:
                  </span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700,
                    background: '#0f172a', color: 'var(--color-bg-surface)',
                    borderRadius: 4, padding: '0.1rem 0.5rem',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>{tierLabel}</span>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', color: 'var(--color-bg-surface)' }}>
                        {['Phase', 'Compound', 'Weeks', 'Vials', 'Unit Price', 'Line Total'].map((h, i) => (
                          <th key={h} style={{
                            padding: '0.55rem 0.75rem',
                            fontWeight: 700, fontSize: '0.67rem',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            textAlign: i >= 2 ? 'center' : 'left',
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {procRows.map((row, i) => {
                        const accent = PHASE_ACCENTS[row.phaseIdx % PHASE_ACCENTS.length];
                        return (
                          <tr key={i} style={{
                            background: i % 2 === 0 ? 'var(--color-bg-app)' : 'var(--color-bg-surface)',
                            borderBottom: '1px solid #e2e8f0',
                          }}>
                            <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-bg-surface)',
                                background: accent, borderRadius: 3,
                                padding: '0.1rem 0.45rem',
                              }}>{row.phase}</span>
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {row.compound}
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                              {row.weeks}
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                              {row.vials}
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                              {row.unitPrice != null ? `$${row.unitPrice.toFixed(2)}` : '—'}
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                              {row.lineTotal != null ? `$${row.lineTotal.toFixed(2)}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {grandTotal > 0 && (
                      <tfoot>
                        <tr style={{ background: '#f1f5f9', borderTop: '2px solid #0f172a' }}>
                          <td colSpan={4} />
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Grand Total
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            ${grandTotal.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Supplies footnote */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.7rem', padding: '0.55rem 0.75rem', background: '#f0f9ff', borderRadius: 7, border: '1px solid rgba(8,145,178,0.18)' }}>
                  <Droplets size={13} color="#0891b2" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.69rem', color: '#0e7490', lineHeight: 1.4 }}>
                    Reconstitution medium (Bacteriostatic Water) and administration supplies are included in the bundle.
                    Prices are estimates based on current {tierLabel} tier rates and may vary.
                  </span>
                </div>
              </div>
            );
          })()}

          {/* ── 07: SAFETY PROFILE & RISK MANAGEMENT ── */}
          {(() => {
            const rm   = protocol?.riskManagement || protocol?.risk_management || {};
            const sp   = protocol?.safety_profile || {};
            const contraFull  = rm.contraindications || sp.contraindications || protocol?.eligibility_rules?.contraindications || [];
            const sideEffects = rm.side_effects || rm.sideEffects || [];
            const escalation  = rm.escalation_criteria || rm.escalationCriteria || sp.adverse_events_serious || [];
            const drugInt     = sp.drug_interactions || [];
            if (!contraFull.length && !sideEffects.length && !escalation.length && !drugInt.length) return null;
            return (
              <div id="pm-s07">
                {sectionTitle('Safety Profile & Risk Management', 'var(--color-danger)', '07')}

                {/* Contraindications */}
                {contraFull.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contraindications</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {contraFull.map((c, i) => (
                        <span key={i} style={{ fontSize: '0.71rem', fontWeight: 600, background: 'rgba(220,38,38,0.07)', color: 'var(--color-danger)', borderRadius: 5, padding: '0.2rem 0.55rem', border: '1px solid rgba(220,38,38,0.18)' }}>
                          <XCircle size={10} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
                          {String(c).replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side effects table */}
                {sideEffects.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Known Adverse Effects</div>
                    <div style={{ border: '1px solid #fde68a', borderRadius: 10, overflow: 'hidden' }}>
                      {sideEffects.map((se, i) => (
                        <div key={i} style={{
                          display: 'grid', gridTemplateColumns: '1fr 110px 1fr',
                          padding: '0.55rem 0.9rem', gap: '0.75rem',
                          background: i % 2 === 0 ? 'var(--color-warning-bg)' : 'var(--color-bg-surface)',
                          borderBottom: i < sideEffects.length - 1 ? '1px solid #fde68a' : 'none',
                          alignItems: 'start',
                        }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{se.effect}</div>
                          <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 600, textAlign: 'center', background: 'rgba(180,83,9,0.08)', borderRadius: 4, padding: '0.15rem 0.3rem' }}>{se.frequency}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{se.management}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drug interactions */}
                {drugInt.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drug Interactions</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {drugInt.map((d, i) => (
                        <li key={i} style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', display: 'flex', gap: '0.4rem', lineHeight: 1.5 }}>
                          <AlertCircle size={13} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '0.15rem' }} />{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Escalation criteria */}
                {escalation.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escalation & Stop Criteria</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {escalation.map((e, i) => (
                        <li key={i} style={{ fontSize: '0.78rem', color: '#7f1d1d', display: 'flex', gap: '0.4rem', lineHeight: 1.5, background: 'rgba(220,38,38,0.04)', borderRadius: 6, padding: '0.4rem 0.65rem' }}>
                          <AlertTriangle size={12} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '0.2rem' }} />{e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            );
          })()}

          {/* ── 08: STORAGE & HANDLING ── */}
          {(() => {
            const rm  = protocol?.riskManagement || protocol?.risk_management || {};
            const sp  = protocol?.safety_profile || {};
            const storage = rm.storage_handling || sp.storage_handling || null;
            if (!storage) return null;
            return (
              <div id="pm-s08">
                {sectionTitle('Storage & Handling', '#4f46e5', '08')}
                <div style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.12)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{storage}</p>
                </div>
              </div>
            );
          })()}

          {/* ── 09: SCIENTIFIC REFERENCES ── */}
          {(() => {
            const refs = protocol?.metadata?.references || [];
            if (!refs.length) return null;
            return (
              <div id="pm-s09">
                {sectionTitle('Scientific References', 'var(--color-text-secondary)', '09')}
                <ol style={{ margin: 0, padding: '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {refs.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.79rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                      {r.citation}
                      {r.pmid && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ marginLeft: '0.4rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', background: 'rgba(0,54,102,0.07)', borderRadius: 4, padding: '0.1rem 0.4rem' }}
                        >
                          PMID {r.pmid}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })()}

          {/* ── CLINICAL FOOTER — matches PDF disclaimer block ── */}
          <div style={{ borderTop: '2px solid #e2e8f0', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Info row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
              {[
                ['Protocol ID', shortCode || name],
                ['Version', version],
                ['Author', author],
                ['Organisation', authorOrg],
                ['Review Status', reviewStatus],
                ['Last Reviewed', lastReviewed !== '—' ? new Date(lastReviewed).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{label}:</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer paragraph */}
            <div style={{ background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderLeft: '3px solid #003666', borderRadius: 4, padding: '0.85rem 1rem' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>DISCLAIMER:</strong> This protocol document has been compiled by Atlas Health for informational and educational purposes only.
                All compounds referenced are intended for <strong>Laboratory Research Use Only (RUO)</strong> and are not approved for human use by the FDA, EMA, or any other regulatory authority.
                This document does not constitute medical advice. Always consult a qualified healthcare professional before initiating any therapeutic regimen.
                Atlas Health assumes no liability for the use or misuse of the information herein.
              </p>
            </div>

            {/* Document ID bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f0f4f8' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-border)', letterSpacing: '0.05em' }}>
                © {new Date().getFullYear()} Atlas Health · Clinical Protocol System · Doc: {shortCode || name} · Generated: {today}
              </span>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-bg-surface)', background: 'var(--color-danger)', borderRadius: 3, padding: '0.2rem 0.55rem' }}>
                RUO
              </span>
            </div>
          </div>

        </div>

        {/* ── STICKY ACTION BAR ── */}
        <div data-print-hide="true" style={{
          padding: '0.9rem 2rem',
          borderTop: '1px solid #e2e8f0',
          background: 'var(--color-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderRadius: '0 0 3px 3px',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}>
          {/* Left: document ID hint */}
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.03em' }}>
            {shortCode || name} · v{version}
          </span>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleClose}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              Close
            </button>


            {typeof updateCart === 'function' && (
              <button
                onClick={() => { updateCart(procurementPayload); handleClose(); }}
                disabled={bundleAdded}
                style={{
                  padding: '0.55rem 1.4rem',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-bg-surface)',
                  background: bundleAdded ? 'var(--color-text-tertiary)' : 'linear-gradient(135deg, #003666 0%, #0059a8 100%)',
                  border: 'none',
                  cursor: bundleAdded ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: bundleAdded ? 'none' : '0 2px 8px rgba(0,54,102,0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                {bundleAdded ? '✓ Added' : '＋ Add to Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

