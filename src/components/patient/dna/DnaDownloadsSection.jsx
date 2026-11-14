'use client';

import React from 'react';
import { Download, Utensils, Pill, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

/**
 * Chapter 6: Official PDF Dossiers & Clinical Downloads
 * Luxury MedTech UI providing direct 1-click access to the full 59-page dossiers
 * as well as lightweight 5-page and 3-page executive printouts.
 */
export default function DnaDownloadsSection({
  mealPlanPdfUrl,
  pdfDownloadUrl,
  mealPlanPdfUrlLight,
  pdfDownloadUrlLight,
  patientName,
  sampleCode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 54, 102, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OFFICIAL CLINICAL DOCUMENT ARCHIVE
            </span>
            <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '3px 0 0 0' }}>
              Download Verified PDF Dossiers
            </h3>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', fontWeight: 700 }}>
            CE-IVD Certified Dossiers · Vectorized Barcoded Archival
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
          All documents are certified by Atlas Health Services and include high-resolution vectorized clinical tables and barcodes.
        </p>
      </div>

      {/* Grid of PDF Download Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {/* Full 59-page Meal Plan Dossier */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #bae6fd', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 850, backgroundColor: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                COMPLETE DOSSIER (59 PAGES)
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1' }}>Includes 24Genetics</span>
            </div>
            <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
              Meal Plan &amp; Nutrition Dossier
            </h4>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
              Complete 59-page clinical document: Executive 5-page meal plan guide, 17-family food matrix, 24h routine, and the original 55-page CE-IVD 24Genetics laboratory report.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a
              href={mealPlanPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 750,
                fontSize: '0.82rem',
                textDecoration: 'none'
              }}
            >
              <Utensils size={16} />
              <span>Download Meal Plan Dossier (59 Pgs)</span>
            </a>
            <a
              href={mealPlanPdfUrlLight}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.76rem',
                textDecoration: 'none'
              }}
            >
              <Printer size={14} />
              <span>Lightweight Executive Guide Only (5 Pgs)</span>
            </a>
          </div>
        </div>

        {/* Full 59-page Clinical Rx Dossier */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #99f6e4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(13, 148, 136, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 850, backgroundColor: '#0d9488', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                MEDICAL PRESCRIPTION (59 PAGES)
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e' }}>Doctor &amp; Pharmacy</span>
            </div>
            <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
              Clinical Rx &amp; Compounding Dossier
            </h4>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
              Complete clinical dossier: 3-page official compounding prescription sheet (Fórmula Magistral) with vehicle compatibility and physician sign-off + full original 24Genetics report.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 750,
                fontSize: '0.82rem',
                textDecoration: 'none'
              }}
            >
              <Pill size={16} />
              <span>Download Clinical Rx Dossier (59 Pgs)</span>
            </a>
            <a
              href={pdfDownloadUrlLight}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.76rem',
                textDecoration: 'none'
              }}
            >
              <Printer size={14} />
              <span>Lightweight Clinical Prescription Only (3 Pgs)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
