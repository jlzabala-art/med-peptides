/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../styles/about.css';
import { 
  ShieldCheck, 
  Microscope, 
  SearchCheck, 
  FileCheck, 
  Activity, 
  Target, 
  Award, 
  CheckCircle2,
  Users,
  Zap,
  Lock,
  FlaskConical,
  Dna,
  Scale,
  History,
  ClipboardCheck,
  ChevronRight,
  Sparkles,
  Database,
  ArrowRight,
  Globe,
  Beaker,
  ShieldAlert,
  Headset,
  Mail,
  MessageCircle
} from 'lucide-react';

const SectionContainer = ({ children, className = "", id = "" }) => (
  <section id={id} className={`about-section ${className}`}>
    <div className="about-container">
      {children}
    </div>
  </section>
);

const SectionHeader = ({ title, subtitle, badge }) => (
  <div className="about-section-header">
    {badge && (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="about-section-badge"
      >
        {badge}
      </motion.div>
    )}
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="about-section-title"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="about-section-subtitle"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const About = () => {
  usePageMeta({
    title: 'About Atlas Health | Sourcing Quality & Trust | Atlas Health',
    description: 'Learn about Atlas Health, the global standard for high-purity research peptides. Batch verified, documented quality, globally coordinated operations in US, EU, HK, and UAE.',
    canonicalUrl: 'https://Atlas Health-app-27a3a.web.app/about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Atlas Health',
      description: 'The global standard for institutional-grade research peptides sourcing and fulfillment.',
      publisher: {
        '@type': 'Organization',
        name: 'Atlas Health',
        logo: {
          '@type': 'ImageObject',
          url: 'https://Atlas Health-app-27a3a.web.app/images/logo.png'
        }
      }
    }
  });

  // Ensure the page starts from the top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page min-h-screen pt-20 selection:bg-accent-blue/30 selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION: The Institutional Gateway */}
      <section id="hero" className="about-hero">
        <div className="about-hero__mesh" aria-hidden="true" />
        <div className="about-hero__glows">
          <div className="about-hero__glow-left" />
          <div className="about-hero__glow-right" />
        </div>

        <div className="about-hero__split">
          <div className="about-hero__left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="about-hero__badge"
            >
              <Globe size={14} />
              <span>Globally Coordinated Operations</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="about-hero__title"
            >
              The Global Standard for<br />
              <span className="about-hero__title-gradient">Research Peptides.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="about-hero__body"
            >
              Headquartered in the <strong>United Arab Emirates</strong>, Atlas Health is an institutional-grade sourcing partner. We provide globally coordinated fulfillment across the <strong>US</strong>, <strong>Europe</strong>, and <strong>Hong Kong</strong> — ensuring researchers receive documented, verified compounds with absolute reliability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="about-hero__pills"
            >
              {[
                { value: "UAE",   label: "Headquarters" },
                { value: "4",      label: "Regions" },
                { value: "24/7",   label: "Fulfillment" },
              ].map((p, i) => (
                <div key={i} className="about-hero__pill">
                  <span className="about-hero__pill-value">{p.value}</span>
                  <span className="about-hero__pill-label">{p.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="about-hero__actions"
            >
              <Link to="/collection/peptides" className="about-btn-primary">
                Explore Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="about-btn-ghost">
                Contact Our Team <ChevronRight size={18} />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="about-hero__right"
          >
            <div className="about-hero__img-frame">
              <img
                src="/images/about_hero_logistics_global.png"
                alt="Atlas Health International Logistics Operations"
                loading="eager"
              />
              <div className="about-hero__img-overlay" />

              <div className="about-hero__float-card about-hero__float-card--tl">
                <ShieldCheck size={18} className="about-hero__float-icon" />
                <div>
                  <div className="about-hero__float-title">Batch Verified</div>
                  <div className="about-hero__float-sub">CoA Documentation</div>
                </div>
              </div>

              <div className="about-hero__float-card about-hero__float-card--br">
                <Globe size={18} className="about-hero__float-icon about-hero__float-icon--green" />
                <div>
                  <div className="about-hero__float-title">Global Ops</div>
                  <div className="about-hero__float-sub">US · EU · HK · UAE</div>
                </div>
              </div>
            </div>

            <div className="about-hero__img-tag">
              <Microscope size={14} />
              <span>Internationally Coordinated Fulfillment</span>
            </div>
          </motion.div>
        </div>

        <div className="about-hero__bottom-fade" aria-hidden="true" />
      </section>

      {/* 1.5 QUICK-SCAN GRID: Who We Are (Mobile First) */}
      <SectionContainer id="who-we-are" className="about-quick-scan">
        <div className="about-quick-scan__grid">
          {[
            { 
              icon: Globe, 
              title: "Global Distribution Hub", 
              desc: "Headquartered in UAE with active fulfillment nodes in US, EU, and Hong Kong for zero-friction logistics." 
            },
            { 
              icon: FileCheck, 
              title: "Batch-Level Verification", 
              desc: "We don't just sell compounds; we provide transparency. Every batch is documented with independent CoA reports." 
            },
            { 
              icon: ShieldCheck, 
              title: "Institutional Reliability", 
              desc: "Over 2 years of uninterrupted operations serving research institutions with grounded, professional standards." 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="about-quick-scan__card"
            >
              <div className="about-quick-scan__icon"><item.icon size={24} /></div>
              <h3 className="about-quick-scan__title">{item.title}</h3>
              <p className="about-quick-scan__desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>

      {/* 2. OPERATIONAL HERITAGE: 2 Years of Reliability */}
      <SectionContainer id="heritage" className="about-section--alt">
        <div className="about-stats">
          <div className="about-stats__watermark">
            <History size={200} />
          </div>
          <div className="about-stats__content">
            <div className="about-stats__eyebrow">
              Operational Heritage
            </div>
            <h2 className="about-stats__heading">Two Years of Verified Continuity</h2>
            <p className="about-stats__body">
              Atlas Health has established itself as the baseline for reliability in the research space. We focus on long-term supplier stability and documented chain-of-custody, ensuring your research is never compromised by supply volatility.
            </p>
            <div className="about-stats__grid">
              {[
                { value: "24+",   label: "Months Active",             mod: "blue"   },
                { value: "100%",  label: "Traceable Batches",         mod: "purple" },
                { value: "4",     label: "Regions — US · EU · HK · UAE", mod: "cyan"  }
              ].map((stat, i) => (
                <div key={i}>
                  <div className={`about-stats__value about-stats__value--${stat.mod}`}>{stat.value}</div>
                  <div className="about-stats__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* 3. CORE MISSION: Transparency & Documentation */}
      <SectionContainer id="mission" className="relative">
        <div className="about-mission__layout">
          <motion.div
            className="about-mission__text-col"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="about-mission__icon-box">
              <Target size={32} />
            </div>
            <h2 className="about-mission__heading">Our Mission</h2>
            <p className="about-mission__body about-mission__body--lead">
              To professionalize the peptide supply chain through rigorous supplier selection and transparent batch-level documentation.
            </p>
            <p className="about-mission__body">
              We believe that research excellence starts with procurement reliability. Our mission is to provide researchers with a grounded, institutional-grade sourcing experience that removes ambiguity from the supply chain.
            </p>
            <div className="about-mission__checklist">
              {[
                { label: "Rigorous Supplier Vetting", color: "#0096CC" },
                { label: "Batch-Specific Verification", color: "#7C3AED" },
                { label: "Direct-to-Supplier Traceability", color: "var(--color-success)" },
                { label: "Neutral Institutional Tone", color: "#D97706" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="about-mission__check-item"
                >
                  <div
                    className="about-mission__check-dot"
                    style={{ backgroundColor: `${item.color}22`, color: item.color }}
                  >
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="about-mission__check-label">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="about-mission__image-frame"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <img
              src="/images/about_mission_symbolic.png"
              alt="Mission and Vision - Institutional Standards"
              loading="lazy"
            />
            <div className="about-mission__overlay" />
            <div className="about-mission__trust-badge">
              <ShieldCheck size={16} />
              <span>Grounded Standards</span>
            </div>
            <div className="about-mission__quote">
              <p>
                "We don't sell 'miracles'. We distribute documented research compounds for verified scientific inquiry."
              </p>
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* 4. QUALITY PILLARS: Selection & Documentation */}
      <SectionContainer id="quality" className="about-section--accent-border">
        <SectionHeader 
          badge="Quality Pillars"
          title="Selection & Verification"
          subtitle="Our sourcing strategy is built on two fundamental pillars: specialized supplier selection and structured batch documentation."
        />
        
        <div className="about-supplier__grid">
          {[
            { icon: Microscope, title: "Specialist Sourcing", desc: "We avoid generalist manufacturers, focusing exclusively on facilities with proven specialization in peptide synthesis." },
            { icon: Activity,   title: "Production Consistency", desc: "Suppliers are audited for their ability to maintain purity standards across multiple production cycles." },
            { icon: FileCheck,  title: "Batch Transparency", desc: "Every batch is accompanied by documentation that allows for direct verification of purity and identity." },
            { icon: Lock,       title: "Supply Chain Integrity", desc: "From the UAE hub to the final destination, we maintain a secure, professional chain of custody." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="about-card"
            >
              <div className="about-card__icon"><Icon size={26} /></div>
              <h3 className="about-card__title">{title}</h3>
              <p className="about-card__body">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="about-doc__layout mt-20">
          <div className="about-doc__tiles-col">
            <div className="about-doc__grid">
              {[
                { icon: FileCheck,      label: "CoA Documentation" },
                { icon: ClipboardCheck, label: "Purity Reports" },
                { icon: Database,       label: "Batch Records" },
                { icon: SearchCheck,    label: "Traceability Data" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="about-doc__tile"
                >
                  <div className="about-doc__tile-icon">
                    <item.icon size={32} />
                  </div>
                  <span className="about-doc__tile-label">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="about-doc__text-col">
            <h3 className="text-2xl font-bold mb-6">Documentation Transparency</h3>
            <p className="about-doc__body">
              Atlas Health maintains a centralized documentation hub for all distributed compounds. This ensures that researchers have immediate access to the technical data required for their protocols.
            </p>
            <div className="mt-8">
              <img 
                src="/images/about_lab_realistic.png" 
                alt="Analytical Verification" 
                className="rounded-3xl border border-white/10 shadow-2xl grayscale-[0.2]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* 5. STRATEGIC HUB: The UAE Advantage */}
      <SectionContainer id="uae-hub">
        <div className="about-mission__layout">
          <motion.div
            className="about-mission__image-frame"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="/images/about_logistics_symbolic.png" 
              alt="Atlas Health UAE Strategic Logistics Hub Symbolic Representation"
              loading="lazy"
            />
            <div className="about-mission__overlay" />
            <div className="about-mission__trust-badge" style={{ background: 'var(--about-accent)' }}>
              <Globe size={16} />
              <span>Dubai Logistics Hub</span>
            </div>
          </motion.div>

          <motion.div
            className="about-mission__text-col"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="about-mission__icon-box">
              <Globe size={32} />
            </div>
            <h2 className="about-mission__heading">Internationally Coordinated Operations</h2>
            <p className="about-mission__body about-mission__body--lead">
              UAE-headquartered, with warehousing and fulfillment infrastructure across four international regions.
            </p>
            <p className="about-mission__body">
              This multi-region structure allows Atlas Health to optimize delivery routes, reduce transit times, and serve research partners in the Americas, Europe, and Asia-Pacific with consistent operational reliability.
            </p>
            <div className="about-mission__checklist">
              {[
                { label: "UAE Headquarters & Regional Coordination", color: "var(--color-primary)" },
                { label: "United States — Warehousing & Fulfillment",  color: "#10B981" },
                { label: "Europe — Local Distribution Coverage",        color: "#6366F1" },
                { label: "Hong Kong — Asia-Pacific Warehousing Node",   color: "#F59E0B" }
              ].map((item, i) => (
                <div key={i} className="about-mission__check-item">
                  <div className="about-mission__check-dot" style={{ color: item.color }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="about-mission__check-label">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* 6. GLOBAL OPERATIONS: Flow Diagram */}
      <SectionContainer id="global-ops" className="about-section--alt">
        <SectionHeader
          badge="Operational Structure"
          title="How We Ship Globally"
          subtitle="A simple, coordinated infrastructure that connects our UAE headquarters with warehousing and fulfillment across four regions."
        />

        <div className="about-ops">
          {/* Hub node */}
          <motion.div
            className="about-ops__hub"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe size={18} />
            <span>UAE — Headquarters &amp; Coordination</span>
          </motion.div>

          {/* Arrow down */}
          <motion.div
            className="about-ops__arrow"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          />

          {/* Region nodes */}
          <motion.div
            className="about-ops__nodes"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            {[
              { flag: "🇺🇸", region: "United States", role: "Warehousing & Fulfillment" },
              { flag: "🇪🇺", region: "Europe",         role: "Local Distribution" },
              { flag: "🇭🇰", region: "Hong Kong",      role: "Asia-Pacific Warehousing" },
            ].map((n, i) => (
              <motion.div
                key={i}
                className="about-ops__node"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="about-ops__node-flag">{n.flag}</span>
                <span className="about-ops__node-region">{n.region}</span>
                <span className="about-ops__node-role">{n.role}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Arrow down */}
          <motion.div
            className="about-ops__arrow"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
          />

          {/* Outcome node */}
          <motion.div
            className="about-ops__hub about-ops__hub--green"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65 }}
          >
            <Zap size={18} />
            <span>Optimized Global Fulfillment</span>
          </motion.div>

          {/* Purpose tags */}
          <motion.div
            className="about-ops__purpose"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.75 }}
          >
            {[
              "Reduced transit times",
              "Flexible routing",
              "Consistent delivery reliability",
            ].map((tag, i) => (
              <span key={i} className="about-ops__purpose-tag">{tag}</span>
            ))}
          </motion.div>
        </div>
      </SectionContainer>
      {/* 8. SUPPORT SECTION */}
      <SectionContainer id="support" className="about-section">
        <div className="about-support__inner">
          {/* Left: text + list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="about-section-badge">
              <Headset size={14} />
              <span>We&apos;re Here to Help</span>
            </div>
            <h2 className="about-support__title">How We Support You</h2>
            <p className="about-support__subtitle">
              Our team assists research partners at every stage — from initial product questions to logistics coordination and institutional onboarding.
            </p>

            <ul className="about-support__list">
              {[
                "Product navigation &amp; catalog guidance",
                "Protocol and documentation requests",
                "International logistics coordination",
                "Bulk and institutional procurement inquiries",
              ].map((item, i) => (
                <li key={i} className="about-support__item">
                  <CheckCircle2 size={16} className="about-support__check" />
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: CTA card */}
          <motion.div
            className="about-support__card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <p className="about-support__card-body">
              Prefer to talk directly? Reach us via our contact form or on WhatsApp — we typically respond within a few hours.
            </p>
            <div className="about-support__actions">
              <Link to="/contact" className="about-support__btn-primary">
                <Mail size={18} /> Contact Our Team
              </Link>
              <a
                href="https://wa.me/971564179256"
                target="_blank"
                rel="noopener noreferrer"
                className="about-support__btn-whatsapp"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
            <p className="about-support__card-note">
              Mon – Fri, 09:00 – 18:00 GST &nbsp;·&nbsp; Usually responds same day
            </p>
          </motion.div>
        </div>
      </SectionContainer>

    </div>
  );
};

export default About;