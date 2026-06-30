import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';

const SIMULATION_ROLES = [
  {
    id: 'wholesaler',
    title: 'Wholesaler',
    description: 'B2B portal for buying wholesale peptides.',
    icon: Building2,
    color: '#0ea5e9',
    email: 'wholesaler@regenpept.test',
  },
  {
    id: 'supplier',
    title: 'Supplier',
    description: 'Portal for suppliers receiving POs and uploading CoAs.',
    icon: Truck,
    color: '#f59e0b',
    email: 'supplier@regenpept.test',
  },
  {
    id: 'medical_director',
    title: 'Medical Director',
    description: 'Clinical portal for managing patients and protocols.',
    icon: Stethoscope,
    color: '#10b981',
    email: 'medical_director@regenpept.test',
  },
  {
    id: 'patient',
    title: 'Patient',
    description: 'Consumer portal for viewing treatments and lab results.',
    icon: HeartPulse,
    color: '#ec4899',
    email: 'patient@regenpept.test',
  },
  {
    id: 'account_manager',
    title: 'Account Manager',
    description: 'Internal operations for managing client accounts.',
    icon: ShieldCheck,
    color: '#8b5cf6',
    email: 'account_manager@regenpept.test',
  },
];

export default function SimulationHub() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSimulate = async (role) => {
    setIsSimulating(true);
    setError('');
    setSelectedRole(role.id);
    try {
      // In this setup, we assume all test accounts share a common secure dummy password
      // or that the AuthContext's login can bypass it if it detects a .test domain.
      // Since it's Firebase Auth, these accounts MUST exist in Firebase Auth 
      // with this standard password.
      await login(role.email, 'Regenpept2026!');
      // Login successful. The AppRouter will redirect based on the user's role 
      // when AuthContext updates. We force a reload to ensure fresh layout state.
      window.location.href = '/';
    } catch (err) {
      console.error('Simulation error:', err);
      setError(`Failed to simulate ${role.title}. Ensure the test account (${role.email}) exists in Firebase Auth with password 'Regenpept2026!'.`);
    } finally {
      setIsSimulating(false);
      setSelectedRole(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Role Simulation Hub
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>
          Instantly switch to different user roles to verify their specific portals and data access. 
          This connects to real Firebase data using predefined test accounts.
        </p>
      </header>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {SIMULATION_ROLES.map((role) => {
          const Icon = role.icon;
          const isProcessing = isSimulating && selectedRole === role.id;

          return (
            <div
              key={role.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${role.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: role.color
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {role.title}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                    {role.email}
                  </span>
                </div>
              </div>

              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flexGrow: 1, marginBottom: '1.5rem' }}>
                {role.description}
              </p>

              <button
                onClick={() => handleSimulate(role)}
                disabled={isSimulating}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: role.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: isSimulating && selectedRole !== role.id ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Connecting...
                  </>
                ) : (
                  'Simulate Role'
                )}
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
