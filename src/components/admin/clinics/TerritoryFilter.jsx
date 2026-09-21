"use client";

import React, { useMemo } from 'react';
import { Globe, MapPin, X } from '@/lib/icons';

/**
 * Flag or territory emoji helper based on country/city name
 */
function getTerritoryIcon(name = '') {
  const lower = name.toLowerCase();
  if (lower === 'all' || lower === 'global') return '🌐';
  if (lower.includes('emirates') || lower.includes('dubai') || lower.includes('uae')) return '🇦🇪';
  if (lower.includes('qatar') || lower.includes('doha')) return '🇶🇦';
  if (lower.includes('saudi') || lower.includes('riyadh')) return '🇸🇦';
  if (lower.includes('spain') || lower.includes('madrid') || lower.includes('barcelona')) return '🇪🇸';
  if (lower.includes('uk') || lower.includes('london') || lower.includes('ireland')) return '🇬🇧';
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('california') || lower.includes('florida')) return '🇺🇸';
  if (lower.includes('dach') || lower.includes('germany') || lower.includes('switzerland')) return '🇩🇪';
  return '📍';
}

/**
 * Responsive, mobile-first, iPad-ready, and laptop-polished Territory Filter
 * Supports dynamic territory calculation from live clinics data.
 *
 * @param {string}   selectedTerritory  - Current active filter (e.g. 'All', 'Dubai', 'Qatar')
 * @param {Function} onSelectTerritory  - Callback when a territory is clicked
 * @param {Array}    clinics            - Live clinics array for dynamic counts and territory names
 * @param {string}   className          - Optional container class
 */
