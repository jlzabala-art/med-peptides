import React, { useState, useRef, useEffect } from 'react';
import { Globe, DollarSign, List, Maximize2, Check, Settings2 } from 'lucide-react';
import { usePreferences } from '../../../context/PreferencesContext';
import { useTranslation } from 'react-i18next';

export default function GlobalPreferencesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currency, updateCurrency, density, updateDensity } = usePreferences();
  const { i18n } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const currentLang = i18n.language === 'es' ? 'ES' : 'EN';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          background: isOpen ? 'rgba(0, 54, 102, 0.08)' : 'rgba(255, 255, 255, 0.6)',
          border: isOpen ? '1px solid rgba(0, 54, 102, 0.2)' : '1px solid rgba(0, 0, 0, 0.05)',
          padding: '0.4rem 0.6rem',
          borderRadius: '20px',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          fontWeight: 600,
          fontSize: '0.75rem',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
        title="Global Preferences"
      >
        <Globe size={14} />
        <span>{currentLang}</span>
        <div style={{ width: '1px', height: '12px', background: 'rgba(0,0,0,0.1)' }}></div>
        <span>{currency}</span>
        <Settings2 size={14} style={{ marginLeft: '2px' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          width: '240px',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Preferences
            </span>
          </div>

          <div style={{ padding: '0.5rem' }}>
            {/* Language Section */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Language</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <button
                  onClick={() => toggleLanguage('en')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem', border: 'none', borderRadius: '6px',
                    background: currentLang === 'EN' ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                    color: currentLang === 'EN' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontWeight: currentLang === 'EN' ? 600 : 400
                  }}
                >
                  English {currentLang === 'EN' && <Check size={14} />}
                </button>
                <button
                  onClick={() => toggleLanguage('es')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem', border: 'none', borderRadius: '6px',
                    background: currentLang === 'ES' ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                    color: currentLang === 'ES' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontWeight: currentLang === 'ES' ? 600 : 400
                  }}
                >
                  Español {currentLang === 'ES' && <Check size={14} />}
                </button>
              </div>
            </div>

            {/* Currency Section */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Currency</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
                {['USD', 'AED', 'DUAL'].map(curr => (
                  <button
                    key={curr}
                    onClick={() => updateCurrency(curr)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0.5rem 0', border: 'none', borderRadius: '6px',
                      background: currency === curr ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                      color: currency === curr ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer', fontWeight: currency === curr ? 600 : 400,
                      fontSize: '0.75rem'
                    }}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Density Section */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Layout Density</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <button
                  onClick={() => updateDensity('comfortable')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                    padding: '0.5rem', border: 'none', borderRadius: '6px',
                    background: density === 'comfortable' ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                    color: density === 'comfortable' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontWeight: density === 'comfortable' ? 600 : 400,
                    fontSize: '0.75rem'
                  }}
                >
                  <Maximize2 size={14} /> Comfortable
                </button>
                <button
                  onClick={() => updateDensity('compact')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                    padding: '0.5rem', border: 'none', borderRadius: '6px',
                    background: density === 'compact' ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                    color: density === 'compact' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontWeight: density === 'compact' ? 600 : 400,
                    fontSize: '0.75rem'
                  }}
                >
                  <List size={14} /> Compact
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
