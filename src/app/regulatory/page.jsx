import React from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Microscope,
  FileText,
  Clock,
  ArrowRight
} from '@/lib/icons';
import '@/app/legal.css';

export const metadata = {
  title: 'Regulatory Standards & Compliance (CPNP / CE-IVDR) | Atlas Health Services',
  description: 'European regulatory compliance matrix covering CPNP cosmetic notifications, CE-IVDR in-vitro diagnostics, and ISO 17025 certified purity.'
};

export default function RegulatoryStandardsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Regulatory Matrix', href: '/verify' },
    { label: 'Regulatory Standards' }
  ];

  return (
    <div className="gcp-legal-wrapper">
      <PublicUnifiedHeader track="regulatory" />

      <main className="gcp-legal-container">
        <Breadcrumb items={breadcrumbItems} />

        <header className="gcp-legal-header">
          <div className="gcp-legal-badge">
            <Clock size={12} />
            <span>Audited 2026 • EU Regulatory Matrix</span>
          </div>
          <h1 className="gcp-legal-title">Regulatory Standards & Compliance</h1>
          <p className="gcp-legal-subtitle">
            Atlas Health Services operates under European Union regulatory frameworks across topical dermo-cosmetics (CPNP),
            clinical in-vitro diagnostic telemetry (CE-IVDR), and certified laboratory compounding.
          </p>
        </header>

        {/* Standard 1: CPNP (Cosmetic Products Notification Portal) */}
        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <Award size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">1. CPNP European Cosmetics Registration (Regulation EC 1223/2009)</h2>
          </div>
          <p className="gcp-legal-p">
            All Colway® native tropocollagen biologicals (Platinum, Silver, Graphite, Atelocollagen) and clinical topical peptides
            marketed within the European Economic Area are fully compliant with Regulation (EC) No 1223/2009:
          </p>
          <ul className="gcp-legal-list">
            <li><strong>CPNP Notifications:</strong> Each product formula holds an active registration in the EU Cosmetic Products Notification Portal.</li>
            <li><strong>Cosmetic Product Safety Report (CPSR):</strong> Toxicological safety evaluations and stability testing are completed by qualified European safety assessors.</li>
            <li><strong>Good Manufacturing Practice:</strong> Formulations are produced in facilities adhering to ISO 22716:2007 (Cosmetics GMP).</li>
          </ul>
        </section>

        {/* Standard 2: CE-IVDR (In Vitro Diagnostic Regulation) */}
        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <Microscope size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">2. CE-IVDR Diagnostic Telemetry (Regulation EU 2017/746)</h2>
          </div>
          <p className="gcp-legal-p">
            Diagnostic test kits and capillary dry blood spot (DBS) collection systems provided through our TeleTest® and Bloodo™
            pathways conform to Regulation (EU) 2017/746 for In Vitro Diagnostic Medical Devices (IVDR):
          </p>
          <ul className="gcp-legal-list">
            <li><strong>CE Mark of Conformity:</strong> Specimen collection devices and lancets hold validated CE certification for human self-collection.</li>
            <li><strong>Clinical Performance:</strong> Capillary-to-venous analytical correlation exceeds 98.4% across HbA1c, lipid subfractions, and mineral ratios.</li>
            <li><strong>Quality Management:</strong> Partner processing facilities operate under ISO 13485 (Medical Devices Quality Management Systems).</li>
          </ul>
        </section>

        {/* Standard 3: ISO/IEC 17025 Analytical Testing & COAs */}
        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <CheckCircle2 size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">3. Analytical Quality & COA Verification (ISO 17025)</h2>
          </div>
          <p className="gcp-legal-p">
            Pharmaceutical compounding raw materials and peptide reference monographs are subject to rigorous analytical batch release:
          </p>
          <ul className="gcp-legal-list">
            <li><strong>HPLC Purity:</strong> Certified minimum purity of ≥98.0% verified via High-Performance Liquid Chromatography.</li>
            <li><strong>Mass Spectrometry:</strong> Molecular weight confirmation via LC-MS (Liquid Chromatography-Mass Spectrometry).</li>
            <li><strong>Lot-Specific COA:</strong> Individual Certificates of Analysis detailing endotoxin, bioburden, and heavy metal screening are accessible via our verification portal.</li>
          </ul>
        </section>

        {/* Section 4: Lot Verification & Regulatory Inquiries */}
        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <ShieldCheck size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">4. Lot Verification & Regulatory Inquiries</h2>
          </div>
          <p className="gcp-legal-p">
            Practitioners and regulatory auditors may inspect batch documentation and compliance certificates directly
            through our automated verification engine or via the regulatory affairs desk.
          </p>
          <div className="gcp-legal-contact-box">
            <div className="gcp-legal-contact-text">
              Looking to verify a specific batch CoA or request institutional regulatory dossiers?
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href="/verify" className="gcp-legal-contact-btn" style={{ backgroundColor: '#003666' }}>
                <FileText size={14} />
                <span>Verify Lot / COA</span>
              </Link>
              <Link href="/contact" className="gcp-legal-contact-btn">
                <span>Regulatory Contact Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <PublicUnifiedFooter />
    </div>
  );
}
