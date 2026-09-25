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
  const isEs = lang === 'es';
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  const absoluteExclusions = [
    {
      title: isEs ? 'Hipersensibilidad a Péptidos' : 'Known Peptide Hypersensitivity',
      desc: isEs ? 'Reacción alérgica previa o anafilaxia a principios activos o excipientes.' : 'Prior systemic or localized hypersensitivity to active peptide chains or excipients.'
    },
    {
      title: isEs ? 'Neoplasias Endocrinas / MTC / MEN 2' : 'Endocrine Neoplasms / MTC / MEN 2',
      desc: isEs ? 'Antecedente personal o familiar de carcinoma medular de tiroides o síndrome NEM 2.' : 'Personal or family history of medullary thyroid carcinoma or MEN type 2.'
    },
    {
      title: isEs ? 'Embarazo, Lactancia o Gestación Activa' : 'Pregnancy, Lactation & Conception',
      desc: isEs ? 'Contraindicado estrictamente durante gestación, lactancia materna o búsqueda reproductiva.' : 'Strictly contraindicated during active gestation, nursing, or conception planning.'
    }
  ];

  const relativePrecautions = [
    {
      title: isEs ? 'Insuficiencia Renal o Hepática Severa' : 'Severe Renal or Hepatic Impairment',
      desc: isEs ? 'Aclaramiento orgánico comprometido sin monitorización nefrológica/hepática estricta.' : 'Advanced organ clearance compromise requiring nephrology/hepatology dose adjustment.'
    },
    {
      title: isEs ? 'Antecedentes de Pancreatitis' : 'Pancreatic Disease History',
      desc: isEs ? 'Episodios agudos previos de pancreatitis o disfunción pancreática crónica activa.' : 'Prior acute pancreatitis episodes or active chronic pancreatic pathology.'
    }
  ];

  const handleCopyChecklist = async () => {
    const absLines = absoluteExclusions.map((e, i) => `  [ ] ${i + 1}. ${e.title}: ${e.desc}`).join('\n');
    const relLines = relativePrecautions.map((e, i) => `  [ ] ${i + 1}. ${e.title}: ${e.desc}`).join('\n');

    const text = `*CLINICAL PRE-PRESCRIPTION SAFETY CHECKLIST*\n` +
      `Protocol: ${protocol?.name || protocol?.title || 'Clinical Protocol'}\n` +
      `----------------------------------------\n` +
      `*ABSOLUTE CONTRAINDICATIONS (Do Not Prescribe if Any Checked):*\n${absLines}\n\n` +
      `*MAJOR PRECAUTIONS & ORGAN CLEARANCE (Requires Medical Clearance):*\n${relLines}\n\n` +
      `_Atlas Clinical Governance Engine · SSOT Safety Standard_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedChecklist(true);
      toast.success(isEs ? 'Checklist de seguridad copiado al portapapeles ✓' : 'Safety checklist copied to clipboard ✓');
      setTimeout(() => setCopiedChecklist(false), 2000);
    } catch {
      toast.error('Could not copy checklist');
    }
  };

  return (
    <PublicSectionCard
      id="safety-governance"
      icon={ShieldCheck}
      category={isEs ? 'GOBERNANZA CLÍNICA & SEGURIDAD' : 'CLINICAL GOVERNANCE & SAFETY'}
      title={t.sec6Title}
      badge={isEs ? 'Supervisión Médica Obligatoria' : 'Physician Oversight Required'}
      badgeVariant="green"
      rightAction={
        <button
          type="button"
          onClick={handleCopyChecklist}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
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
          title={isEs ? 'Copiar lista de verificación de seguridad médica' : 'Copy pre-prescription safety checklist'}
        >
          {copiedChecklist ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
          <span>{copiedChecklist ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Checklist' : 'Copy Safety Checklist')}</span>
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
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={16} color="#dc2626" />
          <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
            {isEs
              ? 'Criterios de exclusión biológica y precauciones clínicas de prescripción estratificadas'
              : 'Stratified biological exclusion criteria and clinical pre-prescription safeguards'}
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          High Risk Classification
        </span>
      </div>

      {/* ── Section 1: Absolute Contraindications (3 Balanced Columns on Laptop, 1 on Mobile) ── */}
      <div style={{ marginBottom: '1.25rem' }}>
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
          <span>{isEs ? 'Contraindicaciones Absolutas (No Iniciar)' : 'Absolute Contraindications (Do Not Initiate)'}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '0.85rem'
        }}>
          {absoluteExclusions.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #fee2e2',
                borderLeft: '4px solid #ef4444',
                borderRadius: '8px',
                padding: '0.90rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                boxShadow: '0 1px 2px rgba(239, 68, 68, 0.03)'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                <AlertOctagon size={13} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b', lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#7f1d1d', marginTop: '3px', lineHeight: 1.45 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Major Clinical Precautions (2 Balanced Columns on Laptop, 1 on Mobile) ── */}
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
          <span>{isEs ? 'Precauciones Mayores & Aclaramiento Orgánico' : 'Major Precautions & Clearance Adjustments'}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '0.85rem'
        }}>
          {relativePrecautions.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '8px',
                padding: '0.90rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                boxShadow: '0 1px 2px rgba(245, 158, 11, 0.03)'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                <AlertTriangle size={13} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#78350f', marginTop: '3px', lineHeight: 1.45 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
