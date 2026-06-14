import Shield from "lucide-react/dist/esm/icons/shield";
import Lock from "lucide-react/dist/esm/icons/lock";
import Truck from "lucide-react/dist/esm/icons/truck";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Scale from "lucide-react/dist/esm/icons/scale";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Mail from "lucide-react/dist/esm/icons/mail";
import Gavel from "lucide-react/dist/esm/icons/gavel";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';










const LegalConditions = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: <Scale size={24} />,
      content: (
        <>
          <p>By accessing and using Atlas Health.com, you agree to comply with and be bound by the following terms and conditions. These terms constitute a legally binding agreement between you and Atlas Health.</p>
          <p><strong>RESEARCH USE ONLY:</strong> All products listed on this website are intended for laboratory research purposes only. They are not for human or animal consumption, nor are they intended for diagnostic or therapeutic use.</p>
          <p><strong>AGE RESTRICTION:</strong> You must be at least 21 years of age to purchase products from this site. We reserve the right to verify credentials and refuse or cancel any order at our discretion.</p>
        </>
      )
    },
    {
      id: 'compliance',
      title: 'Regulatory Compliance',
      icon: <Gavel size={24} />,
      content: (
        <>
          <p>Atlas Health operates in strict accordance with international standards for the distribution of research compounds. It is the responsibility of the purchasing institution to ensure that the use of these compounds complies with all local regulations and safety protocols.</p>
          <p>Our compounds are manufactured to meet precise molecular specifications, ensuring consistent data reproduction across laboratory environments.</p>
        </>
      )
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <Truck size={24} />,
      content: (
        <>
          <p>We strive for efficient and secure delivery of your research materials. Orders are typically processed within 24-48 hours. Local UAE delivery is usually next-day, while international shipping varies by destination.</p>
          <p><strong>CUSTOMS:</strong> It is the researcher's responsibility to ensure compliance with local import regulations. Atlas Health is not responsible for seizures or delays at customs.</p>
        </>
      )
    },
    {
      id: 'disclaimer',
      title: 'Medical Disclaimer',
      icon: <AlertCircle size={24} />,
      content: (
        <>
          <p className="text-error" style={{ fontWeight: 700 }}>IMPORTANT: The products sold by Atlas Health are NOT medicines, drugs, or supplements.</p>
          <p>They have not been approved by the FDA or any other regulatory body for the treatment of any medical condition. Atlas Health makes no claims regarding the therapeutic efficacy of its products.</p>
          <p>Handling of these substances should only be performed by qualified professionals in a controlled laboratory environment.</p>
        </>
      )
    }
  ];

  const scrollToSection = (id, index) => {
    setActiveSection(index);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="legal-page page-shell">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="legal-hero">
        <div className="page-container">
          <div className="legal-hero__content anim-fade-up">
            <div className="legal-hero__eyebrow">
              <Shield size={14} />
              <span>Compliance Framework</span>
            </div>
            <h1 className="legal-hero__title font-heading">Legal Conditions</h1>
            <p className="legal-hero__subtitle">
              Transparency and compliance are the foundation of our research partnership. Please review our governing policies below.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <section className="page-section">
        <div className="page-container">
          <div className="legal-grid">
            {/* Sidebar Nav */}
            <aside className="legal-nav anim-slide-left">
              <nav>
                <ul className="legal-nav__list">
                  {sections.map((section, idx) => (
                    <li 
                      key={section.id}
                      className={`legal-nav__item ${activeSection === idx ? 'legal-nav__item--active' : ''}`}
                      onClick={() => scrollToSection(section.id, idx)}
                    >
                      <span className="text-secondary">{React.cloneElement(section.icon, { size: 18 })}</span>
                      {section.title}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="card card--flat mt-12" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <h4 className="text-primary mb-3">Questions?</h4>
                <p className="text-muted text-xs mb-4">Our legal and compliance team is here to help clarify any of our policies.</p>
                <a href="mailto:compliance@atlas-health.com" className="btn btn-primary btn-s w-full">
                  <Mail size={14} /> Email Compliance
                </a>
              </div>
            </aside>

            {/* Content Cards */}
            <main className="legal-content anim-fade-up--delay-1">
              <div className="legal-card mb-12" style={{ background: 'var(--gradient-soft)', border: '1px solid rgba(0, 54, 102, 0.05)' }}>
                <h2 className="h3 text-primary mb-6">Governing Framework</h2>
                <p className="text-muted leading-relaxed mb-0">
                  This document outlines the legal requirements and operational constraints governing the distribution and use of Atlas Health compounds. By engaging with our platform, institutional partners and individual researchers acknowledge the research-only nature of our products and commit to maintaining the highest standards of laboratory safety and regulatory adherence.
                </p>
              </div>

              {sections.map((section) => (
                <article key={section.id} id={section.id} className="legal-card">
                  <div className="legal-card__header">
                    <div className="legal-card__icon">
                      {section.icon}
                    </div>
                    <h3 className="legal-card__title h4 text-primary font-heading">
                      {section.title}
                    </h3>
                  </div>
                  <div className="legal-card__content">
                    {section.content}
                  </div>
                </article>
              ))}

              {/* Version Footer */}
              <footer className="legal-footer">
                <div className="legal-version-tag">Version 4.1.0 • Verified Protocol</div>
                <p className="text-xs text-light mb-2">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-xs text-light">
                  Atlas Health International Distribution • Legal Compliance Division
                </p>
              </footer>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalConditions;