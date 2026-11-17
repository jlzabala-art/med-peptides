'use client';

import React, { useEffect, useRef } from 'react';
import { Globe, X, Check, DollarSign } from 'lucide-react';

const EXTENDED_LANGUAGES = [
  { code: 'es', label: 'ES', flag: '🇪🇸', title: 'Español', desc: 'Spanish' },
  { code: 'en', label: 'EN', flag: '🇺🇸', title: 'English', desc: 'Inglés' },
];

const EXTENDED_CURRENCIES = [
  { code: 'EUR', symbol: '€', label: '€ EUR', title: 'Euro (€)', desc: 'Unión Europea' },
  { code: 'USD', symbol: '$', label: '$ USD', title: 'US Dollar ($)', desc: 'Estados Unidos / Global' },
  { code: 'AED', symbol: 'د.إ', label: 'AED', title: 'UAE Dirham (د.إ)', desc: 'Emiratos Árabes Unidos' },
];

/**
 * PublicLocaleModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console Standard Mobile Bottom Sheet / Modal for selecting
 * language and currency without cluttering the mobile top navigation bar.
 * Touch targets meet WCAG & Google Cloud mobile standard (min 48px).
 */
export default function PublicLocaleModal({
  isOpen,
  onClose,
  lang = 'en',
  onLangChange,
  currency = 'EUR',
  onCurrencyChange,
  hideCurrency = false,
}) {
  const isEs = lang === 'es';
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock background scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="puh-locale-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="puh-locale-modal-title"
    >
      <div className="puh-locale-sheet">
        {/* Drag handle for mobile gesture familiarity */}
        <div className="puh-locale-sheet-handle" />

        {/* Header */}
        <div className="puh-locale-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="puh-locale-sheet-icon-wrap">
              <Globe size={18} />
            </div>
            <div>
              <h3 id="puh-locale-modal-title" className="puh-locale-sheet-title">
                {isEs ? 'Preferencias Regionales' : 'Regional Preferences'}
              </h3>
              <p className="puh-locale-sheet-subtitle">
                {isEs ? 'Selecciona tu idioma y divisa de visualización' : 'Choose your preferred language & display currency'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="puh-locale-close-btn"
            onClick={onClose}
            aria-label={isEs ? 'Cerrar' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="puh-locale-sheet-body">
          {/* Section 1: Language */}
          <div className="puh-locale-section">
            <span className="puh-locale-section-label">
              <Globe size={13} />
              {isEs ? 'IDIOMA / LANGUAGE' : 'LANGUAGE / IDIOMA'}
            </span>
            <div className="puh-locale-options-list">
              {EXTENDED_LANGUAGES.map((l) => {
                const isSelected = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    className={`puh-locale-row ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onLangChange?.(l.code);
                      if (hideCurrency) onClose();
                    }}
                  >
                    <div className="puh-locale-row-left">
                      <span className="puh-locale-flag">{l.flag}</span>
                      <div className="puh-locale-row-text">
                        <span className="puh-locale-row-title">{l.title}</span>
                        <span className="puh-locale-row-desc">{l.desc}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="puh-locale-check">
                        <Check size={16} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Currency */}
          {!hideCurrency && (
            <div className="puh-locale-section" style={{ marginTop: '1.25rem' }}>
              <span className="puh-locale-section-label">
                <DollarSign size={13} />
                {isEs ? 'DIVISA / CURRENCY' : 'CURRENCY / DIVISA'}
              </span>
              <div className="puh-locale-options-list">
                {EXTENDED_CURRENCIES.map((c) => {
                  const isSelected = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      className={`puh-locale-row ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        onCurrencyChange?.(c.code);
                        onClose();
                      }}
                    >
                      <div className="puh-locale-row-left">
                        <span className="puh-locale-symbol-pill">{c.symbol}</span>
                        <div className="puh-locale-row-text">
                          <span className="puh-locale-row-title">{c.title}</span>
                          <span className="puh-locale-row-desc">{c.desc}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="puh-locale-check">
                          <Check size={16} strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="puh-locale-sheet-footer">
          <button
            type="button"
            className="puh-locale-done-btn"
            onClick={onClose}
          >
            {isEs ? 'Listo' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
