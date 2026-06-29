import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Bug from 'lucide-react/dist/esm/icons/bug';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Activity from 'lucide-react/dist/esm/icons/activity';
import User from 'lucide-react/dist/esm/icons/user';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import { useNavigate } from 'react-router-dom';

export default function DevAutoLogin() {
  const { login, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (import.meta.env.MODE === 'production') {
    return null;
  }

  const DEV_ACCOUNTS = [
    {
      label: 'Admin',
      email: 'admin@regenpept.test',
      icon: <ShieldCheck size={14} />,
      role: 'admin',
    },
    {
      label: 'Medical Director',
      email: 'medical_director@regenpept.test',
      icon: <Activity size={14} />,
      role: 'medical_director',
    },
    {
      label: 'Fagron Doctor',
      email: 'fagron_doctor@regenpept.test',
      icon: <FlaskConical size={14} />,
      role: 'fagron_doctor',
    },
    {
      label: 'Doctor',
      email: 'doctor@regenpept.test',
      icon: <FlaskConical size={14} />,
      role: 'doctor',
    },
    {
      label: 'Patient',
      email: 'patient@regenpept.test',
      icon: <User size={14} />,
      role: 'patient',
    },
  ];

  const handleLogin = async (email) => {
    try {
      await login(email, 'password123');
      setIsOpen(false);
      navigate('/');
    } catch (e) {
      console.error('AutoLogin failed:', e);
      alert(`AutoLogin failed for ${email}. Make sure the user is seeded.`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {isOpen ? (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '200px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              DEV AUTOLOGIN
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>

          {user && (
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--color-danger)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              Sign Out
            </button>
          )}

          {!user &&
            DEV_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleLogin(acc.email)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--color-bg-surface)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ color: 'var(--primary)' }}>{acc.icon}</span>
                {acc.label}
              </button>
            ))}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,54,102,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Dev AutoLogin"
        >
          <Bug size={20} />
        </button>
      )}
    </div>
  );
}
