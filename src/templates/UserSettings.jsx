import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsLayout from '../components/settings/SettingsLayout';



export default function UserSettings({ onBack }) {
  const { activeRole, isProfessional } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (activeRole && activeRole !== 'patient' && activeRole !== 'professional' && location.pathname === '/settings') {
      if (activeRole === 'admin') navigate('/admin/settings', { replace: true });
      else if (activeRole === 'doctor') navigate('/doctor/settings', { replace: true });
      else if (activeRole === 'wholesaler' || activeRole === 'clinic' || activeRole === 'pharmacy') navigate('/wholesaler/settings', { replace: true });
      else if (activeRole === 'supplier') navigate('/supplier-dashboard/settings', { replace: true });
      else if (activeRole === 'account_manager') navigate('/account-manager/settings', { replace: true });
    }
  }, [activeRole, location.pathname, navigate]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (activeRole === 'admin') navigate('/admin');
    else if (activeRole === 'doctor') navigate('/doctor');
    else if (activeRole === 'wholesaler' || activeRole === 'clinic' || activeRole === 'pharmacy') navigate('/wholesaler');
    else if (activeRole === 'supplier') navigate('/supplier-dashboard');
    else if (activeRole === 'account_manager') navigate('/account-manager');
    else navigate('/patient');
  };

  return (
    <div className="template-root" style={{ 
      paddingTop: 'clamp(5rem, 10vw, 8rem)', 
      minHeight: '100vh', 
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)'
    }}>
      <div className="container" style={{ maxWidth: '1000px', paddingBottom: '6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={handleBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, 
              padding: '0.5rem 1rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} strokeWidth={1.2} /> DASHBOARD
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                My Profile & Settings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                Manage your account, preferences, and security.
              </p>
            </div>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.75rem 1.25rem', background: isProfessional ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,54,102,0.05)',
              borderRadius: '16px', border: `1px solid ${isProfessional ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`
            }}>
              <ShieldCheck size={20} strokeWidth={1.2} color={isProfessional ? 'var(--success)' : 'var(--primary)'} />
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isProfessional ? 'var(--success)' : 'var(--primary)', textTransform: 'uppercase' }}>
                {isProfessional ? 'Verified Professional' : 'Standard Access'}
              </div>
            </div>
          </div>
        </div>

        <SettingsLayout onBack={handleBack} />

      </div>
    </div>
  );
}