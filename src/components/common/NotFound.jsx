 
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ArrowLeft, FlaskConical } from 'lucide-react';
import { track404 } from '../../hooks/useAnalytics';

const NotFound = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    track404(location.pathname);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#040508',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '30%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0, 163, 224, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '30%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '4rem 2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(0, 163, 224, 0.1)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          border: '1px solid rgba(0, 163, 224, 0.2)'
        }}>
          <FlaskConical size={40} color="var(--color-primary)" strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontSize: '5rem',
          fontWeight: 900,
          margin: '0 0 1rem',
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-bg-surface)',
          margin: '0 0 1.5rem',
          letterSpacing: '-0.01em'
        }}>
          Page Not Found
        </h2>

        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.6,
          margin: '0 0 3rem',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          The experimental path you're looking for doesn't exist. It might have been synthesized into a new route or expired.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '12px'
            }}
          >
            <Home size={18} />
            Return Home
          </button>

          <button 
            onClick={() => onBack ? onBack() : navigate(-1)}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              color: 'var(--color-bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
