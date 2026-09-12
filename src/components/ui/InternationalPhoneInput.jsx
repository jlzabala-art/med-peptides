"use client";

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+971', country: 'AE', label: '🇦🇪 +971', fullLabel: '🇦🇪 UAE (+971)', digits: 9 },
  { code: '+34', country: 'ES', label: '🇪🇸 +34', fullLabel: '🇪🇸 Spain (+34)', digits: 9 },
  { code: '+1', country: 'US', label: '🇺🇸 +1', fullLabel: '🇺🇸 US/CA (+1)', digits: 10 },
  { code: '+44', country: 'GB', label: '🇬🇧 +44', fullLabel: '🇬🇧 UK (+44)', digits: 10 },
  { code: '+966', country: 'SA', label: '🇸🇦 +966', fullLabel: '🇸🇦 Saudi Arabia (+966)', digits: 9 },
  { code: '+974', country: 'QA', label: '🇶🇦 +974', fullLabel: '🇶🇦 Qatar (+974)', digits: 8 },
  { code: '+965', country: 'KW', label: '🇰🇼 +965', fullLabel: '🇰🇼 Kuwait (+965)', digits: 8 },
  { code: '+968', country: 'OM', label: '🇴🇲 +968', fullLabel: '🇴🇲 Oman (+968)', digits: 8 },
  { code: '+973', country: 'BH', label: '🇧🇭 +973', fullLabel: '🇧🇭 Bahrain (+973)', digits: 8 },
  { code: '+49', country: 'DE', label: '🇩🇪 +49', fullLabel: '🇩🇪 Germany (+49)', digits: 10 },
  { code: '+33', country: 'FR', label: '🇫🇷 +33', fullLabel: '🇫🇷 France (+33)', digits: 9 },
  { code: '+39', country: 'IT', label: '🇮🇹 +39', fullLabel: '🇮🇹 Italy (+39)', digits: 10 },
  { code: '+52', country: 'MX', label: '🇲🇽 +52', fullLabel: '🇲🇽 Mexico (+52)', digits: 10 },
  { code: '+57', country: 'CO', label: '🇨🇴 +57', fullLabel: '🇨🇴 Colombia (+57)', digits: 10 },
  { code: '+54', country: 'AR', label: '🇦🇷 +54', fullLabel: '🇦🇷 Argentina (+54)', digits: 10 },
  { code: '+56', country: 'CL', label: '🇨🇱 +56', fullLabel: '🇨🇱 Chile (+56)', digits: 9 },
  { code: '+61', country: 'AU', label: '🇦🇺 +61', fullLabel: '🇦🇺 Australia (+61)', digits: 9 },
  { code: '+91', country: 'IN', label: '🇮🇳 +91', fullLabel: '🇮🇳 India (+91)', digits: 10 },
  { code: '+41', country: 'CH', label: '🇨🇭 +41', fullLabel: '🇨🇭 Switzerland (+41)', digits: 9 },
];

export default function InternationalPhoneInput({
  value = '',
  onChange,
  disabled = false,
  placeholder = "50 123 4567",
  countryHint = 'AE'
}) {
  const [selectedPrefix, setSelectedPrefix] = useState('+971');
  const [localNumber, setLocalNumber] = useState('');

  // Parse incoming value
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }

    const trimmed = value.trim();
    const matched = COUNTRY_CODES.find(c => trimmed.startsWith(c.code));
    if (matched) {
      setSelectedPrefix(matched.code);
      setLocalNumber(trimmed.slice(matched.code.length).replace(/^[\s-]+/, ''));
    } else if (trimmed.startsWith('+')) {
      // Custom international prefix
      const match = trimmed.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        setSelectedPrefix(match[1]);
        setLocalNumber(match[2].trim());
      } else {
        setLocalNumber(trimmed);
      }
    } else {
      setLocalNumber(trimmed);
    }
  }, [value]);

  // If countryHint changes and no prefix is set, adapt
  useEffect(() => {
    if (countryHint && !value) {
      const match = COUNTRY_CODES.find(c => c.country.toLowerCase() === countryHint.toLowerCase());
      if (match) setSelectedPrefix(match.code);
    }
  }, [countryHint, value]);

  const handlePrefixChange = (newPrefix) => {
    setSelectedPrefix(newPrefix);
    const cleanNum = localNumber.replace(/[^\d]/g, '');
    const combined = cleanNum ? `${newPrefix}${cleanNum}` : '';
    if (onChange) onChange(combined);
  };

  const handleNumberChange = (rawText) => {
    const cleanNum = rawText.replace(/[^\d\s-]/g, '');
    setLocalNumber(cleanNum);
    const numericOnly = cleanNum.replace(/[^\d]/g, '');
    const combined = numericOnly ? `${selectedPrefix}${numericOnly}` : '';
    if (onChange) onChange(combined);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: '8px',
      background: 'var(--surface, #ffffff)',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <select
        value={selectedPrefix}
        disabled={disabled}
        onChange={(e) => handlePrefixChange(e.target.value)}
        style={{
          height: '42px',
          padding: '0 0.5rem',
          border: 'none',
          borderRight: '1px solid #cbd5e1',
          background: '#f8fafc',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#0f172a',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '92px',
          maxWidth: '110px',
          flexShrink: 0
        }}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.fullLabel || c.label}
          </option>
        ))}
      </select>

      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
        <input
          type="tel"
          disabled={disabled}
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 0.85rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
            color: '#0f172a'
          }}
        />
      </div>
    </div>
  );
}
