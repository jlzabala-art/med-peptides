import { Building, Pill, Microscope, Truck, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserSegmentEntry({ onNavigate }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const segments = [
    { 
      title: 'Clinic', 
      icon: <Building size={32} />, 
      desc: 'Scale your practice with precision.',
      features: ['Patient titration protocols', 'Secure clinical history tracking', 'Authorized practitioner dashboard'],
      action: '/auth?role=clinic' 
    },
    { 
      title: 'Pharmacy', 
      icon: <Pill size={32} />, 
      desc: 'Institutional supply & logistics.',
      features: ['Bulk volume acquisitions', 'White-label fulfillment options', 'Direct API inventory integration'],
      action: '/auth?role=pharmacy' 
    },
    { 
      title: 'Researcher', 
      icon: <Microscope size={32} />, 
      desc: 'Advanced analytical materials.',
      features: ['HPLC/MS batch verification', 'Analytical reference materials', 'Custom synthesis coordination'],
      action: '/products' 
    },
    { 
      title: 'Distributor', 
      icon: <Truck size={32} />, 
      desc: 'Global logistics partnerships.',
      features: ['Cold-chain logistics network', 'Multi-region compliance', 'Volume tier agreements'],
      action: '/contact' 
    }
  ];

  return (
    <section className="section" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 6vw, 4rem)' }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            color: 'var(--text-main)', 
            marginBottom: '1rem',
            fontWeight: 800,
            letterSpacing: '-0.03em'
          }}>
            Who are you?
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Select your profile to customize your research experience and access tailored clinical resources.
          </p>
        </div>
        
        <div className="grid-4" style={{ gap: 'clamp(1rem, 2vw, 2rem)' }}>
          {segments.map((seg, i) => (
            <div 
              key={i}
              onClick={() => onNavigate(seg.action)}
              className="card segment-card"
              style={{
                padding: 'clamp(2rem, 4vw, 3rem) 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                backgroundColor: 'white'
              }}
            >
              <div className="segment-icon-wrapper" style={{ 
                color: 'var(--secondary)', 
                background: 'rgba(0,163,224,0.06)',
                width: '80px', height: '80px',
                borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                {seg.icon}
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '0.75rem', 
                  color: 'var(--text-main)', 
                  fontWeight: 800,
                  letterSpacing: '-0.02em'
                }}>{seg.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>{seg.desc}</p>
                
                <ul style={{ 
                  margin: 0, 
                  padding: 0, 
                  listStyle: 'none', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.55rem',
                  textAlign: 'left'
                }}>
                  {seg.features.map((feat, idx) => (
                    <li key={idx} style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-main)', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--secondary)', flexShrink: 0 }} />
                      <span style={{ opacity: 0.9 }}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <style dangerouslySetInnerHTML={{ __html: `
                .segment-card:hover {
                  border-color: var(--secondary) !important;
                  background-color: rgba(0, 163, 224, 0.02) !important;
                }
                .segment-card:hover .segment-icon-wrapper {
                  background-color: var(--secondary);
                  color: white;
                  transform: scale(1.1) rotate(5deg);
                }
                @media (max-width: 768px) {
                  .segment-card {
                    flex-direction: row !important;
                    text-align: left !important;
                    padding: 1.5rem !important;
                    gap: 1.5rem !important;
                    justify-content: flex-start !important;
                  }
                  .segment-icon-wrapper {
                    width: 60px !important;
                    height: 60px !important;
                    flex-shrink: 0 !important;
                  }
                  .segment-card h3 {
                    margin-bottom: 0.25rem !important;
                  }
                }
              `}} />
            </div>
          ))}
        </div>

        {/* AUTHENTICATION CONDITIONAL SECTION */}
        <div style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          padding: '3rem 2rem', 
          backgroundColor: 'rgba(0,163,224,0.05)', 
          borderRadius: '24px',
          border: '1px solid var(--accent-soft)'
        }}>
          {!user ? (
            <>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                These advanced tools require verified professional registration.
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                Register to access the clinical protocol builder, multi-phase titration schedules, and economic forecasting tools.
              </p>
              <button 
                onClick={() => navigate('/auth')}
                className="cta-button"
                style={{
                  background: 'white',
                  color: 'var(--primary)',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  border: '2px solid var(--primary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                <UserCheck size={18} /> Request Verified Access
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                Access your professional tools
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                You are currently authenticated. Launch the dashboard to manage your research properties and clinical protocols.
              </p>
              <button 
                onClick={() => navigate('/protocol-builder')}
                className="cta-button"
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(0,54,102,0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
