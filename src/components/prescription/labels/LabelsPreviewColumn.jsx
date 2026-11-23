'use client';

import React from 'react';
import PharmapolisLabelSvg from '../PharmapolisLabelSvg';

/**
 * LabelsPreviewColumn
 * ─────────────────────────────────────────────────────────────────────────────
 * Left-hand live preview column for Labels Studio. Renders clickable Delivery
 * and Shipping label cards with zoom controls and click-to-edit switching.
 */
export default function LabelsPreviewColumn({
  isEditing = true,
  isEs = false,
  activeVariant = 'backQr',
  hideShippingLabel = false,
  zoomLevel = 'fit',
  setZoomLevel,
  dimensions = { widthMm: 75, heightMm: 45 },
  currentItem = {},
  selectedProductIdx = 0,
  labelsCount = 1,
  colorMode = 'monochrome',
  showCutGuides = false,
  boldPosology = false,
  svgContainerRef,
  legibilityBadge = null,
  onSelectDelivery,
  onSelectShipping,
}) {
  const isDeliveryActive = activeVariant !== 'shipping';
  const deliveryVariant = activeVariant === 'shipping' ? 'backQr' : activeVariant;
  const isShippingActive = activeVariant === 'shipping';

  const previewBoxStyle = {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'auto',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: zoomLevel === 'fit' ? 'center' : 'flex-start',
    padding: zoomLevel === 'fit' ? '8px' : '16px',
    maxHeight: zoomLevel === 'fit' ? 'clamp(170px, 28vh, 240px)' : '400px',
    boxSizing: 'border-box',
  };

  const innerFrameStyle = {
    width: zoomLevel === 'fit'
      ? 'auto'
      : zoomLevel === 1
        ? '380px'
        : zoomLevel === 1.5
          ? '620px'
          : '860px',
    height: zoomLevel === 'fit' ? '100%' : 'auto',
    maxWidth: zoomLevel === 'fit' ? '100%' : 'none',
    maxHeight: zoomLevel === 'fit' ? 'clamp(160px, 26vh, 225px)' : 'none',
    aspectRatio: `${dimensions.widthMm} / ${dimensions.heightMm}`,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: zoomLevel === 'fit' ? '0' : '0 auto',
  };

  const labelPayload = {
    ...currentItem,
    partLabel: currentItem.partLabel || (labelsCount > 1 ? `Part ${(selectedProductIdx || 0) + 1} of ${labelsCount}` : ''),
    partIndex: selectedProductIdx || 0,
    totalParts: labelsCount,
  };

  return (
    <div
      className={isEditing ? 'gcp-split-preview-col' : undefined}
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Vistas Previas (Pulsa para editar)' : 'Live Previews (Click to edit)'}
          </span>
          {legibilityBadge}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.68rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginRight: '2px' }}>
            Zoom:
          </span>
          <div style={{ display: 'inline-flex', background: '#f1f3f4', padding: '2px', borderRadius: '4px', gap: '2px' }}>
            {[
              { id: 'fit', label: isEs ? 'Ajustar' : 'Fit' },
              { id: 1, label: '100%' },
              { id: 1.5, label: '150%' },
              { id: 2, label: '200%' },
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
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card 1: Delivery Label */}
      <div
        role="button"
        tabIndex={0}
        onClick={onSelectDelivery}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectDelivery?.();
          }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          cursor: 'pointer',
          borderRadius: '10px',
          padding: '10px',
          border: isDeliveryActive ? '2px solid #1a73e8' : '1px solid #dadce0',
          background: isDeliveryActive ? '#f8fbff' : '#ffffff',
          boxShadow: isDeliveryActive
            ? '0 4px 14px rgba(26, 115, 232, 0.14)'
            : '0 1px 3px rgba(60, 64, 67, 0.06)',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 750, color: isDeliveryActive ? '#1a73e8' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? '1. Delivery Label (Cliente)' : '1. Delivery Label (Client)'}
          </span>
          <span style={{
            fontSize: '0.66rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            background: isDeliveryActive ? '#1a73e8' : '#f1f5f9',
            color: isDeliveryActive ? '#ffffff' : '#64748b',
          }}>
            {isDeliveryActive ? (isEs ? '✓ Editando' : '✓ Editing') : (isEs ? 'Pulsa para editar' : 'Click to edit')}
          </span>
        </div>
        <div ref={isDeliveryActive ? svgContainerRef : undefined} style={previewBoxStyle}>
          <div style={innerFrameStyle}>
            <PharmapolisLabelSvg
              labelData={labelPayload}
              variant={deliveryVariant}
              widthMm={dimensions.widthMm}
              heightMm={dimensions.heightMm}
              colorMode={colorMode}
              showCutGuides={showCutGuides}
              boldPosology={boldPosology}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Shipping Label */}
      {!hideShippingLabel && (
        <div
          role="button"
          tabIndex={0}
          onClick={onSelectShipping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectShipping?.();
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            borderRadius: '10px',
            padding: '10px',
            border: isShippingActive ? '2px solid #1a73e8' : '1px solid #dadce0',
            background: isShippingActive ? '#f8fbff' : '#ffffff',
            boxShadow: isShippingActive
              ? '0 4px 14px rgba(26, 115, 232, 0.14)'
              : '0 1px 3px rgba(60, 64, 67, 0.06)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 750, color: isShippingActive ? '#1a73e8' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? '2. Shipping Label (Envío / Aduanas)' : '2. Shipping Label (Simple / Customs)'}
            </span>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: isShippingActive ? '#1a73e8' : '#f1f5f9',
              color: isShippingActive ? '#ffffff' : '#64748b',
            }}>
              {isShippingActive ? (isEs ? '✓ Editando' : '✓ Editing') : (isEs ? 'Pulsa para editar' : 'Click to edit')}
            </span>
          </div>
          <div ref={isShippingActive ? svgContainerRef : undefined} style={previewBoxStyle}>
            <div style={innerFrameStyle}>
              <PharmapolisLabelSvg
                labelData={labelPayload}
                variant="shipping"
                widthMm={dimensions.widthMm}
                heightMm={dimensions.heightMm}
                colorMode={colorMode}
                showCutGuides={isShippingActive ? showCutGuides : false}
                boldPosology={boldPosology}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
