import Building from "lucide-react/dist/esm/icons/building";
import Pill from "lucide-react/dist/esm/icons/pill";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import Truck from "lucide-react/dist/esm/icons/truck";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Clock from "lucide-react/dist/esm/icons/clock";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Heart from "lucide-react/dist/esm/icons/heart";
/**
 * UserSegmentEntry
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows a different CTA block depending on auth/approval state:
 *
 *  1. GUEST      → Not logged in → invite to register
 *  2. PENDING    → Logged in but NOT approved professional → explain pending review
 *  3. PROFESSIONAL → Approved → link to dashboard
 *
 * isProfessional from AuthContext is ONLY true when the admin has approved the user.
 * A registered-but-pending user is still treated as a guest for pricing/content.
 */










import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const segments = [
  {
    title: 'Individual',
    icon: Heart,
    desc: 'Empowering personal biological research.',
    features: ['Premium research peptides', 'Peer-reviewed education', 'Laboratory-grade verification'],
    action: '/auth?tab=register&type=customer',
  },
  {
    title: 'Clinic',
    icon: Building,
    desc: 'Scale your practice with precision.',
    features: ['Patient titration protocols', 'Secure clinical history tracking', 'Authorized practitioner dashboard'],
    action: '/auth?tab=register&type=professional&role=Healthcare Provider',
  },
  {
    title: 'Pharmacy',
    icon: Pill,
    desc: 'Institutional supply \u0026 logistics.',
    features: ['Bulk volume acquisitions', 'White-label fulfillment options', 'Professional research materials access'],
    action: '/auth?tab=register&type=professional&role=Healthcare Provider',
    professionalTag: true,
  },
  {
    title: 'Researcher',
    icon: Microscope,
    desc: 'Advanced analytical materials.',
    features: ['HPLC/MS batch verification', 'Analytical reference materials', 'Custom synthesis coordination'],
    action: '/auth?tab=register&type=professional&role=Researcher',
    professionalTag: true,
  },
  {
    title: 'Distributor',
    icon: Truck,
    desc: 'Global logistics partnerships.',
    features: ['Cold-chain logistics network', 'Multi-region compliance', 'Volume tier agreements'],
    action: '/contact',
    professionalTag: true,
  },
];

// ─── Segment Cards ────────────────────────────────────────────────────────────

