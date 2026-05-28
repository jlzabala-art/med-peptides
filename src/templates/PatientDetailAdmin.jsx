import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Activity, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PatientDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock patient data for demonstration
  const [patient] = useState({
    id: id || 'PT-00129',
    name: 'Doe, John',
    email: 'john.doe@example.com',
    status: 'Active',
    joined: '2025-01-15',
    activeProtocols: ['Longevity Protocol (BPC-157)', 'Cognitive Boost (Dihexa)'],
    pendingActions: [
      { id: 1, type: 'critical', message: 'Signature required for Consent Form v2', date: 'Today' },
      { id: 2, type: 'warning', message: 'Review newly uploaded lab results', date: 'Yesterday' }
    ]
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-app)', paddingBottom: '4rem' }}>
      {/* Top Navigation Bar - GCP Style */}
      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--color-border)', margin: '0 1.5rem' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={18} color="#0071bd" />
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
            Patient Details: {patient.name}
          </h1>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534',
            padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', marginLeft: '1rem'
          }}>
            {patient.status}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Pending Actions Alert Panel */}
        {patient.pendingActions.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              Action Required
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {patient.pendingActions.map(action => (
                <div key={action.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: 'var(--color-danger-bg)', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid #fee2e2'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#7f1d1d', fontWeight: 500 }}>{action.message}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{action.date}</span>
                    <button style={{
                      backgroundColor: 'var(--color-danger)', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '4px',
                      padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Overview Card */}
            <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', backgroundColor: 'var(--color-bg-app)' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Overview</h3>
              </div>
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Patient ID</div>
                  <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>{patient.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
                  <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>{patient.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Joined Date</div>
                  <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>{patient.joined}</div>
                </div>
              </div>
            </div>

            {/* Active Protocols */}
            <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', backgroundColor: 'var(--color-bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} /> Active Protocols
                </h3>
                <button style={{ backgroundColor: 'transparent', color: '#0071bd', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>+ Assign Protocol</button>
              </div>
              <div style={{ padding: '0' }}>
                {patient.activeProtocols.map((proto, idx) => (
                  <div key={idx} style={{ padding: '1rem 1.5rem', borderBottom: idx !== patient.activeProtocols.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px' }}><FileText size={16} color="var(--color-text-secondary)" /></div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#0f172a' }}>{proto}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#0071bd', fontWeight: 600, cursor: 'pointer' }}>View Details</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', backgroundColor: 'var(--color-bg-app)' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Activity</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ color: 'var(--color-success)', marginTop: '2px' }}><CheckCircle2 size={16} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>Completed Initial Intake</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>2 days ago</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ color: '#0071bd', marginTop: '2px' }}><Activity size={16} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>Assigned Longevity Protocol</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>1 week ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
