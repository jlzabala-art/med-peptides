'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle,
  Pill,
  Stethoscope,
  Tag,
  ArrowRight
} from '@/lib/icons';
import { patientRepository } from '../../repositories/patientRepository';
import notifier from '../../services/NotificationService';
import { useQueryClient } from '@tanstack/react-query';

export default function QuickPatientDrawer({
  isOpen,
  onClose,
  doctorId,
  doctorName = 'Physician',
  onPatientCreated,
  onStartPrescriptionAfterCreate,
}) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'female',
    patientType: 'external_practice', // 'external_practice' | 'regenpept_rx'
    notes: '',
    primaryGoal: 'Hair & Scalp Health',
  });

  const QUICK_GOALS = [
    'Hair & Scalp Health',
    'Cellular Longevity',
    'Tissue & Joint Repair',
    'Weight & Metabolism',
    'Skin & Anti-Aging',
    'General Wellness',
  ];

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e, shouldPrescribeNow = false) => {
    if (e) e.preventDefault();

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!formData.firstName.trim()) {
      notifier.error('Por favor introduce al menos el nombre del paciente.');
      return;
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      notifier.error('Introduce al menos un teléfono (WhatsApp) o email de contacto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isRegenPeptRx = formData.patientType === 'regenpept_rx';
      const cleanPatientPayload = {
        name: fullName || 'Patient',
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        status: 'active',
        assignedDoctorId: doctorId || 'dr-hanieh-erdmann',
        doctorIds: [doctorId || 'dr-hanieh-erdmann'],
        prescribingDoctorName: doctorName,
        tags: [
          formData.patientType === 'regenpept_rx' ? 'Rx Active' : 'External Consultation',
          formData.primaryGoal,
        ],
        patientType: formData.patientType, // 'external_practice' | 'regenpept_rx'
        hasActivePrescription: isRegenPeptRx,
        clinicalGoals: [formData.primaryGoal],
        notes: formData.notes ? `[Consulta Inicial]: ${formData.notes.trim()}` : '',
        intakeSource: 'doctor_quick_intake',
      };

      const newPatientId = await patientRepository.createPatient(cleanPatientPayload, {
        actorId: doctorId || 'doctor',
        actorRole: 'doctor',
      });

      notifier.success(`Paciente ${fullName} registrado con éxito.`);

      // Invalidate relevant React Query caches
      queryClient.invalidateQueries({ queryKey: ['doctorPatients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      const createdPatient = {
        id: newPatientId,
        ...cleanPatientPayload,
      };

      if (onPatientCreated) {
        onPatientCreated(createdPatient);
      }

      if (shouldPrescribeNow && onStartPrescriptionAfterCreate) {
        onClose();
        onStartPrescriptionAfterCreate(createdPatient);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('[QuickPatientDrawer] Error creating patient:', err);
      notifier.error(err.message || 'Error al guardar paciente.');
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
        justifyContent: 'flex-end',
        animation: 'quickDrawerFadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes quickDrawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes quickDrawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .quick-patient-input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .quick-patient-input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 25px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'quickDrawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#ccfbf1',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Alta Exprés de Paciente
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                15 segundos • Para tu consulta propia o prescripción activa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={(e) => handleSubmit(e, false)}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Patient Relationship Scope Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Relación con el Paciente
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => handleChange('patientType', 'external_practice')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: formData.patientType === 'external_practice'
                    ? '2px solid #0d9488'
                    : '1px solid #e2e8f0',
                  backgroundColor: formData.patientType === 'external_practice'
                    ? '#f0fdf4'
                    : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope size={16} color={formData.patientType === 'external_practice' ? '#0d9488' : '#64748b'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: formData.patientType === 'external_practice' ? '#0d9488' : '#334155' }}>
                    Consulta Propia
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Tu paciente externo (sin pedidos en RegenPept por ahora).
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleChange('patientType', 'regenpept_rx')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: formData.patientType === 'regenpept_rx'
                    ? '2px solid #003666'
                    : '1px solid #e2e8f0',
                  backgroundColor: formData.patientType === 'regenpept_rx'
                    ? '#eff6ff'
                    : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Pill size={16} color={formData.patientType === 'regenpept_rx' ? '#003666' : '#64748b'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: formData.patientType === 'regenpept_rx' ? '#003666' : '#334155' }}>
                    Prescripción RegenPept
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Para preparar y dispensar recetas de péptidos o fórmulas.
                </span>
              </button>
            </div>
          </div>

          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Nombre *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Carlos"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="quick-patient-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Apellidos
              </label>
              <input
                type="text"
                placeholder="Ej. Méndez"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="quick-patient-input"
              />
            </div>
          </div>

          {/* Contact Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                WhatsApp / Teléfono *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="quick-patient-input"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Email (Opcional)
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="email"
                  placeholder="paciente@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="quick-patient-input"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>
          </div>

          {/* Demographics Row (Optional) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="quick-patient-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Género
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="quick-patient-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="other">Otro / No especificado</option>
              </select>
            </div>
          </div>

          {/* Objective / Quick Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Objetivo Principal de Salud
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {QUICK_GOALS.map((goal) => {
                const isSelected = formData.primaryGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleChange('primaryGoal', goal)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: isSelected ? '1px solid #0d9488' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#ccfbf1' : '#f8fafc',
                      color: isSelected ? '#0f766e' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Motivo de Consulta / Notas Rápidas
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Consulta por caída de cabello difusa post-estrés. Recomendar protocolo tricología."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, false)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle size={15} />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Paciente'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, true)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
              }}
            >
              <span>Guardar & Prescribir</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
