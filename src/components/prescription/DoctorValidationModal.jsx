'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  Stethoscope, 
  Sparkles, 
  Calendar, 
  FileText, 
  Dna, 
  Lock, 
  ArrowRight,
  Eye,
  CheckCircle2
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

export default function DoctorValidationModal({
  isOpen,
  onClose,
  rx,
  rxId,
  doctorName = 'Treating Physician',
  clinicName = 'Medical Practice',
  patientName = 'Patient',
  compoundedFormulations = [],
  atlasRecs = null,
  isEs = false,
  onValidationSuccess = null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration switches for the patient view
  const [includeAdherence, setIncludeAdherence] = useState(true);
  const [includeRoadmap, setIncludeRoadmap] = useState(true);
  const [includeGenomics, setIncludeGenomics] = useState(true);
  
  // Selected optional synergies (strictly default to empty - doctor must opt-in)
  const [selectedSynergies, setSelectedSynergies] = useState({});

  if (!isOpen) return null;

  // Collect available potential recommendations
  const potentialSynergies = [];
  if (atlasRecs?.peptide?.name) {
    potentialSynergies.push({
      id: 'peptide',
      name: atlasRecs.peptide.name,
      dose: atlasRecs.peptide.dose || atlasRecs.peptide.dosage || '',
      type: isEs ? 'Péptido Adyuvante' : 'Adjuvant Bioregulator Peptide',
      mechanism: atlasRecs.peptide.mechanism || atlasRecs.peptide.pharmacodynamics || ''
    });
  }
  if (atlasRecs?.supplement?.name) {
    potentialSynergies.push({
      id: 'supplement',
      name: atlasRecs.supplement.name,
      dose: atlasRecs.supplement.dose || atlasRecs.supplement.dosage || '',
      type: isEs ? 'Micronutrición y Suplemento' : 'Targeted Micronutrition',
      mechanism: atlasRecs.supplement.mechanism || ''
    });
  }
  if (atlasRecs?.colway?.name) {
    potentialSynergies.push({
      id: 'colway',
      name: atlasRecs.colway.name,
      dose: atlasRecs.colway.dose || '',
      type: isEs ? 'Cosmecéutica Colágena Activa' : 'Transdermal Collagen Complex',
      mechanism: atlasRecs.colway.rationale || ''
    });
  }

  const toggleSynergy = (synId) => {
    triggerHaptic('selection');
    setSelectedSynergies(prev => ({
      ...prev,
      [synId]: !prev[synId]
    }));
  };

  const handleConfirmValidation = async () => {
    triggerHaptic('medium');
    setIsSubmitting(true);
    try {
      const approvedSynergiesList = potentialSynergies.filter(s => selectedSynergies[s.id]);
      const patientConfig = {
        allowPatientAccess: true,
        includeAdherence,
        includeRoadmap,
        includeGenomics,
        approvedSynergies: approvedSynergiesList,
        certifiedByDoctor: doctorName,
        certifiedAt: new Date().toISOString()
      };

      const res = await fetch('/api/prescriptions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: rx?.id,
          prescriptionNumber: rx?.prescriptionNumber || rx?.code || rxId,
          status: 'approved',
          reason: 'Physician clinical pre-flight sign-off and patient release authorization',
          updatedBy: doctorName,
          patientConfig
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update prescription status');
      }

      toast.success(
        isEs 
          ? '¡Prescripción validada y certificada! El acceso para el paciente ha sido habilitado.' 
          : 'Prescription certified! Patient link is now active.',
        { icon: '✓', duration: 4000 }
      );

      if (onValidationSuccess) {
        onValidationSuccess(patientConfig);
      }
      onClose();
    } catch (err) {
      console.error('[DoctorValidationModal] Error validating:', err);
      toast.error(isEs ? 'Error al certificar la prescripción' : 'Failed to validate prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          animation: 'fadeInModal 0.18s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {isEs ? 'Validación y Certificación Facultativa' : 'Physician Certification & Patient Release'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {patientName} · #{rxId} · {doctorName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#94a3b8',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Clinical Banner */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: '#1e40af',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Stethoscope size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{isEs ? 'Control de Ética Médica y Divulgación al Paciente' : 'Clinical Ethics & Patient Disclosure Gate'}</strong>:
              <br />
              {isEs 
                ? 'Al confirmar esta validación, la receta pasará de estado "Borrador" a "Validada". Se habilitará el enlace privado del paciente y se mostrarán exclusivamente las fórmulas y opciones aprobadas a continuación.'
                : 'Confirming certification transitions this prescription from "Draft" to "Approved". The secure patient link will activate, showing only the formulations and approved options selected below.'}
            </div>
          </div>

          {/* Formulations Summary */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              {isEs ? '1. Fórmulas Magistrales a Habilitar' : '1. Compounded Formulations to Release'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {compoundedFormulations.length > 0 ? (
                compoundedFormulations.map((form, idx) => (
                  <div 
                    key={form.id || idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {form.title || form.formula || `Fórmula ${idx + 1}`}
                      </span>
                      <span style={{ color: '#64748b', marginLeft: '6px' }}>
                        ({form.apis?.length || 0} APIs · {form.volume || form.quantity || ''})
                      </span>
                    </div>
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.72rem' }}>
                      ✓ {isEs ? 'Aprobada' : 'Approved'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                  {isEs ? 'Fórmula magistral única especificada en expediente.' : 'Standard magistral formulation from clinical dossier.'}
                </div>
              )}
            </div>
          </div>

          {/* Patient View Options (Toggles) */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              {isEs ? '2. Módulos Visibles para el Paciente' : '2. Visible Modules for Patient'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Daily Dose Adherence */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} color="#0284c7" />
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1e293b' }}>
                      {isEs ? 'Registro diario de adherencia y tomas' : 'Daily dose adherence tracker & streak'}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      {isEs ? 'Permite al paciente marcar cada toma en 1 clic' : 'Allows patient to log doses in 1-tap on mobile'}
                    </div>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={includeAdherence}
                  onChange={(e) => setIncludeAdherence(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                />
              </label>

              {/* 90-Day Roadmap */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={16} color="#16a34a" />
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1e293b' }}>
                      {isEs ? 'Plan de evolución clínica a 90 días' : '90-Day clinical roadmap & milestones'}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      {isEs ? 'Explica qué esperar mes a mes (reduce llamadas a la clínica)' : 'Sets realistic expectations for months 1-3 to prevent drop-out'}
                    </div>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={includeRoadmap}
                  onChange={(e) => setIncludeRoadmap(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer' }}
                />
              </label>

              {/* Genomics Overview */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Dna size={16} color="#7c3aed" />
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1e293b' }}>
                      {isEs ? 'Resumen de orientación farmacogenómica' : 'Pharmacogenomic rationale summary'}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      {isEs ? 'Muestra la base genética del tratamiento (Fagron Genomics)' : 'Shows genetic targets calibrated by laboratory panel'}
                    </div>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={includeGenomics}
                  onChange={(e) => setIncludeGenomics(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Optional Synergies / Adjuvants (STRICT OPT-IN) */}
          {potentialSynergies.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                {isEs ? '3. Sinergias Adyuvantes (Opcional - Solo si el médico lo autoriza)' : '3. Adjuvant Synergies (Optional - Doctor Opt-In Only)'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
                {isEs 
                  ? 'Por defecto, NINGUNA recomendación de IA se muestra al paciente. Marque únicamente las que desee prescribir formalmente como coadyuvante.'
                  : 'By default, NO AI recommendations are visible to the patient. Check only items you explicitly prescribe as an adjuvant.'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {potentialSynergies.map((syn) => {
                  const isChecked = Boolean(selectedSynergies[syn.id]);
                  return (
                    <div
                      key={syn.id}
                      onClick={() => toggleSynergy(syn.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isChecked ? '1px solid #16a34a' : '1px solid #e2e8f0',
                        background: isChecked ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? '2px solid #16a34a' : '2px solid #cbd5e1',
                          background: isChecked ? '#16a34a' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff'
                        }}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1e293b' }}>
                            {syn.name} {syn.dose ? `(${syn.dose})` : ''}
                          </div>
                          <div style={{ fontSize: '0.70rem', color: isChecked ? '#15803d' : '#64748b' }}>
                            {syn.type}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: isChecked ? '#dcfce7' : '#f1f5f9',
                        color: isChecked ? '#166534' : '#64748b'
                      }}>
                        {isChecked ? (isEs ? 'Prescrito' : 'Prescribed') : (isEs ? 'Oculto al paciente' : 'Hidden from patient')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              fontSize: '0.80rem',
              fontWeight: 600,
              color: '#64748b',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {isEs ? 'Cancelar' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirmValidation}
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff',
              background: '#059669',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(5, 150, 105, 0.3)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#047857'; }}
            onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#059669'; }}
          >
            {isSubmitting ? (
              <span>{isEs ? 'Certificando...' : 'Certifying...'}</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>{isEs ? 'Certificar y Activar Enlace Paciente' : 'Certify & Release Patient Link'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
