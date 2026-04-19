import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building2, ArrowLeft, ShieldCheck, Clock, CheckCircle, Microscope, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

export default function AuthPage({ onBack }) {
  const { user, userProfile, isProfessional, login, register, logout, resetPassword, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileBenefitsOpen, setMobileBenefitsOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      setSuccess('Logged in successfully!');
      setTimeout(() => onBack?.(), 1500);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message);
      }
    }
    setSubmitting(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!userType) {
      setError('Please select a profession/user type.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, fullName, institution, userType);
      setSuccess('Account created! Your profile is pending activation by our team.');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in.');
      } else {
        setError(err.message);
      }
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccess('Logged in with Google successfully!');
      setTimeout(() => onBack?.(), 1500);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  // If user is logged in, show profile status (Centered layout)
  if (user) {
    return (
      <div className="template-root" style={{ paddingTop: 'clamp(2rem, 8vw, 6rem)', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '550px' }}>
          <div className="card" style={{ padding: 'clamp(2rem, 5vw, 3rem)', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              borderRadius: '50%', 
              background: isProfessional 
                ? 'linear-gradient(135deg, var(--success), #059669)' 
                : 'linear-gradient(135deg, var(--secondary), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: isProfessional 
                ? '0 10px 30px rgba(16, 185, 129, 0.3)' 
                : '0 10px 30px rgba(0, 163, 224, 0.3)'
            }}>
              {isProfessional ? <ShieldCheck size={36} color="white" /> : <Clock size={36} color="white" />}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {user.displayName || 'Welcome'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user.email}</p>

            {isProfessional ? (
              <div style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)', 
                padding: '1.25rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <CheckCircle size={18} /> Professional Account Active
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                  You have full access to professional research features and bulk acquisitions.
                </p>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'rgba(0, 163, 224, 0.08)', 
                border: '1px solid rgba(0, 163, 224, 0.2)',
                borderRadius: 'var(--radius-md)', 
                padding: '1.25rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <Clock size={18} /> Pending Activation
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                  Your professional account is pending activation by our team. This activation will grant access to features not available to non-professional users.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button onClick={onBack} className="btn btn-primary" style={{ width: '100%' }}>
                Continue Browsing
              </button>
              <button 
                onClick={logout} 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.8rem',
    borderRadius: 'var(--radius-md)',
    border: '2px solid var(--border)',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: '#f8fafc'
  };

  const iconWrapStyle = {
    position: 'absolute',
    left: '0.9rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center',
    pointerEvents: 'none'
  };

  const benefitsList = (
    <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><CheckCircle size={22} /></div>
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Institutional Pricing</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Unlock volume-based tier pricing tailored for sustained, large-scale clinical studies.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><ShieldCheck size={22} /></div>
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Batch Certificates of Analysis</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Direct access to specialized platform support and immediate downloads of QA/QC documentation.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><Microscope size={22} /></div>
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Exclusive Formulations</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Early access to newly synthesized target compounds and custom synthesis request capabilities.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page-root" style={{ backgroundColor: 'var(--surface)', minHeight: '100vh' }}>
      <style>{`
        /* ── Mobile-first container ── */
        .auth-container {
          padding: 1rem;
          max-width: 1050px;
          margin: 0 auto;
        }

        /* ── Two-column flex grid ── */
        .auth-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        @media (min-width: 850px) {
          .auth-container { padding: 1rem 2rem; }
          .auth-grid {
            flex-direction: row;
            align-items: flex-start;
            gap: 4rem;
            padding-top: 4rem;
          }
          .auth-form-column  { flex: 1; order: 2; }
          .auth-benefits-column { flex: 1; order: 1; position: sticky; top: 100px; }
        }

        /* ── Fat-finger friendly inputs (prevents iOS zoom) ── */
        .mobile-input {
          height: 54px !important;
          font-size: 16px !important;
        }

        /* ── iOS-style segmented tab control ── */
        .auth-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 2rem;
          gap: 2px;
        }
        .auth-tab-btn {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: var(--font-sans);
          background: transparent;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .auth-tab-btn.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* ── Mobile accordion hidden on desktop ── */
        .benefits-accordion-mobile { display: block; border-top: 1px solid var(--border); padding-top: 1.5rem; }
        @media (min-width: 850px) {
          .benefits-accordion-mobile { display: none; }
        }
      `}</style>
      
      <div className="auth-container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', padding: '12px 0',
              color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.95rem', fontFamily: 'var(--font-sans)',
              marginBottom: '0.5rem', transition: 'color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={20} /> Back to browsing
          </button>
        )}

        <div className="auth-grid">
          
          {/* LEFT COLUMN: Values (Desktop) / TOP (Mobile handled by order) */}
          <div className="auth-benefits-column benefits-panel-desktop">
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.15, marginBottom: '1.25rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              Elevate Your <br />Research Pipeline
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem', maxWidth: '450px', lineHeight: 1.6 }}>
              A Professional Access account grants eligible institutions and advanced practitioners exclusive capabilities designed for high-volume research applications.
            </p>
            {benefitsList}
          </div>

          {/* RIGHT COLUMN: The Form */}
          <div className="auth-form-column card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: '480px', margin: '0 auto', width: '100%' }}>

            {/* Simplified mobile header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {tab === 'login' ? 'Welcome Back' : 'Join the Network'}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Professional research access and institutional logistics.
              </p>
            </div>

            {/* Tabs — iOS segmented control */}
            <div className="auth-tabs">
              <button
                className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              >
                Register
              </button>
            </div>

            {error && (
              <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-sm)', 
                padding: '0.85rem 1rem', 
                marginBottom: '1.5rem',
                color: '#dc2626', 
                fontSize: '0.9rem', 
                fontWeight: 500 
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-sm)', 
                padding: '0.85rem 1rem', 
                marginBottom: '1.5rem',
                color: 'var(--success)', 
                fontSize: '0.9rem', 
                fontWeight: 500 
              }}>
                {success}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.15rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Mail size={18} /></div>
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Institutional Email" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Lock size={18} /></div>
                  <input 
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                
                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    style={{ 
                      background: 'none', border: 'none', 
                      color: 'var(--primary)', fontSize: '0.85rem', 
                      fontWeight: 600, cursor: 'pointer', padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={submitting}>
                  {submitting ? 'Authenticating...' : 'Secure Sign In'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                  <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  className="btn btn-secondary" 
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem',
                    backgroundColor: 'white',
                    border: '2px solid var(--border)',
                    color: 'var(--text-main)',
                    padding: '0.9rem'
                  }} 
                  disabled={submitting}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with SSO
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.15rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><User size={18} /></div>
                  <input 
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Professional Name" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                
                {/* NEW USER TYPE SELECTOR */}
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><GraduationCap size={18} /></div>
                  <select 
                    value={userType} onChange={(e) => setUserType(e.target.value)}
                    required
                    style={{...inputStyle, paddingLeft: '2.8rem', outline: 'none', appearance: 'none', color: userType ? 'inherit' : 'var(--text-muted)'}}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="" disabled>Select User Role</option>
                    <option value="Academic">Academic Institution</option>
                    <option value="Researcher">Independent Researcher</option>
                    <option value="Healthcare Provider">Healthcare Provider/Clinic</option>
                    <option value="Corporate">Corporate / Industry R&D</option>
                    <option value="Other">Other</option>
                  </select>
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Building2 size={18} /></div>
                  <input 
                    type="text" value={institution} onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Institution / Affiliation / License #" style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Mail size={18} /></div>
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Institutional Email Address" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Lock size={18} /></div>
                  <input 
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }} disabled={submitting}>
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            )}

            {/* Security Note */}
            <div style={{ 
              marginTop: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              color: 'var(--text-muted)', fontSize: '0.8rem'
            }}>
              <Lock size={14} /> 256-bit encrypted secure authentication
            </div>

            {/* Mobile Accordion for Benefits */}
            <div className="benefits-accordion-mobile">
              <button 
                onClick={() => setMobileBenefitsOpen(!mobileBenefitsOpen)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0', cursor: 'pointer', color: 'var(--primary)',
                  fontWeight: 600, fontSize: '1rem', fontFamily: 'inherit'
                }}
              >
                <span>Why apply for Professional Access?</span>
                {mobileBenefitsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {mobileBenefitsOpen && (
                <div style={{ padding: '0.5rem 0 0.5rem 0', animation: 'fadeIn 0.3s ease-out' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    A Professional Access account grants eligible institutions exclusive capabilities.
                  </p>
                  {benefitsList}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
