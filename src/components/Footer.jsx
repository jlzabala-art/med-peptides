 
import React from 'react';
import { Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import homeData from '../data/homeData.json';

const SocialIconMap = {
  Twitter: Twitter,
  Instagram: Instagram,
  Linkedin: Linkedin,
  Mail: Mail
};

const Footer = () => {
  const { tagline, quickLinks, social, legal, copyright } = homeData.footer;

  return (
    <footer className="footer bg-darker border-t border-white-10">
      <div className="container section-padding">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo h3 mb-m block">Med-Peptides</Link>
            <p className="p-m text-secondary mb-l">
              {tagline}
            </p>
            <div className="flex gap-m">
              {social.map((item, index) => {
                const IconComponent = SocialIconMap[item.icon] || Mail;
                return (
                  <a key={index} href={item.url} className="social-link glass-card p-s hover:text-primary transition-colors">
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-links">
            <h4 className="h4 mb-m">Quick Links</h4>
            <ul className="footer-list">
              {quickLinks.map((link, index) => (
                <li key={index} className="mb-s">
                  <Link to={link.url} className="p-m text-secondary hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="h4 mb-m">Legal</h4>
            <ul className="footer-list">
              {legal.map((link, index) => (
                <li key={index} className="mb-s">
                  <Link to={link.url} className="p-m text-secondary hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4 className="h4 mb-m">Research Updates</h4>
            <p className="p-m text-secondary mb-m">Stay informed about the latest peptide research breakthroughs.</p>
            <form className="newsletter-form flex gap-s">
              <input type="email" placeholder="Email Address" className="form-input flex-1" />
              <button type="submit" className="btn btn-primary btn-s">Join</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom border-t border-white-10 pt-l mt-xl text-center">
          <p className="p-s text-muted">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
