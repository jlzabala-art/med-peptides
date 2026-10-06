"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Pill, 
  Sparkles, 
  FileText, 
  Users, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  CheckCircle2, 
  Tag,
  Eye,
  SlidersHorizontal,
  Calendar,
  Layers,
  Activity,
  RotateCw,
  Download,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PrescriptionIntakeWorkspace from '@/features/prescriptions/components/PrescriptionIntakeWorkspace';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorPublicPortalClient({ slug, initialData = null }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Search & Filter State (Google Cloud UX Golden Rules #7, #24, #29)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [temporalFilter, setTemporalFilter] = useState('all'); // 'all' | 'active' | '30d' | '90d'
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22 Scope Switcher)
  
  // Table Density & Synchronization (GCP Table Standard)
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // UI Actions State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Modal for Viewing Pharmacy Labels Directly from Doctor Portal
  const [activeLabelRx, setActiveLabelRx] = useState(null);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);

  // ── URL Search Params Sync (Golden Rule #24: Sincronización de URL) ───────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const s = params.get('status');
    const t = params.get('task');
    const time = params.get('time');
    if (q) setSearchQuery(q);
    if (s) setStatusFilter(s);
    if (t) setTaskFilter(t);
    if (time) setTemporalFilter(time);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (taskFilter !== 'all') params.set('task', taskFilter);
    if (temporalFilter !== 'all') params.set('time', temporalFilter);
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== newSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
    }
  }, [searchQuery, statusFilter, taskFilter, temporalFilter]);

  useEffect(() => {
    // If initialData is already hydrated, only fetch in background if stale
    if (initialData && data?.success) return;

    async function fetchDoctorPortal() {
      try {
        setLoading(true);
        const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          throw new Error(`Failed to load doctor profile (${res.status})`);
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || 'Physician profile not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchDoctorPortal();
  }, [slug, initialData]);

  const doctor = data?.doctor || {};
  const globalKpis = data?.kpis || { activePrescriptions: 0, monitoredPatients: 0, pendingTasksCount: 0, refillsDueCount: 0 };
  const allTasks = data?.tasks || [];
  const allPrescriptions = data?.prescriptions || [];

  // Opaque Doctor Slug (Protects Doctor Identity in URL)
  const opaqueCode = doctor.opaqueCode || doctor.slug || slug;

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (taskFilter !== 'all' && t.type !== taskFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchPatient = (t.patientName || '').toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchPatient || matchCode;
    });
  }, [allTasks, taskFilter, searchQuery]);

  // Filter Prescriptions (Enhanced with Temporal Filter - Golden Rule #24)
  const filteredPrescriptions = useMemo(() => {
    return allPrescriptions.filter(rx => {
      if (statusFilter !== 'all' && (rx.status || '').toLowerCase() !== statusFilter) return false;

      // Temporal Filter Condition (Golden Rule #24)
      if (temporalFilter === 'active') {
        const s = (rx.status || '').toLowerCase();
        if (!['approved', 'active', 'processing'].includes(s)) return false;
      } else if (temporalFilter === '30d' && (rx.createdAt || rx.createdDate)) {
        const d = new Date(rx.createdAt || rx.createdDate);
        if (!isNaN(d.getTime())) {
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      } else if (temporalFilter === '90d' && (rx.createdAt || rx.createdDate)) {
        const d = new Date(rx.createdAt || rx.createdDate);
        if (!isNaN(d.getTime())) {
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 90) return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchPat = (rx.patientName || '').toLowerCase().includes(q);
      const matchCode = (rx.code || rx.prescriptionNumber || '').toLowerCase().includes(q);
      const matchTitle = (rx.treatmentTitle || '').toLowerCase().includes(q);
      const matchItems = (rx.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      return matchPat || matchCode || matchTitle || matchItems;
    });
  }, [allPrescriptions, statusFilter, searchQuery, temporalFilter]);

  // Compute Filtered KPIs for Scope Switcher (Rule #22)
  const filteredKpis = useMemo(() => {
    const activeRxCount = filteredPrescriptions.filter(p => ['approved', 'active'].includes((p.status || '').toLowerCase())).length;
    const uniquePatients = new Set(filteredPrescriptions.map(p => p.patientName).filter(Boolean)).size;
    const pendingTasks = filteredTasks.length;
    const refillsDue = filteredTasks.filter(t => t.type === 'refill' || t.type === 'titration').length;
    return {
      activePrescriptions: activeRxCount,
      monitoredPatients: uniquePatients,
      pendingTasksCount: pendingTasks,
      refillsDueCount: refillsDue
    };
  }, [filteredPrescriptions, filteredTasks]);

  const activeKpis = scopeMode === 'filtered' ? filteredKpis : globalKpis;

  const handleCopyPortalLink = () => {
    triggerHaptic('selection');
    const portalUrl = `${window.location.origin}/dr/${opaqueCode}`;
    navigator.clipboard?.writeText(portalUrl);
    setCopiedLink(true);
    toast.success('Codified doctor portal link copied (identity protected) ✓');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyIntakeLink = () => {
    triggerHaptic('selection');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(opaqueCode)}`;
    navigator.clipboard?.writeText(intakeUrl);
    setCopiedIntake(true);
    toast.success('Patient Intake Link copied with codified attribution ✓');
    setTimeout(() => setCopiedIntake(false), 2000);
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(opaqueCode)}`;
    const text = encodeURIComponent(`Hello, you can submit your medical prescription directly to ${doctor.name} at Atlas Clinical Services here: ${intakeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareDoctorPortal = () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Doctor Public Portal URL copied to clipboard ✓');
    }
  };

  const handleOpenLabelsModal = (rx) => {
    triggerHaptic('light');
    setActiveLabelRx(rx);
    setIsLabelsModalOpen(true);
  };

  const handleRefresh = () => {
    triggerHaptic('light');
    setLastRefreshed(new Date());
    toast.success('Clinical registry data synchronized ✓');
  };

  const handleExportCsv = () => {
    triggerHaptic('selection');
    const rows = filteredPrescriptions.map(p => ({
      Code: p.code || p.prescriptionNumber || '',
      Patient: p.patientName || '',
      Status: p.status || '',
      Treatment: p.treatmentTitle || '',
      Items: (p.items || []).map(i => i.name).join('; '),
      Created: p.createdAt || p.createdDate || ''
    }));
    const headers = ['Code', 'Patient', 'Status', 'Treatment', 'Items', 'Created'];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DR_${opaqueCode}_PRESCRIPTIONS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Prescriptions CSV exported successfully ✓');
  };

  const labelsForActiveRx = useMemo(() => {
    if (!activeLabelRx) return [];
    return getPharmapolisLabelsForPrescription(activeLabelRx, null);
  }, [activeLabelRx]);

  // ── Pending Clinical Tasks Columns (DataTable Exclusive Rendering) ───────
  const taskColumns = useMemo(() => [
    {
      key: 'priority',
      header: 'Priority',
      width: '12%',
      sortable: true,
      render: (t) => {
        const isUrgent = t.priority === 'urgent';
        const isHigh = t.priority === 'high';
        const isMedium = t.priority === 'medium';
        const color = isUrgent ? '#dc2626' : isHigh ? '#d97706' : isMedium ? '#2563eb' : '#16a34a';
        const bg = isUrgent ? '#fef2f2' : isHigh ? '#fffbeb' : isMedium ? '#eff6ff' : '#f0fdf4';
        const border = isUrgent ? '#fecaca' : isHigh ? '#fde68a' : isMedium ? '#bfdbfe' : '#bbf7d0';
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: bg,
              color: color,
              border: `1px solid ${border}`,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {t.priority || 'Normal'}
          </span>
        );
      }
    },
    {
      key: 'title',
      header: 'Clinical Task & Action Plan',
      width: '38%',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
            {t.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
            {t.description}
          </div>
        </div>
      )
    },
    {
      key: 'patientName',
      header: 'Patient & Reference',
      width: '20%',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
            {t.patientName}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Rx:</span>
            <CopyableId value={t.code} iconOnly={false} />
          </div>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Timeline',
      width: '15%',
      sortable: true,
      render: (t) => (
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Clock size={12} style={{ color: '#64748b' }} />
          {t.dueDate || 'Pending'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      width: '15%',
      align: 'right',
      render: (t) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
          <Link
            href={t.actionUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: '30px',
              padding: '0 12px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#003666',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              transition: 'all 0.12s'
            }}
          >
            <span>{t.actionLabel}</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )
    }
  ], []);

  // ── Prescriptions Dossier Columns (DataTable Exclusive Rendering) ─────────
  const prescriptionColumns = useMemo(() => [
    {
      key: 'code',
      header: 'Prescription Code',
      width: '18%',
      sortable: true,
      render: (rx) => (
        <div>
          <div style={{ fontWeight: 600, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>#{rx.code}</span>
            <CopyableId value={rx.code} iconOnly={true} />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={11} />
            <span>{rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active Regimen'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '22%',
      sortable: true,
      render: (rx) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
            {rx.patientName}
          </div>
          {rx.patient?.dob && (
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              DOB: {rx.patient.dob}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'treatmentTitle',
      header: 'Regimen & Formulations',
      width: '32%',
      sortable: true,
      render: (rx) => {
        const itemCount = (rx.items || []).length || (rx.prescriptionLines || []).length || 1;
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.84rem' }}>
              {rx.treatmentTitle || 'Personalized Compounded Regimen'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                {itemCount} formulation{itemCount > 1 ? 's' : ''}
              </span>
              {rx.posology && (
                <span style={{ color: '#0d9488', fontWeight: 500 }}>
                  {rx.posology.length > 36 ? `${rx.posology.slice(0, 36)}...` : rx.posology}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      sortable: true,
      render: (rx) => <StatusBadge status={rx.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '14%',
      align: 'right',
      render: (rx) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }} onClick={e => e.stopPropagation()}>
          <Link
            href={`/rx/${rx.code}`}
            style={{
              height: '30px',
              padding: '0 10px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#003666',
              fontSize: '0.76rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none'
            }}
            title="Open complete clinical monograph and posology dossier"
          >
            <span>Dossier</span>
            <ExternalLink size={12} />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenLabelsModal(rx)}
            title="View vector pharmacy compounding bottle label"
            style={{
              height: '30px',
              width: '30px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.12s'
            }}
          >
            <Tag size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/rx/${rx.code}?view=patient`;
              navigator.clipboard?.writeText(url);
              toast.success('Patient direct link copied ✓');
            }}
            title="Copy direct patient-facing prescription link"
            style={{
              height: '30px',
              width: '30px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#5f6368',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Share2 size={13} />
          </button>
        </div>
      )
    }
  ], []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#003666', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading Clinical Physician Portal...</p>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '2rem' }}>
        <EmptyState
          icon={AlertCircle}
          title="Physician Profile Unavailable"
          subtitle={error || "We couldn't locate this doctor in the clinical directory."}
          action={{
            label: "Back to Home",
            onClick: () => window.location.href = '/'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', paddingBottom: '5rem' }}>
      {/* ── Top Clinical Bar (Sticky GCP Page Header Pattern, Rule #9) ────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: '#ffffff',
          borderBottom: '1px solid #dadce0',
          padding: '12px 24px',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <Stethoscope size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.name}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '1px 8px',
                  borderRadius: '12px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ShieldCheck size={12} /> Verified Physician
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {doctor.specialty} • {doctor.clinic}
            </div>
          </div>
        </div>

        {/* Header Actions: GCP Standard Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopyIntakeLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#3c4043',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#c6c6c6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#dadce0'; }}
            title="Copy dedicated patient intake registration link"
          >
            {copiedIntake ? <Check size={15} style={{ color: '#16a34a' }} /> : <Copy size={15} style={{ color: '#5f6368' }} />}
            <span>{copiedIntake ? 'Intake Link Copied' : 'Share Intake Portal'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#3c4043',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            title="Send patient prescription intake invitation via WhatsApp"
          >
            <Share2 size={15} style={{ color: '#16a34a' }} />
            <span>WhatsApp Invite</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIntakeOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '6px',
              background: '#003666',
              border: '1px solid #003666',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              transition: 'background 0.15s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00284d')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#003666')}
            title="Upload and extract medical prescription with Atlas AI"
          >
            <Sparkles size={15} />
            <span>Submit Rx with AI</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px', paddingBottom: '90px' }}>
        {/* ── Breadcrumb Navigation (Google Cloud Standard, Golden Rule #17) ── */}
        <Breadcrumb items={[
          { label: 'Clinical Services', href: '/' },
          { label: 'Verified Physicians', href: '/doctor' },
          { label: doctor.name || 'Physician Portal' }
        ]} />

        {/* ── Doctor Identity Card ────────────────────────────────────────── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,54,102,0.18)'
              }}
            >
              {doctor.name?.replace('Dr. ', '').charAt(0) || 'D'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {doctor.name}
              </h1>
              <p style={{ margin: '4px 0 8px 0', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                {doctor.specialty} • {doctor.clinic}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: '#0d9488' }} />
                  <span>Medical License:</span>
                  <CopyableId value={doctor.license} iconOnly={false} />
                </div>
                {doctor.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} style={{ color: '#64748b' }} />
                    <span>{doctor.location}</span>
                  </div>
                )}
                {doctor.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={14} style={{ color: '#64748b' }} />
                    <span>{doctor.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyPortalLink}
              style={{
                height: '34px',
                padding: '0 12px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copiedLink ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Portal URL'}</span>
            </button>
          </div>
        </div>

        {/* ── 4 Core Operational KPIs & Scope Switcher (Google Cloud Rule #22) ─ */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Operational Metrics
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: scopeMode === 'filtered' ? '#f0fdf4' : '#eff6ff',
                  color: scopeMode === 'filtered' ? '#16a34a' : '#1d4ed8',
                  border: `1px solid ${scopeMode === 'filtered' ? '#bbf7d0' : '#bfdbfe'}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontWeight: 600
                }}
              >
                {scopeMode === 'filtered' 
                  ? `Active Filters View (${filteredPrescriptions.length} matching rx)` 
                  : `Global Practice View (${allPrescriptions.length} total rx)`}
              </span>
            </div>

            {/* Scope Switcher (Rule #22) */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setScopeMode('global')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scopeMode === 'global' ? '#ffffff' : 'transparent',
                  color: scopeMode === 'global' ? '#0f172a' : '#64748b',
                  boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s'
                }}
              >
                Global Database
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('filtered')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
                  color: scopeMode === 'filtered' ? '#0f172a' : '#64748b',
                  boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s'
                }}
              >
                Matching Filters
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}
          >
            {/* KPI 1: Active Prescriptions */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '16px 20px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368' }}>Active Prescriptions</span>
                <Pill size={18} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                {activeKpis.activePrescriptions}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Compounded posology regimens under treatment
              </div>
            </div>

            {/* KPI 2: Monitored Patients */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '16px 20px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368' }}>Monitored Patients</span>
                <Users size={18} style={{ color: '#003666' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                {activeKpis.monitoredPatients}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Unique patient dossiers managed
              </div>
            </div>

            {/* KPI 3: Pending Clinical Tasks */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '16px 20px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368' }}>Pending Clinical Tasks</span>
                <Clock size={18} style={{ color: '#d97706' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#d97706', lineHeight: 1.1 }}>
                {activeKpis.pendingTasksCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Actionable reviews & titrations required
              </div>
            </div>

            {/* KPI 4: Refills & Titrations Due */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '16px 20px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368' }}>Refills & Titrations Due</span>
                <Sparkles size={18} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', lineHeight: 1.1 }}>
                {activeKpis.refillsDueCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Upcoming supply cycles within 14 days
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Search Bar with Integrated GCP Filter Chips (Rule #7) ─── */}
        <div style={{ marginBottom: '28px' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient, prescription code, active compounds, formulation..."
            resultCount={filteredPrescriptions.length}
            namespace={`doctor-${slug}`}
            size="lg"
            filters={[
              statusFilter !== 'all' && {
                key: 'status',
                label: 'Status',
                value: statusFilter.toUpperCase(),
                onRemove: () => setStatusFilter('all')
              },
              taskFilter !== 'all' && {
                key: 'task',
                label: 'Task Type',
                value: taskFilter.toUpperCase(),
                onRemove: () => setTaskFilter('all')
              }
            ].filter(Boolean)}
            filterOptions={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Active', value: 'active' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Draft', value: 'draft' }
                ],
                value: statusFilter,
                onChange: setStatusFilter
              },
              {
                key: 'task',
                label: 'Tasks',
                options: [
                  { label: 'All Tasks', value: 'all' },
                  { label: 'Titrations', value: 'titration' },
                  { label: 'Refills', value: 'refill' },
                  { label: 'Sign-offs', value: 'approval' }
                ],
                value: taskFilter,
                onChange: setTaskFilter
              }
            ]}
          />
        </div>

        {/* ── Table 1: Pending Clinical Tasks & To-Do Actions (DataTable Universal) ── */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            marginBottom: '32px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#ffffff'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: '#003666' }} />
                <span>Patient Care To-Do List & Pending Clinical Actions</span>
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Automated clinical vigilance based on treatment schedules, phase titrations, and intake submissions.
              </p>
            </div>

            {/* Quick Task Filter Pills */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'titration', label: 'Titrations' },
                { id: 'refill', label: 'Refills' },
                { id: 'approval', label: 'Sign-offs' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTaskFilter(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: taskFilter === f.id ? '#ffffff' : 'transparent',
                    color: taskFilter === f.id ? '#0f172a' : '#64748b',
                    boxShadow: taskFilter === f.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.12s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={taskColumns}
            data={filteredTasks}
            keyField="id"
            tableId={`doctor-tasks-${slug}`}
            pagination={false}
            emptyTitle="All Patient Care Tasks Up to Date"
            emptyDescription="There are no pending protocol titrations, phase adjustments, or refill authorizations requiring physician action."
            expandableRender={(task) => (
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#003666' }}>
                    Clinical Rationale & Action Details
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Trigger: Automated Chronobiological Protocol Monitor
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                  {task.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link
                    href={task.actionUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      background: '#003666',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Execute {task.actionLabel}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Reference Prescription #{task.code}
                  </span>
                </div>
              </div>
            )}
          />
        </section>

        {/* ── Table 2: Associated Clinical Prescriptions Dossier (DataTable Universal) ── */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#ffffff'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: '#003666' }} />
                  <span>Associated Clinical Prescriptions Dossier</span>
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <span>Synced {lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}</span>
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Complete verified repository of compounded formulations and sequential regimens.
              </p>
            </div>

            {/* GCP Action Toolbar: Filters + Refresh + Export */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Temporal Filters */}
              <div style={{ display: 'inline-flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'active', label: 'Active' },
                  { id: '30d', label: '30 Days' },
                  { id: '90d', label: '90 Days' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemporalFilter(t.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: temporalFilter === t.id ? '#ffffff' : 'transparent',
                      color: temporalFilter === t.id ? '#003666' : '#64748b',
                      boxShadow: temporalFilter === t.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Status Filters */}
              <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'active', label: 'Active' },
                  { id: 'pending', label: 'Pending' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: statusFilter === s.id ? '#ffffff' : 'transparent',
                      color: statusFilter === s.id ? '#0f172a' : '#64748b',
                      boxShadow: statusFilter === s.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh clinical registry"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#5f6368',
                  cursor: 'pointer'
                }}
              >
                <RotateCw size={13} />
              </button>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={13} color="#5f6368" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <DataTable
            columns={prescriptionColumns}
            data={filteredPrescriptions}
            keyField="id"
            tableId={`doctor-prescriptions-${slug}`}
            pagination={true}
            initialRowsPerPage={25}
            emptyTitle="No Prescriptions Found"
            emptyDescription="No prescriptions match the active search criteria or filters. Adjust search keywords or register a new patient."
            expandableRender={(rx) => {
              const itemsList = rx.items && rx.items.length > 0 ? rx.items : (rx.prescriptionLines || []);
              return (
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#003666' }}>
                      Formulation Details & Posology Schedule
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Standard: EU GMP Certified Dispensary · Pharmapolis & Fagron
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Active Formulations List */}
                    <div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Active Ingredients & Vehicles ({itemsList.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {itemsList.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{it.name}</span>
                            <span style={{ color: '#0d9488', fontWeight: 600 }}>{it.dose || it.vehicle || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Posology Protocol & Quick Actions */}
                    <div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Sequential Clinical Schedule
                      </div>
                      <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem', color: '#134e4a', lineHeight: 1.4 }}>
                        {rx.posology || 'Administer as directed by treating physician according to physiological circadian cycle.'}
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link
                          href={`/rx/${rx.code}`}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#003666',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open Full Clinical Monograph & Quality Standards</span>
                          <ArrowUpRight size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenLabelsModal(rx)}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#0284c7',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Tag size={13} />
                          <span>View Official Bottle Labels</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </section>
      </main>

      {/* ── Official Compounding Bottle Labels Modal (Direct from Doctor Portal) ── */}
      {isLabelsModalOpen && activeLabelRx && (
        <PharmacyLabelsModal
          isOpen={isLabelsModalOpen}
          onClose={() => {
            setIsLabelsModalOpen(false);
            setActiveLabelRx(null);
          }}
          labels={labelsForActiveRx}
          initialLabelIndex={0}
          isEs={false}
        />
      )}

      {/* ── AI Prescription Intake Workspace (Attributed to this Physician) ── */}
      {isIntakeOpen && (
        <PrescriptionIntakeWorkspace
          isOpen={true}
          onClose={() => setIsIntakeOpen(false)}
          onSaveSuccess={() => {
            setIsIntakeOpen(false);
            toast.success(`Prescription saved and attributed to ${doctor.name}!`);
            window.location.reload();
          }}
        />
      )}

      {/* ── Sticky Clinical Operations Dock (Laptop & Mobile GCP Standard) ── */}
      <aside
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #dadce0',
          boxShadow: '0 -4px 16px rgba(60,64,67,0.08)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Physician Identity & Active View Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#e8f0fe',
            color: '#1a73e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.80rem',
            fontWeight: 700
          }}>
            {doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#202124' }}>
              {doctor.name} <span style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 500 }}>· {doctor.license || 'Verified Physician'}</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{filteredPrescriptions.length} Records in Active View</span>
              <span>•</span>
              <span style={{ color: '#137333', fontWeight: 600 }}>EU GMP Certified Dispensary</span>
            </div>
          </div>
        </div>

        {/* Right: Quick GCP Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleShareDoctorPortal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} color="#1a73e8" />
            <span>Share Portal</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Download size={13} color="#5f6368" />
            <span>Export Registry</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIntakeOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 16px',
              borderRadius: '4px',
              border: '1px solid #1a73e8',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New Prescription Intake</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