export default function TerritoryFilter({
  selectedTerritory = 'All',
  onSelectTerritory,
  clinics = [],
  className = ''
}) {
  // Dynamically compute available territories with counts from actual database data
  const territories = useMemo(() => {
    const list = Array.isArray(clinics) ? clinics : [];
    const totalCount = list.length;

    const cityMap = new Map();
    const countryMap = new Map();

    list.forEach(clinic => {
      const city = clinic.city?.trim();
      const country = clinic.country?.trim();

      if (city) {
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      }
      if (country) {
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      }
    });

    const items = [
      {
        id: 'All',
        label: 'Global',
        subLabel: 'All Facilities',
        count: totalCount,
        icon: '🌐'
      }
    ];

    // If we have cities, prioritize cities with country context
    cityMap.forEach((count, city) => {
      // Find matching country
      const sample = list.find(c => c.city?.trim().toLowerCase() === city.toLowerCase());
      const countryName = sample?.country?.trim() || '';
      items.push({
        id: city,
        label: city,
        subLabel: countryName,
        count,
        icon: getTerritoryIcon(city || countryName)
      });
    });

    // Add any countries that don't have distinct city items or multiple cities
    countryMap.forEach((count, country) => {
      // If only 1 city exists for this country and it's already in the list, skip redundant duplicate
      const matchingCities = Array.from(cityMap.keys()).filter(city => {
        const s = list.find(c => c.city?.trim().toLowerCase() === city.toLowerCase());
        return s?.country?.trim().toLowerCase() === country.toLowerCase();
      });

      if (matchingCities.length > 1) {
        items.push({
          id: country,
          label: country,
          subLabel: 'Nationwide',
          count,
          icon: getTerritoryIcon(country)
        });
      }
    });

    // Fallback if no clinics loaded yet: standard regional defaults
    if (items.length <= 1) {
      return [
        { id: 'All', label: 'Global', subLabel: 'All Facilities', count: totalCount || 0, icon: '🌐' },
        { id: 'Dubai', label: 'Dubai', subLabel: 'United Arab Emirates', count: 5, icon: '🇦🇪' },
        { id: 'Doha', label: 'Doha', subLabel: 'Qatar', count: 1, icon: '🇶🇦' },
        { id: 'United Arab Emirates', label: 'UAE (All)', subLabel: 'Nationwide', count: 5, icon: '🇦🇪' }
      ];
    }

    return items;
  }, [clinics]);

  const isFiltered = selectedTerritory && selectedTerritory !== 'All';

  return (
    <div
      className={`territory-filter-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--surface, #ffffff)',
        borderRadius: '12px',
        border: '1px solid var(--border, #e2e8f0)',
        marginBottom: '1rem',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}
    >
      {/* ── LEADING BADGE / ICON (Responsive: Icon on mobile, labeled on desktop) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-main, #0f172a)',
          fontWeight: 600,
          fontSize: '0.82rem',
          flexShrink: 0,
          paddingRight: '0.6rem',
          borderRight: '1px solid var(--border, #e2e8f0)'
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--primary-soft, #eff6ff)',
            color: 'var(--primary, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Territory & Location Filter"
        >
          <Globe size={15} />
        </div>
        <span
          className="territory-filter-label-text"
          style={{
            whiteSpace: 'nowrap',
            color: 'var(--text-main, #334155)',
            letterSpacing: '-0.01em'
          }}
        >
          Territory
        </span>
      </div>

      {/* ── HORIZONTAL SCROLLABLE / FLEX PILL RAIL ── */}
      <div
        className="territory-filter-scroll-rail"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: 1,
          minWidth: 0,
          padding: '2px 0'
        }}
      >
        {territories.map((t) => {
          const isSelected = selectedTerritory === t.id || (t.id === 'All' && (!selectedTerritory || selectedTerritory === 'All'));

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTerritory(t.id)}
              className={`territory-pill-btn ${isSelected ? 'active' : ''}`}
              title={t.subLabel ? `${t.label} · ${t.subLabel}` : t.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                minHeight: '34px',
                borderRadius: '20px',
                border: isSelected
                  ? '1.5px solid var(--primary, #2563eb)'
                  : '1px solid var(--border, #e2e8f0)',
                backgroundColor: isSelected
                  ? 'var(--primary-soft, #eff6ff)'
                  : 'var(--surface, #ffffff)',
                color: isSelected
                  ? 'var(--primary, #1d4ed8)'
                  : 'var(--text-muted, #475569)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.80rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                outline: 'none',
                boxShadow: isSelected
                  ? '0 1px 3px rgba(37, 99, 235, 0.15)'
                  : 'none'
              }}
            >
              <span style={{ fontSize: '0.90rem', lineHeight: 1 }}>{t.icon}</span>
              <span>{t.label}</span>
              {typeof t.count === 'number' && (
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'var(--primary, #2563eb)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    marginLeft: '2px',
                    lineHeight: '1.2'
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── RESET FILTER BUTTON (Only visible when a filter is applied) ── */}
      {isFiltered && (
        <button
          type="button"
          onClick={() => onSelectTerritory('All')}
          title="Reset to Global / All"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.55rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
        >
          <X size={12} />
          <span className="territory-filter-reset-text">Reset</span>
        </button>
      )}

      {/* Embedded scoped responsive CSS */}
      <style jsx>{`
        .territory-filter-scroll-rail::-webkit-scrollbar {
          display: none;
        }

        .territory-pill-btn:hover {
          background-color: var(--primary-soft, #eff6ff);
          border-color: var(--primary, #93c5fd);
          color: var(--primary, #1d4ed8);
        }

        /* Mobile Adjustments (< 640px) */
        @media (max-width: 640px) {
          .territory-filter-label-text {
            display: none !important;
          }
          .territory-filter-reset-text {
            display: none !important;
          }
          .territory-filter-container {
            padding: 0.4rem 0.5rem !important;
            gap: 0.4rem !important;
          }
          .territory-pill-btn {
            padding: 0.35rem 0.65rem !important;
            font-size: 0.76rem !important;
          }
        }

        /* Tablet (iPad) Adjustments (641px - 1024px) */
        @media (min-width: 641px) and (max-width: 1024px) {
          .territory-pill-btn {
            padding: 0.35rem 0.70rem !important;
          }
        }
      `}</style>
    </div>
  );
}