'use client';

import React, { useState, useMemo } from 'react';
import { X, Download, FileText } from '@/lib/icons';
import { Maximize2, Minimize2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { buildPelletsPriceSchedulePdfBlob } from '@/lib/pdf/pelletsPriceSchedulePdf';

export default function PelletPricePdfPreviewModal({
  isOpen,
  onClose,
  products = [],
  currency = 'EUR',
  currencySymbol = '€',
  formatPrice,
  lang = 'en',
  isAdmin = false
}) {
  const [pdfLang, setPdfLang] = useState(lang === 'es' ? 'es' : 'en');
  const [prevLang, setPrevLang] = useState(lang);
  const [isFullPreview, setIsFullPreview] = useState(false);

  if (prevLang !== lang) {
    setPrevLang(lang);
    setPdfLang(lang === 'es' ? 'es' : 'en');
  }

  const isEs = pdfLang === 'es';

  const handleDownloadDirectPdf = () => {
    try {
      const blob = buildPelletsPriceSchedulePdfBlob({
        products,
        currency,
        currencySymbol,
        formatPrice,
        isEs,
        documentRef: 'ATLAS-PELLETS-B2B-2026'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isEs
        ? `Atlas_European_Pharmacy_Tarifa_Pellets_${currency}.pdf`
        : `Atlas_European_Pharmacy_Pellets_Schedule_${currency}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(isEs ? 'PDF oficial de pellets descargado con éxito' : 'Official pellets PDF downloaded successfully');
    } catch (err) {
      console.error('[pdf-download]', err);
      toast.error(isEs ? 'Error al generar el PDF de pellets' : 'Error generating pellets PDF');
    }
  };

  const qrTargetUrl = useMemo(() => {
    const base = 'https://www.atlashealth-services.com/pricing/pellets';
    const params = new URLSearchParams();
    if (isEs) params.set('lang', 'es');
    if (currency && currency !== 'EUR') params.set('cur', currency);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [isEs, currency]);

  const groupedSections = useMemo(() => {
    const estrogenItems = products.filter(p => p.hormoneType === 'estrogen' || p.hormoneType === 'biest');
    const androgenItems = products.filter(p => p.hormoneType === 'androgen');
    const progestItems = products.filter(p => p.hormoneType === 'progesterone');
    const synergyItems = products.filter(p => p.hormoneType === 'synergy');
    const trocarItems = products.filter(p => p.category === 'Trocar Kits' || p.hormoneType === 'instrument');

    return [
      { key: 'estrogen', title: isEs ? '17β-Estradiol & Biest 50:50 (Pellets de Estrógenos)' : '17β-Estradiol & Biest 50:50 (Estrogen Pellets)', color: '#003666', items: estrogenItems },
      { key: 'androgen', title: isEs ? 'Testosterona (Pellets Androgénicos TRT / BHRT)' : 'Testosterone (Androgen Pellets TRT / BHRT)', color: '#003666', items: androgenItems },
      { key: 'progesterone', title: isEs ? 'Progesterona Bioidéntica (Pellets de Protección Endometrial)' : 'Bioidentical Progesterone (Endometrial Protection)', color: '#003666', items: progestItems },
      { key: 'synergy', title: isEs ? 'Testosterona + Anastrozol (Pellets Combinados Anti-Aromatasa)' : 'Testosterone + Anastrozole (Aromatase Control Pellets)', color: '#003666', items: synergyItems },
      { key: 'trocar', title: isEs ? 'Kits Quirúrgicos de Trócar Desechable (Instrumental Estéril)' : 'Disposable Surgical Trocar Kits (Sterile Implantation Sets)', color: '#0284c7', items: trocarItems }
    ].filter(g => g.items.length > 0);
  }, [products, isEs]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.84)',
        backdropFilter: 'blur(6px)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 1.5rem 0',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      onClick={onClose}
    >
      {/* Top Floating Control Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          maxWidth: '890px',
          padding: '10px 16px',
          margin: '0 auto 12px auto',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
            {isEs
              ? (isAdmin ? 'Tarifa Oficial B2B · Pellets Pharmapolis' : 'Tarifa Oficial B2B · Pellets Hormonales EU GMP')
              : (isAdmin ? 'Official B2B Price Schedule · Pharmapolis Pellets' : 'Official B2B Price Schedule · EU GMP Pellets')}
          </span>
          <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
            {currency}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Lang Switch */}
          <div style={{ display: 'inline-flex', background: 'rgba(30, 41, 59, 0.8)', padding: '2px', borderRadius: '6px', border: '1px solid #334155' }}>
            <button
              onClick={() => setPdfLang('en')}
              style={{
                background: pdfLang === 'en' ? '#0284c7' : 'transparent',
                color: pdfLang === 'en' ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setPdfLang('es')}
              style={{
                background: pdfLang === 'es' ? '#0284c7' : 'transparent',
                color: pdfLang === 'es' ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ES
            </button>
          </div>

          {/* Expand Full Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsFullPreview((prev) => !prev)}
            style={{
              background: isFullPreview ? '#0d9488' : 'rgba(30, 41, 59, 0.8)',
              color: '#ffffff',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
            title={isEs ? 'Alternar vista completa' : 'Toggle Full Preview'}
          >
            {isFullPreview ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullPreview ? (isEs ? 'Vista Normal' : 'Compact View') : (isEs ? 'Desplegar Todo' : 'Expand Full Preview')}</span>
          </button>

          {/* Download / Save Button */}
          <button
            onClick={handleDownloadDirectPdf}
            className="gcp-btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            <Download size={14} />
            <span>{isEs ? 'Guardar / Descargar PDF' : 'Save / Download PDF'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              padding: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* A4 Sheet Preview Container */}
      <div
        style={{
          width: '100%',
          maxWidth: isFullPreview ? '98vw' : '860px',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          transition: 'max-width 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Header */}
        <div style={{ background: '#003666', borderBottom: '3px solid #0d9488', padding: '16px 20px', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ATLAS HEALTH SERVICES · EUROPEAN PHARMACY (EU GMP)
              </div>
              <h2 style={{ margin: '4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {isEs ? 'Pellets Hormonales Subcutáneos & Kits Trócar · Tarifa Oficial B2B' : 'Subcutaneous Hormone Pellets & Trocar Kits · Official B2B Price Schedule'}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                {isEs
                  ? 'Cilindros Cristalinos Puros Sin Aglutinantes · Esterilización Terminal E-Beam SAL 10⁻⁶ · Farmacia Europea Licenciada (EU GMP)'
                  : 'Pure Binder-Free Crystalline Cylinders · Terminal E-Beam Sterilization SAL 10⁻⁶ · European Union Licensed Compounding Pharmacy'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', minWidth: '165px' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{isEs ? 'TARIFA:' : 'SCHEDULE:'}</div>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#166534' }}>DISTRIBUTOR B2B</div>
              <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '2px' }}>
                REF: <strong>ATLAS-PELLETS-B2B-2026</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Banner & KPIs */}
        <div style={{ padding: '12px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.4 }}>
            <strong>{isEs ? 'CALIDAD ANALÍTICA:' : 'ANALYTICAL RELEASE:'}</strong>{' '}
            {isEs
              ? 'HPLC ≥99.5% · Endotoxinas <0.25 EU/mg · Disolución Continua Orden Cero (3.5–6 Meses).'
              : 'HPLC ≥99.5% · Endotoxins <0.25 EU/mg · Zero-Order Continuous Release (3.5–6 Months).'}
            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
              {isEs ? 'Tarifas Wholesaler (+15% + 15%) con Ahorro Institucional en Pack ×10 (-10%).' : 'Wholesaler Tariffs (+15% + 15%) with Institutional Volume Savings in Pack ×10 (-10%).'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: 700 }}>
              {products.length} {isEs ? 'SKUs OFICIALES' : 'OFFICIAL SKUs'}
            </span>
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              EUROPEAN PHARMACY · EU GMP
            </span>
          </div>
        </div>

        {/* Category Quick-Navigation Summary Strip */}
        <div style={{ padding: '12px 20px 4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
          {groupedSections.map((group) => (
            <a
              key={`idx-${group.key}`}
              href={`#pellet-cat-${group.key}`}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#003666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.title}
              </span>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '1px 6px', borderRadius: '9999px', flexShrink: 0 }}>
                {group.items.length}
              </span>
            </a>
          ))}
        </div>

        {/* Tables */}
        <div style={{ padding: '16px 20px' }}>
          {groupedSections.map((group) => (
            <div key={group.key} id={`pellet-cat-${group.key}`} style={{ marginBottom: '20px' }}>
              <div style={{ background: '#003666', color: '#ffffff', padding: '7px 12px', borderRadius: '6px 6px 0 0', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{group.title}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#bae6fd' }}>{group.items.length} SKUs</span>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 4px 4px', overflowX: 'auto' }}>
                {/* eslint-disable-next-line no-restricted-syntax */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px', width: '30px' }}>#</th>
                      <th style={{ padding: '6px 8px' }}>SKU</th>
                      <th style={{ padding: '6px 8px' }}>{isEs ? 'Molécula / Denominación' : 'Molecule / Item'}</th>
                      <th style={{ padding: '6px 8px' }}>{isEs ? 'Concentración' : 'Strength'}</th>
                      <th style={{ padding: '6px 8px' }}>{isEs ? 'Trócar Req.' : 'Trocar Size'}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>{isEs ? 'Precio Unidad' : 'Unit Price'}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: '#166534' }}>{isEs ? 'Pack ×10 (-10%)' : 'Pack ×10 (-10%)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, idx) => {
                      const unitVal = item.pricing?.wholesalePriceEur ?? item.pricing?.price_eur ?? 50;
                      const pack10Val = item.pricing?.pack10PriceEur ?? (unitVal * 10 * 0.90);

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{idx + 1}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700, color: '#003666' }}>{item.sku}</td>
                          <td style={{ padding: '6px 8px', color: '#0f172a' }}>{item.name}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700 }}>{item.strength}</td>
                          <td style={{ padding: '6px 8px', color: '#64748b' }}>{item.trocarSize || '3.2 mm'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{formatPrice ? formatPrice(unitVal) : `€${unitVal.toFixed(2)}`}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                            {formatPrice ? formatPrice(pack10Val) : `€${pack10Val.toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with QR */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            <div>Atlas Health Services · Commercial & Magistral Division</div>
            <div>{isAdmin ? 'Pharmapolis Compounding Pharmacy EU GMP (Bulgaria)' : 'Atlas Health Services · EU GMP Certified Compounding'} · Zero-Order Dissolution · SAL 10⁻⁶</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QRCodeSVG value={qrTargetUrl} size={42} level="M" />
            <div style={{ fontSize: '0.62rem', color: '#475569', lineHeight: 1.2 }}>
              <div><strong>SCAN TO VERIFY</strong></div>
              <div>atlashealth-services.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
