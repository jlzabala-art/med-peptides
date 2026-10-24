"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import Activity from "lucide-react/dist/esm/icons/activity";
import QrCode from "lucide-react/dist/esm/icons/qr-code";

import { fetchDoctorPrescriptionsAction } from '../../actions/prescriptionsActions';
import { fetchKPIsAction } from '../../actions/kpiActions';
import { RX_STATUS_META } from '../../config/prescriptionConfig';
import UniversalOrderBuilder from '../shared/order-builder/UniversalOrderBuilder';
import PatientAdherenceWidget from './PatientAdherenceWidget';
import ClinicalCommandHub from '../admin/widgets/ClinicalCommandHub';
import ClinicalDispensingLifecycleHub from './ClinicalDispensingLifecycleHub';
import QuickPatientDrawer from './QuickPatientDrawer';
import DoctorQrInviteModal from './modals/DoctorQrInviteModal';
import DoctorCuratedProductsSection from './overview/DoctorCuratedProductsSection';
import { Card, MetricCard, GcpActiveRecommender } from '../ui';
import Spinner from '../ui/Spinner';
import { useTranslation } from 'react-i18next';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import notifier from '../../services/NotificationService';
import DoctorSharedInfoWidget from './DoctorSharedInfoWidget';
import { DoctorCockpitHeader, DoctorKpiMetricsGrid, DoctorRecentActivityFeed } from './overview';
import CopyableId from '../ui/CopyableId';
import { DoctorContext } from '../../templates/DoctorDashboard';

