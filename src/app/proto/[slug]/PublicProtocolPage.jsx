"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import ClinicalGanttTimeline from '../../../components/protocol/ClinicalGanttTimeline';
import { SUPPORTED_LANGUAGES, getTranslations, getLocalizedField } from '../../../utils/productTranslations';

function WaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function PublicProtocolPage({ protocol, slug, baseUrl }) {
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const publicUrl = `${baseUrl}/proto/${slug}`;
  const t = getTranslations(lang);

  const name = protocol.name || protocol.title || 'Clinical Protocol';
  const category = protocol.category || protocol.goal || protocol.therapeutic_category || 'Clinical Protocol';
  const duration = protocol.durationWeeks ? `${protocol.durationWeeks} Weeks` : (protocol.duration || '8 Weeks');
  const description = getLocalizedField(protocol, 'description', lang) || protocol.description || protocol.summary || protocol.clinicalRationale || '';
  const items = protocol.items || protocol.products || protocol.peptides || [];
  const phases = protocol.phases || [];

  useEffect(() => {
    const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
    if (browserLang && SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
      setLang(browserLang);
    }
  }, []);

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*${name}* — ${t.protocolBadge}\n\nDuration: ${duration} | Category: ${category}\n${description.substring(0, 180)}…\n\nView Full Protocol Guide:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="proto-public-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <style>{`
        .proto-top-banner {
          position: sticky;
          top: 0;
          z-index: 500;
          background: #003666;
          color: white;
          padding: 0.65rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
        }
        .proto-lang-select {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          outline: none;
        }
        .proto-lang-select option { background: #003666; color: white; }
        .proto-banner-btn {
          border: 1.5px solid rgba(255,255,255,0.4);
          background: transparent;
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: 7px;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .proto-banner-btn:hover { background: rgba(255,255,255,0.15); }
        .proto-btn-wa {
          background: #25d366 !important;
          border-color: #25d366 !important;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
        }
        .proto-btn-wa:hover { background: #1da354 !important; }
        
        .proto-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          padding: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .proto-bottom-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 400;
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 0.75rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          align-items: center;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
        }
        .proto-bottom-bar button {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1.25rem;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .proto-bottom-bar button:hover { transform: translateY(-1px); }

        @media print {
          .proto-top-banner, .proto-bottom-bar, .proto-no-print { display: none !important; }
          body, .proto-public-wrapper { background: white !important; }
          .proto-card { box-shadow: none !important; border: 1px solid #cbd5e1 !important; page-break-inside: avoid; }
          @page { margin: 1.2cm; }
        }
      `}</style>

      {/* Top Banner */}
      <header className="proto-top-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ fontSize: '1rem', letterSpacing: '-0.02em' }}>{t.brandName}</strong>
          <span style={{
            background: 'rgba(255,255,255,0.18)',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
          }}>
            {t.protocolBadge}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            className="proto-lang-select" 
            value={lang} 
            onChange={(e) => startTransition(() => setLang(e.target.value))}
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>

          <button className="proto-banner-btn" onClick={handleCopyUrl}>
            {copied ? `✓ ${t.copied}` : `🔗 ${t.copyLink}`}
          </button>
          <button className="proto-banner-btn" onClick={handlePrint}>
            🖨 {t.printPdf}
          </button>
          <button className="proto-banner-btn proto-btn-wa" onClick={handleWhatsApp}>
            <WaIcon /> {t.shareWhatsapp}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem 6rem' }}>
        {/* Header Hero Card */}
        <div className="proto-card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                {category}
              </span>
              <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                ⏱ {duration}
              </span>
              <span style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                🔒 {t.medicalUseOnly}
              </span>
            </div>

            <h1 style={{ margin: '0 0 0.75rem 0', fontSize: '1.85rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {name}
            </h1>

            {description && (
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: '#475569' }}>
                {description}
              </p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="proto-no-print" style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            minWidth: '130px'
          }}>
            <QRCodeSVG value={publicUrl} size={108} level="M" />
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginTop: '0.5rem' }}>
              {t.scannedForGuide}
            </div>
          </div>
        </div>

        {/* Included Compounds & Formulations */}
        <div className="proto-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧪 {t.includedPeptides}
          </h2>

          {items.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Detailed compounds listed in clinical treatment plan.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {items.map((item, idx) => {
                const itemSlug = item.slug || item.productId || item.id;
                return (
                  <div key={idx} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem',
                    background: '#fdfdfe',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{item.name || item.title}</strong>
                        {item.dosage && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            {item.dosage}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                        {item.timing || item.schedule || item.instructions || 'Daily protocol administration'}
                      </p>
                    </div>

                    {itemSlug && (
                      <Link 
                        href={`/p/${itemSlug}`}
                        target="_blank"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#2563eb',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        📄 {t.viewDatasheet} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Clinical Gantt Timeline */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <ClinicalGanttTimeline protocol={protocol} />
        </div>

        {/* Safety & Guidelines */}
        <div className="proto-card" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⚠️ {t.contraindications}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
            {protocol.safetyGuidelines || protocol.contraindications || protocol.warnings || 
              'This protocol is intended strictly under licensed healthcare professional supervision. Verify bloodwork biomarkers before, during, and post-cycle.'}
          </p>
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="proto-bottom-bar">
        <button 
          onClick={handleWhatsApp}
          style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', color: 'white' }}
        >
          <WaIcon /> {t.shareWhatsapp}
        </button>
        <button 
          onClick={handlePrint}
          style={{ background: 'white', color: '#334155', border: '1.5px solid #cbd5e1' }}
        >
          🖨 {t.downloadPdf}
        </button>
        <button 
          onClick={handleCopyUrl}
          style={{ background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }}
        >
          {copied ? `✓ ${t.copied}` : `🔗 ${t.copyLink}`}
        </button>
      </div>
    </div>
  );
}
