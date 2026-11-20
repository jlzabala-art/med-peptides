"use client";

import React from 'react';
import {
  Dna,
  ShieldCheck,
  Pill,
  TestTube2,
  FlaskConical,
  FileText,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Layers,
  Clock,
  ArrowUpRight
} from 'lucide-react';

/**
 * SpecialtyBlueprintCard
 *
 * Clean Google Cloud UX Master-Detail card for Specialty Clinical Blueprints.
 * Collapsed by default so physicians can scan all specialty protocols above the fold,
 * with a single primary CTA ("Prescribe Protocol") and zero redundant buttons.
 */
function SpecialtyBlueprintCard({
  bp,
  isExpanded = false,
  onToggleExpand,
  onOpenDossier,
  onPrescribeBlueprint,
  patientsList = [],
  activeAssignDropdownKey,
  setActiveAssignDropdownKey,
  assignMenuRef,
  triggerHaptic
}) {
  const synergyItems = [
    bp.peptideSynergy && {
      type: 'peptide',
      badge: 'Bioactive Peptide',
      name: bp.peptideSynergy.name,
      role: bp.peptideSynergy.role,
      url: bp.protocolUrl || '/collection/peptides'
    },
    bp.dermocosmeticSynergy && {
      type: 'colway',
      badge: 'Cosmeceutical (Colway®)',
      name: bp.dermocosmeticSynergy.name,
      role: bp.dermocosmeticSynergy.role,
      url: '/collection/colway'
    },
    bp.nutraceuticalSynergy && {
      type: 'nutraceutical',
      badge: 'Oral Nutraceutical',
      name: bp.nutraceuticalSynergy.name,
      role: bp.nutraceuticalSynergy.role,
      url: bp.nutraceuticalSynergy.slug ? `/p/${bp.nutraceuticalSynergy.slug}` : '/collection/ultraman'
    },
    bp.diagnosticSynergy && {
      type: 'diagnostic',
      badge: 'Diagnostic Panel',
      name: bp.diagnosticSynergy.name,
      role: bp.diagnosticSynergy.role,
      url: bp.diagnosticSynergy.slug
        ? `/p/${bp.diagnosticSynergy.slug}`
        : (bp.diagnosticSynergy.name?.toLowerCase().includes('teletest')
            ? '/collection/teletest'
            : '/collection/bloodo')
    }
  ].filter(Boolean);

  const formulaItems = bp.compoundingFormula?.items || [];
  const formulaSummary = formulaItems
    .map((item) => `${item.name}${item.concentration ? ` ${item.concentration}` : ''}`)
    .join(' · ');

  const menuKey = `bp_full_${bp.code || bp.id || bp.title}`;

  const buildCompleteProtocolBlueprint = () => ({
    ...bp,
    title: `${bp.title || bp.clinicalProcedure} (Complete Protocol)`,
    compoundingFormula: {
      ...bp.compoundingFormula,
      treatmentTitle: `${bp.compoundingFormula?.treatmentTitle || bp.title} + Catalog Synergies`,
      items: [
        ...formulaItems,
        ...synergyItems.map((item) => ({
          name: `[Catalog] ${item.name}`,
          concentration: 'Commercial Stock',
          role: `${item.badge} · ${item.role}`
        }))
      ]
    }
  });

  const renderSynergyIcon = (type) => {
    switch (type) {
      case 'peptide':
        return (
          <span style={{ width: '26px', height: '26px', borderRadius: '4px', background: '#e8f0fe', color: '#1a73e8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Dna size={14} />
          </span>
        );
      case 'colway':
        return (
          <span style={{ width: '26px', height: '26px', borderRadius: '4px', background: '#e6f4ea', color: '#137333', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={14} />
          </span>
        );
      case 'nutraceutical':
        return (
          <span style={{ width: '26px', height: '26px', borderRadius: '4px', background: '#fef7e0', color: '#b06000', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pill size={14} />
          </span>
        );
      case 'diagnostic':
      default:
        return (
          <span style={{ width: '26px', height: '26px', borderRadius: '4px', background: '#f3e8ff', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TestTube2 size={14} />
          </span>
        );
    }
  };

  return (
    <div
      style={{
        border: '1px solid #dadce0',
        borderRadius: '8px',
        background: '#ffffff',
        overflow: 'visible',
        boxShadow: '0 1px 2px rgba(60,64,67,0.08)'
      }}
    >
      {/* ── SUMMARY HEADER (Always visible, scannable in 1 glance) ── */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ flex: '1 1 480px', minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#e8f0fe',
                color: '#1a73e8',
                border: '1px solid #d2e3fc',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {bp.badge || 'Clinical Protocol'}
            </span>
            <span
              style={{
                fontSize: '0.70rem',
                color: '#5f6368',
                background: '#f8f9fa',
                border: '1px solid #e8eaed',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              Target: <strong style={{ color: '#202124' }}>{bp.targetPatients}</strong>
            </span>
          </div>

          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.02rem', fontWeight: 600, color: '#202124', lineHeight: 1.35 }}>
            {bp.clinicalProcedure}
          </h3>

          <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#5f6368', lineHeight: 1.45 }}>
            {bp.clinicalRationale}
          </p>

          {/* 1-Line Composition Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.72rem', color: '#3c4043' }}>
            {formulaSummary && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8f9fa', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e8eaed' }}>
                <FlaskConical size={12} style={{ color: '#1a73e8', flexShrink: 0 }} />
                <span><strong>Rx:</strong> {formulaSummary}</span>
              </span>
            )}
            {synergyItems.length > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f6fdf7', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ceead6', color: '#137333' }}>
                <Layers size={12} style={{ flexShrink: 0 }} />
                <span>+{synergyItems.length} Catalog Synergies</span>
              </span>
            )}
          </div>
        </div>

        {/* ── ONLY 2 CLEAR ACTIONS IN HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', alignSelf: 'center' }}>
          <button
            type="button"
            onClick={onToggleExpand}
            className="gcp-btn-secondary"
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>{isExpanded ? 'Hide Details' : 'View Formula & Synergies'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {onPrescribeBlueprint && (
            <div style={{ display: 'inline-flex', alignItems: 'stretch', position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  if (triggerHaptic) triggerHaptic('selection');
                  onPrescribeBlueprint(buildCompleteProtocolBlueprint());
                }}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: patientsList.length > 0 ? '4px 0 0 4px' : '4px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
                title="Load compounded formula and catalog co-therapies into the Rx Formulary"
              >
                <Layers size={14} />
                <span>Prescribe Protocol</span>
              </button>

              {patientsList.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (triggerHaptic) triggerHaptic('light');
                    setActiveAssignDropdownKey(activeAssignDropdownKey === menuKey ? null : menuKey);
                  }}
                  style={{
                    height: '34px',
                    width: '28px',
                    padding: 0,
                    borderRadius: '0 4px 4px 0',
                    border: 'none',
                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                    background: '#1a73e8',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Assign directly to a patient"
                >
                  <ChevronDown size={14} />
                </button>
              )}

              {activeAssignDropdownKey === menuKey && (
                <div
                  ref={assignMenuRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    width: '270px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 14px rgba(60,64,67,0.2)',
                    zIndex: 60,
                    padding: '4px 0'
                  }}
                >
                  <div style={{ padding: '6px 12px', borderBottom: '1px solid #f1f3f4', fontSize: '0.66rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Assign to Patient</span>
                    <UserCheck size={12} style={{ color: '#1a73e8' }} />
                  </div>
                  {patientsList.slice(0, 15).map((pt, pIdx) => {
                    const pName = pt.patientName || pt.name || `Patient #${pIdx + 1}`;
                    const pDob = pt.dob || pt.patientDob || '';
                    const pPhone = pt.phone || pt.patientPhone || '';
                    return (
                      <button
                        key={pt.id || pName + pIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (triggerHaptic) triggerHaptic('selection');
                          setActiveAssignDropdownKey(null);
                          onPrescribeBlueprint(buildCompleteProtocolBlueprint(), { name: pName, phone: pPhone, dob: pDob });
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px'
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124' }}>{pName}</div>
                        {(pPhone || pDob) && (
                          <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>
                            {pPhone ? pPhone : ''}{pPhone && pDob ? ' · ' : ''}{pDob ? `DOB: ${pDob}` : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── EXPANDED MASTER-DETAIL BODY ── */}
      {isExpanded && (
        <div
          style={{
            padding: '16px 20px',
            background: '#f8f9fa',
            borderTop: '1px solid #e8eaed',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Block 1: Compounded Galenic Formulation */}
          {bp.compoundingFormula && (
            <div style={{ border: '1px solid #dadce0', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Compounded Galenic Formulation · {bp.compoundingFormula.dispensingForm}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#202124', marginTop: '2px' }}>
                    {bp.compoundingFormula.treatmentTitle}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {onOpenDossier && (
                    <button
                      type="button"
                      onClick={() => {
                        if (triggerHaptic) triggerHaptic('selection');
                        onOpenDossier(bp);
                      }}
                      style={{
                        height: '30px',
                        padding: '0 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#3c4043',
                        fontSize: '0.73rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FileText size={13} />
                      <span>Clinical Dossier</span>
                    </button>
                  )}

                  {onPrescribeBlueprint && (
                    <button
                      type="button"
                      onClick={() => {
                        if (triggerHaptic) triggerHaptic('selection');
                        onPrescribeBlueprint(bp);
                      }}
                      style={{
                        height: '30px',
                        padding: '0 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#1a73e8',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FlaskConical size={13} />
                      <span>Customize Formula Only</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {formulaItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #e8eaed',
                        background: '#f8f9fa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124' }}>{item.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '2px' }}>{item.role}</div>
                      </div>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        {item.concentration}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#3c4043', paddingTop: '4px' }}>
                  <Clock size={13} style={{ color: '#5f6368', flexShrink: 0 }} />
                  <span><strong>Posology:</strong> {bp.compoundingFormula.posology}</span>
                </div>
              </div>
            </div>
          )}

          {/* Block 2: Catalog Co-Therapies (1-Click Add to Rx, Title is direct link) */}
          {synergyItems.length > 0 && (
            <div style={{ border: '1px solid #dadce0', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#137333', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Catalog Co-Therapies &amp; Diagnostics ({synergyItems.length} In-Stock)
                </div>
                <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                  Direct dispensing · Click name for monograph
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {synergyItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 16px',
                      borderTop: idx === 0 ? 'none' : '1px solid #f1f3f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 320px', minWidth: '220px' }}>
                      {renderSynergyIcon(item.type)}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a73e8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>{item.name}</span>
                            <ArrowUpRight size={12} />
                          </a>
                          <span style={{ fontSize: '0.66rem', color: '#5f6368', background: '#f1f3f4', padding: '1px 6px', borderRadius: '4px' }}>
                            {item.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '2px' }}>{item.role}</div>
                      </div>
                    </div>

                    {onPrescribeBlueprint && (
                      <button
                        type="button"
                        onClick={() => {
                          if (triggerHaptic) triggerHaptic('selection');
                          onPrescribeBlueprint({
                            ...bp,
                            title: item.name,
                            compoundingFormula: {
                              treatmentTitle: `${item.name} (Catalog Product)`,
                              dispensingForm: item.badge,
                              volume: 'Standard Packaging',
                              posology: item.role,
                              items: [{ name: item.name, concentration: 'Commercial Stock', role: item.role }]
                            }
                          });
                        }}
                        style={{
                          height: '28px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          color: '#3c4043',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Pill size={12} />
                        <span>Add to Rx</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(SpecialtyBlueprintCard);
