'use client';

import React from 'react';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Users from 'lucide-react/dist/esm/icons/users';
import CopyableId from '../../ui/CopyableId';

export default function DoctorRecentActivityFeed({
  isSimulatingDrErdmann,
  prescriptions = [],
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ⚡ GCP CLINICAL AUDIT TRAIL & RECENT OPERATIONS FEED */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#003666" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Real-time Clinical Operations & Audit Feed
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            ● Telemetry Live
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>
                RX ISSUED
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Prescription <CopyableId value={isSimulatingDrErdmann ? 'RX-BEDAYA-260915-11774' : (prescriptions[0]?.id || 'RX-RECENT-01')} />
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                for {isSimulatingDrErdmann ? 'Matin Rahim Delavar Rafiei' : (prescriptions[0]?.patientName || 'Patient')}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Today, 10:15 AM</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px' }}>
                FORMULARY SYNC
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Lotusland Compounding Formulary v2026.9
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Verified by Medical Director
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Yesterday</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>
                COLD CHAIN
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Temperature Log 3.8°C (Compliant: 2-8°C)
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Insulated Express Delivery
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>14 Sep 2026</span>
          </div>
        </div>
      </div>

      {/* 👥 VERIFIED ACTIVE PATIENT DOSSIER & PRESCRIPTION SUMMARY */}
      {isSimulatingDrErdmann && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#003666" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Assigned Patient Clinical Record
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              Verified In Bedaya Polyclinic
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Patient Name</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Matin Rahim Delavar Rafiei</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>Female • DOB: 1984-06-15 (42 yrs)</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Medical File & Clinic</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', marginTop: '2px' }}>PIN: 11774</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>Bedaya Polyclinic L.L.C. (Dubai)</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active Prescription</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>RX-BEDAYA-260915-11774</div>
              <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>Latanoprost + 17-α-Estradiol + IGrantine-F1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
