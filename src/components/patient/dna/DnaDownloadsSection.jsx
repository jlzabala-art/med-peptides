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
  sampleCode,
  audienceMode = 'patient'
}) {
  const isNutritionist = audienceMode === 'nutritionist';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 54, 102, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isNutritionist ? 'NUTRITIONIST & PATIENT PDF ARCHIVE' : 'YOUR PERSONALIZED NUTRITION PDF'}
            </span>
            <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '3px 0 0 0' }}>
              {isNutritionist ? 'Download Nutritionist & Patient PDFs' : 'Download Simple Patient Guide (No Annexes)'}
            </h3>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', fontWeight: 700 }}>
            {isNutritionist ? 'Nutritionist Edition · Merged 24Genetics' : 'Lightweight Edition · Ready for Mobile'}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
          {isNutritionist
            ? 'Nutritionist dossiers merge the 11-page executive plan with the complete original 24Genetics Nutrition & Ancestry reports (113 pages total). Patient PDFs omit raw lab annexes for clarity.'
            : 'Clean, spacious 11-page PDF with your 2-step Ancestry + Nutrition methodology, 7-day meal plan, 17-family food traffic light, and Fridge Cheat Sheet—without heavy lab annexes.'}
        </p>
      </div>

      {/* Grid of PDF Download Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {/* Simple Patient PDF (Always visible) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #99f6e4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(13, 148, 136, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 850, backgroundColor: '#0d9488', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                PATIENT EDITION (11 PAGES)
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e' }}>No Lab Annexes</span>
            </div>
            <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
              Simple Meal Plan &amp; Food Guide
            </h4>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
              Spacious 11-page guide: Ancestry × Nutrition synthesis, 2-page 7-day meal plan, 17-family food matrix, targeted nutrients, and 1-page Fridge Cheat Sheet.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a
              href={mealPlanPdfUrlLight}
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
              <Printer size={16} />
              <span>Download Patient Simple PDF (11 Pgs)</span>
            </a>
            {pdfDownloadUrlLight && (
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
                <Pill size={14} />
                <span>Simple Supplement Guide (No Annexes)</span>
              </a>
            )}
          </div>
        </div>

        {/* Nutritionist Full Dossiers (ONLY visible in Nutritionist Mode) */}
        {isNutritionist && (
          <>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #bae6fd', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 850, backgroundColor: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                    NUTRITIONIST DOSSIER (MERGED)
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1' }}>Includes 24Genetics</span>
                </div>
                <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Nutritionist Meal &amp; 24Genetics Dossier
                </h4>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                  Complete nutritionist document: 5-page planning guide, 17-family matrix, 24h routine, merged with the original 24Genetics CE-IVD report.
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
                  <span>Download Nutritionist Dossier (Merged)</span>
                </a>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #bfdbfe', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0, 54, 102, 0.08)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 850, backgroundColor: '#003666', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                    FORMULATION &amp; SNPS (MERGED)
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666' }}>Nutritionist &amp; Lab</span>
                </div>
                <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Nutrigenomics &amp; Formulation Dossier
                </h4>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                  Full SNP/rsID interpretation, OTC vs. compounded formula plan, Ancestry × Nutrition fusion, and merged original 24Genetics report.
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
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 750,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}
                >
                  <Pill size={16} />
                  <span>Download Formulation Dossier (Merged)</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
