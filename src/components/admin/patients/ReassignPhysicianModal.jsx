"use client";

import React, { useState, useEffect } from 'react';
import { Stethoscope, Building2, User, Check, X, AlertCircle, RefreshCw, FileText } from '@/lib/icons';
import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import { reassignPatientsPhysicianAction } from '../../../actions/patientsActions';
import notifier from '../../../services/NotificationService';

export default function ReassignPhysicianModal({
  isOpen,
  onClose,
  patients = [],
  onSuccess,
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [updatePrescriptions, setUpdatePrescriptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctors and clinics
  const { data: doctors = [], isLoading: loadingDoctors } = useFirestoreCollection('users', {
    whereConditions: [['roles', 'array-contains', 'doctor']],
  });

  const { data: clinics = [], isLoading: loadingClinics } = useFirestoreCollection('clinics');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedDoctorId('');
      setSelectedClinicId('');
      setUpdatePrescriptions(true);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // When doctor changes, auto-select their clinic if known
  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    const doc = doctors.find(d => d.id === doctorId);
    if (doc) {
      if (doc.clinicId) {
        setSelectedClinicId(doc.clinicId);
      } else if (doc.clinic) {
        const matchingClinic = clinics.find(c => 
          (c.name || '').toLowerCase() === doc.clinic.toLowerCase() ||
          (c.clinicName || '').toLowerCase() === doc.clinic.toLowerCase()
        );
        if (matchingClinic) {
          setSelectedClinicId(matchingClinic.id);
        }
      }
    }
  };

  if (!isOpen) return null;

  const targetDoctor = doctors.find(d => d.id === selectedDoctorId);
  const targetClinic = clinics.find(c => c.id === selectedClinicId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId && !selectedClinicId) {
      notifier.warning('Please select at least a target physician or clinic.');
      return;
    }

    const patientIds = (patients || []).map(p => p.id || p.objectID).filter(Boolean);
    if (patientIds.length === 0) {
      notifier.error('No patients selected for reassignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reassignPatientsPhysicianAction({
        patientIds,
        physicianId: targetDoctor?.id,
        physicianName: targetDoctor?.name || targetDoctor?.displayName || targetDoctor?.fullName,
        clinicId: targetClinic?.id,
        clinicName: targetClinic?.name || targetClinic?.clinicName,
        updatePrescriptions,
      });

      if (res?.success) {
        notifier.success(
          `Successfully reassigned ${res.count} patient${res.count > 1 ? 's' : ''} to ${targetDoctor?.name || targetClinic?.name || 'new doctor'}.`
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        notifier.error(res?.error || 'Reassignment failed');
      }
    } catch (err) {
      console.error('Reassignment error:', err);
      notifier.error(err.message || 'An error occurred during reassignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      padding: '1rem',
    }}>
      <div 
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Reassign Physician & Clinic
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Reassign {patients.length} patient{patients.length !== 1 ? 's' : ''} to another doctor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Selected Patients Summary */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Selected Patient{patients.length > 1 ? 's' : ''} ({patients.length})
              </label>
              <div style={{
                maxHeight: '110px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {patients.map((p, idx) => (
                  <div 
                    key={p.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #edf2f7',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <User size={14} color="#64748b" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unnamed Patient'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', flexShrink: 0, paddingLeft: '8px' }}>
                      Current: {p.physician || p.doctorName || 'Direct Desk'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Physician Select */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Stethoscope size={14} color="#003666" /> Target Attending Physician
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select Doctor...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.displayName || d.fullName} {d.specialty ? `(${d.specialty})` : ''} {d.clinic ? `• ${d.clinic}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Clinic Select */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Building2 size={14} color="#003666" /> Target Clinical Center
              </label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Auto-detected from Doctor or Select Clinic...</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.clinicName} {c.location ? `• ${c.location}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer Prescriptions Checkbox */}
            <div style={{
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <input
                type="checkbox"
                id="updateRxCheck"
                checked={updatePrescriptions}
                onChange={(e) => setUpdatePrescriptions(e.target.checked)}
                style={{
                  marginTop: '3px',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#2563eb',
                }}
              />
              <label htmlFor="updateRxCheck" style={{ fontSize: '0.80rem', color: '#1e40af', cursor: 'pointer', lineHeight: 1.4 }}>
                <strong>Transfer all associated prescriptions</strong>
                <div style={{ fontSize: '0.74rem', color: '#3b82f6', marginTop: '2px' }}>
                  Automatically update prescribing doctor and clinic on active and draft prescriptions linked to {patients.length > 1 ? 'these patients' : 'this patient'}.
                </div>
              </label>
            </div>

          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#f8fafc',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!selectedDoctorId && !selectedClinicId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#003666',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: isSubmitting || (!selectedDoctorId && !selectedClinicId) ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || (!selectedDoctorId && !selectedClinicId) ? 0.6 : 1,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Reassigning...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm Reassignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
