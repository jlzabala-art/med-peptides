'use client';

import React from 'react';

/**
 * LabelsStepSelector
 * ─────────────────────────────────────────────────────────────────────────────
 * Step 1 guided selector for Labels Studio: explicitly prompts the operator to
 * choose between Delivery Label (Client/Clinic) and Shipping Label (Customs-Safe)
 * right after importing or creating a prescription.
 */
export default function LabelsStepSelector({
  isEs = false,
  fulfillmentMode = 'internal',
  activeVariant = 'backQr',
  hideShippingLabel = false,
  showPrintSettings = false,
  dimensions = { widthMm: 75, heightMm: 45 },
  onSelectDelivery,
  onSelectShipping,
  onToggleSettings,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px 14px',
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#003666',
              color: '#ffffff',
            }}
          >
            {isEs ? 'Paso 1' : 'Step 1'}
          </span>
          <span style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a' }}>
            {isEs
              ? 'Elige qué etiqueta quieres generar para esta prescripción:'
              : 'Choose which label to generate for this prescription:'}
          </span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {fulfillmentMode === 'external_supplier' && (
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#6b21a8',
                background: '#f3e8ff',
                border: '1px solid #d8b4fe',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {isEs ? 'Modo Proveedor Externo (Refill Card)' : 'External Supplier (Refill Card)'}
            </span>
          )}

          {fulfillmentMode !== 'external_supplier' && (
            <button
              type="button"
              onClick={onToggleSettings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                minHeight: '32px',
                borderRadius: '6px',
                border: showPrintSettings ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                background: showPrintSettings ? '#e8f0fe' : '#ffffff',
                color: showPrintSettings ? '#1a73e8' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 650,
                cursor: 'pointer',
              }}
            >
              <span>⚙ {isEs ? 'Ajustes' : 'Settings'}</span>
              <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                ({dimensions.widthMm}×{dimensions.heightMm} mm)
              </span>
            </button>
          )}
        </div>
      </div>

      {fulfillmentMode !== 'external_supplier' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '8px' }}>
          <button
            type="button"
            onClick={onSelectDelivery}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              padding: '9px 12px',
              minHeight: '52px',
              borderRadius: '8px',
              border: activeVariant !== 'shipping' ? '2px solid #1a73e8' : '1px solid #cbd5e1',
              background: activeVariant !== 'shipping' ? '#eff6ff' : '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeVariant !== 'shipping' ? '#1a73e8' : '#0f172a' }}>
                {isEs ? '1. Delivery Label (Cliente / Clínica)' : '1. Delivery Label (Client / Clinic)'}
              </span>
              {activeVariant !== 'shipping' && (
                <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: '#1a73e8', color: '#ffffff' }}>
                  {isEs ? 'Seleccionada' : 'Selected'}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.70rem', color: '#475569' }}>
              {isEs
                ? 'Etiqueta clínica completa con fórmula, médico, lote, QR y posología.'
                : 'Full clinical label with formula, physician, batch, QR, and directions.'}
            </span>
          </button>

          {!hideShippingLabel && (
            <button
              type="button"
              onClick={onSelectShipping}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                padding: '9px 12px',
                minHeight: '52px',
                borderRadius: '8px',
                border: activeVariant === 'shipping' ? '2px solid #1a73e8' : '1px solid #cbd5e1',
                background: activeVariant === 'shipping' ? '#eff6ff' : '#ffffff',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeVariant === 'shipping' ? '#1a73e8' : '#0f172a' }}>
                  {isEs ? '2. Shipping Label (Envío / Aduanas)' : '2. Shipping Label (Parcel / Customs)'}
                </span>
                {activeVariant === 'shipping' && (
                  <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: '#1a73e8', color: '#ffffff' }}>
                    {isEs ? 'Seleccionada' : 'Selected'}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.70rem', color: '#475569' }}>
                {isEs
                  ? 'Etiqueta exterior sencilla y discreta (Customs-Safe) para envío internacional.'
                  : 'Simple, discreet outer-parcel label (Customs-Safe) for shipping.'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
