'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Activity from 'lucide-react/dist/esm/icons/activity';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Send from 'lucide-react/dist/esm/icons/send';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Pill from 'lucide-react/dist/esm/icons/pill';
import notifier from '../../../services/NotificationService';
import { useDrawer } from '../../../context/DrawerContext';

export default function ClinicalCommandHub({
  role = 'medical_director',
  metrics = {},
  onAction = () => {},
}) {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const pathname = usePathname() || '';
  const isDoctorPortal = pathname.startsWith('/doctor') || role === 'doctor' || role === 'medical_director';
  const portal = isDoctorPortal ? '/doctor' : '/admin';

  const [activeTab, setActiveTab] = useState('triage');

  // Quick Dosage Adjustment Modal State
  const [doseModalOpen, setDoseModalOpen] = useState(false);
  const [dosageAdjusted, setDosageAdjusted] = useState(false);
  const [selectedDose, setSelectedDose] = useState('2.5mg');

  return (
    <div
      className="cch-container"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px -2px rgba(148, 163, 184, 0.08)',
        marginBottom: '1.5rem',
      }}
    >
      <style>{`
        .cch-container {
          box-sizing: border-box;
          width: 100%;
        }
        .cch-tabs-wrapper {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          max-width: 100%;
          padding-bottom: 4px;
          flex-wrap: nowrap;
          align-items: center;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .cch-tabs-wrapper::-webkit-scrollbar {
          display: none;
        }
        .cch-alert-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .cch-actions-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .cch-tab-label-full {
          display: inline;
          white-space: nowrap;
        }
        .cch-tab-label-short {
          display: none;
          white-space: nowrap;
        }
        .cch-ai-input-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 4px 6px 4px 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          width: 100%;
        }
        .cch-ai-input-container:focus-within {
          border-color: #003666;
          box-shadow: 0 0 0 3px rgba(0, 54, 102, 0.1);
        }
        .cch-ai-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 0.82rem;
          color: #0f172a;
          background: transparent;
          padding: 8px 0;
          box-sizing: border-box;
        }
        .cch-ai-submit-btn {
          padding: 0.5rem 1.15rem;
          min-height: 38px;
          border-radius: 9px;
          background-color: #003666;
          color: #ffffff;
          border: none;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          box-shadow: 0 2px 6px rgba(0, 54, 102, 0.2);
          transition: background-color 0.15s ease, transform 0.1s ease;
        }
        .cch-ai-submit-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 640px) {
          .cch-container {
            padding: 1rem !important;
            border-radius: 14px !important;
          }
          .cch-tabs-wrapper {
            display: flex !important;
            gap: 0.4rem !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            padding: 3px 2px 6px 2px !important;
            margin-top: 0.4rem !important;
          }
          .cch-tab-btn {
            flex-shrink: 0 !important;
            padding: 0.45rem 0.8rem !important;
            font-size: 0.78rem !important;
            border-radius: 20px !important;
            min-height: 38px !important;
            white-space: nowrap !important;
          }
          .cch-tab-label-full {
            display: none !important;
          }
          .cch-tab-label-short {
            display: inline !important;
          }
          .cch-alert-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 0.85rem 0.95rem !important;
          }
          .cch-actions-group {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 0.5rem !important;
            margin-top: 0.65rem !important;
          }
          .cch-actions-group button {
            width: 100% !important;
            min-height: 44px !important;
            text-align: center !important;
            justify-content: center !important;
            white-space: normal !important;
            font-size: 0.82rem !important;
            font-weight: 700 !important;
            padding: 0.6rem 1rem !important;
            box-sizing: border-box !important;
          }
          .cch-ai-input-container {
            padding: 3px 5px 3px 10px !important;
          }
          .cch-ai-submit-btn {
            padding: 0.45rem 0.85rem !important;
            font-size: 0.78rem !important;
          }
        }
      `}</style>

      {/* Header & Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              boxShadow: '0 2px 8px rgba(0, 54, 102, 0.15)',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Clinical Command Hub & Safety Copilot
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Real-time patient triage, prescription queue & dosage intelligence
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="cch-tabs-wrapper">
          {[
            { id: 'triage', fullLabel: '🔴 Patient Triage & Alerts', shortLabel: '🔴 Triage', count: 3 },
            { id: 'signatures', fullLabel: '✍️ Rx Signatures Pending', shortLabel: '✍️ Signatures', count: metrics.pendingPrescriptions || 13 },
            { id: 'lifecycle', fullLabel: '🔄 Protocol End Cycles', shortLabel: '🔄 End Cycles', count: 4 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="cch-tab-btn"
              style={{
                padding: '0.5rem 0.95rem',
                minHeight: '40px',
                borderRadius: '9px',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#003666' : '#cbd5e1',
                backgroundColor: activeTab === tab.id ? '#003666' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#334155',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0,54,102,0.15)' : 'none',
              }}
            >
              <span className="cch-tab-label-full">{tab.fullLabel}</span>
              <span className="cch-tab-label-short">{tab.shortLabel}</span>
              <span
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.22)' : '#e2e8f0',
                  color: activeTab === tab.id ? '#ffffff' : '#0f172a',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'triage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            className="cch-alert-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                    Carlos Méndez — Low Adherence & Nausea Report
                  </strong>
                  {dosageAdjusted && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 7px', borderRadius: '12px' }}>
                      ✔️ Dosage reduced to {selectedDose}/ml
                    </span>
                  )}
                </div>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#7f1d1d' }}>
                  Regimen: Tirzepatide {dosageAdjusted ? selectedDose : '5mg'}/ml. Reported mild nausea in daily log. Adherence dropped to 60%.
                </p>
              </div>
            </div>
            <div className="cch-actions-group">
              <button
                onClick={() => {
                  setDoseModalOpen(true);
                }}
                style={{
                  padding: '0.55rem 0.95rem',
                  minHeight: '40px',
                  borderRadius: '8px',
                  backgroundColor: dosageAdjusted ? '#16a34a' : '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: dosageAdjusted ? '0 2px 4px rgba(22, 163, 74, 0.2)' : '0 2px 4px rgba(220, 38, 38, 0.2)',
                }}
              >
                {dosageAdjusted ? `✔️ Dosage Adjusted (${selectedDose})` : 'Reduce Dose to 2.5mg'}
              </button>
              <button
                onClick={() => {
                  notifier.info('Opening Carlos Méndez profile...');
                  openDrawer('patient', 'pat-1', {
                    initialTab: 'overview',
                    patient: {
                      id: 'pat-1',
                      name: 'Carlos Méndez',
                      email: 'carlos.mendez@example.com',
                      status: 'active',
                      physician: 'Dr. Atlas Medical',
                      physicianId: 'doc-atlas',
                      activeProtocols: 2,
                      lastVisit: '2026-09-02',
                      healthGoals: ['Longevity', 'Metabolic Wellness'],
                      riskLevel: 'low',
                      allergies: ['Penicillin'],
                      clinic: 'Elite Longevity Clinic',
                    },
                  });
                }}
                style={{
                  padding: '0.55rem 0.95rem',
                  minHeight: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                View Patient
              </button>
            </div>
          </div>

          <div
            className="cch-alert-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>
                  Elena Rostova — New Blood Lab Results Ready for Review
                </strong>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#78350f' }}>
                  IGF-1 & HbA1c panel uploaded. Biomarkers show 18% improvement post-Semaglutide 12w cycle.
                </p>
              </div>
            </div>
            <div className="cch-actions-group">
              <button
                onClick={() => {
                  notifier.info('Opening Elena Rostova biomarkers...');
                  openDrawer('patient', 'pat-2', {
                    initialTab: 'biomarkers',
                    patient: {
                      id: 'pat-2',
                      name: 'Elena Rostova',
                      email: 'elena.rostova@example.com',
                      status: 'active',
                      physician: 'Dr. Atlas Medical',
                      physicianId: 'doc-atlas',
                      activeProtocols: 1,
                      lastVisit: '2026-09-01',
                      healthGoals: ['Tissue Repair', 'Peptide Cycle'],
                      riskLevel: 'moderate',
                      allergies: ['None'],
                      clinic: 'Elite Longevity Clinic',
                    },
                  });
                }}
                style={{
                  padding: '0.55rem 0.95rem',
                  minHeight: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)',
                }}
              >
                Review Biomarkers
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'signatures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            className="cch-alert-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} color="#2563eb" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                  Batch Signature: 5 Prescriptions Awaiting Final Approval
                </strong>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#1d4ed8' }}>
                  All 5 prescriptions passed automated drug interaction & dosage safety check (100% Pass).
                </p>
              </div>
            </div>
            <div className="cch-actions-group">
              <button
                onClick={() => {
                  notifier.success('Navigating to Prescriptions Queue for batch signature...');
                  router.push(`${portal}/prescriptions?status=pending`);
                }}
                style={{
                  padding: '0.55rem 0.95rem',
                  minHeight: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                }}
              >
                <CheckCircle2 size={14} />
                <span>Approve & Sign All (5)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lifecycle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            className="cch-alert-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Pill size={20} color="#7c3aed" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#5b21b6' }}>
                  Protocol End Cycle: 4 Patients Completing Week 8 Today
                </strong>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#6d28d9' }}>
                  BPC-157 / TB-500 protocol completion. Recommended 4-week washout period before cycle 2.
                </p>
              </div>
            </div>
            <div className="cch-actions-group">
              <button
                onClick={() => {
                  notifier.info('Navigating to Patients with end-of-cycle protocols...');
                  router.push(`${portal}/protocols?status=active&filter=end_cycle`);
                }}
                style={{
                  padding: '0.55rem 0.95rem',
                  minHeight: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)',
                }}
              >
                Start Washout Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Dosage Adjustment Modal */}
      {doseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            boxSizing: 'border-box',
          }}
          onClick={() => setDoseModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.35rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <Pill size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>Adjust Treatment Dosage</h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Carlos Méndez (ID: CM-8924)</span>
                </div>
              </div>
              <button onClick={() => setDoseModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#64748b' }}>Current Regimen:</span>
                <strong>Tirzepatide 5.0 mg/ml</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#64748b' }}>Alert Reason:</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Grade 2 Nausea / 60% Adherence</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>AI Recommended Dose:</span>
                <strong style={{ color: '#16a34a' }}>2.5 mg/ml (-50% step-down)</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Select target concentration:
              </label>
              <select 
                value={selectedDose} 
                onChange={(e) => setSelectedDose(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: '#fff' }}
              >
                <option value="2.5mg">2.5 mg/ml (AI Recommended Reduction)</option>
                <option value="1.25mg">1.25 mg/ml (Starting / Minimum Dose)</option>
                <option value="3.75mg">3.75 mg/ml (Mild Step-Down)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setDosageAdjusted(true);
                  setDoseModalOpen(false);
                  notifier.success(`Dosage for Carlos Méndez successfully reduced to ${selectedDose}/ml.`);
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  minHeight: '44px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                }}
              >
                ✔️ Confirm & Apply Reduction to {selectedDose}
              </button>

              <button
                onClick={() => {
                  setDoseModalOpen(false);
                  router.push(`${portal}/patients?search=Carlos%20M%C3%A9ndez&openDetail=true`);
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem',
                  minHeight: '40px',
                  backgroundColor: '#ffffff',
                  color: '#003666',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                View Full Patient Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
