 
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, LogOut, ArrowLeft, HeartPulse, Activity, User, Calendar, Beaker, ClipboardList } from 'lucide-react';

export default function ClinicalLayout() {
  const { user, isPhysician, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Define navigation based on clinical role
  const navItems = isPhysician ? [
    { label: 'Dashboard', path: '/doctor', icon: Activity },
    { label: 'Patients', path: '/doctor/patients', icon: User },
    { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { label: 'Lab Results', path: '/doctor/lab-results', icon: Beaker },
    { label: 'Research', path: '/doctor/research', icon: ClipboardList }
  ] : [
    { label: 'My Treatments', path: '/patient/treatments', icon: Beaker },
    { label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Results', path: '/patient/lab-results', icon: Activity }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-app)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Minimal Clinical Header */}
      <header style={{ 
        backgroundColor: 'var(--color-bg-surface)', 
        borderBottom: '1px solid #e2e8f0',
        padding: '0 2rem',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '10px', 
            backgroundColor: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Med-Peptides</div>
            <div style={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Clinical Portal
            </div>
          </div>
        </div>

        {/* Clinical Navigation */}
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '1.5rem 0', // To make border align with header bottom
                  transition: 'all 0.2s'
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'transparent', border: '1px solid #cbd5e1', 
              padding: '0.5rem 1rem', borderRadius: '8px', 
              color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' 
            }}
          >
            <ArrowLeft size={16} /> Back to Shop
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user?.email?.split('@')[0]}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{isPhysician ? 'Physician' : 'Patient'}</div>
            </div>
            <button 
              onClick={logout}
              title="Cerrar sesión"
              style={{ 
                background: '#f1f5f9', border: 'none', 
                width: '36px', height: '36px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)', cursor: 'pointer' 
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
      
      {/* Minimal Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', borderTop: '1px solid #e2e8f0' }}>
        &copy; {new Date().getFullYear()} Med-Peptides Clinical Systems. Confidencialidad médico-paciente garantizada.
      </footer>
    </div>
  );
}
