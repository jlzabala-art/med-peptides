import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
  // currency can be: 'USD', 'AED', or 'DUAL'
  const [currency, setCurrency] = useState('DUAL'); 
  // density can be: 'comfortable' or 'compact'
  const [density, setDensity] = useState('comfortable');

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('atlas_currency');
      const savedDensity = localStorage.getItem('atlas_density');
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedDensity) setDensity(savedDensity);
    } catch (e) {
      console.warn("Failed to read preferences from local storage.");
    }
  }, []);

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem('atlas_currency', newCurrency);
    } catch(e) {}
  };

  const updateDensity = (newDensity) => {
    setDensity(newDensity);
    try {
      localStorage.setItem('atlas_density', newDensity);
    } catch(e) {}
  };

  const AED_RATE = 3.6725;

  const formatCurrency = (valueInAed) => {
    if (valueInAed == null) return "0";
    
    // Assume value from backend (Zoho Books) is in AED
    const usdValue = valueInAed / AED_RATE;
    
    const usdFormatted = `$${usdValue.toLocaleString('en-US', {maximumFractionDigits:0})}`;
    const aedFormatted = `${Number(valueInAed).toLocaleString('en-US', {maximumFractionDigits:0})} AED`;

    if (currency === 'USD') return usdFormatted;
    if (currency === 'AED') return aedFormatted;
    return `${usdFormatted} / ${aedFormatted}`; // DUAL
  };

  return (
    <PreferencesContext.Provider value={{ currency, updateCurrency, density, updateDensity, formatCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
};
