"use client";

/**
 * PublicProductPage — /p/[slug]
 *
 * Reutiliza ProductTemplate (el mismo componente de la tienda B2C) pero:
 *  1. Pasa null a todos los props comerciales (onAddToCart, cart, isProfessional)
 *  2. Inyecta un bloque <style> que oculta precio, supplier, AddToCart y secciones
 *     comerciales tanto en pantalla como en @media print
 *  3. El botón "Download Datasheet" llama window.print() — sin API externa
 *  4. Registra automáticamente el scan del QR en /api/analytics/qr-scan
 *  5. Ofrece selector multi-idioma (EN, ES, FR, DE, PT)
 */

import React, { useEffect, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { SUPPORTED_LANGUAGES, getTranslations, getLocalizedField } from '../../../utils/productTranslations';
import RelatedProductsCarousel from '../../../components/shared/RelatedProductsCarousel';
import { trackProductView } from '../../../services/algoliaInsights';

function PublicLoadingSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 32, background: '#e2e8f0', borderRadius: 8, width: '40%', marginBottom: '1rem' }} />
      <div style={{ height: 56, background: '#e2e8f0', borderRadius: 8, width: '70%', marginBottom: '1.5rem' }} />
      <div style={{ height: 20, background: '#f1f5f9', borderRadius: 6, marginBottom: '0.6rem' }} />
      <div style={{ height: 20, background: '#f1f5f9', borderRadius: 6, width: '90%', marginBottom: '0.6rem' }} />
      <div style={{ height: 20, background: '#f1f5f9', borderRadius: 6, width: '80%' }} />
    </div>
  );
}

// ProductTemplate requiere contextos de carrito y auth — los cargamos lazy
// para que no rompan en rutas públicas sin sesión
const ProductTemplate = dynamic(
  () => import('../../../templates/ProductTemplate'),
  { ssr: false, loading: () => <PublicLoadingSkeleton /> }
);

// ─── CSS público + print ──────────────────────────────────────────────────────
const PUBLIC_STYLES = `
  /* ── Ocultar cabecera de navegación principal ── */
  header.site-header,
  nav.site-nav,
  .cart-icon-wrapper,
  .cart-drawer,
  .auth-buttons,
  .region-bar,
  .guest-mode-banner,
  .price-transparency-section,
  .compare-tray,
  [class*="CompareBar"],
  [class*="GuestMode"],
  [class*="RegionBar"],
  [class*="PriceTransparency"] {
    display: none !important;
  }

  /* ── Ocultar bloque de precio y carrito (por className/id del PeptideDetail) ── */
  #formats,
  .pd-price-card-desktop,
  .pd-supplier-section,
  .pd-supplier-toggle,
  .pd-mobile-order-2:has(#formats),
  [class*="pd-price"] {
    display: none !important;
  }

  /* ── Ocultar botón AddToCart y volumen selectors ── */
  button[class*="add-to-cart"],
  button:has(.lucide-shopping-cart),
  button:has(.lucide-plus):not([data-public-keep]) {
    display: none !important;
  }

  /* ── Banner público fijo arriba ── */
  .public-product-banner {
    position: sticky;
    top: 0;
    z-index: 500;
    background: #003666;
    color: white;
    padding: 0.6rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.82rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }
  .public-product-banner strong { font-weight: 800; font-size: 0.95rem; letter-spacing: -0.01em; }
  .public-product-banner .pbb-badge {
    background: rgba(255,255,255,0.15);
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .public-product-banner .pbb-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }
  .public-product-banner button {
    border: 1.5px solid rgba(255,255,255,0.4);
    background: transparent;
    color: white;
    padding: 0.35rem 0.9rem;
    border-radius: 7px;
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .public-product-banner button:hover { background: rgba(255,255,255,0.15); }
  .public-product-banner button.pbb-wa {
    background: #25d366;
    border-color: #25d366;
    font-weight: 700;
  }
  .public-product-banner button.pbb-wa:hover { background: #1da354; border-color: #1da354; }

  .lang-select-pill {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    cursor: pointer;
    outline: none;
  }
  .lang-select-pill option {
    background: #003666;
    color: white;
  }

  /* ── Floating bottom action bar ── */
  .public-bottom-bar {
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
    font-family: system-ui, -apple-system, sans-serif;
  }
  .public-bottom-bar button {
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
  .public-bottom-bar button:hover { transform: translateY(-1px); }
  .public-bottom-bar .pbb-whatsapp {
    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
    color: white;
    box-shadow: 0 3px 10px rgba(37,211,102,0.35);
  }
  .public-bottom-bar .pbb-print {
    background: white;
    color: #334155;
    border: 1.5px solid #cbd5e1 !important;
  }
  .public-bottom-bar .pbb-copy {
    background: #eff6ff;
    color: #2563eb;
    border: 1.5px solid #bfdbfe !important;
  }

  /* ── Padding para no quedar bajo el bottom bar ── */
  [data-public-mode] .container { padding-bottom: 5rem !important; }

  /* ── @media print: hoja de impresión limpia ── */
  @media print {
    .public-product-banner,
    .public-bottom-bar,
    header, nav, footer,
    .cart-icon-wrapper, .cart-drawer,
    .auth-buttons, .region-bar,
    .guest-mode-banner, .price-transparency-section,
    .compare-tray, .pd-related-section,
    #formats, .pd-price-card-desktop,
    .pd-supplier-section, .pd-supplier-toggle,
    [class*="pd-price"], [class*="RegionBar"],
    [class*="GuestMode"], [class*="PriceTransparency"],
    button, [role="button"] {
      display: none !important;
    }

    body, [data-public-mode] { background: white !important; }
    .container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }

    [data-public-mode]::before {
      content: "Atlas Health — Clinical Product Information Sheet — For Authorized Medical & Research Use Only";
      display: block;
      font-family: system-ui, sans-serif;
      font-size: 9pt;
      font-weight: 600;
      color: #003666;
      border-bottom: 1.5pt solid #003666;
      padding-bottom: 6pt;
      margin-bottom: 16pt;
      letter-spacing: 0.03em;
    }
    [data-public-mode]::after {
      content: "This document is for informational purposes only. No pricing or commercial sourcing data is contained herein.";
      display: block;
      font-family: system-ui, sans-serif;
      font-size: 7.5pt;
      color: #64748b;
      border-top: 0.5pt solid #e2e8f0;
      margin-top: 20pt;
      padding-top: 6pt;
    }

    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 1.5cm; }
  }
`;

function WaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function PublicProductPage({ product, slug, baseUrl }) {
  // Lazy initializer: detect browser language at mount time (no effect needed)
  const [lang, setLang] = useState(() => {
    if (typeof navigator === 'undefined') return 'en';
    const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
    return (browserLang && SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) ? browserLang : 'en';
  });
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const publicUrl = `${baseUrl}/p/${slug}`;
  const t = getTranslations(lang);
  const name = product?.name || product?.displayName || slug || '';
  const description = (getLocalizedField(product, 'description', lang) || product?.desc || product?.description || product?.objective || '').substring(0, 200);

  // Register QR Scan Analytics and set DOM attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-public-page', 'true');

    // QR Analytics Beacon / Fetch (Feature 2)
    try {
      const payload = JSON.stringify({
        productId: product?.id,
        slug,
        source: 'qr_web_scan',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/qr-scan', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/qr-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
      // Algolia Insights Product View
      if (product?.objectID || product?.id || slug) {
        trackProductView({
          indexName: 'products',
          objectID: product?.objectID || product?.id || slug,
        });
      }
    } catch {
      // Non-blocking analytics
    }

    return () => document.documentElement.removeAttribute('data-public-page');
  }, [product?.id, slug]);

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `*${name}* — ${t.whatsappText}\n\n${description}${description.length >= 200 ? '…' : ''}\n\n${t.scannedForGuide}:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PUBLIC_STYLES }} />

      {/* ── Top brand banner ── */}
      <div className="public-product-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong>{t.brandName}</strong>
          <span className="pbb-badge">{t.datasheetBadge}</span>
        </div>

        <div className="pbb-actions">
          {/* Language Selector */}
          <select 
            className="lang-select-pill"
            value={lang} 
            onChange={(e) => startTransition(() => setLang(e.target.value))}
            title="Select Language"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>

          <button onClick={handleCopyUrl} title={t.copyLink}>
            {copied ? `✓ ${t.copied}` : `🔗 ${t.copyLink}`}
          </button>
          <button onClick={handlePrint} title={t.printPdf}>
            🖨 {t.printPdf}
          </button>
          <button className="pbb-wa" onClick={handleWhatsApp}>
            <WaIcon /> {t.shareWhatsapp}
          </button>
        </div>
      </div>

      {/* ── Producto — mismo componente B2C, sin props comerciales ── */}
      <div data-public-mode="true">
        <ProductTemplate
          slug={slug}
          initialProduct={product}
          processedHierarchy={product?.processedHierarchy}
          region={null}
          isProfessional={false}
          cart={[]}
          onAddToCart={null}
          toggleCompare={null}
          compareList={[]}
          allFaqs={[]}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
          <RelatedProductsCarousel
            productId={product?.id || slug}
            category={product?.categoryId || product?.category}
            goals={product?.goals}
          />
        </div>
      </div>

      {/* ── Floating bottom bar ── */}
      <div className="public-bottom-bar">
        <button className="pbb-whatsapp" onClick={handleWhatsApp}>
          <WaIcon /> {t.shareWhatsapp}
        </button>
        <button className="pbb-print" onClick={handlePrint}>
          🖨 {t.downloadPdf}
        </button>
        <button className="pbb-copy" onClick={handleCopyUrl}>
          {copied ? `✓ ${t.copied}` : `🔗 ${t.copyLink}`}
        </button>
      </div>
    </>
  );
}
