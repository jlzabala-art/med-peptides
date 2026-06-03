/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, ShieldCheck, Globe, X, Search, ChevronRight } from 'lucide-react';
import { REGION_FLAGS } from '../data/regions';
import { COUNTRIES } from '../data/countries';

export default function AccessCatalogOverlay({ 
  region, setRegion, 
  onOpenLogin,
  EXCHANGE_RATES,
  detectedCountry 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  // No JavaScript scroll lock needed – position:fixed overlay handles it via CSS.
  // Previous lockScroll() usage caused body overflow:hidden to persist after overlay dismissal.

  // Normalize exchange rates for easier mapping
  const mainRegionKeys = useMemo(() => {
    return Object.keys(EXCHANGE_RATES || {}).filter(k => k !== 'row');
  }, [EXCHANGE_RATES]);

  // Combine static country list with main regions and sorting
  const sortedCountries = useMemo(() => {
    const searchLower = (searchTerm || '').toLowerCase();
    
    // 1. Get regional keys from EXCHANGE_RATES but filter out 'row' and 'eu'
    const regionalList = mainRegionKeys
      .filter(key => key !== 'eu' && EXCHANGE_RATES && EXCHANGE_RATES[key])
      .map(key => ({
        code: key,
        name: EXCHANGE_RATES[key]?.name || key,
        flag: REGION_FLAGS[key] || '🏳️'
      }));

    // 2. Get all other countries from COUNTRIES data
    const otherList = (COUNTRIES || [])
      .filter(c => c && !mainRegionKeys.includes(c.code) && c.code !== 'eu')
      .map(c => ({
        code: c.code,
        name: c.name || c.code,
        flag: c.flag || '🏳️'
      }));

    // 3. Combine and filter by search
    const combined = [...regionalList, ...otherList].filter(c => 
      c.name && (
        c.name.toLowerCase().includes(searchLower) || 
        c.code.toLowerCase().includes(searchLower)
      )
    );

    // 4. Sort: Pure alphabetical
    return combined.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [searchTerm, mainRegionKeys, EXCHANGE_RATES]);

  useEffect(() => {
    if (!selectedRegion && !searchTerm) {
      const stored = localStorage.getItem('mp_region');
      if (stored) {
        setSelectedRegion(stored);
      } else if (detectedCountry) {
        // Try to match detected country to our lists
        const matched = sortedCountries.find(c => 
          c.name && c.name.toLowerCase() === detectedCountry.toLowerCase()
        );
        if (matched) {
          setSelectedRegion(matched.code);
          setIsAutoDetected(true);
        }
      }
    }
  }, [detectedCountry, selectedRegion, searchTerm, sortedCountries]);

  if (region) return null;

  const handleGuestAccess = (r) => {
    const finalRegion = r || selectedRegion;
    if (finalRegion) {
      // If it's a country not in EXCHANGE_RATES, we use 'row' as the logical region for pricing
      const regionToStore = EXCHANGE_RATES[finalRegion] ? finalRegion : 'row';
      setRegion(regionToStore);
      localStorage.setItem('mp_region', regionToStore);
      // We also store the specific country for localized UI if needed later
      localStorage.setItem('mp_country_code', finalRegion);
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Force refresh to ensure all regional data/pricing updates correctly
      window.location.reload();
    }
  };

  const handleClose = () => {
    const stored = localStorage.getItem('mp_region');
    if (stored) {
      setRegion(stored);
    } else {
      // If no selection at all, we must force a selection now or default to row
      // Choosing to default to row if they close without selecting
      handleGuestAccess('row');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      zIndex: 9999, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '1rem',
      touchAction: 'none',          /* Prevent page scroll while overlay is open (CSS, not JS) */
      overscrollBehavior: 'contain', /* iOS Safari: contain overscroll to overlay */
    }}>
      <div className="card animate-fade-in" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0', 
        textAlign: 'center', 
        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)', 
        border: '1px solid var(--border)',
        borderRadius: '28px',
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header Section (Fixed) */}
        <div style={{ padding: '2rem 1.5rem 1rem 1.5rem', flexShrink: 0 }}>
          <button 
            onClick={handleClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(15, 23, 42, 0.08)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0f172a',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.12)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img src="/atlas-health-logo.png" alt="Atlas Health Logo" style={{ width: '60px', height: '60px', borderRadius: '16px' }} />
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Select Destination
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            Choose your country for localized pricing and shipping
          </p>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: 'var(--color-bg-app)',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Scrollable Country List */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 1.5rem',
          textAlign: 'left',
          borderTop: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {sortedCountries.length > 0 ? (
            <div style={{ padding: '0.5rem 0' }}>
              {sortedCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setSelectedRegion(c.code); setIsAutoDetected(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.75rem',
                    margin: '0.25rem 0',
                    borderRadius: '10px',
                    border: selectedRegion === c.code ? '2px solid var(--primary)' : '1px solid transparent',
                    backgroundColor: selectedRegion === c.code ? 'rgba(0, 54, 102, 0.03)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{c.flag}</span>
                    <span style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: selectedRegion === c.code ? 700 : 500,
                      color: selectedRegion === c.code ? 'var(--primary)' : 'var(--text-main)'
                    }}>
                      {c.name}
                    </span>
                  </div>
                  {selectedRegion === c.code && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No countries found for "{searchTerm}"
            </div>
          )}
        </div>

        {/* Action Footer (Fixed) */}
        <div style={{ padding: '1.5rem', flexShrink: 0, backgroundColor: 'white' }}>
          {isAutoDetected && selectedRegion && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, 
              marginBottom: '1rem', justifyContent: 'center',
              backgroundColor: 'rgba(0, 54, 102, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px'
            }}>
              <Globe size={14} /> Recommended based on your IP
            </div>
          )}
          
          <button 
            onClick={() => handleGuestAccess()}
            disabled={!selectedRegion}
            style={{
              width: '100%', padding: '1.1rem', borderRadius: '14px',
              backgroundColor: selectedRegion ? 'var(--primary)' : 'var(--color-border)',
              color: 'white', fontWeight: 800, border: 'none',
              cursor: selectedRegion ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              fontSize: '1.1rem',
              boxShadow: selectedRegion ? '0 10px 25px -5px rgba(0, 54, 102, 0.3)' : 'none'
            }}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
