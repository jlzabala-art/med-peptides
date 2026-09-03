import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

export default function IOSPushBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Detect if the device is iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detect if the app is already in standalone mode (installed as PWA)
    const isStandalone = () => {
      return ('standalone' in window.navigator) && (window.navigator.standalone);
    };

    // Check if the user has already dismissed the banner
    const hasDismissed = localStorage.getItem('dismissed_ios_push_banner');

    if (isIos() && !isStandalone() && !hasDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('dismissed_ios_push_banner', 'true');
  };

  if (!isVisible) return null;

  return (
    <div style={{
      backgroundColor: '#eff6ff',
      borderBottom: '1px solid #bfdbfe',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      position: 'relative'
    }}>
      <Info size={20} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.85rem', color: '#1e3a8a' }}>
        <strong>Enable Push Notifications:</strong> To receive important updates about your prescriptions and orders on iOS, tap the Share icon <strong>(↑)</strong> in Safari and select <strong>"Add to Home Screen"</strong>. Then open the app from your home screen.
      </div>
      <button 
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#60a5fa',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
