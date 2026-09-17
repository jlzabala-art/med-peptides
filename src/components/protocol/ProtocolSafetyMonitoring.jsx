import React from 'react';
import SectionAccordion from './SectionAccordion';
import EligibilityBlock from './EligibilityBlock';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  TestTube,
} from '@/lib/icons';

const fmt = (v) => (v !== undefined && v !== null ? v : '—');
function humanize(str) {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * ProtocolSafetyMonitoring
 * Encapsulates Monitoring & Follow-up, Eligibility & Contraindications,
 * Comprehensive Safety Profile, and Clinical References accordions.
 */
export default function ProtocolSafetyMonitoring({
  protocol,
  slug,
  activeBlueprintPhases = [],
  eligibility,
  contraindications = [],
  safetyNotes = '',
  references = [],
}) {
  // ── Helper mappings for checkpoints ──
  const checkpointGroup = (cp) => {
    const w = Number(cp.week);
    if (cp.type?.includes('baseline') || w === 0 || w <= 1) return 'baseline';
    if (cp.type?.includes('final') || cp.type?.includes('end')) return 'final';
    return 'mid';
  };

  const GROUP_META = {
    baseline: { label: 'Baseline', color: 'var(--color-primary-hover)', bg: '#eff6ff', border: '#bfdbfe' },
    mid:      { label: 'Mid-Protocol', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
    final:    { label: 'Final', color: '#047857', bg: 'var(--color-success-bg)', border: '#bbf7d0' },
  };

  const checkpointTypeColor = (type) => {
    if (!type) return { bg: '#f1f5f9', color: 'var(--color-text-secondary)' };
    const t = type.toLowerCase();
    if (t.includes('lab') || t.includes('blood')) return { bg: '#eff6ff', color: 'var(--color-primary-hover)' };
    if (t.includes('imaging') || t.includes('scan')) return { bg: '#faf5ff', color: '#7c3aed' };
    if (t.includes('consult') || t.includes('clinical')) return { bg: '#fff7ed', color: '#c2410c' };
    return { bg: '#f1f5f9', color: 'var(--color-text-secondary)' };
  };

  // ── Safety Profile Computation ──
  const compounds = new Set();
  activeBlueprintPhases.forEach((ph) => {
    const drugs = ph.drugs || ph.compounds || ph.medications || [];
    drugs.forEach((d) => {
      const nameLower = (d.product_title || d.name || d.compound || d.product_slug || '').toLowerCase();
      if (nameLower) compounds.add(nameLower);
    });
  });

  let common = ['Mild injection site irritation', 'Fatigue', 'Headache'];
  let serious = ['Severe hypersensitivity reactions', 'Persistent severe adverse events - report immediately'];
  let drugInteractions = ['Concomitant administration with other peptide therapies should be done under clinical supervision.'];
  let monitoring = ['Baseline comprehensive metabolic panel (CMP)', 'Regular vital signs monitoring'];

  if (compounds.has('retatrutide') || compounds.has('tirzepatide') || compounds.has('semaglutide') || compounds.has('glp-1')) {
    common = [
      'Nausea & vomiting',
      'Diarrhea or constipation',
      'Mild injection site irritation',
      'Increased resting heart rate',
      'Fatigue & headache',
    ];
    serious = [
      'Acute Pancreatitis (persistent severe abdominal pain)',
      'Acute Gallbladder Disease (cholecystitis, biliary colic)',
      'Severe Hypoglycemia (especially when combined with other hypoglycemic agents)',
      'Dehydration leading to acute kidney injury',
    ];
    drugInteractions = [
      'Delayed gastric emptying: May affect absorption rates of oral medications.',
      'Other hypoglycemic agents: May increase hypoglycemia risk. Consider reducing doses.',
    ];
    monitoring = [
      'Fasting blood glucose & HbA1c',
      'Renal function tests (eGFR, serum creatinine)',
      'Amylase/Lipase (in case of clinical pancreatitis symptoms)',
      'Heart rate and blood pressure monitoring',
    ];
  } else if (compounds.has('mots-c') || compounds.has('ss-31')) {
    common = [
      'Mild injection site reaction',
      'Transient flushing',
      'Mild headache',
    ];
    serious = [
      'Hypersensitivity / allergic reaction',
      'Injection site infection',
    ];
    drugInteractions = [
      'Cardioprotective or mitochondrial drugs: Possible synergy. Monitor clinical parameters.',
    ];
    monitoring = [
      'Mitochondrial biomarkers',
      'Baseline safety labs (CBC/CMP)',
    ];
  }

  const jsonSP = protocol.safety_profile || {};
  const jsonCommon = jsonSP.adverse_events_common?.length > 0 ? jsonSP.adverse_events_common : (jsonSP.adverse_events?.common?.length > 0 ? jsonSP.adverse_events.common : common);
  const jsonSerious = jsonSP.adverse_events_serious?.length > 0 ? jsonSP.adverse_events_serious : (jsonSP.adverse_events?.serious?.length > 0 ? jsonSP.adverse_events.serious : serious);
  const jsonDrugInt = jsonSP.drug_interactions?.length > 0 ? jsonSP.drug_interactions : drugInteractions;
  const jsonMonitoring = jsonSP.monitoring_required?.length > 0 ? jsonSP.monitoring_required : monitoring;

  const resolvedSafetyProfile = {
    adverse_events: { 
      common: jsonCommon, 
      serious: jsonSerious,
    },
    drug_interactions: jsonDrugInt,
    monitoring_required: jsonMonitoring,
  };

  let resolvedSafetyNotes = safetyNotes;
  if (!resolvedSafetyNotes) {
    if (compounds.has('retatrutide') || compounds.has('tirzepatide') || compounds.has('semaglutide')) {
      resolvedSafetyNotes = 'Retatrutide/GLP-1 agonists are powerful metabolic modulators. Strict clinical monitoring is required. Avoid in patients with a history of pancreatitis, gallbladder disease, or medullary thyroid carcinoma. Always seek medical supervision before beginning therapy.';
    } else {
      resolvedSafetyNotes = 'Clinical peptide therapy requires diligent adherence to aseptic injection techniques, correct reconstitution, and regular diagnostic monitoring to ensure optimal safety and efficacy.';
    }
  }

  const mp = protocol.monitoring_plan || {
    baseline_required: protocol.monitoring?.labs || [],
    clinical_rationale: protocol.monitoring?.rationales?.join(' ') || 'Standard monitoring of safety markers and metabolic parameters.',
    scheduled_checkpoints: (protocol.clinical_notes?.monitoring || []).map((m, i) => ({
      week: i === 0 ? 12 : 24,
      type: 'clinical_consult',
      title: m,
      labs: [],
    })),
  };
  const checkpoints = mp.scheduled_checkpoints || [];

  return (
    <>
      {/* ── Monitoring Plan ── */}
      {(protocol.monitoring_plan || protocol.monitoring?.labs?.length > 0 || protocol.clinical_notes?.monitoring?.length > 0) && (
        <SectionAccordion
          id={`${slug}_monitoring`}
          title="Monitoring & Follow-Up"
          icon={TestTube}
          accentColor="#047857"
        >
          {/* Baseline Labs Checklist */}
          {mp.baseline_required?.length > 0 && (
            <div
              style={{
                background: 'var(--color-bg-app)',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #1d4ed8',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={15} color="var(--color-primary-hover)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-hover)' }}>
                  Baseline Labs Required
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {mp.baseline_required.map((lab, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.77rem',
                      fontWeight: 600,
                      background: 'var(--color-bg-surface)',
                      border: '1px solid #bfdbfe',
                      borderRadius: 6,
                      padding: '0.3rem 0.65rem',
                      color: '#1e40af',
                    }}
                  >
                    <CheckCircle2 size={11} color="#60a5fa" />
                    {lab.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checkpoint Cards */}
          {checkpoints.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {checkpoints.map((cp, i) => {
                const grp = checkpointGroup(cp);
                const gm = GROUP_META[grp];
                const tc = checkpointTypeColor(cp.type);
                return (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr',
                      borderRadius: 10,
                      border: `1px solid ${gm.border}`,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Week badge column */}
                    <div
                      style={{
                        background: gm.bg,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.75rem 0.4rem',
                        borderRight: `2px solid ${gm.border}`,
                      }}
                    >
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: gm.color, letterSpacing: '0.06em', lineHeight: 1 }}>WK</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: gm.color, lineHeight: 1.1 }}>{cp.week ?? '—'}</span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', color: gm.color, opacity: 0.7, marginTop: '0.2rem', textAlign: 'center' }}>{gm.label}</span>
                    </div>

                    {/* Content column */}
                    <div style={{ background: 'var(--color-bg-surface)', padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        {cp.type && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: tc.bg,
                              color: tc.color,
                              borderRadius: 5,
                              padding: '0.18rem 0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {cp.type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      {cp.purpose && (
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.81rem', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.45 }}>
                          {cp.purpose}
                        </p>
                      )}
                      {(cp.labs || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {cp.labs.map((l, j) => (
                            <span
                              key={j}
                              style={{
                                fontSize: '0.69rem',
                                fontWeight: 600,
                                background: '#f1f5f9',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid #e2e8f0',
                                borderRadius: 4,
                                padding: '0.15rem 0.45rem',
                              }}
                            >
                              {l.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionAccordion>
      )}

      {/* ── Eligibility & Contraindications ── */}
      {(eligibility || contraindications.length > 0) && (
        <SectionAccordion
          id={`${slug}_eligibility`}
          title="Eligibility & Contraindications"
          icon={ShieldCheck}
          accentColor="#b45309"
        >
          {eligibility && (
            <div style={{ marginBottom: contraindications.length > 0 ? '1.5rem' : 0 }}>
              <EligibilityBlock eligibility={eligibility} />
            </div>
          )}

          {contraindications.length > 0 && (
            <div className="proto-contraindication-card">
              <div className="proto-contraindication-card__header">
                <AlertTriangle size={18} />
                <span>Contraindications</span>
              </div>
              <div className="proto-criteria-list">
                {contraindications.map((c, i) => (
                  <span key={i} className="proto-badge proto-badge--warn">
                    <AlertCircle size={11} /> {humanize(fmt(c))}
                  </span>
                ))}
              </div>
              {(protocol.eligibility_rules?.relative_cautions || []).length > 0 && (
                <>
                  <div className="proto-contraindication-card__sub">Relative Cautions</div>
                  <div className="proto-criteria-list">
                    {protocol.eligibility_rules.relative_cautions.map((c, i) => (
                      <span key={i} className="proto-badge proto-badge--caution">
                        {humanize(c)}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </SectionAccordion>
      )}

      {/* ── Safety Profile ── */}
      <SectionAccordion
        id={`${slug}_safety`}
        title="Safety Profile"
        icon={ShieldCheck}
        accentColor="var(--color-danger)"
      >
        {resolvedSafetyNotes && (
          <p className="proto-section__text" style={{ marginBottom: '1.25rem' }}>
            {resolvedSafetyNotes}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Adverse Events */}
          {(resolvedSafetyProfile.adverse_events?.common?.length > 0 || resolvedSafetyProfile.adverse_events?.serious?.length > 0) && (
            <div
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderLeft: '4px solid #f97316',
                borderRadius: 10,
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={14} color="#f97316" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c2410c' }}>
                  Adverse Events
                </span>
              </div>
              {resolvedSafetyProfile.adverse_events.common?.length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>Common</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {resolvedSafetyProfile.adverse_events.common.map((ae, i) => (
                      <span key={i} style={{ background: '#ffedd5', color: '#c2410c', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>
                        {ae}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resolvedSafetyProfile.adverse_events.serious?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>Serious (report immediately)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {resolvedSafetyProfile.adverse_events.serious.map((ae, i) => (
                      <span key={i} style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>
                        {ae}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drug Interactions */}
          {resolvedSafetyProfile.drug_interactions?.length > 0 && (
            <div
              style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderLeft: '4px solid #9333ea',
                borderRadius: 10,
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertCircle size={14} color="#9333ea" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7e22ce' }}>
                  Drug Interactions
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.83rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {resolvedSafetyProfile.drug_interactions.map((di, i) => (
                  <li key={i}>{di}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Monitoring Required */}
          {resolvedSafetyProfile.monitoring_required?.length > 0 && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderLeft: '4px solid #2563eb',
                borderRadius: 10,
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-hover)' }}>
                  Recommended Monitoring
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {resolvedSafetyProfile.monitoring_required.map((m, i) => (
                  <span key={i} style={{ background: '#dbeafe', color: 'var(--color-primary-hover)', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionAccordion>

      {/* ── Clinical References ── */}
      {references.length > 0 && (
        <SectionAccordion
          id={`${slug}_references`}
          title="Clinical References"
          icon={BookOpen}
          accentColor="#0369a1"
          defaultOpen={false}
        >
          <ol className="proto-references">
            {references.map((r, i) => (
              <li key={i}>
                {typeof r === 'string' ? (
                  r.startsWith('http') ? (
                    <a href={r} target="_blank" rel="noopener noreferrer">
                      {r}
                    </a>
                  ) : (
                    r
                  )
                ) : (
                  <span>
                    {r.title || r.citation || JSON.stringify(r)}
                    {r.url && (
                      <>
                        {' '}—{' '}
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </SectionAccordion>
      )}
    </>
  );
}
