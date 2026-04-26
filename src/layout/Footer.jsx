import { memo } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Static style objects (defined once, never recreated on render) ──────────
const S = {
  footer: {
    borderTop: '0.5px solid rgba(148, 163, 184, 0.35)',
    background: '#ffffff',
    padding: '3rem 2rem',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  copyright: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    background: 'rgba(0, 54, 102, 0.06)',
    border: '1px solid rgba(0, 54, 102, 0.14)',
    borderRadius: '99px',
    padding: '0.38rem 0.9rem',
    letterSpacing: '0.03em',
    fontWeight: 600,
  },
  linkBase: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    padding: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    transition: 'opacity 0.3s, transform 0.3s',
    display: 'inline-block',
    opacity: 1,
    transform: 'translateY(0)',
  },
};

// ── Responsive overrides injected once via <style> ──────────────────────────
const mobileCSS = `
  @media (max-width: 640px) {
    .footer-inner {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
    }
    .footer-badge  { order: -1; margin-bottom: 0.25rem; }
    .footer-links  { gap: 1.5rem !important; }
  }
`;

function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const handleLinkHover = (e, entering) => {
    e.currentTarget.style.opacity  = entering ? '0.5' : '1';
    e.currentTarget.style.transform = entering ? 'translateY(-1px)' : 'translateY(0)';
  };

  return (
    <>
      {/* Inject mobile rules exactly once */}
      <style>{mobileCSS}</style>

      <footer style={S.footer}>
        <div className="footer-inner" style={S.inner}>

          {/* Copyright */}
          <span style={S.copyright}>
            © {year} ReGen PEPT. All rights reserved.
          </span>

          {/* RUO Security Badge */}
          <span className="footer-badge" style={S.badge}>
            <Lock size={11} strokeWidth={1.8} />
            Research Use Only — Not for human consumption
          </span>

          {/* Legal links */}
          <div className="footer-links" style={{ display: 'flex', gap: '1.5rem' }}>
            {[['Terms', '/legal'], ['Privacy', '/legal']].map(([label, path]) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={S.linkBase}
                onMouseEnter={e => handleLinkHover(e, true)}
                onMouseLeave={e => handleLinkHover(e, false)}
              >
                {label}
              </button>
            ))}
          </div>

        </div>
      </footer>
    </>
  );
}

export default memo(Footer);