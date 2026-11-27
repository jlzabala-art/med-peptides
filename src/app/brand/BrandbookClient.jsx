'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import BrandLogo from '@/components/common/BrandLogo';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import BRAND_CONFIG from '@/config/brandConfig';
import {
  Download,
  Copy,
  Check,
  Printer,
  Palette,
  Type,
  ShieldCheck,
  Sparkles,
  Mail,
  Layers,
  Globe,
  ExternalLink,
} from '@/lib/icons';

const PRIMARY_SWATCHES = [
  {
    nameEn: 'Atlas Deep Navy',
    nameEs: 'Atlas Deep Navy (Principal)',
    roleEn: 'Primary Brand · Headers · Key Headings',
    roleEs: 'Color Principal · Cabeceras · Títulos',
    hex: '#003666',
    rgb: '0, 54, 102',
    token: '--atlas-brand-navy',
    darkText: false,
  },
  {
    nameEn: 'Atlas Clinical Blue',
    nameEs: 'Atlas Clinical Blue (Secundario)',
    roleEn: 'Secondary · Primary Interactive CTAs · Links',
    roleEs: 'Color Secundario · Botones CTA · Enlaces',
    hex: '#1A73E8',
    rgb: '26, 115, 232',
    token: '--atlas-brand-blue',
    darkText: false,
  },
  {
    nameEn: 'Medical Teal',
    nameEs: 'Medical Teal (Acento Clínico)',
    roleEn: 'Doctor Portal · BHRT & Clinical Guides',
    roleEs: 'Portal Médico · Guías Clínicas y BHRT',
    hex: '#0D9488',
    rgb: '13, 148, 136',
    token: '--atlas-brand-teal',
    darkText: false,
  },
  {
    nameEn: 'EKG Pulse Cyan',
    nameEs: 'EKG Pulse Cyan (Trazo Logo)',
    roleEn: 'Logo Heartbeat Crossbar · Micro-Highlights',
    roleEs: 'Trazo EKG del Isotipo · Detalles Técnicos',
    hex: '#00BCD4',
    rgb: '0, 188, 212',
    token: '--atlas-brand-cyan',
    darkText: true,
  },
  {
    nameEn: 'Clinical Sky',
    nameEs: 'Clinical Sky (Acento Oscuro)',
    roleEn: 'Dark Surfaces · Inverted Wordmark Accent',
    roleEs: 'Fondos Oscuros · Acento sobre Navy',
    hex: '#38BDF8',
    rgb: '56, 189, 248',
    token: '--atlas-brand-sky',
    darkText: true,
  },
];

const NEUTRAL_SWATCHES = [
  { name: 'Ink Primary', hex: '#0F172A', rgb: '15, 23, 42', token: '--atlas-ink-primary', darkText: false },
  { name: 'Ink Secondary', hex: '#475569', rgb: '71, 85, 105', token: '--atlas-ink-secondary', darkText: false },
  { name: 'Ink Control', hex: '#5F6368', rgb: '95, 99, 104', token: '--atlas-ink-control', darkText: false },
  { name: 'Border Control', hex: '#DADCE0', rgb: '218, 220, 224', token: '--atlas-border-control', darkText: true },
  { name: 'Surface Muted', hex: '#F1F5F9', rgb: '241, 245, 249', token: '--atlas-surface-muted', darkText: true },
  { name: 'Surface Page', hex: '#F8FAFC', rgb: '248, 250, 252', token: '--atlas-surface-page', darkText: true },
  { name: 'Surface Card', hex: '#FFFFFF', rgb: '255, 255, 255', token: '--atlas-surface-card', darkText: true },
];

