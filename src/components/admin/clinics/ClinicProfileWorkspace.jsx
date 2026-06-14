import X from "lucide-react/dist/esm/icons/x";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Users from "lucide-react/dist/esm/icons/users";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Activity from "lucide-react/dist/esm/icons/activity";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import ShieldPlus from "lucide-react/dist/esm/icons/shield-plus";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import React, { useState } from 'react';










import { Tabs, StatusChip } from '../../ui';
import GlobalRelationshipPanel from '../../shared/GlobalRelationshipPanel';
import UniversalTimeline from '../../shared/UniversalTimeline';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import RevenueWidget from '../../shared/RevenueWidget';

export default function ClinicProfileWorkspace({ clinic, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mocks for relationships
  const mockManager = { id: 'mgr_1', name: clinic.manager };

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
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>${(clinic.monthlyVolume || 0).toLocaleString()}</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Active Patients</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{clinic.patients || 0}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Basic Info */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} /> Location & Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</div><div style={{ fontWeight: 600 }}>{clinic.address}</div></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Territory</div><div style={{ fontWeight: 600 }}>{clinic.territory}</div></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</div><div style={{ fontWeight: 600 }}>{clinic.email}<br/>{clinic.phone}</div></div>
              </div>
            </div>

            {/* AI Insights */}
            <div style={{ backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> Commercial Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(clinic.insights || ["Onboarding: Needs final catalog approval."]).map((insight, idx) => (
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
      label: 'Physicians',
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1rem' }}>Assigned Physicians ({clinic.physicians || 0})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="hover-card-subtle" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>DR</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Dr. Example Physician {i}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14 Patients • $4.2k Revenue</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
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
            entityName={clinic.name} 
            email={clinic.email} 
            phone={clinic.phone} 
          />
        </div>
      )
    },
    {
      id: 'orders',
      label: 'Orders',
      content: <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Commercial order history goes here.</div>
    }
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
            {clinic.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{clinic.name}</h1>
              <StatusChip status={clinic.status} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '4px' }}>
                {clinic.tier || 'Standard'} Tier
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> {clinic.territory}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Briefcase size={14}/> {clinic.network || 'Independent'}</span>
              <span>Clinic ID: {clinic.id}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} /> Add Physician
          </button>
          <button className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={16} /> Create Order
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
            clinic={clinic}
            manager={mockManager}
            activeEntity="clinic"
          />

          {/* Relationship Metrics */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <RevenueWidget entityId={clinic.id} entityType="clinic" />
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Patients</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{clinic.patients || 0}</div>
                </div>
              </div>
              <button className="gcp-btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>View Patient Roster</button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}