'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Stethoscope, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Syringe, 
  Droplets, 
  Calendar, 
  Copy, 
  Plus, 
  Send 
} from '@/lib/icons';
import notifier from '@/services/NotificationService';

/**
 * AIClinicalScribeModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional AI Clinical Scribe Modal for Doctors.
 * Converts unstructured patient intake, WhatsApp consultation notes, or audio dictations
 * into an official, dosed, and verified medical prescription.
 */
export default function AIClinicalScribeModal({
  isOpen,
  onClose,
  onApplyPrescription,
  patient = null
}) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!notes.trim()) {
      notifier.error('Please enter clinical consultation notes or doctor dictation.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/ai-clinical-scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalNotes: notes,
          patientProfile: patient ? {
            name: patient.name || patient.displayName,
            age: patient.age || null,
            gender: patient.gender || null,
            medicalHistory: patient.medicalHistory || null,
            allergies: patient.allergies || null
          } : {}
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process notes.');

      setParsedResult(data.data);
      notifier.success('Clinical prescription structured successfully with Gemini!');
    } catch (err) {
      console.error('[AIClinicalScribeModal] Error:', err);
      notifier.error(err.message || 'AI Scribe failed to process.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    if (onApplyPrescription) {
      onApplyPrescription(parsedResult);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                AI Clinical Scribe & Prescription Copilot
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                {patient ? `Patient: ${patient.name || patient.displayName}` : 'Doctor consultation note-to-prescription transformer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Notes Input Area */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Doctor's Freeform Consultation Notes or Dictation:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 48yo male patient with chronic Achilles tendinopathy and general fatigue. Prescribe BPC-157 250mcg twice daily and NAD+ 100mg once weekly for 6 weeks. Instruct subcutaneous injection and cold storage..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Powered by Gemini 2.5 Flash · Clinical Peptide Pharmacokinetics
              </span>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !notes.trim()}
                style={{
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isLoading || !notes.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !notes.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Sparkles size={16} />
                {isLoading ? 'Structuring Rx...' : 'Structure Prescription'}
              </button>
            </div>
          </div>

          {/* Structured Output Preview */}
          {parsedResult && (
            <div style={{
              border: '1px solid #0d9488',
              borderRadius: '12px',
              padding: '1.25rem',
              backgroundColor: '#f0fdfa',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.05em' }}>
                    Clinical Prescription Draft
                  </span>
                  <h4 style={{ margin: '0.1rem 0 0', fontSize: '1rem', color: '#134e4a', fontWeight: 800 }}>
                    {parsedResult.patientTargetGoal}
                  </h4>
                </div>
                <span style={{
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#ccfbf1',
                  color: '#0f766e',
                  fontWeight: 700
                }}>
                  {parsedResult.medications?.length || 0} Medications Structured
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', margin: '0 0 1rem', lineHeight: 1.4 }}>
                "{parsedResult.clinicalSummary}"
              </p>

              {/* Safety Alerts */}
              {parsedResult.safetyAlerts?.length > 0 && (
                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {parsedResult.safetyAlerts.map((alert, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                      border: `1px solid ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? '#fecaca' : '#fde68a'}`,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? '#991b1b' : '#92400e'
                    }}>
                      <AlertTriangle size={15} />
                      <div>
                        <strong>{alert.title}:</strong> {alert.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Medications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>
                  Prescribed Compounds & Titration:
                </div>
                {parsedResult.medications?.map((med, i) => (
                  <div key={i} style={{
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #99f6e4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        {med.name} — <span style={{ color: '#0d9488' }}>{med.dosage}</span> ({med.route})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                        📅 {med.frequency} · Duration: {med.durationWeeks} weeks ({med.recommendedVials} vials needed)
                      </div>
                      {med.reconstitutionInstructions && (
                        <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '0.15rem' }}>
                          💧 {med.reconstitutionInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Accessories */}
              {parsedResult.accessories?.length > 0 && (
                <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #99f6e4', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Required Supplies & Accessories Included:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {parsedResult.accessories.map((acc, i) => (
                      <span key={i} style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontSize: '0.74rem',
                        fontWeight: 600
                      }}>
                        {acc.quantity}x {acc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Administration Schedule */}
              {parsedResult.patientAdministrationSchedule && (
                <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    📋 Patient-Facing Administration Guide:
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                    {parsedResult.patientAdministrationSchedule}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!parsedResult}
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: parsedResult ? 'pointer' : 'not-allowed',
              opacity: parsedResult ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckCircle size={16} /> Transfer to Official Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
