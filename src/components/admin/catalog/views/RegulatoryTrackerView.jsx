import React, { useState } from 'react';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Download from 'lucide-react/dist/esm/icons/download';
import Bot from 'lucide-react/dist/esm/icons/bot';
import Search from 'lucide-react/dist/esm/icons/search';

import { useComplianceProfiles } from './RegulatoryIntelligence/useComplianceProfiles';
import { ComplianceDashboard } from './RegulatoryIntelligence/ComplianceDashboard';
import { PriorityQueue } from './RegulatoryIntelligence/PriorityQueue';
import { ComplianceList } from './RegulatoryIntelligence/ComplianceList';
import { ComplianceDrawer } from './RegulatoryIntelligence/ComplianceDrawer';
import { ComplianceTimeline } from './RegulatoryIntelligence/ComplianceTimeline';

export default function RegulatoryTrackerView({ variants = [] }) {
  const { profiles, metrics, priorityQueue } = useComplianceProfiles(variants);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [activeView, setActiveView] = useState('list'); // 'list' or 'timeline'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
            }}
          >
            <ShieldCheck size={28} color="#4f46e5" />
            Regulatory Intelligence
          </h2>
          <p
            style={{
              marginTop: '4px',
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: '4px 0 0 0',
            }}
          >
            Scaleable compliance tracking across multiple suppliers and markets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveView('list')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: activeView === 'list' ? '#f3f4f6' : '#fff',
              border: '1px solid #e5e7eb',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Profiles
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: activeView === 'timeline' ? '#f3f4f6' : '#fff',
              border: '1px solid #e5e7eb',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Timeline
          </button>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              padding: '8px 16px',
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Download size={16} style={{ marginRight: '8px' }} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Dashboard (Mobile scrollable) */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ minWidth: '800px' }}>
          <ComplianceDashboard metrics={metrics} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Main Area */}
        <div
          style={{
            gridColumn: 'span 2 / span 2',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Atlas Assistant */}
          <div
            style={{
              background: 'linear-gradient(to right, #312e81, #0f172a)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              color: '#fff',
              border: '1px solid #3730a3',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
              <div
                style={{
                  flexShrink: 0,
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <Bot size={32} color="#a5b4fc" />
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: '250px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                    Atlas Compliance Assistant
                  </h3>
                  <p style={{ color: '#c7d2fe', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                    Ask me to compare suppliers, assess risks, or generate audit readiness reports.
                  </p>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    color="#a5b4fc"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g., 'Compare compliance status between Lotusland and NP Labs in KSA'"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      color: '#e0e7ff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    onClick={() => setAiQuery('Show products missing COA')}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#c7d2fe',
                      cursor: 'pointer',
                    }}
                  >
                    Missing COAs
                  </button>
                  <button
                    onClick={() => setAiQuery('Which registrations expire in next 30 days?')}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#c7d2fe',
                      cursor: 'pointer',
                    }}
                  >
                    Upcoming Expiries
                  </button>
                  <button
                    onClick={() => setAiQuery('Generate audit readiness report.')}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#c7d2fe',
                      cursor: 'pointer',
                    }}
                  >
                    Audit Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {activeView === 'list' ? (
            <ComplianceList profiles={profiles} onSelectProfile={setSelectedProfile} />
          ) : (
            <ComplianceTimeline profiles={profiles} onSelectProfile={setSelectedProfile} />
          )}
        </div>

        {/* Sidebar / Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PriorityQueue queue={priorityQueue} onSelectProfile={setSelectedProfile} />
        </div>
      </div>

      {selectedProfile && (
        <>
          <div
            onClick={() => setSelectedProfile(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 999,
              backdropFilter: 'blur(2px)',
            }}
          />
          <ComplianceDrawer profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
        </>
      )}
    </div>
  );
}
