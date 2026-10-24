"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';
import PeptideCohortTable from './cohorts/PeptideCohortTable';
import SupplementsCohortTable from './cohorts/SupplementsCohortTable';
import GenomicsCohortTable from './cohorts/GenomicsCohortTable';
import QuickPatientDrawer from './QuickPatientDrawer';
import DoctorQrInviteModal from './modals/DoctorQrInviteModal';
import {
  Users,
  UserPlus,
  QrCode,
  Pill,
  Stethoscope,
  Sparkles,
  Dna,
  Filter
} from '@/lib/icons';

import { useRoleAccess } from '../../hooks/useRoleAccess';

export default function DoctorPatientsTab({ doctorId, doctorMeta, onStartPrescription }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCohort, setActiveCohort] = useState('all');
  const [patientScopeFilter, setPatientScopeFilter] = useState('all'); // 'all' | 'rx_active' | 'external'
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { is, role } = useRoleAccess();

  const isSimulation = searchParams.get('simulate') === 'dr-hanieh-erdmann' || doctorId === 'dr-hanieh-erdmann';
  const effectiveDocId = doctorId || 'dr-hanieh-erdmann';
  const effectiveDocName = doctorMeta?.name || 'Dr. Hanieh Erdmann';

  useEffect(() => {
    const urlCohort = searchParams.get('cohort');
    if (urlCohort && ['all', 'rx_active', 'external', 'peptides', 'supplements', 'genomics'].includes(urlCohort)) {
      setActiveCohort(urlCohort);
    }
  }, [searchParams]);

  const COHORT_TABS = [
    { id: 'all', fullLabel: '🌐 Todos los Pacientes', shortLabel: '🌐 Todos', color: '#003666' },
    { id: 'rx_active', fullLabel: '🧬 Con Prescripción Activa', shortLabel: '🧬 Prescripción', color: '#059669' },
    { id: 'external', fullLabel: '🩺 Solo Consulta Propia', shortLabel: '🩺 Consulta Propia', color: '#0d9488' },
    { id: 'peptides', fullLabel: '🧪 Cohorte Péptidos', shortLabel: '🧪 Péptidos', color: '#4338ca' },
    { id: 'supplements', fullLabel: '💊 Suplementación', shortLabel: '💊 Suplementos', color: '#7c3aed' },
  ];

  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <style>{`
        .gcp-cohort-tabs-wrapper {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          overflow-x: auto;
          padding: 0.35rem;
          background-color: #ffffff;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .gcp-cohort-tabs-wrapper::-webkit-scrollbar {
          display: none;
        }
        .gcp-cohort-tab-btn {
          padding: 0.45rem 0.85rem;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
          border: 1px solid transparent;
        }
        .gcp-cohort-tab-btn.is-active {
          background-color: #f0fdf4;
          color: #0d9488;
          border-color: #99f6e4;
          font-weight: 700;
        }
        .gcp-cohort-tab-btn:not(.is-active) {
          background-color: transparent;
          color: #64748b;
        }
        .gcp-cohort-tab-btn:not(.is-active):hover {
          background-color: #f8fafc;
          color: #1e293b;
        }
        @media (max-width: 768px) {
          .gcp-cohort-tabs-wrapper {
            padding: 0.25rem;
            gap: 0.25rem;
          }
          .gcp-cohort-tab-btn {
            padding: 0.35rem 0.65rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

      {/* Action Bar for Doctors: Fast Intake & QR link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '0.85rem 1.15rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
              Gestión Integral de Pacientes
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Pacientes con prescripciones activas o consultas privadas independientes
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '38px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <QrCode size={15} color="#0d9488" />
            <span>QR / Magic Link Autoinscripción</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQuickDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              minHeight: '38px',
              borderRadius: '8px',
              backgroundColor: '#0d9488',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <UserPlus size={16} />
            <span>+ Alta Exprés (15s)</span>
          </button>
        </div>
      </div>

      {/* Cohort & Scope View Switcher */}
      <div className="gcp-cohort-tabs-wrapper">
        {COHORT_TABS.map((tab) => {
          const isActive = activeCohort === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCohort(tab.id)}
              className={`gcp-cohort-tab-btn ${isActive ? 'is-active' : ''}`}
            >
              <span>{tab.fullLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Content based on Cohort */}
      {(activeCohort === 'all' || activeCohort === 'rx_active' || activeCohort === 'external') && (
        <UniversalPatientsTable
          doctorId={effectiveDocId}
          viewMode="doctor"
          title={
            activeCohort === 'rx_active'
              ? 'Pacientes con Prescripción Activa'
              : activeCohort === 'external'
              ? 'Pacientes en Consulta Propia'
              : 'Directorio Completo de Pacientes'
          }
          subtitle="Historial clínico, notas y estado de tratamientos activos o de consulta independiente."
          readOnly={false}
          scopeFilter={activeCohort}
        />
      )}

      {activeCohort === 'peptides' && <PeptideCohortTable doctorId={effectiveDocId} />}
      {activeCohort === 'supplements' && <SupplementsCohortTable doctorId={effectiveDocId} />}

      {/* Quick Intake Slide-Over Drawer */}
      <QuickPatientDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
        doctorId={effectiveDocId}
        doctorName={effectiveDocName}
        onStartPrescriptionAfterCreate={(newPatient) => {
          if (onStartPrescription) {
            onStartPrescription(newPatient);
          }
        }}
      />

      {/* QR & Magic Link Share Modal */}
      <DoctorQrInviteModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        doctorId={effectiveDocId}
        doctorName={effectiveDocName}
        clinicName={doctorMeta?.clinic || 'Bedaya Polyclinic L.L.C.'}
      />
    </div>
  );
}
