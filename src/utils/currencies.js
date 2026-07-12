import React from 'react';

export const EXCHANGE_RATES = {
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.52,
  MXN: 17.05,
  CAD: 1.35,
  USD_TO_AED: 3.6725
};

export const formatAEDtoDual = (aedAmount, prefix = '', suffix = '') => {
  if (aedAmount === null || aedAmount === undefined || isNaN(aedAmount)) {
    return null;
  }
  const usdAmount = Math.round(aedAmount / EXCHANGE_RATES.USD_TO_AED);
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: '1.2' }}>
      <span>{prefix}{aedAmount.toLocaleString()} AED{suffix}</span>
      <span style={{ fontSize: '0.65em', color: 'var(--text-muted)', fontWeight: 600 }}>
        ≈ {prefix}{usdAmount.toLocaleString()} USD{suffix}
      </span>
    </span>
  );
};
