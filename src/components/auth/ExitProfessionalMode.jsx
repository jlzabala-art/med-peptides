import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import LogIn from "lucide-react/dist/esm/icons/log-in";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Globe from "lucide-react/dist/esm/icons/globe";
import Info from "lucide-react/dist/esm/icons/info";
import React, { useEffect } from 'react';





import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExitProfessionalMode({ onBack, onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = onBack || (() => navigate('/'));
  const handleLogin = onLogin || (() => navigate('/login'));

  return (
    <div className="view-container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'flex-start',
      backgroundColor: 'transparent',
      padding: '4rem 2rem'
    }}>
      <div className="card" style={{ 
        maxWidth: '560px', 
        width: '100%', 
        padding: 'clamp(2rem, 5vw, 3.5rem)', 
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ 
          width: '80px', height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(100, 116, 139, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem auto',
          color: 'var(--text-muted)'
        }}>
          <ShieldAlert size={40} />
        </div>

        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 800, 
          color: 'var(--primary)', 
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          {t('auth.exit.title', 'Professional Session Ended')}
        </h1>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '1.1rem', 
          lineHeight: 1.6,
          marginBottom: '2.5rem'
        }}>
          {t('auth.exit.desc', 'You have successfully exited the Professional Portal. You are now browsing as a guest.')}
        </p>

        <div style={{ 
          textAlign: 'left', 
          backgroundColor: 'var(--color-bg-surface)', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid var(--border)',
          marginBottom: '2.5rem',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t('auth.exit.needAccess', 'Need professional access?')} <span style={{ color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer' }} onClick={handleLogin}>{t('auth.exit.applyHere', 'Apply here')}</span>
        </p>
      </div>
    </div>
  );
}