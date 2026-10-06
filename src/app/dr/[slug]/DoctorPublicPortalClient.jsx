"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Search, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Pill, 
  Layers, 
  Sparkles, 
  FileText, 
  Users, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  FilePlus,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import PrescriptionIntakeWorkspace from '@/features/prescriptions/components/PrescriptionIntakeWorkspace';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorPublicPortalClient({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  useEffect(() => {
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
  }, [slug]);

  const doctor = data?.doctor || {};
  const kpis = data?.kpis || { activePrescriptions: 0, monitoredPatients: 0, pendingTasksCount: 0, refillsDueCount: 0 };
  const allTasks = data?.tasks || [];
  const allPrescriptions = data?.prescriptions || [];

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return allTasks;
    return allTasks.filter(t => t.type === taskFilter);
  }, [allTasks, taskFilter]);

  // Filter Prescriptions
  const filteredPrescriptions = useMemo(() => {
    return allPrescriptions.filter(rx => {
      if (statusFilter !== 'all' && rx.status.toLowerCase() !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchPat = (rx.patientName || '').toLowerCase().includes(q);
      const matchCode = (rx.code || rx.prescriptionNumber || '').toLowerCase().includes(q);
      const matchTitle = (rx.treatmentTitle || '').toLowerCase().includes(q);
      const matchItems = (rx.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      return matchPat || matchCode || matchTitle || matchItems;
    });
  }, [allPrescriptions, statusFilter, searchQuery]);

  const toggleRow = (id) => {
    triggerHaptic('light');
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPortalLink = () => {
    triggerHaptic('selection');
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Doctor public portal link copied to clipboard ✓');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyIntakeLink = () => {
    triggerHaptic('selection');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(doctor.name || '')}`;
    navigator.clipboard?.writeText(intakeUrl);
    setCopiedIntake(true);
    toast.success('Patient Intake Link copied with doctor attribution ✓');
    setTimeout(() => setCopiedIntake(false), 2000);
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(doctor.name || '')}`;
    const text = encodeURIComponent(`Hello, you can submit your medical prescription directly to ${doctor.name} at Atlas Clinical Services here: ${intakeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

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
      {/* ── Top Clinical Bar ─────────────────────────────────────────────── */}
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

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
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

        {/* ── 4 Core Operational KPIs (Google Cloud Rule #22) ─────────────── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Operational Metrics
              </span>
              <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '1px 6px', fontWeight: 600 }}>
                Live Clinical Scope
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Updated in real-time</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}
          >
            {/* KPI 1 */}
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
                {kpis.activePrescriptions}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Compounded posology regimens under treatment
              </div>
            </div>

            {/* KPI 2 */}
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
                {kpis.monitoredPatients}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Unique patient dossiers managed
              </div>
            </div>

            {/* KPI 3 */}
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
                {kpis.pendingTasksCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Actionable reviews & titrations required
              </div>
            </div>

            {/* KPI 4 */}
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
                {kpis.refillsDueCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Upcoming supply cycles within 14 days
              </div>
            </div>
          </div>
        </div>

        {/* ── Priority Clinical Action Board (Patient-Centric To-Do List) ─── */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: '#003666' }} />
                <span>Patient Care To-Do List & Clinical Actions</span>
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Automated clinical vigilance based on treatment schedules, phase titrations, and intake submissions.
              </p>
            </div>

            {/* Task Filters */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px' }}>
              {[
                { id: 'all', label: 'All Tasks' },
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
                    fontSize: '0.76rem',
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

          {filteredTasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              <CheckCircle2 size={24} style={{ color: '#16a34a', margin: '0 auto 8px auto' }} />
              All patient clinical tasks and protocol titrations are up to date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredTasks.map((task) => {
                const isUrgent = task.priority === 'urgent';
                const isHigh = task.priority === 'high';
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      background: isUrgent ? '#fef2f2' : isHigh ? '#fffbeb' : '#f8fafc',
                      border: `1px solid ${isUrgent ? '#fecaca' : isHigh ? '#fde68a' : '#e2e8f0'}`,
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '260px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isUrgent ? '#dc2626' : isHigh ? '#d97706' : '#2563eb',
                          marginTop: '6px',
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                            {task.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: isUrgent ? '#fee2e2' : isHigh ? '#fef3c7' : '#eff6ff',
                              color: isUrgent ? '#b91c1c' : isHigh ? '#b45309' : '#1d4ed8'
                            }}
                          >
                            {task.dueDate}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.35 }}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        href={task.actionUrl}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #dadce0',
                          color: '#003666',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                        }}
                      >
                        <span>{task.actionLabel}</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Prescriptions Master Table (Master-Detail Design) ────────────── */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            overflow: 'hidden'
          }}
        >
          {/* Table Header Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Clinical Prescriptions Dossier
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Complete verified repository of compounded formulations and sequential regimens.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Status Filter Pills */}
              <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px' }}>
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
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: statusFilter === s.id ? '#ffffff' : 'transparent',
                      color: statusFilter === s.id ? '#0f172a' : '#64748b',
                      boxShadow: statusFilter === s.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Search Bar */}
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search patient, formulation, active ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '34px',
                  padding: '0 12px 0 34px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  color: '#1e293b',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Table Rows */}
          {filteredPrescriptions.length === 0 ? (
            <div style={{ padding: '3rem 1rem' }}>
              <EmptyState
                icon={FileText}
                title="No Prescriptions Found"
                subtitle="Try adjusting your search criteria or upload a new patient prescription."
              />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #dadce0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 16px', width: '40px' }}></th>
                    <th style={{ padding: '10px 16px' }}>Prescription Code</th>
                    <th style={{ padding: '10px 16px' }}>Patient</th>
                    <th style={{ padding: '10px 16px' }}>Regimen & Scope</th>
                    <th style={{ padding: '10px 16px' }}>Status</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((rx) => {
                    const isExpanded = !!expandedRows[rx.id];
                    const itemCount = (rx.items || []).length || (rx.prescriptionLines || []).length;
                    return (
                      <React.Fragment key={rx.id}>
                        <tr
                          onClick={() => toggleRow(rx.id)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            background: isExpanded ? '#f8fafc' : '#ffffff',
                            transition: 'background 0.12s'
                          }}
                          onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = '#fdfefe'; }}
                          onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = '#ffffff'; }}
                        >
                          {/* Chevron Trigger */}
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>

                          {/* Code */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>#{rx.code}</span>
                              <CopyableId value={rx.code} iconOnly={true} />
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                              {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active'}
                            </div>
                          </td>

                          {/* Patient */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{rx.patientName}</div>
                            {rx.patient?.dob && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                DOB: {rx.patient.dob}
                              </div>
                            )}
                          </td>

                          {/* Regimen */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 500, color: '#1e293b' }}>
                              {rx.treatmentTitle || 'Personalized Clinical Regimen'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                                {itemCount} active formulations
                              </span>
                              {rx.posology && (
                                <span style={{ color: '#0d9488', fontWeight: 500 }}>
                                  {rx.posology.length > 40 ? `${rx.posology.slice(0, 40)}...` : rx.posology}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={rx.status} />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
                              >
                                <span>Dossier</span>
                                <ExternalLink size={12} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = `${window.location.origin}/rx/${rx.code}?view=patient`;
                                  navigator.clipboard?.writeText(url);
                                  toast.success('Patient direct link copied ✓');
                                }}
                                title="Copy patient-facing prescription link"
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
                          </td>
                        </tr>

                        {/* Master-Detail Expanded Section */}
                        {isExpanded && (
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <td colSpan={6} style={{ padding: '16px 24px 20px 48px' }}>
                              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#003666' }}>
                                    Formulation Details & Posology Schedule
                                  </span>
                                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                    Standard: EU GMP Certified Dispensary
                                  </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                  {/* Formulations List */}
                                  <div>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                                      Active Ingredients & Vehicles ({itemCount})
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {(rx.items && rx.items.length > 0 ? rx.items : rx.prescriptionLines || []).map((it, idx) => (
                                        <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px' }}>
                                          <span style={{ fontWeight: 500, color: '#1e293b' }}>{it.name}</span>
                                          <span style={{ color: '#0d9488', fontWeight: 600 }}>{it.dose || it.vehicle || '-'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Posology Protocol */}
                                  <div>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                                      Sequential Clinical Schedule
                                    </div>
                                    <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem', color: '#134e4a', lineHeight: 1.4 }}>
                                      {rx.posology || 'Administer as directed by treating physician according to physiological circadian cycle.'}
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                      <Link
                                        href={`/rx/${rx.code}`}
                                        style={{
                                          fontSize: '0.76rem',
                                          fontWeight: 600,
                                          color: '#003666',
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        <span>Open Full Clinical Monograph & Quality Standards</span>
                                        <ArrowUpRight size={12} />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

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
    </div>
  );
}
