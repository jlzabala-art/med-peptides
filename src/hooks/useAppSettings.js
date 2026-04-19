import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { onSnapshot, doc } from 'firebase/firestore';

// ── Default settings (overridden by Firestore when available) ────────────────
const DEFAULT_SETTINGS = {
  exchangeRates: {
    ae:  { rate: 1, currency: 'USD', name: 'United Arab Emirates' },
    qa:  { rate: 1, currency: 'USD', name: 'Qatar' },
    kw:  { rate: 1, currency: 'USD', name: 'Kuwait' },
    sa:  { rate: 1, currency: 'USD', name: 'Saudi Arabia' },
    eu:  { rate: 1, currency: 'USD', name: 'European Union' },
    gb:  { rate: 1, currency: 'USD', name: 'United Kingdom' },
    us:  { rate: 1, currency: 'USD', name: 'USA' },
    row: { rate: 1, currency: 'USD', name: 'Global' },
  },
  shippingCosts:  { standard: 0, express: 50, courier: 30 },
  deliveryTimes:  { standard: '5-7 days', express: '2-3 days', courier: 'next day' },
};

/**
 * Manages global application settings including:
 *  - Firestore `settings/global` live subscription
 *  - IP-based region auto-detection
 *  - Region + country-code persistence in localStorage
 *
 * @returns {{ settings, region, setRegion, selectedCountryCode,
 *             setSelectedCountryCode, manualRegionChange, setManualRegionChange }}
 */
export function useAppSettings() {
  // ── Region state (persisted) ─────────────────────────────────────────────
  const [region, setRegion] = useState(() => {
    try { return localStorage.getItem('mp_region') || null; }
    catch { return null; }
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    try {
      return (
        localStorage.getItem('mp_country_code') ||
        localStorage.getItem('mp_region') ||
        null
      );
    } catch { return null; }
  });

  const [manualRegionChange, setManualRegionChange] = useState(false);

  // ── Firestore global settings ────────────────────────────────────────────
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();

        // Merge incoming flat rates into the rich rate-object format
        const mappedRates = { ...DEFAULT_SETTINGS.exchangeRates };
        if (data.exchangeRates) {
          Object.entries(data.exchangeRates).forEach(([key, val]) => {
            if (mappedRates[key]) mappedRates[key] = { ...mappedRates[key], rate: val };
          });
        }
        setSettings({ ...DEFAULT_SETTINGS, ...data, exchangeRates: mappedRates });
      },
      (err) => console.error('Firestore Settings Error:', err)
    );

    return () => unsubSettings();
  }, []);

  // ── Persist region to localStorage ───────────────────────────────────────
  useEffect(() => {
    try {
      if (region) localStorage.setItem('mp_region', region);
    } catch (e) {
      console.warn('Storage restricted:', e);
    }
  }, [region]);

  // ── IP-based auto-detection (only when region is unset + not manual) ─────
  useEffect(() => {
    if (region || manualRegionChange) return;

    let cancelled = false;
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.country_name) return;

        const countryName = data.country_name;
        const matched = Object.entries(settings.exchangeRates).find(
          ([, val]) => val.name.toLowerCase() === countryName.toLowerCase()
        );

        setRegion(matched ? matched[0] : 'row');
        setManualRegionChange(false);
        setSettings((prev) => ({ ...prev, detectedCountry: countryName }));
      })
      .catch((err) => console.warn('IP detection failed:', err));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, manualRegionChange]);
  // Note: settings.exchangeRates intentionally omitted to avoid re-triggering
  // after Firestore settings load while IP fetch is already in-flight.

  return {
    settings,
    region,
    setRegion,
    selectedCountryCode,
    setSelectedCountryCode,
    manualRegionChange,
    setManualRegionChange,
  };
}
