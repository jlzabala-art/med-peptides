'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Sparkles, 
  Briefcase, 
  Mail, 
  FileText, 
  Stethoscope, 
  MessageSquare
} from '@/lib/icons';
import { useUIStore } from '@/stores/uiStore';

export default function MobileSpeedDialFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setActiveModal } = useUIStore();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const actions = [
    {
      id: 'ai-scribe',
      label: 'AI Clinical Scribe',
      icon: Stethoscope,
      color: '#0d9488',
      bgColor: '#ccfbf1',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('OPEN_AI_CLINICAL_SCRIBE'));
        setIsOpen(false);
      }
    },
    {
      id: 'invite-user',
      label: 'Invite Practitioner (WhatsApp)',
      icon: MessageSquare,
      color: '#16a34a',
      bgColor: '#dcfce7',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('OPEN_INVITE_USER_MODAL'));
        setIsOpen(false);
      }
    },
    {
      id: 'workspace',
      label: 'Workspace Buffer & Quotes',
      icon: Briefcase,
      color: '#0284c7',
      bgColor: '#e0f2fe',
      onClick: () => {
        if (setActiveModal) setActiveModal('cart');
        window.dispatchEvent(new CustomEvent('open-cart'));
        setIsOpen(false);
      }
    },
    {
      id: 'atlas-ai',
      label: 'Ask Atlas AI Copilot',
      icon: Sparkles,
      color: '#9333ea',
      bgColor: '#f3e8ff',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-clinical-ai'));
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            animation: 'fadeIn 0.15s ease-out'
          }}
        />
      )}

      {/* Floating Speed Dial Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.75rem'
      }}>
        {/* Expanded Action Sheet items */}
        {isOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            alignItems: 'flex-end',
            marginBottom: '0.5rem',
            animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '30px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{act.label}</span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: act.bgColor,
                    color: act.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Quick Actions Speed Dial"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            backgroundColor: isOpen ? '#334155' : 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 25px rgba(0, 163, 224, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
            transform: isOpen ? 'rotate(45deg)' : 'none'
          }}
        >
          <Plus size={28} strokeWidth={2.4} />
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