export default function DoctorOverviewTab({ doctorId: propDoctorId, doctorMeta: propDoctorMeta, patients = [], onNavigate }) {
  const { t } = useTranslation();
  const context = React.useContext(DoctorContext) || {};
  const isSimulatingDrErdmann = context.isSimulatingDrErdmann || propDoctorId === 'dr-hanieh-erdmann';
  const doctorId = propDoctorId || context.doctorId || (isSimulatingDrErdmann ? 'dr-hanieh-erdmann' : '');
  const doctorMeta = propDoctorMeta || context.doctorMeta;

  const [showBuilder, setShowBuilder] = useState(false);
  const [patientCount, setPatientCount] = useState(0);
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [prefilledItems, setPrefilledItems] = useState(null);
  const [prefilledPatient, setPrefilledPatient] = useState(null);
  const builderRef = useRef(null);

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

  const drafts = prescriptions.filter(r => r.status === 'draft').length;
  const active = prescriptions.filter(r => ['sent', 'ordered', 'in_transit', 'assigned_to_wholesaler', 'added_to_bulk', 'active'].includes(r.status)).length || (isSimulatingDrErdmann ? 1 : 0);
  const fulfilled = prescriptions.filter(r => ['fulfilled', 'delivered'].includes(r.status)).length || (isSimulatingDrErdmann ? 1 : 0);
  const totalPatients = patients.length || (isSimulatingDrErdmann ? 1 : (kpis?.activePatients ?? patientCount));
  
  const isLoading = isLoadingPrescriptions || isLoadingKPIs;

  const handle1ClickPrescribe = (itemPayload) => {
    setPrefilledItems([itemPayload]);
    setShowBuilder(true);
    notifier.info(`Fórmula ${itemPayload.productName || itemPayload.name} lista para asignar paciente.`);
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStartPrescriptionWithPatient = (patient) => {
    setPrefilledPatient(patient);
    setShowBuilder(true);
    notifier.info(`Iniciando prescripción para ${patient.name || patient.firstName}.`);
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      {/* 🚀 GCP MEDICAL DIRECTOR COCKPIT & OPERATIONS HEADER */}
      <DoctorCockpitHeader
        doctorMeta={doctorMeta}
        isSimulatingDrErdmann={isSimulatingDrErdmann}
        doctorId={doctorId}
        showBuilder={showBuilder}
        setShowBuilder={setShowBuilder}
        onNavigate={onNavigate}
        onOpenQuickPatient={() => setIsQuickDrawerOpen(true)}
        onOpenQrInvite={() => setIsQrModalOpen(true)}
      />

      {/* 📊 CLINICAL COMMAND HUB WIDGET (Medical Director only, hidden in Dr. Erdmann simulation) */}
      {!isSimulatingDrErdmann && (
        <ClinicalCommandHub role="doctor" metrics={{ pendingPrescriptions: drafts, activePatients: totalPatients }} />
      )}

      {/* 📈 RESPONSIVE KPI METRICS GRID & SCOPE INDICATOR */}
      <DoctorKpiMetricsGrid
        isLoading={isLoading}
        active={active}
        drafts={drafts}
        fulfilled={fulfilled}
        totalPatients={totalPatients}
        isSimulatingDrErdmann={isSimulatingDrErdmann}
        onNavigate={onNavigate}
        t={t}
      />

      {/* 📋 INLINE PRESCRIPTION BUILDER FORM (when triggered) */}
      {showBuilder && (
        <div ref={builderRef}>
          <Card style={{ padding: '1.25rem', border: '2px solid #0d9488', boxShadow: '0 4px 20px rgba(13, 148, 136, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                    {t('doctor.overview.builder_form', 'Nueva Prescripción Médica')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {prefilledItems ? 'Fórmula preseleccionada desde el catálogo curado' : 'Genera órdenes personalizadas de péptidos o fórmulas magistrales'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setPrefilledItems(null);
                  setPrefilledPatient(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 800, padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
            <UniversalOrderBuilder
              mode="prescription"
              initialItems={prefilledItems}
              initialPatient={prefilledPatient}
              onSaved={() => {
                setShowBuilder(false);
                setPrefilledItems(null);
                setPrefilledPatient(null);
              }}
              onCanceled={() => {
                setShowBuilder(false);
                setPrefilledItems(null);
                setPrefilledPatient(null);
              }}
            />
          </Card>
        </div>
      )}

      {/* ⭐ FORMULARIO CLÍNICO CURADO POR ESPECIALIDAD MÉDICA */}
      <DoctorCuratedProductsSection
        doctorSpecialty={doctorMeta?.specialty || (isSimulatingDrErdmann ? 'German Board Certified Specialist Dermatologist & Trichologist' : 'Specialist Practice')}
        onQuickPrescribe={handle1ClickPrescribe}
        onOpenMonograph={(prod) => notifier.info(`Abriendo monografía de ${prod.name}`)}
      />

      {/* 🧬 UNIFIED CLINICAL & DISPENSING LIFECYCLE HUB (Prescriptions Timeline) */}
      <ClinicalDispensingLifecycleHub
        doctorId={doctorId || 'dr-hanieh-erdmann'}
        currentDoctor={doctorMeta}
      />

      {/* 🧬 PATIENT ADHERENCE WIDGET */}
      <PatientAdherenceWidget doctorId={doctorId} />

      {/* 🌿 SHARED INFO & AUTHORIZED FORMULARIES / PROTOCOLS */}
      <DoctorSharedInfoWidget
        compact={true}
        doctorId={doctorId}
        doctorName={doctorMeta?.name}
        onNavigate={onNavigate}
      />

      {/* ⚡ GCP CLINICAL AUDIT TRAIL & RECENT OPERATIONS FEED */}
      <DoctorRecentActivityFeed
        isSimulatingDrErdmann={isSimulatingDrErdmann}
        prescriptions={prescriptions}
      />

      {/* 🚀 QUICK PATIENT INTAKE SLIDE-OVER DRAWER */}
      <QuickPatientDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
        doctorId={doctorId || 'dr-hanieh-erdmann'}
        doctorName={doctorMeta?.name || 'Dr. Hanieh Erdmann'}
        onStartPrescriptionAfterCreate={handleStartPrescriptionWithPatient}
      />

      {/* 📲 QR & MAGIC LINK SELF-INTAKE MODAL */}
      <DoctorQrInviteModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        doctorId={doctorId || 'dr-hanieh-erdmann'}
        doctorName={doctorMeta?.name || 'Dr. Hanieh Erdmann'}
        clinicName={doctorMeta?.clinic || 'Bedaya Polyclinic L.L.C.'}
      />
    </div>
  );
}
