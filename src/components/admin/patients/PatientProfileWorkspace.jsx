import X from "lucide-react/dist/esm/icons/x";
import User from "lucide-react/dist/esm/icons/user";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import Activity from "lucide-react/dist/esm/icons/activity";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import ShieldPlus from "lucide-react/dist/esm/icons/shield-plus";
import Dna from "lucide-react/dist/esm/icons/dna";
import Clock from "lucide-react/dist/esm/icons/clock";
import MailOpen from "lucide-react/dist/esm/icons/mail-open";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React, { useState } from 'react';













import { Tabs, StatusChip } from '../../ui';
import GlobalRelationshipPanel from '../../shared/GlobalRelationshipPanel';
import UniversalTimeline from '../../shared/UniversalTimeline';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import RevenueWidget from '../../shared/RevenueWidget';

// --- Sub-components ---

function PatientJourney({ status }) {
  const steps = ['Lead', 'Assessment', 'Program', 'Follow-Up', 'Retention'];
  const currentIndex = steps.indexOf(status) > -1 ? steps.indexOf(status) : 2;

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clinical Journey</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', left: '20px', right: '20px', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '12px', left: '20px', width: `${(currentIndex / (steps.length - 1)) * 100}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 0, transition: 'width 0.4s' }}></div>
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, gap: '0.5rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isCompleted ? 'var(--primary)' : 'var(--background)', border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isCompleted && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }}></div>}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DigitalTwin({ patient }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dna size={20} color="var(--primary)" /> Patient Digital Twin
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Live metabolic indicators and protocol adherence
          </p>
        </div>
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Biological Age</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>{patient.age - 4} <span style={{ fontSize: '1rem', color: '#3b82f6' }}>yrs</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Metric 1 */}
        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>HbA1c</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>5.2% <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>↓ 0.3%</span></div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', backgroundColor: '#16a34a' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Testosterone (Free)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>14.2 <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>↑ 2.1</span></div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', backgroundColor: '#16a34a' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Inflammation (hs-CRP)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>0.8 <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>↓ 1.2</span></div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: '20%', height: '100%', backgroundColor: '#16a34a' }}></div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Active Protocol Regimen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Tirzepatide 5mg</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly • Subcutaneous</div>
            </div>
            <div style={{ padding: '4px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700 }}>
              Adherence: 100%
            </div>
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>NAD+ 200mg</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bi-Weekly • Subcutaneous</div>
            </div>
            <div style={{ padding: '4px 12px', backgroundColor: '#fefce8', color: '#ca8a04', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700 }}>
              Adherence: 80%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Workspace ---

export default function PatientProfileWorkspace({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mocks for relationships
  const mockPhysician = { id: 'phy_1', name: patient.physician };
  const mockClinic = { id: 'cln_1', name: patient.clinic };
  const mockManager = { id: 'mgr_1', name: patient.manager };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PatientJourney status="Program" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} /> Basic Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</div><div style={{ fontWeight: 600 }}>{patient.email}</div></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</div><div style={{ fontWeight: 600 }}>{patient.phone}</div></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Age / Gender</div><div style={{ fontWeight: 600 }}>{patient.age} / {patient.gender}</div></div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> AI Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={14} color="#0284c7" style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>Program compliance is high. Ready for peptide protocol up-sell.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Clock size={14} color="#0284c7" style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>Blood work is due in 14 days. Automated reminder scheduled.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'activity',
      label: 'Timeline',
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '2rem' }}>
          <UniversalTimeline entityId={patient.id} entityType="patient" />
        </div>
      )
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', height: '600px' }}>
          <TasksEngine entityId={patient.id} />
        </div>
      )
    },
    {
      id: 'communications',
      label: 'Communications',
      content: (
        <div style={{ height: '600px' }}>
          <CommunicationHub 
            entityId={patient.id} 
            entityType="patient" 
            entityName={patient.name} 
            email={patient.email} 
            phone={patient.phone} 
          />
        </div>
      )
    },
    {
      id: 'digital-twin',
      label: 'Digital Twin',
      content: <DigitalTwin patient={patient} />
    },
    {
      id: 'programs',
      label: 'Programs',
      content: <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Program management view goes here.</div>
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
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
            {patient.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{patient.name}</h1>
              <StatusChip status={patient.status} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> {patient.clinic}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14}/> {patient.program}</span>
              <span>Patient ID: {patient.id}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MailOpen size={16} /> Contact
          </button>
          <button className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={16} /> New Order
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
            patient={patient}
            physician={mockPhysician}
            clinic={mockClinic}
            manager={mockManager}
            activeEntity="patient"
          />

          {/* Mini Stats under the relationship graph */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <RevenueWidget entityId={patient.id} entityType="patient" />
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Risk Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: patient.riskScore === 'High' ? 'var(--color-danger)' : 'var(--color-success)' }}>{patient.riskScore}</div>
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