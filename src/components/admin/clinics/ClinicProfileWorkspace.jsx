"use client";

import React, { useState, useEffect } from 'react';
import { StatusChip, CopyableId, Skeleton } from '../../ui';
import GlobalRelationshipPanel from '../../shared/GlobalRelationshipPanel';
import UniversalTimeline from '../../shared/UniversalTimeline';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import RevenueWidget from '../../shared/RevenueWidget';
import ImportPrescriptionModal from '../../../features/prescriptions/components/ImportPrescriptionModal';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import notifier from '../../../services/NotificationService';
import { fetchClinicWorkspaceBundle } from '../../../actions/clinicsActions';
import {
  X,
  Building2,
  MapPin,
  Users,
  Briefcase,
  Activity,
  ShoppingCart,
  ShieldPlus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Navigation,
  FileUp,
  FileText,
  RefreshCw,
  Stethoscope,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet
} from '@/lib/icons';

/**
 * ClinicProfileWorkspace
 * Accordion-driven institutional drawer optimized for mobile and desktop screens.
 * Eliminates double-column squeezing, text collision, and missing contact data.
 */
export default function ClinicProfileWorkspace({ clinic, onClose }) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [loadingBundle, setLoadingBundle] = useState(true);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    practice: true,
    physicians: true,
    prescriptions: true,
    commercial: false,
    orders: false,
    timeline: false
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const expandAll = () => {
    setOpenSections({
      practice: true,
      physicians: true,
      prescriptions: true,
      commercial: true,
      orders: true,
      timeline: true
    });
  };

  const collapseAll = () => {
    setOpenSections({
      practice: false,
      physicians: false,
      prescriptions: false,
      commercial: false,
      orders: false,
      timeline: false
    });
  };

  const loadBundle = async () => {
    if (!clinic?.id) return;
    setLoadingBundle(true);
    try {
      const data = await fetchClinicWorkspaceBundle(clinic.id);
      if (data) {
        setBundle(data);
      }
    } catch (err) {
      console.error("Failed to load clinic workspace bundle:", err);
      notifier.error("Could not load real-time clinic details");
    } finally {
      setLoadingBundle(false);
    }
  };

  useEffect(() => {
    loadBundle();
  }, [clinic?.id]);

  const effectiveClinic = bundle?.clinic || clinic;
  const physicians = bundle?.physicians || [];
  const recentOrders = bundle?.recentOrders || [];
  const recentPrescriptions = bundle?.recentPrescriptions || [];
  const manager = bundle?.accountManager || { id: 'mgr_assigned', name: effectiveClinic.manager || 'Assigned Account Manager' };
  const stats = bundle?.stats || {
    monthlyVolume: effectiveClinic.monthlyVolume || 0,
    activePatients: effectiveClinic.patients || 0,
    totalPrescriptions: recentPrescriptions.length,
    totalOrders: recentOrders.length
  };

  // Resolve complete formatted address
  const resolvedAddress =
    effectiveClinic.streetAddress ||
    effectiveClinic.address ||
    [effectiveClinic.streetAddress, effectiveClinic.city, effectiveClinic.state, effectiveClinic.country]
      .filter(Boolean)
      .join(', ') ||
    'Address not specified';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* ── Fixed Header ── */}
      <div
        style={{
          flexShrink: 0,
          padding: '16px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left: Avatar & Titles */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {(effectiveClinic.name || 'CL').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {effectiveClinic.name}
              </h1>
              {effectiveClinic.arabicName && (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', direction: 'rtl' }}>
                  {effectiveClinic.arabicName}
                </span>
              )}
              <StatusChip status={effectiveClinic.status || 'approved'} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {effectiveClinic.tier || 'Standard'} Tier
              </span>
            </div>
            {/* Metadata Subtitle Row (No Text Overlap) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#64748b" /> {effectiveClinic.city || effectiveClinic.territory || 'Dubai, UAE'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={13} color="#64748b" /> {effectiveClinic.network || 'Independent Practice'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Clinic ID: <CopyableId value={effectiveClinic.id} />
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={loadBundle}
            className="gcp-btn-secondary"
            style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            title="Refresh Real-time Bundle Data"
          >
            <RefreshCw size={14} className={loadingBundle ? 'spin' : ''} />
            <span className="hide-mobile">Refresh</span>
          </button>
          <button
            onClick={() => {
              const { setWorkspaceIntent, setTargetEntity, setDrawerOpen, activeWorkspaceId } = useWorkspaceStore.getState();
              setWorkspaceIntent('sell', activeWorkspaceId);
              setTargetEntity(activeWorkspaceId, {
                id: effectiveClinic.id,
                name: effectiveClinic.name,
                type: 'clinic'
              });
              setDrawerOpen(true);
              notifier.success(`Configured Workspace for Clinic "${effectiveClinic.name}"!`);
            }}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontSize: '0.78rem', padding: '7px 12px' }}
            title="Create B2B Quote in Workspace (⌥W)"
          >
            <Briefcase size={14} /> Quote in Workspace
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontSize: '0.78rem', padding: '7px 12px' }}
          >
            <FileUp size={14} /> Import Rx
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '6px 10px',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body with Accordions ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        
        {/* 4 KPI Metric Summary Cards (Rule #22 Compliance) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {/* Volume */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attributed Vol.</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="100px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>
                ${(stats.monthlyVolume || 0).toLocaleString()}
              </div>
            )}
          </div>

          {/* Active Patients */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Patients</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="60px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                {stats.activePatients || 0}
              </div>
            )}
          </div>

          {/* Physicians */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physicians</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="60px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0e7490' }}>
                {physicians.length}
              </div>
            )}
          </div>

          {/* Prescriptions & Orders */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prescriptions</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="80px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7e22ce' }}>
                {recentPrescriptions.length} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b21a8' }}>({recentOrders.length} Orders)</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar: Expand / Collapse All ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Institutional Profile & Clinical Operations
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={expandAll}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '2px 6px' }}
            >
              Expand All
            </button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button
              type="button"
              onClick={collapseAll}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '2px 6px' }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* ── Accordion 1: Practice & Contact Info ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('practice')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.practice ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.practice ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={18} color="#2563eb" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🏥 Clinical Practice & Contact Information
              </span>
            </div>
            {openSections.practice ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.practice && (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Physical Address</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{resolvedAddress}</div>
                  {effectiveClinic.poBox && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PO Box: {effectiveClinic.poBox}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Phone & Direct Line</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {effectiveClinic.phone ? (
                      <a href={`tel:${effectiveClinic.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        📞 {effectiveClinic.phone}
                      </a>
                    ) : 'No phone specified'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Digital Portal & Web</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {effectiveClinic.website ? (
                      <a href={effectiveClinic.website.startsWith('http') ? effectiveClinic.website : `https://${effectiveClinic.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        🌐 {effectiveClinic.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No website specified</span>
                    )}
                  </div>
                  {effectiveClinic.email && (
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      <a href={`mailto:${effectiveClinic.email}`} style={{ color: '#0284c7' }}>
                        📧 {effectiveClinic.email}
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Jurisdiction & Network</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {effectiveClinic.city || 'Dubai'} • {effectiveClinic.country || 'United Arab Emirates'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Network: {effectiveClinic.network || 'Independent Specialist Clinic'}
                  </div>
                </div>
              </div>

              {/* Commercial Insights Pills */}
              <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', padding: '12px 14px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Commercial Intelligence & Pricing Tier
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(effectiveClinic.insights || ["Verified Practice • Ready for direct institutional orders.", "B2B Discount tier active."]).map((insight, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem', color: '#0c4a6e' }}>
                      <Navigation size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Accordion 2: Assigned Physicians ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('physicians')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.physicians ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.physicians ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Stethoscope size={18} color="#0891b2" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🩺 Assigned Physicians & Practitioners ({physicians.length})
              </span>
            </div>
            {openSections.physicians ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.physicians && (
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Accredited physicians prescribing under this clinic licence
                </span>
                <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  + Invite Physician
                </button>
              </div>

              {loadingBundle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton height="50px" width="100%" />
                </div>
              ) : physicians.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <Stethoscope size={28} style={{ opacity: 0.35, margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No physicians assigned yet</p>
                  <span style={{ fontSize: '0.75rem' }}>Invite medical practitioners to prescribe under this clinic.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {physicians.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}
                        >
                          {(doc.name || doc.displayName || 'DR').substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {doc.name || doc.displayName || doc.email}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                            {doc.speciality || doc.title || 'Dermatology & Hair Restoration'}
                          </div>
                        </div>
                        <StatusChip status="active" />
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {doc.dhaLicense && (
                          <div>📋 <strong>DHA Registration:</strong> <code>{doc.dhaLicense}</code></div>
                        )}
                        {doc.germanMedicalId && (
                          <div>🇩🇪 <strong>Arztausweis:</strong> {doc.germanMedicalId} ({doc.germanChamber || 'Schleswig-Holstein'})</div>
                        )}
                        {doc.email && (
                          <div>📧 <a href={`mailto:${doc.email}`} style={{ color: '#2563eb' }}>{doc.email}</a></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Accordion 3: Active Prescriptions ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('prescriptions')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.prescriptions ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.prescriptions ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="#9333ea" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                📋 Active Prescriptions & Formulations ({recentPrescriptions.length})
              </span>
            </div>
            {openSections.prescriptions ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.prescriptions && (
            <div style={{ padding: '16px 18px' }}>
              {loadingBundle ? (
                <Skeleton height="60px" width="100%" />
              ) : recentPrescriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <FileText size={28} style={{ opacity: 0.35, margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No active prescriptions yet</p>
                  <span style={{ fontSize: '0.75rem' }}>Prescriptions created by physicians will be tracked here.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid #e9d5ff',
                        borderRadius: '10px',
                        backgroundColor: '#faf5ff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#6b21a8' }}>
                            {rx.code || rx.prescriptionNumber || rx.id}
                          </span>
                          <StatusChip status={rx.status || 'approved'} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#7e22ce' }}>
                          📅 {rx.date || 'Recent'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#1e293b' }}>
                        <strong>Patient:</strong> {rx.patient?.name || rx.patientName || 'Clinical Patient'}
                        {rx.patient?.pin && <span style={{ color: '#64748b' }}> (PIN: {rx.patient.pin})</span>}
                        <span style={{ marginLeft: '12px', color: '#64748b' }}>
                          • Prescribed by: <strong>{rx.doctorName || 'Dr. Hanieh Erdmann'}</strong>
                        </span>
                      </div>

                      {rx.clinicalNotes && (
                        <div style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f3e8ff' }}>
                          💊 <strong>Formulation:</strong> {rx.clinicalNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Accordion 4: Account Hierarchy & Relationships ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('commercial')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.commercial ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.commercial ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color="#d97706" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🏢 Account Management & Relationship Hierarchy
              </span>
            </div>
            {openSections.commercial ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.commercial && (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <GlobalRelationshipPanel
                    clinic={effectiveClinic}
                    manager={manager}
                    activeEntity="clinic"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <RevenueWidget entityId={effectiveClinic.id} entityType="clinic" />
                  <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users size={16} color="#16a34a" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Enrolled Patient Roster
                      </span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                      {stats.activePatients || 0} Patients Linked
                    </div>
                    <button className="gcp-btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}>
                      View Full Patient Roster
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Accordion 5: Wholesale & Commercial Orders ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('orders')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.orders ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.orders ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={18} color="#16a34a" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🛒 Commercial & Wholesale Orders ({recentOrders.length})
              </span>
            </div>
            {openSections.orders ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.orders && (
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Wholesale shipments, drafts, and invoices for this clinic
                </span>
                <button className="gcp-btn-primary" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  + Create Wholesale Order
                </button>
              </div>

              {loadingBundle ? (
                <Skeleton height="60px" width="100%" />
              ) : recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={28} style={{ opacity: 0.35, margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No orders recorded for this clinic</p>
                  <span style={{ fontSize: '0.75rem' }}>Orders placed via B2B quotations will be tracked here.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentOrders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Order #{order.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'} • {order.items?.length || 1} items
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StatusChip status={order.status || 'processing'} />
                        <span style={{ fontWeight: 800 }}>${(order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Accordion 6: Activity Timeline & Communications ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('timeline')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.timeline ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.timeline ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="#64748b" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                ⏱️ Activity Timeline & Communications Hub
              </span>
            </div>
            {openSections.timeline ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.timeline && (
            <div style={{ padding: '16px 18px' }}>
              <div style={{ marginBottom: '16px' }}>
                <UniversalTimeline entityId={clinic.id} entityType="clinic" />
              </div>
              <div style={{ minHeight: '350px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <CommunicationHub
                  entityId={clinic.id}
                  entityType="clinic"
                  entityName={effectiveClinic.name}
                  email={effectiveClinic.email}
                  phone={effectiveClinic.phone}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <ImportPrescriptionModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        context={{ clinicId: effectiveClinic.id, clinicName: effectiveClinic.name }}
      />
    </div>
  );
}