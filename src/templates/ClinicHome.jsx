import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import DashboardEngine from '../engine/DashboardEngine';

export default function ClinicHome() {
  const { user, userProfile } = useAuth();

  return (
    <div className="template-root" style={{ 
      paddingTop: 'clamp(5rem, 10vw, 8rem)', 
      minHeight: '100vh', 
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '4rem' }}>
        
        <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
              <ShieldCheck size={36} /> Panel de Clinic
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
              Gestión B2B, Pedidos y Panel de Control.
            </p>
          </div>
          
          <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
              {userProfile?.firstName?.[0] || 'C'}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                {userProfile?.firstName} {userProfile?.lastName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Clinic
              </div>
            </div>
          </div>
        </div>

      <DashboardEngine role="clinic" dataContext={{}} />

      </div>
    </div>
  );
}
