 
import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, FileText, ChevronRight, Mail, HelpCircle, ArrowRight } from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "collection",
      title: "Information Collection",
      icon: <Eye size={24} />,
      content: (
        <>
          <p>We collect information necessary to facilitate research distribution and improve our logistics infrastructure. This includes institutional details, contact information for laboratory personnel, and technical data related to the procurement process.</p>
          <p>Our systems automatically log technical identifiers such as IP addresses and laboratory session tokens to ensure the security of international compound transfers.</p>
        </>
      )
    },
    {
      id: "utilization",
      title: "Data Utilization",
      icon: <Shield size={24} />,
      content: (
        <>
          <p>Collected data is used exclusively for processing research orders, managing global supply chain logistics, and providing technical documentation. We do not engage in the sale of institutional or personal data to third-party marketing entities.</p>
          <p>We analyze anonymized procurement patterns to optimize our direct factory-to-laboratory distribution network, ensuring the fastest possible delivery of research materials.</p>
        </>
      )
    },
    {
      id: "security",
      title: "Information Security",
      icon: <Lock size={24} />,
      content: (
        <>
          <p>Med-Peptides employs industry-standard encryption and security protocols to protect sensitive research procurement data. Access to laboratory records and distribution details is strictly controlled and monitored.</p>
          <p>All laboratory-client communications are encrypted using advanced TLS protocols, and our internal databases are isolated from public networks.</p>
        </>
      )
    },
    {
      id: "partners",
      title: "Third-Party Partners",
      icon: <FileText size={24} />,
      content: (
        <>
          <p>Logistics and laboratory data may be shared with our primary manufacturing partners and international shipping carriers only to the extent necessary to ensure successful distribution and regulatory compliance.</p>
          <p>Every partner is bound by strict non-disclosure agreements (NDAs) that prohibit any secondary use of the institutional data provided.</p>
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
              <span>Institutional Protocol</span>
            </div>
            <h1 className="legal-hero__title font-heading">Privacy Policy</h1>
            <p className="legal-hero__subtitle">
              Our commitment to data integrity and researcher confidentiality in the global distribution of advanced molecular compounds.
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
                <h4 className="text-primary mb-3">Need Assistance?</h4>
                <p className="text-muted text-xs mb-4">Contact our data protection officer for institutional inquiries.</p>
                <a href="mailto:privacy@med-peptides.com" className="btn btn-secondary btn-s w-full">
                  <Mail size={14} /> Contact DPO
                </a>
              </div>
            </aside>

            {/* Content Cards */}
            <main className="legal-content anim-fade-up--delay-1">
              <div className="legal-card mb-12" style={{ background: 'var(--gradient-soft)', border: '1px solid rgba(0, 54, 102, 0.05)' }}>
                <h2 className="h3 text-primary mb-6">Statement of Intent</h2>
                <p className="text-muted leading-relaxed mb-0">
                  At Med-Peptides, we recognize that scientific inquiry requires absolute discretion and data integrity. This Privacy Policy outlines our protocols for handling institutional and individual information gathered through our distribution network. As a direct factory representative, we adhere to the highest standards of confidentiality to protect the intellectual property and privacy of our research partners.
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

              {/* Cookie & Inquiry Cards */}
              <div className="legal-info-row">
                <div className="legal-info-box">
                  <div className="legal-info-box__icon">
                    <HelpCircle size={32} />
                  </div>
                  <h4 className="h4 text-primary">Cookie Protocol</h4>
                  <p className="text-muted text-s">
                    We use functional cookies to maintain your session and optimize the institutional procurement interface.
                  </p>
                  <button className="btn btn-outline btn-s">Manage Cookies</button>
                </div>

                <div className="legal-info-box">
                  <div className="legal-info-box__icon">
                    <FileText size={32} />
                  </div>
                  <h4 className="h4 text-primary">Data Requests</h4>
                  <p className="text-muted text-s">
                    Qualified researchers may request a summary of their laboratory data stored within our secure systems.
                  </p>
                  <button className="btn btn-primary btn-s">Submit Request</button>
                </div>
              </div>

              <footer className="legal-footer">
                <div className="legal-version-tag">Version 2.2.0 • Institutional Grade</div>
                <p className="text-xs text-light mb-2">Effective Date: May 1, 2026</p>
                <p className="text-xs text-light">
                  Med-Peptides Research Distribution Network • Laboratory Confidentiality Division
                </p>
              </footer>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
