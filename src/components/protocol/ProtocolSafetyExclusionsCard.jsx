"use client";

import React from 'react';
import { ShieldCheck, AlertTriangle } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolSafetyExclusionsCard({
  protocol,
  t,
  lang = 'en'
}) {
  const isEs = lang === 'es';

  const exclusions = [
    {
      title: isEs ? 'Hipersensibilidad a Péptidos' : 'Known Peptide Hypersensitivity',
      desc: isEs ? 'Reacción alérgica previa o anafilaxia a principios activos o excipientes.' : 'Prior systemic or localized hypersensitivity to active peptide chains or excipients.'
    },
    {
      title: isEs ? 'Neoplasias Endocrinas / MTC / MEN 2' : 'Endocrine Neoplasms / MTC / MEN 2',
      desc: isEs ? 'Antecedente personal o familiar de carcinoma medular de tiroides o NEM 2.' : 'Personal or family history of medullary thyroid carcinoma or MEN type 2.'
    },
    {
      title: isEs ? 'Insuficiencia Renal o Hepática Severa' : 'Severe Renal or Hepatic Impairment',
      desc: isEs ? 'Disfunción orgánica avanzada no compensada sin supervisión especializada.' : 'Uncompensated advanced clearance dysfunction without nephrology supervision.'
    },
    {
      title: isEs ? 'Embarazo y Lactancia' : 'Pregnancy & Lactation',
      desc: isEs ? 'Contraindicado en gestación, lactancia materna o búsqueda activa de embarazo.' : 'Strictly contraindicated during active gestation, nursing, or conception planning.'
    },
    {
      title: isEs ? 'Antecedentes de Pancreatitis' : 'Pancreatitis History',
      desc: isEs ? 'Episodios agudos previos o inflamación pancreática crónica activa.' : 'Prior acute pancreatitis episodes or active chronic pancreatic pathology.'
    }
  ];

  return (
    <PublicSectionCard
      id="safety-governance"
      icon={ShieldCheck}
      category={isEs ? 'GOBERNANZA CLÍNICA & EXCLUSIONES' : 'CLINICAL GOVERNANCE & EXCLUSIONS'}
      title={t.sec6Title}
      badge={isEs ? 'Supervisión Médica Obligatoria' : 'Physician Consultation Required'}
      badgeVariant="green"
      rightAction={
        <span style={{ fontSize: '0.74rem', color: '#fca5a5', fontWeight: 600 }}>
          {isEs ? 'Supervisión Obligatoria' : 'Physician Oversight'}
        </span>
      }
    >
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
        {protocol?.safetyGuidelines || protocol?.contraindications_text || t.contraindicationsDesc}
      </p>

      {/* Clinical Exclusions Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.75rem',
        marginTop: '1rem'
      }}>
        {exclusions.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#fffbfb',
              border: '1px solid #fee2e2',
              borderLeft: '4px solid #ef4444',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              boxShadow: '0 1px 2px rgba(239, 68, 68, 0.04)'
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
              marginTop: '2px'
            }}>
              <AlertTriangle size={13} />
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
    </PublicSectionCard>
  );
}
