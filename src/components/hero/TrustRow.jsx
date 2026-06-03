import React from 'react';
import { ShieldCheck, ClipboardList, BookOpen, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/trust_row.css';

export default function TrustRow() {
  const { t } = useTranslation();
  return (
    <div className="trust-row">
      <div className="trust-container">
        <span className="trust-item">
          <ShieldCheck size={16} color="#34d399" />
          {t('hero.trust.evidence', 'Evidence-guided')}
        </span>
        <span className="trust-item">
          <ClipboardList size={16} color="#38bdf8" />
          {t('hero.trust.prescriptionAware', 'Prescription-aware')}
        </span>
        <span className="trust-item">
          <BookOpen size={16} color="#f472b6" />
          {t('hero.trust.documentation', 'Documentation available')}
        </span>
        <span className="trust-item">
          <Bot size={16} color="#818cf8" />
          {t('hero.trust.ai', 'AI-assisted')}
        </span>
      </div>
    </div>
  );
}
