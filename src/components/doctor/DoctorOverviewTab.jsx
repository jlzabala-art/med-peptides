"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Plus from "lucide-react/dist/esm/icons/plus";
import Users from "lucide-react/dist/esm/icons/users";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Send from "lucide-react/dist/esm/icons/send";
import Package from "lucide-react/dist/esm/icons/package";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Pill from "lucide-react/dist/esm/icons/pill";
import Building from "lucide-react/dist/esm/icons/building";
import User from "lucide-react/dist/esm/icons/user";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Zap from "lucide-react/dist/esm/icons/zap";
import Award from "lucide-react/dist/esm/icons/award";

import { fetchDoctorPrescriptionsAction } from '../../actions/prescriptionsActions';
import { fetchKPIsAction } from '../../actions/kpiActions';
import { RX_STATUS_META } from '../../config/prescriptionConfig';
import UniversalOrderBuilder from '../shared/order-builder/UniversalOrderBuilder';
import PatientAdherenceWidget from './PatientAdherenceWidget';
import ClinicalCommandHub from '../admin/widgets/ClinicalCommandHub';
import ClinicalDispensingLifecycleHub from './ClinicalDispensingLifecycleHub';
import { Card, MetricCard } from '../ui';
import Spinner from '../ui/Spinner';
import { useTranslation } from 'react-i18next';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import notifier from '../../services/NotificationService';
import DoctorSharedInfoWidget from './DoctorSharedInfoWidget';

// Dynamic Widgets
import DraggableDashboard from '../widgets/core/DraggableDashboard';
import OrderTrackingWidget from '../widgets/logistics/OrderTrackingWidget';
import BillingInvoicesWidget from '../widgets/finance/BillingInvoicesWidget';
import PatientRosterWidget from '../widgets/clinical/PatientRosterWidget';
import ClinicalHistoryWidget from '../widgets/clinical/ClinicalHistoryWidget';

const AVAILABLE_WIDGETS = {
  OrderTracking: OrderTrackingWidget,
  BillingInvoices: BillingInvoicesWidget,
  PatientRoster: PatientRosterWidget,
  ClinicalHistory: ClinicalHistoryWidget,
};

const PIPELINE_STEPS = [
  { key: 'draft',                    label: 'Draft',       color: '#f59e0b', bg: '#fef9c3' },
  { key: 'sent',                     label: 'Sent',        color: 'var(--color-primary)', bg: '#dbeafe' },
  { key: 'assigned_to_wholesaler',   label: 'At WS',       color: '#6366f1', bg: '#ede9fe' },
  { key: 'added_to_bulk',            label: 'In Bulk',     color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'fulfilled',                label: 'Fulfilled',   color: 'var(--color-success)', bg: '#d1fae5' },
];

function RxRow({ rx }) {
  const { t } = useTranslation();
  const meta = RX_STATUS_META[rx.status] || RX_STATUS_META.draft;
  const isCorp = rx.type === 'clinic_supply';
  const date = rx.createdAt?.toDate ? rx.createdAt.toDate().toLocaleDateString() : '—';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '8px', margin: '4px 0' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: isCorp ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isCorp ? <Building size={16} color="#0284c7" /> : <User size={16} color="#475569" />}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {isCorp ? t('doctor.prescriptions_list.clinic_supply') : (rx.patient?.name || rx.patient?.email || t('doctor.prescriptions_list.patient'))}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
            {rx.items?.length || 0} {t('doctor.prescriptions_list.items')} • {date}
          </div>
        </div>
        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: `${meta.color}18`, color: meta.color, fontSize: '0.74rem', fontWeight: 800, flexShrink: 0 }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}

import { DoctorContext } from '../../templates/DoctorDashboard';

