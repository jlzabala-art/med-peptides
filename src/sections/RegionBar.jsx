 
import React from 'react';
import { COUNTRIES } from '../data/countries';
import { REGION_FLAGS } from '../data/regions';

/**
 * RegionBar — Global Profile & Destination Bar
 *
 * Shows the current account type and selected destination region.
 * Render this from any layout file and toggle visibility by simply
 * not rendering it (e.g. hide when showCheckout is true).
 *
 * Props:
 *  - region          : string | null  — active region key (e.g. 'us', 'ae')
 *  - user            : object | null  — Firebase auth user
 *  - isProfessional  : bool           — whether user has professional status
 *  - settings        : object         — app settings (exchangeRates, etc.)
 *  - onChangeRegion  : () => void     — callback that clears the region
 */
export default function RegionBar({ region, user, isProfessional, settings = {}, onChangeRegion }) {
  if (!region) return null;

  const getFlag = () => {
    try {
      const countryCode = localStorage.getItem('mp_country_code');
      const country = COUNTRIES?.find(c => c.code === countryCode);
      if (country) return country.flag;
      return (REGION_FLAGS ?? {})[region] || '🌐';
    } catch {
      return '🌐';
    }
  };

  const getDestinationName = () => {
    try {
      const countryCode = localStorage.getItem('mp_country_code');
      const country = COUNTRIES?.find(c => c.code === countryCode);
      return country ? country.name : (settings.exchangeRates?.[region]?.name || region);
    } catch {
      return region;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        borderTop: '2px solid var(--primary)',
        padding: '1.25rem 0',
        color: 'white',
      }}
    >
      <div className="container">
        <div className="profile-bar-inner">
          <div className="profile-bar-items">

            {/* Account type */}
            <div className="profile-bar-item">
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Account:</span>
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: isProfessional ? '#34d399' : '#38bdf8',
                }}
              >
                {user ? (isProfessional ? '✓ Professional' : 'Standard') : 'Guest'}
              </span>
            </div>

            {/* Destination */}
            <div className="profile-bar-item">
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Destination:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{getFlag()}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white' }}>
                  {getDestinationName()}
                </span>
              </div>
            </div>

            {/* Currency note */}
            <div className="profile-bar-item">
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,1)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                }}
              >
                All prices are displayed in USD
              </span>
            </div>
          </div>

          {/* Change Region button */}
          <button
            className="profile-bar-btn"
            onClick={onChangeRegion}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Change Region
          </button>
        </div>
      </div>
    </div>
  );
}
