"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, StatusChip, CopyableId, Skeleton } from '../../ui';
import GlobalRelationshipPanel from '../../shared/GlobalRelationshipPanel';
import UniversalTimeline from '../../shared/UniversalTimeline';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import RevenueWidget from '../../shared/RevenueWidget';
import ImportPrescriptionModal from '../../../features/prescriptions/components/ImportPrescriptionModal';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import notifier from '../../../services/NotificationService';
import { fetchClinicWorkspaceBundle } from '../../../actions/clinicsActions';
import { X, Building2, MapPin, Users, Briefcase, Activity, ShoppingCart, ShieldPlus, ChevronRight, Navigation, FileUp, FileText, RefreshCw, Stethoscope } from '@/lib/icons';

export default function ClinicProfileWorkspace({ clinic, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [loadingBundle, setLoadingBundle] = useState(true);

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

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Line Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Monthly Volume</div>
              {loadingBundle ? (
                <Skeleton height="32px" width="120px" />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>
                  ${(stats.monthlyVolume || 0).toLocaleString()}
                </div>
              )}
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Active Patients</div>
              {loadingBundle ? (
                <Skeleton height="32px" width="80px" />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                  {stats.activePatients || 0}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Basic Info */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} /> Location & Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</div><div style={{ fontWeight: 600 }}>{effectiveClinic.address || 'Address not specified'}</div></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Territory</div><div style={{ fontWeight: 600 }}>{effectiveClinic.territory || 'Unassigned'}</div></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</div><div style={{ fontWeight: 600 }}>{effectiveClinic.email || 'No email'}<br/>{effectiveClinic.phone || 'No phone'}</div></div>
              </div>
            </div>

            {/* AI Insights */}
            <div style={{ backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> Commercial Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(effectiveClinic.insights || ["Onboarding: Needs final catalog approval.", "B2B Discount tier active."]).map((insight, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Navigation size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'physicians',
      label: `Physicians (${physicians.length})`,
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>
              Assigned Physicians ({physicians.length})
            </h3>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.8rem' }}>
              + Invite Physician
            </button>
          </div>

          {loadingBundle ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Skeleton height="60px" width="100%" />
              <Skeleton height="60px" width="100%" />
            </div>
          ) : physicians.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Stethoscope size={32} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No physicians assigned yet</p>
              <span style={{ fontSize: '0.8rem' }}>Invite medical practitioners to prescribe under this clinic.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {physicians.map((doc, idx) => (
                <div key={doc.id || idx} className="hover-card-subtle" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(doc.name || doc.displayName || 'DR').substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{doc.name || doc.displayName || doc.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.specialty || 'General Practitioner'} • {doc.licenseNumber || 'Verified'}</div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'activity',
      label: 'Timeline',
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '2rem' }}>
          <UniversalTimeline entityId={clinic.id} entityType="clinic" />
        </div>
      )
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', height: '600px' }}>
          <TasksEngine entityId={clinic.id} />
        </div>
      )
    },
    {
      id: 'communications',
      label: 'Communications',
      content: (
        <div style={{ height: '600px' }}>
          <CommunicationHub 
            entityId={clinic.id} 
            entityType="clinic" 
            entityName={effectiveClinic.name} 
            email={effectiveClinic.email} 
            phone={effectiveClinic.phone} 
          />
        </div>
      )
    },
    {
      id: 'orders',
      label: `Orders (${recentOrders.length})`,
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>
              Commercial & Wholesale Orders ({recentOrders.length})
            </h3>
            <button className="gcp-btn-primary" style={{ fontSize: '0.8rem' }}>
              + Create Wholesale Order
            </button>
          </div>
          {loadingBundle ? (
            <Skeleton height="80px" width="100%" />
          ) : recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingCart size={32} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No orders recorded for this clinic</p>
              <span style={{ fontSize: '0.8rem' }}>Orders placed via B2B quotations will be tracked here.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'} • {order.items?.length || 1} items</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusChip status={order.status || 'processing'} />
                    <span style={{ fontWeight: 800 }}>${(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
            {(effectiveClinic.name || 'CL').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{effectiveClinic.name}</h1>
              <StatusChip status={effectiveClinic.status} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '4px' }}>
                {effectiveClinic.tier || 'Standard'} Tier
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> {effectiveClinic.territory || 'Unassigned'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Briefcase size={14}/> {effectiveClinic.network || 'Independent'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Clinic ID: <CopyableId value={effectiveClinic.id} /></span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={loadBundle}
            className="gcp-btn-secondary"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refresh Bundle Data"
          >
            <RefreshCw size={15} className={loadingBundle ? 'spin' : ''} />
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
            title="Create B2B Quote in Workspace (⌥W)"
          >
            <Briefcase size={16} /> Quote in Workspace
          </button>
          <button 
            onClick={() => setIsImportOpen(true)}
            className="gcp-btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}
          >
            <FileUp size={16} /> Import Rx
          </button>
          <button onClick={onClose} style={{ padding: '0.5rem', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Content Tabs */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        </div>

        {/* Right: Universal Relationship Panel */}
        <div style={{ width: '320px', borderLeft: '1px solid var(--border)', backgroundColor: '#f1f5f9', overflowY: 'auto', padding: '1.5rem' }}>
          <GlobalRelationshipPanel 
            clinic={effectiveClinic}
            manager={manager}
            activeEntity="clinic"
          />

          {/* Relationship Metrics */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <RevenueWidget entityId={effectiveClinic.id} entityType="clinic" />
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Patients</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats.activePatients || 0}</div>
                </div>
              </div>
              <button className="gcp-btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>View Patient Roster</button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      
      <ImportPrescriptionModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        context={{ clinicId: effectiveClinic.id, clinicName: effectiveClinic.name }}
      />
    </div>
  );
}