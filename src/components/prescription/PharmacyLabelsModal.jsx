'use client';

import React, { useState } from 'react';
import { X, Download, Printer, QrCode, ExternalLink, Eye, Check } from '@/lib/icons';

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

  if (!isOpen || !labels || labels.length === 0) return null;

  const currentItem = labels[selectedProductIdx] || labels[0];

  const getActiveImageUrl = () => {
    if (activeVariant === 'front') return currentItem.frontUrl;
    if (activeVariant === 'frontWithQr') return currentItem.frontWithQrUrl;
    return currentItem.backQrUrl || currentItem.frontUrl;
  };

  const handlePrint = () => {
    const imgUrl = getActiveImageUrl();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentItem.productName} - Label 7.5 x 4.5 cm</title>
          <style>
            @page {
              size: 75mm 45mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 75mm;
              height: 45mm;
              background: #fff;
            }
            img {
              width: 75mm;
              height: 45mm;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${imgUrl}" onload="window.print(); window.close();" />
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
        maxWidth: '920px',
        width: '100%',
        maxHeight: '92vh',
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
              borderRadius: '4px',
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
                  {isEs ? 'Etiquetas Farmacéuticas Oficiales (7.5 × 4.5 cm)' : 'Official Compounding Bottle Labels (7.5 × 4.5 cm)'}
                </h3>
                <span style={{
                  background: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  EU GMP Certified
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#5f6368' }}>
                {isEs 
                  ? 'Pharmapolis Compounding Pharmacy · Troquelado estándar 75 × 45 mm (1500 × 900 px · 300 DPI)' 
                  : 'Pharmapolis Compounding Pharmacy · Standard 75 × 45 mm die-cut (1500 × 900 px · 300 DPI)'}
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
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* GCP Segmented Variant Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            background: '#f1f3f4',
            padding: '3px',
            borderRadius: '6px',
            gap: '3px',
            width: '100%',
            maxWidth: '680px'
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
              }}>7.5×4.5 cm</span>
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

          {/* High-Res Label Image Preview Frame (Exact 7.5 : 4.5 Ratio) */}
          <div style={{
            width: '100%',
            maxWidth: '680px',
            aspectRatio: '7.5 / 4.5',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 3px rgba(60,64,67,0.15), 0 4px 8px rgba(60,64,67,0.08)',
            overflow: 'hidden',
            background: '#ffffff',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={getActiveImageUrl()}
              alt={currentItem.productName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* GCP Bottom Specs & Action Bar */}
          <div style={{
            width: '100%',
            maxWidth: '680px',
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
                <span>75 × 45 mm (300 DPI)</span>
              </div>
            </div>

            {/* GCP Action Buttons Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={getActiveImageUrl()}
                download
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
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: '1px solid #1a73e8',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1557b0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; }}
              >
                <Download size={15} />
                <span>{isEs ? 'Descargar PNG' : 'Download PNG'}</span>
              </a>

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
