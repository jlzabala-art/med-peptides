import React from 'react';
import { motion } from 'framer-motion';
import AtlasHealthLogo from '../brand/AtlasHealthLogo';
import { useTranslation } from 'react-i18next';

export default function AtlasLoadingScreen() {
  const { t } = useTranslation();
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e8f4f8 100%)',
      zIndex: 9999,
    }}>
      {/* Pulsing logo */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: '1.5rem' }}
      >
        <AtlasHealthLogo size={64} animate />
      </motion.div>

      {/* Brand name */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        marginBottom: '0.4rem',
      }}>
        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#003666', letterSpacing: '-0.02em' }}>
          Atlas Health
        </span>
        <span style={{ fontWeight: 600, fontSize: '1.25rem', color: '#0284c7', letterSpacing: '-0.02em' }}>
          Services
        </span>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
        {t('common.loading', { defaultValue: 'Iniciando Atlas App...' })}
      </p>

      {/* Shimmer bar */}
      <div style={{
        marginTop: '1.75rem',
        width: '120px',
        height: '3px',
        borderRadius: '99px',
        background: 'rgba(0,54,102,0.08)',
        overflow: 'hidden',
      }}>
        <motion.div
          style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #003666, #00BCD4)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
