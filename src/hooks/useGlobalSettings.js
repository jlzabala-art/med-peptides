import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopProvider';
import { useUIStore } from '../stores/uiStore';
import { db } from '../firebase';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { fetchLiveRates } from '../utils/liveRates';
import { COUNTRIES } from '../data/countries';

const DEFAULT_SETTINGS = {
  exchangeRates: {
    ae: { rate: 1, currency: 'USD', name: 'United Arab Emirates' },
    qa: { rate: 1, currency: 'USD', name: 'Qatar' },
    kw: { rate: 1, currency: 'USD', name: 'Kuwait' },
    sa: { rate: 1, currency: 'USD', name: 'Saudi Arabia' },
    eu: { rate: 1, currency: 'USD', name: 'European Union' },
    gb: { rate: 1, currency: 'USD', name: 'United Kingdom' },
    us: { rate: 1, currency: 'USD', name: 'USA' },
    row: { rate: 1, currency: 'USD', name: 'Global' }
  },
  shippingCosts: { standard: 0, express: 50, courier: 30 },
  deliveryTimes: { standard: '5-7 days', express: '2-3 days', courier: 'next day' }
};

/**
 * Custom Hook: useGlobalSettings
 * 
 * Responsibility: Sychronizes exchange rates, settings from Firestore,
 * and performs GeoIP lookup on load.
 */
export function useGlobalSettings() {
  const { isAdmin } = useAuth();
  const { region, setRegion, settings, setSettings } = useShop();
  const { manualRegionChange, setManualRegionChange } = useUIStore();

  // 1. IP-Based Region Detection
  useEffect(() => {
    if (!region && !manualRegionChange) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const countryCode = (data.country_code || '').toLowerCase();
          const countryName = data.country_name || '';

          if (countryCode) {
            if (settings.exchangeRates && settings.exchangeRates[countryCode]) {
              setRegion(countryCode);
            } else {
              const knownCountry = COUNTRIES.find(c => c.code === countryCode);
              if (knownCountry) {
                setRegion(countryCode);
              } else {
                setRegion('row');
              }
            }
            setManualRegionChange(false);
            setSettings(prev => ({ ...prev, detectedCountry: countryName, detectedCountryCode: countryCode }));
          }
        })
        .catch(err => console.warn("IP detection failed:", err));
    }
  }, [region, manualRegionChange, settings.exchangeRates, setRegion, setManualRegionChange, setSettings]);

  // 2. Live Exchange Rate Admin Sync
  useEffect(() => {
    const LAST_SYNC_KEY = 'mp_rates_last_sync';
    const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

    const syncRates = async () => {
      if (!isAdmin) return;
      try {
        const lastSync = sessionStorage.getItem(LAST_SYNC_KEY);
        if (lastSync && Date.now() - parseInt(lastSync, 10) < SYNC_INTERVAL_MS) {
          return; 
        }
        const live = await fetchLiveRates();
        await setDoc(doc(db, 'settings', 'global'), { ...live }, { merge: true });
        sessionStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
        console.info('[Rates] Live exchange rates synced →', live.ratesLastUpdated);
      } catch (err) {
        console.warn('[Rates] Live sync failed:', err.message);
      }
    };

    if (isAdmin) syncRates();
  }, [isAdmin]);

  // 3. Firestore Dynamic Settings Subscription
  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const mappedRates = { ...DEFAULT_SETTINGS.exchangeRates };
        if (data.exchangeRates) {
          Object.entries(data.exchangeRates).forEach(([key, val]) => {
            if (mappedRates[key]) {
              mappedRates[key] = { ...mappedRates[key], rate: val };
            }
          });
        }
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          exchangeRates: mappedRates
        });
      }
    }, (error) => {
      console.error('Firestore Settings Error:', error);
    });

    return () => { unsubscribeSettings(); };
  }, [setSettings]);
}
