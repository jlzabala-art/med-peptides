import Lock from "lucide-react/dist/esm/icons/lock";
import Shield from "lucide-react/dist/esm/icons/shield";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Scale from "lucide-react/dist/esm/icons/scale";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import X from "lucide-react/dist/esm/icons/x";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import { memo, useState } from 'react';








import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const S = {
  footer: {
    borderTop: '1px solid var(--border-light)',
    background: 'var(--surface)',
    padding: '4rem 2rem 3rem',
    position: 'relative',
    zIndex: 50,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  top: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr',
    gap: '4rem',
    marginBottom: '4rem',
  },
  branding: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  columnTitle: {
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--primary)',
    marginBottom: '1.5rem',
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  link: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    padding: 0,
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  bottom: {
    paddingTop: '2rem',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  copyright: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    fontWeight: 500,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: 'var(--secondary)',
    background: 'var(--secondary-light)',
    border: '1px solid rgba(0, 150, 204, 0.15)',
    borderRadius: '99px',
    padding: '0.4rem 1rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  disclaimerBox: {
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px dashed rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '1rem',
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }
};

const mobileCSS = `
  @media (max-width: 768px) {
    .footer-top {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 2.5rem 1rem !important;
    }
    .footer-branding {
      grid-column: span 2 !important;
      align-items: center !important;
      text-align: center !important;
    }
    .footer-branding p {
      max-width: 100% !important;
      margin: 0 auto !important;
    }
    .footer-badges-container {
      justify-content: center !important;
    }
    .footer-column {
      align-items: center !important;
      text-align: center !important;
    }
    .footer-column h4 {
      margin-bottom: 1rem !important;
      font-size: 0.72rem !important;
    }
    .footer-link {
      justify-content: center !important;
      font-size: 0.82rem !important;
      gap: 0.4rem !important;
    }
    .footer-bottom {
      flex-direction: column !important;
      text-align: center !important;
      gap: 0.75rem !important;
      padding-top: 1.5rem !important;
    }
  }
`;

function Footer() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const year = new Date().getFullYear();
  const [showQuickDisclaimer, setShowQuickDisclaimer] = useState(false);

  const tenantName = tenant?.name || 'Atlas Health';

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy', icon: <Shield size={14} /> },
    { label: 'Terms of Use', path: '/terms', icon: <Scale size={14} /> },
    { label: 'Legal Conditions', path: '/legal', icon: <FileText size={14} /> },
  ];

  const institutionalLinks = [
    { label: 'Clinical Academy', path: '/academy', icon: <ExternalLink size={14} /> },
    { label: 'Science Blog', path: '/blog', icon: <ExternalLink size={14} /> },
    { label: 'Reconstitution Guide', path: '/reconstitution-guide', icon: <ExternalLink size={14} /> },
    { label: 'Research Protocols', path: '/what-are-protocols', icon: <ExternalLink size={14} /> },
  ];

  return (
    <>
      <style>{mobileCSS}</style>
      <footer style={S.footer}>
        <div style={S.container}>
          {/* Main Footer Grid */}
          <div className="footer-top" style={S.top}>
            {/* Branding & RUO */}
            <div className="footer-branding" style={S.branding}>
              {tenant?.branding?.logoUrl ? (
                <img src={tenant.branding.logoUrl} alt={tenantName} style={{ height: '32px', objectFit: 'contain', alignSelf: 'flex-start' }} />
              ) : (
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                  {tenantName}
                </h3>
              )}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px' }}>
                Global distribution network for advanced research compounds and validated clinical protocols. Ensuring data integrity since 2018.
              </p>
              <div className="footer-badges-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span style={S.badge}>
                  <Lock size={12} strokeWidth={2.5} />
                  Institutional Grade
                </span>
                <button 
                  onClick={() => setShowQuickDisclaimer(!showQuickDisclaimer)}
                  style={{ ...S.badge, background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}
                >
                  <AlertTriangle size={12} strokeWidth={2.5} />
                  Medical Disclaimer
                </button>
              </div>

              {showQuickDisclaimer && (
                <div style={S.disclaimerBox} className="anim-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-danger)', textTransform: 'uppercase' }}>Crucial Research Notice</span>
                    <button onClick={() => setShowQuickDisclaimer(false)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    All peptide compounds are strictly for <strong>laboratory research use only</strong>. Dietary supplements are excluded from research-only restrictions.
                  </p>
                  <button 
                    onClick={() => { navigate('/legal'); window.scrollTo(0,0); }}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', cursor: 'pointer' }}
                  >
                    View Full Compliance Protocol <ChevronRight size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Legal Hub */}
            <div className="footer-column" style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={S.columnTitle}>Legal Hub</h4>
              <div style={S.linkList}>
                {legalLinks.map((link) => (
                  <button
                    key={link.label}
                    className="footer-link"
                    onClick={() => { navigate(link.path); window.scrollTo(0,0); }}
                    style={S.link}
                  >
                    <span style={{ color: 'var(--secondary)', opacity: 0.8 }}>{link.icon}</span>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Institutional */}
            <div className="footer-column" style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={S.columnTitle}>Institutional</h4>
              <div style={S.linkList}>
                {institutionalLinks.map((link) => (
                  <button
                    key={link.label}
                    className="footer-link"
                    onClick={() => { navigate(link.path); window.scrollTo(0,0); }}
                    style={S.link}
                  >
                    <span style={{ color: 'var(--secondary)', opacity: 0.8 }}>{link.icon}</span>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom" style={S.bottom}>
            <span style={S.copyright}>
              © {year} {tenantName} International Distribution. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Peptides: RUO — Not for human consumption
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default memo(Footer);