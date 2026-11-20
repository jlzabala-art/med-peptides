"use client";

import React from 'react';

/**
 * DeliveryLabelControls
 *
 * Modular Dual-Label toolbar control for PharmacyLabelsModal:
 * - Same-level segmented switcher between Product / Dispensing Label and Shipping / Delivery Label
 * - Delivery Mode selector (GCC Customs Discreet vs 100% Clinical Prescription)
 */
export default function DeliveryLabelControls({
  hideShippingLabel = false,
  activeVariant = 'backQr',
  setActiveVariant,
  deliveryLabelType = 'customs',
  setDeliveryLabelType,
  currentItem = {},
  handleFieldChange,
  getCustomsFriendlySuggestions,
  isEs = false
}) {
  if (hideShippingLabel) return null;

  const isShipping = activeVariant === 'shipping';

  return (
    <>
      <div className="gcp-toolbar-control" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span className="gcp-toolbar-label" style={{ marginRight: '2px' }}>
          {isEs ? 'Etiqueta:' : 'Label:'}
        </span>
        <div
          role="group"
          aria-label="Label level selector"
          style={{
            display: 'inline-flex',
            background: '#f1f3f4',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #dadce0',
            gap: '2px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (isShipping) setActiveVariant('frontWithQr');
            }}
            style={{
              padding: '3px 9px',
              fontSize: '0.72rem',
              fontWeight: !isShipping ? 700 : 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: !isShipping ? '#ffffff' : 'transparent',
              color: !isShipping ? '#1a73e8' : '#5f6368',
              boxShadow: !isShipping ? '0 1px 2px rgba(60,64,67,0.15)' : 'none'
            }}
          >
            {isEs ? 'Producto' : 'Product'}
          </button>
          <button
            type="button"
            onClick={() => setActiveVariant('shipping')}
            style={{
              padding: '3px 9px',
              fontSize: '0.72rem',
              fontWeight: isShipping ? 700 : 500,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: isShipping ? '#ffffff' : 'transparent',
              color: isShipping ? '#1a73e8' : '#5f6368',
              boxShadow: isShipping ? '0 1px 2px rgba(60,64,67,0.15)' : 'none'
            }}
          >
            {isEs ? 'Envío / Delivery' : 'Shipping / Delivery'}
          </button>
        </div>
      </div>

      {isShipping && (
        <div className="gcp-toolbar-control">
          <label htmlFor="gcp-label-deliverymode" className="gcp-toolbar-label">
            {isEs ? 'Tipo Envío:' : 'Delivery Mode:'}
          </label>
          <select
            id="gcp-label-deliverymode"
            value={deliveryLabelType}
            onChange={(e) => {
              const val = e.target.value;
              setDeliveryLabelType(val);
              if (val === 'clinical') {
                handleFieldChange('shippingTitle', currentItem.productTitle || currentItem.productName || '');
              } else {
                handleFieldChange('shippingTitle', getCustomsFriendlySuggestions(currentItem)[0] || '');
              }
            }}
            className="gcp-toolbar-select"
          >
            <option value="customs">{isEs ? '✈️ Aduanas GCC (KSA/Qatar/Kuwait - Discreto)' : '✈️ Customs GCC (KSA/Qatar/Kuwait - Discreet)'}</option>
            <option value="clinical">{isEs ? '🏥 100% Prescripción Real (Clínico)' : '🏥 100% Prescription Based (Clinical)'}</option>
          </select>
        </div>
      )}
    </>
  );
}
