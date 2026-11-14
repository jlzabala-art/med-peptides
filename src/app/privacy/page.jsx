import React from 'react';
import Link from 'next/link';
import EditorialPageLayout from '@/components/shared/layouts/EditorialPageLayout';
import { ShieldCheck, Lock, FileText, Building2, ArrowRight } from '@/lib/icons';
import '@/app/legal.css';

export const metadata = {
  title: 'Privacy Policy | Atlas Health Services',
  description: 'Data protection standards, clinical telemetry confidentiality, and GDPR compliance governance at Atlas Health Services.',
};

export default function PrivacyPolicyPage() {
  return (
    <EditorialPageLayout
      variant="legal"
      badge="Effective: January 2026 • GDPR / RGPD Compliant"
      title="Privacy Policy & Data Protection"
      subtitle="Atlas Health Services enforces clinical-grade confidentiality, cryptographic security, and strict European privacy principles for all practitioners, clinic partners, and diagnostic requisitions."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Legal & Governance', href: '/terms' },
        { label: 'Privacy Policy' },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <Building2 size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">1. Scope &amp; Governance</h2>
          </div>
          <p className="gcp-legal-p">
            This Policy outlines the institutional practices of Atlas Health Services regarding the collection,
            processing, and safeguarding of professional and clinical telemetry data across our compounding directory,
            practitioner portals, and laboratory integrations.
          </p>
          <p className="gcp-legal-p">
            We adhere strictly to Regulation (EU) 2016/679 (General Data Protection Regulation - GDPR / RGPD)
            and applicable healthcare data protection standards.
          </p>
        </section>

        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <Lock size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">2. Clinical Confidentiality &amp; Security</h2>
          </div>
          <p className="gcp-legal-p">
            Patient health information, digital compounding prescriptions (E-Rx), and laboratory diagnostic telemetry
            (TeleTest®, Bloodo™) are classified as sensitive healthcare data and receive maximum isolation:
          </p>
          <ul className="gcp-legal-list">
            <li><strong>Encryption in Transit:</strong> All communications enforce TLS 1.3 cryptographic protocols with modern cipher suites.</li>
            <li><strong>Encryption at Rest:</strong> Data stores utilize AES-256 standard encryption with strict access-control isolation.</li>
            <li><strong>Zero Commercial Monetization:</strong> We never sell, lease, or monetize clinical, genetic, or diagnostic data to third-party commercial brokers.</li>
            <li><strong>Chain of Custody:</strong> Requisition and specimen tracking are logged immutably for clinical verification and quality audits.</li>
          </ul>
        </section>

        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <FileText size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">3. Practitioner &amp; Patient Rights</h2>
          </div>
          <p className="gcp-legal-p">
            In compliance with European data protection regulations, verified users and accredited practitioners hold the following rights:
          </p>
          <ul className="gcp-legal-list">
            <li>Right to access personal account details and transaction history.</li>
            <li>Right to request rectification of inaccurate administrative information.</li>
            <li>Right to data portability in structured, machine-readable formats.</li>
            <li>Right to erasure, subject to mandatory medical record and pharmacovigilance statutory retention periods.</li>
          </ul>
        </section>

        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <ShieldCheck size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">4. Privacy Requests &amp; Inquiries</h2>
          </div>
          <p className="gcp-legal-p">
            All inquiries regarding data protection, access requests, or regulatory audits are routed securely
            through our institutional contact desk to ensure proper identity verification and prompt handling.
          </p>
          <div className="gcp-legal-contact-box">
            <div className="gcp-legal-contact-text">
              Have questions regarding data processing or need to submit a formal privacy request?
              Access our verified institutional desk.
            </div>
            <Link href="/contact" className="gcp-legal-contact-btn">
              <span>Contact Institutional Desk</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </EditorialPageLayout>
  );
}
