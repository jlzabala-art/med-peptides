"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import UniversalPrescriptionsTable from '../shared/UniversalPrescriptionsTable';
import UniversalOrderBuilder from '../shared/order-builder/UniversalOrderBuilder';
import PageHeader from '../ui/PageHeader';
import { Pill, FilePlus } from 'lucide-react';

/**
 * DoctorPrescriptionsTab
 * 
 * Supports both:
 * 1. New Prescription Creator view (initialBuilderOpen = true or hideHistory = true)
 *    directly embedding the UniversalOrderBuilder with doctor context pre-filled.
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
