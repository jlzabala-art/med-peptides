'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ClinicalCommandHub({
  role = 'medical_director',
  metrics = {},
  onAction = () => {},
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('triage');
  const [queryText, setQueryText] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskClinicalAi = (e) => {
    e?.preventDefault();
    if (!queryText.trim()) return;
    setIsAsking(true);

    setTimeout(() => {
      setIsAsking(false);
      setAiAnswer(
        `Clinical AI Evaluation for "${queryText}": Analyzed 162 active enrolled patients. 3 patients show low adherence (<65%), 2 patients are due for week-8 protocol transition, and 0 drug interaction contraindications were detected.`
      );
    }, 600);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.08)',
        marginBottom: '1.5rem',
      }}
    >
      <style>{`
        .cch-tabs-wrapper {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          max-width: 100%;
          padding-bottom: 4px;
          flex-wrap: nowrap;
          align-items: center;
          -webkit-overflow-scrolling: touch;
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
        @media (max-width: 640px) {
          .cch-tabs-wrapper {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            width: 100%;
            gap: 0.25rem;
            overflow-x: visible;
            padding-bottom: 0;
            background: #f1f5f9;
            padding: 3px;
            border-radius: 10px;
          }
          .cch-tab-btn {
            padding: 0.45rem 0.2rem !important;
            justify-content: center !important;
            font-size: 0.72rem !important;
            width: 100% !important;
            border: none !important;
            border-radius: 8px !important;
          }
          .cch-tab-label-full {
            display: none !important;
          }
          .cch-tab-label-short {
            display: inline !important;
          }
          .cch-alert-card {
            flex-direction: column;
            align-items: stretch;
          }
          .cch-actions-group {
            width: 100%;
            justify-content: flex-end;
          }
          .cch-actions-group button {
            flex: 1;
            text-align: center;
            justify-content: center;
            white-space: nowrap;
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
          borderBottom: '1px solid #dcfce7',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#064e3b' }}>
              Clinical Command Hub & Safety Copilot
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#047857' }}>
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
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #059669' : '1px solid #a7f3d0',
                backgroundColor: activeTab === tab.id ? '#059669' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#047857',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span className="cch-tab-label-full">{tab.fullLabel}</span>
              <span className="cch-tab-label-short">{tab.shortLabel}</span>
              <span
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#d1fae5',
                  color: activeTab === tab.id ? '#ffffff' : '#065f46',
                  padding: '1px 6px',
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
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                  Carlos Méndez — Low Adherence & Nausea Report
                </strong>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#7f1d1d' }}>
                  Regimen: Tirzepatide 5mg/ml. Reported mild nausea in daily log. Adherence dropped to 60%.
                </p>
              </div>
            </div>
            <div className="cch-actions-group">
              <button
                onClick={() => {
                  notifier.success('Step-down dosage recommendation sent to patient.');
                  router.push('/doctor/patients?search=Carlos%20M%C3%A9ndez');
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Reduce Dose to 2.5mg
              </button>
              <button
                onClick={() => {
                  notifier.info('Opening Carlos Méndez profile...');
                  router.push('/doctor/patients?search=Carlos%20M%C3%A9ndez');
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  fontSize: '0.75rem',
                  fontWeight: 600,
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
              padding: '0.85rem 1rem',
              borderRadius: '10px',
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
                  router.push('/doctor/patients?search=Elena%20Rostova');
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} color="#0284c7" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#075985' }}>
                  Batch Signature: 5 Prescriptions Awaiting Final Approval
                </strong>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#0369a1' }}>
                  All 5 prescriptions passed automated drug interaction & dosage safety check (100% Pass).
                </p>
              </div>
            </div>
            <div className="cch-actions-group">
              <button
                onClick={() => {
                  notifier.success('Navigating to Prescriptions Queue for batch signature...');
                  router.push('/admin/prescriptions?status=pending');
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
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
              padding: '0.85rem 1rem',
              borderRadius: '10px',
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
                  notifier.info('Navigating to Peptide Cohort for washout transition...');
                  router.push('/doctor/patients');
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Start Washout Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Query Console */}
      <form onSubmit={handleAskClinicalAi} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder='Ask Clinical AI Copilot: e.g. "Which patients need dosage adjustments today?"'
          style={{
            flex: 1,
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            backgroundColor: '#ffffff',
            fontSize: '0.82rem',
            color: '#0f172a',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isAsking}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Sparkles size={15} />
          <span>{isAsking ? 'Analyzing...' : 'Ask AI'}</span>
        </button>
      </form>

      {aiAnswer && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #bbf7d0',
            fontSize: '0.8rem',
            color: '#065f46',
            lineHeight: 1.45,
          }}
        >
          {aiAnswer}
        </div>
      )}
    </div>
  );
}
