"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search } from '@/lib/icons';

export default function Autocomplete({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  fetchSuggestions, // async function returning [{label, value}]
  defaultSuggestions = [], // [{label, value}]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const handleSearch = async (val) => {
    setSearchTerm(val);
    onChange(val); // act like a standard text input by default
    setIsOpen(true);
    
    if (!val) {
      setSuggestions(defaultSuggestions);
      return;
    }

    if (fetchSuggestions) {
      setLoading(true);
      try {
        const results = await fetchSuggestions(val);
        setSuggestions(results);
      } catch (err) {
        console.error("Autocomplete search error", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Local filter if no fetch function
      const filtered = defaultSuggestions.filter(s => 
        (s.label || '').toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSelect = (suggestion) => {
    setSearchTerm(suggestion.label);
    onChange(suggestion.label);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'block' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (!searchTerm) setSuggestions(defaultSuggestions);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          style={{ 
            width: '100%', 
            padding: '0.65rem 0.65rem 0.65rem 2rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border)', 
            fontSize: '0.9rem',
            backgroundColor: 'var(--color-bg-input, #fff)',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Searching...</div>
          ) : suggestions.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {suggestions.map((sg, idx) => (
                <li 
                  key={idx}
                  onClick={() => handleSelect(sg)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{sg.label}</span>
                  {sg.subLabel && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sg.subLabel}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
