import React from 'react';

import useGuestPreferences from '../../hooks/useGuestPreferences';
import { Sparkles } from '@/lib/icons';

export default function ResearchIntakeCTA() {
  const { hasCompleted } = useGuestPreferences();

  const handleOpenDrawer = () => {
    window.dispatchEvent(new Event('open-research-drawer'));
  };

  if (hasCompleted) {
    return (
      <div style={{
        margin: '2rem auto',
        maxWidth: '800px',
        background: 'var(--surface-raised)',
        border: '1px solid rgba(26, 115, 232, 0.2)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 12px 32px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          width: 48, height: 48, 
          background: 'rgba(26, 115, 232, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          marginBottom: '1rem', color: '#1a73e8',
          fontSize: '1.25rem', fontWeight: 'bold'
        }}>
          ✓
        </div>

        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}>
          Your experience has been personalized.
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', lineHeight: 1.5 }}>
          Atlas AI is now adapting recommendations to your goals.
        </p>

        <button 
          onClick={handleOpenDrawer}
          style={{
            background: 'transparent',
            color: '#1a73e8',
            border: '1px solid rgba(26, 115, 232, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(26, 115, 232, 0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Edit Preferences
        </button>
      </div>
    );
  }

  return (
    <div style={{
      margin: '2rem auto',
      maxWidth: '800px',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: '0 12px 48px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 56, height: 56, 
        background: 'rgba(26, 115, 232, 0.08)', 
        borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        marginBottom: '1.25rem', color: '#1a73e8'
      }}>
        <Sparkles size={28} />
      </div>

      <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>
        Personalize Your Research with AI
      </h2>
      <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '540px', lineHeight: 1.5 }}>
        Tell Atlas AI about your goals and we'll instantly tailor protocols, articles and recommendations specifically for you.
      </p>
      
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '2rem' }}>
        Estimated time: 30 seconds
      </div>

      <button 
        onClick={handleOpenDrawer}
        style={{
          background: '#111', color: 'white',
          border: 'none', borderRadius: '8px',
          padding: '0.9rem 2rem', cursor: 'pointer',
          fontSize: '1rem', fontWeight: 500,
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          letterSpacing: '0.01em'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
        }}
      >
        Start Personalization
      </button>
    </div>
  );
}