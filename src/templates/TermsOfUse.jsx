/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Scale, ChevronRight, AlertCircle, ShieldCheck, Ban, FileText, Mail, Info } from 'lucide-react';

const TermsOfUse = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'research',
      title: 'Research Use Only',
      icon: <FileText size={24} />,
      content: (
        <>
          <p>All products listed on Atlas Health are intended exclusively for laboratory research purposes. They are not for human or animal consumption, nor are they approved for diagnostic or therapeutic use.</p>
          <p>By purchasing, you confirm that you are a qualified researcher operating within a controlled environment and that you possess the necessary expertise to handle advanced chemical compounds.</p>
        </>
      )
    },
    {
      id: 'eligibility',
      title: 'Eligibility',
      icon: <ShieldCheck size={24} />,
      content: (
        <>
          <p>You must be at least 21 years of age and a verified professional researcher to purchase products from this platform. Access to our clinical database and procurement systems is restricted to authorized personnel.</p>
          <p>We reserve the right to verify credentials and refuse or cancel any order at our discretion, including due to quantity limitations or inaccurate institutional information.</p>
        </>
      )
    },
    {
      id: 'prohibited',
      title: 'Prohibited Uses',
      icon: <Ban size={24} />,
      content: (
        <>
          <p>You may not use our platform to: resell products without authorization, misrepresent the intended use of purchased items, or violate any applicable local or international laws.</p>
          <p>Any attempt to engage in fraudulent activity, data scraping, or unauthorized access to our clinical AI systems will result in immediate account termination and potential legal action.</p>
        </>
      )
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer of Warranties',
      icon: <AlertCircle size={24} />,
      content: (
        <>
          <p>Products are provided "as is" for research purposes. Atlas Health makes no warranties, express or implied, regarding the fitness of products for any particular purpose.</p>
          <p>We are not liable for any direct, indirect, incidental, or consequential damages arising from the use or misuse of our products or information provided through our platform.</p>
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
              <Scale size={14} />
              <span>User Agreement</span>
            </div>
            <h1 className="legal-hero__title font-heading">Terms of Use</h1>
            <p className="legal-hero__subtitle">
              Please read these terms carefully before using our platform. Access implies full acceptance of our research-grade protocols.
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
                <h4 className="text-primary mb-3">Institutional Access</h4>
                <p className="text-muted text-xs mb-4">For bulk procurement or partnership agreements, please contact our logistics team.</p>
                <a href="mailto:logistics@med-peptides.com" className="btn btn-secondary btn-s w-full">
                  <Mail size={14} /> Contact Logistics
                </a>
              </div>
            </aside>

            {/* Content Cards */}
            <main className="legal-content anim-fade-up--delay-1">
              <div className="legal-card mb-12" style={{ background: 'var(--gradient-soft)', border: '1px solid rgba(0, 54, 102, 0.05)' }}>
                <h2 className="h3 text-primary mb-6">Terms of Engagement</h2>
                <p className="text-muted leading-relaxed mb-0">
                  Atlas Health provides a secure interface for the procurement of research-grade molecular compounds and access to advanced clinical protocols. By utilizing our platform, you agree to adhere to the standards set forth in this document, which are designed to ensure the safety, integrity, and scientific accuracy of the research conducted using our materials.
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
                <div className="legal-version-tag">Version 3.5.2 • Professional Access</div>
                <p className="text-xs text-light mb-2">Effective Date: May 1, 2026</p>
                <p className="text-xs text-light">
                  Atlas Health Platform Operations • Research Compliance Division
                </p>
              </footer>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfUse;
