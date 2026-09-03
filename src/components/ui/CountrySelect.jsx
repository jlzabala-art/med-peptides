"use client";
import React, { useMemo } from 'react';
import SearchableSelect from './SearchableSelect';
import { COUNTRIES } from '../../data/countries';

export default function CountrySelect({
  label,
  value,
  onChange,
  placeholder = 'Search country...',
  disabled = false,
  required = false
}) {
  const options = useMemo(() => {
    return COUNTRIES.map(c => ({
      value: c.name,
      label: `${c.flag} ${c.name}`
    }));
  }, []);

  return (
    <SearchableSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
    />
  );
}
