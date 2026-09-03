import React from 'react';
import SegmentedControl from './SegmentedControl';

export default function CurrencySelector({ 
  value = 'USD', 
  onChange, 
  options = [
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'AED', label: 'د.إ AED' }
  ] 
}) {
  return (
    <SegmentedControl 
      value={value}
      onChange={onChange}
      options={options}
      layoutIdPrefix="currency-selector"
    />
  );
}
