/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth, ADMIN_EMAILS } from '../context/AuthContext';
import { Mail, Lock, User, Building2, ArrowLeft, ShieldCheck, Clock, CheckCircle, Microscope, ChevronDown, ChevronUp, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useGuestPreferences, { GOAL_META, LEVEL_META } from '../hooks/useGuestPreferences';
export default function AuthPage({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Deep-link redirect: ProtectedRoute saves the original URL in state.from
  // (e.g. /admin?t=orders&orderId=ORD-XXX from an email CTA). After login we
  // send the admin back there instead of the default page.
  const redirectTo = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : null;
  const { user, userProfile, isProfessional, isProfessionalPending, isPhysician, isAdmin, activeRole, login, register, logout, resetPassword, loginWithGoogle, loading } = useAuth();
  const { prefs, hasCompleted } = useGuestPreferences();
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab');
    const type = searchParams.get('type');
    return (t === 'register' || type === 'register' || searchParams.has('invite')) ? 'register' : 'login';
  });
  
  const inviteId = searchParams.get('invite');
  // accountType: '' = not chosen yet, 'customer', 'professional'
  const [accountType, setAccountType] = useState(() => {
    const type = searchParams.get('type');
    const role = searchParams.get('role');
    if (type === 'professional' || role === 'professional') return 'professional';
    if (type === 'customer' || role === 'customer') return 'customer';
    return '';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [userType, setUserType] = useState(() => {
    const role = searchParams.get('role');
    // If role is professional, we don't know the specific subtype (Academic/Researcher etc)
    // so we keep it empty or set to a default if appropriate.
    // However, the user said "role=professional", which matches our query param name.
    return role === 'professional' ? '' : (role || '');
  });
  // Professional-only extra fields
  const [country, setCountry] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileBenefitsOpen, setMobileBenefitsOpen] = useState(false);
  
  // Pre-fill selectedGoals if guest preference matches
  const [selectedGoals, setSelectedGoals] = useState(() => {
    if (prefs?.goal && !['explore', 'explore-not-sure'].includes(prefs.goal)) {
      return [prefs.goal];
    }
    return [];
  });

  const AVAILABLE_GOALS = [
    { id: 'fat-loss', label: 'Fat Loss', icon: '🔥' },
    { id: 'muscle-growth', label: 'Muscle Growth', icon: '💪' },
    { id: 'injury-recovery', label: 'Injury Recovery', icon: '🩹' },
    { id: 'longevity', label: 'Longevity', icon: '⏳' },
    { id: 'cognitive-focus', label: 'Cognitive Focus', icon: '🧠' },
    { id: 'hair-skin', label: 'Hair & Skin Health', icon: '✨' },
    // Also include the ones from guest preferences
    { id: 'recovery', label: 'Recovery & Repair', icon: '🔬' },
    { id: 'cognitive', label: 'Cognitive & Mood', icon: '🧠' },
    { id: 'sleep', label: 'Sleep & Circadian', icon: '🌙' },
    { id: 'metabolic', label: 'Metabolic Health', icon: '⚡' },
    { id: 'performance', label: 'Athletic Performance', icon: '💪' },
    { id: 'hormonal', label: 'Hormonal Balance', icon: '⚖️' },
  ];

  const toggleGoal = (id) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleBack = onBack ?? (() => navigate(-1));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-redirect logged-in users to their respective dashboards
  useEffect(() => {
    if (!loading && user && userProfile) {
      const role = (userProfile.role || 'guest').toLowerCase();
      const isAdminUser = role === 'admin' || ADMIN_EMAILS.includes(user.email?.toLowerCase());
      const isPhysicianUser = role === 'doctor';

      const redirectable = isAdminUser || isPhysicianUser || role === 'wholesaler' || role === 'patient';
      
      if (redirectable) {
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else if (isAdminUser) {
          navigate('/admin', { replace: true });
        } else if (isPhysicianUser) {
          navigate('/doctor', { replace: true });
        } else if (role === 'wholesaler') {
          navigate('/wholesaler', { replace: true });
        } else if (role === 'patient') {
          navigate('/patient', { replace: true });
        }
      }
    }
  }, [user, userProfile, loading, redirectTo, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { cred, profile } = await login(email, password);
      setSuccess('Logged in successfully!');

      const role = (profile?.role || 'guest').toLowerCase();
      const isAdminUser = role === 'admin' || ADMIN_EMAILS.includes(cred.user.email?.toLowerCase());
      const isPhysicianUser = role === 'doctor';

      setTimeout(() => {
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else if (isAdminUser) {
          navigate('/admin', { replace: true });
        } else if (isPhysicianUser) {
          navigate('/doctor', { replace: true });
        } else if (role === 'wholesaler') {
          navigate('/wholesaler', { replace: true });
        } else if (role === 'patient') {
          navigate('/patient', { replace: true });
        } else {
          handleBack();
        }
      }, 1200);
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

    // Customer flow — only needs confirm password check
    if (accountType === 'customer') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      try {
        await register(email, password, fullName, '', '', 'customer', { guestPreferences: prefs, inviteId }, selectedGoals);
        setSuccess('Account created! Welcome to Med-Peptides.');
        setTimeout(() => navigate('/'), 1500);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists. Please log in.');
        } else {
          setError(err.message);
        }
      }
      setSubmitting(false);
      return;
    }

    // Professional flow — userType required
    if (!userType) {
      setError('Please select a profession/user type.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, fullName, institution, userType, 'professional', { country, licenseId, intendedUse, guestPreferences: prefs, inviteId });
      setSuccess('Application submitted. You’ll receive a confirmation when your account is activated.');
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
      const { cred, profile } = await loginWithGoogle();
      setSuccess('Logged in with Google successfully!');
      
      const role = (profile?.role || 'guest').toLowerCase();
      const isAdminUser = role === 'admin' || ADMIN_EMAILS.includes(cred.user.email?.toLowerCase());
      const isPhysicianUser = role === 'doctor';

      setTimeout(() => {
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else if (isAdminUser) {
          navigate('/admin', { replace: true });
        } else if (isPhysicianUser) {
          navigate('/doctor', { replace: true });
        } else if (role === 'wholesaler') {
          navigate('/wholesaler', { replace: true });
        } else if (role === 'patient') {
          navigate('/patient', { replace: true });
        } else {
          handleBack();
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  // If user is logged in, show profile status (Centered layout)
  if (user) {
    if (loading) {
      return (
        <div className="template-root" style={{ paddingTop: 'clamp(2rem, 8vw, 6rem)', minHeight: '100vh', backgroundColor: 'var(--surface)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading account details...</div>
        </div>
      );
    }

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
            ) : isProfessionalPending ? (
              <div style={{ 
                backgroundColor: 'rgba(0, 163, 224, 0.08)', 
                border: '1px solid rgba(0, 163, 224, 0.2)',
                borderRadius: 'var(--radius-md)', 
                padding: '1.25rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <Clock size={18} /> Application Under Review
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                  Your professional application is being reviewed by our team. We'll notify you once your account is activated.
                </p>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'rgba(100, 116, 139, 0.07)', 
                border: '1px solid rgba(100, 116, 139, 0.18)',
                borderRadius: 'var(--radius-md)', 
                padding: '1.25rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <CheckCircle size={18} /> Basic Account Active
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                  You can browse the catalog, place orders, and view your order history.
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
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: 'var(--color-bg-surface)',
    color: '#0f172a',
    boxSizing: 'border-box'
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
      {tab === 'login' ? (
        <>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><ShieldCheck size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Secure Authentication</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Access your account with industry-standard encryption and secure login protocols.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><Clock size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Order Tracking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Monitor the status of your research acquisitions and view your complete order history.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><CheckCircle size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Research Documentation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Quickly download Certificates of Analysis and technical data sheets for your products.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><User size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Your Account</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Sign in to access your orders, preferences, and personalized experience with Med-Peptides.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><ShieldCheck size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Secure Access</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Your account is protected with modern security standards.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><Clock size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Track Your Orders</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Stay updated on deliveries and review your full order history.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', paddingTop: '0.25rem' }}><CheckCircle size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: 700 }}>Saved Information</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Easily access product details, documentation, and your past activity.
              </p>
            </div>
          </div>
        </>
      )}

    </div>
  );

  return (
    <div className="auth-page-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' }}>
      <style>{`
        body { margin: 0; }
        .auth-page-root {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
        }
        .gcp-auth-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          padding: 2.5rem 2.5rem 3rem 2.5rem;
          width: 100%;
          max-width: 450px;
        }
        
        /* Segmented Control */
        .gcp-segment-bg {
          display: flex;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 4px;
          position: relative;
          margin-bottom: 2rem;
        }
        .gcp-segment-btn {
          flex: 1;
          padding: 0.65rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 2;
          transition: color 0.2s;
        }
        .gcp-segment-btn[data-active="true"] {
          color: #0f172a;
        }
        .gcp-segment-pill {
          position: absolute;
          top: 4px; bottom: 4px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 1;
        }
      `}</style>
      
      {/* CENTERED GOOGLE CLOUD CARD */}
      <div className="gcp-auth-card">
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', borderRadius: '8px', color: 'white', marginBottom: '1rem' }}>
            <Microscope size={28} />
          </div>
        </div>
        <div style={{ width: '100%' }}>
          
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#202124', marginBottom: '0.5rem', lineHeight: 1.2, fontWeight: 500, fontFamily: 'var(--font-heading)' }}>
              {tab === 'login' ? 'Sign in' : 'Create an account'}
            </h2>
            <p style={{ color: '#5f6368', margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-sans)' }}>
              {tab === 'login' ? 'to continue to Med-Peptides' : 'to access your personalized research portal'}
            </p>
          </div>

          {/* Framer Motion Segmented Control */}
          <div className="gcp-segment-bg">
            <motion.div 
              className="gcp-segment-pill"
              initial={false}
              animate={{
                left: tab === 'login' ? '4px' : '50%',
                width: 'calc(50% - 4px)'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button 
              className="gcp-segment-btn" 
              data-active={tab === 'login'}
              onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            >
              Sign In
            </button>
            <button 
              className="gcp-segment-btn" 
              data-active={tab === 'register'}
              onClick={() => { setTab('register'); setError(''); setSuccess(''); setAccountType(''); }}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab + accountType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'register' && !accountType && (
              <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  Choose how you'd like to register:
                </p>

                {/* Card: Basic Account */}
                <button
                  onClick={() => setAccountType('customer')}
                  style={{
                    textAlign: 'left', background: 'white', border: '1px solid #cbd5e1',
                    borderRadius: '8px', padding: '1.25rem 1.5rem',
                    cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(2,132,199,0.08)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="#0284c7" /> Basic Account
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    For browsing, checkout, and order history.
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'inline-block', padding: '0.45rem 1rem', backgroundColor: '#0284c7', color: 'white', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                    Create Basic Account
                  </div>
                </button>

                {/* Card: Professional Access */}
                <button
                  onClick={() => setAccountType('professional')}
                  style={{
                    textAlign: 'left', background: 'white', border: '1px solid #cbd5e1',
                    borderRadius: '8px', padding: '1.25rem 1.5rem',
                    cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(14,165,233,0.08)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Microscope size={18} color="#0ea5e9" /> Professional Access
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    For qualified professionals who need advanced protocols, professional pricing, and extended documentation.
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'inline-block', padding: '0.45rem 1rem', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                    Apply for Professional Access
                  </div>
                </button>
              </div>
            )}

            {error && (
              <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-sm)', 
                padding: '0.85rem 1rem', 
                marginBottom: '1.5rem',
                color: 'var(--color-danger)', 
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
                    placeholder="Email Address" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Lock size={18} /></div>
                  <input 
                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" required style={{...inputStyle, paddingRight: '2.5rem'}}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
                  Sign in with Google
                </button>
              </form>
            ) : accountType === 'customer' ? (
              /* ── CUSTOMER REGISTRATION FORM ── */
              <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.15rem' }}>
                <button type="button" onClick={() => setAccountType('')} style={{ background: 'none', border: 'none', padding: '0 0 0.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-sans)' }}>
                  ← Back to account type selection
                </button>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><User size={18} /></div>
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Mail size={18} /></div>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Lock size={18} /></div>
                  <input
                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)" required style={{...inputStyle, paddingRight: '2.5rem'}}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><Lock size={18} /></div>
                  <input
                    type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password" required style={{...inputStyle, paddingRight: '2.5rem'}}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    SELECT YOUR RESEARCH GOALS (OPTIONAL)
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {AVAILABLE_GOALS.map(goal => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: selectedGoals.includes(goal.id) ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: selectedGoals.includes(goal.id) ? 'rgba(0,54,102,0.05)' : 'white',
                          color: selectedGoals.includes(goal.id) ? 'var(--primary)' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{goal.icon}</span>
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }} disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Create Basic Account'}
                </button>
              </form>
            ) : accountType === 'professional' ? (
              /* ── PROFESSIONAL REGISTRATION FORM ── */
              <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.15rem' }}>
                <button type="button" onClick={() => setAccountType('')} style={{ background: 'none', border: 'none', padding: '0 0 0.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-sans)' }}>
                  ← Back to account type selection
                </button>
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

                {/* Country */}
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><span style={{ fontSize: '1rem' }}>🌍</span></div>
                  <input
                    type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country" style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* License / Professional ID */}
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapStyle}><ShieldCheck size={18} /></div>
                  <input
                    type="text" value={licenseId} onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="License or Professional ID (if applicable)" style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Intended Use */}
                <div>
                  <textarea
                    value={intendedUse} onChange={(e) => setIntendedUse(e.target.value)}
                    placeholder="Intended use (brief description of your research or clinical context)"
                    rows={3}
                    style={{ ...inputStyle, paddingLeft: '1rem', resize: 'vertical', height: 'auto', lineHeight: 1.5 }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,54,102,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Admin approval notice */}
                <div style={{ backgroundColor: 'rgba(0,163,224,0.07)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--secondary)' }}>⏳ Manual review required.</strong>{' '}
                  Your application will be reviewed by our team. You will be notified once your account is activated.
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }} disabled={submitting}>
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            ) : null}

            {/* Security Note */}
            <div style={{ 
              marginTop: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              color: 'var(--color-text-tertiary)', fontSize: '0.85rem', fontWeight: 500
            }}>
              <Lock size={14} /> 256-bit encrypted secure authentication
            </div>
            
            </motion.div>
          </AnimatePresence>
          {onBack && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: '#1a73e8', fontWeight: 500, cursor: 'pointer',
                  fontSize: '0.85rem', fontFamily: 'var(--font-sans)'
                }}
              >
                Return to browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