function SegmentCards({ onNavigate }) {
  return (
    <div className="use-grid-5" style={{ gap: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
      {segments.map((seg) => {
        const Icon = seg.icon;
        return (
          <div
            key={seg.title}
            onClick={() => onNavigate(seg.action)}
            className={`use-card${seg.professionalTag ? ' use-card--pro' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(seg.action)}
          >
            <div className="use-icon-wrap">
              <Icon size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="use-card-title">
                {seg.title}
                {seg.professionalTag && <span className="use-pro-badge">Professional</span>}
              </h3>
              <p className="use-card-desc">{seg.desc}</p>
              <ul className="use-feature-list">
                {seg.features.map((feat) => (
                  <li key={feat}>
                    <span className="use-dot" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CTA blocks by state ──────────────────────────────────────────────────────

function GuestCTA({ navigate }) {
  return (
    <div className="use-cta-box use-cta-guest">
      <UserCheck size={32} className="use-cta-icon" />
      <h3 className="use-cta-title">These advanced tools require verified professional registration.</h3>
      <p className="use-cta-body">
        Register to access ClinicalAI biological intelligence, multi-phase titration schedules, and institutional research materials.
        Your account will be reviewed and approved by our team — usually within 24&nbsp;h.
      </p>
      <div className="use-cta-actions">
        <button className="use-cta-btn use-cta-btn--primary" onClick={() => navigate('/login?tab=register')}>
          <UserCheck size={16} /> Request Verified Access
        </button>
        <button className="use-cta-btn use-cta-btn--ghost" onClick={() => navigate('/contact')}>
          Contact Institutional Team <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function PendingCTA() {
  return (
    <div className="use-cta-box use-cta-pending">
      <Clock size={32} className="use-cta-icon" />
      <h3 className="use-cta-title">Your registration is under review.</h3>
      <p className="use-cta-body">
        You're registered — great! Our compliance team is verifying your credentials. You'll receive an email
        as soon as your account is approved for professional access.&nbsp; Meanwhile, you can continue browsing
        as a guest (prices and clinical content will unlock after approval).
      </p>
      <span className="use-pending-badge">
        <Clock size={13} /> Pending Admin Approval
      </span>
    </div>
  );
}

function ProfessionalCTA({ navigate }) {
  return (
    <div className="use-cta-box use-cta-pro">
      <CheckCircle size={32} className="use-cta-icon" />
      <h3 className="use-cta-title">Welcome back, professional.</h3>
      <p className="use-cta-body">
        Your account has full access to clinical protocols, institutional research materials, and the professional dashboard.
      </p>
      <div className="use-pro-trust">
        <span className="use-trust-item">✓ Third-party tested</span>
        <span className="use-trust-item">✓ COA included</span>
        <span className="use-trust-item">✓ USA · EU · HK warehouses</span>
        <span className="use-trust-item">✓ Cold-chain logistics</span>
      </div>
      <div className="use-cta-actions">
        <button className="use-cta-btn use-cta-btn--dark" onClick={() => navigate('/patient')}>
          Go to Dashboard <ArrowRight size={16} />
        </button>
        <button className="use-cta-btn use-cta-btn--ghost" onClick={() => navigate('/contact')}>
          Explore Professional Materials <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function UserSegmentEntry({ onNavigate }) {
  const { user, isProfessional } = useAuth();
  const navigate = useNavigate();

  // Determine which state the viewer is in
  // isProfessional = logged in AND admin-approved (from AuthContext)
  // user but not isProfessional = registered but pending
  const state = !user ? 'guest' : isProfessional ? 'professional' : 'pending';

  const handleNavigate = (action) => {
    if (onNavigate) onNavigate(action);
    else navigate(action);
  };

  return (
    <>
      <div className="use-glow" aria-hidden />

      {/* Header */}
      <div className="section-header">
        <span className="section-eyebrow">The Research Ecosystem</span>
        <h2 className="section-title">Built for every role in biological optimization</h2>
        <p className="section-subtitle">
          From health-conscious individuals to institutional clinical centers — Atlas Health provides the tools for research, while maintaining exclusive protocols and tiered pricing for verified professionals.
        </p>
      </div>

      {/* Segment cards */}
      <SegmentCards onNavigate={handleNavigate} />

      {/* State-aware CTA */}
      {state === 'guest'        && <GuestCTA navigate={navigate} />}
      {state === 'pending'      && <PendingCTA />}
      {state === 'professional' && <ProfessionalCTA navigate={navigate} />}

      {/* ── Scoped styles ── */}
      <style>{`
        .use-glow {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(0,163,224,0.04) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(0,54,102,0.04) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Card grid */
        .use-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }
        .use-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          padding: clamp(1.25rem, 2.5vw, 1.75rem) 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: var(--shadow-sm);
          outline: none;
          position: relative;
          z-index: 1;
        }
        .use-card:hover, .use-card:focus-visible {
          transform: translateY(-6px);
          border-color: var(--secondary);
          box-shadow: var(--shadow-md);
        }
        .use-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(0,163,224,0.08);
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s, color 0.3s, transform 0.3s;
        }
        .use-card:hover .use-icon-wrap,
        .use-card:focus-visible .use-icon-wrap {
          background: var(--secondary);
          color: white;
          transform: scale(1.1) rotate(5deg);
        }
        .use-card-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }
        .use-card-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 0.85rem;
          line-height: 1.5;
        }
        .use-feature-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .use-feature-list li {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .use-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--secondary);
          flex-shrink: 0;
        }

        /* CTA boxes */
        .use-cta-box {
          border-radius: var(--radius-xl);
          padding: clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 2.5rem);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }
        .use-cta-guest {
          background: linear-gradient(135deg, rgba(0,54,102,0.03), rgba(0,163,224,0.05));
          border: 1px solid rgba(0,163,224,0.15);
        }
        .use-cta-pending {
          background: linear-gradient(135deg, rgba(217,119,6,0.04), rgba(251,191,36,0.04));
          border: 1px solid rgba(217,119,6,0.15);
        }
        .use-cta-pro {
          background: linear-gradient(135deg, rgba(5,150,105,0.04), rgba(16,185,129,0.04));
          border: 1px solid rgba(5,150,105,0.15);
        }
        .use-cta-icon {
          opacity: 0.8;
        }
        .use-cta-guest   .use-cta-icon { color: var(--primary); }
        .use-cta-pending .use-cta-icon { color: var(--warning); }
        .use-cta-pro     .use-cta-icon { color: var(--success); }

        .use-cta-title {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 800;
          margin: 0;
          color: var(--text-main);
          max-width: 560px;
          line-height: 1.35;
        }
        .use-cta-body {
          color: var(--text-muted);
          font-size: clamp(0.875rem, 1.8vw, 0.95rem);
          max-width: 560px;
          margin: 0;
          line-height: 1.65;
        }
        .use-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 2rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }
        .use-cta-btn--primary {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(0,54,102,0.15);
        }
        .use-cta-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,54,102,0.22);
        }
        .use-cta-btn--dark {
          background: var(--success);
          color: white;
          box-shadow: 0 4px 12px rgba(5,150,105,0.15);
        }
        .use-cta-btn--dark:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(5,150,105,0.22);
        }
        .use-pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--warning);
          background: rgba(217,119,6,0.08);
          border: 1px solid rgba(217,119,6,0.15);
          padding: 0.35rem 0.9rem;
          border-radius: 100px;
          margin-top: 0.5rem;
        }

        /* Professional card variant */
        .use-card--pro {
          border-color: rgba(217,119,6,0.15);
          background: linear-gradient(160deg, var(--surface) 80%, rgba(217,119,6,0.02));
        }
        .use-card--pro:hover,
        .use-card--pro:focus-visible {
          border-color: var(--warning);
          box-shadow: var(--shadow-md);
        }
        .use-card--pro .use-icon-wrap {
          background: rgba(217,119,6,0.08);
          color: var(--warning);
        }
        .use-card--pro:hover .use-icon-wrap,
        .use-card--pro:focus-visible .use-icon-wrap {
          background: var(--warning);
          color: white;
        }
        .use-card--pro .use-dot {
          background: var(--warning);
        }
        .use-pro-badge {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--warning);
          background: rgba(217,119,6,0.08);
          border: 1px solid rgba(217,119,6,0.2);
          padding: 0.15rem 0.5rem;
          border-radius: 100px;
          margin-left: 0.4rem;
          vertical-align: middle;
        }

        /* CTA multi-button row */
        .use-cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .use-cta-btn--ghost {
          background: transparent;
          color: var(--text-main);
          border: 1.5px solid var(--border);
        }
        .use-cta-btn--ghost:hover {
          border-color: var(--text-main);
          background: rgba(0, 0, 0, 0.02);
          transform: translateY(-2px);
        }
        [data-theme="dark"] .use-cta-btn--ghost:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        /* Professional trust row */
        .use-pro-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1.25rem;
          justify-content: center;
          margin: 0.25rem 0;
        }
        .use-trust-item {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--success);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .use-grid-5 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 900px) {
          .use-grid-5 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .use-grid-5 {
            grid-template-columns: 1fr;
            max-width: 420px;
            margin-inline: auto;
          }
          .use-card {
            flex-direction: row;
            align-items: flex-start;
          }
          .use-icon-wrap {
            width: 48px;
            height: 48px;
            flex-shrink: 0;
          }
        }
      `}</style>
    </>
  );
}