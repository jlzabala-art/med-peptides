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

export default function DoctorPatientsTab({ doctorId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCohort, setActiveCohort] = useState('all');

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
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Quick Return to Overview Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <Breadcrumb items={[
          { label: '🏠 Doctor Overview', href: '/doctor' },
          { label: '👥 Patient Management' }
        ]} />
        <button
          onClick={() => router.push('/doctor')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            backgroundColor: '#003666',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <ArrowLeft size={16} />
          <span>Doctor Dashboard</span>
        </button>
      </div>
      <style>{`
        .cohort-switcher-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.4rem 0.5rem;
          background-color: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          -webkit-overflow-scrolling: touch;
        }
        .cohort-tab-btn {
          padding: 0.55rem 0.9rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }
        .cohort-label-full { display: inline; white-space: nowrap; }
        .cohort-label-short { display: none; white-space: nowrap; }

        @media (max-width: 640px) {
          .cohort-switcher-bar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.4rem;
            padding: 0.5rem;
            overflow-x: visible;
          }
          .cohort-tab-btn {
            width: 100%;
            justify-content: center;
            padding: 0.55rem 0.35rem;
            font-size: 0.75rem;
            box-sizing: border-box;
          }
          .cohort-label-full { display: none !important; }
          .cohort-label-short { display: inline !important; }
        }
      `}</style>

      {/* Cohort View Switcher Navigation Bar */}
      <div className="cohort-switcher-bar">
        {COHORT_TABS.map((tab) => {
          const isActive = activeCohort === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCohort(tab.id)}
              className="cohort-tab-btn"
              style={{
                border: isActive ? `1.5px solid ${tab.color}` : '1px solid #cbd5e1',
                backgroundColor: isActive ? `${tab.color}12` : '#ffffff',
                color: isActive ? tab.color : '#475569',
              }}
            >
              <span className="cohort-label-full">{tab.fullLabel}</span>
              <span className="cohort-label-short">{tab.shortLabel}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? tab.color : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#475569',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    marginLeft: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '20px',
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
          doctorId={doctorId}
          viewMode="doctor"
          title="All Assigned Patients"
          subtitle="Centralized directory for managing all patient accounts."
          readOnly={false}
        />
      )}

      {activeCohort === 'peptides' && <PeptideCohortTable doctorId={doctorId} />}
      {activeCohort === 'supplements' && <SupplementsCohortTable doctorId={doctorId} />}
      {activeCohort === 'genomics' && <GenomicsCohortTable doctorId={doctorId} />}
    </div>
  );
}
