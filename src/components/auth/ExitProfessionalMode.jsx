"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';






import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogIn, ShieldAlert, Globe, Info } from '@/lib/icons';
import { FocusedCardLayout } from '@/components/shared/layouts';

export default function ExitProfessionalMode({ onBack, onLogin }) {
  const { t } = useTranslation();
  const router = useRouter();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = onBack || (() => router.push('/'));
  const handleLogin = onLogin || (() => router.push('/login'));

  return (
    <FocusedCardLayout
      icon={ShieldAlert}
      tone="neutral"
      maxWidth="560px"
      title={t('auth.exit.title', 'Professional Session Ended')}
      subtitle={t('auth.exit.desc', 'You have successfully exited the Professional Portal. You are now browsing as a guest.')}
      actions={
        <>
          <button
            className="btn btn-primary"
            onClick={handleBack}
            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={18} /> {t('auth.exit.btnGuest', 'Continue as Guest')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: '2px solid var(--border)',
              color: 'var(--text-main)'
            }}
          >
            <LogIn size={18} /> {t('auth.exit.btnSignIn', 'Sign In Again')}
          </button>
        </>
      }
      footerNote={
        <span>
          {t('auth.exit.needAccess', 'Need professional access?')}{' '}
          <span style={{ color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer' }} onClick={handleLogin}>
            {t('auth.exit.applyHere', 'Apply here')}
          </span>
        </span>
      }
    >
      <div style={{
        textAlign: 'left',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid var(--border)',
        display: 'grid',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--secondary)', flexShrink: 0 }}><Globe size={20} /></div>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.95rem' }}>{t('auth.exit.guestTitle', 'Guest Interface')}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('auth.exit.guestDesc', 'Information is now organized for general discovery. Some technical research sections may be restricted.')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--secondary)', flexShrink: 0 }}><Info size={20} /></div>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.95rem' }}>{t('auth.exit.pricingTitle', 'Pricing Differences')}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('auth.exit.pricingDesc', 'Guest pricing is standard. Institutional and research-grade volume discounts are only visible to verified professionals.')}
            </p>
          </div>
        </div>
      </div>
    </FocusedCardLayout>
  );
}