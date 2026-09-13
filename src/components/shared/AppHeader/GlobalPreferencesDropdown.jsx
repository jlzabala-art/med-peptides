"use client";

import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../../context/PreferencesContext';
import { useTranslation } from 'react-i18next';
import notifier from '@/services/NotificationService';
import StandardDrawer from '@/components/ui/StandardDrawer';
import { 
  Globe, 
  DollarSign, 
  List, 
  Maximize2, 
  Check, 
  Settings2, 
  Cloud, 
  Eye, 
  EyeOff,
  Sparkles,
  Info
} from '@/lib/icons';

export default function GlobalPreferencesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, updateCurrency, density, updateDensity, weatherDisplay, updateWeatherDisplay } = usePreferences();
  const { i18n } = useTranslation();

  // Ensure interface remains on English standard while Spanish and Compact mode are in implementation
  useEffect(() => {
    if (i18n?.language === 'es' || (typeof window !== 'undefined' && localStorage.getItem('language') === 'es')) {
      i18n?.changeLanguage?.('en');
      localStorage.setItem('language', 'en');
    }
    if (density === 'compact' || (typeof window !== 'undefined' && localStorage.getItem('atlas_density') === 'compact')) {
      updateDensity('comfortable');
    }
  }, [i18n, density, updateDensity]);

  const handleLanguageSelect = (lang) => {
    if (lang === 'es') {
      notifier.toast(
        '🌐 Spanish language localization is undergoing technical and clinical validation. It will be available in an upcoming release. The platform currently operates in standard clinical English.',
        'info'
      );
      return;
    }
    i18n?.changeLanguage?.('en');
    localStorage.setItem('language', 'en');
  };

  const currentLang = 'EN';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Global Preferences"
        aria-haspopup="dialog"
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
          color: 'var(--color-text-secondary, #475569)',
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

      {/* Adaptive Drawer: Side-Over on Laptop / Desktop, Bottom Sheet on Mobile */}
      <StandardDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Preferences"
        subtitle="Platform localization, currency & layout density"
        width="clamp(340px, 28vw, 420px)"
        bodyPadding="1.25rem"
        expandable={false}
        zIndex={99999}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Section: Language */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={16} color="var(--color-primary, #003666)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Language
                </span>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                color: '#0369a1', 
                background: '#f0f9ff', 
                padding: '2px 8px', 
                borderRadius: '6px', 
                border: '1px solid #bae6fd', 
                fontWeight: 700 
              }}>
                Clinical Standard
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {/* English - Active Standard */}
              <button
                type="button"
                onClick={() => handleLanguageSelect('en')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  border: '1.5px solid var(--color-primary, #003666)',
                  borderRadius: '8px',
                  background: 'rgba(0, 54, 102, 0.06)',
                  color: 'var(--color-primary, #003666)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
                title="English (Clinical Operating Standard)"
              >
                <span>English</span>
                <Check size={16} color="var(--color-primary, #003666)" />
              </button>

              {/* Spanish - In Technical Validation */}
              <button
                type="button"
                onClick={() => handleLanguageSelect('es')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
                title="Spanish (Under technical and clinical validation — Coming soon)"
              >
                <span>Español</span>
                <span style={{ 
                  fontSize: '0.6rem', 
                  fontWeight: 700, 
                  color: '#475569', 
                  background: '#f1f5f9', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  Soon
                </span>
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '6px', 
              fontSize: '0.72rem', 
              color: '#64748b', 
              marginTop: '0.75rem', 
              lineHeight: 1.4 
            }}>
              <Info size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
              <span>Atlas Health operates under medical English standard. Spanish localized terms are undergoing technical validation.</span>
            </div>
          </div>

          {/* Section: Currency */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={16} color="var(--color-primary, #003666)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Currency
                </span>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                color: '#475569', 
                background: '#f1f5f9', 
                padding: '2px 8px', 
                borderRadius: '6px', 
                fontWeight: 600 
              }}>
                Active: {currency}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {['USD', 'AED', 'EUR', 'DUAL'].map(curr => {
                const active = currency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => updateCurrency(curr)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.6rem 0.25rem',
                      border: active ? '1.5px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: active ? 'rgba(0, 54, 102, 0.08)' : '#ffffff',
                      color: active ? 'var(--color-primary, #003666)' : '#334155',
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.82rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{curr}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '6px', 
              fontSize: '0.72rem', 
              color: '#64748b', 
              marginTop: '0.75rem', 
              lineHeight: 1.4 
            }}>
              <Info size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
              <span>Select pricing display currency for catalog products, prescriptions, and invoices.</span>
            </div>
          </div>

          {/* Section: Density */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Maximize2 size={16} color="var(--color-primary, #003666)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Layout Density
                </span>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                color: '#0369a1', 
                background: '#f0f9ff', 
                padding: '2px 8px', 
                borderRadius: '6px', 
                border: '1px solid #bae6fd', 
                fontWeight: 700 
              }}>
                Comfortable
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {/* Comfortable - Active Standard */}
              <button
                type="button"
                onClick={() => updateDensity('comfortable')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 0.75rem',
                  border: '1.5px solid var(--color-primary, #003666)',
                  borderRadius: '8px',
                  background: 'rgba(0, 54, 102, 0.06)',
                  color: 'var(--color-primary, #003666)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
                title="Comfortable (Active operating layout)"
              >
                <Maximize2 size={15} />
                <span>Comfortable</span>
              </button>

              {/* Compact - In Technical Implementation */}
              <button
                type="button"
                onClick={() => {
                  notifier.toast(
                    '📐 Compact high-density mode is undergoing technical adaptation across all clinical tables and will be available in an upcoming update.',
                    'info'
                  );
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.65rem 0.75rem',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  transition: 'all 0.15s ease',
                }}
                title="Compact (Under implementation — Coming soon)"
              >
                <List size={15} />
                <span>Compact</span>
                <span style={{ 
                  fontSize: '0.6rem', 
                  fontWeight: 700, 
                  color: '#475569', 
                  background: '#f1f5f9', 
                  padding: '2px 5px', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  Soon
                </span>
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '6px', 
              fontSize: '0.72rem', 
              color: '#64748b', 
              marginTop: '0.75rem', 
              lineHeight: 1.4 
            }}>
              <Info size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
              <span>High-density table mode is being adapted across all tabular screens for optimal data packing.</span>
            </div>
          </div>

          {/* Section: Weather Widget */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud size={16} color="var(--color-primary, #003666)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Weather Widget
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'automatic', label: 'Auto', Icon: Cloud },
                { id: 'visible',   label: 'Show', Icon: Eye },
                { id: 'hidden',    label: 'Hide', Icon: EyeOff },
              ].map(({ id, label, Icon }) => {
                const active = weatherDisplay === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateWeatherDisplay(id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.65rem 0.5rem',
                      border: active ? '1.5px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: active ? 'rgba(0, 54, 102, 0.08)' : '#ffffff',
                      color: active ? 'var(--color-primary, #003666)' : '#334155',
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.78rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1rem',
            background: 'rgba(0, 54, 102, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(0, 54, 102, 0.08)',
            fontSize: '0.72rem',
            color: '#64748b'
          }}>
            <Sparkles size={16} color="var(--color-primary, #003666)" style={{ flexShrink: 0 }} />
            <span>Preferences are automatically stored locally and applied across all workspace modules.</span>
          </div>

        </div>
      </StandardDrawer>
    </div>
  );
}