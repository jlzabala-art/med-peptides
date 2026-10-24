"use client";

import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Plus from "lucide-react/dist/esm/icons/plus";
import Send from "lucide-react/dist/esm/icons/send";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import BrainCircuit from "lucide-react/dist/esm/icons/brain-circuit";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import QrCode from "lucide-react/dist/esm/icons/qr-code";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
// eslint-disable-next-line no-restricted-imports
import { db } from '../../firebase';

import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import DoctorCuratedProductsSection from './overview/DoctorCuratedProductsSection';
import QuickPatientDrawer from './QuickPatientDrawer';
import DoctorQrInviteModal from './modals/DoctorQrInviteModal';
import UniversalOrderBuilder from '../shared/order-builder/UniversalOrderBuilder';

export default function DoctorRecommendationsTab({ doctorId, doctorMeta, patients = [] }) {
  const { activePermissions } = useAuth();
  const queryClient = useQueryClient();
  const clinicalLogs = activePermissions?.clinicalLogs ?? true;
  const [selectedPatient, setSelectedPatient] = useState('');
  const [form, setForm] = useState({ title: '', peptides: '', notes: '' });
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [builderPrefill, setBuilderPrefill] = useState(null);
  const [showOrderBuilder, setShowOrderBuilder] = useState(false);

  const activePatients = patients?.filter(p => p.status === 'active') || [];
  const selPatient = activePatients.find(p => p.id === selectedPatient);
  const selName = selPatient ? [selPatient.firstName, selPatient.lastName].filter(Boolean).join(' ') || selPatient.email : null;

  const { data: recs = [], isLoading: recLoading } = useQuery({
    queryKey: ['recommendations', doctorId, selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return [];
      const q = query(
        collection(db, 'recommendations'),
        where('doctorId', '==', doctorId),
        where('patientId', '==', selectedPatient)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      return list;
    },
    enabled: !!doctorId && !!selectedPatient,
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const peptidesArray = formData.peptides.split(',').map(p => p.trim()).filter(Boolean);
      await addDoc(collection(db, 'recommendations'), {
        doctorId,
        patientId: selectedPatient,
        userId: selectedPatient,
        title: formData.title.trim(),
        peptides: peptidesArray,
        notes: formData.notes.trim(),
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recommendations', doctorId, selectedPatient]);
      setForm({ title: '', peptides: '', notes: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !form.title.trim()) return;
    mutation.mutate(form);
  };

  const handleQuickPrescribe = (itemPayload) => {
    setBuilderPrefill(itemPayload);
    setShowOrderBuilder(true);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--color-bg-surface, #ffffff)',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* 🧬 SPECIALTY CURATED FORMULARY */}
      <DoctorCuratedProductsSection
        doctorSpecialty={doctorMeta?.specialty || 'Specialist Practice'}
        onQuickPrescribe={handleQuickPrescribe}
        onOpenMonograph={() => {}}
      />

      {/* INLINE PRESCRIPTION BUILDER IF TRIGGERED */}
      {showOrderBuilder && (
        <Card style={{ padding: '1.25rem', border: '2px solid #0d9488' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>Nueva Prescripción con Fórmula Seleccionada</span>
            <button onClick={() => setShowOrderBuilder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          </div>
          <UniversalOrderBuilder
            mode="prescription"
            initialItems={builderPrefill ? [builderPrefill] : null}
            onSaved={() => setShowOrderBuilder(false)}
            onCanceled={() => setShowOrderBuilder(false)}
          />
        </Card>
      )}

      {/* PATIENT RECOMMENDATION SECTION */}
      <Card style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recomendación Clínica Directa a Paciente
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Envía pautas personalizadas o notas clínicas directamente al expediente del paciente
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <QrCode size={14} color="#0d9488" />
              <span>QR Autoinscripción</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuickDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <UserPlus size={14} />
              <span>+ Alta Exprés</span>
            </button>
          </div>
        </div>

        {activePatients.length === 0 ? (
          <div
            style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: '#64748b' }}>
              Aún no tienes pacientes asignados en tu consulta. Da de alta al primero en 15 segundos o comparte tu enlace de autoinscripción.
            </p>
            <button
              type="button"
              onClick={() => setIsQuickDrawerOpen(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + Dar de Alta a Mi Primer Paciente (15s)
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Seleccionar Paciente de tu Consulta
              </label>
              <select
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                style={{ width: '100%', maxWidth: '480px', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
              >
                <option value=''>— Selecciona un paciente —</option>
                {activePatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {[p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || p.email}
                    {p.patientType === 'external_practice' ? ' (Consulta Propia)' : ' (Prescripción Activa)'}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Nueva Recomendación para {selName}
                  </div>
                  <input
                    placeholder="Título (Ej. Protocolo Reparación Tisular y Cuero Cabelludo)"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                  <input
                    placeholder="Péptidos / Fórmulas (Separados por coma, Ej. GHK-Cu 50mg, Zinc-Thymulin)"
                    value={form.peptides}
                    onChange={e => setForm(f => ({ ...f, peptides: e.target.value }))}
                    style={inputStyle}
                  />
                  <textarea
                    placeholder="Instrucciones de posología y notas clínicas para el paciente..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  />

                  {mutation.isError && <div style={{ color: '#dc2626', fontSize: '0.82rem' }}>{mutation.error.message}</div>}
                  {mutation.isSuccess && <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700 }}>✓ Recomendación guardada con éxito en el expediente del paciente.</div>}

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#0d9488',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                      alignSelf: 'flex-end',
                      fontSize: '0.82rem',
                    }}
                  >
                    {mutation.isPending ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                    <span>{mutation.isPending ? 'Guardando...' : 'Guardar Recomendación'}</span>
                  </button>
                </form>

                {/* Recommendation History */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem' }}>
                    Historial de Recomendaciones de este Paciente
                  </h4>
                  {recLoading ? (
                    <Spinner text="Cargando recomendaciones..." />
                  ) : recs.length === 0 ? (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                      No hay recomendaciones previas registradas para este paciente.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recs.map(rec => (
                        <div key={rec.id} style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{rec.title}</div>
                          {Array.isArray(rec.peptides) && rec.peptides.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '4px 0' }}>
                              {rec.peptides.map((pep, i) => (
                                <span key={i} style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#0284c7', fontSize: '0.72rem', fontWeight: 700 }}>
                                  {pep}
                                </span>
                              ))}
                            </div>
                          )}
                          {rec.notes && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>{rec.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* QUICK INTAKE DRAWER & QR MODAL */}
      <QuickPatientDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
        doctorId={doctorId || 'dr-hanieh-erdmann'}
        doctorName={doctorMeta?.name || 'Dr. Hanieh Erdmann'}
      />

      <DoctorQrInviteModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        doctorId={doctorId || 'dr-hanieh-erdmann'}
        doctorName={doctorMeta?.name || 'Dr. Hanieh Erdmann'}
        clinicName={doctorMeta?.clinic || 'Bedaya Polyclinic L.L.C.'}
      />
    </div>
  );
}
