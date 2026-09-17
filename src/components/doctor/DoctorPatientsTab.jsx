"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';
import PeptideCohortTable from './cohorts/PeptideCohortTable';
import SupplementsCohortTable from './cohorts/SupplementsCohortTable';
import GenomicsCohortTable from './cohorts/GenomicsCohortTable';
import Breadcrumb from '../ui/Breadcrumb';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Users from 'lucide-react/dist/esm/icons/users';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Pill from 'lucide-react/dist/esm/icons/pill';
import Dna from 'lucide-react/dist/esm/icons/dna';

import { useRoleAccess } from '../../hooks/useRoleAccess';

export default function DoctorPatientsTab({ doctorId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCohort, setActiveCohort] = useState('all');
  const { is, role } = useRoleAccess();

  // Strict clinical isolation (HIPAA / Patient Confidentiality):
  // When in Doctor portal, patient records are strictly isolated to the active physician.
  // Never leak patients belonging to other doctors.
  const isSimulation = searchParams.get('simulate') === 'dr-hanieh-erdmann' || doctorId === 'dr-hanieh-erdmann';
  const effectiveDocId = doctorId || 'dr-hanieh-erdmann';

  useEffect(() => {
    const urlCohort = searchParams.get('cohort');
    if (urlCohort && ['all', 'peptides', 'supplements', 'genomics'].includes(urlCohort)) {
      setActiveCohort(urlCohort);
    }
  }, [searchParams]);

  const COHORT_TABS = [
    { id: 'all', fullLabel: '🌐 All Patients', shortLabel: '🌐 All', color: '#003666' },
    { id: 'peptides', fullLabel: '🧬 Peptides Cohort', shortLabel: '🧬 Peptides', color: '#059669' },
    { id: 'supplements', fullLabel: '💊 Supplements Cohort', shortLabel: '💊 Supplements', color: '#7c3aed' },
    { id: 'genomics', fullLabel: '🧪 Fagron Genomics', shortLabel: '🧪 Genomics', color: '#2563eb' },
  ];

  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <style>{`
        .gcp-cohort-tabs-wrapper {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          overflow-x: auto;
          padding: 0.25rem 0.35rem;
          background-color: #ffffff;
          border-radius: 8px;
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

      {/* Cohort View Switcher Navigation Bar (GCP Resource Tabs) */}
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
              {tab.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? tab.color : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cohort Specific Content */}
      {activeCohort === 'all' && (
        <UniversalPatientsTable
          doctorId={effectiveDocId}
          viewMode="doctor"
          title="Assigned Patients"
          subtitle="Centralized directory of patients under your direct medical care."
          readOnly={false}
        />
      )}

      {activeCohort === 'peptides' && <PeptideCohortTable doctorId={effectiveDocId} />}
      {activeCohort === 'supplements' && <SupplementsCohortTable doctorId={effectiveDocId} />}
      {activeCohort === 'genomics' && <GenomicsCohortTable doctorId={effectiveDocId} />}
    </div>
  );
}
