import React from 'react';
import Select from 'react-select';

const ShippingForm = ({
  formData,
  set,
  countryOptions,
  selectStyles,
  selectedShipping,
  setSelectedShipping,
  shippingCosts
}) => {
  return (
    <>
      <div className="co-field">
        <label className="co-label">Country *</label>
        <Select 
          options={countryOptions} 
          value={formData.country} 
          styles={selectStyles}
          onChange={opt => set({ country: opt })} 
          placeholder="Search for your country..." 
        />
      </div>

      <div className="co-field">
        <label className="co-label">Delivery Address *</label>
        <textarea 
          required 
          rows={3} 
          className={`co-input${formData.address ? ' valid' : ''}`} 
          value={formData.address}
          onChange={e => set({ address: e.target.value })}
          placeholder="Street Name, Unit/Bldg Number, City, Postal Code" 
          autoComplete="street-address"
          style={{ resize:'vertical', lineHeight:1.5 }} 
        />
      </div>

      <div className="co-field">
        <label className="co-label">Shipping Method *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div 
            onClick={() => setSelectedShipping('standard')}
            style={{
              padding: '1.25rem',
              borderRadius: '16px',
              border: `2px solid ${selectedShipping === 'standard' ? 'var(--primary)' : 'var(--color-border)'}`,
              background: selectedShipping === 'standard' ? 'rgba(0,113,189,0.04)' : 'var(--color-bg-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedShipping === 'standard' ? 'var(--primary)' : 'var(--color-text-primary)' }}>Standard</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>5-7 business days</div>
            <div style={{ marginTop: '0.75rem', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>${shippingCosts?.standard?.toFixed(2) || '0.00'}</div>
          </div>
          <div 
            onClick={() => setSelectedShipping('express')}
            style={{
              padding: '1.25rem',
              borderRadius: '16px',
              border: `2px solid ${selectedShipping === 'express' ? 'var(--primary)' : 'var(--color-border)'}`,
              background: selectedShipping === 'express' ? 'rgba(0,113,189,0.04)' : 'var(--color-bg-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedShipping === 'express' ? 'var(--primary)' : 'var(--color-text-primary)' }}>Express</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>2-3 business days</div>
            <div style={{ marginTop: '0.75rem', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>${shippingCosts?.express?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      <div className="co-field">
        <label className="co-label">Order Notes / Delivery Instructions (Optional)</label>
        <textarea 
          className="co-input" 
          value={formData.orderNotes || ''}
          onChange={e => set({ orderNotes: e.target.value })}
          placeholder="E.g. Department name, specific laboratory, or delivery gate..."
          style={{ minHeight: '80px', padding: '0.75rem', resize: 'vertical' }}
        />
      </div>
    </>
  );
};

export default ShippingForm;
