 
/**
 * ProfessionalUpgradeCTA
 * ─────────────────────────────────────────────────────────────────────────────
 * Guest-home section that communicates the professional program to visitors.
 *
 * States:
 *   guest     → Not logged in → Invitation to register + approval explanation
 *   pending   → Registered but not yet approved → Status + what to expect
 *   pro       → Approved → Redirect nudge to professional home
 *
 * Admin-toggleable via useHomeLayout (id: 'ProfessionalUpgradeCTA').
 * Enabled by default. Complements UserSegmentEntry (which is more compact).
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Icons (inline SVG — no extra dependency) ──────────────────────────────
const FlaskIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={28} height={28}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 3h6m-3 0v6.5L15.5 15M9 9.5 5.5 15A4 4 0 0 0 9.5 21h5a4 4 0 0 0 4-5.5L15.5 9.5" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={28} height={28}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 3 4 7v5c0 5 4 8 8 9 4-1 8-4 8-9V7l-8-4Z" />
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={28} height={28}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 12h3l3-9 4 18 3-9h5" />
  </svg>
);
const LockOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M12 7v5l3 3" />
  </svg>
);

// ─── Feature cards ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <FlaskIcon />,
    title: 'Research-Grade Catalog',
    desc: 'Unlock full peptide catalog with batch COAs, purity specs, and synthesis reports.',
    color: '#38bdf8',
  },
  {
    icon: <ShieldIcon />,
    title: 'Protocol Library',
    desc: 'Access evidence-based protocols curated by scientific advisors — dosing, timing, stacking.',
    color: '#a78bfa',
  },
  {
    icon: <ChartIcon />,
    title: 'Clinical Insights',
    desc: 'Data-driven outcome tracking and reconstitution calculators built for professionals.',
    color: '#34d399',
  },
];

// ─── Component ────────────────────────────────────────────────────────────
export default function ProfessionalUpgradeCTA() {
  const navigate = useNavigate();
  const { user, isProfessional } = useAuth?.() ?? {};

  // Determine state
  const state = !user ? 'guest' : isProfessional ? 'pro' : 'pending';

  // Pro users: gentle nudge (they should be on ProfessionalHome anyway)
  if (state === 'pro') {
    return (
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            You're viewing the guest home.{' '}
            <button onClick={() => navigate('/')} style={linkBtnStyle}>
              Go to your professional dashboard →
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <div style={sectionStyle} aria-labelledby="pro-cta-heading">

      {/* ── Ambient glow ── */}
      <div style={glowStyle} aria-hidden />

      <div style={containerStyle}>

        {/* ── Heading Block using global classes ── */}
        <div className="section-header">
          <span className="section-eyebrow" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.25)', background: 'rgba(56, 189, 248, 0.1)' }}>
            {state === 'pending' ? '⏳ Pending Approval' : '🔬 Professional Program'}
          </span>
          <h2 id="pro-cta-heading" className="section-title" style={{ color: 'var(--color-bg-app)' }}>
            {state === 'pending'
              ? 'Your application is under review'
              : 'Built for Medical & Research Professionals'}
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>
            {state === 'pending'
              ? 'Once approved, you\'ll gain access to the full professional platform — pricing, protocols, and clinical tools.'
              : 'Register for free and request professional access. Once approved by our team, you unlock a completely different experience.'}
          </p>
        </div>

        {/* ── Feature grid ── */}
        {state !== 'pending' && (
          <div style={featureGridStyle}>
            {FEATURES.map(({ icon, title, desc, color }) => (
              <div key={title} style={featureCardStyle} className="card card--hover">
                <div style={{ ...featureIconStyle, color, background: `${color}18` }}>
                  {icon}
                </div>
                <h3 style={featureTitleStyle}>{title}</h3>
                <p style={featureDescStyle}>{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Pending state detail ── */}
        {state === 'pending' && (
          <div style={pendingCardStyle}>
            <div style={pendingRowStyle}>
              <span style={{ color: '#fbbf24' }}><ClockIcon /></span>
              <div>
                <strong style={{ color: 'var(--color-bg-app)' }}>Review in progress</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Our team typically reviews applications within 24–48 hours. You'll receive an email when approved.
                </p>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.06)', borderRadius: 10, borderLeft: '3px solid #38bdf8' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                While you wait, you can browse our catalog and protocols as a guest. All professional pricing and tools will activate automatically once you're approved.
              </p>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={ctaRowStyle}>
          {state === 'guest' && (
            <>
              <button
                style={primaryBtnStyle}
                onClick={() => navigate('/login?role=professional&type=register')}
                id="pro-cta-register-btn"
              >
                <LockOpenIcon />
                <span>Register &amp; Request Access</span>
              </button>
              <button
                style={secondaryBtnStyle}
                onClick={() => navigate('/auth?mode=login')}
                id="pro-cta-login-btn"
              >
                Already registered? Sign in
              </button>
            </>
          )}
          {state === 'pending' && (
            <button
              style={secondaryBtnStyle}
              onClick={() => navigate('/')}
            >
              Continue browsing as guest →
            </button>
          )}
        </div>

        {/* ── Trust line ── */}
        {state === 'guest' && (
          <p style={trustLineStyle}>
            Advanced tools require verified professional registration. Your account will be reviewed and approved by our team — usually within 24 h.
          </p>
        )}

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const sectionStyle = {
  position: 'relative',
  background: 'linear-gradient(180deg, var(--background) 0%, rgba(2,14,28,1) 100%)',
  overflow: 'hidden',
};

const glowStyle = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 600,
  height: 300,
  borderRadius: '50%',
  background: 'radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const containerStyle = {
  position: 'relative',
  zIndex: 1,
};


const badgeWrapStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '1.25rem',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.35rem 1rem',
  borderRadius: 100,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  background: 'rgba(56, 189, 248, 0.12)',
  color: '#38bdf8',
  border: '1px solid rgba(56, 189, 248, 0.25)',
};

const headingStyle = {
  textAlign: 'center',
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
  fontWeight: 800,
  color: 'var(--color-bg-app)',
  margin: '0 auto 1rem',
  maxWidth: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
  lineHeight: 1.7,
  margin: '0 auto 3rem',
  maxWidth: 600,
};

const featureGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.25rem',
  marginBottom: '3rem',
};

const featureCardStyle = {
  padding: '1.75rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  backdropFilter: 'blur(10px)',
  transition: 'border-color 0.2s ease, transform 0.2s ease',
};

const featureIconStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 52,
  height: 52,
  borderRadius: 14,
  marginBottom: '1rem',
};

const featureTitleStyle = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--color-bg-app)',
  margin: '0 0 0.5rem',
};

const featureDescStyle = {
  fontSize: '0.875rem',
  color: 'var(--text-muted)',
  lineHeight: 1.6,
  margin: 0,
};

const pendingCardStyle = {
  background: 'rgba(251,191,36,0.05)',
  border: '1px solid rgba(251,191,36,0.15)',
  borderRadius: 16,
  padding: '1.75rem',
  marginBottom: '2rem',
};

const pendingRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
};

const ctaRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.875rem',
  justifyContent: 'center',
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.875rem 2rem',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
  color: '#020e1c',
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
  letterSpacing: '-0.01em',
  boxShadow: '0 4px 24px rgba(56,189,248,0.3)',
  transition: 'opacity 0.2s ease, transform 0.2s ease',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.875rem 1.75rem',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'transparent',
  color: 'rgba(255,255,255,0.7)',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, color 0.2s ease',
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#38bdf8',
  cursor: 'pointer',
  fontSize: 'inherit',
  padding: 0,
  textDecoration: 'underline',
};

const trustLineStyle = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '0.78rem',
  letterSpacing: '0.03em',
  marginTop: '1.5rem',
  opacity: 0.7,
};