const LOGO_FILES = [
  {
    id: 'horiz-svg',
    format: 'SVG',
    titleEn: 'Primary Horizontal (Light BG)',
    titleEs: 'Horizontal Principal (Fondo Claro)',
    descEn: 'Master vector SVG for web, decks, print & agencies.',
    descEs: 'Vector maestro SVG para web, presentaciones e imprenta.',
    href: '/brand/atlas-logo-horizontal.svg',
    fileName: 'atlas-health-logo-horizontal.svg',
    darkBg: false,
    preview: 'horizontal-light',
  },
  {
    id: 'horiz-dark-svg',
    format: 'SVG',
    titleEn: 'Inverted Horizontal (Navy / Dark BG)',
    titleEs: 'Horizontal Invertido (Fondo Navy)',
    descEn: 'Master vector SVG for dark headers, covers & video.',
    descEs: 'Vector maestro SVG para cabeceras oscuras y portadas.',
    href: '/brand/atlas-logo-horizontal-dark.svg',
    fileName: 'atlas-health-logo-horizontal-dark.svg',
    darkBg: true,
    preview: 'horizontal-dark',
  },
  {
    id: 'icon-svg',
    format: 'SVG',
    titleEn: 'Standalone Isotype ("A" EKG)',
    titleEs: 'Isotipo Solo ("A" EKG)',
    descEn: 'Pure vector mark for favicons, stamps & watermarks.',
    descEs: 'Marca vectorial pura para favicons, sellos y marcas de agua.',
    href: '/brand/atlas-icon.svg',
    fileName: 'atlas-health-icon.svg',
    darkBg: false,
    preview: 'icon-only',
  },
  {
    id: 'badge-svg',
    format: 'SVG',
    titleEn: 'App Icon Badge (Dark Squircle)',
    titleEs: 'Icono App / Avatar (Squircle)',
    descEn: 'Official app icon & browser tab favicon vector.',
    descEs: 'Icono oficial de aplicación y favicon vectorial.',
    href: '/favicon.svg',
    fileName: 'atlas-health-app-icon.svg',
    darkBg: true,
    preview: 'badge-svg',
  },
  {
    id: 'horiz-png',
    format: 'PNG',
    titleEn: 'Horizontal PNG (Email & Docs)',
    titleEs: 'Horizontal PNG (Email y Docs)',
    descEn: 'High-res raster fallback when SVG is not supported.',
    descEs: 'Respaldo PNG alta resolución para email y documentos.',
    href: '/atlas-health-logo.png',
    fileName: 'atlas-health-logo.png',
    darkBg: false,
    preview: 'horizontal-light',
  },
  {
    id: 'wa-png',
    format: 'PNG',
    titleEn: 'Square PNG (WhatsApp / Social)',
    titleEs: 'Cuadrado PNG (WhatsApp / RRSS)',
    descEn: 'Optimized square avatar for WhatsApp Business & LinkedIn.',
    descEs: 'Avatar cuadrado optimizado para WhatsApp Business y LinkedIn.',
    href: '/atlas-health-logo-wa.png',
    fileName: 'atlas-health-logo-square.png',
    darkBg: false,
    preview: 'icon-only',
  },
];

