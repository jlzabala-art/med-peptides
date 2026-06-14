import React from 'react';
import Twitter from "lucide-react/dist/esm/icons/twitter";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Mail from "lucide-react/dist/esm/icons/mail";
import Globe from "lucide-react/dist/esm/icons/globe";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SocialIconMap = {
  Twitter: Twitter,
  Instagram: Instagram,
  Linkedin: Linkedin,
  Mail: Mail
};

const Footer = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const social = [
    { icon: 'Twitter', url: '#' },
    { icon: 'Instagram', url: '#' },
    { icon: 'Linkedin', url: '#' },
    { icon: 'Mail', url: 'mailto:info@atlas-health.com' }
  ];

  const quickLinks = [
    { label: t('footer.quickLinks.portfolio', 'Portfolio'), url: '/products' },
    { label: t('footer.quickLinks.technical', 'Technical Process'), url: '/about' },
    { label: t('footer.quickLinks.quality', 'Quality Control'), url: '/quality' },
    { label: t('footer.quickLinks.inquiry', 'Inquiry Center'), url: '/faq' }
  ];

  const legal = [
    { label: t('footer.legal.terms', 'Terms of Service'), url: '/terms' },
    { label: t('footer.legal.privacy', 'Privacy Policy'), url: '/privacy' },
    { label: t('footer.legal.guidelines', 'Research Guidelines'), url: '/guidelines' },
    { label: t('footer.legal.support', 'Contact Support'), url: '/contact' }
  ];

  return (
    <footer className="footer" style={{ backgroundColor: 'var(--color-bg-dark)', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
              Atlas Health
            </Link>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {t('footer.tagline', 'Technical Oversight & Internal Governance for Advanced Research')}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {social.map((item, index) => {
                const IconComponent = SocialIconMap[item.icon] || Mail;
                return (
                  <a key={index} href={item.url} style={{ padding: '0.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '0.5rem', color: 'var(--color-text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                     onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>{t('footer.headings.quickLinks', 'Quick Links')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {quickLinks.map((link, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <Link to={link.url} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>{t('footer.headings.legal', 'Legal')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {legal.map((link, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <Link to={link.url} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>{t('footer.headings.newsletter', 'Research Updates')}</h4>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
              {t('footer.newsletter.desc', 'Stay informed about the latest peptide research breakthroughs.')}
            </p>
            <form style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder={t('footer.newsletter.placeholder', 'Email Address')} 
                     style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
              <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', backgroundColor: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
                {t('footer.newsletter.button', 'Join')}
              </button>
            </form>
          </div>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            {t('footer.copyright', '© 2026 Atlas Health. Scientific Integrity & Technical Governance. All rights reserved.')}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <Globe size={16} />
            <select 
              value={i18n.language} 
              onChange={handleLanguageChange}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
