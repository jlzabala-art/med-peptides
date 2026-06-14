import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import React from 'react';


import useGuestPreferences from '../../hooks/useGuestPreferences';

export default function ResearchIntakeCTA() {
  const { hasCompleted, goalMeta } = useGuestPreferences();

  const handleOpenDrawer = () => {
    window.dispatchEvent(new Event('open-research-drawer'));
  };

  return (
    <div style={{
      margin: '2rem auto',
      maxWidth: '800px',
      background: 'linear-gradient(145deg, var(--surface), var(--surface-raised))',
      border: '1px solid rgba(26, 115, 232, 0.2)',
      borderRadius: '16px',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient blur */}
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 150, height: 150,
        background: 'radial-gradient(circle, rgba(26,115,232,0.1) 0%, rgba(26,115,232,0) 70%)',
        borderRadius: '50%'
      }} />

      <div style={{
        width: 48, height: 48, 
        background: 'rgba(26, 115, 232, 0.1)', 
        borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        marginBottom: '1rem', color: '#1a73e8'
      }}>
        <Sparkles size={24} />
      </div>

      <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
        {hasCompleted ? 'Update your research profile' : 'Personalize your research with AI'}
      </h2>
      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px' }}>
        {hasCompleted && goalMeta 
          ? `Current focus: ${goalMeta.label}. Chat with ClinicalAI to refine your preferences.`
          : 'Tell ClinicalAI about your goals, experience, and what matters most. We will instantly optimize your experience.'
        }
      </p>

      <button 
        onClick={handleOpenDrawer}
        style={{
          background: '#1a73e8', color: 'white',
          border: 'none', borderRadius: '8px',
          padding: '0.8rem 1.5rem', cursor: 'pointer',
          fontSize: '0.95rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#1557b0';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#1a73e8';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Sparkles size={18} />
        {hasCompleted ? 'Edit Profile' : 'Start Personalization'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}