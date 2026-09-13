"use client";

import React, { useState, useRef, useEffect } from 'react';






import { usePreferences } from '../../../context/PreferencesContext';
import { useTranslation } from 'react-i18next';
import notifier from '@/services/NotificationService';
import { Globe, DollarSign, List, Maximize2, Check, Settings2, Cloud, Eye, EyeOff } from '@/lib/icons';

export default function GlobalPreferencesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const { currency, updateCurrency, density, updateDensity, weatherDisplay, updateWeatherDisplay } = usePreferences();
  const { i18n } = useTranslation();

  // Ensure interface remains on English standard while Spanish and Compact mode are in implementation
  useEffect(() => {
    if (i18n.language === 'es' || (typeof window !== 'undefined' && localStorage.getItem('language') === 'es')) {
      i18n.changeLanguage('en');
      localStorage.setItem('language', 'en');
    }
    if (density === 'compact' || (typeof window !== 'undefined' && localStorage.getItem('atlas_density') === 'compact')) {
      updateDensity('comfortable');
    }
  }, [i18n, density, updateDensity]);

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

  const handleLanguageSelect = (lang) => {
    if (lang === 'es') {
      notifier.toast(
        '🌐 La localización en español se encuentra en fase de validación técnica y clínica. Estará disponible en una próxima actualización. La plataforma opera actualmente en inglés estándar.',
        'info'
      );
      return;
    }
    i18n.changeLanguage('en');
    localStorage.setItem('language', 'en');
  };

  const currentLang = 'EN';

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
            width: '270px',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Language
                </span>
                <span style={{ fontSize: '0.62rem', color: '#0369a1', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                  Standard
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                {/* English - Active Standard */}
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('en')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.6rem', border: '1px solid rgba(0, 113, 189, 0.25)', borderRadius: '6px',
                    background: 'rgba(0, 113, 189, 0.08)',
                    color: 'var(--color-primary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                  }}
                  title="English (Clinical Operating Standard)"
                >
                  <span>English</span>
                  <Check size={14} color="var(--color-primary)" />
                </button>

                {/* Spanish - Elegantly marked as Coming Soon */}
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('es')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.6rem', border: '1px dashed #cbd5e1', borderRadius: '6px',
                    background: '#f8fafc',
                    color: '#64748b',
                    cursor: 'pointer', fontWeight: 500, fontSize: '0.82rem',
                    transition: 'all 0.15s ease',
                  }}
                  title="Español (En fase de validación técnica — Próximamente)"
                >
                  <span>Español</span>
                  <span style={{ 
                    fontSize: '0.58rem', 
                    fontWeight: 700, 
                    color: '#475569', 
                    background: '#e2e8f0', 
                    padding: '1px 5px', 
                    borderRadius: '4px',
                    letterSpacing: '0.02em',
                  }}>
                    Pronto
                  </span>
                </button>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b', padding: '0.4rem 0.5rem 0', lineHeight: 1.35 }}>
                La versión en español está en fase de validación clínica. La plataforma opera actualmente en inglés estándar.
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Layout Density
                </span>
                <span style={{ fontSize: '0.62rem', color: '#0369a1', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                  Standard
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                {/* Comfortable - Active Standard */}
                <button
                  type="button"
                  onClick={() => updateDensity('comfortable')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    padding: '0.5rem', border: '1px solid rgba(0, 113, 189, 0.25)', borderRadius: '6px',
                    background: 'rgba(0, 113, 189, 0.08)',
                    color: 'var(--color-primary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
                  }}
                  title="Comfortable (Active operating layout)"
                >
                  <Maximize2 size={14} /> Comfortable
                </button>

                {/* Compact - Elegantly marked as in implementation */}
                <button
                  type="button"
                  onClick={() => {
                    notifier.toast(
                      '📐 El modo Compacto se encuentra en fase de implantación técnica y estará disponible en una próxima actualización.',
                      'info'
                    );
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '6px',
                    background: '#f8fafc',
                    color: '#64748b',
                    cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                  title="Compact (En fase de implantación — Próximamente)"
                >
                  <List size={14} />
                  <span>Compact</span>
                  <span style={{ 
                    fontSize: '0.58rem', 
                    fontWeight: 700, 
                    color: '#475569', 
                    background: '#e2e8f0', 
                    padding: '1px 4px', 
                    borderRadius: '4px',
                    letterSpacing: '0.02em',
                  }}>
                    Pronto
                  </span>
                </button>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b', padding: '0.4rem 0.5rem 0', lineHeight: 1.35 }}>
                El modo compacto de alta densidad está en fase de adaptación responsiva por módulo.
              </div>
            </div>

            {/* Weather Display */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>Weather Widget</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
                {[
                  { id: 'automatic', label: 'Auto', Icon: Cloud },
                  { id: 'visible',   label: 'Show', Icon: Eye },
                  { id: 'hidden',    label: 'Hide', Icon: EyeOff },
                ].map(({ id, label, Icon }) => {
                  const active = weatherDisplay === id;
                  return (
                    <button
                      key={id}
                      onClick={() => updateWeatherDisplay(id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                        padding: '0.5rem', border: 'none', borderRadius: '6px',
                        background: active ? 'rgba(0, 113, 189, 0.1)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontWeight: active ? 600 : 400, fontSize: '0.7rem',
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