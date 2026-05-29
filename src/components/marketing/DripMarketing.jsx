import React, { useState } from 'react';
import { Mail, Clock, Plus, Play, Pause, Settings, Eye } from 'lucide-react';

export default function DripMarketing({ ownerId, ownerType }) {
  const [sequences, setSequences] = useState([
    { id: '1', name: 'New Clinic Onboarding', emails: 4, duration: '14 days', active: true, enrolled: 24 },
    { id: '2', name: 'Peptide Research Education (B2C)', emails: 7, duration: '30 days', active: false, enrolled: 0 }
  ]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Mail size={24} color="var(--primary)" />
            Automated Drip Sequences
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Set up automated email journeys to nurture leads and onboard new clinics.
          </p>
        </div>
        <button className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Create Sequence
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sequences.map(seq => (
          <div key={seq.id} style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: `1px solid ${seq.active ? 'var(--primary-light)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{seq.name}</h3>
                <span style={{ 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  backgroundColor: seq.active ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)',
                  color: seq.active ? 'var(--color-success)' : 'var(--text-muted)'
                }}>
                  {seq.active ? 'Running' : 'Paused'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> {seq.emails} emails</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {seq.duration}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><strong>{seq.enrolled}</strong> currently enrolled</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="secondary-button" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {seq.active ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button className="secondary-button" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={18} />
              </button>
              <button className="secondary-button" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
