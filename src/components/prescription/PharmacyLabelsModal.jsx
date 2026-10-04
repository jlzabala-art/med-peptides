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
  const [zoomMode, setZoomMode] = useState(false);

  // Sizing Presets & Custom Dimensions
  const [selectedPreset, setSelectedPreset] = useState('75x45');
  const [dimensions, setDimensions] = useState({ widthMm: 75, heightMm: 45 });
  const [customWidth, setCustomWidth] = useState(75);
  const [customHeight, setCustomHeight] = useState(45);

  const svgContainerRef = useRef(null);

  if (!isOpen || !labels || labels.length === 0) return null;

  const currentItem = labels[selectedProductIdx] || labels[0];

  const PRESETS = [
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

  // Dynamic 300 DPI High-Resolution PNG Generator from SVG
  const handleDownloadPng = async () => {
    try {
      setIsGeneratingPng(true);
      const svgElement = svgContainerRef.current?.querySelector('svg');
      if (!svgElement) {
        setIsGeneratingPng(false);
        return;
      }

      // 300 DPI: 1 inch = 25.4 mm. Pixels = (mm / 25.4) * 300
      const dpi = 300;
      const widthPx = Math.round((dimensions.widthMm / 25.4) * dpi);
      const heightPx = Math.round((dimensions.heightMm / 25.4) * dpi);

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
        downloadLink.download = `Pharmapolis_${cleanName}_${dimensions.widthMm}x${dimensions.heightMm}mm_${activeVariant}_300DPI.png`;
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '960px',
        width: '100%',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
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
                <span style={{
                  background: '#f1f3f4',
                  color: '#3c4043',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {dimensions.widthMm} × {dimensions.heightMm} mm
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#5f6368' }}>
                {isEs 
                  ? 'Pharmapolis Compounding Pharmacy · Renderizado vectorial SVG & Exportador 300 DPI a medida' 
                  : 'Pharmapolis Compounding Pharmacy · Vector SVG Engine & Custom 300 DPI PNG Exporter'}
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

        {/* Product / Phase Selector Tabs (if multi-product) */}
        {labels.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 20px',
            borderBottom: '1px solid #dadce0',
            background: '#fafafa',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            {labels.map((lbl, idx) => {
              const isSelected = idx === selectedProductIdx;
              return (
                <button
                  key={lbl.id || idx}
                  type="button"
                  onClick={() => setSelectedProductIdx(idx)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: isSelected ? '1px solid #1a73e8' : '1px solid #dadce0',
                    background: isSelected ? '#e8f0fe' : '#ffffff',
                    color: isSelected ? '#1a73e8' : '#3c4043',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: isSelected ? '#1a73e8' : '#e8eaed',
                    color: isSelected ? '#ffffff' : '#5f6368',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {lbl.phaseNumber || idx + 1}
                  </span>
                  <span>{lbl.productName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Controls Bar: Variant Switcher + Preset Sizing */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
            maxWidth: '760px'
          }}>
            {/* GCP Segmented Variant Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              background: '#f1f3f4',
              padding: '3px',
              borderRadius: '6px',
              gap: '3px',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={() => setActiveVariant('backQr')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: activeVariant === 'backQr' ? '1px solid #dadce0' : '1px solid transparent',
                  background: activeVariant === 'backQr' ? '#ffffff' : 'transparent',
                  color: activeVariant === 'backQr' ? '#1a73e8' : '#5f6368',
                  boxShadow: activeVariant === 'backQr' ? '0 1px 2px rgba(60,64,67,0.3)' : 'none',
                  fontSize: '0.80rem',
                  fontWeight: activeVariant === 'backQr' ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <span>{isEs ? 'Reverso con QR' : 'Back Label with QR'}</span>
                <span style={{
                  background: '#e6f4ea',
                  color: '#137333',
                  fontSize: '0.64rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 700,
                  border: '1px solid #ceead6'
                }}>Scan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveVariant('front')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: activeVariant === 'front' ? '1px solid #dadce0' : '1px solid transparent',
                  background: activeVariant === 'front' ? '#ffffff' : 'transparent',
                  color: activeVariant === 'front' ? '#1a73e8' : '#5f6368',
                  boxShadow: activeVariant === 'front' ? '0 1px 2px rgba(60,64,67,0.3)' : 'none',
                  fontSize: '0.80rem',
                  fontWeight: activeVariant === 'front' ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
              >
                {isEs ? 'Frontal Estándar' : 'Front Label'}
              </button>

              <button
                type="button"
                onClick={() => setActiveVariant('frontWithQr')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: activeVariant === 'frontWithQr' ? '1px solid #dadce0' : '1px solid transparent',
                  background: activeVariant === 'frontWithQr' ? '#ffffff' : 'transparent',
                  color: activeVariant === 'frontWithQr' ? '#1a73e8' : '#5f6368',
                  boxShadow: activeVariant === 'frontWithQr' ? '0 1px 2px rgba(60,64,67,0.3)' : 'none',
                  fontSize: '0.80rem',
                  fontWeight: activeVariant === 'frontWithQr' ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
              >
                {isEs ? 'Frontal con Micro-QR' : 'Front with Micro-QR'}
              </button>
            </div>

            {/* Label Dimensions Bar (Presets & Custom mm) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginRight: '4px' }}>
                  {isEs ? 'Formato / Medida:' : 'Label Size:'}
                </span>
                {PRESETS.map((p) => {
                  const isAct = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: isAct ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                        background: isAct ? '#e8f0fe' : '#ffffff',
                        color: isAct ? '#1a73e8' : '#334155',
                        fontSize: '0.74rem',
                        fontWeight: isAct ? 600 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{p.label}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.75 }}>({p.sub})</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom mm Inputs (when Custom is selected) */}
              {selectedPreset === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Ancho:</span>
                    <input
                      type="number"
                      min="25"
                      max="250"
                      value={customWidth}
                      onChange={(e) => handleCustomWidthChange(e.target.value)}
                      style={{
                        width: '54px',
                        padding: '2px 6px',
                        fontSize: '0.76rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    />
                    <span>mm</span>
                  </label>
                  <span style={{ color: '#94a3b8' }}>×</span>
                  <label style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Alto:</span>
                    <input
                      type="number"
                      min="20"
                      max="200"
                      value={customHeight}
                      onChange={(e) => handleCustomHeightChange(e.target.value)}
                      style={{
                        width: '54px',
                        padding: '2px 6px',
                        fontSize: '0.76rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    />
                    <span>mm</span>
                  </label>
                </div>
              )}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Vista Previa en Vivo (Vectorial 300 DPI)' : 'Live Preview (Vector SVG 300 DPI)'}
              </span>
              <button
                type="button"
                onClick={() => setZoomMode(!zoomMode)}
                style={{
                  background: zoomMode ? '#e8f0fe' : '#ffffff',
                  color: zoomMode ? '#1a73e8' : '#5f6368',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s'
                }}
              >
                <Maximize2 size={12} />
                <span>{zoomMode ? (isEs ? 'Ajustar a Pantalla' : 'Fit to Window') : (isEs ? 'Zoom 100% (Detalle)' : 'Zoom 100% (Detail)')}</span>
              </button>
            </div>

            <div
              ref={svgContainerRef}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                boxShadow: '0 2px 6px rgba(60,64,67,0.15), 0 8px 16px rgba(60,64,67,0.08)',
                overflow: 'auto',
                background: '#ffffff',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: zoomMode ? '16px' : '0'
              }}
            >
              <div style={{
                width: zoomMode ? '820px' : '100%',
                minWidth: zoomMode ? '820px' : 'unset',
                aspectRatio: `${dimensions.widthMm} / ${dimensions.heightMm}`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PharmapolisLabelSvg
                  labelData={currentItem}
                  variant={activeVariant}
                  widthMm={dimensions.widthMm}
                  heightMm={dimensions.heightMm}
                />
              </div>
            </div>
          </div>

          {/* QR Destination Badge & Diagnostic Info */}
          <div style={{
            width: '100%',
            maxWidth: '760px',
            background: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#475569',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontWeight: 600, color: '#003666', whiteSpace: 'nowrap' }}>
                {isEs ? 'Destino Verificado QR:' : 'Verified QR Target:'}
              </span>
              <code style={{
                background: '#ffffff',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: '460px'
              }}>
                {currentItem.targetRxUrl || `https://med-peptides.com/rx/${currentItem.fileNumber || '51857'}`}
              </code>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentItem.targetRxUrl && (
                <a
                  href={currentItem.targetRxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{isEs ? 'Probar Enlace ↗' : 'Test Link ↗'}</span>
                </a>
              )}
            </div>
          </div>

          {/* GCP Bottom Specs & Action Bar */}
          <div style={{
            width: '100%',
            maxWidth: '760px',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #dadce0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#202124' }}>
                {currentItem.productName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentItem.dosageForm || 'Topical Solution'}</span>
                <span>•</span>
                <span>{currentItem.volume || '100 mL'}</span>
                <span>•</span>
                <span>{dimensions.widthMm} × {dimensions.heightMm} mm (Vector SVG · 300 DPI)</span>
              </div>
            </div>

            {/* Action Buttons Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isGeneratingPng ? 'wait' : 'pointer',
                  border: '1px solid #1a73e8',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                  transition: 'background 0.15s',
                  opacity: isGeneratingPng ? 0.7 : 1
                }}
                onMouseEnter={(e) => { if (!isGeneratingPng) e.currentTarget.style.background = '#1557b0'; }}
                onMouseLeave={(e) => { if (!isGeneratingPng) e.currentTarget.style.background = '#1a73e8'; }}
              >
                <Download size={15} />
                <span>
                  {isGeneratingPng 
                    ? (isEs ? 'Generando 300 DPI...' : 'Rendering 300 DPI...') 
                    : (isEs ? `Descargar PNG (${dimensions.widthMm}×${dimensions.heightMm}mm)` : `Download PNG (${dimensions.widthMm}×${dimensions.heightMm}mm)`)}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#1a73e8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafd'; e.currentTarget.style.borderColor = '#1a73e8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#dadce0'; }}
              >
                <Printer size={15} />
                <span>{isEs ? 'Imprimir Etiqueta' : 'Print Label'}</span>
              </button>

              {currentItem.targetRxUrl && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    color: copiedLink ? '#137333' : '#5f6368',
                    fontSize: '0.80rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title={currentItem.targetRxUrl}
                >
                  {copiedLink ? <Check size={14} color="#137333" /> : <ExternalLink size={14} />}
                  <span>{copiedLink ? (isEs ? 'URL Copiada ✓' : 'Link Copied ✓') : (isEs ? 'Copiar URL QR' : 'Copy QR Link')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
