import Mail from "lucide-react/dist/esm/icons/mail";
import Play from "lucide-react/dist/esm/icons/play";
import Pause from "lucide-react/dist/esm/icons/pause";
import Plus from "lucide-react/dist/esm/icons/plus";
import Clock from "lucide-react/dist/esm/icons/clock";
import Users from "lucide-react/dist/esm/icons/users";
import React from 'react';







const DripMarketing = () => {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>Drip Marketing & Automations</h1>
          <p style={{ color: 'var(--rp-theme-text-muted, #64748b)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>Manage email sequences and automated patient journeys</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', transition: 'background-color 0.2s', fontSize: '0.875rem', fontWeight: '500', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}>
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--rp-theme-surface, #ffffff)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--rp-theme-border, #e2e8f0)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '0.5rem' }}>
            <Mail size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--rp-theme-text-muted, #64748b)', fontWeight: '500', margin: 0 }}>Active Campaigns</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>3</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--rp-theme-surface, #ffffff)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--rp-theme-border, #e2e8f0)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '0.5rem' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--rp-theme-text-muted, #64748b)', fontWeight: '500', margin: 0 }}>Enrolled Patients</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>142</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--rp-theme-surface, #ffffff)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--rp-theme-border, #e2e8f0)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '0.5rem' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--rp-theme-text-muted, #64748b)', fontWeight: '500', margin: 0 }}>Avg. Open Rate</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>46.2%</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--rp-theme-surface, #ffffff)', borderRadius: '0.75rem', border: '1px solid var(--rp-theme-border, #e2e8f0)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--rp-theme-border, #e2e8f0)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>Active Sequences</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { id: 1, name: 'Welcome Series (New Patients)', status: 'active', steps: 4, enrolled: 45, openRate: '52%' },
            { id: 2, name: 'Post-Purchase BPC-157 Guide', status: 'active', steps: 3, enrolled: 89, openRate: '61%' },
            { id: 3, name: 'Reactivation (60 days inactive)', status: 'paused', steps: 2, enrolled: 210, openRate: '28%' }
          ].map((campaign, index) => (
            <div key={campaign.id} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background-color 0.2s', borderTop: index > 0 ? '1px solid var(--rp-theme-border, #f1f5f9)' : 'none' }}
                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--rp-theme-surface-hover, #f8fafc)'}
                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '9999px', backgroundColor: campaign.status === 'active' ? '#d1fae5' : '#f1f5f9', color: campaign.status === 'active' ? '#059669' : '#475569' }}>
                  {campaign.status === 'active' ? <Play size={16} /> : <Pause size={16} />}
                </div>
                <div>
                  <h3 style={{ fontWeight: '600', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>{campaign.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--rp-theme-text-muted, #64748b)', margin: 0 }}>{campaign.steps} steps • {campaign.enrolled} currently enrolled</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--rp-theme-text, #1e293b)', margin: 0 }}>{campaign.openRate}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--rp-theme-text-muted, #64748b)', margin: 0 }}>Open Rate</p>
                </div>
                <button style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}>
                  Edit Sequence
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DripMarketing;