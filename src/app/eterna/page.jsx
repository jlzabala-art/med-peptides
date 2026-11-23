import React from 'react';

const TITLE = 'ETERNA — Precision Health Ecosystem for Modern Clinics';
const DESCRIPTION =
  'Unified multiomics platform bridging advanced patient diagnostics (Genetics 360, AgeScan biomarkers, wearable telemetry) and AI-driven clinic management.';
const PREVIEW_IMAGE = 'https://www.atlashealth-services.com/docs/eterna-preview.png';
const PDF_PATH = '/docs/eterna-precision-health-ecosystem.pdf';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    url: 'https://www.atlashealth-services.com/eterna',
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'ETERNA',
    images: [
      {
        url: PREVIEW_IMAGE,
        width: 1600,
        height: 893,
        alt: 'ETERNA: The Complete Precision Health Ecosystem for Modern Clinics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [PREVIEW_IMAGE],
  },
};

export default function EternaOverviewPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px 16px 48px',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <header
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 750, color: '#0f172a' }}>
              ETERNA: The Complete Precision Health Ecosystem for Modern Clinics
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#475569' }}>
              Integrated Multiomics (Genetics 360, AgeScan Biomarkers, Wearables) &amp; AI-Driven Clinic Platform
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <a
              href={PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Open PDF
            </a>
            <a
              href={PDF_PATH}
              download="ETERNA_Precision_Health_Ecosystem.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                padding: '0 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Download PDF
            </a>
          </div>
        </header>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          }}
        >
          <img
            src="/docs/eterna-preview.png"
            alt="ETERNA: The Complete Precision Health Ecosystem for Modern Clinics"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </section>
      </div>
    </main>
  );
}