export default function BrandbookClient({ initialLang = 'es' }) {
  const [lang, setLang] = useState(initialLang === 'en' ? 'en' : 'es');
  const [copiedKey, setCopiedKey] = useState(null);
  const [sigName, setSigName] = useState('José Luis Zabala');
  const [sigRole, setSigRole] = useState('Managing Director · Clinical & B2B Supply');
  const [sigEmail, setSigEmail] = useState(BRAND_CONFIG.supportEmail);
  const [sigPhone, setSigPhone] = useState('+34 600 000 000');

  const isEs = lang === 'es';

  const handleCopy = async (text, key, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(isEs ? `${label || text} copiado` : `${label || text} copied`);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      toast.error(isEs ? 'No se pudo copiar al portapapeles' : 'Could not copy to clipboard');
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${BRAND_CONFIG.url}/brand?lang=${lang}`;
    handleCopy(shareUrl, 'share-url', isEs ? 'Enlace del Brandbook' : 'Brandbook link');
  };

  const buildEmailSignatureHtml = () => {
    const safeName = sigName.trim() || 'Atlas Health Services';
    const safeRole = sigRole.trim();
    const safeEmail = sigEmail.trim() || BRAND_CONFIG.supportEmail;
    const safePhone = sigPhone.trim();
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #0F172A; border-collapse: collapse;">
  <tr>
    <td style="padding-right: 16px; border-right: 3px solid #003666; vertical-align: middle;">
      <img src="https://www.atlashealth-services.com/atlas-health-logo-wa.png" alt="Atlas Health Services" width="56" height="56" style="display: block; border-radius: 10px;" />
    </td>
    <td style="padding-left: 16px; vertical-align: middle;">
      <div style="font-size: 15px; font-weight: 800; color: #003666; line-height: 1.25;">${safeName}</div>
      ${safeRole ? `<div style="font-size: 12px; font-weight: 600; color: #475569; margin-top: 2px;">${safeRole}</div>` : ''}
      <div style="font-size: 12px; font-weight: 700; color: #1A73E8; margin-top: 6px;">Atlas Health Services</div>
      <div style="font-size: 11.5px; color: #5F6368; margin-top: 3px;">
        <a href="mailto:${safeEmail}" style="color: #003666; text-decoration: none;">${safeEmail}</a>${safePhone ? ` &nbsp;·&nbsp; ${safePhone}` : ''} &nbsp;·&nbsp; <a href="https://www.atlashealth-services.com" style="color: #1A73E8; text-decoration: none;">atlashealth-services.com</a>
      </div>
    </td>
  </tr>
</table>`;
  };

  const handleCopySignatureHtml = async () => {
    const html = buildEmailSignatureHtml();
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([`${sigName} — ${sigRole}\nAtlas Health Services · ${sigEmail} · ${BRAND_CONFIG.url}`], { type: 'text/plain' });
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setCopiedKey('email-sig');
      toast.success(isEs ? 'Firma HTML copiada (pega directo en Gmail / Outlook)' : 'HTML Signature copied (paste directly into Gmail / Outlook)');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      await handleCopy(html, 'email-sig', isEs ? 'Código HTML de firma' : 'Signature HTML code');
    }
  };

  return (
    <div className="atlas-page-bg">
      <style>{`
        .bb-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        .bb-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
        .bb-grid-5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.85rem; }
        .bb-grid-7 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.65rem; }
        @media (max-width: 1024px) {
          .bb-grid-5 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .bb-grid-7 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .bb-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .bb-grid-2, .bb-grid-3, .bb-grid-5 { grid-template-columns: 1fr; }
          .bb-grid-7 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media print {
          .bb-no-print, header, footer, nav { display: none !important; }
          .atlas-page-bg { background: #ffffff !important; }
          .atlas-page-shell { max-width: 100% !important; padding: 0 !important; }
          .atlas-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #cbd5e1 !important; }
          @page { size: A4 portrait; margin: 14mm; }
        }
      `}</style>

      <div className="bb-no-print">
        <PublicUnifiedHeader />
      </div>

      <main className="atlas-page-shell" style={{ paddingTop: '1.25rem', paddingBottom: '4rem' }}>
        {/* Compact GCP Hero Header */}
        <section className="atlas-hero-card" style={{ marginBottom: '1.25rem' }}>
          <div className="atlas-hero-row">
            <div className="atlas-hero-identity">
              <div className="atlas-hero-eyebrow">
                <span className="atlas-hero-pill-primary">
                  <ShieldCheck size={11} />
                  {isEs ? 'BRANDBOOK OFICIAL · V2.0' : 'OFFICIAL BRANDBOOK · V2.0'}
                </span>
                <span className="atlas-hero-pill-secondary">SVG · HEX · INTER · JETBRAINS MONO</span>
                <span className="atlas-hero-pill-meta">
                  <span className="atlas-hero-pill-meta-lbl">SSOT</span>
                  {BRAND_CONFIG.domain}
                </span>
              </div>
              <h1 className="atlas-hero-title">
                {isEs
                  ? 'Manual de Identidad Visual — Atlas Health Services'
                  : 'Visual Identity & Brandbook — Atlas Health Services'}
              </h1>
              <p className="atlas-hero-subtitle">
                {isEs
                  ? 'Logotipos vectoriales SVG, paleta principal y secundaria, tipografía oficial, sistema de componentes Google Cloud UX y generador de firma institucional listo para compartir con socios y agencias.'
                  : 'Master SVG vector logos, primary & secondary color palette, official typography, Google Cloud UX component system, and institutional email signature kit ready to share with partners and agencies.'}
              </p>
            </div>

            <div className="atlas-hero-actions bb-no-print">
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setLang(isEs ? 'en' : 'es')}
                style={{ minHeight: '36px', padding: '0 12px' }}
              >
                <Globe size={15} />
                {isEs ? 'EN' : 'ES'}
              </button>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleCopyLink}
                style={{ minHeight: '36px', padding: '0 12px' }}
              >
                {copiedKey === 'share-url' ? <Check size={15} /> : <Copy size={15} />}
                {isEs ? 'Copiar enlace' : 'Copy link'}
              </button>
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => window.print()}
                style={{ minHeight: '36px', padding: '0 14px', backgroundColor: '#003666' }}
              >
                <Printer size={15} />
                {isEs ? 'Descargar Brandbook PDF' : 'Download Brandbook PDF'}
              </button>
            </div>
          </div>
        </section>

        {/* Quick Executive Spec Strip (4 KPI Cards) */}
        <section className="atlas-kpi-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="atlas-card" style={{ padding: '0.9rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              {isEs ? 'Color Principal' : 'Primary Color'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: '#003666', display: 'inline-block', border: '1px solid #002244' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--atlas-font-mono)' }}>#003666</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>Atlas Deep Navy</div>
          </div>

          <div className="atlas-card" style={{ padding: '0.9rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              {isEs ? 'Color Secundario' : 'Secondary Color'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: '#1A73E8', display: 'inline-block' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--atlas-font-mono)' }}>#1A73E8</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>Atlas Clinical Blue</div>
          </div>

          <div className="atlas-card" style={{ padding: '0.9rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              {isEs ? 'Tipografía Oficial' : 'Official Typography'}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>Inter + JetBrains Mono</div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>Google Fonts · Open Source</div>
          </div>

          <div className="atlas-card" style={{ padding: '0.9rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              {isEs ? 'Formato Maestro Logo' : 'Master Logo Format'}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>SVG Vector + PNG</div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>
              {isEs ? '6 archivos listos para descarga' : '6 ready-to-download assets'}
            </div>
          </div>
        </section>

        <div className="atlas-section-stack">
          {/* SECTION 1: OFFICIAL SVG LOGO KIT */}
          <section className="atlas-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#003666" />
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                  {isEs ? '1. Logotipo Oficial y Kit Vectorial (SVG)' : '1. Official Logo & Vector Kit (SVG)'}
                </h2>
              </div>
              <StatusBadge status="active" customLabel={isEs ? 'Prioridad SVG Vectorial' : 'SVG Vector First'} />
            </div>

            <div className="bb-grid-3">
              {LOGO_FILES.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      height: '112px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1rem',
                      background: item.darkBg
                        ? 'linear-gradient(135deg, #002244 0%, #003666 100%)'
                        : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {item.preview === 'horizontal-light' && <BrandLogo variant="dark" size="compact" />}
                    {item.preview === 'horizontal-dark' && <BrandLogo variant="light" size="compact" />}
                    {item.preview === 'icon-only' && <AtlasHealthLogo size={54} variant="dark" />}
                    {item.preview === 'badge-svg' && (
                      <img src="/favicon.svg" alt="Atlas App Icon SVG" width={54} height={54} style={{ display: 'block' }} />
                    )}
                  </div>

                  <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                        {isEs ? item.titleEs : item.titleEn}
                      </strong>
                      <span
                        className={`gcp-pill-base gcp-pill-sm ${item.format === 'SVG' ? 'gcp-pill-blue' : 'gcp-pill-slate'}`}
                      >
                        {item.format}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, flex: 1 }}>
                      {isEs ? item.descEs : item.descEn}
                    </p>
                    <a
                      href={item.href}
                      download={item.fileName}
                      className="gcp-btn-secondary bb-no-print"
                      style={{ marginTop: '0.5rem', minHeight: '34px', fontSize: '0.76rem', width: '100%', textDecoration: 'none' }}
                    >
                      <Download size={14} />
                      {isEs ? `Descargar ${item.format}` : `Download ${item.format}`}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#003666' }}>{isEs ? 'Reglas de uso del logotipo:' : 'Logo usage rules:'}</strong>{' '}
              {isEs
                ? 'Usar siempre formato SVG en web, documentos vectoriales e imprenta. Mantener un área de respeto mínima equivalente a la altura de la "A" del isotipo alrededor de la marca. No alterar los colores (#003666 + #00BCD4), no distorsionar proporciones y no aplicar sombras difusas sobre la tipografía.'
                : 'Always use SVG for web, decks, and print. Maintain a minimum clear space equal to the height of the "A" isotype around the mark. Never alter brand colors (#003666 + #00BCD4), stretch proportions, or add drop shadows to the wordmark.'}
            </div>
          </section>

          {/* SECTION 2: COLOR SYSTEM */}
          <section className="atlas-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={18} color="#003666" />
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                  {isEs ? '2. Paleta de Colores (Haz clic para copiar HEX)' : '2. Color Palette (Click any swatch to copy HEX)'}
                </h2>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>SSOT · design-tokens.css</span>
            </div>

            <div className="bb-grid-5">
              {PRIMARY_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => handleCopy(swatch.hex, swatch.hex, swatch.nameEn)}
                  style={{
                    textAlign: 'left',
                    padding: 0,
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      height: '78px',
                      backgroundColor: swatch.hex,
                      padding: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      color: swatch.darkText ? '#0f172a' : '#ffffff',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--atlas-font-mono)', fontSize: '0.82rem', fontWeight: 700 }}>
                      {swatch.hex}
                    </span>
                    {copiedKey === swatch.hex ? <Check size={15} /> : <Copy size={14} style={{ opacity: 0.8 }} />}
                  </div>
                  <div style={{ padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                      {isEs ? swatch.nameEs : swatch.nameEn}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.35 }}>
                      {isEs ? swatch.roleEs : swatch.roleEn}
                    </span>
                    <span style={{ fontSize: '0.67rem', color: '#475569', fontFamily: 'var(--atlas-font-mono)', marginTop: '4px' }}>
                      RGB({swatch.rgb})
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#1A73E8', fontFamily: 'var(--atlas-font-mono)' }}>
                      var({swatch.token})
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.1rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Escala Neutra y Superficies' : 'Neutral & Surface Scale'}
              </div>
              <div className="bb-grid-7">
                {NEUTRAL_SWATCHES.map((n) => (
                  <button
                    key={n.hex}
                    type="button"
                    onClick={() => handleCopy(n.hex, n.hex, n.name)}
                    style={{
                      textAlign: 'left',
                      padding: 0,
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ height: '38px', background: n.hex, borderBottom: '1px solid #e2e8f0' }} />
                    <div style={{ padding: '6px 8px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a' }}>{n.name}</div>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'var(--atlas-font-mono)', color: '#64748b' }}>{n.hex}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: TYPOGRAPHY */}
          <section className="atlas-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={18} color="#003666" />
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                  {isEs ? '3. Tipografía Oficial' : '3. Official Typography'}
                </h2>
              </div>
              <div className="bb-no-print" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href="https://fonts.google.com/specimen/Inter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gcp-btn-secondary"
                  style={{ minHeight: '30px', padding: '0 10px', fontSize: '0.74rem', textDecoration: 'none' }}
                >
                  Inter (Google Fonts) <ExternalLink size={12} />
                </a>
                <a
                  href="https://fonts.google.com/specimen/JetBrains+Mono"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gcp-btn-secondary"
                  style={{ minHeight: '30px', padding: '0 10px', fontSize: '0.74rem', textDecoration: 'none' }}
                >
                  JetBrains Mono <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="bb-grid-2">
              <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#1A73E8', letterSpacing: '0.06em' }}>
                  {isEs ? 'Tipografía Primaria · Inter' : 'Primary Sans-Serif · Inter'}
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.025em', margin: '0.35rem 0' }}>
                  Aa Bb Cc 123
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Heading 800 — Precision Peptide & Clinical Intelligence
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                    Subheading 600 — Institutional EU GMP & cGMP Formularies
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 400, color: '#475569', lineHeight: 1.5 }}>
                    Body 400 — Standardized clinical protocols, analytical purity verification, and direct supply schedules for licensed clinics.
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#0D9488', letterSpacing: '0.06em' }}>
                  {isEs ? 'Tipografía Técnica · JetBrains Mono' : 'Technical Monospace · JetBrains Mono'}
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--atlas-font-mono)', margin: '0.45rem 0' }}>
                  AS-MED-BP02-2611
                </div>
                <p style={{ margin: '0.5rem 0 0.75rem 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                  {isEs
                    ? 'Reservada para códigos SKU, lotes de fabricación, números CAS, tarifas numéricas tabulares (tabular-nums) e IDs copiables.'
                    : 'Reserved for SKU codes, batch/lot numbers, CAS registries, tabular pricing figures (tabular-nums), and copyable technical IDs.'}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <CopyableId value="AS-MED-BP02-2611" />
                  <CopyableId value="CAS 137525-51-0" />
                  <CopyableId value="RX-2026-0148" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: GOOGLE CLOUD UX COMPONENTS & BRAND ARCHITECTURE */}
          <section className="atlas-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <Layers size={18} color="#003666" />
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                {isEs ? '4. Sistema de Interfaz (Google Cloud UX) y Arquitectura de Marca' : '4. UI Component Standards (Google Cloud UX) & Brand Architecture'}
              </h2>
            </div>

            <div className="bb-grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                    {isEs ? 'Botones Monocromáticos (Reglas #40 y #57)' : 'Monochrome Buttons (Rules #40 & #57)'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button type="button" className="gcp-btn-primary" style={{ minHeight: '36px' }}>
                      {isEs ? 'Acción Primaria (1 por vista)' : 'Primary CTA (1 per view)'}
                    </button>
                    <button type="button" className="gcp-btn-secondary" style={{ minHeight: '36px' }}>
                      {isEs ? 'Acción Secundaria' : 'Secondary Action'}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                    {isEs ? 'Taxonomía Semántica de Estados (Regla #8)' : 'Semantic Status Badges (Rule #8)'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusBadge status="active" />
                    <StatusBadge status="pending" />
                    <StatusBadge status="po_created" customLabel="Synced / PO" />
                    <StatusBadge status="rejected" />
                    <StatusBadge status="archived" />
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', marginBottom: '0.4rem' }}>
                  {isEs ? 'Arquitectura de Marca y Co-Branding' : 'Brand Architecture & Co-Branding'}
                </div>
                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                  {isEs
                    ? 'Atlas Health Services es la plataforma institucional de inteligencia clínica, protocolos y suministro B2B (atlashealth-services.com). Cuando se colabora con marcas comerciales o socios clínicos (ej. Mediluxe), Atlas actúa como sello técnico y de trazabilidad bajo la convención:'
                    : 'Atlas Health Services is the institutional clinical intelligence, protocol, and B2B supply platform (atlashealth-services.com). When collaborating with commercial or clinical partner brands (e.g., Mediluxe), Atlas serves as the technical & traceability standard under the lockup:'}
                </p>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--atlas-font-mono)', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #dadce0' }}>
                  [Partner Brand] × Atlas Health Services
                </div>
                <div style={{ marginTop: '0.6rem', fontSize: '0.74rem', color: '#64748b' }}>
                  {isEs ? 'Contacto institucional:' : 'Institutional contact:'}{' '}
                  <strong style={{ color: '#003666' }}>{BRAND_CONFIG.supportEmail}</strong> · {BRAND_CONFIG.domain}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: INTERACTIVE EMAIL SIGNATURE GENERATOR */}
          <section className="atlas-card bb-no-print" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#003666" />
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                  {isEs ? '5. Generador de Firma de Email Institucional' : '5. Institutional Email Signature Generator'}
                </h2>
              </div>
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={handleCopySignatureHtml}
                style={{ minHeight: '34px', padding: '0 14px', fontSize: '0.78rem', backgroundColor: '#003666' }}
              >
                {copiedKey === 'email-sig' ? <Check size={14} /> : <Copy size={14} />}
                {isEs ? 'Copiar Firma para Gmail / Outlook' : 'Copy Signature for Gmail / Outlook'}
              </button>
            </div>

            <div className="bb-grid-2">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                <input
                  type="text"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  placeholder={isEs ? 'Nombre completo' : 'Full Name'}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '0.84rem' }}
                />
                <input
                  type="text"
                  value={sigRole}
                  onChange={(e) => setSigRole(e.target.value)}
                  placeholder={isEs ? 'Cargo / Departamento' : 'Role / Title'}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '0.84rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <input
                    type="email"
                    value={sigEmail}
                    onChange={(e) => setSigEmail(e.target.value)}
                    placeholder="info@atlashealth-services.com"
                    style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '0.84rem' }}
                  />
                  <input
                    type="text"
                    value={sigPhone}
                    onChange={(e) => setSigPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px dashed #cbd5e1',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: buildEmailSignatureHtml() }}
              />
            </div>
          </section>
        </div>
      </main>

      <div className="bb-no-print">
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}
