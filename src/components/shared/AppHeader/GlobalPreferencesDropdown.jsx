import Globe from "lucide-react/dist/esm/icons/globe";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import List from "lucide-react/dist/esm/icons/list";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import Check from "lucide-react/dist/esm/icons/check";
import Settings2 from "lucide-react/dist/esm/icons/settings-2";
import React, { useState, useRef, useEffect } from 'react';






import { usePreferences } from '../../../context/PreferencesContext';
import { useTranslation } from 'react-i18next';

export default function GlobalPreferencesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const { currency, updateCurrency, density, updateDensity } = usePreferences();
  const { i18n } = useTranslation();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate position on open so the panel uses fixed coords
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(prev => !prev);
  };

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const currentLang = i18n.language === 'es' ? 'ES' : 'EN';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Global Preferences"
        aria-haspopup="true"
        aria-expanded={isOpen}
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
        <div style={{ width: '1px', height: '12px', background: 'rgba(0,0,0,0.1)' }} />
        <span>{currency}</span>
        <Settings2 size={14} style={{ marginLeft: '2px' }} />
      </button>

      {/* Fixed-position dropdown — breaks out of any stacking context */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropPos.top,
            right: dropPos.right,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px -5px rgba(0,0,0,0.15), 0 4px 12px -2px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
            width: '240px',
            zIndex: 99999,
            overflow: 'hidden',
            animation: 'gpd-fadeIn 0.18s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Preferences
            </span>
          </div>

          <div style={{ padding: '0.5rem' }}>
            {/* Language */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Language</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {[{ id: 'en', label: 'English' }, { id: 'es', label: 'Español' }].map(({ id, label }) => {
                  const active = currentLang === id.toUpperCase();
                  return (
                    <button
                      key={id}
                      onClick={() => toggleLanguage(id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.5rem', border: 'none', borderRadius: '6px',
                        background: active ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontWeight: active ? 600 : 400, fontSize: '0.82rem',
                      }}
                    >
                      {label} {active && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Currency</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
                {['USD', 'AED', 'DUAL'].map(curr => {
                  const active = currency === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => updateCurrency(curr)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0.5rem 0', border: 'none', borderRadius: '6px',
                        background: active ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontWeight: active ? 600 : 400, fontSize: '0.75rem',
                      }}
                    >
                      {curr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Density */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Layout Density</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {[
                  { id: 'comfortable', label: 'Comfortable', Icon: Maximize2 },
                  { id: 'compact',     label: 'Compact',     Icon: List },
                ].map(({ id, label, Icon }) => {
                  const active = density === id;
                  return (
                    <button
                      key={id}
                      onClick={() => updateDensity(id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                        padding: '0.5rem', border: 'none', borderRadius: '6px',
                        background: active ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontWeight: active ? 600 : 400, fontSize: '0.75rem',
                      }}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gpd-fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}