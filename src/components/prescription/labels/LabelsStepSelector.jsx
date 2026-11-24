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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '6px 12px',
        background: '#f8fafc',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '2px 7px',
            borderRadius: '999px',
            background: '#003666',
            color: '#ffffff',
          }}
        >
          {isEs ? 'Etiqueta' : 'Label'}
        </span>

        {fulfillmentMode !== 'external_supplier' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e2e8f0', borderRadius: '6px', padding: '2px', gap: '2px' }}>
            <button
              type="button"
              onClick={onSelectDelivery}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                border: 'none',
                background: activeVariant !== 'shipping' ? '#ffffff' : 'transparent',
                color: activeVariant !== 'shipping' ? '#1a73e8' : '#475569',
                fontSize: '0.74rem',
                fontWeight: activeVariant !== 'shipping' ? 750 : 600,
                boxShadow: activeVariant !== 'shipping' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isEs ? '1. Delivery Label (Clínica)' : '1. Delivery Label (Client)'}
            </button>
            {!hideShippingLabel && (
              <button
                type="button"
                onClick={onSelectShipping}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: activeVariant === 'shipping' ? '#ffffff' : 'transparent',
                  color: activeVariant === 'shipping' ? '#1a73e8' : '#475569',
                  fontSize: '0.74rem',
                  fontWeight: activeVariant === 'shipping' ? 750 : 600,
                  boxShadow: activeVariant === 'shipping' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isEs ? '2. Shipping (Aduanas)' : '2. Shipping (Customs)'}
              </button>
            )}
          </div>
        )}

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
      </div>

      {fulfillmentMode !== 'external_supplier' && (
        <button
          type="button"
          onClick={onToggleSettings}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            minHeight: '30px',
            borderRadius: '6px',
            border: showPrintSettings ? '1px solid #1a73e8' : '1px solid #dadce0',
            background: showPrintSettings ? '#e8f0fe' : '#ffffff',
            color: showPrintSettings ? '#1a73e8' : '#3c4043',
            fontSize: '0.72rem',
            fontWeight: 650,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span>⚙ {isEs ? 'Ajustes' : 'Settings'}</span>
          <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
            ({dimensions.widthMm}×{dimensions.heightMm} mm)
          </span>
        </button>
      )}
    </div>
  );
}
