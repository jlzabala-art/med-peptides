import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';

export default function AnimatedNumber({ value, duration = 1000, isCurrency = false }) {
  const [displayValue, setDisplayValue] = useState(0);
  const { formatCurrency } = usePreferences();

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * ease);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (isCurrency) {
    return <span>{formatCurrency(displayValue)}</span>;
  }
  
  return <span>{Math.round(displayValue).toLocaleString()}</span>;
}
