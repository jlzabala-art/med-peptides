'use client';

import React, { useState, useRef } from 'react';
import { X, Download, Printer, QrCode, ExternalLink, Check, Maximize2 } from '@/lib/icons';
import PharmapolisLabelSvg from './PharmapolisLabelSvg';

export default function PharmacyLabelsModal({
  isOpen,
  onClose,
  labels = [],
  initialLabelIndex = 0,
  isEs = false
}) {
  const [selectedProductIdx, setSelectedProductIdx] = useState(initialLabelIndex || 0);
  const [activeVariant, setActiveVariant] = useState('backQr'); // 'front' | 'backQr' | 'frontWithQr'
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [dpi, setDpi] = useState(300); // 300 | 600 | 1200
  const [showCutGuides, setShowCutGuides] = useState(false); // Scissor cut lines & crop marks toggle (default false for clean label)
  const [zoomLevel, setZoomLevel] = useState('fit'); // 'fit' | 1 | 1.5 | 2

  // Sync selected index when opened or changed from outside
  React.useEffect(() => {
    if (initialLabelIndex != null && initialLabelIndex >= 0 && labels && initialLabelIndex < labels.length) {
      setSelectedProductIdx(initialLabelIndex);
    }
  }, [initialLabelIndex, labels]);

  // Sizing Presets & Custom Dimensions
  const [selectedPreset, setSelectedPreset] = useState('75x45');
  const [dimensions, setDimensions] = useState({ widthMm: 75, heightMm: 45 });
  const [customWidth, setCustomWidth] = useState(75);
  const [customHeight, setCustomHeight] = useState(45);

  const svgContainerRef = useRef(null);

  if (!isOpen || !labels || labels.length === 0) return null;

  const currentItem = labels[selectedProductIdx] || labels[0];

  // Calculated pixel dimensions at current DPI: (mm / 25.4) * DPI
  const exportWidthPx = Math.round((dimensions.widthMm / 25.4) * dpi);
  const exportHeightPx = Math.round((dimensions.heightMm / 25.4) * dpi);

  const PRESETS = [
    { id: '100x55', label: '100 × 55 mm', sub: isEs ? 'Bote Cilíndrico 100ml' : 'Compounding Bottle 100ml', w: 100, h: 55 },
    { id: '70x35_pomade', label: '70 × 35 mm', sub: isEs ? 'Tarro Pomada 30g' : 'Topical Pomade Jar 30g', w: 70, h: 35 },
    { id: '75x45', label: '75 × 45 mm', sub: isEs ? 'Estándar' : 'Standard', w: 75, h: 45 },
    { id: '90x38', label: '90 × 38 mm', sub: isEs ? 'Térmica' : 'Thermal', w: 90, h: 38 },
    { id: '100x50', label: '100 × 50 mm', sub: isEs ? 'Caja' : 'Box', w: 100, h: 50 },
    { id: '50x30', label: '50 × 30 mm', sub: isEs ? 'Mini Vial' : 'Mini Vial', w: 50, h: 30 },
    { id: 'custom', label: isEs ? 'Medida Libre' : 'Custom Size', sub: 'mm', w: null, h: null }
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      setDimensions({ widthMm: preset.w, heightMm: preset.h });
      setCustomWidth(preset.w);
      setCustomHeight(preset.h);
    }
  };

  const handleCustomWidthChange = (val) => {
    const num = Math.max(25, Math.min(250, Number(val) || 25));
    setCustomWidth(num);
    setDimensions(prev => ({ ...prev, widthMm: num }));
  };

  const handleCustomHeightChange = (val) => {
    const num = Math.max(20, Math.min(200, Number(val) || 20));
    setCustomHeight(num);
    setDimensions(prev => ({ ...prev, heightMm: num }));
  };

  // Dynamic High-Resolution PNG Generator from SVG with user-selected DPI (300 / 600 / 1200)
  const handleDownloadPng = async () => {
    try {
      setIsGeneratingPng(true);
      const svgElement = svgContainerRef.current?.querySelector('svg');
      if (!svgElement) {
        setIsGeneratingPng(false);
        return;
      }

      const widthPx = exportWidthPx;
      const heightPx = exportHeightPx;

      const clonedSvg = svgElement.cloneNode(true);
      clonedSvg.setAttribute('width', `${widthPx}px`);
      clonedSvg.setAttribute('height', `${heightPx}px`);

      const svgXml = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        URL.revokeObjectURL(svgUrl);

        const pngDataUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl;
        const cleanName = (currentItem.productName || 'Label').replace(/[^a-zA-Z0-9]/g, '_');
        downloadLink.download = `Pharmapolis_${cleanName}_${dimensions.widthMm}x${dimensions.heightMm}mm_${activeVariant}_${dpi}DPI.png`;
        downloadLink.click();
        setIsGeneratingPng(false);
      };
      img.onerror = () => {
        setIsGeneratingPng(false);
      };
      img.src = svgUrl;
    } catch (err) {
      console.error('Error generating PNG:', err);
      setIsGeneratingPng(false);
    }
  };

  // High-Precision Vector Print Engine
  const handlePrint = () => {
    const svgElement = svgContainerRef.current?.querySelector('svg');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentItem.productName || 'Pharmapolis Label'} - ${dimensions.widthMm}x${dimensions.heightMm}mm</title>
          <style>
            @page {
              size: ${dimensions.widthMm}mm ${dimensions.heightMm}mm;
              margin: 0;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              width: ${dimensions.widthMm}mm;
              height: ${dimensions.heightMm}mm;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
              overflow: hidden;
            }
            svg {
              width: ${dimensions.widthMm}mm !important;
              height: ${dimensions.heightMm}mm !important;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyLink = () => {
    if (currentItem.targetRxUrl) {
      navigator.clipboard.writeText(currentItem.targetRxUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="gcp-labels-backdrop">
      <style>{`
        .gcp-labels-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .gcp-labels-dialog {
          background: #ffffff;
          border-radius: 12px;
          max-width: 920px;
          width: 100%;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 48px -10px rgba(60, 64, 67, 0.28), 0 4px 12px rgba(60, 64, 67, 0.15);
          overflow: hidden;
          border: 1px solid #dadce0;
          position: relative;
        }
        .gcp-labels-header {
          padding: 12px 18px;
          border-bottom: 1px solid #dadce0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          flex-shrink: 0;
        }
        .gcp-labels-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          -webkit-overflow-scrolling: touch;
        }
        .gcp-labels-sticky-footer {
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #dadce0;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          z-index: 20;
          box-shadow: 0 -2px 6px rgba(60, 64, 67, 0.05);
        }
        .gcp-footer-desktop-specs {
          display: block;
        }
        .gcp-footer-mobile-specs {
          display: none;
        }
        .gcp-footer-actions-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gcp-footer-secondary-grid {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gcp-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 36px;
          padding: 0 16px;
          border-radius: 4px;
          background: #1a73e8;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #1a73e8;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3);
          transition: background 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .gcp-btn-primary:hover:not(:disabled) {
          background: #1557b0;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.4);
        }
        .gcp-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #1a73e8;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .gcp-btn-secondary:hover {
          background: #f8fafd;
          border-color: #1a73e8;
        }
        .gcp-btn-copy {
          color: #3c4043;
          font-weight: 500;
        }
        .gcp-btn-copy:hover {
          color: #202124;
        }

        /* ── Responsive Mobile Rules (Google Cloud Mobile UX Standards) ── */
        @media (max-width: 640px) {
          .gcp-labels-backdrop {
            padding: 0;
            align-items: flex-end;
          }
          .gcp-labels-dialog {
            max-height: 100dvh;
            height: 100%;
            border-radius: 14px 14px 0 0;
            border: none;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.25);
          }
          .gcp-labels-header {
            padding: 10px 14px;
          }
          .gcp-labels-body {
            padding: 10px 12px 14px 12px;
            gap: 8px;
          }
          .gcp-labels-sticky-footer {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 8px)) 14px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            background: #ffffff;
            border-top: 1px solid #e0e0e0;
            box-shadow: 0 -4px 18px rgba(60, 64, 67, 0.12), 0 -1px 3px rgba(60, 64, 67, 0.08);
          }
          .gcp-footer-desktop-specs {
            display: none;
          }
          .gcp-footer-mobile-specs {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 0.74rem;
            color: #5f6368;
            padding: 0 2px;
          }
          .gcp-footer-actions-wrap {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }
          .gcp-btn-primary {
            width: 100%;
            height: 42px;
            font-size: 0.86rem;
            border-radius: 6px;
          }
          .gcp-footer-secondary-grid {
            display: grid;
            gap: 8px;
            width: 100%;
          }
          .gcp-btn-secondary {
            width: 100%;
            height: 38px;
            font-size: 0.78rem;
            border-radius: 6px;
          }
        }
      `}</style>

      <div className="gcp-labels-dialog">
        {/* Header */}
        <div className="gcp-labels-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '6px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d2e3fc'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#202124' }}>
                  {isEs ? 'Etiquetas Farmacéuticas Vectoriales' : 'Vector Pharmacy Compounding Labels'}
                </h3>
                <span style={{
                  background: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  EU GMP Certified
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#5f6368' }}>
                {isEs 
                  ? 'Pharmapolis Compounding Pharmacy · Renderizado vectorial SVG & Exportador Multi-DPI a medida' 
                  : 'Pharmapolis Compounding Pharmacy · Vector SVG Engine & Multi-DPI PNG Exporter'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.style.color = '#202124'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5f6368'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="gcp-labels-body">
          {/* Google Cloud Compact Controls Toolbar (Dropdown Fields) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            background: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #dadce0',
            width: '100%',
            maxWidth: '760px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              {/* Field 1: Preparation / Phase (if multi-product) */}
              {labels.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label htmlFor="gcp-label-phase" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {isEs ? 'Fase:' : 'Phase:'}
                  </label>
                  <select
                    id="gcp-label-phase"
                    value={selectedProductIdx}
                    onChange={(e) => setSelectedProductIdx(Number(e.target.value))}
                    style={{
                      height: 30,
                      padding: '0 24px 0 8px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#202124',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 6px center',
                      outline: 'none'
                    }}
                  >
                    {labels.map((lbl, idx) => (
                      <option key={lbl.id || idx} value={idx}>
                        Phase {lbl.phaseNumber || idx + 1}: {lbl.productName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field 2: Label Variant (Type) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-variant" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {isEs ? 'Tipo:' : 'Label:'}
                </label>
                <select
                  id="gcp-label-variant"
                  value={activeVariant}
                  onChange={(e) => setActiveVariant(e.target.value)}
                  style={{
                    height: 30,
                    padding: '0 24px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#202124',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
                >
                  <option value="backQr">{isEs ? 'Reverso con QR (Trazabilidad)' : 'Back Label with QR (Traceability)'}</option>
                  <option value="front">{isEs ? 'Frontal Estándar' : 'Front Label (Standard)'}</option>
                  <option value="frontWithQr">{isEs ? 'Frontal con Micro-QR' : 'Front Label with Micro-QR'}</option>
                </select>
              </div>

              {/* Field 3: Label Size / Format */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-size" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {isEs ? 'Medida:' : 'Size:'}
                </label>
                <select
                  id="gcp-label-size"
                  value={selectedPreset}
                  onChange={(e) => {
                    const p = PRESETS.find(x => x.id === e.target.value);
                    if (p) handleSelectPreset(p);
                  }}
                  style={{
                    height: 30,
                    padding: '0 24px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#202124',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.sub})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom mm Inputs if Custom is selected */}
              {selectedPreset === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>W:</span>
                    <input
                      type="number"
                      min="25"
                      max="250"
                      value={customWidth}
                      onChange={(e) => handleCustomWidthChange(e.target.value)}
                      style={{
                        width: '42px',
                        height: 26,
                        padding: '0 3px',
                        fontSize: '0.74rem',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>×</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>H:</span>
                    <input
                      type="number"
                      min="20"
                      max="200"
                      value={customHeight}
                      onChange={(e) => handleCustomHeightChange(e.target.value)}
                      style={{
                        width: '42px',
                        height: 26,
                        padding: '0 3px',
                        fontSize: '0.74rem',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 600 }}>mm</span>
                </div>
              )}

              {/* Field 4: Print Resolution / DPI */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-dpi" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  DPI:
                </label>
                <select
                  id="gcp-label-dpi"
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  style={{
                    height: 30,
                    padding: '0 22px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#202124',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
                >
                  <option value={300}>300 DPI (Standard)</option>
                  <option value={600}>600 DPI (Micro-Print)</option>
                  <option value={1200}>1200 DPI (Ultra HD)</option>
                </select>
              </div>

              {/* Field 5: Cut Guides (✂) Toggle */}
              <button
                type="button"
                onClick={() => setShowCutGuides(prev => !prev)}
                style={{
                  height: 30,
                  padding: '0 10px',
                  borderRadius: '4px',
                  border: showCutGuides ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: showCutGuides ? '#e8f0fe' : '#ffffff',
                  color: showCutGuides ? '#1a73e8' : '#5f6368',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
                title={isEs ? 'Mostrar/Ocultar guías de corte con tijera' : 'Toggle scissor cut lines & crop marks'}
              >
                <span style={{ fontSize: '0.88rem' }}>✂</span>
                <span>{isEs ? 'Guías de Corte' : 'Cut Guides'}</span>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: showCutGuides ? '#1a73e8' : '#dadce0',
                  display: 'inline-block'
                }} />
              </button>
            </div>

            {/* Active Output Pixel Resolution Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.70rem',
              color: '#1a73e8',
              background: '#e8f0fe',
              border: '1px solid #d2e3fc',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              <span>{exportWidthPx} × {exportHeightPx} px</span>
              <span>·</span>
              <span>{dpi} DPI</span>
            </div>
          </div>

          {/* High-Precision Interactive Vector SVG Preview Frame */}
          <div
            style={{
              width: '100%',
              maxWidth: '760px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignSelf: 'stretch',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isEs ? 'Vista Previa en Vivo' : 'Live Preview'}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  Vector SVG · Min 6.5pt Print Legible
                </span>
              </div>

              {/* Multi-step Zoom Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginRight: '2px' }}>
                  Zoom:
                </span>
                <div style={{ display: 'inline-flex', background: '#f1f3f4', padding: '2px', borderRadius: '4px', gap: '2px' }}>
                  {[
                    { id: 'fit', label: isEs ? 'Ajustar' : 'Fit' },
                    { id: 1, label: '100%' },
                    { id: 1.5, label: '150%' },
                    { id: 2, label: '200%' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setZoomLevel(opt.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        border: 'none',
                        background: zoomLevel === opt.id ? '#ffffff' : 'transparent',
                        color: zoomLevel === opt.id ? '#1a73e8' : '#5f6368',
                        fontSize: '0.70rem',
                        fontWeight: zoomLevel === opt.id ? 700 : 500,
                        boxShadow: zoomLevel === opt.id ? '0 1px 2px rgba(60,64,67,0.15)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={svgContainerRef}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                boxShadow: '0 2px 6px rgba(60,64,67,0.12), 0 6px 14px rgba(60,64,67,0.06)',
                overflow: 'auto',
                background: '#ffffff',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: zoomLevel === 'fit' ? 'center' : 'flex-start',
                padding: zoomLevel === 'fit' ? '8px' : '20px',
                maxHeight: zoomLevel === 'fit' ? 'clamp(180px, 30vh, 250px)' : '420px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                width: zoomLevel === 'fit' 
                  ? 'auto' 
                  : zoomLevel === 1 
                    ? '380px' 
                    : zoomLevel === 1.5 
                      ? '620px' 
                      : '860px',
                height: zoomLevel === 'fit' ? '100%' : 'auto',
                maxWidth: zoomLevel === 'fit' ? '100%' : 'none',
                maxHeight: zoomLevel === 'fit' ? 'clamp(170px, 28vh, 240px)' : 'none',
                aspectRatio: `${dimensions.widthMm} / ${dimensions.heightMm}`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: zoomLevel === 'fit' ? '0' : '0 auto'
              }}>
                <PharmapolisLabelSvg
                  labelData={currentItem}
                  variant={activeVariant}
                  widthMm={dimensions.widthMm}
                  heightMm={dimensions.heightMm}
                  showCutGuides={showCutGuides}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── GCP Sticky Action Footer / Mobile Dock Sticker ── */}
        <div className="gcp-labels-sticky-footer">
          {/* Desktop Single-Line Specs & Direct Patient Link (No Redundant Titles) */}
          <div className="gcp-footer-desktop-specs" style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#5f6368',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <span style={{ fontWeight: 600, color: '#202124' }}>
                {currentItem.dosageForm || 'Topical Scalp Solution'}
              </span>
              <span style={{ color: '#dadce0' }}>•</span>
              <span>{currentItem.volume || '100 mL'}</span>
              {currentItem.targetRxUrl && (
                <>
                  <span style={{ color: '#dadce0' }}>•</span>
                  <a
                    href={currentItem.targetRxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#1a73e8',
                      textDecoration: 'none',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <span>{isEs ? 'Ver Portal Paciente' : 'Patient View'}</span>
                    <ExternalLink size={12} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Mobile Top Micro-Specs Strip (Visible Only on Mobile) */}
          <div className="gcp-footer-mobile-specs">
            <div style={{ fontWeight: 600, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentItem.dosageForm || 'Topical Solution'}
            </div>
            <div style={{ color: '#5f6368', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
              {currentItem.volume || '100 mL'}
            </div>
          </div>

          {/* Action Buttons Group (Google Cloud UX Hierarchy) */}
          <div className="gcp-footer-actions-wrap">
            {/* Primary Action: Download PNG */}
            <button
              type="button"
              className="gcp-btn-primary"
              onClick={handleDownloadPng}
              disabled={isGeneratingPng}
              style={{
                cursor: isGeneratingPng ? 'wait' : 'pointer',
                opacity: isGeneratingPng ? 0.75 : 1
              }}
            >
              <Download size={16} />
              <span>
                {isGeneratingPng 
                  ? (isEs ? 'Generando 300 DPI...' : 'Rendering 300 DPI...') 
                  : (isEs ? 'Descargar PNG' : 'Download PNG')}
              </span>
            </button>

            {/* Secondary Symmetrical Actions */}
            <div
              className="gcp-footer-secondary-grid"
              style={{
                gridTemplateColumns: currentItem.targetRxUrl ? '1fr 1fr' : '1fr'
              }}
            >
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handlePrint}
              >
                <Printer size={15} />
                <span>{isEs ? 'Imprimir' : 'Print Label'}</span>
              </button>

              {currentItem.targetRxUrl && (
                <button
                  type="button"
                  className="gcp-btn-secondary gcp-btn-copy"
                  onClick={handleCopyLink}
                  style={{
                    color: copiedLink ? '#137333' : '#3c4043',
                    background: copiedLink ? '#e6f4ea' : '#ffffff',
                    borderColor: copiedLink ? '#ceead6' : '#dadce0'
                  }}
                  title={currentItem.targetRxUrl}
                >
                  {copiedLink ? <Check size={14} color="#137333" /> : <ExternalLink size={14} />}
                  <span>{copiedLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy QR Link')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
