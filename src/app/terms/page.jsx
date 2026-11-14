import React from 'react';
import Link from 'next/link';
import EditorialPageLayout from '@/components/shared/layouts/EditorialPageLayout';
import { Scale, Briefcase, FileText, ArrowRight, ShieldAlert } from '@/lib/icons';
import '@/app/legal.css';

export const metadata = {
  title: 'Terms of Service | Atlas Health Services',
  description: 'Operating terms governing clinical platform access, pharmaceutical compounding requisitions, and practitioner services.',
};

export default function TermsOfServicePage() {
  return (
    <EditorialPageLayout
      variant="legal"
      badge="Last Updated: January 2026 • Professional Terms"
      title="Terms of Service"
      subtitle="These terms govern access to the Atlas Health Services clinical compounding directory, practitioner portals, diagnostic telemetry, and temperature-controlled logistics."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Legal & Governance', href: '/privacy' },
        { label: 'Terms of Service' },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <Briefcase size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">1. Professional &amp; Institutional Access</h2>
          </div>
          <p className="gcp-legal-p">
            Platform features, monograph access, digital prescription intake, and wholesale compounding pricing
            are exclusively intended for licensed medical practitioners, registered compounding pharmacies,
            accredited research institutions, and authorized healthcare clinics.
          </p>
          <p className="gcp-legal-p">
            Users must provide truthful, current professional licensure data during credentialing. Atlas Health Services
            reserves the right to verify practitioner registration before enabling prescription fulfillment privileges.
          </p>
        </section>

        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <Scale size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">2. Clinical Discretion &amp; Monograph Use</h2>
          </div>
          <p className="gcp-legal-p">
            Therapeutic monographs, peer-reviewed clinical research dossiers, and protocol guidelines published on this platform
            are provided as professional informational and clinical reference resources:
          </p>
          <ul className="gcp-legal-list">
            <li><strong>Prescribing Authority:</strong> The prescribing physician retains independent professional judgment, diagnostic responsibility, and dosage oversight for individual patients.</li>
            <li><strong>Formulation Compatibility:</strong> Practitioners are responsible for evaluating patient contraindications, baseline multi-omics data, and pharmacological interactions.</li>
            <li><strong>No Autonomous Medical Advice:</strong> Materials do not substitute for licensed direct clinical assessment.</li>
          </ul>
        </section>

        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <ShieldAlert size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">3. Requisitions, Fulfillment &amp; Logistics</h2>
          </div>
          <p className="gcp-legal-p">
            Compounded active pharmaceutical ingredients, topical bio-collagens (Colway®), and diagnostic specimen kits (TeleTest®, Bloodo™)
            are prepared and dispatched according to Good Compounding Practices (GCP) and Good Distribution Practices (GDP):
          </p>
          <ul className="gcp-legal-list">
            <li><strong>Cold-Chain Integrity:</strong> Temperature-sensitive biologicals are transported via validated isothermal packaging (2°C – 8°C).</li>
            <li><strong>Verification:</strong> Delivery confirmation and lot tracking are registered in the practitioner portal upon dispatch.</li>
            <li><strong>Inspection:</strong> Clinics must inspect consignments upon receipt and report any packaging deviations within 48 hours via the portal.</li>
          </ul>
        </section>

        <section className="gcp-legal-card">
          <div className="gcp-legal-section-header">
            <FileText size={18} className="gcp-legal-section-icon" />
            <h2 className="gcp-legal-section-title">4. Inquiries &amp; Support</h2>
          </div>
          <p className="gcp-legal-p">
            Operational questions, account management requests, and compounding inquiries are handled through our institutional desk.
          </p>
          <div className="gcp-legal-contact-box">
            <div className="gcp-legal-contact-text">
              Require assistance with your practitioner account, wholesale requisitions, or institutional terms?
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
