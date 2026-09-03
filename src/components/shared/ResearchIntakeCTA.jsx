import React from 'react';

import useGuestPreferences from '../../hooks/useGuestPreferences';
import { Sparkles } from '@/lib/icons';

export default function ResearchIntakeCTA() {
  const { hasCompleted, goalMeta, levelMeta, clearPrefs } = useGuestPreferences();

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
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 12px 32px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          width: 44, height: 44, 
          background: 'rgba(26, 115, 232, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          marginBottom: '0.75rem', color: '#1a73e8',
          fontSize: '1.25rem', fontWeight: 'bold'
        }}>
          ✓
        </div>

        <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}>
          Your experience has been personalized.
        </h2>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '500px', lineHeight: 1.5 }}>
          Atlas AI adapts recommendations based on your selected goals:
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {goalMeta && (
            <span style={{ background: 'rgba(26, 115, 232, 0.08)', color: '#1a73e8', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
              {goalMeta.icon} {goalMeta.label}
            </span>
          )}
          {levelMeta && (
            <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
              {levelMeta.icon} {levelMeta.label}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={handleOpenDrawer}
            style={{
              background: 'transparent',
              color: '#1a73e8',
              border: '1px solid rgba(26, 115, 232, 0.3)',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            Edit Preferences
          </button>
          <button 
            onClick={clearPrefs}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              padding: '0.5rem 0.75rem',
            }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: '1.25rem auto',
      maxWidth: '720px',
      background: 'var(--surface-raised, #ffffff)',
      border: '1px solid rgba(14, 165, 233, 0.18)',
      borderRadius: '16px',
      padding: '1.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: 44, height: 44, 
        background: 'rgba(14, 165, 233, 0.1)', 
        borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        marginBottom: '0.85rem', color: '#0ea5e9'
      }}>
        <Sparkles size={22} />
      </div>

      <h2 style={{ margin: '0 0 0.4rem 0', fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>
        Personalize Your Research with Atlas AI
      </h2>
      <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '480px', lineHeight: 1.45 }}>
        Tell us your goals and receive tailored research, protocols and recommendations.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={handleOpenDrawer}
          style={{
            background: 'var(--primary, #003666)', 
            color: 'white',
            border: 'none', 
            borderRadius: '999px',
            padding: '0.65rem 1.6rem', 
            cursor: 'pointer',
            fontSize: '0.9rem', 
            fontWeight: 700,
            transition: 'all 0.2s ease',
            boxShadow: '0 3px 12px rgba(0, 54, 102, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 5px 16px rgba(0, 54, 102, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 54, 102, 0.15)';
          }}
        >
          Start Personalization →
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>
          ~30 seconds
        </span>
      </div>
    </div>
  );
}