"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import UniversalPrescriptionsTable from '../shared/UniversalPrescriptionsTable';
import UniversalOrderBuilder from '../shared/order-builder/UniversalOrderBuilder';
import Breadcrumb from '../ui/Breadcrumb';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <Breadcrumb items={[
            { label: '🏠 Doctor Overview', href: '/doctor' },
            { label: '💊 Prescriptions History', href: '/doctor/prescriptions-history' },
            { label: '✨ New Prescription' }
          ]} />
          <button
            onClick={() => router.push('/doctor/prescriptions-history')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Cancel & View History
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
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
      />
    </div>
  );
}
