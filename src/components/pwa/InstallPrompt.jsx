import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Optional: check if we haven't dismissed recently
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: '80px', // above bottom nav
          left: '16px',
          right: '16px',
          background: '#fff',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Instala Atlas App</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Acceso rápido y nativo a tus pacientes</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleDismiss}
            style={{ border: 'none', background: 'transparent', padding: '8px', color: '#666' }}
          >
            Ahora no
          </button>
          <button 
            onClick={handleInstall}
            style={{ border: 'none', background: '#00BCD4', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
          >
            Instalar
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
