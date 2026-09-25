"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { COUNTRIES, COUNTRY_MAP, DIAL_CODE_MAP, searchCountries, getCountryByCode, getCountryByDialCode } from '../../data/countries';

export default function InternationalPhoneInput({
  value = '',
  onChange,
  // Optional split-props for existing legacy callers
  phonePrefix,
  onPrefixChange,
  phoneNumber,
  onPhoneNumberChange,
  countryHint = 'ES',
  lang = 'en',
  placeholder,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
  style = {},
  inputStyle = {}
}) {
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const listRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Selected Country state
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (phonePrefix) {
      const match = getCountryByDialCode(phonePrefix);
      if (match) return match;
    }
    if (countryHint) {
      const match = getCountryByCode(countryHint);
      if (match) return match;
    }
    return getCountryByCode('es') || COUNTRIES[0];
  });

  const [localNumber, setLocalNumber] = useState(() => {
    if (phoneNumber !== undefined) return phoneNumber;
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.startsWith('+')) {
      const matchedCountry = COUNTRIES.find(c => trimmed.startsWith(c.dial_code));
      if (matchedCountry) {
        return trimmed.slice(matchedCountry.dial_code.length).trim();
      }
    }
    return trimmed;
  });

  // Sync incoming value
  useEffect(() => {
    if (phoneNumber !== undefined) {
      setLocalNumber(phoneNumber);
      return;
    }
    if (!value) {
      setLocalNumber('');
      return;
    }
    const trimmed = value.trim();
    if (trimmed.startsWith('+')) {
      // Find longest matching dial code
      const matchedCountry = COUNTRIES
        .filter(c => trimmed.startsWith(c.dial_code))
        .sort((a, b) => b.dial_code.length - a.dial_code.length)[0];

      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setLocalNumber(trimmed.slice(matchedCountry.dial_code.length).trim());
        return;
      }
    }
    setLocalNumber(trimmed);
  }, [value, phoneNumber]);

  // Sync incoming phonePrefix
  useEffect(() => {
    if (phonePrefix) {
      const matched = getCountryByDialCode(phonePrefix);
      if (matched && matched.code !== selectedCountry.code) {
        setSelectedCountry(matched);
      }
    }
  }, [phonePrefix]);

  // Sync countryHint
  useEffect(() => {
    if (countryHint && !value && !phonePrefix) {
      const match = getCountryByCode(countryHint);
      if (match) setSelectedCountry(match);
    }
  }, [countryHint, value, phonePrefix]);

  // Filtered country list based on search query
  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery, { lang, limit: 60 });
  }, [searchQuery, lang]);

  // Reset highlight on search query change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Auto-focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Handle selecting a country
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');

    if (onPrefixChange) {
      onPrefixChange(country.dial_code);
    }

    const cleanNum = localNumber.replace(/[^\d]/g, '');
    const fullPhone = cleanNum ? `${country.dial_code} ${localNumber.trim()}` : '';

    if (onChange) {
      onChange(fullPhone, {
        dialCode: country.dial_code,
        localNumber: localNumber.trim(),
        countryCode: country.code.toUpperCase(),
        countryName: lang === 'es' ? (country.nameEs || country.name) : country.name,
        flag: country.flag
      });
    }

    // Auto-focus the telephone number input (Google Cloud UX standard: frictionless flow)
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 50);
  };

  // Handle number typing
  const handleNumberChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = rawVal.replace(/[^\d\s\-()]/g, '');
    setLocalNumber(sanitized);

    if (onPhoneNumberChange) {
      onPhoneNumberChange(sanitized);
    }

    const cleanNum = sanitized.replace(/[^\d]/g, '');
    const fullPhone = cleanNum ? `${selectedCountry.dial_code} ${sanitized.trim()}` : '';

    if (onChange) {
      onChange(fullPhone, {
        dialCode: selectedCountry.dial_code,
        localNumber: sanitized.trim(),
        countryCode: selectedCountry.code.toUpperCase(),
        countryName: lang === 'es' ? (selectedCountry.nameEs || selectedCountry.name) : selectedCountry.name,
        flag: selectedCountry.flag
      });
    }
  };

  // Keyboard navigation within search popover
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries[highlightedIndex]) {
        handleSelectCountry(filteredCountries[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (phoneInputRef.current) phoneInputRef.current.focus();
    }
  };

  const computedPlaceholder = placeholder || selectedCountry.samplePlaceholder || '555-0199';

  return (
    <div
      ref={containerRef}
      className={`gcp-phone-input-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        background: disabled ? '#f8fafc' : '#ffffff',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxSizing: 'border-box',
        ...style
      }}
      onFocusCapture={(e) => {
        if (!disabled && e.currentTarget) {
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.18)';
        }
      }}
      onBlurCapture={(e) => {
        if (e.currentTarget && !e.currentTarget.contains(document.activeElement)) {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Country Selector Trigger (Google Cloud Button Style) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Selected country: ${selectedCountry.name} (${selectedCountry.dial_code}). Click to search and select another country.`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          height: '38px',
          padding: '0 0.55rem',
          border: 'none',
          borderRight: '1px solid #cbd5e1',
          background: isOpen ? '#eff6ff' : '#f8fafc',
          borderRadius: '5px 0 0 5px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          flexShrink: 0,
          transition: 'background-color 0.15s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) e.currentTarget.style.backgroundColor = '#f1f5f9';
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) e.currentTarget.style.backgroundColor = '#f8fafc';
        }}
      >
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }} aria-hidden="true">
          {selectedCountry.flag}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>
          {selectedCountry.dial_code}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: '#64748b',
            transition: 'transform 0.18s ease',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            flexShrink: 0
          }}
        />
      </button>

      {/* Main Telephone Input */}
      <input
        ref={phoneInputRef}
        type="tel"
        id={id}
        name={name}
        disabled={disabled}
        required={required}
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={computedPlaceholder}
        autoComplete="tel-national"
        style={{
          flex: 1,
          minWidth: 0,
          height: '38px',
          padding: '0 0.75rem',
          border: 'none',
          borderRadius: '0 5px 5px 0',
          background: 'transparent',
          fontSize: '0.84rem',
          fontWeight: 500,
          color: '#0f172a',
          outline: 'none',
          boxSizing: 'border-box',
          ...inputStyle
        }}
      />

      {/* Searchable Country Popover Menu (Google Cloud Standard Combobox) */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '320px',
            maxWidth: 'calc(100vw - 2rem)',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 99999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeInScale 0.15s ease-out'
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Popover Search Bar */}
          <div
            style={{
              padding: '0.45rem 0.55rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={14} style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'es' ? 'Buscar país o código (+34, España, US)...' : 'Search country or code (+1, Spain, US)...'}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.78rem',
                color: '#0f172a',
                outline: 'none',
                padding: '2px 0'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '2px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: '#64748b',
                background: '#e2e8f0',
                padding: '1px 5px',
                borderRadius: '4px',
                flexShrink: 0
              }}
            >
              {filteredCountries.length}
            </span>
          </div>

          {/* Scrollable Country List */}
          <div
            ref={listRef}
            role="listbox"
            style={{
              maxHeight: '230px',
              overflowY: 'auto',
              padding: '0.25rem 0',
              overscrollBehavior: 'contain'
            }}
          >
            {filteredCountries.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.76rem',
                  color: '#64748b'
                }}
              >
                {lang === 'es'
                  ? `No se encontró ningún país con "${searchQuery}"`
                  : `No country found matching "${searchQuery}"`}
              </div>
            ) : (
              filteredCountries.map((c, index) => {
                const isSelected = c.code.toLowerCase() === selectedCountry.code.toLowerCase();
                const isHighlighted = index === highlightedIndex;
                const displayName = lang === 'es' ? (c.nameEs || c.name) : c.name;

                return (
                  <div
                    key={`${c.code}-${c.dial_code}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCountry(c)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.42rem 0.65rem',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      background: isSelected
                        ? '#eff6ff'
                        : isHighlighted
                        ? '#f1f5f9'
                        : 'transparent',
                      color: isSelected ? '#1d4ed8' : '#1e293b',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '1.15rem', lineHeight: 1, flexShrink: 0 }}>
                        {c.flag}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          style={{
                            fontWeight: isSelected ? 700 : 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {displayName}
                        </span>
                        {lang === 'es' && c.nameEs && c.name !== c.nameEs && (
                          <span style={{ fontSize: '0.66rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isSelected ? '#1d4ed8' : '#475569',
                          background: isSelected ? '#dbeafe' : '#f1f5f9',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {c.dial_code}
                      </span>
                      {isSelected && <Check size={13} style={{ color: '#2563eb' }} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
