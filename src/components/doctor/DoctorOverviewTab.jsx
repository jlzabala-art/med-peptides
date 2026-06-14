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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';













import { RX_STATUS_META } from '../../config/prescriptionConfig';
import DoctorPrescriptionBuilder from './DoctorPrescriptionBuilder';
import ClinicalCopilotWidget from './ClinicalCopilotWidget';
import PatientAdherenceWidget from './PatientAdherenceWidget';
import { Card, MetricCard } from '../ui';
import Spinner from '../ui/Spinner';
import { useTranslation } from 'react-i18next';

// Nuevos Componentes de Widgets
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #e2e8f0', background: 'var(--color-bg-surface)' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCorp ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isCorp ? <Building size={16} color="#0284c7" /> : <User size={16} color="var(--color-text-secondary)" />}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
            {isCorp ? t('doctor.prescriptions_list.clinic_supply') : (rx.patient?.name || rx.patient?.email || t('doctor.prescriptions_list.patient'))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
            {rx.items?.length || 0} {t('doctor.prescriptions_list.items')} • {date}
          </div>
        </div>
        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: `${meta.color}15`, color: meta.color, fontSize: '0.75rem', fontWeight: 600 }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}

function PipelineBar({ prescriptions }) {
  const counts = PIPELINE_STEPS.map(step => ({
    ...step,
    count: prescriptions.filter(rx => rx.status === step.key).length,
  }));
  const total = prescriptions.length || 1;
  return (
    <div style={{ display: 'flex', gap: '2px', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'var(--color-border)' }}>
      {counts.map(s => s.count > 0 && (
        <div key={s.key} style={{ width: `${(s.count / total) * 100}%`, background: s.color }} title={`${s.label}: ${s.count}`} />
      ))}
    </div>
  );
}

export default function DoctorOverviewTab({ doctorId, doctorMeta, patients = [], onNavigate }) {
  const { t } = useTranslation();
  const [showBuilder, setShowBuilder] = useState(false);
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => { setPatientCount(patients.length); }, [patients]);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });
      return docs;
    },
    enabled: !!doctorId
  });

  const drafts = prescriptions.filter(r => r.status === 'draft').length;
  const active = prescriptions.filter(r => ['sent', 'viewed_by_patient', 'assigned_to_wholesaler', 'added_to_bulk'].includes(r.status)).length;
  const fulfilled = prescriptions.filter(r => r.status === 'fulfilled').length;
  const recent = prescriptions.slice(0, 5);

  const initialWidgetLayout = [
    { id: 'widget-1', type: 'PatientRoster', props: { role: 'doctor' } },
    { id: 'widget-2', type: 'ClinicalHistory', props: { role: 'doctor' } },
    { id: 'widget-3', type: 'OrderTracking', props: { role: 'doctor', userId: doctorId } },
    { id: 'widget-4', type: 'BillingInvoices', props: { role: 'doctor' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

      {/* Desktop warning */}
      <style>{`
        .overview-mobile-warn { display: none; }
        @media (max-width: 1023px) {
          .overview-content { display: none !important; }
          .overview-mobile-warn { display: flex !important; }
        }
      `}</style>
      <div className="overview-mobile-warn" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', gap: '1rem', background: '#0f172a', borderRadius: '12px', color: 'var(--color-bg-surface)', minHeight: '60vh' }}>
        <div style={{ fontSize: '3rem' }}>💻</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('doctor.overview.desktop_only')}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', maxWidth: '300px' }}>{t('doctor.overview.desktop_only_desc')}</div>
      </div>

      <div className="overview-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {drafts > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '8px', background: 'var(--color-warning-bg)', border: '1px solid #fcd34d' }}>
            <AlertCircle size={20} color="var(--color-warning)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.95rem' }}>
                {drafts === 1 ? t('doctor.overview.drafts_banner', { count: drafts }) : t('doctor.overview.drafts_banner_plural', { count: drafts })}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b45309' }}>{t('doctor.overview.drafts_banner_desc')}</div>
            </div>
            <button onClick={() => onNavigate?.('prescriptions')} className="btn" style={{ background: 'var(--color-warning)', color: 'var(--color-bg-surface)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('doctor.overview.complete')} <ArrowRight size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <MetricCard title={t('doctor.overview.stats_active')} value={isLoading ? '…' : active} subtitle={t('doctor.overview.stats_active_sub')} icon={Send} color="var(--color-primary)" onClick={() => onNavigate?.('prescriptions')} />
          <MetricCard title={t('doctor.overview.stats_drafts')} value={isLoading ? '…' : drafts} subtitle={t('doctor.overview.stats_drafts_sub')} icon={Clock} color="#f59e0b" alert={drafts > 0} onClick={() => onNavigate?.('prescriptions')} />
          <MetricCard title={t('doctor.overview.stats_fulfilled')} value={isLoading ? '…' : fulfilled} subtitle={t('doctor.overview.stats_fulfilled_sub')} icon={CheckCircle2} color="var(--color-success)" onClick={() => onNavigate?.('prescriptions')} />
          <MetricCard title={t('doctor.overview.stats_patients')} value={patientCount || '—'} subtitle={t('doctor.overview.stats_patients_sub')} icon={Users} color="#8b5cf6" onClick={() => onNavigate?.('patients')} />
        </div>

        <ClinicalCopilotWidget onDraftGenerated={(draft) => { setShowBuilder(true); window.dispatchEvent(new CustomEvent('nav:ai-draft', { detail: draft })); }} />

        <PatientAdherenceWidget doctorId={doctorId} />

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Card style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Pill size={20} color="var(--primary)" />
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t('doctor.overview.new_rx')}</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{t('doctor.overview.new_rx_desc')}</p>
            <button onClick={() => setShowBuilder(!showBuilder)} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: 'var(--color-bg-surface)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
              <Plus size={16} /> {showBuilder ? t('doctor.overview.close_form') : t('doctor.overview.create_rx')}
            </button>
          </Card>

          <Card style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Package size={20} color="var(--primary)" />
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t('doctor.overview.catalogs')}</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{t('doctor.overview.catalogs_desc')}</p>
            <button onClick={() => onNavigate?.('catalog-builder')} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-app)', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
              {t('doctor.overview.open_generator')} <ArrowRight size={16} />
            </button>
          </Card>
        </div>

        {showBuilder && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ClipboardList size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{t('doctor.overview.builder_form')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t('doctor.overview.builder_form_desc')}</div>
                </div>
              </div>
              <button onClick={() => setShowBuilder(false)} className="btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>✕</button>
            </div>
            <DoctorPrescriptionBuilder doctorId={doctorId} doctorMeta={doctorMeta} patients={patients} onSaved={(isDraft) => { if (isDraft) setShowBuilder(false); }} />
          </Card>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="text-[#C0A062]" />
            Mi Dashboard Dinámico
          </h3>
          <p className="text-gray-400 text-sm mb-6">Puedes arrastrar y soltar estos widgets para personalizar tu área de trabajo.</p>
          <DraggableDashboard 
            availableWidgets={AVAILABLE_WIDGETS}
            initialLayout={initialWidgetLayout}
            onLayoutChange={(layout) => console.log('Nuevo layout guardado:', layout)}
          />
        </div>

      </div>
    </div>
  );
}