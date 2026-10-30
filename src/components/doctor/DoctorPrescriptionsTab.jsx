"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UniversalPrescriptionsTable from '../shared/UniversalPrescriptionsTable';
import UniversalOrderBuilder from '../shared/order-builder/UniversalOrderBuilder';
import PageHeader from '../ui/PageHeader';
import { Pill, FilePlus, FlaskConical, Sparkles } from 'lucide-react';
import CompoundingPage from '../../templates/CompoundingPage';

/**
 * DoctorPrescriptionsTab
 * 
 * Supports:
 * 1. New Prescription Creator view with 2 Google Cloud Options:
 *    a) Standard / AI Extractor Prescriptions (UniversalOrderBuilder)
 *    b) Custom Compounding Lab in Vegan HPMC Capsules (CompoundingPage & 24Genetics DNA Fine-Tuning)
 * 2. Prescriptions History table view (initialBuilderOpen = false)
 */
export default function DoctorPrescriptionsTab({
  doctorId,
  doctorMeta,
  patients,
  initialBuilderOpen = false,
  hideHistory = false,
  onSavedRedirect
}) {
  const router = useRouter();
  const [creationMode, setCreationMode] = useState('builder'); // 'builder' | 'compounding'

  if (hideHistory || initialBuilderOpen) {
    return (
      <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <PageHeader
          title="New Prescription Formulation"
          subtitle="Compounding protocol formulation, magistral dosing, and direct pharmacy transmission."
          icon={FilePlus}
          panel="doctor"
          breadcrumbs={[
            { label: '🏠 Doctor Overview', href: '/doctor' },
            { label: '💊 Prescriptions History', href: '/doctor/prescriptions-history' },
            { label: '✨ New Prescription' }
          ]}
          actions={
            <button
              onClick={() => router.push('/doctor/prescriptions-history')}
              className="gcp-btn-secondary"
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Cancel & View History
            </button>
          }
        />

        {/* ── 2-Option Creation Selector (Google Cloud UX) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '4px'
        }}>
          <button
            type="button"
            onClick={() => setCreationMode('builder')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '10px',
              border: creationMode === 'builder' ? '2px solid #0d9488' : '1px solid #e2e8f0',
              background: creationMode === 'builder' ? '#f0fdfa' : '#ffffff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              background: creationMode === 'builder' ? '#ccfbf1' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488',
              flexShrink: 0
            }}>
              <FilePlus size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                1. Prescripción Estándar / IA
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Importar PDF, escanear o formular con catálogo clínico general
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCreationMode('compounding')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '10px',
              border: creationMode === 'compounding' ? '2px solid #0d9488' : '1px solid #e2e8f0',
              background: creationMode === 'compounding' ? '#f0fdfa' : '#ffffff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              background: creationMode === 'compounding' ? '#ccfbf1' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488',
              flexShrink: 0
            }}>
              <FlaskConical size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                2. Formulación Magistral en Cápsulas
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                118 activos Ph. Eur., calibración galénica HPMC y ADN 24Genetics
              </div>
            </div>
          </button>
        </div>

        {creationMode === 'builder' ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <UniversalOrderBuilder
              mode="prescription"
              sourceModule="doctor-portal"
              initialDoctor={doctorMeta ? { id: doctorId, name: doctorMeta.doctorName || doctorMeta.displayName } : (doctorId ? { id: doctorId } : null)}
              initialDoctorId={doctorId}
              initialDoctorName={doctorMeta?.doctorName || doctorMeta?.displayName}
              onSaved={() => {
                if (onSavedRedirect) onSavedRedirect();
                else router.push('/doctor/prescriptions-history');
              }}
              onCanceled={() => {
                router.push('/doctor/prescriptions-history');
              }}
            />
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <CompoundingPage
              embedded={true}
              initialLang="en"
              doctorId={doctorId}
              doctorMeta={doctorMeta}
              patients={patients}
              onPrescriptionIssued={(rxCode) => {
                if (onSavedRedirect) onSavedRedirect();
                else router.push('/doctor/prescriptions-history');
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)' }}>
      <UniversalPrescriptionsTable 
        doctorId={doctorId} 
        viewMode="doctor" 
        title="My Prescriptions"
        subtitle="Manage and track the prescriptions you have issued to your patients."
        breadcrumbs={[
          { label: '🏠 Doctor Overview', href: '/doctor' },
          { label: '💊 Prescriptions' }
        ]}
      />
    </div>
  );
}
