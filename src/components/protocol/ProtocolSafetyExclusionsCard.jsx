"use client";

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Copy, Check } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolSafetyExclusionsCard({
  protocol,
  t,
  lang = 'en'
}) {
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  const absoluteExclusions = [
    {
      gate: 'GATE 01',
      title: 'Active Peptide Hypersensitivity & Excipient Anaphylaxis',
      subtitle: 'Systemic IgE-Mediated Immunological Barrier',
      desc: 'Documented history of severe localized angioedema, acute anaphylaxis, or systemic hypersensitivity reactions to synthetic peptide active pharmaceutical ingredients (APIs), recombinant amino acid sequences, or bacteriostatic benzyl alcohol preservatives.',
      tag: 'ABSOLUTE STOP · HALT THERAPY',
      rule: 'Contraindication Threshold: Prior Type-I/IV hypersensitivity to GLP-1, GHRH, GHS, or carrier excipients.'
    },
    {
      gate: 'GATE 02',
      title: 'Endocrine Neoplasia & Thyroid C-Cell Vulnerability (MTC / MEN 2)',
      subtitle: 'Oncogenic C-Cell Hyperplasia Surveillance',
      desc: 'Personal or confirmed first-degree pedigree history of Medullary Thyroid Carcinoma (MTC), Multiple Endocrine Neoplasia syndrome type 2 (MEN 2), or baseline uncalibrated calcitonin elevation (>50–100 pg/mL).',
      tag: 'ONCOGENIC BARRIER · DO NOT PRESCRIBE',
      rule: 'Contraindication Threshold: Confirmed RET proto-oncogene mutation or personal/familial MEN-2/MTC diagnosis.'
    },
    {
      gate: 'GATE 03',
      title: 'Active Gestation, Embryonic Organogenesis & Lactation Barrier',
      subtitle: 'Teratogenic & Fetal Exposure Safeguard',
      desc: 'Strict biological exclusion during confirmed pregnancy, planned conception windows (both maternal and paternal), and active breastfeeding. Human reproductive safety telemetries have not established fetal peptide exposure margins.',
      tag: 'REPRODUCTIVE EXCLUSION GATE',
      rule: 'Contraindication Threshold: Active pregnancy test positive, lactation, or conception planned within 60 days.'
    }
  ];

  const relativePrecautions = [
    {
      gate: 'PREC 01',
      title: 'Renal Filtration Compromise & Clearance Adjustment (eGFR < 45 mL/min)',
      subtitle: 'Glomerular Filtration Rate & Micro-Dosing Surveillance',
      desc: 'Advanced renal impairment attenuates peptide peptide-chain degradation and clearance, escalating systemic peak exposure. Requires baseline serum creatinine, cystatin-C, and mandatory 50% downward titration with nephrological clearance.',
      tag: 'NEPHROLOGY CLEARANCE REQUIRED',
      rule: 'Monitoring Directive: Calculate baseline eGFR (CKD-EPI) and repeat at Week 4 post-titration.'
    },
    {
      gate: 'PREC 02',
      title: 'Hepatic Transaminase Integrity & Biliary Clearance (ALT/AST > 3x ULN)',
      subtitle: 'Phase I/II Biotransformation & Hepatic Inflammatory Barrier',
      desc: 'Active hepatic parenchymal disease, acute biliary obstruction, or transaminase elevations exceeding 3x Upper Limit of Normal (ULN) mandate hepatic panel restaging and delayed protocol initiation until enzymatic normalization.',
      tag: 'HEPATIC SURVEILLANCE GATE',
      rule: 'Monitoring Directive: Full CMP with AST, ALT, Total Bilirubin, and Alk Phos before Phase 1 escalation.'
    },
    {
      gate: 'PREC 03',
      title: 'Acute Pancreato-Biliary Pathology & Lipase Surveillance',
      subtitle: 'Exocrine Pancreatic Inflammation Safeguard',
      desc: 'Clinical history of necrotizing or recurrent acute pancreatitis, active symptomatic cholelithiasis, or severe fasting hypertriglyceridemia (>500 mg/dL). Baseline serum amylase and lipase evaluation required.',
      tag: 'PANCREATIC CLEARANCE MANDATORY',
      rule: 'Monitoring Directive: Discontinue immediately upon onset of unexplained severe persistent abdominal pain.'
    }
  ];

  const handleCopyChecklist = async () => {
    const absLines = absoluteExclusions.map((e) => `[ ] ${e.gate}: ${e.title}\n    Severity: ${e.tag}\n    Mechanism: ${e.desc}\n    Clinical Rule: ${e.rule}`).join('\n\n');
    const relLines = relativePrecautions.map((e) => `[ ] ${e.gate}: ${e.title}\n    Severity: ${e.tag}\n    Mechanism: ${e.desc}\n    Clinical Rule: ${e.rule}`).join('\n\n');

    const text = `=======================================================\n` +
      `CLINICAL PRE-PRESCRIPTION PHARMACOVIGILANCE CHECKLIST\n` +
      `Protocol: ${protocol?.name || protocol?.title || 'Metabolic & Longevity Protocol'}\n` +
      `Regulatory Framework: ISO 15189 / ICH E6(R2) Standard\n` +
      `=======================================================\n\n` +
      `SECTION 1: TIER-1 ABSOLUTE CONTRAINDICATIONS (Zero Tolerance — Do Not Prescribe if Any Checked)\n` +
      `-------------------------------------------------------------------------------------------------\n` +
      `${absLines}\n\n` +
      `SECTION 2: MAJOR CLINICAL PRECAUTIONS & ORGAN CLEARANCE (Requires Active Clearance)\n` +
      `-------------------------------------------------------------------------------------------------\n` +
      `${relLines}\n\n` +
      `PHYSICIAN ATTESTATION & CLINICAL GOVERNANCE SIGN-OFF:\n` +
      `Physician Name: ____________________________________    License #: ______________________\n` +
      `Signature:      ____________________________________    Date:      ______________________\n\n` +
      `_Med-Peptides Clinical Governance Engine · SSOT Medical Safety Standard_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedChecklist(true);
      toast.success('Clinical safety checklist copied to clipboard ✓');
      setTimeout(() => setCopiedChecklist(false), 2000);
    } catch {
      toast.error('Could not copy checklist');
    }
  };

  return (
    <PublicSectionCard
      id="safety-governance"
      icon={ShieldCheck}
      category="CLINICAL GOVERNANCE & PHARMACOVIGILANCE SENTINEL"
      title="Safety, Contraindications & Medical Governance"
      badge="Physician Oversight & GxP Clearance Mandatory"
      badgeVariant="green"
      rightAction={
        <button
          type="button"
          onClick={handleCopyChecklist}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '0.74rem',
            fontWeight: 700,
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
          title="Copy formal pre-prescription safety checklist to clipboard"
        >
          {copiedChecklist ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
          <span>{copiedChecklist ? 'Copied ✓' : 'Copy Safety Checklist'}</span>
        </button>
      }
    >
      {/* ── Subtitle / Regulatory Standard ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.85rem 1.15rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={16} color="#dc2626" />
          <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
            Mandatory pre-prescription clinical evaluation: Stratified contraindication gates compliant with ISO 15189 and ICH E6(R2).
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', letterSpacing: '0.04em' }}>
          TIER-1 EXCLUSION SENTINEL
        </span>
      </div>

      {/* ── Section 1: Absolute Contraindications (1 Card Per Row, GCP Standard) ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.76rem',
          fontWeight: 800,
          color: '#991b1b',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertTriangle size={14} color="#dc2626" />
          <span>Tier-1 Absolute Contraindications (Zero Tolerance · Do Not Prescribe)</span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          width: '100%'
        }}>
          {absoluteExclusions.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #fee2e2',
                borderLeft: '4px solid #ef4444',
                borderRadius: '8px',
                padding: '1.10rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                boxShadow: '0 1px 2px rgba(239, 68, 68, 0.04)'
              }}
            >
              {/* Header: Gate Pill, Title, and Right Severity Tag */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    letterSpacing: '0.04em'
                  }}>
                    {item.gate}
                  </span>

                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    flexShrink: 0
                  }} />

                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#991b1b',
                    letterSpacing: '0.01em'
                  }}>
                    {item.title}
                  </span>

                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#7f1d1d'
                  }}>
                    • {item.subtitle}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  letterSpacing: '0.04em'
                }}>
                  {item.tag}
                </span>
              </div>

              {/* Rationale & Mechanism */}
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {item.desc}
              </div>

              {/* Clinical Decision Rule */}
              <div style={{
                padding: '0.50rem 0.75rem',
                background: '#fef2f2',
                borderRadius: '6px',
                borderLeft: '2px solid #ef4444',
                fontSize: '0.73rem',
                color: '#991b1b',
                lineHeight: 1.45,
                fontWeight: 600
              }}>
                <strong>Clinical Threshold:</strong> {item.rule}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Major Clinical Precautions (1 Card Per Row, GCP Standard) ── */}
      <div>
        <div style={{
          fontSize: '0.76rem',
          fontWeight: 800,
          color: '#92400e',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertTriangle size={14} color="#d97706" />
          <span>Major Clinical Precautions & Organ Clearance (Requires Stratified Titration)</span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          width: '100%'
        }}>
          {relativePrecautions.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '8px',
                padding: '1.10rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                boxShadow: '0 1px 2px rgba(245, 158, 11, 0.04)'
              }}
            >
              {/* Header: Gate Pill, Title, and Right Severity Tag */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    letterSpacing: '0.04em'
                  }}>
                    {item.gate}
                  </span>

                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    flexShrink: 0
                  }} />

                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#92400e',
                    letterSpacing: '0.01em'
                  }}>
                    {item.title}
                  </span>

                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#78350f'
                  }}>
                    • {item.subtitle}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fcd34d',
                  color: '#b45309',
                  letterSpacing: '0.04em'
                }}>
                  {item.tag}
                </span>
              </div>

              {/* Rationale & Mechanism */}
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                {item.desc}
              </div>

              {/* Clinical Decision Rule */}
              <div style={{
                padding: '0.50rem 0.75rem',
                background: '#fffbeb',
                borderRadius: '6px',
                borderLeft: '2px solid #f59e0b',
                fontSize: '0.73rem',
                color: '#92400e',
                lineHeight: 1.45,
                fontWeight: 600
              }}>
                <strong>Clinical Threshold:</strong> {item.rule}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
