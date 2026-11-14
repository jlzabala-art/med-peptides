'use client';

import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { FlaskConical, Pill, Sun, Dna } from '@/lib/icons';
import { MAX_ACTIVES } from '@/data/compoundingKnowledge';

export default function DoctorCompoundingHeader({
  lang,
  items,
  galenics,
  totalMg,
  capsPerBottle,
  isSplitProtocol,
  activeGeneticProfile,
  activeFineTuningNotes,
  doctorMeta,
  patients,
  selectedPatientId,
  setSelectedPatientId,
  isNewPatientInline,
  setIsNewPatientInline,
  newPatientName,
  setNewPatientName,
  newPatientDob,
  setNewPatientDob,
  newPatientGender,
  setNewPatientGender,
  clinicalIndications,
  setClinicalIndications
}) {
  return (
    <div className="cmp-container cmp-doc-wrap">
      <PageHeader
        title={lang === 'es' ? 'Laboratorio de Fórmulas Magistrales' : 'Compounding Laboratory'}
        subtitle={lang === 'es'
          ? 'Formulación personalizada en cápsulas veganas HPMC (Ph. Eur.) certificadas con ajuste nutrigenómico'
          : 'Personalized vegan HPMC capsule compounding (Ph. Eur.) with optional 24Genetics DNA fine-tuning'}
        panel="doctor"
        breadcrumbs={[
          { label: 'Doctor', href: '/doctor' },
          { label: 'Clinical Tools', href: '/doctor/tools' },
          { label: 'Compounding Lab' }
        ]}
      />

      {/* 4 GCP KPIs */}
      <div className="cmp-doc-kpis">
        <div className="cmp-doc-kpi">
          <div className="cmp-doc-kpi-head">
            <span>{lang === 'es' ? 'Principios Activos' : 'Active Ingredients'}</span>
            <FlaskConical size={14} color="#0d9488" />
          </div>
          <div className="cmp-doc-kpi-val">
            {items.length} / {MAX_ACTIVES} {lang === 'es' ? 'Activos' : 'Actives'}
          </div>
          <div className="cmp-doc-kpi-sub">Ph. Eur. / USP Active Pool</div>
        </div>

        <div className="cmp-doc-kpi">
          <div className="cmp-doc-kpi-head">
            <span>{lang === 'es' ? 'Cápsula Galénica' : 'Capsule Architecture'}</span>
            <Pill size={14} color="#1a73e8" />
          </div>
          <div className="cmp-doc-kpi-val">
            {galenics?.size?.size || 'Size 0'} · {totalMg} mg
          </div>
          <div className="cmp-doc-kpi-sub">{capsPerBottle} caps · Vegan HPMC</div>
        </div>

        <div className="cmp-doc-kpi">
          <div className="cmp-doc-kpi-head">
            <span>{lang === 'es' ? 'Pauta y Posología' : 'Daily Regimen'}</span>
            <Sun size={14} color="#ea580c" />
          </div>
          <div className="cmp-doc-kpi-val">
            {galenics?.capsPerDay || 2} {lang === 'es' ? 'cápsulas / día' : 'caps / day'}
          </div>
          <div className="cmp-doc-kpi-sub">
            {isSplitProtocol
              ? (lang === 'es' ? 'Doble fase (Día/Noche)' : 'Dual Phase (Day/Night)')
              : (lang === 'es' ? 'Toma matutina' : 'Morning Intake')}
          </div>
        </div>

        <div className="cmp-doc-kpi">
          <div className="cmp-doc-kpi-head">
            <span>{lang === 'es' ? 'Nutrigenómica' : 'Genomic Tuning'}</span>
            <Dna size={14} color="#7c3aed" />
          </div>
          <div className={`cmp-doc-kpi-val ${activeGeneticProfile ? 'is-genomic' : ''}`}>
            {activeGeneticProfile
              ? (lang === 'es' ? 'Calibrado 24Genetics ✓' : '24Genetics Tuned ✓')
              : (lang === 'es' ? 'Estándar Ph. Eur.' : 'Standard Baseline')}
          </div>
          <div className="cmp-doc-kpi-sub">
            {activeGeneticProfile
              ? `${activeFineTuningNotes.length} ${lang === 'es' ? 'ajustes genéticos' : 'DNA biomarker rules'}`
              : (lang === 'es' ? 'Sin informe genético cargado' : 'No DNA report loaded')}
          </div>
        </div>
      </div>

      {/* Prescribing Doctor & Patient Assignment Bar */}
      <div className="cmp-doc-bar">
        <div className="cmp-doc-bar-top">
          <div className="cmp-doc-prescriber">
            <span className="cmp-doc-emoji">👨‍⚕️</span>
            <div>
              <strong>{doctorMeta?.name || 'Dr. Marina Cordeiro Fernandes'}</strong>
              <span>
                {' '}· Lic. {doctorMeta?.license || 'DHA-91105367'} · {doctorMeta?.clinicName || doctorMeta?.clinic || 'NOVA Aesthetics & Wellness'}
              </span>
            </div>
          </div>
          <span className="cmp-doc-verified">
            ✓ {lang === 'es' ? 'Prescriptor Acreditado' : 'Verified Prescriber'}
          </span>
        </div>

        <div className="cmp-doc-patient-row">
          <div className="cmp-doc-field cmp-doc-field-patient">
            <label>{lang === 'es' ? 'Paciente Asignado' : 'Assigned Patient'}</label>
            {!isNewPatientInline ? (
              <div className="cmp-doc-select-row">
                <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                  {patients && patients.length > 0 ? (
                    patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.fullName} {p.dob ? `· DOB: ${p.dob}` : ''} {p.gender ? `(${p.gender})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="pat-carlos-mendez">Carlos Méndez (DOB: 1980-04-12 · 46 yrs)</option>
                  )}
                </select>
                <button type="button" className="cmp-doc-new-btn" onClick={() => setIsNewPatientInline(true)}>
                  + {lang === 'es' ? 'Nuevo' : 'New'}
                </button>
              </div>
            ) : (
              <div className="cmp-doc-new-patient">
                <input
                  type="text"
                  className="cmp-doc-np-name"
                  placeholder={lang === 'es' ? 'Nombre completo' : 'Full name'}
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                />
                <input
                  type="date"
                  className="cmp-doc-np-dob"
                  value={newPatientDob}
                  onChange={(e) => setNewPatientDob(e.target.value)}
                />
                <select
                  className="cmp-doc-np-gender"
                  value={newPatientGender}
                  onChange={(e) => setNewPatientGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <button type="button" className="cmp-doc-np-cancel" onClick={() => setIsNewPatientInline(false)}>
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="cmp-doc-field cmp-doc-field-indication">
            <label>{lang === 'es' ? 'Indicación Clínica / Objetivos' : 'Clinical Indications / Target'}</label>
            <input
              type="text"
              placeholder={lang === 'es' ? 'Ej. Apoyo mitocondrial, longevidad y control metabólico' : 'E.g. Mitochondrial bioenergetics & metabolic regulation'}
              value={clinicalIndications}
              onChange={(e) => setClinicalIndications(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
