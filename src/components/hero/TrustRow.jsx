import React from 'react';
import { ShieldCheck, Globe, BookOpen, Bot } from '@/lib/icons';
import { useTranslation } from 'react-i18next';
import '../../styles/trust_row.css';

export default function TrustRow() {
  const { t } = useTranslation();
  return (
    <div className="trust-row trust-row--mobile-clean">
      <div 
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem 0.85rem',
          fontSize: '0.8rem',
          color: '#64748b',
          fontWeight: 500,
          padding: '0 0.5rem',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="#0ea5e9" />
          {t('hero.trust.tested', 'Third-Party Tested')}
        </span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <BookOpen size={14} color="#0ea5e9" />
          {t('hero.trust.coa', 'COA Included')}
        </span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Bot size={14} color="#0ea5e9" />
          {t('hero.trust.clinicalAi', 'Atlas AI Guided')}
        </span>
      </div>
    </div>
  );
}