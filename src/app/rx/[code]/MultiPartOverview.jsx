"use client";

import React, { useState } from 'react';
import { Layers, Pill, Dna, Clock, ShieldCheck, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronUp } from '@/lib/icons';

const GCP = {
  border: '#dadce0',
  surface: '#f8f9fa',
  text: '#202124',
  muted: '#5f6368',
  blue: '#1a73e8',
  blueBg: '#e8f0fe',
  blueBorder: '#d2e3fc',
  green: '#137333',
  greenBg: '#e6f4ea',
  greenBorder: '#ceead6',
  amber: '#b06000',
  amberBg: '#fef7e0',
  amberBorder: '#feefc3',
};

const card = { background: '#ffffff', border: `1px solid ${GCP.border}`, borderRadius: '8px' };

/**
 * MultiPartOverview
 * Phase 1: KPI summary  |  Phase 2: Phase timeline  |  Phase 3: Atlas clinical checks.
 * Google Cloud Console UX compliant accordion & mobile responsive.
 */
export default function MultiPartOverview({ formulations = [], onSelectPhase = null }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!formulations || formulations.length < 2) return null;

  const phaseCount = formulations.length;
  const totalApis = formulations.reduce((n, f) => n + (f?.apis?.length || 0), 0);
  const genes = Array.from(new Set(
    formulations.flatMap(f => [
      ...(f?.extra?.nutrigenomics?.genes || []),
      ...(f?.apis || []).flatMap(a => Array.isArray(a?.geneTargets) ? a.geneTargets : [])
    ])
  ));

  const flagged = formulations.flatMap((f) =>
    (f?.apis || [])
      .filter(a => a?.dosageSafety?.evaluated && a?.dosageSafety?.level !== 'standard' && a?.dosageSafety?.level !== 'ok')
      .map(a => ({ part: f?.title, api: a?.name, dosage: a?.dosage, level: a?.dosageSafety?.level, message: a?.dosageSafety?.message }))
  );

  /* ── Compute dynamic duration from phases ── */
  const phaseDurations = formulations.map(f => typeof f?.duration === 'string' ? f.duration : '').filter(Boolean);
  const durationDisplay = phaseDurations.length > 0 ? phaseDurations.join(' → ') : '—';
  const totalMonths = phaseDurations.reduce((sum, d) => {
    const mMatch = d.match(/(\d+)\s*month/i);
    const dMatch = d.match(/(\d+)\s*d/i);
    if (mMatch) return sum + parseInt(mMatch[1], 10);
    if (dMatch) return sum + Math.round(parseInt(dMatch[1], 10) / 30);
    return sum;
  }, 0);
  const durationValue = totalMonths > 0 ? `${totalMonths}+ Months` : (phaseDurations[0] || '—');

  /* ── Auto-generate subtitle from phase titles ── */
  const phaseNames = formulations.map((f, i) => f?.shortTitle || f?.title || `Phase ${i + 1}`);
  const autoSubtitle = phaseNames.length <= 3
    ? `Structured sequential progression: ${phaseNames.join(' → ')}`
    : `Structured ${phaseCount}-phase sequential treatment protocol`;

  const kpis = [
    { icon: Layers, label: 'Treatment phases', value: phaseCount, sub: 'Sequential stages' },
    { icon: Pill, label: 'Active ingredients', value: totalApis, sub: 'Compounded to specification' },
    { icon: Dna, label: 'Genes covered', value: genes.length || '—', sub: genes.length > 0 ? 'Pharmacogenomic panel' : 'Not applicable' },
    { icon: Clock, label: 'Protocol duration', value: durationValue, sub: durationDisplay },
  ];

  const handlePhaseClick = (fId, e) => {
    if (onSelectPhase) {
      e.preventDefault();
      onSelectPhase(fId);
    }
    const el = document.getElementById(fId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section aria-label="Prescription overview" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
      {/* GCP Section Header Accordion Trigger */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: GCP.surface,
          borderRadius: '8px',
          border: `1px solid ${GCP.border}`,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '4px', background: GCP.blueBg, color: GCP.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.90rem', fontWeight: 500, color: GCP.text }}>
                Clinical Roadmap & {phaseCount}-Phase Sequential Protocol
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 500, padding: '1px 8px', borderRadius: '10px', background: GCP.blueBg, color: '#1967d2', border: `1px solid ${GCP.blueBorder}` }}>
                {phaseCount} Sequential Phases
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: GCP.muted }}>
              {autoSubtitle}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: GCP.muted, fontSize: '0.74rem', fontWeight: 500 }}>
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Phase 1 — KPI summary */}
          <div className="gcp-kpi-grid">
            {kpis.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} style={{ ...card, padding: '0.75rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: GCP.muted, fontSize: '0.72rem', fontWeight: 500 }}>
                  <Icon size={14} color={GCP.blue} /> {label}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: GCP.text, lineHeight: 1.2 }}>{value}</div>
                {sub && <div style={{ fontSize: '0.68rem', color: '#70757a', marginTop: '1px' }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* Phase 2 — Timeline */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '0.7rem 1rem', background: GCP.surface, borderBottom: `1px solid ${GCP.border}`, fontSize: '0.84rem', fontWeight: 500, color: GCP.text }}>
              Sequential Treatment Pathway
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: '1rem', display: 'grid', gap: '0.85rem' }}>
              {formulations.map((f, i) => (
                <li key={f.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: GCP.blue, color: '#fff', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i + 1}
                    </span>
                    {i < formulations.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: GCP.blueBorder, marginTop: 4 }} />}
                  </div>
                  <div
                    onClick={(e) => handlePhaseClick(f.id, e)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      transition: 'background 0.15s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.90rem', fontWeight: 600, color: GCP.text }}>
                        Phase {i + 1}: {f.title}
                      </span>
                      {f.duration && (
                        <span style={{ fontSize: '0.70rem', color: '#1967d2', background: GCP.blueBg, border: `1px solid ${GCP.blueBorder}`, borderRadius: '4px', padding: '1px 8px', fontWeight: 500 }}>
                          {f.duration}
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: GCP.muted }}>
                        {(f?.apis?.length || 0)} APIs · {f?.volume || '—'}
                      </span>
                    </div>
                    {f.subtitle && <div style={{ fontSize: '0.76rem', color: GCP.muted, marginTop: 2 }}>{f.subtitle}</div>}
                    {f.posology?.regimen && <div style={{ fontSize: '0.76rem', color: '#3c4043', marginTop: 2 }}><strong>Regimen:</strong> {f.posology.regimen}</div>}
                    <div style={{ marginTop: '4px', fontSize: '0.70rem', color: GCP.blue, fontWeight: 500 }}>
                      View Phase {i + 1} Details & Formulation →
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Phase 3 — Atlas clinical checks */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '0.7rem 1rem', background: GCP.surface, borderBottom: `1px solid ${GCP.border}`, fontSize: '0.84rem', fontWeight: 500, color: GCP.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color={GCP.blue} /> Atlas Clinical Verification & Cross-Checks
            </div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: GCP.greenBg, border: `1px solid ${GCP.greenBorder}`, color: GCP.green, borderRadius: '4px', padding: '0.55rem 0.75rem', fontSize: '0.78rem' }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>All {totalApis} active ingredients across all {phaseCount} sequential phases cross-checked against Atlas Clinical Monographs{genes.length > 0 ? ' and pharmacogenomic profile' : ''}.</span>
              </div>
              {flagged.length > 0 ? flagged.map((x, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: GCP.amberBg, border: `1px solid ${GCP.amberBorder}`, color: GCP.amber, borderRadius: '4px', padding: '0.55rem 0.75rem', fontSize: '0.78rem' }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>{x.api} {x.dosage}</strong> ({x.part}): {x.message || (x.level === 'high' ? 'Dose exceeds typical reference range. Prescriber confirmed.' : 'Dose is below standard reference range. Prescriber confirmed.')}</span>
                </div>
              )) : null}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: GCP.blueBg, border: `1px solid ${GCP.blueBorder}`, color: '#1967d2', borderRadius: '4px', padding: '0.55rem 0.75rem', fontSize: '0.78rem' }}>
                <Info size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Follow-up: clinical review recommended at the conclusion of each phase before proceeding to the subsequent phase.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
