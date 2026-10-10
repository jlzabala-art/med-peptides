'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import { ArrowLeft, ShieldCheck, Database, Globe } from '@/lib/icons';

export default function RxLabelsStandaloneClient({
  rx,
  labels = [],
  code,
  initialEditMode = false,
  initialLabelIndex = 0,
  initialLang = 'en'
}) {
  const [modalOpen, setModalOpen] = useState(true);
  const [lang, setLang] = useState(initialLang || 'en');
  const isEs = lang === 'es';

  const patientName = rx?.patient?.name || rx?.patientName || 'Patient';
  const rxCode = rx?.fileNumber || rx?.code || code;

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Google Cloud Shell Top Bar */}
      <header className="gcp-shell-topbar">
        <style>{`
          .gcp-shell-topbar {
            background: #ffffff;
            border-bottom: 1px solid #dadce0;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 1px 2px rgba(60,64,67,0.06);
          }
          @media (max-width: 768px) {
            .gcp-shell-topbar {
              padding: 8px 12px !important;
              gap: 8px !important;
            }
            .gcp-shell-topbar-info {
              width: 100% !important;
              order: 2 !important;
              padding-top: 4px !important;
              border-top: 1px dashed #e8eaed !important;
            }
            .gcp-shell-topbar-actions {
              order: 1 !important;
            }
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexWrap: 'wrap' }}>
          <Link
            href={`/rx/${encodeURIComponent(code)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.80rem',
              fontWeight: 600,
              color: '#1a73e8',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              background: '#f8fafd',
              border: '1px solid #d2e3fc',
              transition: 'all 0.15s'
            }}
          >
            <ArrowLeft size={14} />
            <span>{isEs ? 'Volver a Prescripción' : 'Back to Prescription'}</span>
          </Link>

          <div className="gcp-shell-topbar-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ fontSize: '0.78rem', color: '#5f6368', fontWeight: 500 }}>
              {isEs ? 'Prescripción' : 'Prescription'} <strong style={{ color: '#202124' }}>#{rxCode}</strong>
            </span>
            <span style={{ color: '#dadce0' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#202124', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {patientName}
            </span>
          </div>
        </div>

        <div className="gcp-shell-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language Switcher */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f3f4',
            borderRadius: '4px',
            padding: '2px',
            border: '1px solid #dadce0'
          }}>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                border: 'none',
                background: !isEs ? '#ffffff' : 'transparent',
                color: !isEs ? '#1a73e8' : '#5f6368',
                fontWeight: !isEs ? 700 : 500,
                fontSize: '0.70rem',
                padding: '3px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                boxShadow: !isEs ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              style={{
                border: 'none',
                background: isEs ? '#ffffff' : 'transparent',
                color: isEs ? '#1a73e8' : '#5f6368',
                fontWeight: isEs ? 700 : 500,
                fontSize: '0.70rem',
                padding: '3px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                boxShadow: isEs ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              ES
            </button>
          </div>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 600,
            color: '#137333',
            background: '#e6f4ea',
            border: '1px solid #ceead6',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} />
            <span>EU GMP Certified</span>
          </span>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 600,
            color: '#1a73e8',
            background: '#e8f0fe',
            border: '1px solid #d2e3fc',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Database size={12} />
            <span>Firebase Sync</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PharmacyLabelsModal
          isOpen={modalOpen}
          onClose={() => {
            // In standalone mode, closing redirects back to the main prescription view
            if (typeof window !== 'undefined') {
              window.location.href = `/rx/${encodeURIComponent(code)}`;
            }
          }}
          labels={labels}
          initialLabelIndex={initialLabelIndex}
          initialEditMode={initialEditMode}
          isStandalone={true}
          isEs={isEs}
        />
      </main>
    </div>
  );
}