export default function DoctorOverviewTab({ doctorId: propDoctorId, doctorMeta: propDoctorMeta, patients = [], onNavigate }) {
  const { t } = useTranslation();
  const context = React.useContext(DoctorContext) || {};
  const isSimulatingDrErdmann = context.isSimulatingDrErdmann || propDoctorId === 'dr-hanieh-erdmann';
  const doctorId = propDoctorId || context.doctorId || (isSimulatingDrErdmann ? 'dr-hanieh-erdmann' : '');
  const doctorMeta = propDoctorMeta || context.doctorMeta;

  const [showBuilder, setShowBuilder] = useState(false);
  const [patientCount, setPatientCount] = useState(0);

  const { workspaces, activeWorkspaceId, setDrawerOpen } = useWorkspaceStore();
  const activeWs = workspaces[activeWorkspaceId] || Object.values(workspaces || {})[0];
  const wsItemsCount = (activeWs?.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

  useEffect(() => { setPatientCount(patients.length); }, [patients]);

  const { data: prescriptions = [], isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ['prescriptions', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      return await fetchDoctorPrescriptionsAction(doctorId);
    },
    enabled: !!doctorId
  });

  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['kpis', 'doctor', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      return await fetchKPIsAction('doctor', doctorId);
    },
    enabled: !!doctorId
  });

  const recent = prescriptions.slice(0, 5);
  
  const drafts = prescriptions.filter(r => r.status === 'draft').length;
  const active = prescriptions.filter(r => ['sent', 'ordered', 'in_transit', 'assigned_to_wholesaler', 'added_to_bulk', 'active'].includes(r.status)).length || (isSimulatingDrErdmann ? 1 : 0);
  const fulfilled = prescriptions.filter(r => ['fulfilled', 'delivered'].includes(r.status)).length || (isSimulatingDrErdmann ? 1 : 0);
  const totalPatients = patients.length || (isSimulatingDrErdmann ? 1 : (kpis?.activePatients ?? patientCount));
  
  const isLoading = isLoadingPrescriptions || isLoadingKPIs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* 🚀 MEDICAL DIRECTOR COMMAND CENTER HEADER & QUICK LAUNCH BAR */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(0, 54, 102, 0.95) 0%, rgba(0, 34, 68, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 54, 102, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                flexShrink: 0,
              }}
            >
              <Stethoscope size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em', color: '#ffffff' }}>
                {isSimulatingDrErdmann 
                  ? 'Dr. Hanieh Erdmann • Clinical Practice Cockpit' 
                  : (doctorMeta?.name ? `${doctorMeta.name} • Clinical Practice Cockpit` : 'Clinical Practice Cockpit')}
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 500 }}>
                {isSimulatingDrErdmann 
                  ? 'German Board Certified Specialist Dermatologist & Trichologist • Active Consultations' 
                  : (doctorMeta?.specialty ? `${doctorMeta.specialty} • Active Consultations` : 'Specialist Consultation & Active Peptide Therapies')}
              </span>
            </div>
          </div>

          {/* Quick Action: New Clinical Prescription */}
          <button
            type="button"
            onClick={() => setShowBuilder(!showBuilder)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              minHeight: '44px',
              borderRadius: '10px',
              backgroundColor: showBuilder ? '#ffffff' : '#38bdf8',
              color: showBuilder ? '#003666' : '#0f172a',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <Plus size={16} />
            <span>{showBuilder ? 'Close Rx Form' : 'New Prescription'}</span>
          </button>
        </div>

        {/* Quick Launch Clinical Action Chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-quick-create', { detail: { type: 'new-patient' } }));
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <UserPlus size={15} />
            <span>Intake Patient</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('catalog')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Pill size={15} />
            <span>Lotusland Formulary</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('protocols')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <FlaskConical size={15} />
            <span>Clinical Protocols</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('messages')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={15} />
            <span>Patient Inquiries</span>
          </button>
        </div>
      </div>

      {/* 📊 CLINICAL COMMAND HUB WIDGET (Medical Director only, hidden in Dr. Erdmann simulation to avoid mock triage) */}
      {!isSimulatingDrErdmann && (
        <ClinicalCommandHub role="doctor" metrics={{ pendingPrescriptions: drafts, activePatients: totalPatients }} />
      )}

      {/* ⚠️ PENDING DRAFTS ALERT BANNER */}
      {drafts > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)' }}>
          <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.92rem' }}>
              {drafts === 1 ? t('doctor.overview.drafts_banner', { count: drafts, defaultValue: 'You have 1 draft prescription awaiting signature' }) : t('doctor.overview.drafts_banner_plural', { count: drafts, defaultValue: `You have ${drafts} draft prescriptions awaiting signature` })}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px' }}>{t('doctor.overview.drafts_banner_desc', 'Review and sign to transmit to compounding pharmacy.')}</div>
          </div>
          <button
            onClick={() => onNavigate?.('prescriptions')}
            style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '7px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          >
            {t('doctor.overview.complete', 'Review Drafts')} <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 💎 EVOLUCIONA AL NIVEL AVANZADO PRO BANNER */}
      {!context.isProDoctor && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
            border: '1px solid #99f6e4',
            borderRadius: '14px',
            padding: '1.15rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '280px', flex: 1 }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>
                  Current Tier: 🟢 Basic Plan (Clinical Starter)
                </span>
                <span style={{ fontSize: '0.72rem', background: '#ccfbf1', color: '#042f2e', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  Dr. Hanieh Erdmann
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                Looking to upgrade to <strong>Advanced Pro</strong>? Unlock unlimited Atlas AI Clinical Scribe, white-label patient guides with your clinic branding, and automated WhatsApp refill alerts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onNavigate?.('membership')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                border: '1px solid #0d9488',
                background: '#ffffff',
                color: '#0f766e',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <FileText size={15} />
              <span>View Membership Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => context.openUpgradeModal?.()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9px',
                border: 'none',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
              }}
            >
              <Zap size={15} />
              <span>Upgrade to Pro ⚡</span>
            </button>
          </div>
        </div>
      )}

      {/* 📈 RESPONSIVE KPI METRIC CARDS GRID (2x2 on Mobile, 4x1 on Desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        <MetricCard title={t('doctor.overview.stats_active', 'Active Prescriptions')} value={isLoading ? '…' : active} subtitle={t('doctor.overview.stats_active_sub', 'Currently in dispensing')} icon={Send} color="#003666" onClick={() => onNavigate?.('prescriptions')} />
        <MetricCard title={t('doctor.overview.stats_drafts', 'Draft Prescriptions')} value={isLoading ? '…' : drafts} subtitle={t('doctor.overview.stats_drafts_sub', 'Awaiting signature')} icon={Clock} color="#d97706" alert={drafts > 0} onClick={() => onNavigate?.('prescriptions')} />
        <MetricCard title={t('doctor.overview.stats_fulfilled', 'Fulfilled Orders')} value={isLoading ? '…' : fulfilled} subtitle={t('doctor.overview.stats_fulfilled_sub', 'Delivered to patients')} icon={CheckCircle2} color="#16a34a" onClick={() => onNavigate?.('prescriptions')} />
        <MetricCard title={t('doctor.overview.stats_patients', 'Active Patients')} value={isLoading ? '…' : (totalPatients || '—')} subtitle={t('doctor.overview.stats_patients_sub', 'Under clinical care')} icon={Users} color="#7c3aed" onClick={() => onNavigate?.('patients')} />
      </div>

      {/* 🧬 UNIFIED CLINICAL & DISPENSING LIFECYCLE HUB */}
      <ClinicalDispensingLifecycleHub
        doctorId={doctorId || 'dr-hanieh-erdmann'}
        currentDoctor={doctorMeta}
      />

      {/* 🧬 PATIENT ADHERENCE WIDGET */}
      <PatientAdherenceWidget doctorId={doctorId} />

      {/* 📦 QUICK WORKFLOW CARDS (Rx Builder & Catalog Generator) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={20} color="#003666" />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {t('doctor.overview.new_rx', 'New Prescription')}
              </span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
              {t('doctor.overview.new_rx_desc', 'Create custom magistral compound prescriptions and clinical protocols.')}
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#003666', color: '#ffffff', border: 'none', padding: '0.65rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', width: 'fit-content' }}
          >
            <Plus size={16} /> {showBuilder ? t('doctor.overview.close_form', 'Close Form') : t('doctor.overview.create_rx', 'Create Prescription')}
          </button>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="#0d9488" />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {t('doctor.overview.catalogs', 'Lotusland Formulary')}
              </span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
              {t('doctor.overview.catalogs_desc', 'Browse verified Lotusland peptide preparations, dosages and compounds.')}
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('catalog')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.65rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', width: 'fit-content' }}
          >
            {t('doctor.overview.open_generator', 'View Formulary')} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 📋 INLINE PRESCRIPTION BUILDER FORM */}
      {showBuilder && (
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ClipboardList size={22} color="#003666" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{t('doctor.overview.builder_form', 'New Clinical Prescription')}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{t('doctor.overview.builder_form_desc', 'Generate patient-tailored peptide compound orders')}</div>
              </div>
            </div>
            <button onClick={() => setShowBuilder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 800 }}>✕</button>
          </div>
          <UniversalOrderBuilder mode='prescription' onSaved={() => setShowBuilder(false)} onCanceled={() => setShowBuilder(false)} />
        </Card>
      )}

      {/* 🌿 SHARED INFO & AUTHORIZED FORMULARIES / PROTOCOLS */}
      <DoctorSharedInfoWidget
        compact={true}
        doctorId={doctorId}
        doctorName={doctorMeta?.name}
        onNavigate={onNavigate}
      />

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